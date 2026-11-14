/**
 * 视频合并 — 纯函数层。
 *
 * 管线概要（见 video-merge-browser.ts）：
 * 1. 依次解码每个视频（mp4box + WebCodecs 首选，播放路径兜底），按第一个视频的
 *    分辨率统一输出尺寸，其余画面等比缩放并居中（黑边填充）
 * 2. 全部片段共用一个 VideoEncoder + mp4-muxer 顺序编码，时间戳跨片段连续递增
 * 3. 每段的音轨用 ffmpeg.wasm 独立抽出并对齐到该段视频时长，最后 concat 成一条音轨回填
 *
 * 本文件保持纯函数：不依赖 DOM / React，返回判别联合类型，不抛异常。
 */

import {
  REENCODE_MAX_DURATION_SECONDS,
  REENCODE_MAX_FILE_SIZE,
  validateReencodeFile,
  type VideoReencodeErrorCode,
} from './video-reencode';

export type VideoMergeErrorCode =
  | VideoReencodeErrorCode
  | 'too_few_files'
  | 'too_many_files'
  | 'total_too_large'
  | 'total_too_long';

/** 单个文件上限与截取/压缩一致 */
export const MERGE_MAX_FILE_SIZE = REENCODE_MAX_FILE_SIZE;
/** 单段视频时长上限 */
export const MERGE_MAX_DURATION_SECONDS = REENCODE_MAX_DURATION_SECONDS;
/** 最多合并的文件数：内存里要同时持有静音视频与各段音轨，数量过多容易 OOM */
export const MERGE_MAX_FILES = 8;
/** 合计体积上限（解码路径逐段读入内存，但最终 muxer 的 in-memory 输出受总量约束） */
export const MERGE_MAX_TOTAL_SIZE = 600 * 1024 * 1024;
/** 合并后的总时长上限 */
export const MERGE_MAX_TOTAL_DURATION_SECONDS = 900;

export interface VideoMergeProgress {
  stage: 'prepare' | 'render' | 'audio' | 'done';
  label: string;
  percent: number;
  /** 当前处理到第几个文件（1 起始） */
  currentFile: number;
  fileCount: number;
}

export interface VideoMergeSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  durationMs: number;
  outputSize: number;
  segmentCount: number;
  hasAudio: boolean;
}

export interface VideoMergeFailure {
  ok: false;
  code: VideoMergeErrorCode;
  detail?: string;
}

export type VideoMergeResult = VideoMergeSuccess | VideoMergeFailure;

export interface MergeSourceMeta {
  file: File;
  width: number;
  height: number;
  duration: number;
}

/** 校验待合并文件列表：数量、单文件类型与体积、总体积。返回判别联合，不抛异常 */
export function validateMergeFiles(files: File[]): { ok: true } | { ok: false; code: VideoMergeErrorCode } {
  if (files.length < 2) return { ok: false, code: 'too_few_files' };
  if (files.length > MERGE_MAX_FILES) return { ok: false, code: 'too_many_files' };
  let total = 0;
  for (const file of files) {
    const check = validateReencodeFile(file);
    if (!check.ok) return { ok: false, code: check.code };
    if (file.size > MERGE_MAX_FILE_SIZE) return { ok: false, code: 'file_too_large' };
    total += file.size;
  }
  if (total > MERGE_MAX_TOTAL_SIZE) return { ok: false, code: 'total_too_large' };
  return { ok: true };
}

/**
 * 输出分辨率取第一个视频的尺寸（偶数对齐）。
 * 用户按添加顺序合并，第一段定义画幅最符合直觉；其余画面等比缩放进这个画幅。
 */
export function computeMergeOutputSize(sources: Array<{ width: number; height: number }>): { width: number; height: number } {
  const first = sources[0];
  const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);
  const width = even(Math.max(2, first?.width ?? 640));
  const height = even(Math.max(2, first?.height ?? 360));
  return { width, height };
}

/**
 * 把源画面等比缩放到目标画幅内的最大矩形（信箱模式，居中）。
 * 源与目标同尺寸时返回铺满画幅。
 */
export function computeFitRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): { x: number; y: number; width: number; height: number } {
  const safeSourceWidth = Math.max(1, sourceWidth);
  const safeSourceHeight = Math.max(1, sourceHeight);
  const scale = Math.min(targetWidth / safeSourceWidth, targetHeight / safeSourceHeight);
  const width = Math.max(2, Math.round(safeSourceWidth * scale));
  const height = Math.max(2, Math.round(safeSourceHeight * scale));
  return {
    x: Math.round((targetWidth - width) / 2),
    y: Math.round((targetHeight - height) / 2),
    width,
    height,
  };
}

/** 输出文件名取第一个文件的基名 + -merged */
export function createMergedFilename(files: File[]): string {
  const base = files[0]?.name.replace(/\.[^.]+$/, '') || 'video';
  return `${base}-merged.mp4`;
}

/** 把子阶段进度（0~100）映射进总体百分比区间 [from, to] */
export function mapMergeProgress(percent: number, from: number, to: number): number {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(percent) ? percent / 100 : 0));
  return Math.round((from + (to - from) * clamped) * 100) / 100;
}
