import type { ImageCropRect } from './image';
import { normalizeCropRect } from './image';

/**
 * 视频去水印 — 纯函数层。
 *
 * 管线概要（见 video-watermark-browser.ts）：
 * 1. 从视频中采样水印选区的像素（时域采样）
 * 2. 计算时域中值补丁与时域波动，判定重建方式
 *    - 波动大（背景在动）→ 时域中值直接重建干净背景，无闪烁、无模型
 *    - 波动小（背景静止）→ 用 MI-GAN 对单帧做 AI 补全，补丁贴回所有帧
 *    - hq 档：用 LaMa 大模型做单帧补全（慢但大水印/结构重建更强）
 * 3. 逐帧合成并经 WebCodecs 编码为 MP4，再用 ffmpeg.wasm 回填原音轨
 *
 * 本文件保持纯函数：不依赖 DOM / React，返回判别联合类型，不抛异常。
 */

export type VideoWatermarkRepairMethod = 'auto' | 'temporal' | 'ai' | 'hq';
export type VideoWatermarkAppliedMethod = 'temporal' | 'ai' | 'hq';

export type VideoWatermarkProgressStage =
  | 'prepare'
  | 'analyze'
  | 'model'
  | 'render'
  | 'audio'
  | 'done';

export interface VideoWatermarkProgress {
  stage: VideoWatermarkProgressStage;
  label: string;
  percent: number;
}

export type VideoWatermarkErrorCode =
  | 'selection_required'
  | 'unsupported_browser'
  | 'unsupported_input'
  | 'file_too_large'
  | 'video_too_long'
  | 'video_load_failed'
  | 'encode_failed'
  | 'canvas_context'
  | 'cancelled'
  | 'general';

export interface VideoWatermarkRemovalSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  durationMs: number;
  outputSize: number;
  method: VideoWatermarkAppliedMethod;
  hasAudio: boolean;
}

export interface VideoWatermarkRemovalFailure {
  ok: false;
  code: VideoWatermarkErrorCode;
  detail?: string;
}

export type VideoWatermarkRemovalResult =
  | VideoWatermarkRemovalSuccess
  | VideoWatermarkRemovalFailure;

export interface VideoWatermarkPlanInput {
  selection: ImageCropRect;
  videoWidth: number;
  videoHeight: number;
  method: VideoWatermarkRepairMethod;
  durationSeconds: number;
}

export interface VideoWatermarkPlan {
  /** 规范化到视频坐标系的水印选区 */
  selection: ImageCropRect;
  /** 时域采样时间点（秒，升序） */
  sampleTimestamps: number[];
  /** 时域波动判定阈值：低于它视为静态背景，需要 AI 单帧补全 */
  staticMotionThreshold: number;
  method: VideoWatermarkRepairMethod;
}

/** 单个文件大小上限：300MB */
export const MAX_VIDEO_FILE_SIZE = 300 * 1024 * 1024;
/** 单个视频时长上限：5 分钟 */
export const MAX_VIDEO_DURATION_SECONDS = 300;
/** 时域采样数量下限 / 上限 */
export const MIN_TIME_SAMPLES = 8;
export const MAX_TIME_SAMPLES = 24;
/** 时域波动阈值（0~1）：选区内平均逐像素波动低于该值视为静态背景 */
export const STATIC_MOTION_THRESHOLD = 0.015;

/** 校验视频文件类型与大小，返回判别联合，不抛异常 */
export function validateVideoFile(file: File): { ok: true } | { ok: false; code: VideoWatermarkErrorCode } {
  if (file.size <= 0) {
    return { ok: false, code: 'unsupported_input' };
  }
  const isVideoType = file.type.startsWith('video/');
  const hasVideoExtension = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|3gp)$/i.test(file.name);
  if (!isVideoType && !hasVideoExtension) {
    return { ok: false, code: 'unsupported_input' };
  }
  if (file.size > MAX_VIDEO_FILE_SIZE) {
    return { ok: false, code: 'file_too_large' };
  }
  return { ok: true };
}

/** 依据时长决定时域采样数量：短视频多采、长视频少采，均限制在 8~24 之间 */
export function getSampleCount(durationSeconds: number): number {
  const bounded = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 10;
  const raw = Math.round(Math.min(24, Math.max(8, bounded * 1.6)));
  return Math.min(MAX_TIME_SAMPLES, Math.max(MIN_TIME_SAMPLES, raw));
}

/** 生成时域采样时间点：避开首尾边缘，均匀分布（供采样与测试复用） */
export function computeSampleTimestamps(durationSeconds: number, sampleCount: number): number[] {
  const duration = Number.isFinite(durationSeconds) && durationSeconds > 0.2 ? durationSeconds : 1;
  const count = Math.max(2, Math.round(sampleCount));
  const margin = Math.min(0.25, duration * 0.05);
  const usable = Math.max(0.1, duration - margin * 2);
  const timestamps: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    timestamps.push(Number((margin + usable * ratio).toFixed(3)));
  }
  return timestamps;
}

/** 构建去水印执行计划：规范化选区并派生采样时间点 */
export function createVideoWatermarkPlan(input: VideoWatermarkPlanInput): VideoWatermarkPlan {
  const selection = normalizeCropRect(input.selection, input.videoWidth, input.videoHeight);
  const sampleCount = getSampleCount(input.durationSeconds);
  return {
    selection,
    sampleTimestamps: computeSampleTimestamps(input.durationSeconds, sampleCount),
    staticMotionThreshold: STATIC_MOTION_THRESHOLD,
    method: input.method,
  };
}

/**
 * 计算时域中值补丁与时域波动。
 *
 * samples 为同一选区在不同时间点的 RGBA 像素缓冲（等长）。
 * 返回值：
 * - median: 每像素各通道的时域中值（长度与输入一致）
 * - motion: 平均逐像素绝对偏差（相对中值）归一化到 0~1，
 *   反映选区背景随时间变化的程度
 */
export function computeTemporalMedian(
  samples: Array<ArrayLike<number>>
): { median: Uint8ClampedArray; motion: number } {
  if (samples.length === 0) {
    return { median: new Uint8ClampedArray(0), motion: 0 };
  }

  const pixelLength = samples[0].length;
  const usable = samples.filter((sample) => sample.length === pixelLength);
  if (usable.length === 0) {
    return { median: new Uint8ClampedArray(0), motion: 0 };
  }

  const frameCount = usable.length;
  const median = new Uint8ClampedArray(pixelLength);
  const channelValues = new Float64Array(frameCount);
  let deviationSum = 0;
  let deviationCount = 0;

  for (let pixelIndex = 0; pixelIndex < pixelLength; pixelIndex += 1) {
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      channelValues[frameIndex] = usable[frameIndex][pixelIndex];
    }

    // 对 0..255 的整数字节做插入排序取中值：帧数很少（≤24），开销可忽略
    const sorted = Array.from(channelValues).sort((a, b) => a - b);
    const middle = frameCount >> 1;
    const middleValue = frameCount % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    median[pixelIndex] = middleValue;

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      deviationSum += Math.abs(channelValues[frameIndex] - middleValue);
      deviationCount += 1;
    }
  }

  const motion = deviationCount > 0 ? deviationSum / deviationCount / 255 : 0;
  return { median, motion: clampUnit(motion) };
}

/** 依据用户选择与时域波动决定最终重建方式 */
export function decideRepairMethod(
  method: VideoWatermarkRepairMethod,
  motion: number
): VideoWatermarkAppliedMethod {
  if (method === 'temporal') return 'temporal';
  if (method === 'ai') return 'ai';
  // hq：LaMa 大模型补全，用户显式选装（慢但大水印/结构重建更强），auto 不会自动选它
  if (method === 'hq') return 'hq';
  // auto：背景波动明显 → 时域中值能还原干净背景；否则背景静止 → AI 单帧补全
  return motion >= STATIC_MOTION_THRESHOLD ? 'temporal' : 'ai';
}

/** 从源文件名派生输出文件名：clip.mp4 → clip-no-watermark.mp4 */
export function createOutputFilename(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'video';
  return `${base}-no-watermark.mp4`;
}

/** 渲染进度区间工具：把子阶段进度（0~100）映射进总体百分比区间 [from, to] */
export function mapProgressRange(
  percent: number,
  from: number,
  to: number
): number {
  const clamped = clampUnit(percent / 100);
  return Math.round((from + (to - from) * clamped) * 100) / 100;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
