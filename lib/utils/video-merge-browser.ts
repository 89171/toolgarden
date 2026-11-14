import { demuxMp4Video } from './mp4-demux';
import { loadFfmpeg } from './audio-browser';
import { muxWithPreparedAudio, prepareAudioTrack } from './video-audio-track';
import {
  isIsoBmffSource,
  loadVideoElement,
  pickVideoCodec,
  seekVideoTo,
  type LoadedVideo,
} from './video-reencode-browser';
import {
  computeMergeOutputSize,
  computeFitRect,
  createMergedFilename,
  mapMergeProgress,
  validateMergeFiles,
  MERGE_MAX_DURATION_SECONDS,
  MERGE_MAX_TOTAL_DURATION_SECONDS,
  type VideoMergeProgress,
  type VideoMergeResult,
} from './video-merge';
import {
  REENCODE_FRAMERATE,
  computeTargetBitrate,
  AUDIO_BITRATE_BY_QUALITY,
  type ReencodeQuality,
} from './video-reencode';

/**
 * 视频合并 — 浏览器管线。
 *
 * 与单文件重编码（video-reencode-browser.ts）的区别：
 * - 所有片段共用一个 VideoEncoder + mp4-muxer，时间戳跨片段连续递增，
 *   因此不需要先导出片段再拼接，也避免了二次封装。
 * - 输出分辨率统一为第一个视频的尺寸，其余画面等比缩放居中（信箱黑边）。
 * - 音轨逐段抽出并对齐到该段视频时长（apad/-t），最后 concat 成一条音轨回填；
 *   无音轨的段落用 anullsrc 生成等长静音，保证后续段落声画对齐。
 *
 * 全程在浏览器本地完成，视频不会上传到任何服务器。
 */

export interface MergeVideosOptions {
  quality: ReencodeQuality;
  onProgress?: (progress: VideoMergeProgress) => void;
  signal?: AbortSignal;
}

interface SegmentAudio {
  status: 'none' | 'ready' | 'failed';
  blob?: Blob;
  /** 该段视频时长（秒），用于音轨对齐 */
  duration: number;
}

const RENDER_PROGRESS_START = 10;
const RENDER_PROGRESS_END = 82;
const AUDIO_PROGRESS_START = 84;
const AUDIO_PROGRESS_END = 98;
const KEYFRAME_INTERVAL_SECONDS = 2;
/** 每段开头强制关键帧，便于成片拖动与后续二次剪辑 */
const OUTPUT_FRAME_DURATION_US = 33_333;
const MAX_ENCODER_QUEUE_SIZE = 8;
const MAX_DECODER_QUEUE_SIZE = 16;
/** 解码路径把整个文件读进内存（解封装需要），超过该体积回退到播放路径 */
const DECODER_PATH_MAX_BYTES = 160 * 1024 * 1024;
const DEMUX_SLICE_BYTES = 8 * 1024 * 1024;

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

export async function mergeVideosToMp4(
  files: File[],
  options: MergeVideosOptions
): Promise<VideoMergeResult> {
  const startedAt = performance.now();
  const { quality, onProgress, signal } = options;
  const fileCount = files.length;

  const fileCheck = validateMergeFiles(files);
  if (!fileCheck.ok) {
    return { ok: false, code: fileCheck.code };
  }
  if (typeof VideoEncoder === 'undefined' || typeof HTMLVideoElement === 'undefined') {
    return { ok: false, code: 'unsupported_browser' };
  }

  const videos: LoadedVideo[] = [];
  try {
    onProgress?.({ stage: 'prepare', label: 'loading', percent: 2, currentFile: 0, fileCount });
    for (const file of files) {
      throwIfAborted(signal);
      const loaded = await loadVideoElement(file);
      if (loaded.duration > MERGE_MAX_DURATION_SECONDS) {
        return { ok: false, code: 'video_too_long' };
      }
      videos.push(loaded);
    }
    const totalDuration = videos.reduce((sum, item) => sum + item.duration, 0);
    if (totalDuration > MERGE_MAX_TOTAL_DURATION_SECONDS) {
      return { ok: false, code: 'total_too_long' };
    }

    const outputSize = computeMergeOutputSize(videos);
    const bitrate = computeTargetBitrate(outputSize.width, outputSize.height, quality);
    const encoderConfig = await pickVideoCodec(outputSize.width, outputSize.height, bitrate, REENCODE_FRAMERATE);
    if (!encoderConfig) {
      return { ok: false, code: 'unsupported_browser', detail: 'no H.264 encoder' };
    }

    const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: outputSize.width, height: outputSize.height },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset',
    });

    const canvas = document.createElement('canvas');
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    const context2d = canvas.getContext('2d', { alpha: false });
    if (!context2d) {
      return { ok: false, code: 'canvas_context' };
    }

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

    let lastEncodedUs = -1;
    let fatal: Error | null = null;

    /** 把当前 canvas 内容按连续时间戳编码进共享 muxer；每段开头由渲染器强制关键帧 */
    const encodeCanvasFrame = (timeUs: number, keyFrame: boolean): boolean => {
      if (fatal || encoderState.error) return false;
      try {
        const timestamp = Math.max(timeUs, lastEncodedUs + 1);
        lastEncodedUs = timestamp;
        const frame = new VideoFrame(canvas, { timestamp, duration: OUTPUT_FRAME_DURATION_US });
        encoder.encode(frame, { keyFrame });
        frame.close();
        return true;
      } catch (error) {
        fatal = error instanceof Error ? error : new Error(String(error));
        return false;
      }
    };

    const audioSegments: SegmentAudio[] = [];
    let accumulatedUs = 0;
    const audioBitrate = AUDIO_BITRATE_BY_QUALITY[quality];

    for (let index = 0; index < files.length; index += 1) {
      throwIfAborted(signal);
      if (fatal || encoderState.error) break;
      const file = files[index];
      const loaded = videos[index];
      const fileNumber = index + 1;
      const basePercent = mapMergeProgress(index / fileCount, RENDER_PROGRESS_START, RENDER_PROGRESS_END);
      const spanPercent = (RENDER_PROGRESS_END - RENDER_PROGRESS_START) / fileCount;
      const report = (percent: number) => {
        onProgress?.({
          stage: 'render',
          label: 'render',
          percent: Math.min(RENDER_PROGRESS_END, basePercent + spanPercent * Math.min(1, Math.max(0, percent / 100))),
          currentFile: fileNumber,
          fileCount,
        });
      };

      // 音轨与该段渲染并行；ffmpeg 是单实例，逐段串行启动避免 exec 重入
      const audioTask = prepareAudioTrack(file, null, audioBitrate, signal);
      void audioTask.catch(() => undefined);

      const fitRect = computeFitRect(loaded.width, loaded.height, outputSize.width, outputSize.height);
      const segmentStartUs = accumulatedUs;

      // 首选 WebCodecs 解码路径：MP4/MOV 容器且体积在内存预算内时远快于实时
      let decoded = false;
      if (isIsoBmffSource(file) && file.size <= DECODER_PATH_MAX_BYTES) {
        try {
          decoded = await renderSegmentViaDecoder({
            file,
            fitRect,
            outputWidth: outputSize.width,
            outputHeight: outputSize.height,
            segmentStartUs,
            segmentDurationSeconds: loaded.duration,
            context2d,
            encodeFrame: encodeCanvasFrame,
            encoderQueueProbe: () => encoder.encodeQueueSize,
            report,
            signal,
          });
          if (fatal) throw fatal;
          if (encoderState.error) throw encoderState.error;
        } catch (error) {
          if (isCancellation(error)) throw error;
          decoded = false;
        }
      }

      if (!decoded) {
        await renderSegmentViaPlayback({
          loaded,
          fitRect,
          outputWidth: outputSize.width,
          outputHeight: outputSize.height,
          segmentStartUs,
          segmentDurationSeconds: loaded.duration,
          context2d,
          encodeFrame: encodeCanvasFrame,
          encoderQueueProbe: () => encoder.encodeQueueSize,
          report,
          signal,
        });
      }
      throwIfAborted(signal);
      if (fatal) throw fatal;
      if (encoderState.error) throw encoderState.error;

      const audio = await audioTask;
      throwIfAborted(signal);
      audioSegments.push({
        status: audio.status,
        blob: audio.status === 'ready' ? audio.blob : undefined,
        duration: loaded.duration,
      });
      accumulatedUs += Math.round(loaded.duration * 1_000_000);
    }

    if (fatal) throw fatal;
    if (encoderState.error) throw encoderState.error;
    if (lastEncodedUs < 0) {
      return { ok: false, code: 'encode_failed', detail: 'no frames encoded' };
    }

    await encoder.flush();
    if (encoderState.error) throw encoderState.error;
    encoder.close();
    muxer.finalize();
    const silentBlob = new Blob([target.buffer], { type: 'video/mp4' });

    let finalBlob = silentBlob;
    let hasAudio = false;
    const allSilent = audioSegments.every((segment) => segment.status === 'none');
    if (!allSilent) {
      onProgress?.({ stage: 'audio', label: 'muxing', percent: AUDIO_PROGRESS_START, currentFile: fileCount, fileCount });
      const audioBlob = await concatSegmentAudio(audioSegments, audioBitrate, signal).catch((error) => {
        if (isCancellation(error)) throw error;
        return null;
      });
      if (audioBlob) {
        const muxed = await muxWithPreparedAudio(silentBlob, audioBlob, signal, (label, percent) => {
          onProgress?.({
            stage: 'audio',
            label,
            percent: mapMergeProgress(percent, AUDIO_PROGRESS_START, AUDIO_PROGRESS_END),
            currentFile: fileCount,
            fileCount,
          });
        });
        if (muxed) {
          finalBlob = muxed;
          hasAudio = true;
        }
      }
    }

    onProgress?.({ stage: 'done', label: 'done', percent: 100, currentFile: fileCount, fileCount });
    return {
      ok: true,
      blob: finalBlob,
      filename: createMergedFilename(files),
      width: outputSize.width,
      height: outputSize.height,
      durationMs: Math.round(performance.now() - startedAt),
      outputSize: finalBlob.size,
      segmentCount: files.length,
      hasAudio,
    };
  } catch (error) {
    if (isCancellation(error)) {
      return { ok: false, code: 'cancelled' };
    }
    return {
      ok: false,
      code: 'encode_failed',
      detail: error instanceof Error ? error.message : undefined,
    };
  } finally {
    for (const loaded of videos) {
      try {
        loaded.video.pause();
        loaded.video.removeAttribute('src');
        loaded.video.remove();
        URL.revokeObjectURL(loaded.url);
      } catch {
        // 清理失败不影响结果
      }
    }
  }
}

/* ────────────────────────────── 单段渲染：WebCodecs 解码路径 ────────────────────────────── */

interface SegmentRenderArgs {
  file?: File;
  loaded?: LoadedVideo;
  fitRect: { x: number; y: number; width: number; height: number };
  outputWidth: number;
  outputHeight: number;
  segmentStartUs: number;
  /** 该段视频时长（秒），用于渲染进度百分比 */
  segmentDurationSeconds: number;
  context2d: CanvasRenderingContext2D;
  encodeFrame: (timeUs: number, keyFrame: boolean) => boolean;
  /** 读取共享编码器队列长度，用于背压控制 */
  encoderQueueProbe: () => number;
  report: (percent: number) => void;
  signal?: AbortSignal;
}

/** 解封装 → 解码 → 缩放居中 → 编码。返回 false 表示该素材不适合解码路径（调用方回退播放路径） */
async function renderSegmentViaDecoder(args: SegmentRenderArgs): Promise<boolean> {
  const { file, fitRect, outputWidth, outputHeight, segmentStartUs, segmentDurationSeconds, context2d, encodeFrame, encoderQueueProbe, report, signal } = args;
  if (!file) return false;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      const error = new Error('cancelled');
      error.name = 'AbortError';
      throw error;
    }
  };

  let decoder: VideoDecoder | null = null;
  const readDecoder = (): VideoDecoder | null => decoder;

  try {
    const buffer = await file.arrayBuffer();
    throwIfAborted();

    const pending: EncodedVideoChunk[] = [];
    let firstTimestampUs: number | null = null;
    let emittedFrames = 0;
    let fatal: Error | null = null;

    const drawAndEncode = (frame: VideoFrame) => {
      try {
        if (fatal) return;
        if (firstTimestampUs === null) firstTimestampUs = frame.timestamp;
        const relativeUs = Math.max(0, frame.timestamp - firstTimestampUs);
        context2d.fillStyle = '#000000';
        context2d.fillRect(0, 0, outputWidth, outputHeight);
        context2d.drawImage(frame, 0, 0, frame.displayWidth, frame.displayHeight, fitRect.x, fitRect.y, fitRect.width, fitRect.height);
        const keyFrame = encodeFrame(segmentStartUs + relativeUs, relativeUs === 0);
        if (!keyFrame) {
          fatal = new Error('encoder rejected frame');
          return;
        }
        emittedFrames += 1;
        const spanSeconds = Math.max(0.1, segmentDurationSeconds);
        report(Math.min(99, ((relativeUs / 1_000_000) / spanSeconds) * 100));
      } finally {
        frame.close();
      }
    };

    const drainSamples = async () => {
      const instance = decoder;
      if (!instance) return;
      while (pending.length > 0) {
        throwIfAborted();
        if (fatal) throw fatal;
        if (instance.decodeQueueSize > MAX_DECODER_QUEUE_SIZE) {
          await new Promise<void>((resolve) => {
            instance.addEventListener('dequeue', () => resolve(), { once: true });
          });
          continue;
        }
        if (encoderQueueProbe() > MAX_ENCODER_QUEUE_SIZE) {
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
        onConfig: (config) => {
          const nextDecoder = new VideoDecoder({
            output: drawAndEncode,
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
      { sliceBytes: DEMUX_SLICE_BYTES }
    );
    if (demux.emittedSamples === 0) return false;
    await drainSamples();

    const activeDecoder = readDecoder();
    if (!activeDecoder) return false;
    await activeDecoder.flush();
    if (fatal) throw fatal;
    return emittedFrames > 0;
  } catch (error) {
    if (isCancellation(error)) throw error;
    return false;
  } finally {
    try { readDecoder()?.close(); } catch { /* noop */ }
  }
}

/* ────────────────────────────── 单段渲染：实时播放路径（回退） ────────────────────────────── */

interface PlaybackRenderArgs extends Omit<SegmentRenderArgs, 'file'> {
  loaded: LoadedVideo;
}

async function renderSegmentViaPlayback(args: PlaybackRenderArgs): Promise<void> {
  const { loaded, fitRect, outputWidth, outputHeight, segmentStartUs, segmentDurationSeconds, context2d, encodeFrame, encoderQueueProbe, report, signal } = args;
  const source = loaded.video;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      const error = new Error('cancelled');
      error.name = 'AbortError';
      throw error;
    }
  };

  const encoderConfigSupport = typeof VideoEncoder !== 'undefined';
  if (!encoderConfigSupport) {
    throw Object.assign(new Error('WebCodecs VideoEncoder unavailable'), { name: 'EncodeError' });
  }

  source.pause();
  await seekVideoTo(source, 0);

  let settled = false;
  let previousTimestamp = -1;
  let relativeTime = 0;
  const lastFrameAt = { value: performance.now() };

  const scheduleNextFrame = (callback: (now: number, metadata: VideoFrameCallbackMetadata) => void) => {
    if (typeof source.requestVideoFrameCallback === 'function') {
      source.requestVideoFrameCallback(callback);
      return;
    }
    requestAnimationFrame((now) => {
      callback(now, {
        mediaTime: source.currentTime,
        expectedDisplayTime: now + 1000 / 30,
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

    const stallTimer = window.setInterval(() => {
      if (settled) return;
      if (performance.now() - lastFrameAt.value > 15_000) {
        fail(new Error('render stalled: no frames received'));
      }
    }, 2000);

    const step = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (settled) return;
      try {
        throwIfAborted();
        lastFrameAt.value = performance.now();
        relativeTime = Math.max(0, metadata.mediaTime);

        context2d.fillStyle = '#000000';
        context2d.fillRect(0, 0, outputWidth, outputHeight);
        context2d.drawImage(source, 0, 0, source.videoWidth, source.videoHeight, fitRect.x, fitRect.y, fitRect.width, fitRect.height);

        const timestampUs = segmentStartUs + Math.round(relativeTime * 1_000_000);
        const keyFrame = previousTimestamp < 0 || relativeTime - previousTimestamp >= KEYFRAME_INTERVAL_SECONDS;
        if (!encodeFrame(timestampUs, keyFrame)) {
          fail(new Error('encoder rejected frame'));
          return;
        }
        previousTimestamp = relativeTime;

        const spanSeconds = Math.max(0.1, segmentDurationSeconds);
        report(Math.min(100, (relativeTime / spanSeconds) * 100));

        if (source.ended || metadata.mediaTime >= loaded.duration - 0.04) {
          finish();
          return;
        }
        const pump = () => {
          if (settled) return;
          if (encoderQueueProbe() > MAX_ENCODER_QUEUE_SIZE) {
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
    source.play().catch(() => fail(new Error('playback blocked')));
  });

  source.pause();
  source.onended = null;
}

/* ────────────────────────────── 音轨拼接 ────────────────────────────── */

/** 把各段音轨对齐到该段视频时长并 concat；无音轨段生成等长静音。失败返回 null（输出无声视频） */
async function concatSegmentAudio(
  segments: SegmentAudio[],
  bitrateKbps: number,
  signal?: AbortSignal
): Promise<Blob | null> {
  const writtenFiles: string[] = [];
  let ffmpeg: Awaited<ReturnType<typeof loadFfmpeg>> | null = null;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      const error = new Error('cancelled');
      error.name = 'AbortError';
      throw error;
    }
  };

  try {
    ffmpeg = await loadFfmpeg();
    throwIfAborted();

    const inputArgs: string[] = [];
    const concatLabels: string[] = [];
    let inputIndex = 0;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      throwIfAborted();
      if (segment.status === 'ready' && segment.blob) {
        const sourceName = `merge-audio-src-${index}.m4a`;
        const normalizedName = `merge-audio-norm-${index}.m4a`;
        await ffmpeg.writeFile(sourceName, new Uint8Array(await segment.blob.arrayBuffer()));
        writtenFiles.push(sourceName);
        // apad 补齐 + -t 截断，把音轨精确对齐到该段视频时长；统一 44.1kHz 立体声便于 concat
        await ffmpeg.exec([
          '-i', sourceName,
          '-af', 'apad',
          '-t', segment.duration.toFixed(3),
          '-ar', '44100',
          '-ac', '2',
          '-c:a', 'aac',
          '-b:a', `${bitrateKbps}k`,
          normalizedName,
        ]);
        writtenFiles.push(normalizedName);
        inputArgs.push('-i', normalizedName);
      } else {
        inputArgs.push('-f', 'lavfi', '-t', segment.duration.toFixed(3), '-i', 'anullsrc=r=44100:cl=stereo');
      }
      concatLabels.push(`[${inputIndex}:a]`);
      inputIndex += 1;
    }

    const outputName = 'merge-audio-all.m4a';
    await ffmpeg.exec([
      ...inputArgs,
      '-filter_complex', `${concatLabels.join('')}concat=n=${segments.length}:v=0:a=1[a]`,
      '-map', '[a]',
      '-c:a', 'aac',
      '-b:a', `${bitrateKbps}k`,
      '-movflags', '+faststart',
      outputName,
    ]);
    writtenFiles.push(outputName);
    throwIfAborted();

    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string' || data.byteLength < 512) {
      return null;
    }
    return new Blob([new Uint8Array(data)], { type: 'audio/mp4' });
  } catch (error) {
    if (isCancellation(error)) throw error;
    return null;
  } finally {
    if (ffmpeg) {
      await Promise.allSettled(writtenFiles.map((name) => ffmpeg!.deleteFile(name)));
    }
  }
}
