import type { AudioProcessingProgress } from './audio';
import { loadFfmpeg } from './audio-browser';
import {
  clampTrimRange,
  computeOutputSize,
  computeTargetBitrate,
  createReencodeFilename,
  mapReencodeProgress,
  REENCODE_FRAMERATE,
  REENCODE_MAX_DURATION_SECONDS,
  validateReencodeFile,
  AUDIO_BITRATE_BY_QUALITY,
  type ReencodeQuality,
  type VideoReencodeProgress,
  type VideoReencodeResult,
} from './video-reencode';

/**
 * 视频重编码共享管线（视频压缩 / 视频截取）。
 *
 * 流程：本地解码 → WebCodecs VideoEncoder 重编码（可缩放分辨率、按画质档位定码率、
 * 可只处理截取区间）→ mp4-muxer 合成 MP4 → ffmpeg.wasm 处理音轨（重压缩或按区间裁剪）。
 *
 * 全程在浏览器本地完成，视频不会上传到任何服务器。
 */

export interface ReencodeOptions {
  quality: ReencodeQuality;
  /** 输出分辨率长边上限（px），null 或 0 表示保持原分辨率 */
  maxLongSide?: number | null;
  /** 截取区间（秒），null 表示全片 */
  trim?: { start: number; end: number } | null;
  /** 输出文件名后缀（不含扩展名） */
  suffix: string;
  onProgress?: (progress: VideoReencodeProgress) => void;
  signal?: AbortSignal;
}

interface LoadedVideo {
  video: HTMLVideoElement;
  url: string;
  width: number;
  height: number;
  duration: number;
}

const AVC_CODEC_CANDIDATES = [
  'avc1.640034',
  'avc1.640033',
  'avc1.640032',
  'avc1.640028',
  'avc1.4D4028',
  'avc1.42E03C',
  'avc1.42E01E',
] as const;

const RENDER_PROGRESS_START = 30;
const RENDER_PROGRESS_END = 80;
const AUDIO_PROGRESS_START = 84;
const AUDIO_PROGRESS_END = 96;
const KEYFRAME_INTERVAL_SECONDS = 2;
const MAX_ENCODER_QUEUE_SIZE = 8;

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

function createFailure(code: import('./video-reencode').VideoReencodeErrorCode, detail?: string): VideoReencodeResult {
  return { ok: false, code, detail };
}

function createFailureError(
  code: import('./video-reencode').VideoReencodeErrorCode,
  detail?: string
): Error & { code: import('./video-reencode').VideoReencodeErrorCode } {
  const error = new Error(detail || code) as Error & { code: import('./video-reencode').VideoReencodeErrorCode };
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

    const cleanupAndReject = (code: import('./video-reencode').VideoReencodeErrorCode, detail?: string) => {
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

async function pickVideoCodec(
  width: number,
  height: number,
  bitrate: number,
  framerate: number
): Promise<VideoEncoderConfig | null> {
  for (const codec of AVC_CODEC_CANDIDATES) {
    const config: VideoEncoderConfig = { codec, width, height, bitrate, framerate };
    try {
      const support = await VideoEncoder.isConfigSupported(config);
      if (support.supported) return config;
    } catch {
      // 逐个候选尝试，不支持则继续
    }
  }
  return null;
}

/** 用 ffmpeg 把音轨（重编码到指定码率、可按区间裁剪）回填进重编码后的视频 */
async function muxAudio(
  videoBlob: Blob,
  sourceFile: File,
  audioBitrateKbps: number,
  trim: { start: number; end: number } | null,
  onProgress?: (progress: VideoReencodeProgress) => void,
  signal?: AbortSignal
): Promise<{ blob: Blob; hasAudio: boolean }> {
  const ffmpeg = await loadFfmpeg((progress: AudioProcessingProgress) => {
    onProgress?.({
      stage: 'audio',
      label: progress.label,
      percent: mapReencodeProgress(progress.percent, AUDIO_PROGRESS_START, AUDIO_PROGRESS_END),
    });
  });
  throwIfAborted(signal);

  const silentName = 'reencode-silent.mp4';
  const extension = (/\.([a-z0-9]{2,5})$/i.exec(sourceFile.name)?.[1] ?? 'mp4').toLowerCase();
  const sourceName = `reencode-source.${extension}`;
  const outputName = 'reencode-output.mp4';

  await ffmpeg.writeFile(silentName, new Uint8Array(await videoBlob.arrayBuffer()));
  await ffmpeg.writeFile(sourceName, new Uint8Array(await sourceFile.arrayBuffer()));
  throwIfAborted(signal);

  try {
    const args = ['-i', silentName];
    if (trim) {
      args.push('-ss', trim.start.toFixed(3), '-t', (trim.end - trim.start).toFixed(3));
    }
    args.push(
      '-i', sourceName,
      '-map', '0:v:0',
      '-map', '1:a:0?',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', `${audioBitrateKbps}k`,
      '-movflags', '+faststart',
      outputName,
    );
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string') {
      throw new Error('Unexpected text output');
    }
    if (data.byteLength < 1024) {
      throw new Error('Muxed output too small');
    }
    return { blob: new Blob([new Uint8Array(data)], { type: 'video/mp4' }), hasAudio: true };
  } catch (error) {
    if (isCancellation(error)) throw error;
    // 音轨处理失败不致命：输出无声视频
    return { blob: videoBlob, hasAudio: false };
  } finally {
    await Promise.allSettled([
      ffmpeg.deleteFile(silentName),
      ffmpeg.deleteFile(sourceName),
      ffmpeg.deleteFile(outputName),
    ]);
  }
}

interface RenderContext {
  video: LoadedVideo;
  range: { start: number; end: number };
  outputWidth: number;
  outputHeight: number;
  bitrate: number;
  onProgress?: (progress: VideoReencodeProgress) => void;
  signal?: AbortSignal;
}

/** 播放并逐帧重编码（WebCodecs + mp4-muxer），只处理 [start, end] 区间 */
async function renderAndEncode(context: RenderContext): Promise<Blob> {
  const { video, range, outputWidth, outputHeight, bitrate, onProgress, signal } = context;
  const { start, end } = range;
  const spanSeconds = Math.max(0.1, end - start);

  const encoderConfig = await pickVideoCodec(outputWidth, outputHeight, bitrate, REENCODE_FRAMERATE);
  if (!encoderConfig || typeof VideoEncoder === 'undefined') {
    throw createFailureError('unsupported_browser', 'WebCodecs VideoEncoder unavailable');
  }

  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width: outputWidth, height: outputHeight },
    fastStart: 'in-memory',
  });

  const encoderState: { error: Error | null } = { error: null };
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (error) => {
      encoderState.error = error instanceof Error ? error : new Error(String(error));
    },
  });
  encoder.configure(encoderConfig);

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context2d = canvas.getContext('2d', { alpha: false });
  if (!context2d) {
    encoder.close();
    throw createFailureError('canvas_context');
  }

  const source = video.video;
  source.pause();
  source.currentTime = start;

  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      source.removeEventListener('seeked', onSeeked);
      resolve();
    };
    source.addEventListener('seeked', onSeeked);
  });

  let lastKeyTime = -Infinity;
  let settled = false;

  try {
    await new Promise<void>((resolve, reject) => {
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const step = (_now: number, metadata: VideoFrameCallbackMetadata) => {
        if (settled) return;
        try {
          throwIfAborted(signal);
          if (encoderState.error) {
            fail(encoderState.error);
            return;
          }

          context2d.drawImage(source, 0, 0, outputWidth, outputHeight);

          const relativeTime = Math.max(0, metadata.mediaTime - start);
          const timestamp = Math.max(0, Math.round(relativeTime * 1_000_000));
          const expectedDuration = Math.round((metadata.expectedDisplayTime - metadata.mediaTime) * 1_000_000);
          const frame = new VideoFrame(canvas, {
            timestamp,
            duration: expectedDuration > 0 ? expectedDuration : 33_333,
          });
          const isKeyFrame = relativeTime - lastKeyTime >= KEYFRAME_INTERVAL_SECONDS;
          if (isKeyFrame) lastKeyTime = relativeTime;
          encoder.encode(frame, { keyFrame: isKeyFrame });
          frame.close();

          onProgress?.({
            stage: 'render',
            label: 'render',
            percent: mapReencodeProgress(
              Math.min(100, (relativeTime / spanSeconds) * 100),
              RENDER_PROGRESS_START,
              RENDER_PROGRESS_END
            ),
          });

          if (source.ended || metadata.mediaTime >= end - 0.04) {
            finish();
            return;
          }

          const pump = () => {
            if (settled) return;
            if (encoder.encodeQueueSize > MAX_ENCODER_QUEUE_SIZE) {
              requestAnimationFrame(pump);
              return;
            }
            source.requestVideoFrameCallback(step);
          };
          pump();
        } catch (error) {
          fail(error instanceof Error ? error : new Error(String(error)));
        }
      };

      source.onended = finish;
      source.requestVideoFrameCallback(step);
      source.play().catch(() => fail(createFailureError('video_load_failed', 'playback blocked')));
    });
  } finally {
    source.pause();
    source.onended = null;
  }

  if (encoderState.error) {
    try { encoder.close(); } catch { /* noop */ }
    throw createFailureError('encode_failed', encoderState.error.message);
  }

  await encoder.flush();
  encoder.close();
  muxer.finalize();

  return new Blob([target.buffer], { type: 'video/mp4' });
}

/** 重编码主入口：返回判别联合结果，不抛异常 */
export async function reencodeVideoToMp4(
  file: File,
  options: ReencodeOptions
): Promise<VideoReencodeResult> {
  const startedAt = performance.now();
  const { quality, maxLongSide = null, trim = null, suffix, onProgress, signal } = options;

  const fileCheck = validateReencodeFile(file);
  if (!fileCheck.ok) {
    return createFailure(fileCheck.code);
  }

  if (typeof VideoEncoder === 'undefined' || typeof HTMLVideoElement === 'undefined') {
    return createFailure('unsupported_browser');
  }

  let loaded: LoadedVideo | null = null;
  try {
    throwIfAborted(signal);
    onProgress?.({ stage: 'prepare', label: 'loading', percent: 2 });
    loaded = await loadVideoElement(file);

    if (loaded.duration > REENCODE_MAX_DURATION_SECONDS) {
      return createFailure('video_too_long');
    }

    const range = trim ? clampTrimRange({ start: trim.start, end: trim.end, duration: loaded.duration }) : null;
    if (trim && !range) {
      return createFailure('range_invalid');
    }

    const size = computeOutputSize(loaded.width, loaded.height, maxLongSide);
    const bitrate = computeTargetBitrate(size.width, size.height, quality);
    onProgress?.({ stage: 'model', label: 'ready', percent: 12 });

    const videoBlob = await renderAndEncode({
      video: loaded,
      range: range ?? { start: 0, end: loaded.duration },
      outputWidth: size.width,
      outputHeight: size.height,
      bitrate,
      onProgress,
      signal,
    });

    throwIfAborted(signal);
    const { blob, hasAudio } = await muxAudio(
      videoBlob,
      file,
      AUDIO_BITRATE_BY_QUALITY[quality],
      range,
      onProgress,
      signal
    );

    onProgress?.({ stage: 'done', label: 'done', percent: 100 });
    return {
      ok: true,
      blob,
      filename: createReencodeFilename(file.name, suffix),
      width: size.width,
      height: size.height,
      durationMs: Math.round(performance.now() - startedAt),
      outputSize: blob.size,
      hasAudio,
    };
  } catch (error) {
    if (isCancellation(error)) {
      return createFailure('cancelled');
    }
    const code = error instanceof Error && 'code' in error
      ? (error as { code: import('./video-reencode').VideoReencodeErrorCode }).code
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
