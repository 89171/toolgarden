/**
 * 视频转 GIF — 纯函数层。
 *
 * 管线概要（见 video-gif-browser.ts）：
 * 1. 按目标帧率对视频做确定性采样（seek + drawImage，不依赖实时播放）
 * 2. gifenc 本地量化（每帧调色板）并输出 GIF
 *
 * 本文件保持纯函数：不依赖 DOM / React，返回判别联合类型，不抛异常。
 */

export type VideoGifErrorCode =
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

export interface VideoGifProgress {
  stage: 'prepare' | 'sample' | 'encode' | 'done';
  label: string;
  percent: number;
}

export interface VideoGifSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  frameCount: number;
  durationMs: number;
  outputSize: number;
}

export interface VideoGifFailure {
  ok: false;
  code: VideoGifErrorCode;
  detail?: string;
}

export type VideoGifResult = VideoGifSuccess | VideoGifFailure;

/** 单个文件大小上限：300MB */
export const GIF_MAX_FILE_SIZE = 300 * 1024 * 1024;
/** 单个视频时长上限：5 分钟 */
export const GIF_MAX_DURATION_SECONDS = 300;
/** 采样帧率档位 */
export const GIF_FPS_OPTIONS = [8, 12, 15] as const;
/** 输出宽度档位 */
export const GIF_WIDTH_OPTIONS = [240, 360, 480] as const;
/** GIF 帧间延迟范围（ms） */
export const GIF_MIN_FRAME_DELAY_MS = 20;
/** 画幅上限保护：单帧像素数过大时量化会非常慢 */
export const GIF_MAX_PIXELS_PER_FRAME = 640 * 480;
/** 帧数上限保护：控制内存与编码时长 */
export const GIF_MAX_FRAME_COUNT = 900;

export type GifFps = (typeof GIF_FPS_OPTIONS)[number];
export type GifWidth = (typeof GIF_WIDTH_OPTIONS)[number];

/** 校验视频文件类型与大小，返回判别联合，不抛异常 */
export function validateGifSourceFile(file: File): { ok: true } | { ok: false; code: VideoGifErrorCode } {
  if (file.size <= 0) {
    return { ok: false, code: 'unsupported_input' };
  }
  const isVideoType = file.type.startsWith('video/');
  const hasVideoExtension = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp)$/i.test(file.name);
  if (!isVideoType && !hasVideoExtension) {
    return { ok: false, code: 'unsupported_input' };
  }
  if (file.size > GIF_MAX_FILE_SIZE) {
    return { ok: false, code: 'file_too_large' };
  }
  return { ok: true };
}

/** 把任意数值收敛到支持的帧率/宽度档位 */
export function clampGifFps(fps: number): GifFps {
  const candidates = GIF_FPS_OPTIONS as readonly number[];
  return candidates.reduce((best, current) =>
    Math.abs(current - fps) < Math.abs(best - fps) ? current : best
  ) as GifFps;
}

export function clampGifWidth(width: number): GifWidth {
  const candidates = GIF_WIDTH_OPTIONS as readonly number[];
  return candidates.reduce((best, current) =>
    Math.abs(current - width) < Math.abs(best - width) ? current : best
  ) as GifWidth;
}

/**
 * 规范化截取区间：夹紧到 [0, duration]，保证 end > start 且至少 0.2 秒。
 * 返回 null 表示区间非法。
 */
export function clampGifRange(input: { start: number; end: number; duration: number }): { start: number; end: number } | null {
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
 * 规划输出：帧时间点（秒）、输出尺寸、每帧延迟（ms）。
 * 帧数超上限时自动降帧率；宽度过大时按宽度档位缩放。
 */
export function planGifFrames(input: {
  start: number;
  end: number;
  fps: GifFps;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: GifWidth;
}): { timestamps: number[]; width: number; height: number; delayMs: number } {
  const { start, end } = input;
  const spanSeconds = Math.max(0.2, end - start);

  let effectiveFps: number = input.fps;
  let frameCount = Math.max(2, Math.min(GIF_MAX_FRAME_COUNT, Math.round(spanSeconds * effectiveFps)));
  // 帧数超限则降低帧率重算，保证覆盖整个区间
  if (Math.round(spanSeconds * effectiveFps) > GIF_MAX_FRAME_COUNT) {
    effectiveFps = Math.max(2, Math.floor(GIF_MAX_FRAME_COUNT / spanSeconds));
    frameCount = Math.max(2, Math.round(spanSeconds * effectiveFps));
  }

  const timestamps: number[] = [];
  for (let index = 0; index < frameCount; index += 1) {
    const time = start + (spanSeconds * index) / frameCount;
    timestamps.push(Number(Math.min(end - 0.01, time).toFixed(3)));
  }

  const ratio = input.targetWidth / Math.max(1, input.sourceWidth);
  let width = Math.max(2, Math.round(input.sourceWidth * Math.min(1, ratio)));
  let height = Math.max(2, Math.round(input.sourceHeight * Math.min(1, ratio)));
  if (width * height > GIF_MAX_PIXELS_PER_FRAME) {
    const shrink = Math.sqrt(GIF_MAX_PIXELS_PER_FRAME / (width * height));
    width = Math.max(2, Math.round(width * shrink));
    height = Math.max(2, Math.round(height * shrink));
  }

  const delayMs = Math.max(GIF_MIN_FRAME_DELAY_MS, Math.round(1000 / effectiveFps));
  return { timestamps, width: evenAlign(width), height: evenAlign(height), delayMs };
}

/** 从源文件名派生输出文件名：clip.mp4 → clip.gif */
export function createGifFilename(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'video';
  return `${base}.gif`;
}

function evenAlign(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}
