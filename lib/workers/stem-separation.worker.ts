/**
 * 音频分轨 Worker：在浏览器本地跑 HT-Demucs ONNX 推理。
 *
 * 主线程负责解码/重采样到 44.1kHz 立体声，把裸 PCM 转移进来；
 * 本 Worker 负责模型下载与缓存、分段推理、overlap-add、WAV 编码，
 * 再把编码好的字节转移回主线程。
 *
 * 用 `onnxruntime-web/wasm`（不含 JSEP）而非主入口，因为 WebGPU 跑不了这个
 * 模型，带上 JSEP 只会让 wasm 产物从 12.7MB 涨到 23.9MB 而没有任何收益。
 *
 * WebGPU 已在真实浏览器（Apple Metal-3，maxStorageBufferBindingSize 4GiB）
 * 实测过 5 种配置，全部在同一处失败：
 *   ORT 1.21 / 1.27 × EP=['webgpu'] 或 ['webgpu','wasm'] × opt=disabled 或 basic
 * 1.27 给出了可读原因：
 *   transformer_memcpy.cc:254 IsNodeCompatibleWithProvider —
 *   Provider type for ConstantOfShape node '/real_istft/ConstantOfShape' is not set.
 * 即模型逆 STFT 段里的那个 ConstantOfShape 节点既不被 WebGPU EP 接管、也没落到
 * CPU，图分区因此崩掉。显式加 wasm 回退和开常量折叠都无效，属上游问题。
 * 对照：同一个 JSEP 包改用 wasm EP 可以正常建 session，所以问题只在 WebGPU EP。
 */
import * as ort from 'onnxruntime-web/wasm';
import {
  STEM_MODEL_CACHE,
  STEM_SEGMENT_SAMPLES,
  STEM_CHANNELS,
  accumulateWeight,
  accumulateWindowed,
  createFadeWindow,
  encodeWavPcm16,
  computeWaveformPeaks,
  normalizeByWeight,
  looksLikeOnnxModel,
  planStemChunks,
  stemModels,
  toOverallPercent,
  type StemBackend,
  type StemErrorCode,
  type StemModelId,
  type StemModelMeta,
  type StemProgress,
  type StemSource,
} from '../utils/stem-separation';

interface InitRequest {
  id: string;
  type: 'init';
  modelId: StemModelId;
  backend: StemBackend;
}

interface SeparateRequest {
  id: string;
  type: 'separate';
  left: Float32Array;
  right: Float32Array;
  totalSamples: number;
  selected: StemSource[];
  modelId: StemModelId;
  backend: StemBackend;
}

type WorkerRequest = InitRequest | SeparateRequest;

interface WorkerTrack {
  source: StemSource;
  wav: Uint8Array<ArrayBuffer>;
  peaks: Uint8Array<ArrayBuffer>;
}

type WorkerResponse =
  | { id: string; type: 'progress'; progress: StemProgress }
  | { id: string; type: 'ready'; backend: StemBackend }
  | { id: string; type: 'result'; tracks: WorkerTrack[]; backend: StemBackend }
  | { id: string; type: 'error'; code: StemErrorCode; detail?: string };

const workerScope = self as unknown as {
  location: Location;
  navigator: Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } };
  postMessage: (message: WorkerResponse, transfer?: Transferable[]) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<WorkerRequest>) => void,
  ) => void;
};

// 单独一份与已安装 onnxruntime-web 严格同版本的运行时。OCR 目录下那份
// .mjs 与 1.21.0 不一致（历史遗留），版本错配的加载器本身就可能导致中止，
// 所以这里不复用它。
const ONNX_WASM_PUBLIC_PATH = `${workerScope.location.origin}/models/onnxruntime-web/1.21.0/`;

interface LoadedSession {
  session: ort.InferenceSession;
  backend: StemBackend;
}

type SessionKey = `${StemModelId}:${StemBackend}`;

/**
 * 只保留当前这一个 session。
 *
 * 一开始按「模型 + EP」全部缓存，想省掉切换模型时的重新加载，但实测代价
 * 太大：两个 session 各约 1.1GB 同时驻留后，第二个模型的 session 创建从
 * 约 35 秒劣化到约 75 秒（内存压力导致）。换模型属于低频操作，宁可重新
 * 加载也不要让常驻内存翻倍。
 */
let activeSession: { key: SessionKey; promise: Promise<LoadedSession> } | null = null;

function post(message: WorkerResponse, transfer?: Transferable[]): void {
  workerScope.postMessage(message, transfer);
}

function reportProgress(id: string, progress: StemProgress): void {
  post({ id, type: 'progress', progress });
}

// ── 模型获取（带缓存与进度） ────────────────────────────────────

/** 计算 sha256 十六进制摘要；非安全上下文下 crypto.subtle 不可用则返回 null。 */
async function sha256Hex(bytes: Uint8Array<ArrayBuffer>): Promise<string | null> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;

  try {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

/**
 * 校验模型字节：长度 → 魔数 → sha256。
 * 返回 null 表示通过，否则返回不通过的原因。
 */
async function checkModelBytes(
  model: StemModelMeta,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<string | null> {
  if (bytes.byteLength !== model.bytes) {
    return `size mismatch: ${bytes.byteLength} != ${model.bytes}`;
  }
  if (!looksLikeOnnxModel(bytes)) {
    const head = [...bytes.subarray(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join(' ');
    return `not an ONNX model (head=${head})`;
  }

  const digest = await sha256Hex(bytes);
  if (digest && digest !== model.sha256) {
    return `sha256 mismatch: ${digest} != ${model.sha256}`;
  }
  return null;
}

async function readModelFromCache(model: StemModelMeta): Promise<Uint8Array<ArrayBuffer> | null> {
  if (typeof caches === 'undefined') return null;

  try {
    const cache = await caches.open(STEM_MODEL_CACHE);
    const hit = await cache.match(model.url);
    if (!hit) return null;

    const bytes = new Uint8Array(await hit.arrayBuffer());

    /*
     * 缓存命中也必须完整校验。
     *
     * 之前只比长度，于是「长度正确但内容损坏」的模型一旦进了缓存就会
     * 永久命中并永久失败，用户完全无法自行恢复。校验不过就删掉重下。
     */
    const problem = await checkModelBytes(model, bytes);
    if (problem) {
      console.warn(`[stem-separation] discarding cached model: ${problem}`);
      await cache.delete(model.url);
      return null;
    }

    return bytes;
  } catch {
    return null;
  }
}

async function writeModelToCache(
  model: StemModelMeta,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<void> {
  if (typeof caches === 'undefined') return;

  try {
    const cache = await caches.open(STEM_MODEL_CACHE);
    await cache.put(
      model.url,
      new Response(bytes, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(bytes.byteLength),
        },
      }),
    );
  } catch {
    // 配额不足等情况下放弃缓存，不影响本次推理。
  }
}

/**
 * 并行下载的连接数。HTTP/2 虽然能多路复用，但单流吞吐常受拥塞控制和
 * 丢包制约，跨境拉 130–166MB 时并行分段仍有明显收益。4 条是吞吐与
 * 建连开销之间的折中。
 */
const MODEL_DOWNLOAD_CONNECTIONS = 4;

/** 进度上报节流器：多条连接共享一个计数，按 1% 粒度汇报。 */
function createProgressThrottle(id: string, totalBytes: number) {
  let received = 0;
  let lastReported = 0;

  return {
    add(delta: number) {
      received += delta;
      const ratio = received / totalBytes;
      if (ratio - lastReported < 0.01) return;
      lastReported = ratio;
      reportProgress(id, {
        stage: 'model',
        percent: toOverallPercent('model', ratio),
        receivedBytes: received,
        totalBytes,
      });
    },
    finish() {
      reportProgress(id, {
        stage: 'model',
        percent: toOverallPercent('model', 1),
        receivedBytes: totalBytes,
        totalBytes,
      });
    },
  };
}

/** 把一个 Response 流式读入目标缓冲的指定区间，返回写入字节数。 */
async function drainInto(
  response: Response,
  target: Uint8Array<ArrayBuffer>,
  offset: number,
  onChunk: (delta: number) => void,
): Promise<number> {
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    target.set(bytes, offset);
    onChunk(bytes.byteLength);
    return bytes.byteLength;
  }

  const reader = response.body.getReader();
  let written = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    target.set(value, offset + written);
    written += value.byteLength;
    onChunk(value.byteLength);
  }

  return written;
}

/**
 * 并行分段下载。总长度取自模型注册表，预分配一整块缓冲，
 * 各段直接写入自己的区间——无需拼接，全程只占一份内存。
 *
 * 任一段不返回 206（服务端忽略了 Range）就整体放弃，由调用方回退单流。
 */
async function downloadRanged(
  id: string,
  model: StemModelMeta,
): Promise<Uint8Array<ArrayBuffer>> {
  const total = model.bytes;
  const bytes = new Uint8Array(new ArrayBuffer(total));
  const progress = createProgressThrottle(id, total);
  const segmentSize = Math.ceil(total / MODEL_DOWNLOAD_CONNECTIONS);

  const segments = Array.from({ length: MODEL_DOWNLOAD_CONNECTIONS }, (_, index) => {
    const start = index * segmentSize;
    return { start, end: Math.min(start + segmentSize, total) };
  }).filter((segment) => segment.start < segment.end);

  const written = await Promise.all(
    segments.map(async ({ start, end }) => {
      const response = await fetch(model.url, {
        headers: { Range: `bytes=${start}-${end - 1}` },
      });

      // 200 表示服务端无视了 Range，会把整个文件塞进来——放弃并行路径。
      if (response.status !== 206) {
        throw new Error(`range not honored: ${response.status}`);
      }

      return drainInto(response, bytes, start, (delta) => progress.add(delta));
    }),
  );

  const totalWritten = written.reduce((sum, value) => sum + value, 0);
  if (totalWritten !== total) {
    throw new Error(`ranged download size mismatch: ${totalWritten} != ${total}`);
  }

  progress.finish();
  return bytes;
}

/** 单流顺序下载，用作并行分段失败时的兜底。 */
async function downloadSequential(
  id: string,
  model: StemModelMeta,
): Promise<Uint8Array<ArrayBuffer>> {
  const response = await fetch(model.url);
  if (!response.ok) {
    throw new Error(`model download failed: ${response.status}`);
  }

  const declared = Number(response.headers.get('Content-Length')) || model.bytes;
  const bytes = new Uint8Array(new ArrayBuffer(declared));
  const progress = createProgressThrottle(id, declared);

  const written = await drainInto(response, bytes, 0, (delta) => progress.add(delta));
  progress.finish();

  // 实际长度短于声明值时截断，避免尾部留下零字节。
  return written === declared ? bytes : bytes.subarray(0, written);
}

/** 带阶段标签的错误，便于把失败原因分类回报给 UI。 */
class StemStageError extends Error {
  constructor(
    readonly code: StemErrorCode,
    cause: unknown,
  ) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = 'StemStageError';
  }
}

async function downloadModel(
  id: string,
  model: StemModelMeta,
): Promise<Uint8Array<ArrayBuffer>> {
  try {
    return await downloadRanged(id, model);
  } catch {
    // 并行分段失败很常见（服务端不支持 Range），单流兜底才是真正的成败判定。
    try {
      return await downloadSequential(id, model);
    } catch (error) {
      throw new StemStageError('model_download_failed', error);
    }
  }
}

/**
 * 每个 Worker 只用一个 execution provider，不在同一个 Worker 里做 EP 回退。
 *
 * 原因：ORT-web 全局共用一个 Emscripten WASM 模块实例。一旦某个 EP 触发
 * `abort()`，运行时会置上死亡标志，之后任何调用都只会抛裸的 `Aborted()`。
 * 也就是说在同一个 Worker 里「先试 WebGPU 再退回 WASM」是做不到的——第二次
 * 尝试拿到的只是第一次留下的残骸，还会把真实错误盖掉。
 * EP 回退由主线程负责：换一个全新的 Worker 重试。
 */
async function loadSession(
  id: string,
  modelId: StemModelId,
  backend: StemBackend,
): Promise<LoadedSession> {
  const key: SessionKey = `${modelId}:${backend}`;
  if (activeSession?.key === key) return activeSession.promise;

  // 切换模型/EP 前先释放上一个 session，避免两份 ~1.1GB 同时驻留。
  if (activeSession) {
    const previous = activeSession;
    activeSession = null;
    void previous.promise
      .then(({ session }) => session.release?.())
      .catch(() => undefined);
  }

  const model = stemModels[modelId];

  const pending = (async (): Promise<LoadedSession> => {
    ort.env.wasm.wasmPaths = {
      wasm: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.wasm`,
      mjs: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.mjs`,
    };
    // 无 COOP/COEP，SharedArrayBuffer 不可用，只能单线程。
    ort.env.wasm.numThreads = 1;
    // 让 ORT 自己的诊断信息进到控制台，否则 session 失败只剩一句 Aborted()。
    ort.env.logLevel = 'warning';

    let bytes = await readModelFromCache(model);
    if (bytes) {
      reportProgress(id, {
        stage: 'model',
        percent: toOverallPercent('model', 1),
        receivedBytes: bytes.byteLength,
        totalBytes: bytes.byteLength,
      });
    } else {
      bytes = await downloadModel(id, model);

      // 写缓存前必须校验，否则坏字节会被缓存并永久失败。
      const problem = await checkModelBytes(model, bytes);
      if (problem) {
        throw new StemStageError('model_download_failed', new Error(problem));
      }

      await writeModelToCache(model, bytes);
    }

    console.info(
      `[stem-separation] creating session model=${modelId} backend=${backend} bytes=${bytes.byteLength}`,
    );

    reportProgress(id, { stage: 'session', percent: toOverallPercent('session', 0) });

    try {
      const session = await ort.InferenceSession.create(bytes, {
        executionProviders: [backend],
        /*
         * 必须是 'disabled'。
         *
         * ORT-web 的图优化器在这个模型（13138 个节点）上会直接 abort()，
         * 且 Emscripten 只给出一句裸的 `Aborted()`。已在 Node 里用同一个
         * wasm 后端复现并逐级验证：
         *   fp16 130MB → disabled OK(9.4s) / basic FAIL / extended FAIL / all FAIL
         *   fp32 246MB → disabled OK(9.3s) / basic FAIL / extended FAIL / all FAIL
         * 与精度无关，换 fp32 也一样。图优化发生在 EP 分区之前，所以 WebGPU
         * 路径同样受影响，不能只对 wasm 禁用。
         */
        graphOptimizationLevel: 'disabled',
        logSeverityLevel: 2,
      });
      console.info(`[stem-separation] session ready backend=${backend}`);
      return { session, backend };
    } catch (error) {
      throw new StemStageError('session_failed', error);
    }
  })().catch((error) => {
    // 失败的 promise 不能留着，否则重试会一直拿到同一个 rejection。
    if (activeSession?.key === key) activeSession = null;
    throw error;
  });

  activeSession = { key, promise: pending };
  return pending;
}

// ── 推理主流程 ──────────────────────────────────────────────────

async function separate(request: SeparateRequest): Promise<void> {
  const { id, left, right, totalSamples, selected, modelId } = request;

  const { session, backend } = await loadSession(id, modelId, request.backend);

  // 必须按该模型自己的输出顺序取下标。4 轨模型的顺序恰好是 6 轨的前四条，
  // 但依赖这个巧合很脆弱，所以显式索引 model.sources。
  const stemIndices = selected.map((source) => stemModels[modelId].sources.indexOf(source));
  const chunks = planStemChunks(totalSamples);
  const window = createFadeWindow();

  // 每条选中轨道一组 f32 累加缓冲；权重所有轨道共用。
  const accumulators = selected.map(() => [
    new Float32Array(totalSamples),
    new Float32Array(totalSamples),
  ]);
  const weight = new Float32Array(totalSamples);

  // 输入张量缓冲跨段复用，避免每段都新分配 2.75MB。
  const inputData = new Float32Array(STEM_CHANNELS * STEM_SEGMENT_SAMPLES);

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const writeLength = chunk.end - chunk.start;

    inputData.fill(0);
    inputData.set(left.subarray(chunk.start, chunk.end), 0);
    inputData.set(right.subarray(chunk.start, chunk.end), STEM_SEGMENT_SAMPLES);

    const tensor = new ort.Tensor('float32', inputData, [1, STEM_CHANNELS, STEM_SEGMENT_SAMPLES]);
    let results: ort.InferenceSession.OnnxValueMapType;
    try {
      results = await session.run({ mix: tensor });
    } catch (error) {
      // 长音频最容易在这里 OOM，和「模型下载不了」是完全不同的问题。
      throw new StemStageError('inference_failed', error);
    }
    const stems = results.stems.data as Float32Array;

    for (let s = 0; s < stemIndices.length; s += 1) {
      const stemIndex = stemIndices[s];
      for (let channel = 0; channel < STEM_CHANNELS; channel += 1) {
        const base = (stemIndex * STEM_CHANNELS + channel) * STEM_SEGMENT_SAMPLES;
        accumulateWindowed(
          accumulators[s][channel],
          stems.subarray(base, base + writeLength),
          window,
          chunk.start,
          writeLength,
        );
      }
    }

    accumulateWeight(weight, window, chunk.start, writeLength);

    // 及早释放本段输出，避免与下一段的 16.5MB 输出叠加。
    results.stems.dispose?.();

    reportProgress(id, {
      stage: 'separating',
      percent: toOverallPercent('separating', (i + 1) / chunks.length),
      chunkIndex: i + 1,
      chunkTotal: chunks.length,
    });
  }

  reportProgress(id, { stage: 'encode', percent: toOverallPercent('encode', 0) });

  const tracks: WorkerTrack[] = [];
  const transfer: Transferable[] = [];

  for (let s = 0; s < selected.length; s += 1) {
    const channels = accumulators[s];
    normalizeByWeight(channels[0], weight);
    normalizeByWeight(channels[1], weight);

    // 必须在编码前算：此时归一化后的 f32 还在手上，UI 就不用再解码一遍 WAV。
    const peaks = computeWaveformPeaks(channels);
    const wav = encodeWavPcm16(channels);
    tracks.push({ source: selected[s], wav, peaks });
    transfer.push(wav.buffer, peaks.buffer);

    // 编码完立刻断开引用，让 GC 能在下一轨编码前回收这条的 f32 缓冲。
    accumulators[s] = [new Float32Array(0), new Float32Array(0)];

    reportProgress(id, {
      stage: 'encode',
      percent: toOverallPercent('encode', (s + 1) / selected.length),
    });
  }

  post({ id, type: 'result', tracks, backend }, transfer);
}

function reportFailure(id: string, error: unknown): void {
  const code: StemErrorCode = error instanceof StemStageError ? error.code : 'model_failed';
  const detail = error instanceof Error ? error.message : String(error);
  // 控制台保留原始错误，UI 文案再友好也丢不掉排查线索。
  console.error(`[stem-separation] ${code}:`, error);
  post({ id, type: 'error', code, detail });
}

workerScope.addEventListener('message', (event) => {
  const request = event.data;
  if (!request) return;

  // init：只下载模型并建 session，不碰音频。主线程据此决定用哪个 EP，
  // 确定之后才转移 PCM，避免转移后 session 失败导致缓冲白白 detach。
  if (request.type === 'init') {
    loadSession(request.id, request.modelId, request.backend)
      .then(({ backend }) => post({ id: request.id, type: 'ready', backend }))
      .catch((error: unknown) => reportFailure(request.id, error));
    return;
  }

  if (request.type === 'separate') {
    separate(request).catch((error: unknown) => reportFailure(request.id, error));
  }
});
