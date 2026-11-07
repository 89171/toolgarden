import { loadFfmpeg } from './audio-browser';
import { demuxMp4Video } from './mp4-demux';
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
 * 两条采样路径：
 * A. 解码路径（首选，MP4/MOV + H.264）：mp4box.js 解封装 → WebCodecs VideoDecoder
 *    一次性顺序解码，按目标帧率对齐采样时间点，边解码边量化编码（内存只保留单帧）。
 * B. seek 路径（回退）：逐帧 seek + drawImage 确定性采样，用于 WebM 等其他容器。
 *
 * 两条路径都按目标帧率确定性取帧，无音轨概念，也不依赖实时播放。
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
/** 解码路径把整个文件读进内存（解封装需要），超过该体积回退到 seek 路径 */
const DECODER_PATH_MAX_BYTES = 160 * 1024 * 1024;
const DEMUX_SLICE_BYTES = 8 * 1024 * 1024;
const MAX_DECODER_QUEUE_SIZE = 16;

/** 判断是否 ISO BMFF（MP4/MOV）容器：只有这类素材能走 mp4box 解封装路径 */
function isIsoBmffSource(file: File): boolean {
  const extension = (/\.([a-z0-9]{2,5})$/i.exec(file.name)?.[1] ?? '').toLowerCase();
  if (extension === 'mp4' || extension === 'm4v' || extension === 'mov') return true;
  return /^video\/(mp4|quicktime)$/i.test(file.type);
}

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
 * 解码路径采样（首选）：mp4box 解封装 → VideoDecoder 顺序解码 →
 * 按采样时间点对齐帧，边解码边量化编码。解码一次代替逐帧 seek，
 * 硬件解码下速度大幅领先；内存峰值只有单帧 RGBA。
 * 返回 null 表示素材不适合或处理失败，调用方回退 seek 路径（取消除外）。
 */
async function tryRenderGifViaDecoder(context: {
  file: File;
  plan: { timestamps: number[]; width: number; height: number; delayMs: number };
  start: number;
  end: number;
  onProgress?: (progress: VideoGifProgress) => void;
  signal?: AbortSignal;
}): Promise<Blob | null> {
  const { file, plan, start, end, onProgress, signal } = context;
  if (typeof VideoDecoder === 'undefined') return null;
  if (!isIsoBmffSource(file)) return null;
  if (file.size > DECODER_PATH_MAX_BYTES) return null;

  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const gifEncoder = GIFEncoder();

  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;
  const context2d = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!context2d) return null;

  const sampleTimesUs = plan.timestamps.map((time) => Math.round(time * 1_000_000));
  const totalFrames = sampleTimesUs.length;

  let decoder: VideoDecoder | null = null;
  /** 经函数读取可避免 TS 把「只在回调里赋值」的变量窄化成 null */
  const readDecoder = (): VideoDecoder | null => decoder;
  let writtenFrames = 0;
  let nextSampleIndex = 0;
  let fatal: Error | null = null;
  /** 已收尾：解码器的 output 回调不得再写 GIF 或进度（回退 seek 后尤其重要） */
  let disposed = false;
  /** 唤醒正在等待 dequeue 的 drainSamples，避免解码器收尾后永久挂起 */
  let wakeDrain: (() => void) | null = null;
  const notifyDrain = () => {
    const wake = wakeDrain;
    wakeDrain = null;
    wake?.();
  };

  /** 把当前画布内容量化并写入 GIF（每帧局部调色板） */
  const writeFrameFromCanvas = () => {
    throwIfAborted(signal);
    const { data } = context2d.getImageData(0, 0, plan.width, plan.height);
    const palette = quantize(data, 256);
    const indexed = applyPalette(data, palette);
    gifEncoder.writeFrame(indexed, plan.width, plan.height, {
      palette,
      delay: plan.delayMs,
      first: writtenFrames === 0,
    });
    writtenFrames += 1;
    onProgress?.({
      stage: 'sample',
      label: 'sampling',
      percent:
        SAMPLE_PROGRESS_START +
        ((SAMPLE_PROGRESS_END - SAMPLE_PROGRESS_START) * writtenFrames) / totalFrames,
    });
  };

  try {
    const buffer = await file.arrayBuffer();
    throwIfAborted(signal);

    const pending: EncodedVideoChunk[] = [];
    const drainSamples = async () => {
      const instance = decoder;
      if (!instance || disposed) return;
      while (pending.length > 0) {
        if (disposed) return;
        throwIfAborted(signal);
        if (fatal) throw fatal;
        if (instance.decodeQueueSize > MAX_DECODER_QUEUE_SIZE) {
          // 队列拥塞时等 dequeue，但解码器报错 / 任务取消 / 已收尾时不一定还会
          // 派发 dequeue。同时监听这些信号并用短超时轮询兜底，避免永久挂起。
          await new Promise<void>((resolve) => {
            let settled = false;
            const finish = () => {
              if (settled) return;
              settled = true;
              instance.removeEventListener('dequeue', finish);
              signal?.removeEventListener('abort', finish);
              if (wakeDrain === finish) wakeDrain = null;
              resolve();
            };
            instance.addEventListener('dequeue', finish, { once: true });
            signal?.addEventListener('abort', finish, { once: true });
            // 250ms 兜底轮询：即使 dequeue 不再派发也会重新检查 fatal / 取消；
            // finish 幂等，超时触发时多半已被 dequeue 唤醒，多一次空转无副作用。
            setTimeout(finish, 250);
            wakeDrain = finish;
          });
          continue;
        }
        const chunk = pending.shift();
        if (!chunk) break;
        instance.decode(chunk);
      }
    };

    await demuxMp4Video(
      buffer,
      {
        onConfig: (config) => {
          const nextDecoder = new VideoDecoder({
            output: (frame) => {
              try {
                if (disposed || fatal) return;
                // 解码器按显示顺序输出；取「采样时间点处或之后的第一帧」。
                // 同一帧可能对应多个相邻采样点，画面只画一次。
                let captured = false;
                while (
                  nextSampleIndex < sampleTimesUs.length &&
                  frame.timestamp >= sampleTimesUs[nextSampleIndex]
                ) {
                  if (!captured) {
                    context2d.drawImage(frame, 0, 0, plan.width, plan.height);
                    captured = true;
                  }
                  writeFrameFromCanvas();
                  nextSampleIndex += 1;
                }
              } catch (error) {
                fatal = error instanceof Error ? error : new Error(String(error));
                notifyDrain();
              } finally {
                frame.close();
              }
            },
            error: (error) => {
              fatal = error instanceof Error ? error : new Error(String(error));
              notifyDrain();
            },
          });
          nextDecoder.configure({
            codec: config.codec,
            codedWidth: config.codedWidth,
            codedHeight: config.codedHeight,
            description: config.description,
            optimizeForLatency: true,
          });
          decoder = nextDecoder;
        },
        onBatch: async (samples) => {
          for (const sample of samples) {
            pending.push(new EncodedVideoChunk({
              type: sample.isKey ? 'key' : 'delta',
              timestamp: sample.timestampUs,
              duration: sample.durationUs,
              data: sample.data,
            }));
          }
          await drainSamples();
        },
      },
      { rangeUs: { start: Math.round(start * 1_000_000), end: Math.round(end * 1_000_000) }, sliceBytes: DEMUX_SLICE_BYTES }
    );
    await drainSamples();
    if (fatal) throw fatal;
    throwIfAborted(signal);

    // H.264 有 B 帧时解码器会缓存一个重排序队列；不 flush 末尾若干帧不会
    // 派发 output，GIF 就丢尾帧，且尾部补齐用的是过期画布。
    const activeDecoder = readDecoder();
    if (activeDecoder && activeDecoder.state === 'configured') {
      await activeDecoder.flush();
    }
    if (fatal) throw fatal;
    if (writtenFrames === 0) return null;

    // 区间尾部采样点晚于最后一帧时（常见于 end 贴近片尾），用最后一帧画面补齐
    while (nextSampleIndex < sampleTimesUs.length) {
      writeFrameFromCanvas();
      nextSampleIndex += 1;
    }

    gifEncoder.finish();
    const bytes = gifEncoder.bytes();
    if (bytes.byteLength < 512) return null;
    return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
  } catch (error) {
    if (isCancellation(error)) throw error;
    return null;
  } finally {
    // 无论成功、失败、取消还是回退，都必须关闭解码器：释放硬件解码资源，
    // 同时让 disposed 阻止后续 output 回调继续写 GIF / 进度条。
    disposed = true;
    notifyDrain();
    const instance = readDecoder();
    decoder = null;
    if (instance && instance.state !== 'closed') {
      try {
        instance.close();
      } catch {
        // 解码器可能已被引擎关闭
      }
    }
  }
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

    // 首选解码路径（快于逐帧 seek）；不适用或失败时回退 seek 路径。
    // 取消要向上传播，不能当成「回退」吞掉。
    const viaDecoder = await tryRenderGifViaDecoder({
      file: sourceFile,
      plan,
      start,
      end,
      onProgress,
      signal,
    }).catch((error) => {
      if (isCancellation(error)) throw error;
      return null;
    });
    if (viaDecoder) {
      onProgress?.({ stage: 'encode', label: 'encode', percent: ENCODE_PROGRESS_START });
      onProgress?.({ stage: 'done', label: 'done', percent: 100 });
      return {
        ok: true,
        blob: viaDecoder,
        filename: createGifFilename(file.name),
        width: plan.width,
        height: plan.height,
        frameCount: plan.timestamps.length,
        durationMs: Math.round(performance.now() - startedAt),
        outputSize: viaDecoder.size,
      };
    }

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
