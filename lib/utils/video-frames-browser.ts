import { loadVideoElement, seekVideoTo } from './video-reencode-browser';
import {
  createFrameFilename,
  FRAMES_MAX_DURATION_SECONDS,
  validateFramesFile,
  type ExtractedFrame,
  type FrameFormat,
  type VideoFramesProgress,
  type VideoFramesResult,
} from './video-frames';

/**
 * 视频抽帧 / 截图 — 浏览器管线。
 *
 * 用视频元素 seek 到每个计划时间点后抓帧：抽帧是离散操作，不需要整段解码，
 * 播放路径的 seek 精度（约一帧）对截图场景完全够用，也天然支持 WebM、
 * HEVC 与带旋转元数据的手机视频（浏览器会自动应用方向）。
 *
 * 全程在浏览器本地完成，视频不会上传到任何服务器。
 */

export interface ExtractFramesOptions {
  times: number[];
  format: FrameFormat;
  /** JPG 质量（0~1），仅 format 为 jpeg 时生效 */
  jpegQuality?: number;
  onProgress?: (progress: VideoFramesProgress) => void;
  signal?: AbortSignal;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error('cancelled');
    error.name = 'AbortError';
    throw error;
  }
}

function isCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export async function extractFramesFromVideo(
  file: File,
  options: ExtractFramesOptions
): Promise<VideoFramesResult> {
  const startedAt = performance.now();
  const { times, format, jpegQuality = 0.92, onProgress, signal } = options;

  const fileCheck = validateFramesFile(file);
  if (!fileCheck.ok) {
    return { ok: false, code: fileCheck.code };
  }
  if (times.length === 0) {
    return { ok: false, code: 'no_frames' };
  }

  let loaded: Awaited<ReturnType<typeof loadVideoElement>> | null = null;
  try {
    throwIfAborted(signal);
    onProgress?.({ stage: 'prepare', label: 'loading', percent: 2, completedFrames: 0, totalFrames: times.length });
    loaded = await loadVideoElement(file);
    if (loaded.duration > FRAMES_MAX_DURATION_SECONDS) {
      return { ok: false, code: 'video_too_long' };
    }

    const canvas = document.createElement('canvas');
    canvas.width = loaded.width;
    canvas.height = loaded.height;
    const context2d = canvas.getContext('2d', { alpha: format === 'png' });
    if (!context2d) {
      return { ok: false, code: 'canvas_context' };
    }

    const frames: ExtractedFrame[] = [];
    for (let index = 0; index < times.length; index += 1) {
      throwIfAborted(signal);
      const time = times[index];
      await seekVideoTo(loaded.video, time);
      throwIfAborted(signal);

      context2d.drawImage(loaded.video, 0, 0, loaded.width, loaded.height);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), format === 'png' ? 'image/png' : 'image/jpeg', jpegQuality);
      });
      if (!blob || blob.size < 64) {
        return { ok: false, code: 'encode_failed', detail: `frame ${index} encode failed` };
      }

      frames.push({
        blob,
        filename: createFrameFilename(file.name, index, format),
        timeSeconds: time,
        width: loaded.width,
        height: loaded.height,
      });
      onProgress?.({
        stage: 'extract',
        label: 'extract',
        percent: Math.round(((index + 1) / times.length) * 96) + 2,
        completedFrames: index + 1,
        totalFrames: times.length,
      });
    }

    onProgress?.({ stage: 'done', label: 'done', percent: 100, completedFrames: frames.length, totalFrames: times.length });
    return {
      ok: true,
      frames,
      width: loaded.width,
      height: loaded.height,
      format,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    if (isCancellation(error)) {
      return { ok: false, code: 'cancelled' };
    }
    return {
      ok: false,
      code: 'general',
      detail: error instanceof Error ? error.message : undefined,
    };
  } finally {
    if (loaded) {
      loaded.video.pause();
      loaded.video.removeAttribute('src');
      loaded.video.remove();
      URL.revokeObjectURL(loaded.url);
    }
  }
}
