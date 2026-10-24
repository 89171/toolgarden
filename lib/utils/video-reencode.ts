/**
 * 视频重编码工具（压缩 / 截取）— 纯函数层。
 *
 * 管线概要（见 video-reencode-browser.ts）：
 * 1. 浏览器本地解码视频，逐帧经 canvas 交给 WebCodecs VideoEncoder 重编码
 * 2. mp4-muxer 合成 MP4，再用 ffmpeg.wasm 处理音轨（压缩音质或裁剪区间）
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
