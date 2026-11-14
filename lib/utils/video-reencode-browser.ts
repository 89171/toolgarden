import type { AudioProcessingProgress } from './audio';
import { demuxMp4Video } from './mp4-demux';
import { loadFfmpeg } from './audio-browser';
import { muxWithPreparedAudio, prepareAudioTrack } from './video-audio-track';
import {
  clampTrimRange,
  computeOutputSize,
  computeTargetBitrate,
  computeTransformedSize,
  createReencodeFilename,
  isIdentityTransform,
  mapReencodeProgress,
  REENCODE_FRAMERATE,
  REENCODE_MAX_DURATION_SECONDS,
  validateReencodeFile,
  AUDIO_BITRATE_BY_QUALITY,
  type ReencodeQuality,
  type VideoReencodeProgress,
  type VideoReencodeResult,
  type VideoTransform,
} from './video-reencode';

/**
 * 视频重编码共享管线（视频压缩 / 视频截取 / 视频画面裁剪）。
 *
 * 两条渲染路径：
 * A. 解码路径（首选）：mp4box.js 解封装 MP4/MOV → WebCodecs VideoDecoder 解码 →
 *    VideoEncoder 重编码。不受实时播放限制，处理速度取决于 CPU/硬件编码器。
 * B. 播放路径（回退）：video 元素实时播放 + requestVideoFrameCallback 抓帧。
 *    用于 WebM 等非 MP4 容器、解码器不支持该编码（HEVC/AV1）、或文件过大时。
 *
 * 音轨处理与视频渲染并行：渲染开始时同步用 ffmpeg.wasm 抽取音频（AAC 源直接流复制），
 * 渲染结束后只做一次流复制封装（-c copy），不再串行等待音频重编码。
 *
 * 全程在浏览器本地完成，视频不会上传到任何服务器。
 */

export interface ReencodeOptions {
  quality: ReencodeQuality;
  /** 输出分辨率长边上限（px），null 或 0 表示保持原分辨率 */
  maxLongSide?: number | null;
  /** 截取区间（秒），null 表示全片 */
  trim?: { start: number; end: number } | null;
  /** 画面裁剪区域（源视频像素坐标），null 表示保留完整画面 */
  crop?: { x: number; y: number; width: number; height: number } | null;
  /** 几何变换（旋转 / 翻转），null 或恒等表示不改变画面方向 */
  transform?: VideoTransform | null;
  /** 输出文件名后缀（不含扩展名） */
  suffix: string;
  onProgress?: (progress: VideoReencodeProgress) => void;
  signal?: AbortSignal;
}

export interface LoadedVideo {
  video: HTMLVideoElement;
  url: string;
  width: number;
  height: number;
  duration: number;
}

type PixelRect = { x: number; y: number; width: number; height: number };

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
const RENDER_PROGRESS_END = 88;
const MUX_PROGRESS_START = 90;
const MUX_PROGRESS_END = 99;
const KEYFRAME_INTERVAL_SECONDS = 2;
const MAX_ENCODER_QUEUE_SIZE = 8;
const MAX_DECODER_QUEUE_SIZE = 16;
/** 解码路径把整个文件读进内存（解封装需要），超过该体积回退到播放路径 */
const DECODER_PATH_MAX_BYTES = 160 * 1024 * 1024;
/** 解封装时每次喂给 mp4box 的切片大小，切片之间让解码队列有机会排空 */
const DEMUX_SLICE_BYTES = 8 * 1024 * 1024;

/**
 * 尽力探测视频是否包含音轨（在一段真实播放之后调用才可靠）。
 * 明确无音轨时可以完全跳过 ffmpeg.wasm 回填，直接输出无声视频。
 * 无法判断时返回 false（保守走回填路径）。
 */
export function detectNoAudio(video: HTMLVideoElement): boolean {
  const probe = video as HTMLVideoElement & {
    mozHasAudio?: boolean;
    webkitAudioDecodedByteCount?: number;
    audioTracks?: { length: number };
  };
  if (typeof probe.mozHasAudio === 'boolean') return !probe.mozHasAudio;
  if (typeof probe.webkitAudioDecodedByteCount === 'number') {
    return probe.webkitAudioDecodedByteCount === 0;
  }
  if (probe.audioTracks) return probe.audioTracks.length === 0;
  return false;
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

function getFileExtension(name: string): string {
  return (/\.([a-z0-9]{2,5})$/i.exec(name)?.[1] ?? 'mp4').toLowerCase();
}

/** 判断是否 ISO BMFF（MP4/MOV）容器：只有这类素材能走 mp4box 解封装路径 */
export function isIsoBmffSource(file: File): boolean {
  const extension = getFileExtension(file.name);
  if (extension === 'mp4' || extension === 'm4v' || extension === 'mov') return true;
  return /^video\/(mp4|quicktime)$/i.test(file.type);
}

/** 加载视频元素并返回尺寸与时长元数据；元素挂在屏幕外的真实 DOM 上以保证帧可用 */
export function loadVideoElement(file: File): Promise<LoadedVideo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    // 挂载到屏幕外的真实 DOM：部分浏览器（如 Safari）对不在文档中的视频
    // 不呈现帧、也不派发 requestVideoFrameCallback，必须真实参与渲染。
    video.setAttribute('aria-hidden', 'true');
    video.style.position = 'fixed';
    video.style.left = '-10000px';
    video.style.top = '0';
    video.style.width = '320px';
    video.style.height = '180px';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);

    const cleanupAndReject = (code: import('./video-reencode').VideoReencodeErrorCode, detail?: string) => {
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

/**
 * 定位到指定时间。两个关键点：
 * 1. 同值守卫：目标时间与当前播放头一致时（典型：从 0 开始压缩/截取），
 *    设置 currentTime 不会触发 seeked 事件，必须直接返回，否则永远挂起。
 * 2. 超时兜底：个别环境下 seek 事件可能丢失，超时后继续流程而不是卡死。
 */
export function seekVideoTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Math.abs(video.currentTime - time) < 0.001) {
      resolve();
      return;
    }
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(createFailureError('video_load_failed'));
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

export async function pickVideoCodec(
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

/* ────────────────────────────── 音轨（并行预处理，共享实现见 video-audio-track.ts） ────────────────────────────── */

/** 兜底音轨回填：视频 + 源文件直接合成并按区间裁剪音轨（失败时输出无声视频） */
async function muxAudioFromSource(
  videoBlob: Blob,
  sourceFile: File,
  audioBitrateKbps: number,
  trim: { start: number; end: number } | null,
  onProgress?: (progress: VideoReencodeProgress) => void,
  signal?: AbortSignal
): Promise<{ blob: Blob; hasAudio: boolean }> {
  const silentName = 'reencode-silent.mp4';
  const sourceName = `reencode-source.${getFileExtension(sourceFile.name)}`;
  const outputName = 'reencode-output.mp4';
  let ffmpeg: Awaited<ReturnType<typeof loadFfmpeg>> | null = null;

  try {
    ffmpeg = await loadFfmpeg((progress: AudioProcessingProgress) => {
      onProgress?.({
        stage: 'audio',
        label: progress.label,
        percent: mapReencodeProgress(progress.percent, MUX_PROGRESS_START, MUX_PROGRESS_END),
      });
    });
    throwIfAborted(signal);

    await ffmpeg.writeFile(silentName, new Uint8Array(await videoBlob.arrayBuffer()));
    await ffmpeg.writeFile(sourceName, new Uint8Array(await sourceFile.arrayBuffer()));
    throwIfAborted(signal);

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
    // 音轨处理失败（含 ffmpeg 加载/写入失败）不致命：输出无声视频
    return { blob: videoBlob, hasAudio: false };
  } finally {
    if (ffmpeg) {
      await Promise.allSettled([
        ffmpeg.deleteFile(silentName),
        ffmpeg.deleteFile(sourceName),
        ffmpeg.deleteFile(outputName),
      ]);
    }
  }
}

/* ────────────────────────────── 渲染输出尺寸 ────────────────────────────── */

interface RenderContext {
  video: LoadedVideo;
  range: { start: number; end: number };
  outputWidth: number;
  outputHeight: number;
  /** 源画面采样区域（像素），null 表示整幅画面 */
  crop: PixelRect | null;
  /** 几何变换（旋转 / 翻转），null 表示不改变方向 */
  transform: VideoTransform | null;
  bitrate: number;
  onProgress?: (progress: VideoReencodeProgress) => void;
  signal?: AbortSignal;
}

/**
 * 从解码帧直接产出目标帧：
 * - 无裁剪且无变换时原帧直通（零拷贝快路径）
 * - 有裁剪时优先硬件 visibleRect 裁剪缩放
 * - 有旋转 / 翻转时必须经 canvas 合成（visibleRect 无法表达几何变换）
 */
function createOutputFrame(
  frame: VideoFrame,
  crop: PixelRect | null,
  transform: VideoTransform | null,
  outputWidth: number,
  outputHeight: number,
  canvas: HTMLCanvasElement | null,
  context2d: CanvasRenderingContext2D | null
): VideoFrame {
  const transformed = Boolean(transform && !isIdentityTransform(transform));
  if (!crop && !transformed) return frame;
  // 仅裁剪（无几何变换）时优先走硬件 visibleRect 路径：解码器内直接完成裁剪与缩放
  if (crop && !transformed) {
    try {
      return new VideoFrame(frame, {
        visibleRect: { x: crop.x, y: crop.y, width: crop.width, height: crop.height },
        displayWidth: outputWidth,
        displayHeight: outputHeight,
      });
    } catch {
      // 部分平台不支持 visibleRect，回退 canvas 合成
    }
  }
  if (!canvas || !context2d) return frame;
  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.width ?? frame.displayWidth;
  const sh = crop?.height ?? frame.displayHeight;
  // 源画面按 oriented 尺寸 → 输出尺寸的统一比例缩放，maxLongSide 降分辨率时不会溢出画布
  const oriented = transformed && transform
    ? computeTransformedSize(sw, sh, transform.rotation)
    : { width: sw, height: sh };
  const scale = outputWidth / Math.max(1, oriented.width);
  const dw = sw * scale;
  const dh = sh * scale;
  context2d.fillStyle = '#000000';
  context2d.fillRect(0, 0, outputWidth, outputHeight);
  context2d.save();
  context2d.translate(outputWidth / 2, outputHeight / 2);
  if (transformed && transform) {
    context2d.rotate((transform.rotation * Math.PI) / 180);
    context2d.scale(transform.flipHorizontal ? -1 : 1, transform.flipVertical ? -1 : 1);
  }
  context2d.drawImage(frame, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  context2d.restore();
  return new VideoFrame(canvas, { timestamp: frame.timestamp });
}

/** 播放路径的帧合成：与 createOutputFrame 同一套变换逻辑，源换成 video 元素 */
function drawPlaybackFrame(
  context2d: CanvasRenderingContext2D,
  source: HTMLVideoElement,
  crop: PixelRect | null,
  transform: VideoTransform | null,
  outputWidth: number,
  outputHeight: number
): void {
  if (!crop && isIdentityTransform(transform)) {
    context2d.drawImage(source, 0, 0, outputWidth, outputHeight);
    return;
  }
  const transformed = Boolean(transform && !isIdentityTransform(transform));
  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.width ?? source.videoWidth;
  const sh = crop?.height ?? source.videoHeight;
  // 与 createOutputFrame 相同：按 oriented → 输出的统一比例缩放，避免 maxLongSide 降分辨率时溢出
  const oriented = transformed && transform
    ? computeTransformedSize(sw, sh, transform.rotation)
    : { width: sw, height: sh };
  const scale = outputWidth / Math.max(1, oriented.width);
  const dw = sw * scale;
  const dh = sh * scale;
  context2d.fillStyle = '#000000';
  context2d.fillRect(0, 0, outputWidth, outputHeight);
  context2d.save();
  context2d.translate(outputWidth / 2, outputHeight / 2);
  if (transformed && transform) {
    context2d.rotate((transform.rotation * Math.PI) / 180);
    context2d.scale(transform.flipHorizontal ? -1 : 1, transform.flipVertical ? -1 : 1);
  }
  context2d.drawImage(source, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  context2d.restore();
}

/* ────────────────────────────── 路径 A：WebCodecs 解码 ────────────────────────────── */

/**
 * 解码路径：mp4box 逐片解封装 → VideoDecoder 解码 → 逐帧编码。
 * 返回 null 表示该素材不适合走解码路径（容器/编码不支持、体积过大、无可用帧），调用方应回退播放路径。
 */
async function renderWithVideoDecoder(context: RenderContext & { file: File }): Promise<Blob | null> {
  const { file, range, outputWidth, outputHeight, crop, transform, bitrate, onProgress, signal } = context;
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') return null;
  if (!isIsoBmffSource(file)) return null;
  if (file.size > DECODER_PATH_MAX_BYTES) return null;

  const { start, end } = range;
  const startUs = Math.round(start * 1_000_000);
  const endUs = Math.round(end * 1_000_000);
  const spanSeconds = Math.max(0.1, end - start);

  let decoder: VideoDecoder | null = null;
  let encoder: VideoEncoder | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let context2d: CanvasRenderingContext2D | null = null;
  /** 便于在 await 之后安全取回解码器实例（绕开 TS 的闭包窄化） */
  const readDecoder = (): VideoDecoder | null => decoder;

  try {
    onProgress?.({ stage: 'render', label: 'demux', percent: RENDER_PROGRESS_START });
    const buffer = await file.arrayBuffer();
    throwIfAborted(signal);

    const encoderConfig = await pickVideoCodec(outputWidth, outputHeight, bitrate, REENCODE_FRAMERATE);
    if (!encoderConfig) return null;

    const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: outputWidth, height: outputHeight },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset',
    });

    if (crop || !isIdentityTransform(transform)) {
      canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      context2d = canvas.getContext('2d', { alpha: false });
    }

    const encoderState: { error: Error | null } = { error: null };
    encoder = new VideoEncoder({
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

    const pending: EncodedVideoChunk[] = [];
    let encodedFrames = 0;
    let lastKeyAtUs = -Infinity;
    let lastEncodedUs = -1;
    let fatal: Error | null = null;

    const handleFrame = (frame: VideoFrame) => {
      try {
        if (fatal || encoderState.error) return;
        if (frame.timestamp < startUs - 1000 || frame.timestamp > endUs + 1000) return;
        // encoder 要求输入帧时间戳严格递增；解码器理论上按显示顺序输出，
        // 个别素材（异常 B 帧重排）仍可能回退，这里做单调化兜底而不是整段失败
        const timestamp = Math.max(frame.timestamp, lastEncodedUs + 1);
        lastEncodedUs = timestamp;
        const relativeUs = Math.max(0, timestamp - startUs);
        const output = createOutputFrame(frame, crop, transform, outputWidth, outputHeight, canvas, context2d);
        const keyFrame = relativeUs - lastKeyAtUs >= KEYFRAME_INTERVAL_SECONDS * 1_000_000;
        if (keyFrame) lastKeyAtUs = relativeUs;
        encoder!.encode(output, { keyFrame });
        if (output !== frame) output.close();
        encodedFrames += 1;
        onProgress?.({
          stage: 'render',
          label: 'decode',
          percent: mapReencodeProgress(
            Math.min(100, ((timestamp - startUs) / (spanSeconds * 1_000_000)) * 100),
            RENDER_PROGRESS_START,
            RENDER_PROGRESS_END
          ),
        });
      } catch (error) {
        fatal = error instanceof Error ? error : new Error(String(error));
      } finally {
        frame.close();
      }
    };

    const drainSamples = async () => {
      const instance = decoder;
      if (!instance) return;
      while (pending.length > 0) {
        throwIfAborted(signal);
        if (fatal || encoderState.error) {
          throw fatal ?? encoderState.error!;
        }
        if (instance.decodeQueueSize > MAX_DECODER_QUEUE_SIZE) {
          await new Promise<void>((resolve) => {
            const onDequeue = () => resolve();
            instance.addEventListener('dequeue', onDequeue, { once: true });
          });
          continue;
        }
        if (encoder!.encodeQueueSize > MAX_ENCODER_QUEUE_SIZE) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          continue;
        }
        const chunk = pending.shift();
        if (!chunk) break;
        instance.decode(chunk);
      }
    };

    const demux = await demuxMp4Video(
      buffer,
      {
        // 轨道信息就绪时立刻配置解码器（同步，随后样本才会开始产出）
        onConfig: (config) => {
          const nextDecoder = new VideoDecoder({
            output: handleFrame,
            error: (error) => {
              fatal = error instanceof Error ? error : new Error(String(error));
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
        // 每批样本塞进解码队列并排空，形成解封装 → 解码 → 编码的流水线
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
      { rangeUs: { start: startUs, end: endUs }, sliceBytes: DEMUX_SLICE_BYTES }
    );
    if (demux.emittedSamples === 0) return null;
    await drainSamples();

    if (fatal) throw fatal;
    if (encodedFrames === 0) return null;

    // 从运行时容器读回解码器实例：TS 的闭包窄化不会跨越 await 保持，
    // 这里显式取一次，既拿到真实实例也避免「narrowed to null」误报
    const activeDecoder = readDecoder();
    if (!activeDecoder) return null;
    await activeDecoder.flush();
    await encoder.flush();
    if (encoderState.error) throw encoderState.error;
    muxer.finalize();

    return new Blob([target.buffer], { type: 'video/mp4' });
  } catch (error) {
    if (isCancellation(error)) throw error;
    return null;
  } finally {
    try { readDecoder()?.close(); } catch { /* noop */ }
    try { encoder?.close(); } catch { /* noop */ }
  }
}

/* ────────────────────────────── 路径 B：实时播放抓帧（回退） ────────────────────────────── */

/** 播放并逐帧重编码（WebCodecs + mp4-muxer），只处理 [start, end] 区间 */
async function renderAndEncode(context: RenderContext): Promise<Blob> {
  const { video, range, outputWidth, outputHeight, crop, transform, bitrate, onProgress, signal } = context;
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
    // 首帧时间戳不一定精确为 0（截取起点 > 0、部分视频首帧 PTS 有偏移），
    // strict 模式会直接抛错导致整个输出失败，offset 模式自动归零。
    firstTimestampBehavior: 'offset',
  });

  const encoderState: { error: Error | null } = { error: null };
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try {
        muxer.addVideoChunk(chunk, meta);
      } catch (error) {
        // output 回调里的异常不会自动传播，必须显式记录，让渲染循环尽快失败并给出原因
        encoderState.error = error instanceof Error ? error : new Error(String(error));
      }
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
  await seekVideoTo(source, start);

  let lastKeyTime = -Infinity;
  let previousTimestamp = -1;
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
        expectedDisplayTime: now + 1000 / REENCODE_FRAMERATE,
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

      const step = (_now: number, metadata: VideoFrameCallbackMetadata) => {
        if (settled) return;
        try {
          throwIfAborted(signal);
          if (encoderState.error) {
            fail(encoderState.error);
            return;
          }
          lastFrameAt.value = performance.now();

          // 帧合成：裁剪 / 旋转 / 翻转统一走 drawPlaybackFrame，恒等时直通
          drawPlaybackFrame(context2d, source, crop, transform, outputWidth, outputHeight);

          const relativeTime = Math.max(0, metadata.mediaTime - start);
          const timestamp = Math.max(0, Math.round(relativeTime * 1_000_000));
          // 帧时长取相邻帧时间戳差。不能用 expectedDisplayTime - mediaTime：
          // 前者是文档时钟（页面打开起算的毫秒数），后者是媒体时钟，二者相减
          // 会得到巨大的无意义值，导致输出 MP4 的时长被声明成几个小时。
          const frameDuration = previousTimestamp >= 0
            ? Math.min(Math.max(1_000, timestamp - previousTimestamp), 1_000_000)
            : 33_333;
          previousTimestamp = timestamp;
          const frame = new VideoFrame(canvas, {
            timestamp,
            duration: frameDuration,
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

/* ────────────────────────────── 主入口 ────────────────────────────── */

/** 重编码主入口：返回判别联合结果，不抛异常 */
export async function reencodeVideoToMp4(
  file: File,
  options: ReencodeOptions
): Promise<VideoReencodeResult> {
  const startedAt = performance.now();
  const { quality, maxLongSide = null, trim = null, crop = null, transform = null, suffix, onProgress, signal } = options;

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

    // 裁剪输出时以区域尺寸为源尺寸；旋转 90°/270° 时宽高互换；码率与输出分辨率按最终画面计算
    const sourceWidth = crop ? crop.width : loaded.width;
    const sourceHeight = crop ? crop.height : loaded.height;
    const oriented = transform && !isIdentityTransform(transform)
      ? computeTransformedSize(sourceWidth, sourceHeight, transform.rotation)
      : { width: sourceWidth, height: sourceHeight };
    const size = computeOutputSize(oriented.width, oriented.height, maxLongSide);
    const bitrate = computeTargetBitrate(size.width, size.height, quality);
    onProgress?.({ stage: 'model', label: 'ready', percent: 12 });

    // ffmpeg 内核与音轨抽取决不阻塞视频渲染：内核提前预热（页面已预加载时是空操作），
    // 音轨抽取与渲染并行，渲染结束后只剩一次流复制封装。
    void loadFfmpeg().catch(() => undefined);
    const audioTask = prepareAudioTrack(file, range, AUDIO_BITRATE_BY_QUALITY[quality], signal);
    // 渲染阶段若先失败/被取消，这里不会再 await audioTask；挂一个空 catch 避免未处理拒绝
    void audioTask.catch(() => undefined);
    const context: RenderContext = {
      video: loaded,
      range: range ?? { start: 0, end: loaded.duration },
      outputWidth: size.width,
      outputHeight: size.height,
      crop,
      transform: transform && !isIdentityTransform(transform) ? transform : null,
      bitrate,
      onProgress,
      signal,
    };

    // 首选 WebCodecs 解码路径（快于实时）；不适用或失败时回退实时播放路径
    let videoBlob = await renderWithVideoDecoder({ ...context, file }).catch((error) => {
      if (isCancellation(error)) throw error;
      return null;
    });
    const usedDecoderPath = Boolean(videoBlob);
    if (!videoBlob) {
      videoBlob = await renderAndEncode(context);
    }
    throwIfAborted(signal);

    const audio = await audioTask;
    throwIfAborted(signal);

    // 播放路径下可以可靠判断无音轨，解码路径没有播放过程，只能依赖 ffmpeg 探测结果
    const definitelySilent = !usedDecoderPath && detectNoAudio(loaded.video);
    const filename = createReencodeFilename(file.name, suffix);

    const finish = (blob: Blob, hasAudio: boolean): VideoReencodeResult => {
      onProgress?.({ stage: 'done', label: 'done', percent: 100 });
      return {
        ok: true,
        blob,
        filename,
        width: size.width,
        height: size.height,
        durationMs: Math.round(performance.now() - startedAt),
        outputSize: blob.size,
        hasAudio,
      };
    };

    if (definitelySilent || audio.status === 'none') {
      return finish(videoBlob, false);
    }

    if (audio.status === 'ready') {
      const muxed = await muxWithPreparedAudio(videoBlob, audio.blob, signal, (label, percent) => {
        onProgress?.({ stage: 'audio', label, percent: mapReencodeProgress(percent, MUX_PROGRESS_START, MUX_PROGRESS_END) });
      });
      if (muxed) return finish(muxed, true);
      // 流复制封装失败时退回下面的源文件重编码路径
    }

    const { blob, hasAudio } = await muxAudioFromSource(
      videoBlob,
      file,
      AUDIO_BITRATE_BY_QUALITY[quality],
      range,
      onProgress,
      signal
    );
    return finish(blob, hasAudio);
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
      loaded.video.remove();
      URL.revokeObjectURL(loaded.url);
    }
  }
}
