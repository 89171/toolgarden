/**
 * 音频分轨（stem separation）纯函数库。
 *
 * 模型：HT-Demucs 6-source（htdemucs_6s）ONNX 导出，MIT 许可。
 *   https://huggingface.co/StemSplitio/htdemucs-6s-onnx
 *
 * 契约（来自模型 README 与参考实现 infer.py）：
 *   输入  mix    float32 [1, 2, 343980]        44.1kHz 立体声，取值 [-1, 1]
 *   输出  stems  float32 [1, 6, 2, 343980]     顺序 [drums, bass, other, vocals, guitar, piano]
 *
 * 长音频按 overlap-add 分段推理：段长 343980、重叠 1/4 段长、线性淡入淡出窗、
 * 最后按累积权重归一化。本文件只做数学与编码，不含 React、不含副作用。
 */

// ── 模型常量 ────────────────────────────────────────────────────

export const STEM_SAMPLE_RATE = 44100;
export const STEM_CHANNELS = 2;

/** 单段样本数：7.8s × 44100，模型输入维度固定，不可变。 */
export const STEM_SEGMENT_SAMPLES = 343_980;

/** 相邻段重叠样本数（段长的 1/4）。 */
export const STEM_OVERLAP_SAMPLES = STEM_SEGMENT_SAMPLES / 4;

/** 段起点步进。 */
export const STEM_STRIDE_SAMPLES = STEM_SEGMENT_SAMPLES - STEM_OVERLAP_SAMPLES;

/** Cache API 中存放模型的缓存名，两个模型共用一个桶、按 URL 区分。 */
export const STEM_MODEL_CACHE = 'stem-separation-model-v1';

/**
 * 全部可能的轨道，顺序即 UI 展示顺序。
 *
 * 6 轨模型的输出顺序恰好是 4 轨模型的顺序再追加 guitar、piano，
 * 所以这一个数组同时充当两个模型的展示顺序基准。
 */
export const stemSources = ['drums', 'bass', 'other', 'vocals', 'guitar', 'piano'] as const;

export type StemSource = (typeof stemSources)[number];

export type StemModelId = 'htdemucs' | 'htdemucs_6s';

export const stemModelIds = ['htdemucs', 'htdemucs_6s'] as const;

export interface StemModelMeta {
  id: StemModelId;
  url: string;
  /** 精确字节数，用于下载进度显示与缓存完整性校验。 */
  bytes: number;
  /**
   * 文件 sha256（与 HuggingFace 的 x-linked-etag 一致，已本地实测核对）。
   * 长度相同但内容损坏的情况只有摘要能查出来。
   */
  sha256: string;
  /** 输出轨道顺序——必须与该模型 ONNX 输出第 1 维的顺序完全一致。 */
  sources: readonly StemSource[];
}

/**
 * 两个模型来自同一条导出管道（StemSplitio），契约完全一致：
 * 输入 mix [1,2,343980]，输出 stems [1,N,2,343980]，均为 MIT 许可。
 *
 * 4 轨版在 vocals/other 上更准（other 不必再分出吉他和钢琴）；
 * 6 轨版多出 guitar、piano 两条，代价是 other 变弱。
 */
export const stemModels: Record<StemModelId, StemModelMeta> = {
  htdemucs: {
    id: 'htdemucs',
    url: 'https://huggingface.co/StemSplitio/htdemucs-onnx/resolve/main/htdemucs_fp16weights.onnx',
    bytes: 165_612_636,
    sha256: 'd05c269d0178d2a72ad484b10b11dd370193fc923201c3b27a99f848745db70a',
    sources: ['drums', 'bass', 'other', 'vocals'],
  },
  htdemucs_6s: {
    id: 'htdemucs_6s',
    url: 'https://huggingface.co/StemSplitio/htdemucs-6s-onnx/resolve/main/htdemucs_6s_fp16weights.onnx',
    bytes: 136_428_532,
    sha256: '7ce55792e2231c93fbf92de95f5fd5b3a5e6c89f7db690dfd693e8f1dce56869',
    sources: ['drums', 'bass', 'other', 'vocals', 'guitar', 'piano'],
  },
};

export const defaultStemModelId: StemModelId = 'htdemucs_6s';

/** 默认勾选的轨道：人声加伴奏三件套，两个模型都支持。 */
export const defaultStemSelection: StemSource[] = ['vocals', 'drums', 'bass', 'other'];

/** 按 UI 展示顺序列出某个模型支持的轨道。 */
export function sourcesForModel(modelId: StemModelId): StemSource[] {
  const supported = new Set(stemModels[modelId].sources);
  return stemSources.filter((source) => supported.has(source));
}

/**
 * 把选择裁剪到目标模型支持的范围，并保持 UI 顺序。
 * 从 6 轨切到 4 轨时，guitar / piano 会被自动去掉。
 */
export function clampSelection(selected: StemSource[], modelId: StemModelId): StemSource[] {
  const chosen = new Set(selected);
  return sourcesForModel(modelId).filter((source) => chosen.has(source));
}

// ── 资源预算 ────────────────────────────────────────────────────

/**
 * ONNX session 常驻内存（模型 README 实测 ~1.1GB）。
 * 用于内存预估，避免在必然 OOM 的输入上浪费用户几分钟。
 */
export const STEM_SESSION_BYTES = 1_100 * 1024 * 1024;

/** 峰值内存预算上限。超过则拒绝并说明原因，而不是让标签页崩溃。 */
export const STEM_MEMORY_BUDGET_BYTES = 2_400 * 1024 * 1024;

/** 输入文件大小上限。 */
export const MAX_STEM_FILE_SIZE = 128 * 1024 * 1024;

// ── 模型字节校验 ────────────────────────────────────────────────

/**
 * 粗校验下载到的字节像不像一个 ONNX 模型。
 *
 * 两个模型都以 ONNX ModelProto 开头：字段 1（ir_version，varint）= 0x08，
 * 紧接字段 2（producer_name）= 0x12 0x07 "pytorch"。
 *
 * 这道检查的价值在于：网络中间层返回 HTML 错误页、或分段下载拼错，
 * 得到的字节长度可能刚好正确，只靠长度校验会把垃圾写进 Cache 并永久失败。
 */
export function looksLikeOnnxModel(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 16) return false;
  // 0x08 = 字段号 1、varint 类型，ONNX ModelProto 的第一个字段。
  if (bytes[0] !== 0x08) return false;

  const head = String.fromCharCode(...bytes.subarray(0, 32));
  // 明显是 HTML/XML 错误页就直接判否。
  if (head.trimStart().startsWith('<')) return false;

  return head.includes('pytorch');
}

// ── 类型 ────────────────────────────────────────────────────────

/** 阶段按真实发生顺序排列：解码 → 下载模型 → 建 session → 分轨 → 编码。 */
export type StemStage =
  | 'decode'
  | 'model'
  | 'session'
  | 'separating'
  | 'encode'
  | 'done';

export interface StemProgress {
  stage: StemStage;
  /** 0–100 整体进度。 */
  percent: number;
  /** 当前段序号，从 1 开始；仅 separating 阶段有值。 */
  chunkIndex?: number;
  chunkTotal?: number;
  /** 模型下载已接收字节；仅 model 阶段有值。 */
  receivedBytes?: number;
  totalBytes?: number;
}

export type StemErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'decode_failed'
  | 'no_stems_selected'
  | 'audio_too_long'
  | 'webgpu_and_wasm_unavailable'
  // 下面三条把「分轨失败」拆开，否则模型下载失败、session 建不起来、
  // 推理中途 OOM 会共用一条文案，排查时完全看不出发生了什么。
  | 'model_download_failed'
  | 'session_failed'
  | 'inference_failed'
  | 'model_failed'
  | 'cancelled';

export interface StemTrack {
  source: StemSource;
  /**
   * PCM16 WAV 字节。
   *
   * 显式绑定到 ArrayBuffer（而非默认的 ArrayBufferLike），
   * 这样才能直接当 BlobPart 和 Transferable 用，无需在调用处强转。
   */
  wav: Uint8Array<ArrayBuffer>;
  filename: string;
}

export interface StemSuccess {
  ok: true;
  tracks: StemTrack[];
  durationMs: number;
  backend: StemBackend;
}

export interface StemFailure {
  ok: false;
  code: StemErrorCode;
  /** 仅用于开发者排查，不直接展示给用户。 */
  detail?: string;
}

export type StemOutcome = StemSuccess | StemFailure;

export type StemBackend = 'webgpu' | 'wasm';

// ── 分段计划 ────────────────────────────────────────────────────

export interface StemChunk {
  index: number;
  /** 在整轨中的起始样本（含）。 */
  start: number;
  /** 在整轨中的结束样本（不含）。可能不足一整段，需零填充后送入模型。 */
  end: number;
}

/**
 * 按 overlap-add 规划分段。与 infer.py::separate 的循环等价：
 * 段数 = ceil(total / stride)，末段不足段长时零填充。
 */
export function planStemChunks(totalSamples: number): StemChunk[] {
  if (totalSamples <= 0) return [];

  const count = Math.max(1, Math.ceil(totalSamples / STEM_STRIDE_SAMPLES));
  const chunks: StemChunk[] = [];

  for (let index = 0; index < count; index += 1) {
    const start = index * STEM_STRIDE_SAMPLES;
    if (start >= totalSamples) break;
    chunks.push({
      index,
      start,
      end: Math.min(start + STEM_SEGMENT_SAMPLES, totalSamples),
    });
  }

  return chunks;
}

/**
 * 线性淡入淡出窗：前 overlap 个样本 0→1，后 overlap 个样本 1→0，中间恒为 1。
 * 对应 infer.py::_make_window。
 */
export function createFadeWindow(
  length = STEM_SEGMENT_SAMPLES,
  overlap = STEM_OVERLAP_SAMPLES,
): Float32Array {
  const window = new Float32Array(length);
  window.fill(1);

  if (overlap <= 1 || overlap * 2 > length) return window;

  // np.linspace(0, 1, overlap)
  for (let i = 0; i < overlap; i += 1) {
    const value = i / (overlap - 1);
    window[i] = value;
    window[length - 1 - i] = value;
  }

  return window;
}

// ── overlap-add ─────────────────────────────────────────────────

/**
 * 把一段模型输出按窗加权累加进整轨缓冲。
 *
 * @param target      目标缓冲，长度 = 整轨样本数
 * @param chunkOutput 模型该段输出的单声道切片，长度 ≥ writeLength
 * @param window      淡入淡出窗
 * @param start       写入起点
 * @param writeLength 实际写入长度（末段小于段长）
 */
export function accumulateWindowed(
  target: Float32Array,
  chunkOutput: Float32Array,
  window: Float32Array,
  start: number,
  writeLength: number,
): void {
  for (let i = 0; i < writeLength; i += 1) {
    target[start + i] += chunkOutput[i] * window[i];
  }
}

/** 累加窗权重，用于最终归一化。 */
export function accumulateWeight(
  weight: Float32Array,
  window: Float32Array,
  start: number,
  writeLength: number,
): void {
  for (let i = 0; i < writeLength; i += 1) {
    weight[start + i] += window[i];
  }
}

/**
 * 按累积权重归一化（就地修改）。对应 infer.py 的 `out /= maximum(weight, 1e-8)`。
 */
export function normalizeByWeight(target: Float32Array, weight: Float32Array): void {
  for (let i = 0; i < target.length; i += 1) {
    target[i] /= Math.max(weight[i], 1e-8);
  }
}

// ── 内存预估 ────────────────────────────────────────────────────

/**
 * 预估峰值内存：ONNX session + 输入混音 + 每条选中轨道的 f32 累加缓冲 + 权重缓冲。
 */
export function estimateStemMemoryBytes(totalSamples: number, stemCount: number): number {
  const perChannelBytes = totalSamples * 4;
  const mixBytes = perChannelBytes * STEM_CHANNELS;
  const stemBytes = perChannelBytes * STEM_CHANNELS * stemCount;
  const weightBytes = perChannelBytes;
  return STEM_SESSION_BYTES + mixBytes + stemBytes + weightBytes;
}

/** 在给定轨道数下，预算允许的最大时长（秒）。 */
export function maxDurationSecondsFor(stemCount: number): number {
  const available = STEM_MEMORY_BUDGET_BYTES - STEM_SESSION_BYTES;
  const bytesPerSample = 4 * (STEM_CHANNELS + STEM_CHANNELS * stemCount + 1);
  return Math.max(0, Math.floor(available / bytesPerSample / STEM_SAMPLE_RATE));
}

export function fitsMemoryBudget(totalSamples: number, stemCount: number): boolean {
  return estimateStemMemoryBytes(totalSamples, stemCount) <= STEM_MEMORY_BUDGET_BYTES;
}

// ── WAV 编码 ────────────────────────────────────────────────────

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function toPcm16(sample: number): number {
  // 先夹到 [-1, 1]，再按非对称整数范围缩放，避免 +1.0 溢出成 -32768。
  const clamped = sample < -1 ? -1 : sample > 1 ? 1 : sample;
  return Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff);
}

/**
 * 把交错前的多声道 f32 编码为 PCM16 WAV。
 * 相比 f32 直出体积减半，且所有播放器都能直接播。
 */
export function encodeWavPcm16(
  channels: Float32Array[],
  sampleRate = STEM_SAMPLE_RATE,
): Uint8Array<ArrayBuffer> {
  const channelCount = channels.length;
  const frameCount = channelCount > 0 ? channels[0].length : 0;
  const blockAlign = channelCount * 2;
  const dataBytes = frameCount * blockAlign;

  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');

  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM fmt chunk 长度
  view.setUint16(20, 1, true); // 1 = PCM
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      view.setInt16(offset, toPcm16(channels[channel][frame]), true);
      offset += 2;
    }
  }

  return new Uint8Array(buffer);
}

// ── 文件名 ──────────────────────────────────────────────────────

export function stripAudioExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(0, dot) : filename;
}

export function buildStemFilename(originalName: string, source: StemSource): string {
  return `${stripAudioExtension(originalName)}-${source}.wav`;
}

export function buildStemArchiveName(originalName: string): string {
  return `${stripAudioExtension(originalName)}-stems.zip`;
}

// ── 进度换算 ────────────────────────────────────────────────────

/**
 * 把各阶段进度映射到统一的 0–100，区间顺序与真实执行顺序一致：
 * 解码 0–5、下载模型 5–28、建 session 28–35、分轨 35–95、编码 95–100。
 *
 * session 单独占一段是因为它实测要 8–9 秒（图优化被禁用后仍需加载 13138 个
 * 节点的初始张量），没有独立阶段的话这段时间界面看起来是卡住的。
 */
export function toOverallPercent(stage: StemStage, stageRatio: number): number {
  const clamped = stageRatio < 0 ? 0 : stageRatio > 1 ? 1 : stageRatio;
  switch (stage) {
    case 'decode':
      return Math.round(clamped * 5);
    case 'model':
      return 5 + Math.round(clamped * 23);
    case 'session':
      return 28 + Math.round(clamped * 7);
    case 'separating':
      return 35 + Math.round(clamped * 60);
    case 'encode':
      return 95 + Math.round(clamped * 5);
    case 'done':
      return 100;
  }
}
