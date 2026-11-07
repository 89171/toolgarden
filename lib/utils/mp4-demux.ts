/**
 * MP4（ISO BMFF）解封装 — 纯逻辑层，不依赖 DOM / WebCodecs。
 *
 * 用内置的 mp4box.js 逐片解析 MP4/MOV，把 H.264 样本按批次交给调用方，
 * 并重建 `VideoDecoder` 需要的 AVCDecoderConfigurationRecord（avcC description）。
 *
 * 之所以独立成模块：这段逻辑可以在 Node 里用真实 MP4 做回归测试，
 * 不必依赖浏览器解码器；浏览器侧只负责把样本映射为 EncodedVideoChunk。
 */

import type { Mp4BoxFile, Mp4Info, Mp4Sample, Mp4SampleEntry, Mp4VideoTrack } from '../vendor/mp4box/mp4box.all.js';

export interface DemuxedSample {
  /** 压缩样本数据（AVCC 长度前缀格式） */
  data: Uint8Array;
  /** 显示时间戳（微秒，已按 timescale 归一） */
  timestampUs: number;
  /** 样本时长（微秒） */
  durationUs: number;
  /** 是否关键帧（IDR） */
  isKey: boolean;
}

export interface DemuxedVideoConfig {
  codec: string;
  codedWidth: number;
  codedHeight: number;
  /** AVCDecoderConfigurationRecord，VideoDecoder 配置必须 */
  description: Uint8Array;
  /** 源视频轨道帧率估值（样本数 / 时长），用于编码器码控提示 */
  fps: number;
}

export interface DemuxResult {
  config: DemuxedVideoConfig;
  /** 源文件中的样本总数（含被时间窗过滤掉的） */
  totalSamples: number;
  /** 实际交给回调的样本数 */
  emittedSamples: number;
}

export interface DemuxOptions {
  /** 只输出该时间窗内的样本（微秒）；不传表示全片。起点前会自动带上最近一个 GOP 以建立参考帧 */
  rangeUs?: { start: number; end: number };
  /** 每次 appendBuffer 的切片大小，控制内存峰值 */
  sliceBytes?: number;
  /** 尾窗：保留 end 之后一小段样本，便于解码器输出终点附近的帧（默认 1 秒） */
  keyframeLookbackUs?: number;
}

interface AvcCBox {
  configurationVersion?: number;
  AVCProfileIndication?: number;
  profile_compatibility?: number;
  AVCLevelIndication?: number;
  lengthSizeMinusOne?: number;
  SPS?: Array<{ nalu: Uint8Array }>;
  PPS?: Array<{ nalu: Uint8Array }>;
  ext?: Uint8Array;
}

const DEFAULT_SLICE_BYTES = 8 * 1024 * 1024;
const DEFAULT_KEYFRAME_LOOKBACK_US = 1_000_000;

/** 从 mp4box 解析出的 avcC box 重建 AVCDecoderConfigurationRecord */
export function buildAvcCDescription(avcC: AvcCBox): Uint8Array | null {
  const sps = avcC.SPS ?? [];
  const pps = avcC.PPS ?? [];
  if (sps.length === 0 || pps.length === 0) return null;

  const spsSize = sps.reduce((total, item) => total + 2 + item.nalu.length, 0);
  const ppsSize = pps.reduce((total, item) => total + 2 + item.nalu.length, 0);
  const size = 6 + spsSize + 1 + ppsSize + (avcC.ext?.length ?? 0);
  const output = new Uint8Array(size);
  const view = new DataView(output.buffer);
  let offset = 0;

  output[offset++] = avcC.configurationVersion ?? 1;
  output[offset++] = avcC.AVCProfileIndication ?? 0x64;
  output[offset++] = avcC.profile_compatibility ?? 0;
  output[offset++] = avcC.AVCLevelIndication ?? 0x1f;
  output[offset++] = 0xfc | ((avcC.lengthSizeMinusOne ?? 3) & 0x03);
  output[offset++] = 0xe0 | (sps.length & 0x1f);
  for (const item of sps) {
    view.setUint16(offset, item.nalu.length);
    offset += 2;
    output.set(item.nalu, offset);
    offset += item.nalu.length;
  }
  output[offset++] = pps.length & 0xff;
  for (const item of pps) {
    view.setUint16(offset, item.nalu.length);
    offset += 2;
    output.set(item.nalu, offset);
    offset += item.nalu.length;
  }
  if (avcC.ext?.length) {
    output.set(avcC.ext, offset);
  }
  return output;
}

/** 从样本条目里取 avcC 并重建 description；非 H.264 返回 null */
function readVideoConfig(
  entry: Mp4SampleEntry,
  track: Mp4VideoTrack
): DemuxedVideoConfig | null {
  const avcC = (entry as { avcC?: AvcCBox }).avcC;
  const description = avcC ? buildAvcCDescription(avcC) : null;
  if (!description) return null;
  const durationSeconds = track.duration > 0 ? track.duration / track.timescale : 0;
  const fps = durationSeconds > 0 && track.nb_samples > 0
    ? Math.min(120, Math.max(1, Math.round(track.nb_samples / durationSeconds)))
    : 30;
  return {
    codec: track.codec,
    codedWidth: track.video?.width || track.track_width,
    codedHeight: track.video?.height || track.track_height,
    description,
    fps,
  };
}

/**
 * 带旋转矩阵（display matrix，手机竖拍常见）的视频不能走解码路径：
 * 解码输出的是 coded frame，直接绘制会丢失旋转、画面横竖颠倒。
 * 播放路径由 video 元素按矩阵自动旋转，因此这里直接抛错让调用方回退。
 */
function assertNoRotation(track: Mp4VideoTrack) {
  const matrix = (track as { matrix?: ArrayLike<number> }).matrix;
  if (!matrix || matrix.length < 5) return;
  // mp4box 提供 3x3 行优先矩阵（16.16 定点）：[a, b, u, c, d, v, tx, ty, w]，
  // 恒等旋转即 a=d=1.0、b=c=0。翻转（hflip/vflip）同样走不了解码路径，一并拦截。
  const unit = 65536;
  const tolerance = 1024;
  const a = matrix[0];
  const b = matrix[1];
  const c = matrix[3];
  const d = matrix[4];
  const isIdentity = Math.abs(a - unit) < tolerance && Math.abs(d - unit) < tolerance
    && Math.abs(b) < tolerance && Math.abs(c) < tolerance;
  if (!isIdentity) {
    throw new Error('rotated video requires playback path');
  }
}

/**
 * 解封装 MP4 视频轨道。
 *
 * - `onConfig` 在轨道信息可用时同步调用（此时才能配置 VideoDecoder），必须同步完成
 * - `onBatch` 每批样本调用一次，可返回 Promise；返回后才会继续喂下一片数据，
 *   用于把解码/编码队列控制在合理规模
 *
 * 失败（无视频轨、非 H.264、文件损坏）时抛错，调用方据此回退到播放路径。
 */
export async function demuxMp4Video(
  buffer: ArrayBuffer,
  handlers: {
    onConfig: (config: DemuxedVideoConfig) => void;
    onBatch: (samples: DemuxedSample[]) => void | Promise<void>;
  },
  options: DemuxOptions = {}
): Promise<DemuxResult> {
  const { createFile } = await import('../vendor/mp4box/mp4box.all.js');
  const sliceBytes = options.sliceBytes && options.sliceBytes > 0 ? options.sliceBytes : DEFAULT_SLICE_BYTES;
  const lookbackUs = options.keyframeLookbackUs ?? DEFAULT_KEYFRAME_LOOKBACK_US;
  const range = options.rangeUs;

  const mp4File: Mp4BoxFile = createFile();
  let config: DemuxedVideoConfig | null = null;
  let totalSamples = 0;
  let emittedSamples = 0;
  let failure: Error | null = null;
  const pending: DemuxedSample[] = [];
  /**
   * 起点之前、自最近关键帧起的样本缓冲。
   * GOP 可能远长于固定的回看窗口（默认关键帧间隔常为 5~10 秒），
   * 只按固定窗口回看会漏掉起点前的关键帧，导致解码器报
   * 「A key frame is required after configure()」。这里按关键帧边界滚动缓存：
   * 起点前遇到新关键帧就丢弃旧 GOP，遇到起点就整段发出。
   */
  let gopBuffer: DemuxedSample[] = [];
  let reachedStart = !range;

  mp4File.onError = (message: string) => {
    failure = new Error(String(message));
  };

  mp4File.onReady = (info: Mp4Info) => {
    const track = info.videoTracks?.[0];
    if (!track) {
      failure = new Error('no video track');
      return;
    }
    try {
      assertNoRotation(track);
    } catch (error) {
      failure = error instanceof Error ? error : new Error(String(error));
      return;
    }
    const trak = mp4File.getTrackById(track.id);
    const entry = trak?.mdia?.minf?.stbl?.stsd?.entries?.[0];
    if (!entry) {
      failure = new Error('no sample entry');
      return;
    }
    const nextConfig = readVideoConfig(entry, track);
    if (!nextConfig) {
      failure = new Error('unsupported codec');
      return;
    }
    config = nextConfig;
    handlers.onConfig(nextConfig);
    mp4File.setExtractionOptions(track.id, null, { nbSamples: 200 });
    mp4File.start();
  };

  mp4File.onSamples = (_id: number, _user: unknown, samples: Mp4Sample[]) => {
    for (const sample of samples) {
      totalSamples += 1;
      if (sample.data.byteLength === 0) continue;
      const timestampUs = Math.round((sample.cts / sample.timescale) * 1_000_000);
      const entry: DemuxedSample = {
        data: sample.data,
        timestampUs,
        durationUs: Math.max(1, Math.round((sample.duration / sample.timescale) * 1_000_000)),
        isKey: sample.is_sync,
      };

      if (!range) {
        pending.push(entry);
        continue;
      }

      if (!reachedStart) {
        if (timestampUs < range.start) {
          // 起点之前：只保留自最近关键帧起的样本，供解码器建立参考帧
          if (entry.isKey) {
            gopBuffer = [entry];
          } else if (gopBuffer.length > 0) {
            gopBuffer.push(entry);
          }
          continue;
        }
        reachedStart = true;
        // 先把起点前缓存的 GOP 发出（首个必为关键帧），解码器才能正确解码起点帧
        if (gopBuffer.length > 0) {
          pending.push(...gopBuffer);
          gopBuffer = [];
        }
      }

      if (timestampUs > range.end + lookbackUs) continue;
      pending.push(entry);
    }
  };

  const flushBatch = async () => {
    if (pending.length === 0) return;
    const batch = pending.splice(0, pending.length);
    emittedSamples += batch.length;
    await handlers.onBatch(batch);
  };

  for (let offset = 0; offset < buffer.byteLength; offset += sliceBytes) {
    if (failure) break;
    const slice = buffer.slice(offset, Math.min(offset + sliceBytes, buffer.byteLength));
    (slice as ArrayBuffer & { fileStart: number }).fileStart = offset;
    mp4File.appendBuffer(slice);
    await flushBatch();
  }
  mp4File.flush();
  await flushBatch();

  if (failure) throw failure;
  if (!config) throw new Error('mp4 demux finished without a video config');
  if (emittedSamples === 0) throw new Error('mp4 demux produced no samples');

  return { config, totalSamples, emittedSamples };
}
