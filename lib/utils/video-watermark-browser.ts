import type { AudioProcessingProgress } from './audio';
import { loadFfmpeg } from './audio-browser';
import type { ImageCropRect } from './image';
import {
  disableMiganWebGpu,
  inpaintCanvasRegionWithLama,
  inpaintCanvasRegionWithMigan,
  resetMiganWatermarkSession,
} from './image-browser';
import {
  createOutputFilename,
  computeTemporalMedian,
  createVideoWatermarkPlan,
  decideRepairMethod,
  mapProgressRange,
  MAX_VIDEO_DURATION_SECONDS,
  validateVideoFile,
  type VideoWatermarkAppliedMethod,
  type VideoWatermarkProgress,
  type VideoWatermarkRemovalResult,
  type VideoWatermarkRepairMethod,
} from './video-watermark';

/**
 * 视频去水印 — 浏览器管线。
 *
 * 流程：时域采样选区像素 → 时域中值 / MI-GAN AI 二选一生成修复补丁 →
 * 播放视频逐帧合成（WebCodecs VideoEncoder + mp4-muxer 直接编码 MP4）→
 * ffmpeg.wasm 把原视频音轨回填进输出文件。
 *
 * 全程在浏览器本地完成，视频不会上传到任何服务器。
 */

export interface RemoveVideoWatermarkOptions {
  selection: ImageCropRect;
  method: VideoWatermarkRepairMethod;
  /** 选区边缘融合宽度（px），与图片去水印的语义一致 */
  feather?: number;
  onProgress?: (progress: VideoWatermarkProgress) => void;
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

const RENDER_PROGRESS_START = 40;
const RENDER_PROGRESS_END = 86;
const AUDIO_PROGRESS_START = 88;
const AUDIO_PROGRESS_END = 97;
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

function createFailure(
  code: import('./video-watermark').VideoWatermarkErrorCode,
  detail?: string
): VideoWatermarkRemovalResult {
  return { ok: false, code, detail };
}

function loadVideoElement(file: File): Promise<LoadedVideo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    // 挂载到屏幕外的真实 DOM：部分浏览器对不在文档中的视频不派发帧回调
    video.setAttribute('aria-hidden', 'true');
    video.style.position = 'fixed';
    video.style.left = '-10000px';
    video.style.top = '0';
    video.style.width = '320px';
    video.style.height = '180px';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    const cleanupAndReject = (code: import('./video-watermark').VideoWatermarkErrorCode, detail?: string) => {
      URL.revokeObjectURL(url);
      video.pause();
      video.removeAttribute('src');
      video.remove();
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

function createFailureError(code: import('./video-watermark').VideoWatermarkErrorCode, detail?: string): Error & { code: import('./video-watermark').VideoWatermarkErrorCode } {
  const error = new Error(detail || code) as Error & { code: import('./video-watermark').VideoWatermarkErrorCode };
  error.code = code;
  return error;
}

/**
 * AI 单帧补全的看门狗。
 *
 * WebGPU 会话"创建成功"不代表推理可用：部分 GPU/驱动组合下首次推理会静默挂起
 * （无错误、无超时可救）。MI-GAN 走 WebGPU 时若在时限内没返回，强制降级到
 * WASM（disableMiganWebGpu + 重置缓存会话）重试一次。LaMa 刻意只用 WASM，
 * 但大模型推理慢，仍需要超长看门狗兜底转为 general 错误而不是永远挂着。
 */
const MIGAN_WATCHDOG_MS = 120_000;
const LAMA_WATCHDOG_MS = 600_000;

async function inpaintSingleFrameWithWatchdog(
  run: () => Promise<HTMLCanvasElement>,
  useLama: boolean
): Promise<HTMLCanvasElement> {
  const watchdogMs = useLama ? LAMA_WATCHDOG_MS : MIGAN_WATCHDOG_MS;

  const runWithTimeout = (timeoutMs: number): Promise<HTMLCanvasElement> =>
    new Promise<HTMLCanvasElement>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(createFailureError('general', 'inference_watchdog_timeout'));
      }, timeoutMs);
      run().then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error: unknown) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });

  try {
    return await runWithTimeout(watchdogMs);
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'inference_watchdog_timeout';
    if (useLama || !timedOut) {
      throw error;
    }
    // MI-GAN WebGPU 挂起 → 丢弃会话、禁用 WebGPU，用 WASM 会话重试一次
    disableMiganWebGpu();
    resetMiganWatermarkSession();
    return runWithTimeout(MIGAN_WATCHDOG_MS);
  }
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // 同值守卫：目标时间与当前播放头一致时不会触发 seeked，直接返回避免挂起
    if (Math.abs(video.currentTime - time) < 0.001) {
      resolve();
      return;
    }
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(createFailureError('video_load_failed'));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, 8000);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = Math.min(time, Math.max(0, (video.duration || 0) - 0.05));
  });
}

interface SelectionSample {
  imageData: ImageData;
}

async function sampleSelectionPixels(
  video: HTMLVideoElement,
  timestamps: number[],
  rect: ImageCropRect,
  onProgress?: (ratio: number) => void
): Promise<SelectionSample[]> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, rect.width);
  canvas.height = Math.max(1, rect.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw createFailureError('canvas_context');
  }

  const samples: SelectionSample[] = [];
  for (let index = 0; index < timestamps.length; index += 1) {
    await seekTo(video, timestamps[index]);
    context.drawImage(
      video,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    samples.push({ imageData: context.getImageData(0, 0, canvas.width, canvas.height) });
    onProgress?.((index + 1) / timestamps.length);
  }
  return samples;
}

function createCanvas(width: number, height: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas.getContext('2d') ? canvas : null;
}

/** 给补丁画布应用边缘羽化透明，使贴回画面时边界自然过渡 */
function applyFeatheredAlpha(canvas: HTMLCanvasElement, feather: number) {
  if (feather <= 0) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const mask = document.createElement('canvas');
  mask.width = canvas.width;
  mask.height = canvas.height;
  const maskContext = mask.getContext('2d');
  if (!maskContext) return;

  const blur = Math.max(1, Math.round(feather / 2));
  const inset = Math.max(2, Math.round(feather));
  maskContext.filter = `blur(${blur}px)`;
  maskContext.fillStyle = '#ffffff';
  maskContext.fillRect(inset, inset, Math.max(1, canvas.width - inset * 2), Math.max(1, canvas.height - inset * 2));
  maskContext.filter = 'none';

  context.globalCompositeOperation = 'destination-in';
  context.drawImage(mask, 0, 0);
  context.globalCompositeOperation = 'source-over';
}

function createTemporalPatchCanvas(
  median: Uint8ClampedArray,
  rect: ImageCropRect,
  feather: number
): HTMLCanvasElement | null {
  const canvas = createCanvas(rect.width, rect.height);
  if (!canvas) return null;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const imageData = context.createImageData(rect.width, rect.height);
  imageData.data.set(median.subarray(0, imageData.data.length));
  context.putImageData(imageData, 0, 0);
  applyFeatheredAlpha(canvas, feather);
  return canvas;
}

function extractSelectionPatch(
  frame: HTMLCanvasElement,
  rect: ImageCropRect,
  feather: number
): HTMLCanvasElement | null {
  const canvas = createCanvas(rect.width, rect.height);
  if (!canvas) return null;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(frame, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  applyFeatheredAlpha(canvas, feather);
  return canvas;
}

async function pickVideoCodec(
  width: number,
  height: number,
  bitrate: number,
  framerate: number
): Promise<VideoEncoderConfig | null> {
  for (const codec of AVC_CODEC_CANDIDATES) {
    const config: VideoEncoderConfig = {
      codec,
      width,
      height,
      bitrate,
      framerate,
    };
    try {
      const support = await VideoEncoder.isConfigSupported(config);
      if (support.supported) return config;
    } catch {
      // 逐个候选尝试，不支持则继续
    }
  }
  return null;
}

async function muxOriginalAudio(
  videoBlob: Blob,
  sourceFile: File,
  onProgress?: (progress: VideoWatermarkProgress) => void,
  signal?: AbortSignal
): Promise<Blob> {
  const ffmpeg = await loadFfmpeg((progress: AudioProcessingProgress) => {
    onProgress?.({
      stage: 'audio',
      label: progress.label,
      percent: mapProgressRange(progress.percent, AUDIO_PROGRESS_START, AUDIO_PROGRESS_END),
    });
  });
  throwIfAborted(signal);

  const silentName = 'input-no-watermark.mp4';
  const extension = (/\.([a-z0-9]{2,5})$/i.exec(sourceFile.name)?.[1] ?? 'mp4').toLowerCase();
  const sourceName = `input-source.${extension}`;
  const outputName = 'output-with-audio.mp4';

  await ffmpeg.writeFile(silentName, new Uint8Array(await videoBlob.arrayBuffer()));
  await ffmpeg.writeFile(sourceName, new Uint8Array(await sourceFile.arrayBuffer()));
  throwIfAborted(signal);

  try {
    await ffmpeg.exec([
      '-i', silentName,
      '-i', sourceName,
      '-map', '0:v:0',
      '-map', '1:a:0?',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '160k',
      '-movflags', '+faststart',
      outputName,
    ]);
    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string') {
      throw new Error('Unexpected text output');
    }
    if (data.byteLength < 1024) {
      throw new Error('Muxed output too small');
    }
    return new Blob([new Uint8Array(data)], { type: 'video/mp4' });
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
  patchCanvas: HTMLCanvasElement;
  selection: ImageCropRect;
  onProgress?: (progress: VideoWatermarkProgress) => void;
  signal?: AbortSignal;
}

async function renderAndEncode(context: RenderContext): Promise<Blob> {
  const { video, patchCanvas, selection, onProgress, signal } = context;
  const { width, height } = video;
  const framerate = 30;
  const bitrate = Math.min(
    20_000_000,
    Math.max(1_200_000, Math.round(width * height * framerate * 0.07))
  );

  const encoderConfig = await pickVideoCodec(width, height, bitrate, framerate);
  if (!encoderConfig || typeof VideoEncoder === 'undefined') {
    throw createFailureError('unsupported_browser', 'WebCodecs VideoEncoder unavailable');
  }

  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width, height },
    fastStart: 'in-memory',
    // 首帧时间戳不一定精确为 0，strict 模式会直接抛错，offset 模式自动归零
    firstTimestampBehavior: 'offset',
  });

  const encoderState: { error: Error | null } = { error: null };
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try {
        muxer.addVideoChunk(chunk, meta);
      } catch (error) {
        encoderState.error = error instanceof Error ? error : new Error(String(error));
      }
    },
    error: (error) => {
      encoderState.error = error instanceof Error ? error : new Error(String(error));
    },
  });
  encoder.configure(encoderConfig);

  const canvas = createCanvas(width, height);
  if (!canvas) {
    encoder.close();
    throw createFailureError('canvas_context');
  }
  const context2d = canvas.getContext('2d', { alpha: false });
  if (!context2d) {
    encoder.close();
    throw createFailureError('canvas_context');
  }

  const source = video.video;
  source.pause();
  await seekTo(source, 0);

  let lastKeyTime = -Infinity;
  let settled = false;
  const lastFrameAt = { value: performance.now() };

  /** rVFC 不可用时用 rAF 泵替代（老 Safari 等场景），mediaTime 用播放头近似 */
  const scheduleNextFrame = (callback: (now: number, metadata: VideoFrameCallbackMetadata) => void) => {
    if (typeof source.requestVideoFrameCallback === 'function') {
      source.requestVideoFrameCallback(callback);
      return;
    }
    requestAnimationFrame((now) => {
      callback(now, {
        mediaTime: source.currentTime,
        expectedDisplayTime: now + 1000 / framerate,
        width: source.videoWidth,
        height: source.videoHeight,
        presentedFrames: 0,
        processingDuration: 0,
        captureTime: now,
        receiveTime: now,
        presentationTime: now,
      } as unknown as VideoFrameCallbackMetadata);
    });
  };

  try {
    await new Promise<void>((resolve, reject) => {
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearInterval(stallTimer);
        resolve();
      };
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        window.clearInterval(stallTimer);
        reject(error);
      };

      // 渲染停顿看门狗：连续 15 秒没有任何新帧则报错，避免界面永远卡住
      const stallTimer = window.setInterval(() => {
        if (settled) return;
        if (performance.now() - lastFrameAt.value > 15_000) {
          fail(createFailureError('encode_failed', 'render stalled: no frames received'));
        }
      }, 2000);

      const step = (
        _now: number,
        metadata: VideoFrameCallbackMetadata
      ) => {
        if (settled) return;
        try {
          throwIfAborted(signal);
          if (encoderState.error) {
            fail(encoderState.error);
            return;
          }
          lastFrameAt.value = performance.now();

          context2d.drawImage(source, 0, 0, width, height);
          context2d.drawImage(patchCanvas, selection.x, selection.y);

          const timestamp = Math.max(0, Math.round(metadata.mediaTime * 1_000_000));
          const expectedDuration = Math.round((metadata.expectedDisplayTime - metadata.mediaTime) * 1_000_000);
          const frame = new VideoFrame(canvas, {
            timestamp,
            duration: expectedDuration > 0 ? expectedDuration : 33_333,
          });
          const isKeyFrame = metadata.mediaTime - lastKeyTime >= KEYFRAME_INTERVAL_SECONDS;
          if (isKeyFrame) lastKeyTime = metadata.mediaTime;
          encoder.encode(frame, { keyFrame: isKeyFrame });
          frame.close();

          onProgress?.({
            stage: 'render',
            label: 'render',
            percent: mapProgressRange(
              Math.min(100, (metadata.mediaTime / Math.max(0.1, video.duration)) * 100),
              RENDER_PROGRESS_START,
              RENDER_PROGRESS_END
            ),
          });

          if (source.ended || metadata.mediaTime >= video.duration - 0.04) {
            finish();
            return;
          }

          const pump = () => {
            if (settled) return;
            if (encoder.encodeQueueSize > MAX_ENCODER_QUEUE_SIZE) {
              requestAnimationFrame(pump);
              return;
            }
            scheduleNextFrame(step);
          };
          pump();
        } catch (error) {
          fail(error instanceof Error ? error : new Error(String(error)));
        }
      };

      source.onended = finish;
      scheduleNextFrame(step);
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

/** 视频去水印主入口：返回判别联合结果，不抛异常 */
export async function removeVideoWatermark(
  file: File,
  options: RemoveVideoWatermarkOptions
): Promise<VideoWatermarkRemovalResult> {
  const startedAt = performance.now();
  const { selection, method, feather = 12, onProgress, signal } = options;

  if (!selection || selection.width <= 0 || selection.height <= 0) {
    return createFailure('selection_required');
  }

  const fileCheck = validateVideoFile(file);
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

    if (loaded.duration > MAX_VIDEO_DURATION_SECONDS) {
      return createFailure('video_too_long');
    }

    const plan = createVideoWatermarkPlan({
      selection,
      videoWidth: loaded.width,
      videoHeight: loaded.height,
      method,
      durationSeconds: loaded.duration,
    });

    throwIfAborted(signal);
    onProgress?.({ stage: 'analyze', label: 'sampling', percent: 6 });
    const samples = await sampleSelectionPixels(
      loaded.video,
      plan.sampleTimestamps,
      plan.selection,
      (ratio) => {
        onProgress?.({
          stage: 'analyze',
          label: 'sampling',
          percent: mapProgressRange(ratio * 100, 6, 24),
        });
      }
    );

    const { median, motion } = computeTemporalMedian(samples.map((sample) => sample.imageData.data));
    if (median.length === 0) {
      return createFailure('general');
    }
    const appliedMethod: VideoWatermarkAppliedMethod = decideRepairMethod(method, motion);

    throwIfAborted(signal);
    let patchCanvas: HTMLCanvasElement | null;
    if (appliedMethod === 'temporal') {
      patchCanvas = createTemporalPatchCanvas(median, plan.selection, feather);
      onProgress?.({ stage: 'model', label: 'temporal-ready', percent: 34 });
    } else {
      onProgress?.({ stage: 'model', label: 'model-loading', percent: 26 });
      const representativeTime = plan.sampleTimestamps[Math.floor(plan.sampleTimestamps.length / 2)];
      await seekTo(loaded.video, representativeTime);
      const frameCanvas = createCanvas(loaded.width, loaded.height);
      if (!frameCanvas) {
        return createFailure('canvas_context');
      }
      const frameContext = frameCanvas.getContext('2d');
      if (!frameContext) {
        return createFailure('canvas_context');
      }
      frameContext.drawImage(loaded.video, 0, 0, loaded.width, loaded.height);

      const useLama = appliedMethod === 'hq';
      const inpaint = useLama ? inpaintCanvasRegionWithLama : inpaintCanvasRegionWithMigan;
      const repaired = await inpaintSingleFrameWithWatchdog(
        () => inpaint(frameCanvas, plan.selection, feather, (progress) => {
          onProgress?.({
            stage: 'model',
            label: progress.label,
            percent: mapProgressRange(progress.percent, 26, 38),
          });
        }),
        useLama
      );
      patchCanvas = extractSelectionPatch(repaired, plan.selection, feather);
    }

    if (!patchCanvas) {
      return createFailure('canvas_context');
    }

    throwIfAborted(signal);
    const videoBlob = await renderAndEncode({
      video: loaded,
      patchCanvas,
      selection: plan.selection,
      onProgress,
      signal,
    });

    throwIfAborted(signal);
    let finalBlob = videoBlob;
    let hasAudio = false;
    try {
      onProgress?.({ stage: 'audio', label: 'audio-mux', percent: AUDIO_PROGRESS_START });
      finalBlob = await muxOriginalAudio(videoBlob, file, onProgress, signal);
      hasAudio = true;
    } catch (error) {
      if (isCancellation(error)) {
        return createFailure('cancelled');
      }
      // 音轨回填失败时降级为无声视频，不算整体失败
      finalBlob = videoBlob;
      hasAudio = false;
    }

    throwIfAborted(signal);
    onProgress?.({ stage: 'done', label: 'done', percent: 100 });

    return {
      ok: true,
      blob: finalBlob,
      filename: createOutputFilename(file.name),
      width: loaded.width,
      height: loaded.height,
      durationMs: Math.round(performance.now() - startedAt),
      outputSize: finalBlob.size,
      method: appliedMethod,
      hasAudio,
    };
  } catch (error) {
    if (isCancellation(error)) {
      return createFailure('cancelled');
    }
    const code = (error as { code?: import('./video-watermark').VideoWatermarkErrorCode })?.code;
    return createFailure(
      typeof code === 'string' ? code : 'general',
      error instanceof Error ? error.message : undefined
    );
  } finally {
    if (loaded) {
      loaded.video.pause();
      loaded.video.removeAttribute('src');
      loaded.video.remove();
      URL.revokeObjectURL(loaded.url);
    }
  }
}
