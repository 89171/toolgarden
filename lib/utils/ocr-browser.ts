import type {
  OcrLanguage,
  OcrOutcome,
  OcrProgress,
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
let accurateOcrWorkerUnavailable = false;
let ocrRequestId = 0;

function getAccurateOcrWorker(): Worker | null {
  if (accurateOcrWorkerUnavailable || typeof Worker === 'undefined') return null;
  if (accurateOcrWorker) return accurateOcrWorker;

  try {
    accurateOcrWorker = new Worker(new URL('../workers/ocr-accurate.worker.ts', import.meta.url), {
      type: 'module',
    });
    return accurateOcrWorker;
  } catch {
    accurateOcrWorkerUnavailable = true;
    return null;
  }
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
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve({ ok: false, code: 'recognition_failed', detail: 'OCR worker timed out.' });
    }, 240_000);

    function cleanup() {
      window.clearTimeout(timeout);
      activeWorker.removeEventListener('message', handleMessage);
      activeWorker.removeEventListener('error', handleError);
    }

    function handleError() {
      cleanup();
      accurateOcrWorkerUnavailable = true;
      activeWorker.terminate();
      if (accurateOcrWorker === activeWorker) {
        accurateOcrWorker = null;
      }
      resolve({ ok: false, code: 'worker_unavailable' });
    }

    function handleMessage(event: MessageEvent<OcrWorkerMessage>) {
      const message = event.data;
      if (message.id !== requestId) return;

      if (message.type === 'progress') {
        onProgress?.(message.progress);
        return;
      }

      cleanup();
      resolve(message.result);
    }

    activeWorker.addEventListener('message', handleMessage);
    activeWorker.addEventListener('error', handleError);
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
  });
}

export async function recognizeImageOcr(
  file: File,
  options: RecognizeImageOcrOptions
): Promise<OcrOutcome> {
  return recognizeWorkerOcr(file, options.language, options.onProgress);
}
