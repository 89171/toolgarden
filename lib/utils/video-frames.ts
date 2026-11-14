/**
 * 视频抽帧 / 截图 — 纯函数层。
 *
 * 管线概要（见 video-frames-browser.ts）：
 * 1. 加载视频元素，按计划的时间点逐个 seek + drawImage 抓帧
 * 2. 每帧编码为 PNG（无损）或 JPG（可选质量）
 *
 * 本文件保持纯函数：不依赖 DOM / React，返回判别联合类型，不抛异常。
 */

export type VideoFramesErrorCode =
  | 'unsupported_input'
  | 'file_too_large'
  | 'video_too_long'
  | 'unsupported_browser'
  | 'video_load_failed'
  | 'canvas_context'
  | 'encode_failed'
  | 'no_frames'
  | 'range_invalid'
  | 'cancelled'
  | 'general';

export type FrameExtractionMode = 'moments' | 'interval';
export type FrameFormat = 'png' | 'jpeg';

/** 单个文件大小上限：300MB（与其余视频工具一致） */
export const FRAMES_MAX_FILE_SIZE = 300 * 1024 * 1024;
/** 单个视频时长上限：5 分钟 */
export const FRAMES_MAX_DURATION_SECONDS = 300;
/** 单次最多导出的帧数：控制内存与处理时长 */
export const FRAMES_MAX_COUNT = 50;
/** 「指定时间点」模式单次可输入的时间点上限 */
export const FRAMES_MAX_MOMENTS = 20;
/** 固定间隔模式下相邻两帧的最小间隔（秒） */
export const FRAMES_MIN_INTERVAL_SECONDS = 0.1;
/** JPG 输出质量档位 */
export const FRAMES_JPEG_QUALITY_OPTIONS = [0.6, 0.8, 0.92] as const;

export interface VideoFramesProgress {
  stage: 'prepare' | 'extract' | 'done';
  label: string;
  percent: number;
  /** 已完成的帧数 */
  completedFrames: number;
  totalFrames: number;
}

export interface ExtractedFrame {
  blob: Blob;
  filename: string;
  /** 帧对应的视频时间点（秒，相对源视频） */
  timeSeconds: number;
  width: number;
  height: number;
}

export interface VideoFramesSuccess {
  ok: true;
  frames: ExtractedFrame[];
  width: number;
  height: number;
  format: FrameFormat;
  durationMs: number;
}

export interface VideoFramesFailure {
  ok: false;
  code: VideoFramesErrorCode;
  detail?: string;
}

export type VideoFramesResult = VideoFramesSuccess | VideoFramesFailure;

/** 校验视频文件类型与大小，返回判别联合，不抛异常 */
export function validateFramesFile(file: File): { ok: true } | { ok: false; code: VideoFramesErrorCode } {
  if (file.size <= 0) {
    return { ok: false, code: 'unsupported_input' };
  }
  const isVideoType = file.type.startsWith('video/');
  const hasVideoExtension = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp)$/i.test(file.name);
  if (!isVideoType && !hasVideoExtension) {
    return { ok: false, code: 'unsupported_input' };
  }
  if (file.size > FRAMES_MAX_FILE_SIZE) {
    return { ok: false, code: 'file_too_large' };
  }
  return { ok: true };
}

export interface FramePlanInput {
  mode: FrameExtractionMode;
  /** moments 模式：用户指定的时间点（秒，可乱序可越界，内部清洗） */
  timestamps: number[];
  /** interval 模式：抽取间隔（秒） */
  intervalSeconds: number;
  /** interval 模式：抽取起点（秒） */
  start: number;
  /** interval 模式：抽取终点（秒） */
  end: number;
  /** 视频总时长（秒） */
  duration: number;
  maxCount?: number;
}

export type FramePlanResult =
  | { ok: true; times: number[] }
  | { ok: false; code: 'no_frames' | 'range_invalid' };

/**
 * 计算抽帧时间点：
 * - moments：夹紧到 [0, duration]、去重（间隔 < 0.04s 视为重复）、升序、截断到上限
 * - interval：从 start 起每 intervalSeconds 一帧，最多到 end；帧数超上限时自动拉大间隔
 */
export function planFrameExtraction(input: FramePlanInput): FramePlanResult {
  const duration = Number.isFinite(input.duration) && input.duration > 0 ? input.duration : 0;
  if (duration <= 0) return { ok: false, code: 'range_invalid' };
  const maxCount = Math.max(1, Math.min(FRAMES_MAX_COUNT, input.maxCount ?? FRAMES_MAX_COUNT));

  if (input.mode === 'moments') {
    const cleaned = [...input.timestamps]
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.min(duration, Math.max(0, value)))
      .sort((a, b) => a - b);
    const deduped: number[] = [];
    for (const value of cleaned) {
      if (deduped.length >= maxCount) break;
      if (deduped.length > 0 && value - deduped[deduped.length - 1] < 0.04) continue;
      deduped.push(Number(value.toFixed(3)));
    }
    if (deduped.length === 0) return { ok: false, code: 'no_frames' };
    return { ok: true, times: deduped };
  }

  let start = Number.isFinite(input.start) ? input.start : 0;
  let end = Number.isFinite(input.end) ? input.end : duration;
  if (start < 0) start = 0;
  if (end > duration) end = duration;
  if (end - start < 0.04) return { ok: false, code: 'range_invalid' };

  const rawInterval = Number.isFinite(input.intervalSeconds)
    ? input.intervalSeconds
    : FRAMES_MIN_INTERVAL_SECONDS;
  const span = end - start;
  // 帧数超上限时拉大间隔，保证覆盖整个区间而不是截断尾部
  const minIntervalForCap = span / Math.max(1, maxCount - 1);
  const interval = Math.max(FRAMES_MIN_INTERVAL_SECONDS, rawInterval, minIntervalForCap);

  const times: number[] = [];
  for (let time = start; time <= end + 1e-6 && times.length < maxCount; time += interval) {
    times.push(Number(Math.min(end, time).toFixed(3)));
  }
  if (times.length === 0) return { ok: false, code: 'no_frames' };
  return { ok: true, times };
}

/** 单帧文件名：源基名 + frame-序号 + 扩展名 */
export function createFrameFilename(sourceName: string, index: number, format: FrameFormat): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'video';
  const extension = format === 'png' ? 'png' : 'jpg';
  return `${base}-frame-${String(index + 1).padStart(3, '0')}.${extension}`;
}

/** 把帧时间点格式化为 mm:ss.d，用于界面展示 */
export function formatFrameTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(1).padStart(4, '0')}`;
}
