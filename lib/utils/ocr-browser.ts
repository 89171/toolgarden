import type {
  OcrErrorCode,
  OcrLanguage,
  OcrOutcome,
  OcrProgress,
  OcrProgressStage,
  RecognizeImageOcrOptions,
} from './ocr';

interface OcrWorkerProgressMessage {
  id: string;
  type: 'progress';
  progress: OcrProgress;
}

interface OcrWorkerResultMessage {
  id: string;
  type: 'result';
  result: OcrOutcome;
}

type OcrWorkerMessage = OcrWorkerProgressMessage | OcrWorkerResultMessage;

let accurateOcrWorker: Worker | null = null;
let ocrRequestId = 0;

const OCR_WORKER_IDLE_TIMEOUT_MS = 180_000;
const OCR_MODEL_PHASE_TIMEOUT_MS = 12 * 60_000;
const OCR_PROCESSING_PHASE_TIMEOUT_MS = 6 * 60_000;

function getAccurateOcrWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (accurateOcrWorker) return accurateOcrWorker;

  try {
    accurateOcrWorker = new Worker(new URL('../workers/ocr-accurate.worker.ts', import.meta.url), {
      type: 'module',
    });
    return accurateOcrWorker;
  } catch {
    return null;
  }
}

function discardAccurateOcrWorker(worker: Worker) {
  worker.terminate();
  if (accurateOcrWorker === worker) accurateOcrWorker = null;
}

async function recognizeWorkerOcr(
  file: File,
  language: OcrLanguage,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  const worker = getAccurateOcrWorker();
  if (!worker) return { ok: false, code: 'worker_unavailable' };

  const requestId = `ocr-${ocrRequestId}`;
  ocrRequestId += 1;
  const activeWorker = worker;
  const fileData = await file.arrayBuffer();

  return new Promise((resolve) => {
    let settled = false;
    let currentStage: OcrProgressStage = 'model';
    let idleTimeout: number | null = null;
    let phaseTimeout: number | null = null;

    function cleanup() {
      if (idleTimeout !== null) window.clearTimeout(idleTimeout);
      if (phaseTimeout !== null) window.clearTimeout(phaseTimeout);
      activeWorker.removeEventListener('message', handleMessage);
      activeWorker.removeEventListener('error', handleError);
      activeWorker.removeEventListener('messageerror', handleMessageError);
    }

    function finish(result: OcrOutcome) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    }

    function failTimeout(kind: 'idle' | 'phase') {
      const detail = `stage=${currentStage}, timeout=${kind}`;
      discardAccurateOcrWorker(activeWorker);
      finish({ ok: false, code: 'worker_timeout', detail });
    }

    function armIdleTimeout() {
      if (idleTimeout !== null) window.clearTimeout(idleTimeout);
      idleTimeout = window.setTimeout(() => failTimeout('idle'), OCR_WORKER_IDLE_TIMEOUT_MS);
    }

    function armPhaseTimeout(stage: OcrProgressStage) {
      if (phaseTimeout !== null) window.clearTimeout(phaseTimeout);
      const duration = stage === 'model'
        ? OCR_MODEL_PHASE_TIMEOUT_MS
        : OCR_PROCESSING_PHASE_TIMEOUT_MS;
      phaseTimeout = window.setTimeout(() => failTimeout('phase'), duration);
    }

    function handleError() {
      discardAccurateOcrWorker(activeWorker);
      finish({ ok: false, code: 'worker_unavailable' });
    }

    function handleMessageError() {
      discardAccurateOcrWorker(activeWorker);
      finish({ ok: false, code: 'worker_unavailable' });
    }

    function handleMessage(event: MessageEvent<OcrWorkerMessage>) {
      const message = event.data;
      if (message.id !== requestId) return;

      armIdleTimeout();

      if (message.type === 'progress') {
        if (message.progress.stage !== currentStage) {
          currentStage = message.progress.stage;
          armPhaseTimeout(currentStage);
        }
        onProgress?.(message.progress);
        return;
      }

      finish(message.result);
    }

    activeWorker.addEventListener('message', handleMessage);
    activeWorker.addEventListener('error', handleError);
    activeWorker.addEventListener('messageerror', handleMessageError);
    armIdleTimeout();
    armPhaseTimeout(currentStage);

    try {
      activeWorker.postMessage({
        id: requestId,
        type: 'recognize',
        file: {
          data: fileData,
          type: file.type || 'image/png',
          name: file.name,
          size: file.size,
        },
        language,
      }, [fileData]);
    } catch {
      discardAccurateOcrWorker(activeWorker);
      finish({ ok: false, code: 'worker_unavailable' });
    }
  });
}

export async function recognizeImageOcr(
  file: File,
  options: RecognizeImageOcrOptions
): Promise<OcrOutcome> {
  try {
    return await recognizeWorkerOcr(file, options.language, options.onProgress);
  } catch (error) {
    const detail = error instanceof Error ? error.message : undefined;
    const code: OcrErrorCode = 'load_failed';
    return { ok: false, code, detail };
  }
}
