import { loadFfmpeg } from './audio-browser';
import {
  clampGifRange,
  createGifFilename,
  GIF_MAX_DURATION_SECONDS,
  planGifFrames,
  validateGifSourceFile,
  type GifFps,
  type GifWidth,
  type VideoGifProgress,
  type VideoGifResult,
} from './video-gif';

/**
 * 视频转 GIF — 浏览器管线。
 *
 * 流程：本地解码 → 按目标帧率确定性采样（seek + drawImage）→
 * gifenc 每帧量化（局部调色板）输出 GIF。无音轨概念，也不依赖实时播放，
 * 长片段会逐帧 seek，耗时与帧数成正比。
 *
 * 全程在浏览器本地完成，视频不会上传到任何服务器。
 */

export interface VideoToGifOptions {
  fps: GifFps;
  width: GifWidth;
  /** 截取区间（秒），null 表示全片 */
  trim?: { start: number; end: number } | null;
  onProgress?: (progress: VideoGifProgress) => void;
  signal?: AbortSignal;
}

interface LoadedVideo {
  video: HTMLVideoElement;
  url: string;
  width: number;
  height: number;
  duration: number;
}

const SAMPLE_PROGRESS_START = 12;
const SAMPLE_PROGRESS_END = 78;
const ENCODE_PROGRESS_START = 80;
const ENCODE_PROGRESS_END = 96;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createCancellationError();
  }
}

function createCancellationError(): Error {
  const error = new Error('cancelled');
  error.name = 'AbortError';
  return error;
}

function isCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function createFailure(code: import('./video-gif').VideoGifErrorCode, detail?: string): VideoGifResult {
  return { ok: false, code, detail };
}

function createFailureError(
  code: import('./video-gif').VideoGifErrorCode,
  detail?: string
): Error & { code: import('./video-gif').VideoGifErrorCode } {
  const error = new Error(detail || code) as Error & { code: import('./video-gif').VideoGifErrorCode };
  error.code = code;
  return error;
}

function loadVideoElement(file: File): Promise<LoadedVideo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const cleanupAndReject = (code: import('./video-gif').VideoGifErrorCode, detail?: string) => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      reject(createFailureError(code, detail));
    };

    video.onloadeddata = () => {
      if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration) || video.duration <= 0) {
        cleanupAndReject('video_load_failed');
        return;
      }
      resolve({
        video,
        url,
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };
    video.onerror = () => cleanupAndReject('video_load_failed');
    video.src = url;
  });
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(createFailureError('video_load_failed'));
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = Math.min(time, Math.max(0, (video.duration || 0) - 0.05));
  });
}

/**
 * 部分容器（webm/mkv 等）在逐帧 seek 时时间轴可能不准，先用 ffmpeg 无损转成
 * 中间 MP4（-c:v copy 只换容器，速度很快）。MP4/MOV 源直接跳过。
 */
async function ensureCompatibleSource(file: File, signal?: AbortSignal): Promise<File> {
  if (/\.(mp4|m4v|mov)$/i.test(file.name) && file.type !== 'video/webm') {
    return file;
  }
  const ffmpeg = await loadFfmpeg();
  throwIfAborted(signal);

  const extension = (/\.([a-z0-9]{2,5})$/i.exec(file.name)?.[1] ?? 'webm').toLowerCase();
  const inputName = `gif-source.${extension}`;
  const outputName = 'gif-source.mp4';

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
  try {
    await ffmpeg.exec(['-i', inputName, '-c:v', 'copy', '-an', '-movflags', '+faststart', outputName]);
    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string' || data.byteLength < 1024) {
      return file;
    }
    return new File([new Uint8Array(data)], 'gif-source.mp4', { type: 'video/mp4' });
  } catch {
    return file;
  } finally {
    await Promise.allSettled([
      ffmpeg.deleteFile(inputName),
      ffmpeg.deleteFile(outputName),
    ]);
  }
}

/** 视频转 GIF 主入口：返回判别联合结果，不抛异常 */
export async function convertVideoToGif(
  file: File,
  options: VideoToGifOptions
): Promise<VideoGifResult> {
  const startedAt = performance.now();
  const { fps, width, trim = null, onProgress, signal } = options;

  const fileCheck = validateGifSourceFile(file);
  if (!fileCheck.ok) {
    return createFailure(fileCheck.code);
  }

  let loaded: LoadedVideo | null = null;
  try {
    throwIfAborted(signal);
    onProgress?.({ stage: 'prepare', label: 'loading', percent: 2 });
    const sourceFile = await ensureCompatibleSource(file, signal);
    loaded = await loadVideoElement(sourceFile);

    if (loaded.duration > GIF_MAX_DURATION_SECONDS) {
      return createFailure('video_too_long');
    }

    const range = trim ? clampGifRange({ start: trim.start, end: trim.end, duration: loaded.duration }) : null;
    if (trim && !range) {
      return createFailure('range_invalid');
    }
    const { start, end } = range ?? { start: 0, end: loaded.duration };

    const plan = planGifFrames({
      start,
      end,
      fps,
      sourceWidth: loaded.width,
      sourceHeight: loaded.height,
      targetWidth: width,
    });

    const canvas = document.createElement('canvas');
    canvas.width = plan.width;
    canvas.height = plan.height;
    const context2d = canvas.getContext('2d', { alpha: false });
    if (!context2d) {
      return createFailure('canvas_context');
    }

    // 采样阶段：确定性 seek 逐帧取 RGBA 像素
    const frames: Uint8ClampedArray[] = [];
    for (let index = 0; index < plan.timestamps.length; index += 1) {
      throwIfAborted(signal);
      await seekTo(loaded.video, plan.timestamps[index]);
      context2d.drawImage(loaded.video, 0, 0, plan.width, plan.height);
      const { data } = context2d.getImageData(0, 0, plan.width, plan.height);
      frames.push(data);
      onProgress?.({
        stage: 'sample',
        label: 'sampling',
        percent: SAMPLE_PROGRESS_START + ((SAMPLE_PROGRESS_END - SAMPLE_PROGRESS_START) * (index + 1)) / plan.timestamps.length,
      });
    }

    onProgress?.({ stage: 'encode', label: 'encode', percent: ENCODE_PROGRESS_START });
    const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
    const encoder = GIFEncoder();

    for (let index = 0; index < frames.length; index += 1) {
      throwIfAborted(signal);
      const palette = quantize(frames[index], 256);
      const indexed = applyPalette(frames[index], palette);
      encoder.writeFrame(indexed, plan.width, plan.height, {
        palette,
        delay: plan.delayMs,
        first: index === 0,
      });
      onProgress?.({
        stage: 'encode',
        label: 'encode',
        percent:
          ENCODE_PROGRESS_START +
          ((ENCODE_PROGRESS_END - ENCODE_PROGRESS_START) * (index + 1)) / frames.length,
      });
    }
    encoder.finish();

    const bytes = encoder.bytes();
    if (bytes.byteLength < 512) {
      return createFailure('encode_failed', 'GIF output too small');
    }

    onProgress?.({ stage: 'done', label: 'done', percent: 100 });
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
    return {
      ok: true,
      blob,
      filename: createGifFilename(file.name),
      width: plan.width,
      height: plan.height,
      frameCount: frames.length,
      durationMs: Math.round(performance.now() - startedAt),
      outputSize: blob.size,
    };
  } catch (error) {
    if (isCancellation(error)) {
      return createFailure('cancelled');
    }
    const code = error instanceof Error && 'code' in error
      ? (error as { code: import('./video-gif').VideoGifErrorCode }).code
      : 'general';
    return createFailure(code, error instanceof Error ? error.message : undefined);
  } finally {
    if (loaded) {
      loaded.video.pause();
      loaded.video.removeAttribute('src');
      URL.revokeObjectURL(loaded.url);
    }
  }
}
