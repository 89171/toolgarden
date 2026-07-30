/**
 * 音频分轨的浏览器侧编排：解码重采样 → Worker 推理 → 打包下载。
 *
 * 纯数学与编码在 stem-separation.ts，ONNX 推理在 stem-separation.worker.ts，
 * 本文件只做浏览器 API 交互与 Worker 通信。
 */
import {
  MAX_STEM_FILE_SIZE,
  STEM_CHANNELS,
  STEM_SAMPLE_RATE,
  buildStemFilename,
  fitsMemoryBudget,
  toOverallPercent,
  type StemBackend,
  type StemErrorCode,
  type StemModelId,
  type StemFailure,
  type StemOutcome,
  type StemProgress,
  type StemSource,
  type StemTrack,
} from './stem-separation';

interface WorkerTrack {
  source: StemSource;
  wav: Uint8Array<ArrayBuffer>;
}

type WorkerResponse =
  | { id: string; type: 'progress'; progress: StemProgress }
  | { id: string; type: 'ready'; backend: StemBackend }
  | { id: string; type: 'result'; tracks: WorkerTrack[]; backend: StemBackend }
  | { id: string; type: 'error'; code: StemErrorCode; detail?: string };

interface DecodedMix {
  left: Float32Array;
  right: Float32Array;
  totalSamples: number;
}

let stemWorker: Worker | null = null;
let stemWorkerUnavailable = false;
let requestCounter = 0;

function getStemWorker(): Worker | null {
  if (stemWorkerUnavailable || typeof Worker === 'undefined') return null;
  if (stemWorker) return stemWorker;

  try {
    stemWorker = new Worker(new URL('../workers/stem-separation.worker.ts', import.meta.url), {
      type: 'module',
    });
    return stemWorker;
  } catch {
    stemWorkerUnavailable = true;
    return null;
  }
}

/** Worker 出错后连同已加载的 session 一起丢弃，下次重新建。 */
function disposeStemWorker(): void {
  stemWorker?.terminate();
  stemWorker = null;
}

// ── 解码与重采样 ────────────────────────────────────────────────

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

/** 用 OfflineAudioContext 把已解码的 buffer 重采样到 44.1kHz。 */
async function resampleTo44k(buffer: AudioBuffer): Promise<AudioBuffer> {
  const frames = Math.ceil((buffer.duration * STEM_SAMPLE_RATE) / 1);
  const offline = new OfflineAudioContext(
    Math.min(buffer.numberOfChannels, STEM_CHANNELS),
    frames,
    STEM_SAMPLE_RATE,
  );

  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();

  return offline.startRendering();
}

/**
 * 解码为 44.1kHz 立体声裸 PCM。
 *
 * decodeAudioData 会自动重采样到 AudioContext 的采样率，所以首选直接开
 * 44.1kHz 的上下文；个别浏览器会忽略该参数，此时再走 OfflineAudioContext 补救。
 */
async function decodeToStereo44k(file: File): Promise<DecodedMix | StemErrorCode> {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return 'decode_failed';

  const data = await file.arrayBuffer();
  let context: AudioContext | null = null;
  let buffer: AudioBuffer;

  try {
    context = new Ctor({ sampleRate: STEM_SAMPLE_RATE });
    buffer = await context.decodeAudioData(data);
  } catch {
    return 'decode_failed';
  } finally {
    // 解码完就关掉，别占着音频硬件。
    void context?.close().catch(() => {});
  }

  if (buffer.sampleRate !== STEM_SAMPLE_RATE) {
    try {
      buffer = await resampleTo44k(buffer);
    } catch {
      return 'decode_failed';
    }
  }

  const totalSamples = buffer.length;
  if (totalSamples <= 0) return 'decode_failed';

  const left = new Float32Array(totalSamples);
  left.set(buffer.getChannelData(0));

  // 单声道复制成双声道；多声道只取前两条，与参考实现一致。
  const right = new Float32Array(totalSamples);
  right.set(buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0));

  return { left, right, totalSamples };
}

// ── 对外入口 ────────────────────────────────────────────────────

export interface SeparateStemsOptions {
  selected: StemSource[];
  modelId: StemModelId;
  onProgress?: (progress: StemProgress) => void;
}

export async function separateStems(
  file: File,
  { selected, modelId, onProgress }: SeparateStemsOptions,
): Promise<StemOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (file.size > MAX_STEM_FILE_SIZE) return { ok: false, code: 'file_too_large' };
  if (selected.length === 0) return { ok: false, code: 'no_stems_selected' };
  if (typeof Worker === 'undefined') return { ok: false, code: 'webgpu_and_wasm_unavailable' };

  onProgress?.({ stage: 'decode', percent: toOverallPercent('decode', 0) });

  const decoded = await decodeToStereo44k(file);
  if (typeof decoded === 'string') return { ok: false, code: decoded };

  // 内存注定不够时提前拒绝，而不是让用户等几分钟再看标签页崩溃。
  if (!fitsMemoryBudget(decoded.totalSamples, selected.length)) {
    return { ok: false, code: 'audio_too_long' };
  }

  onProgress?.({ stage: 'decode', percent: toOverallPercent('decode', 1) });

  const { webgpu } = await detectStemCapability();
  const candidates: StemBackend[] = webgpu ? ['webgpu', 'wasm'] : ['wasm'];

  /*
   * 先只做「下载模型 + 建 session」的探测，成功后才把 PCM 转移进去。
   *
   * 必须分两步：postMessage 转移会 detach 掉 ArrayBuffer，如果连同 PCM 一起
   * 发过去而 session 建失败，缓冲已经废了，换 Worker 重试只会拿到空音频。
   * 分开之后 PCM 只在确定可用的 backend 上转移一次，既不复制也不会丢。
   */
  let chosen: StemBackend | null = null;
  let lastFailure: StemFailure = { ok: false, code: 'session_failed' };

  for (const backend of candidates) {
    const worker = getStemWorker();
    if (!worker) return { ok: false, code: 'webgpu_and_wasm_unavailable' };

    const init = await initBackend(worker, modelId, backend, onProgress);
    if (init.ok) {
      chosen = backend;
      break;
    }

    lastFailure = init;

    // 只有 session 建不起来才值得换 EP。ORT 的 WASM 模块一旦 abort 就整体报废，
    // 所以必须连 Worker 一起换掉——同一个 Worker 里重试只会拿到 Aborted()。
    if (init.code !== 'session_failed') return init;

    console.warn(
      `[stem-separation] backend "${backend}" could not create a session; retrying in a fresh worker.`,
      init.detail,
    );
    disposeStemWorker();
  }

  if (!chosen) return lastFailure;

  const worker = getStemWorker();
  if (!worker) return { ok: false, code: 'webgpu_and_wasm_unavailable' };

  return runSeparation(worker, file, decoded, selected, modelId, chosen, onProgress);
}

/** 只让 Worker 下载模型并建立 session，不发送音频。 */
function initBackend(
  worker: Worker,
  modelId: StemModelId,
  backend: StemBackend,
  onProgress?: (progress: StemProgress) => void,
): Promise<{ ok: true } | StemFailure> {
  const id = `stem-init-${requestCounter}`;
  requestCounter += 1;

  return new Promise((resolve) => {
    let settled = false;

    function cleanup(): void {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
    }

    function settle(outcome: { ok: true } | StemFailure): void {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    }

    function handleMessage(event: MessageEvent<WorkerResponse>): void {
      const message = event.data;
      if (!message || message.id !== id) return;

      if (message.type === 'progress') {
        onProgress?.(message.progress);
        return;
      }

      if (message.type === 'error') {
        settle({ ok: false, code: message.code, detail: message.detail });
        return;
      }

      if (message.type === 'ready') settle({ ok: true });
    }

    function handleError(): void {
      settle({ ok: false, code: 'session_failed', detail: 'stem separation worker crashed' });
    }

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.postMessage({ id, type: 'init', modelId, backend });
  });
}

function runSeparation(
  worker: Worker,
  file: File,
  decoded: DecodedMix,
  selected: StemSource[],
  modelId: StemModelId,
  backend: StemBackend,
  onProgress?: (progress: StemProgress) => void,
): Promise<StemOutcome> {
  const id = `stem-${requestCounter}`;
  requestCounter += 1;
  const startedAt = Date.now();

  return new Promise<StemOutcome>((resolve) => {
    const activeWorker = worker;
    let settled = false;

    function cleanup(): void {
      activeWorker.removeEventListener('message', handleMessage);
      activeWorker.removeEventListener('error', handleError);
    }

    function settle(outcome: StemOutcome): void {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    }

    function handleMessage(event: MessageEvent<WorkerResponse>): void {
      const message = event.data;
      if (!message || message.id !== id) return;

      if (message.type === 'progress') {
        onProgress?.(message.progress);
        return;
      }

      if (message.type === 'error') {
        settle({ ok: false, code: message.code, detail: message.detail });
        return;
      }

      // session 已在 initBackend 阶段建好，这里只关心最终结果。
      if (message.type !== 'result') return;

      const tracks: StemTrack[] = message.tracks.map((track) => ({
        source: track.source,
        wav: track.wav,
        filename: buildStemFilename(file.name, track.source),
      }));

      onProgress?.({ stage: 'done', percent: 100 });
      settle({
        ok: true,
        tracks,
        durationMs: Date.now() - startedAt,
        backend: message.backend,
      });
    }

    function handleError(): void {
      disposeStemWorker();
      settle({ ok: false, code: 'model_failed', detail: 'stem separation worker crashed' });
    }

    activeWorker.addEventListener('message', handleMessage);
    activeWorker.addEventListener('error', handleError);

    // 转移裸 PCM 所有权，避免复制上百 MB。
    activeWorker.postMessage(
      {
        id,
        type: 'separate',
        left: decoded.left,
        right: decoded.right,
        totalSamples: decoded.totalSamples,
        selected,
        modelId,
        backend,
      },
      [decoded.left.buffer, decoded.right.buffer],
    );
  });
}

// ── 能力检测 ────────────────────────────────────────────────────

export interface StemCapability {
  supported: boolean;
  /** 无 WebGPU 时走单线程 WASM，速度差一个数量级，需要提前告知用户。 */
  webgpu: boolean;
}

export async function detectStemCapability(): Promise<StemCapability> {
  if (typeof window === 'undefined') return { supported: false, webgpu: false };

  const hasWorker = typeof Worker !== 'undefined';
  const hasWasm = typeof WebAssembly !== 'undefined';
  const hasAudio = getAudioContextCtor() !== null;
  const supported = hasWorker && hasWasm && hasAudio;

  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  let webgpu = false;
  if (gpu) {
    try {
      webgpu = Boolean(await gpu.requestAdapter());
    } catch {
      webgpu = false;
    }
  }

  return { supported, webgpu };
}
