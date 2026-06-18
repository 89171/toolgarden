import {
  calculateSavingsRatio,
  createBackgroundRemovedImageFilename,
  createCompressedImageFilename,
  createEditedImageFilename,
  createImageOutputFilename,
  formatFileSize,
  formatPixelLimit,
  getImageTargetConfig,
  inferImageMimeType,
  isSupportedImageInput,
  MAX_IMAGE_FILE_SIZE,
  MAX_IMAGE_PIXELS,
  normalizeImageQuality,
  normalizeCropRect,
  type ImageBackgroundRemovalModel,
  type ImageBackgroundRemovalOutcome,
  type ImageBackgroundRemovalProgress,
  type ImageCompressionOutputMode,
  type ImageCompressionOutcome,
  type ImageConversionOutcome,
  type ImageCropRect,
  type ImageEditOutcome,
  type ImageInspectionOutcome,
  type ImageTargetConfig,
  type ImageTargetFormat,
} from './image';

type WorkerFailureCode =
  | 'canvas_context'
  | 'conversion_failed'
  | 'load_failed'
  | 'too_many_pixels'
  | 'unsupported_output'
  | 'worker_unsupported';

interface WorkerSuccessMessage {
  id: string;
  ok: true;
  data: ArrayBuffer;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

interface WorkerCompressionSuccessMessage {
  id: string;
  ok: true;
  data: ArrayBuffer;
  filename: string;
  mimeType: string;
  format: ImageTargetFormat | 'original';
  width: number;
  height: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
  savingsRatio: number;
  quality?: number;
  strategy: 'reencoded' | 'kept-original';
}

interface WorkerErrorMessage {
  id: string;
  ok: false;
  code: WorkerFailureCode;
  detail?: string;
}

type WorkerMessage = WorkerSuccessMessage | WorkerCompressionSuccessMessage | WorkerErrorMessage;

interface LoadedImage {
  element: HTMLImageElement;
  width: number;
  height: number;
}

interface CompressionCandidate {
  format: ImageTargetFormat;
  mimeType: ImageTargetConfig['mimeType'];
  extension: ImageTargetConfig['extension'];
  qualities: Array<number | undefined>;
}

interface CandidateDiff {
  meanRgb: number;
  meanAlpha: number;
  maxChannel: number;
}

interface QuantizedPngCandidate {
  blob: Blob;
  colors?: number;
}

export interface ConvertImageOptions {
  quality?: number;
  jpegBackground?: string;
}

export interface CompressImageOptions {
  jpegBackground?: string;
  outputMode?: ImageCompressionOutputMode;
}

export interface CropResizeImageOptions {
  crop: ImageCropRect;
  outputWidth: number;
  outputHeight: number;
  targetFormat: ImageTargetFormat;
  quality?: number;
  jpegBackground?: string;
}

export interface RemoveImageBackgroundOptions {
  model?: ImageBackgroundRemovalModel;
  onProgress?: (progress: ImageBackgroundRemovalProgress) => void;
}

let imageWorker: Worker | null = null;
let imageWorkerUnavailable = false;
let workerRequestId = 0;

const JPEG_COMPRESSION_QUALITIES = [0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
const WEBP_COMPRESSION_QUALITIES = [0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
const PNG_QUANTIZED_COLORS = [256, 224, 192, 160, 128, 96];
const PNG_QUANTIZED_FALLBACK_MIN_COLORS = 160;
const SAMPLE_MAX_SIDE = 160;
const VISIBLE_DIFF_THRESHOLD = {
  meanRgb: 2.4,
  meanAlpha: 1.1,
  maxChannel: 52,
};
const PNG_QUANTIZED_TARGET_SAVINGS = 0.25;
const BACKGROUND_REMOVAL_PUBLIC_PATH =
  'https://staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/';

function getImageWorker(): Worker | null {
  if (imageWorkerUnavailable || typeof Worker === 'undefined') return null;
  if (imageWorker) return imageWorker;

  try {
    imageWorker = new Worker('/workers/image-converter.worker.js', { type: 'module' });
    return imageWorker;
  } catch {
    imageWorkerUnavailable = true;
    return null;
  }
}

function shouldFallbackFromWorker(code: WorkerFailureCode): boolean {
  return code !== 'too_many_pixels';
}

async function convertImageFileInWorker(
  file: File,
  targetFormat: ImageTargetFormat,
  options: ConvertImageOptions
): Promise<ImageConversionOutcome | null> {
  const worker = getImageWorker();
  if (!worker) return null;
  const activeWorker = worker;

  const target = getImageTargetConfig(targetFormat);
  const quality = target.supportsQuality
    ? normalizeImageQuality(options.quality ?? target.defaultQuality)
    : undefined;
  const sourceType = inferImageMimeType(file);
  const requestId = `image-${workerRequestId}`;
  workerRequestId += 1;

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(null);
    }, 120_000);

    function cleanup() {
      window.clearTimeout(timeout);
      activeWorker.removeEventListener('message', handleMessage);
      activeWorker.removeEventListener('error', handleError);
    }

    function handleError() {
      cleanup();
      imageWorkerUnavailable = true;
      activeWorker.terminate();
      if (imageWorker === activeWorker) {
        imageWorker = null;
      }
      resolve(null);
    }

    function handleMessage(event: MessageEvent<WorkerMessage>) {
      const message = event.data;
      if (message.id !== requestId) return;

      cleanup();

      if (message.ok) {
        const blob = new Blob([message.data], { type: target.mimeType });
        resolve({
          ok: true,
          blob,
          filename: message.filename,
          mimeType: target.mimeType,
          width: message.width,
          height: message.height,
          originalSize: message.originalSize,
          outputSize: message.outputSize,
          durationMs: message.durationMs,
        });
        return;
      }

      if (shouldFallbackFromWorker(message.code)) {
        resolve(null);
        return;
      }

      resolve({
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      });
    }

    activeWorker.addEventListener('message', handleMessage);
    activeWorker.addEventListener('error', handleError);

    file.arrayBuffer()
      .then((data) => {
        activeWorker.postMessage({
          id: requestId,
          file: {
            name: file.name,
            size: file.size,
            type: sourceType,
            data,
          },
          target,
          options: {
            quality,
            jpegBackground: options.jpegBackground ?? '#ffffff',
            maxPixels: MAX_IMAGE_PIXELS,
          },
        }, [data]);
      })
      .catch(() => {
        cleanup();
        resolve({ ok: false, code: 'load_failed' });
      });
  });
}

async function compressImageFileInWorker(
  file: File,
  options: CompressImageOptions
): Promise<ImageCompressionOutcome | null> {
  const worker = getImageWorker();
  if (!worker) return null;
  const activeWorker = worker;
  const sourceType = inferImageMimeType(file);
  const requestId = `compress-${workerRequestId}`;
  workerRequestId += 1;

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(null);
    }, 120_000);

    function cleanup() {
      window.clearTimeout(timeout);
      activeWorker.removeEventListener('message', handleMessage);
      activeWorker.removeEventListener('error', handleError);
    }

    function handleError() {
      cleanup();
      imageWorkerUnavailable = true;
      activeWorker.terminate();
      if (imageWorker === activeWorker) {
        imageWorker = null;
      }
      resolve(null);
    }

    function handleMessage(event: MessageEvent<WorkerMessage>) {
      const message = event.data;
      if (message.id !== requestId) return;

      cleanup();

      if (message.ok) {
        const blob = new Blob([message.data], { type: message.mimeType });
        const compressed = message as WorkerCompressionSuccessMessage;
        resolve({
          ok: true,
          blob,
          filename: compressed.filename,
          mimeType: compressed.mimeType,
          format: compressed.format,
          width: compressed.width,
          height: compressed.height,
          originalSize: compressed.originalSize,
          outputSize: compressed.outputSize,
          durationMs: compressed.durationMs,
          savingsRatio: compressed.savingsRatio,
          quality: compressed.quality,
          strategy: compressed.strategy,
        });
        return;
      }

      if (shouldFallbackFromWorker(message.code)) {
        resolve(null);
        return;
      }

      resolve({
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      });
    }

    activeWorker.addEventListener('message', handleMessage);
    activeWorker.addEventListener('error', handleError);

    file.arrayBuffer()
      .then((data) => {
        activeWorker.postMessage({
          id: requestId,
          task: 'compress',
          file: {
            name: file.name,
            size: file.size,
            type: sourceType,
            data,
          },
          options: {
            jpegBackground: options.jpegBackground ?? '#ffffff',
            maxPixels: MAX_IMAGE_PIXELS,
            outputMode: options.outputMode ?? 'preserve',
          },
        }, [data]);
      })
      .catch(() => {
        cleanup();
        resolve({ ok: false, code: 'load_failed' });
      });
  });
}

function loadImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        element: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };

    image.decoding = 'async';
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas export failed'));
        return;
      }

      resolve(blob);
    }, mimeType, quality);
  });
}

async function normalizeLoadedImageToPng(image: LoadedImage): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(image.element, 0, 0);
  return canvasToBlob(canvas, 'image/png');
}

function getCompressionCandidates(
  sourceType: string,
  outputMode: ImageCompressionOutputMode
): CompressionCandidate[] {
  const jpg = getImageTargetConfig('jpg');
  const png = getImageTargetConfig('png');
  const webp = getImageTargetConfig('webp');

  if (outputMode === 'webp') return [{ ...webp, qualities: WEBP_COMPRESSION_QUALITIES }];

  if (sourceType === 'image/jpeg') return [{ ...jpg, qualities: JPEG_COMPRESSION_QUALITIES }];
  if (sourceType === 'image/png') return [{ ...png, qualities: [undefined] }];
  if (sourceType === 'image/webp') return [{ ...webp, qualities: WEBP_COMPRESSION_QUALITIES }];

  return [];
}

function getSampleSize(width: number, height: number): { width: number; height: number } {
  const maxSide = Math.max(width, height);
  if (maxSide <= SAMPLE_MAX_SIDE) return { width, height };

  const scale = SAMPLE_MAX_SIDE / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function getCanvasSample(canvas: HTMLCanvasElement): ImageData | null {
  const sample = getSampleSize(canvas.width, canvas.height);
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sample.width;
  sampleCanvas.height = sample.height;
  const context = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(canvas, 0, 0, sample.width, sample.height);
  return context.getImageData(0, 0, sample.width, sample.height);
}

function canvasHasAlpha(sample: ImageData): boolean {
  const data = sample.data;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 250) return true;
  }
  return false;
}

async function loadBlobImage(blob: Blob): Promise<LoadedImage> {
  const file = new File([blob], 'candidate', { type: blob.type });
  return loadImage(file);
}

async function compareBlobToSample(blob: Blob, sourceSample: ImageData): Promise<CandidateDiff> {
  const candidate = await loadBlobImage(blob);
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sourceSample.width;
  sampleCanvas.height = sourceSample.height;
  const context = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas context failed');

  context.drawImage(candidate.element, 0, 0, sourceSample.width, sourceSample.height);
  const candidateSample = context.getImageData(0, 0, sourceSample.width, sourceSample.height);
  const source = sourceSample.data;
  const output = candidateSample.data;
  let rgbDiff = 0;
  let alphaDiff = 0;
  let maxChannel = 0;
  const pixelCount = sourceSample.width * sourceSample.height;

  for (let index = 0; index < source.length; index += 4) {
    const red = Math.abs(source[index] - output[index]);
    const green = Math.abs(source[index + 1] - output[index + 1]);
    const blue = Math.abs(source[index + 2] - output[index + 2]);
    const alpha = Math.abs(source[index + 3] - output[index + 3]);
    rgbDiff += red + green + blue;
    alphaDiff += alpha;
    maxChannel = Math.max(maxChannel, red, green, blue, alpha);
  }

  return {
    meanRgb: rgbDiff / (pixelCount * 3),
    meanAlpha: alphaDiff / pixelCount,
    maxChannel,
  };
}

function isVisuallySafe(diff: CandidateDiff, hasAlpha: boolean): boolean {
  return (
    diff.meanRgb <= VISIBLE_DIFF_THRESHOLD.meanRgb &&
    diff.maxChannel <= VISIBLE_DIFF_THRESHOLD.maxChannel &&
    (!hasAlpha || diff.meanAlpha <= VISIBLE_DIFF_THRESHOLD.meanAlpha)
  );
}

function getQuantizedPngMeanRgbLimit(colors: number): number {
  if (colors >= 256) return 9.2;
  if (colors >= 224) return 8.8;
  if (colors >= 192) return 8.4;
  if (colors >= 160) return 8;
  if (colors >= 128) return 6.8;
  return 6;
}

function isQuantizedPngVisuallySafe(
  diff: CandidateDiff,
  hasAlpha: boolean,
  colors: number
): boolean {
  return (
    diff.meanRgb <= getQuantizedPngMeanRgbLimit(colors) &&
    (!hasAlpha || diff.meanAlpha <= 1.8)
  );
}

function shouldUseCandidate(
  blobSize: number,
  originalSize: number,
  outputMode: ImageCompressionOutputMode
): boolean {
  if (outputMode === 'webp') return true;
  return blobSize < originalSize;
}

async function exportCompressionCandidate(
  sourceCanvas: HTMLCanvasElement,
  candidate: CompressionCandidate,
  quality: number | undefined,
  jpegBackground: string
): Promise<Blob | null> {
  if (candidate.mimeType !== 'image/jpeg') {
    return canvasToBlob(sourceCanvas, candidate.mimeType, quality);
  }

  const jpegCanvas = document.createElement('canvas');
  jpegCanvas.width = sourceCanvas.width;
  jpegCanvas.height = sourceCanvas.height;
  const context = jpegCanvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = jpegBackground;
  context.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
  context.drawImage(sourceCanvas, 0, 0);
  return canvasToBlob(jpegCanvas, candidate.mimeType, quality);
}

async function encodeQuantizedPng(
  canvas: HTMLCanvasElement,
  colors: number
): Promise<Blob> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context failed');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const UPNGModule = await import('upng-js');
  const encodePng = UPNGModule.default?.encode ?? UPNGModule.encode;
  const encoded = encodePng(
    [imageData.data.buffer.slice(0)],
    canvas.width,
    canvas.height,
    colors
  );

  return new Blob([encoded], { type: 'image/png' });
}

async function findBestQuantizedPng(
  canvas: HTMLCanvasElement,
  sourceSample: ImageData,
  originalSize: number,
  hasAlpha: boolean
): Promise<QuantizedPngCandidate | null> {
  let bestFallback: (QuantizedPngCandidate & { savingsRatio: number }) | null = null;

  const losslessBlob = await encodeQuantizedPng(canvas, 0);
  if (losslessBlob.size < originalSize) {
    bestFallback = {
      blob: losslessBlob,
      savingsRatio: calculateSavingsRatio(originalSize, losslessBlob.size),
    };
  }

  for (const colors of PNG_QUANTIZED_COLORS) {
    const blob = await encodeQuantizedPng(canvas, colors);
    if (blob.size >= originalSize) continue;

    const diff = await compareBlobToSample(blob, sourceSample);
    if (!isQuantizedPngVisuallySafe(diff, hasAlpha, colors)) continue;

    const savingsRatio = calculateSavingsRatio(originalSize, blob.size);
    const candidate = { blob, colors, savingsRatio };

    if (savingsRatio >= PNG_QUANTIZED_TARGET_SAVINGS) {
      return candidate;
    }

    if (
      colors >= PNG_QUANTIZED_FALLBACK_MIN_COLORS &&
      (!bestFallback || savingsRatio > bestFallback.savingsRatio)
    ) {
      bestFallback = candidate;
    }
  }

  return bestFallback;
}

async function compressImageFileOnMainThread(
  file: File,
  options: CompressImageOptions = {}
): Promise<ImageCompressionOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const startedAt = performance.now();
  const sourceType = inferImageMimeType(file);
  const sourceFile = sourceType === file.type ? file : new File([file], file.name, { type: sourceType });
  const jpegBackground = options.jpegBackground ?? '#ffffff';
  const outputMode = options.outputMode ?? 'preserve';

  try {
    const image = await loadImage(sourceFile);
    const pixelCount = image.width * image.height;

    if (!image.width || !image.height) {
      return { ok: false, code: 'load_failed' };
    }

    if (pixelCount > MAX_IMAGE_PIXELS) {
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    const context = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!context) return { ok: false, code: 'canvas_context' };

    context.drawImage(image.element, 0, 0);
    const sourceSample = getCanvasSample(sourceCanvas);
    if (!sourceSample) return { ok: false, code: 'canvas_context' };

    const hasAlpha = canvasHasAlpha(sourceSample);
    const candidates = getCompressionCandidates(sourceType, outputMode);
    let best:
      | {
          blob: Blob;
          candidate: CompressionCandidate;
          quality?: number;
          quantizedColors?: number;
        }
      | null = null;

    if (sourceType === 'image/png' && outputMode === 'preserve') {
      const quantized = await findBestQuantizedPng(sourceCanvas, sourceSample, file.size, hasAlpha);
      if (quantized) {
        best = {
          blob: quantized.blob,
          candidate: {
            ...getImageTargetConfig('png'),
            qualities: [undefined],
          },
          quantizedColors: quantized.colors,
        };
      }
    }

    for (const candidate of candidates) {
      for (const quality of candidate.qualities) {
        const blob = await exportCompressionCandidate(sourceCanvas, candidate, quality, jpegBackground);
        if (
          !blob ||
          (blob.type && blob.type !== candidate.mimeType) ||
          !shouldUseCandidate(blob.size, file.size, outputMode)
        ) continue;

        const diff = await compareBlobToSample(blob, sourceSample);
        if (!isVisuallySafe(diff, hasAlpha)) continue;
        if (!best || blob.size < best.blob.size) {
          best = { blob, candidate, quality };
        }
      }
    }

    if (!best) {
      return {
        ok: true,
        blob: file,
        filename: file.name,
        mimeType: sourceType || file.type || 'application/octet-stream',
        format: 'original',
        width: image.width,
        height: image.height,
        originalSize: file.size,
        outputSize: file.size,
        durationMs: Math.round(performance.now() - startedAt),
        savingsRatio: 0,
        strategy: 'kept-original',
      };
    }

    return {
      ok: true,
      blob: best.blob,
      filename: createCompressedImageFilename(file.name, best.candidate.extension),
      mimeType: best.candidate.mimeType,
      format: best.candidate.format,
      width: image.width,
      height: image.height,
      originalSize: file.size,
      outputSize: best.blob.size,
      durationMs: Math.round(performance.now() - startedAt),
      savingsRatio: calculateSavingsRatio(file.size, best.blob.size),
      quality: best.quality,
      quantizedColors: best.quantizedColors,
      strategy: 'reencoded',
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

async function convertImageFileOnMainThread(
  file: File,
  targetFormat: ImageTargetFormat,
  options: ConvertImageOptions = {}
): Promise<ImageConversionOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const startedAt = performance.now();
  const target = getImageTargetConfig(targetFormat);
  const sourceType = inferImageMimeType(file);
  const sourceFile = sourceType === file.type ? file : new File([file], file.name, { type: sourceType });

  try {
    const image = await loadImage(sourceFile);
    const pixelCount = image.width * image.height;

    if (!image.width || !image.height) {
      return { ok: false, code: 'load_failed' };
    }

    if (pixelCount > MAX_IMAGE_PIXELS) {
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    if (!context) return { ok: false, code: 'canvas_context' };

    if (target.mimeType === 'image/jpeg') {
      context.fillStyle = options.jpegBackground ?? '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image.element, 0, 0);

    const quality = target.supportsQuality
      ? normalizeImageQuality(options.quality ?? target.defaultQuality)
      : undefined;
    const blob = await canvasToBlob(canvas, target.mimeType, quality);

    if (blob.type && blob.type !== target.mimeType) {
      return {
        ok: false,
        code: 'unsupported_output',
        detail: target.label,
      };
    }

    return {
      ok: true,
      blob,
      filename: createImageOutputFilename(file.name, target.extension),
      mimeType: target.mimeType,
      width: image.width,
      height: image.height,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

export async function inspectImageFile(file: File): Promise<ImageInspectionOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const sourceType = inferImageMimeType(file);
  const sourceFile = sourceType === file.type ? file : new File([file], file.name, { type: sourceType });

  try {
    const image = await loadImage(sourceFile);
    const pixelCount = image.width * image.height;

    if (!image.width || !image.height) {
      return { ok: false, code: 'load_failed' };
    }

    if (pixelCount > MAX_IMAGE_PIXELS) {
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    return {
      ok: true,
      filename: file.name,
      mimeType: sourceType,
      width: image.width,
      height: image.height,
      size: file.size,
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

function createBackgroundRemovalProgress(
  label: string,
  current: number,
  total: number
): ImageBackgroundRemovalProgress {
  const isComputeStage = label.startsWith('compute:');
  const safeTotal = Math.max(1, total);

  return {
    stage: isComputeStage ? 'compute' : 'model',
    label,
    current,
    total: safeTotal,
    percent: Math.max(0, Math.min(100, Math.round((current / safeTotal) * 100))),
  };
}

export async function removeImageBackground(
  file: File,
  options: RemoveImageBackgroundOptions = {}
): Promise<ImageBackgroundRemovalOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const startedAt = performance.now();
  const sourceType = inferImageMimeType(file);
  const sourceFile = sourceType === file.type ? file : new File([file], file.name, { type: sourceType });

  try {
    const image = await loadImage(sourceFile);
    const pixelCount = image.width * image.height;

    if (!image.width || !image.height) {
      return { ok: false, code: 'load_failed' };
    }

    if (pixelCount > MAX_IMAGE_PIXELS) {
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    const modelInput = await normalizeLoadedImageToPng(image);
    if (!modelInput) return { ok: false, code: 'canvas_context' };

    const backgroundRemoval = await import('@imgly/background-removal');
    const removeBackground = backgroundRemoval.removeBackground;
    const modelMap = {
      medium: 'isnet_fp16',
      small: 'isnet_quint8',
    } as const;
    const blob = await removeBackground(modelInput, {
      publicPath: BACKGROUND_REMOVAL_PUBLIC_PATH,
      model: modelMap[options.model ?? 'medium'],
      output: {
        format: 'image/png',
        quality: 1,
      },
      progress: (label: string, current: number, total: number) => {
        options.onProgress?.(createBackgroundRemovalProgress(label, current, total));
      },
    });
    const outputBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });

    return {
      ok: true,
      blob: outputBlob,
      filename: createBackgroundRemovedImageFilename(file.name),
      mimeType: 'image/png',
      width: image.width,
      height: image.height,
      originalSize: file.size,
      outputSize: outputBlob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      code: 'canvas_export',
      detail: error instanceof Error ? error.message : undefined,
    };
  }
}

export async function cropResizeImageFile(
  file: File,
  options: CropResizeImageOptions
): Promise<ImageEditOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const outputWidth = Math.max(1, Math.round(options.outputWidth));
  const outputHeight = Math.max(1, Math.round(options.outputHeight));

  if (outputWidth * outputHeight > MAX_IMAGE_PIXELS) {
    return {
      ok: false,
      code: 'too_many_pixels',
      maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
    };
  }

  const startedAt = performance.now();
  const sourceType = inferImageMimeType(file);
  const sourceFile = sourceType === file.type ? file : new File([file], file.name, { type: sourceType });
  const target = getImageTargetConfig(options.targetFormat);

  try {
    const image = await loadImage(sourceFile);
    const pixelCount = image.width * image.height;

    if (!image.width || !image.height) {
      return { ok: false, code: 'load_failed' };
    }

    if (pixelCount > MAX_IMAGE_PIXELS) {
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    const crop = normalizeCropRect(options.crop, image.width, image.height);
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext('2d');
    if (!context) return { ok: false, code: 'canvas_context' };

    if (target.mimeType === 'image/jpeg') {
      context.fillStyle = options.jpegBackground ?? '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image.element,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const quality = target.supportsQuality
      ? normalizeImageQuality(options.quality ?? target.defaultQuality)
      : undefined;
    const blob = await canvasToBlob(canvas, target.mimeType, quality);

    if (blob.type && blob.type !== target.mimeType) {
      return {
        ok: false,
        code: 'unsupported_output',
        detail: target.label,
      };
    }

    return {
      ok: true,
      blob,
      filename: createEditedImageFilename(file.name, target.extension),
      mimeType: target.mimeType,
      format: target.format,
      width: outputWidth,
      height: outputHeight,
      sourceWidth: image.width,
      sourceHeight: image.height,
      crop,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

export async function convertImageFile(
  file: File,
  targetFormat: ImageTargetFormat,
  options: ConvertImageOptions = {}
): Promise<ImageConversionOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const workerResult = await convertImageFileInWorker(file, targetFormat, options);
  if (workerResult) return workerResult;

  return convertImageFileOnMainThread(file, targetFormat, options);
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<ImageCompressionOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || 'unknown',
    };
  }

  const sourceType = inferImageMimeType(file);
  const outputMode = options.outputMode ?? 'preserve';
  const shouldUseWorker = !(sourceType === 'image/png' && outputMode === 'preserve');
  const workerResult = shouldUseWorker ? await compressImageFileInWorker(file, options) : null;
  if (workerResult) return workerResult;

  return compressImageFileOnMainThread(file, options);
}
