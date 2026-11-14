/**
 * 视频重编码工具（压缩 / 截取 / 画面裁剪）— 纯函数层。
 *
 * 管线概要（见 video-reencode-browser.ts）：
 * 1. 首选 WebCodecs 解码路径：mp4box.js 解封装 → VideoDecoder 解码 →
 *    VideoEncoder 重编码，速度不受实时播放限制
 * 2. 回退实时播放路径：video 元素播放 + canvas 抓帧（WebM、HEVC、超大文件）
 * 3. 音轨与渲染并行预处理，最后用 ffmpeg.wasm 以流复制方式封装
 *
 * 本文件保持纯函数：不依赖 DOM / React，返回判别联合类型，不抛异常。
 */

export type VideoReencodeErrorCode =
  | 'unsupported_input'
  | 'file_too_large'
  | 'video_too_long'
  | 'unsupported_browser'
  | 'video_load_failed'
  | 'encode_failed'
  | 'canvas_context'
  | 'range_invalid'
  | 'cancelled'
  | 'general';

export type VideoReencodeProgressStage =
  | 'prepare'
  | 'model'
  | 'render'
  | 'audio'
  | 'done';

export interface VideoReencodeProgress {
  stage: VideoReencodeProgressStage;
  label: string;
  percent: number;
}

export interface VideoReencodeSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  durationMs: number;
  outputSize: number;
  hasAudio: boolean;
}

export interface VideoReencodeFailure {
  ok: false;
  code: VideoReencodeErrorCode;
  detail?: string;
}

export type VideoReencodeResult = VideoReencodeSuccess | VideoReencodeFailure;

/** 单个文件大小上限：300MB（与视频去水印一致） */
export const REENCODE_MAX_FILE_SIZE = 300 * 1024 * 1024;
/** 单个视频时长上限：5 分钟 */
export const REENCODE_MAX_DURATION_SECONDS = 300;
/** 输出帧率固定 30，与去水印管线一致 */
export const REENCODE_FRAMERATE = 30;
/** 音轨码率档位（kbps）：高 / 中 / 低画质对应 */
export const AUDIO_BITRATE_BY_QUALITY = { high: 160, medium: 128, low: 96 } as const;
/** 视频码率系数（bpp·fps）：每像素每帧比特数，决定同分辨率下的画质 */
export const BITRATE_FACTOR_BY_QUALITY = { high: 0.12, medium: 0.07, low: 0.04 } as const;
/** 码率上下限（bps） */
export const MIN_VIDEO_BITRATE = 500_000;
export const MAX_VIDEO_BITRATE = 20_000_000;

export type ReencodeQuality = keyof typeof AUDIO_BITRATE_BY_QUALITY;

/** 用户施加的几何变换：旋转角度 + 水平 / 垂直翻转（视频旋转 / 翻转工具使用） */
export type VideoRotation = 0 | 90 | 180 | 270;

export interface VideoTransform {
  rotation: VideoRotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export const VIDEO_TRANSFORM_IDENTITY: VideoTransform = {
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
};

/** 是否为恒等变换（不改变画面几何），用于跳过多余的画布合成 */
export function isIdentityTransform(transform?: VideoTransform | null): boolean {
  if (!transform) return true;
  return transform.rotation === 0 && !transform.flipHorizontal && !transform.flipVertical;
}

/** 旋转 90° / 270° 时输出宽高互换；0° / 180° 保持不变。结果做偶数对齐。 */
export function computeTransformedSize(
  width: number,
  height: number,
  rotation: VideoRotation
): { width: number; height: number } {
  const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);
  if (rotation === 90 || rotation === 270) {
    return { width: even(height), height: even(width) };
  }
  return { width: even(width), height: even(height) };
}

/** 把任意数值收敛到支持的旋转档位（0 / 90 / 180 / 270），平局（如 45°）归入较低档位 */
export function normalizeVideoRotation(value: number): VideoRotation {
  const safe = Number.isFinite(value) ? Math.ceil(value / 90 - 0.5) : 0;
  const normalized = ((safe * 90) % 360 + 360) % 360;
  return (normalized === 90 || normalized === 180 || normalized === 270 ? normalized : 0) as VideoRotation;
}

/** 校验并补全用户变换，非法字段回退为恒等值 */
export function normalizeVideoTransform(transform?: Partial<VideoTransform> | null): VideoTransform {
  return {
    rotation: normalizeVideoRotation(transform?.rotation ?? 0),
    flipHorizontal: transform?.flipHorizontal === true,
    flipVertical: transform?.flipVertical === true,
  };
}

export interface ReencodeRangeInput {
  start: number;
  end: number;
  duration: number;
}

/** 校验视频文件类型与大小，返回判别联合，不抛异常 */
export function validateReencodeFile(file: File): { ok: true } | { ok: false; code: VideoReencodeErrorCode } {
  if (file.size <= 0) {
    return { ok: false, code: 'unsupported_input' };
  }
  const isVideoType = file.type.startsWith('video/');
  const hasVideoExtension = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp)$/i.test(file.name);
  if (!isVideoType && !hasVideoExtension) {
    return { ok: false, code: 'unsupported_input' };
  }
  if (file.size > REENCODE_MAX_FILE_SIZE) {
    return { ok: false, code: 'file_too_large' };
  }
  return { ok: true };
}

/**
 * 规范化截取区间：夹紧到 [0, duration]，保证 end > start 且至少 0.2 秒。
 * 返回 null 表示区间非法（无法形成有效片段）。
 */
export function clampTrimRange(input: ReencodeRangeInput): { start: number; end: number } | null {
  const duration = Number.isFinite(input.duration) && input.duration > 0 ? input.duration : 0;
  if (duration <= 0) return null;

  let start = Number.isFinite(input.start) ? input.start : 0;
  let end = Number.isFinite(input.end) ? input.end : duration;
  if (start < 0) start = 0;
  if (end > duration) end = duration;
  if (end - start < 0.2) return null;
  return { start: Number(start.toFixed(3)), end: Number(end.toFixed(3)) };
}

/**
 * 计算目标视频码率（bps）：分辨率 × 帧率 × 画质系数，
 * 夹在上下限之间。scale 为输出缩放比（0~1），作用于像素数。
 */
export function computeTargetBitrate(
  width: number,
  height: number,
  quality: ReencodeQuality,
  scale = 1
): number {
  const factor = BITRATE_FACTOR_BY_QUALITY[quality];
  const pixels = Math.max(1, Math.round(width * scale)) * Math.max(1, Math.round(height * scale));
  const raw = pixels * REENCODE_FRAMERATE * factor;
  return Math.min(MAX_VIDEO_BITRATE, Math.max(MIN_VIDEO_BITRATE, Math.round(raw)));
}

/**
 * 计算输出分辨率：把较长边缩放到 maxLongSide 以内（保持宽高比、偶数对齐），
 * 已经更小则返回原尺寸。scale 传 1 表示不缩放。
 */
export function computeOutputSize(
  width: number,
  height: number,
  maxLongSide: number | null
): { width: number; height: number } {
  const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);
  if (!maxLongSide || maxLongSide <= 0) {
    return { width: even(width), height: even(height) };
  }
  const longSide = Math.max(width, height);
  if (longSide <= maxLongSide) {
    return { width: even(width), height: even(height) };
  }
  const ratio = maxLongSide / longSide;
  return { width: even(width * ratio), height: even(height * ratio) };
}

/** 从源文件名派生输出文件名，例如 clip.mp4 + 'compressed' → clip-compressed.mp4 */
export function createReencodeFilename(sourceName: string, suffix: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'video';
  return `${base}-${suffix}.mp4`;
}

/** 渲染进度区间工具：把子阶段进度（0~100）映射进总体百分比区间 [from, to] */
export function mapReencodeProgress(percent: number, from: number, to: number): number {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(percent) ? percent / 100 : 0));
  return Math.round((from + (to - from) * clamped) * 100) / 100;
}
