import { PaddleOCR } from '@paddleocr/paddleocr-js';
import type {
  OcrResult,
  OcrResultItem,
  OcrPipelineRunnerOptions,
  OcrRuntimeParamsInput,
  PaddleOCRCreateOptions,
  SourceMatResult,
} from '@paddleocr/paddleocr-js';
import type {
  OcrLanguage,
  OcrOutcome,
  OcrProgress,
  OcrProgressStage,
  OcrTextBlock,
  OcrTextBox,
} from '../utils/ocr';

interface OcrWorkerFile {
  data: ArrayBuffer;
  type: string;
  name: string;
  size: number;
}

interface OcrWorkerRequest {
  id: string;
  type: 'recognize';
  file: OcrWorkerFile;
  language: OcrLanguage;
}

type PaddleOcrInstance = Awaited<ReturnType<typeof PaddleOCR.create>>;
type OrtWasmPaths = PaddleOCRCreateOptions['ortOptions'] extends { wasmPaths?: infer Paths }
  ? Paths
  : never;
type SourceToMatFn = NonNullable<OcrPipelineRunnerOptions['sourceToMat']>;
type OpenCv = Parameters<SourceToMatFn>[0];
type OpenCvMatLike = InstanceType<OpenCv['Mat']>;

const workerScope = self as unknown as {
  location: Location;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<OcrWorkerRequest>) => void
  ) => void;
};

const ONNX_WASM_PUBLIC_PATH = `${workerScope.location.origin}/models/paddleocr/onnxruntime-web/`;
const ONNX_WASM_PATHS = {
  mjs: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.mjs`,
  wasm: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.wasm`,
};
const OCR_VERSION = 'PP-OCRv5';
const MIN_RECOGNITION_SCORE = 0.28;
const OCR_PREDICT_PARAMS: OcrRuntimeParamsInput = {
  textDetLimitSideLen: 1280,
  textDetLimitType: 'max',
  textDetThresh: 0.24,
  textDetBoxThresh: 0.34,
  textDetUnclipRatio: 1.8,
  textRecScoreThresh: MIN_RECOGNITION_SCORE,
};

const ocrPromises = new Map<string, Promise<PaddleOcrInstance>>();

async function toImageBitmapInWorker(source: unknown): Promise<ImageBitmap> {
  if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) return source;
  if (source instanceof Blob) return createImageBitmap(source);
  if (typeof ImageData !== 'undefined' && source instanceof ImageData) return createImageBitmap(source);

  throw new Error('Unsupported image source. Use a Blob, ImageBitmap, or ImageData.');
}

async function sourceToMatInWorker(cv: OpenCv, source: unknown): Promise<SourceMatResult> {
  if (typeof cv.Mat === 'function' && source instanceof cv.Mat) {
    const sourceMat = source as OpenCvMatLike;
    const cloned = sourceMat.clone();
    return {
      width: sourceMat.cols,
      height: sourceMat.rows,
      mat: cloned,
      dispose() {
        cloned.delete();
      },
    };
  }

  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('OCR requires OffscreenCanvas support in this browser.');
  }

  const imageBitmap = await toImageBitmapInWorker(source);
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    imageBitmap.close();
    throw new Error('Failed to create a 2D canvas context.');
  }

  context.drawImage(imageBitmap, 0, 0);
  const imageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
  const mat = cv.matFromImageData(imageData);

  return {
    width: imageBitmap.width,
    height: imageBitmap.height,
    mat,
    dispose() {
      mat.delete();
      imageBitmap.close();
    },
  };
}

function postProgress(id: string, stage: OcrProgressStage, percent: number, processed?: number, total?: number) {
  const progress: OcrProgress = {
    stage,
    percent: clampInteger(percent, 0, 100),
    processed,
    total,
  };

  workerScope.postMessage({ id, type: 'progress', progress });
}

function postResult(id: string, result: OcrOutcome) {
  workerScope.postMessage({ id, type: 'result', result });
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function getPaddleLanguage(language: OcrLanguage): string {
  if (language === 'eng') return 'en';
  if (language === 'jpn') return 'japan';
  if (language === 'chi_tra') return 'chinese_cht';
  return 'ch';
}

async function getOcr(id: string, language: OcrLanguage): Promise<PaddleOcrInstance> {
  const paddleLanguage = getPaddleLanguage(language);

  postProgress(id, 'model', 8);

  let ocrPromise = ocrPromises.get(paddleLanguage);

  if (!ocrPromise) {
    const options: PaddleOCRCreateOptions = {
      lang: paddleLanguage,
      ocrVersion: OCR_VERSION,
      textDetectionBatchSize: 2,
      textRecognitionBatchSize: 8,
      unsupportedBehavior: 'ignore',
      sourceToMat: sourceToMatInWorker,
      ortOptions: {
        backend: 'wasm',
        wasmPaths: ONNX_WASM_PATHS as unknown as OrtWasmPaths,
        numThreads: 1,
        simd: true,
        proxy: false,
      },
    };

    ocrPromise = PaddleOCR.create(options).catch((error) => {
      ocrPromises.delete(paddleLanguage);
      throw error;
    });
    ocrPromises.set(paddleLanguage, ocrPromise);
  }

  const ocr = await ocrPromise;
  postProgress(id, 'model', 38);
  return ocr;
}

function createImageBlob(file: OcrWorkerFile): Blob | null {
  if (file.size === 0) return null;
  return new Blob([file.data], { type: file.type || 'image/png' });
}

function getTextBox(item: OcrResultItem): OcrTextBox {
  const xs = item.poly.map(([x]) => x);
  const ys = item.poly.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: Math.round(minX),
    y: Math.round(minY),
    width: Math.round(Math.max(1, maxX - minX)),
    height: Math.round(Math.max(1, maxY - minY)),
  };
}

function getRowCenter(block: OcrTextBlock): number {
  return block.box.y + block.box.height / 2;
}

function sortBlocksForReading(blocks: OcrTextBlock[]): OcrTextBlock[] {
  const sorted = [...blocks].sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
  const rows: OcrTextBlock[][] = [];

  for (const block of sorted) {
    const centerY = getRowCenter(block);
    const row = rows.find((candidate) => {
      const averageCenter = candidate.reduce((sum, item) => sum + getRowCenter(item), 0) / candidate.length;
      const averageHeight = candidate.reduce((sum, item) => sum + item.box.height, 0) / candidate.length;
      return Math.abs(centerY - averageCenter) <= Math.max(12, averageHeight * 0.6);
    });

    if (row) {
      row.push(block);
    } else {
      rows.push([block]);
    }
  }

  return rows
    .map((row) => row.sort((a, b) => a.box.x - b.box.x))
    .sort((a, b) => {
      const aY = a.reduce((sum, item) => sum + item.box.y, 0) / a.length;
      const bY = b.reduce((sum, item) => sum + item.box.y, 0) / b.length;
      return aY - bY;
    })
    .flat();
}

function getBlocks(result: OcrResult): OcrTextBlock[] {
  return sortBlocksForReading(
    result.items
      .filter((item) => item.text.trim() && item.score >= MIN_RECOGNITION_SCORE)
      .map((item) => ({
        text: item.text.trim(),
        confidence: item.score,
        angle: 0,
        box: getTextBox(item),
      }))
  );
}

function mergeBlocksText(blocks: OcrTextBlock[]): string {
  return blocks.map((block) => block.text).join('\n').trim();
}

async function runPaddleOcr(request: OcrWorkerRequest): Promise<OcrOutcome> {
  const startedAt = performance.now();
  const image = createImageBlob(request.file);
  if (!image) return { ok: false, code: 'empty_file' };

  const ocr = await getOcr(request.id, request.language);

  postProgress(request.id, 'prepare', 42);
  postProgress(request.id, 'detect', 48);

  const [result] = await ocr.predict(image, OCR_PREDICT_PARAMS);
  if (!result) return { ok: false, code: 'recognition_failed', detail: 'PaddleOCR returned no result.' };

  postProgress(request.id, 'recognize', 92, result.metrics.recognizedCount, result.metrics.detectedBoxes);

  const blocks = getBlocks(result);
  const text = mergeBlocksText(blocks);

  postProgress(request.id, 'merge', 98, blocks.length, result.metrics.detectedBoxes);

  if (!text) return { ok: false, code: 'no_text_detected' };

  return {
    ok: true,
    text,
    blocks,
    imageWidth: result.image.width,
    imageHeight: result.image.height,
    durationMs: Math.round(performance.now() - startedAt),
  };
}

workerScope.addEventListener('message', (event: MessageEvent<OcrWorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'recognize') return;

  void runPaddleOcr(request)
    .then((result) => {
      postProgress(request.id, 'merge', 100);
      postResult(request.id, result);
    })
    .catch((error) => {
      postResult(request.id, {
        ok: false,
        code: /model|fetch|session|onnx|opencv|wasm/i.test(error instanceof Error ? error.message : '')
          ? 'model_load_failed'
          : 'recognition_failed',
        detail: error instanceof Error ? error.message : undefined,
      });
    });
});
