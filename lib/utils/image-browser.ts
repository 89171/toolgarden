import {
  calculateSavingsRatio,
  clampNumber,
  createBackgroundRemovedImageFilename,
  createCompressedImageFilename,
  createEditedImageFilename,
  createImageOutputFilename,
  createUpscaledImageFilename,
  createWatermarkRemovedImageFilename,
  formatFileSize,
  formatPixelLimit,
  getBasicImageTargetConfig,
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
  type ImageCompressionStrategy,
  type ImageConversionOutcome,
  type ImageCropRect,
  type ImageEditOutcome,
  type ImageInspectionOutcome,
  type ImageUpscaleMode,
  type ImageUpscaleOutcome,
  type ImageUpscaleSuccess,
  type ImageTargetConfig,
  type ImageTargetFormat,
  type ImageWatermarkRemovalMethod,
  type ImageWatermarkRemovalOutcome,
  type ImageWatermarkRemovalProgress,
  type BasicImageTargetFormat,
} from './image';

type OrtWasmModule = typeof import('onnxruntime-web/wasm');
type OrtInferenceSession = Awaited<ReturnType<OrtWasmModule['InferenceSession']['create']>>;
type PicaInstance = ReturnType<typeof import('pica')['default']>;
type SvgoBrowserModule = typeof import('svgo/browser');

interface AvifEncodeOptions {
  quality: number;
  qualityAlpha: number;
  denoiseLevel: number;
  tileRowsLog2: number;
  tileColsLog2: number;
  speed: number;
  subsample: number;
  chromaDeltaQ: boolean;
  sharpness: number;
  enableSharpYUV: boolean;
  tune: number;
  bitDepth: number;
}

interface AvifEncoderModule {
  encode(data: BufferSource, width: number, height: number, options: AvifEncodeOptions): Uint8Array | null;
}

type AvifModuleFactory = (options?: {
  locateFile?: (path: string) => string;
  noInitialRun?: boolean;
}) => Promise<AvifEncoderModule>;

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

interface RasterSize {
  width: number;
  height: number;
}

interface SvgConversionSizes {
  outputSize: RasterSize;
  renderSize: RasterSize;
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

export interface UpscaleImageOptions {
  outputWidth: number;
  outputHeight: number;
  targetFormat: BasicImageTargetFormat;
  mode?: ImageUpscaleMode;
  quality?: number;
  jpegBackground?: string;
}

export interface RemoveImageWatermarkOptions {
  selection: ImageCropRect;
  targetFormat: ImageTargetFormat;
  method?: ImageWatermarkRemovalMethod;
  quality?: number;
  feather?: number;
  jpegBackground?: string;
  onProgress?: (progress: ImageWatermarkRemovalProgress) => void;
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
const ONNX_WASM_PUBLIC_PATH = '/models/onnxruntime-web/';
const WATERMARK_MIGAN_MODEL_URL = 'https://huggingface.co/andraniksargsyan/migan/resolve/main/migan_pipeline_v2.onnx';
const WATERMARK_AI_MODEL_URL = 'https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx';
const WATERMARK_AI_INPUT_SIZE = 512;
const SVG_OUTPUT_SCALE = 3;
const SVG_MIN_RENDER_LONG_SIDE = 2048;
const SVG_MAX_RENDER_LONG_SIDE = 4096;
const WATERMARK_TEXT = 'https://toolgarden.xyz';
const WATERMARK_ALLOWED_ROOT_HOSTNAMES = ['toolgarden.xyz', 'json-toolkit.xyz'] as const;
const WATERMARK_REPAIR_DISTANCE_POWER = 1.35;

let watermarkInpaintSessionPromise:
  | Promise<{ ort: OrtWasmModule; session: OrtInferenceSession }>
  | null = null;
let watermarkMiganSessionPromise:
  | Promise<{ ort: OrtWasmModule; session: OrtInferenceSession }>
  | null = null;
let svgCanvasResizerPromise: Promise<PicaInstance> | null = null;
let svgoBrowserPromise: Promise<SvgoBrowserModule> | null = null;
let avifEncoderPromise: Promise<AvifEncoderModule> | null = null;

interface WatermarkedImageOutput {
  blob: Blob;
  mimeType: ImageTargetConfig['mimeType'];
  format: ImageTargetFormat;
  extension: ImageTargetConfig['extension'];
}

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
  if (targetFormat === 'avif') return null;
  if (inferImageMimeType(file) === 'image/svg+xml') return null;

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

function parseSvgLength(value: string | null): number | null {
  if (!value) return null;

  const match = value.trim().match(/^([+-]?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/i);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  switch (match[2].toLowerCase()) {
    case '':
    case 'px':
      return amount;
    case 'in':
      return amount * 96;
    case 'cm':
      return (amount * 96) / 2.54;
    case 'mm':
      return (amount * 96) / 25.4;
    case 'pt':
      return (amount * 96) / 72;
    case 'pc':
      return amount * 16;
    default:
      return null;
  }
}

function parseSvgViewBox(value: string | null): RasterSize | null {
  if (!value) return null;

  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;

  const [, , width, height] = parts;
  if (width <= 0 || height <= 0) return null;

  return { width, height };
}

function getScaledRasterSize(width: number, height: number, targetLongSide: number): RasterSize {
  const scale = targetLongSide / Math.max(width, height);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function normalizeRasterSize(size: RasterSize): RasterSize {
  return {
    width: Math.max(1, Math.round(size.width)),
    height: Math.max(1, Math.round(size.height)),
  };
}

function clampSvgRenderSize(size: RasterSize): RasterSize {
  let { width, height } = normalizeRasterSize(size);

  if (Math.max(width, height) > SVG_MAX_RENDER_LONG_SIDE) {
    const scaled = getScaledRasterSize(width, height, SVG_MAX_RENDER_LONG_SIDE);
    width = scaled.width;
    height = scaled.height;
  }

  const pixelCount = width * height;
  if (pixelCount > MAX_IMAGE_PIXELS) {
    const scale = Math.sqrt(MAX_IMAGE_PIXELS / pixelCount);
    width = Math.max(1, Math.floor(width * scale));
    height = Math.max(1, Math.floor(height * scale));
  }

  return { width, height };
}

function parseSvgDocument(svgText: string): Document | null {
  const normalizedText = svgText.replace(/^\uFEFF/, '').trim();
  const document = new DOMParser().parseFromString(normalizedText, 'image/svg+xml');
  const root = document.documentElement;

  if (!root || root.nodeName.toLowerCase() !== 'svg') return null;
  if (root.querySelector('parsererror')) return null;

  return document;
}

function getSvgDocumentRoot(svgText: string): Element | null {
  const document = parseSvgDocument(svgText);
  if (!document) return null;

  const root = document.documentElement;

  return root;
}

function getSvgDocumentSize(svgText: string): RasterSize | null {
  const root = getSvgDocumentRoot(svgText);
  if (!root) return null;

  const viewBox = parseSvgViewBox(root.getAttribute('viewBox'));
  let width = parseSvgLength(root.getAttribute('width'));
  let height = parseSvgLength(root.getAttribute('height'));

  if ((!width || !height) && viewBox) {
    const aspectRatio = viewBox.width / viewBox.height;

    if (width && !height) {
      height = width / aspectRatio;
    } else if (!width && height) {
      width = height * aspectRatio;
    } else {
      width = viewBox.width;
      height = viewBox.height;
    }
  }

  if (!width || !height) return viewBox;

  return { width, height };
}

function minifySvgText(svgText: string): string {
  return svgText
    .replace(/^\uFEFF/, '')
    .replace(/<\?xml[\s\S]*?\?>\s*/i, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+\/>/g, '/>')
    .replace(/\s+>/g, '>')
    .trim();
}

const SVG_REMOVABLE_ELEMENT_NAMES = new Set([
  'metadata',
  'sodipodi:namedview',
]);

const SVG_REMOVABLE_ATTRIBUTE_NAMES = new Set([
  'baseProfile',
  'version',
]);

const SVG_REMOVABLE_ATTRIBUTE_PREFIXES = [
  'data-',
  'inkscape:',
  'sodipodi:',
  'sketch:',
];

const SVG_REMOVABLE_NAMESPACE_PREFIXES = [
  'cc',
  'dc',
  'inkscape',
  'rdf',
  'serif',
  'sketch',
  'sodipodi',
];

const SVG_NUMERIC_ATTRIBUTE_NAMES = new Set([
  'cx',
  'cy',
  'dx',
  'dy',
  'fill-opacity',
  'font-size',
  'height',
  'letter-spacing',
  'offset',
  'opacity',
  'r',
  'rx',
  'ry',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'viewBox',
  'width',
  'word-spacing',
  'x',
  'x1',
  'x2',
  'y',
  'y1',
  'y2',
]);

const SVG_TRANSFORM_ATTRIBUTE_NAMES = new Set([
  'gradientTransform',
  'patternTransform',
  'transform',
]);

function normalizeSvgNumberToken(token: string): string {
  if (/[eE]/.test(token)) return token;

  let output = token
    .replace(/^(-?)0+(\d)/, '$1$2')
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '')
    .replace(/^(-?)0\./, '$1.');

  if (output === '-0') output = '0';
  if (output === '' || output === '-' || output === '-.') return token;

  return output;
}

function minifySvgNumbers(value: string): string {
  return value.replace(/-?(?:\d+\.\d+|\d+\.|\.\d+)/g, normalizeSvgNumberToken);
}

function minifySvgListValue(value: string): string {
  return minifySvgNumbers(value)
    .trim()
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/ ?([+\-])(?=\d|\.)/g, '$1');
}

function minifySvgPathData(value: string): string {
  return minifySvgNumbers(value)
    .trim()
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/\s*([AaCcHhLlMmQqSsTtVvZz])\s*/g, '$1')
    .replace(/ ?([+\-])(?=\d|\.)/g, '$1')
    .replace(/([AaCcHhLlMmQqSsTtVvZz]),/g, '$1')
    .replace(/,([AaCcHhLlMmQqSsTtVvZz])/g, '$1');
}

function minifySvgTransformValue(value: string): string {
  return minifySvgListValue(value)
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+\)/g, ')');
}

function minifySvgStyleValue(value: string): string {
  return value
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex === -1) return entry;

      const property = entry.slice(0, separatorIndex).trim();
      const propertyValue = entry.slice(separatorIndex + 1).trim();
      return `${property}:${minifySvgNumbers(propertyValue).replace(/\s+/g, ' ')}`;
    })
    .join(';');
}

function shouldRemoveSvgAttribute(name: string): boolean {
  if (SVG_REMOVABLE_ATTRIBUTE_NAMES.has(name)) return true;
  return SVG_REMOVABLE_ATTRIBUTE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

function optimizeSvgAttributeValue(name: string, value: string): string {
  if (name === 'd') return minifySvgPathData(value);
  if (name === 'points' || SVG_NUMERIC_ATTRIBUTE_NAMES.has(name)) return minifySvgListValue(value);
  if (name === 'style') return minifySvgStyleValue(value);
  if (SVG_TRANSFORM_ATTRIBUTE_NAMES.has(name)) return minifySvgTransformValue(value);

  return value.trim();
}

function optimizeSvgElement(element: Element) {
  const elementName = element.nodeName;
  if (SVG_REMOVABLE_ELEMENT_NAMES.has(elementName)) {
    element.remove();
    return;
  }

  for (const attribute of Array.from(element.attributes)) {
    if (shouldRemoveSvgAttribute(attribute.name)) {
      element.removeAttribute(attribute.name);
      continue;
    }

    const optimizedValue = optimizeSvgAttributeValue(attribute.name, attribute.value);
    if (optimizedValue !== attribute.value) {
      element.setAttribute(attribute.name, optimizedValue);
    }
  }

  for (const child of Array.from(element.children)) {
    optimizeSvgElement(child);
  }
}

function optimizeSvgWithDom(svgText: string): string | null {
  const document = parseSvgDocument(svgText);
  if (!document) return null;

  const root = document.documentElement;
  optimizeSvgElement(root);

  let optimizedText = minifySvgText(new XMLSerializer().serializeToString(root));
  for (const prefix of ['xlink', ...SVG_REMOVABLE_NAMESPACE_PREFIXES]) {
    const textWithoutDeclaration = optimizedText.replace(new RegExp(`\\s+xmlns:${prefix}="[^"]*"`, 'i'), '');
    if (!textWithoutDeclaration.includes(`${prefix}:`)) {
      optimizedText = textWithoutDeclaration;
    }
  }

  return optimizedText;
}

function getSvgoBrowser(): Promise<SvgoBrowserModule> {
  svgoBrowserPromise ??= import('svgo/browser').catch((error) => {
    svgoBrowserPromise = null;
    throw error;
  });

  return svgoBrowserPromise;
}

async function optimizeSvgWithSvgo(svgText: string): Promise<string | null> {
  try {
    const { optimize } = await getSvgoBrowser();
    const result = optimize(svgText, {
      multipass: true,
      floatPrecision: 3,
      plugins: ['preset-default'],
      js2svg: {
        pretty: false,
      },
    });

    return result.data;
  } catch {
    return null;
  }
}

async function chooseSmallestValidSvgText(svgText: string): Promise<string> {
  const fallback = minifySvgText(svgText);
  const candidates = [fallback];
  const domOptimized = optimizeSvgWithDom(svgText);
  if (domOptimized) candidates.push(domOptimized);
  const svgoOptimized = await optimizeSvgWithSvgo(svgText);
  if (svgoOptimized) candidates.push(svgoOptimized);

  return candidates
    .filter((candidate) => Boolean(getSvgDocumentRoot(candidate)))
    .reduce(
      (best, candidate) => (
        new Blob([candidate], { type: 'image/svg+xml' }).size < new Blob([best], { type: 'image/svg+xml' }).size
          ? candidate
          : best
      ),
      fallback
    );
}

async function getSvgDisplaySize(file: File, svgText: string): Promise<RasterSize> {
  const parsedSize = getSvgDocumentSize(svgText);
  if (parsedSize && parsedSize.width > 0 && parsedSize.height > 0) {
    return normalizeRasterSize(parsedSize);
  }

  try {
    const typedFile = new File([file], file.name, { type: 'image/svg+xml' });
    const image = await loadImage(typedFile);
    return {
      width: Math.max(1, image.width),
      height: Math.max(1, image.height),
    };
  } catch {
    return { width: 0, height: 0 };
  }
}

async function getSvgConversionSizes(file: File, fallback: RasterSize): Promise<SvgConversionSizes> {
  let baseSize: RasterSize | null = null;

  try {
    baseSize = getSvgDocumentSize(await file.text());
  } catch {
    baseSize = null;
  }

  const fallbackSize = {
    width: Math.max(1, fallback.width),
    height: Math.max(1, fallback.height),
  };
  const parsedSize = baseSize && baseSize.width > 0 && baseSize.height > 0 ? baseSize : fallbackSize;
  const outputSize = normalizeRasterSize({
    width: parsedSize.width * SVG_OUTPUT_SCALE,
    height: parsedSize.height * SVG_OUTPUT_SCALE,
  });
  const longSide = Math.max(outputSize.width, outputSize.height);
  const renderBaseSize = longSide < SVG_MIN_RENDER_LONG_SIDE
    ? getScaledRasterSize(outputSize.width, outputSize.height, SVG_MIN_RENDER_LONG_SIDE)
    : outputSize;

  return {
    outputSize,
    renderSize: longSide < SVG_MIN_RENDER_LONG_SIDE ? clampSvgRenderSize(renderBaseSize) : renderBaseSize,
  };
}

async function getSvgCanvasResizer(): Promise<PicaInstance> {
  if (!svgCanvasResizerPromise) {
    svgCanvasResizerPromise = import('pica')
      .then(({ default: createPica }) => createPica({ features: ['js'] }))
      .catch((error) => {
        svgCanvasResizerPromise = null;
        throw error;
      });
  }

  return svgCanvasResizerPromise;
}

function setHighQualitySmoothing(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
}

function createRasterCanvas(size: RasterSize): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
}

function drawCanvasWithSteppedDownscale(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement): boolean {
  let currentCanvas = sourceCanvas;

  while (
    currentCanvas.width > targetCanvas.width * 2 ||
    currentCanvas.height > targetCanvas.height * 2
  ) {
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = Math.max(targetCanvas.width, Math.round(currentCanvas.width / 2));
    nextCanvas.height = Math.max(targetCanvas.height, Math.round(currentCanvas.height / 2));
    const nextContext = nextCanvas.getContext('2d');
    if (!nextContext) return false;

    setHighQualitySmoothing(nextContext);
    nextContext.drawImage(
      currentCanvas,
      0,
      0,
      currentCanvas.width,
      currentCanvas.height,
      0,
      0,
      nextCanvas.width,
      nextCanvas.height
    );
    currentCanvas = nextCanvas;
  }

  const targetContext = targetCanvas.getContext('2d');
  if (!targetContext) return false;

  targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  setHighQualitySmoothing(targetContext);
  targetContext.drawImage(
    currentCanvas,
    0,
    0,
    currentCanvas.width,
    currentCanvas.height,
    0,
    0,
    targetCanvas.width,
    targetCanvas.height
  );
  return true;
}

function createLoadedImageCanvas(image: LoadedImage): HTMLCanvasElement | null {
  const canvas = createRasterCanvas({ width: image.width, height: image.height });
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(image.element, 0, 0);
  return canvas;
}

async function resizeImageWithSharpEnhancement(
  image: LoadedImage,
  outputSize: RasterSize
): Promise<HTMLCanvasElement | null> {
  const sourceCanvas = createLoadedImageCanvas(image);
  if (!sourceCanvas) return null;

  const outputCanvas = createRasterCanvas(outputSize);

  try {
    const resizer = await getSvgCanvasResizer();
    await resizer.resize(sourceCanvas, outputCanvas, {
      quality: 3,
      filter: 'mks2013',
      unsharpAmount: 70,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    });
    return outputCanvas;
  } catch {
    const context = outputCanvas.getContext('2d');
    if (!context) return null;

    setHighQualitySmoothing(context);
    context.drawImage(image.element, 0, 0, image.width, image.height, 0, 0, outputSize.width, outputSize.height);
    return outputCanvas;
  }
}

async function resizeSvgRenderCanvas(
  renderCanvas: HTMLCanvasElement,
  outputSize: RasterSize
): Promise<HTMLCanvasElement | null> {
  const outputCanvas = createRasterCanvas(outputSize);

  if (renderCanvas.width === outputCanvas.width && renderCanvas.height === outputCanvas.height) {
    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) return null;

    outputContext.drawImage(renderCanvas, 0, 0);
    return outputCanvas;
  }

  try {
    const resizer = await getSvgCanvasResizer();
    await resizer.resize(renderCanvas, outputCanvas, {
      quality: 3,
      filter: 'mks2013',
      unsharpAmount: 40,
      unsharpRadius: 0.5,
      unsharpThreshold: 1,
    });
    return outputCanvas;
  } catch {
    return drawCanvasWithSteppedDownscale(renderCanvas, outputCanvas) ? outputCanvas : null;
  }
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

function shouldWatermarkImageOutput(): boolean {
  if (typeof window === 'undefined') return false;
  return !isWatermarkAllowedHostname(window.location.hostname);
}

function isWatermarkAllowedHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '');

  return WATERMARK_ALLOWED_ROOT_HOSTNAMES.some(
    (allowedHostname) =>
      normalizedHostname === allowedHostname || normalizedHostname.endsWith(`.${allowedHostname}`)
  );
}

function getWatermarkTargetConfig(mimeType: string): ImageTargetConfig {
  if (mimeType === 'image/jpeg') return getImageTargetConfig('jpg');
  if (mimeType === 'image/webp') return getImageTargetConfig('webp');
  if (mimeType === 'image/avif') return getImageTargetConfig('avif');
  return getImageTargetConfig('png');
}

async function importPublicEsmModule<T>(url: string): Promise<T> {
  const runtimeImport = new Function('moduleUrl', 'return import(moduleUrl)') as (moduleUrl: string) => Promise<T>;
  return runtimeImport(url);
}

async function getAvifEncoder(): Promise<AvifEncoderModule> {
  if (!avifEncoderPromise) {
    avifEncoderPromise = importPublicEsmModule<{ default: AvifModuleFactory }>('/vendor/jsquash-avif/avif_enc.js')
      .then((module) => module.default({
        noInitialRun: true,
        locateFile: (path) => `/vendor/jsquash-avif/${path}`,
      }));
  }

  return avifEncoderPromise;
}

async function encodeCanvasToAvifBlob(
  canvas: HTMLCanvasElement,
  quality?: number
): Promise<Blob> {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas context failed');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const avifEncoder = await getAvifEncoder();
  const encoded = avifEncoder.encode(new Uint8Array(imageData.data.buffer), imageData.width, imageData.height, {
    quality: Math.round(normalizeImageQuality(quality ?? getImageTargetConfig('avif').defaultQuality) * 100),
    qualityAlpha: -1,
    denoiseLevel: 0,
    tileRowsLog2: 0,
    tileColsLog2: 0,
    bitDepth: 8,
    speed: 6,
    subsample: 1,
    chromaDeltaQ: false,
    sharpness: 0,
    enableSharpYUV: false,
    tune: 0,
  });
  if (!encoded) throw new Error('AVIF encoding failed');

  const bytes = new Uint8Array(encoded.byteLength);
  bytes.set(encoded);
  return new Blob([bytes], { type: 'image/avif' });
}

function bytesStartWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

function bytesAscii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end));
}

function bytesMatchMime(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === 'image/png') {
    return bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }

  if (mimeType === 'image/jpeg') {
    return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
  }

  if (mimeType === 'image/webp') {
    return bytesAscii(bytes, 0, 4) === 'RIFF' && bytesAscii(bytes, 8, 12) === 'WEBP';
  }

  if (mimeType === 'image/avif') {
    return bytesAscii(bytes, 4, 8) === 'ftyp' && /avif|avis/i.test(bytesAscii(bytes, 8, 32));
  }

  return true;
}

async function blobMatchesMime(blob: Blob, mimeType: string): Promise<boolean> {
  const bytes = new Uint8Array(await blob.slice(0, 32).arrayBuffer());
  return bytesMatchMime(bytes, mimeType);
}

function drawWatermark(context: CanvasRenderingContext2D, width: number, height: number) {
  if (!width || !height) return;

  let fontSize = clampNumber(Math.round(Math.min(width, height) * 0.08), 14, 72);

  do {
    context.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    if (context.measureText(WATERMARK_TEXT).width <= width * 0.86 || fontSize <= 8) break;
    fontSize -= 1;
  } while (fontSize > 8);

  const diagonal = Math.hypot(width, height);

  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 6);
  context.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const textWidth = context.measureText(WATERMARK_TEXT).width;
  const stepX = clampNumber(textWidth + fontSize * 7.2, 220, 720);
  const stepY = clampNumber(fontSize * 7.5, 120, 420);
  const startX = -diagonal - stepX;
  const endX = diagonal + stepX;
  const startY = -diagonal - stepY;
  const endY = diagonal + stepY;

  context.fillStyle = 'rgba(255, 255, 255, 0.42)';

  for (let y = startY; y <= endY; y += stepY) {
    const rowOffset = Math.round(y / stepY) % 2 === 0 ? 0 : stepX / 2;

    for (let x = startX + rowOffset; x <= endX; x += stepX) {
      context.fillText(WATERMARK_TEXT, x, y);
    }
  }

  context.restore();
}

async function addWatermarkToCanvasBlob(
  canvas: HTMLCanvasElement,
  target: ImageTargetConfig,
  quality?: number
): Promise<WatermarkedImageOutput> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context failed');

  drawWatermark(context, canvas.width, canvas.height);
  const blob = target.mimeType === 'image/avif'
    ? await encodeCanvasToAvifBlob(canvas, quality)
    : await canvasToBlob(canvas, target.mimeType, quality);

  if ((!blob.type || blob.type === target.mimeType) && await blobMatchesMime(blob, target.mimeType)) {
    return {
      blob,
      mimeType: target.mimeType,
      format: target.format,
      extension: target.extension,
    };
  }

  const pngTarget = getImageTargetConfig('png');
  return {
    blob: await canvasToBlob(canvas, pngTarget.mimeType),
    mimeType: pngTarget.mimeType,
    format: pngTarget.format,
    extension: pngTarget.extension,
  };
}

async function addWatermarkToImageBlob(
  blob: Blob,
  preferredMimeType: string,
  options: { jpegBackground?: string; quality?: number } = {}
): Promise<WatermarkedImageOutput> {
  const target = getWatermarkTargetConfig(preferredMimeType);
  const image = await loadBlobImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context failed');

  if (target.mimeType === 'image/jpeg') {
    context.fillStyle = options.jpegBackground ?? '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image.element, 0, 0);
  return addWatermarkToCanvasBlob(canvas, target, options.quality ?? target.defaultQuality);
}

async function maybeWatermarkImageBlob(
  blob: Blob,
  preferredMimeType: string,
  options: { jpegBackground?: string; quality?: number } = {}
): Promise<WatermarkedImageOutput> {
  const target = getWatermarkTargetConfig(preferredMimeType);

  if (!shouldWatermarkImageOutput()) {
    return {
      blob,
      mimeType: target.mimeType,
      format: target.format,
      extension: target.extension,
    };
  }

  return addWatermarkToImageBlob(blob, preferredMimeType, options);
}

function ensureFilenameExtension(filename: string, extension: string): string {
  const nextExtension = `.${extension}`;
  if (filename.toLowerCase().endsWith(nextExtension)) return filename;
  return `${filename.replace(/\.[^.]+$/, '')}${nextExtension}`;
}

async function watermarkConversionSuccess(
  result: ImageConversionOutcome,
  options: { preferredMimeType: string; jpegBackground?: string; quality?: number }
): Promise<ImageConversionOutcome> {
  if (!result.ok || !shouldWatermarkImageOutput()) return result;

  try {
    const watermarked = await addWatermarkToImageBlob(result.blob, options.preferredMimeType, options);
    return {
      ...result,
      blob: watermarked.blob,
      filename: ensureFilenameExtension(result.filename, watermarked.extension),
      mimeType: watermarked.mimeType,
      outputSize: watermarked.blob.size,
    };
  } catch {
    return { ok: false, code: 'canvas_export' };
  }
}

async function watermarkCompressionSuccess(
  file: File,
  result: ImageCompressionOutcome,
  options: { preferredMimeType: string; jpegBackground?: string; quality?: number }
): Promise<ImageCompressionOutcome> {
  if (!result.ok || !shouldWatermarkImageOutput()) return result;

  try {
    const watermarked = await addWatermarkToImageBlob(result.blob, options.preferredMimeType, options);
    const filename = result.strategy === 'kept-original' || result.format === 'original'
      ? createCompressedImageFilename(file.name, watermarked.extension)
      : ensureFilenameExtension(result.filename, watermarked.extension);

    return {
      ...result,
      blob: watermarked.blob,
      filename,
      mimeType: watermarked.mimeType,
      format: watermarked.format,
      outputSize: watermarked.blob.size,
      savingsRatio: calculateSavingsRatio(result.originalSize, watermarked.blob.size),
      strategy: 'reencoded',
    };
  } catch {
    return { ok: false, code: 'canvas_export' };
  }
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

function readPixel(imageData: ImageData, x: number, y: number): [number, number, number, number] {
  const sampleX = clampNumber(Math.round(x), 0, imageData.width - 1);
  const sampleY = clampNumber(Math.round(y), 0, imageData.height - 1);
  const index = (sampleY * imageData.width + sampleX) * 4;
  const data = imageData.data;

  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

function writePixel(
  imageData: ImageData,
  x: number,
  y: number,
  pixel: [number, number, number, number]
) {
  const index = (y * imageData.width + x) * 4;
  const data = imageData.data;

  data[index] = Math.round(pixel[0]);
  data[index + 1] = Math.round(pixel[1]);
  data[index + 2] = Math.round(pixel[2]);
  data[index + 3] = Math.round(pixel[3]);
}

function estimateRepairPixel(
  sourceData: ImageData,
  selection: ImageCropRect,
  x: number,
  y: number
): [number, number, number, number] {
  const localX = x - selection.x;
  const localY = y - selection.y;
  const right = selection.x + selection.width;
  const bottom = selection.y + selection.height;
  const channels = [0, 0, 0, 0];
  let totalWeight = 0;

  function addSample(sampleX: number, sampleY: number, distance: number) {
    const weight = 1 / Math.pow(Math.max(1, distance), WATERMARK_REPAIR_DISTANCE_POWER);
    const pixel = readPixel(sourceData, sampleX, sampleY);

    channels[0] += pixel[0] * weight;
    channels[1] += pixel[1] * weight;
    channels[2] += pixel[2] * weight;
    channels[3] += pixel[3] * weight;
    totalWeight += weight;
  }

  if (selection.x > 0) {
    addSample(selection.x - 1, y, localX + 1);
  }
  if (right < sourceData.width) {
    addSample(right, y, selection.width - localX);
  }
  if (selection.y > 0) {
    addSample(x, selection.y - 1, localY + 1);
  }
  if (bottom < sourceData.height) {
    addSample(x, bottom, selection.height - localY);
  }
  if (selection.x > 0 && selection.y > 0) {
    addSample(selection.x - 1, selection.y - 1, Math.hypot(localX + 1, localY + 1));
  }
  if (right < sourceData.width && selection.y > 0) {
    addSample(right, selection.y - 1, Math.hypot(selection.width - localX, localY + 1));
  }
  if (selection.x > 0 && bottom < sourceData.height) {
    addSample(selection.x - 1, bottom, Math.hypot(localX + 1, selection.height - localY));
  }
  if (right < sourceData.width && bottom < sourceData.height) {
    addSample(right, bottom, Math.hypot(selection.width - localX, selection.height - localY));
  }

  if (totalWeight <= 0) {
    return readPixel(sourceData, x, y);
  }

  return [
    channels[0] / totalWeight,
    channels[1] / totalWeight,
    channels[2] / totalWeight,
    channels[3] / totalWeight,
  ];
}

function softenRepairArea(canvas: HTMLCanvasElement, selection: ImageCropRect, feather: number) {
  const context = canvas.getContext('2d');
  if (!context || feather <= 0 || selection.width < 3 || selection.height < 3) return;

  const pad = Math.max(2, Math.ceil(feather * 1.5));
  const sourceX = Math.max(0, selection.x - pad);
  const sourceY = Math.max(0, selection.y - pad);
  const sourceRight = Math.min(canvas.width, selection.x + selection.width + pad);
  const sourceBottom = Math.min(canvas.height, selection.y + selection.height + pad);
  const sourceWidth = Math.max(1, sourceRight - sourceX);
  const sourceHeight = Math.max(1, sourceBottom - sourceY);
  const patch = document.createElement('canvas');
  patch.width = sourceWidth;
  patch.height = sourceHeight;
  const patchContext = patch.getContext('2d');
  if (!patchContext) return;

  patchContext.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

  context.save();
  context.beginPath();
  context.rect(selection.x, selection.y, selection.width, selection.height);
  context.clip();
  context.globalAlpha = 0.42;
  context.filter = `blur(${clampNumber(Math.round(feather / 3), 1, 12)}px)`;
  context.drawImage(patch, sourceX, sourceY);
  context.restore();
}

function repairWatermarkArea(canvas: HTMLCanvasElement, selection: ImageCropRect, feather: number): boolean {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const sourceData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);

  for (let y = selection.y; y < selection.y + selection.height; y += 1) {
    for (let x = selection.x; x < selection.x + selection.width; x += 1) {
      writePixel(imageData, x, y, estimateRepairPixel(sourceData, selection, x, y));
    }
  }

  context.putImageData(imageData, 0, 0);
  softenRepairArea(canvas, selection, feather);
  return true;
}

function createWatermarkRemovalProgress(
  stage: ImageWatermarkRemovalProgress['stage'],
  label: string,
  percent: number
): ImageWatermarkRemovalProgress {
  return {
    stage,
    label,
    percent: clampNumber(Math.round(percent), 0, 100),
  };
}

async function getWatermarkInpaintSession(
  onProgress?: (progress: ImageWatermarkRemovalProgress) => void
): Promise<{ ort: OrtWasmModule; session: OrtInferenceSession }> {
  onProgress?.(createWatermarkRemovalProgress('model', 'model:loading', 8));

  if (!watermarkInpaintSessionPromise) {
    watermarkInpaintSessionPromise = (async () => {
      const ort = await import('onnxruntime-web/wasm');

      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      ort.env.wasm.wasmPaths = {
        wasm: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.wasm`,
        mjs: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.mjs`,
      };

      const session = await ort.InferenceSession.create(WATERMARK_AI_MODEL_URL, {
        executionProviders: ['wasm'],
        executionMode: 'sequential',
        graphOptimizationLevel: 'all',
      });

      return { ort, session };
    })().catch((error) => {
      watermarkInpaintSessionPromise = null;
      throw error;
    });
  }

  const loaded = await watermarkInpaintSessionPromise;
  onProgress?.(createWatermarkRemovalProgress('model', 'model:ready', 28));
  return loaded;
}

async function getWatermarkMiganSession(
  onProgress?: (progress: ImageWatermarkRemovalProgress) => void
): Promise<{ ort: OrtWasmModule; session: OrtInferenceSession }> {
  onProgress?.(createWatermarkRemovalProgress('model', 'model:loading', 8));

  if (!watermarkMiganSessionPromise) {
    watermarkMiganSessionPromise = (async () => {
      const ort = await import('onnxruntime-web/wasm');

      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      ort.env.wasm.wasmPaths = {
        wasm: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.wasm`,
        mjs: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.mjs`,
      };

      const session = await ort.InferenceSession.create(WATERMARK_MIGAN_MODEL_URL, {
        executionProviders: ['wasm'],
        executionMode: 'sequential',
        graphOptimizationLevel: 'all',
      });

      return { ort, session };
    })().catch((error) => {
      watermarkMiganSessionPromise = null;
      throw error;
    });
  }

  const loaded = await watermarkMiganSessionPromise;
  onProgress?.(createWatermarkRemovalProgress('model', 'model:ready', 28));
  return loaded;
}

function createCanvasFromLoadedImage(image: LoadedImage): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(image.element, 0, 0);
  return canvas;
}

function createWatermarkInpaintPatchRect(
  selection: ImageCropRect,
  imageWidth: number,
  imageHeight: number
): ImageCropRect {
  const centerX = selection.x + selection.width / 2;
  const centerY = selection.y + selection.height / 2;
  const contextSize = Math.max(
    48,
    Math.round(Math.min(imageWidth, imageHeight) * 0.08),
    Math.round(Math.max(selection.width, selection.height) * 0.8)
  );
  const maxSquareSide = Math.min(imageWidth, imageHeight);
  const squareSide = clampNumber(
    Math.round(Math.max(selection.width, selection.height) + contextSize * 2),
    Math.max(selection.width, selection.height, 1),
    maxSquareSide
  );

  if (selection.width <= squareSide && selection.height <= squareSide) {
    return normalizeCropRect({
      x: Math.round(clampNumber(centerX - squareSide / 2, 0, Math.max(0, imageWidth - squareSide))),
      y: Math.round(clampNumber(centerY - squareSide / 2, 0, Math.max(0, imageHeight - squareSide))),
      width: squareSide,
      height: squareSide,
    }, imageWidth, imageHeight);
  }

  const padX = Math.max(24, Math.round(selection.width * 0.65), Math.round(imageWidth * 0.04));
  const padY = Math.max(24, Math.round(selection.height * 1.1), Math.round(imageHeight * 0.04));
  const left = Math.max(0, Math.floor(selection.x - padX));
  const top = Math.max(0, Math.floor(selection.y - padY));
  const right = Math.min(imageWidth, Math.ceil(selection.x + selection.width + padX));
  const bottom = Math.min(imageHeight, Math.ceil(selection.y + selection.height + padY));

  return normalizeCropRect({
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  }, imageWidth, imageHeight);
}

function createWatermarkPatchCanvas(image: LoadedImage, patch: ImageCropRect): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = WATERMARK_AI_INPUT_SIZE;
  canvas.height = WATERMARK_AI_INPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image.element,
    patch.x,
    patch.y,
    patch.width,
    patch.height,
    0,
    0,
    WATERMARK_AI_INPUT_SIZE,
    WATERMARK_AI_INPUT_SIZE
  );

  return canvas;
}

function createWatermarkMaskCanvas(
  selection: ImageCropRect,
  patch: ImageCropRect,
  feather: number
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = WATERMARK_AI_INPUT_SIZE;
  canvas.height = WATERMARK_AI_INPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const scaleX = WATERMARK_AI_INPUT_SIZE / Math.max(1, patch.width);
  const scaleY = WATERMARK_AI_INPUT_SIZE / Math.max(1, patch.height);
  const maskX = (selection.x - patch.x) * scaleX;
  const maskY = (selection.y - patch.y) * scaleY;
  const maskWidth = selection.width * scaleX;
  const maskHeight = selection.height * scaleY;
  const maskPadding = clampNumber(Math.round(feather / 3), 1, 10);

  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.fillRect(
    Math.floor(maskX - maskPadding),
    Math.floor(maskY - maskPadding),
    Math.ceil(maskWidth + maskPadding * 2),
    Math.ceil(maskHeight + maskPadding * 2)
  );

  return canvas;
}

function createWatermarkImageTensor(ort: OrtWasmModule, canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas context failed');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixelCount = canvas.width * canvas.height;
  const tensorData = new Float32Array(3 * pixelCount);
  const source = imageData.data;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const alpha = source[sourceIndex + 3] / 255;
    tensorData[pixelIndex] = ((source[sourceIndex] * alpha) + 255 * (1 - alpha)) / 255;
    tensorData[pixelCount + pixelIndex] = ((source[sourceIndex + 1] * alpha) + 255 * (1 - alpha)) / 255;
    tensorData[pixelCount * 2 + pixelIndex] = ((source[sourceIndex + 2] * alpha) + 255 * (1 - alpha)) / 255;
  }

  return new ort.Tensor('float32', tensorData, [1, 3, canvas.height, canvas.width]);
}

function createWatermarkMaskTensor(ort: OrtWasmModule, canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas context failed');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixelCount = canvas.width * canvas.height;
  const tensorData = new Float32Array(pixelCount);
  const source = imageData.data;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    tensorData[pixelIndex] = source[pixelIndex * 4] > 127 ? 1 : 0;
  }

  return new ort.Tensor('float32', tensorData, [1, 1, canvas.height, canvas.width]);
}

function createWatermarkOriginalPatchCanvas(image: LoadedImage, patch: ImageCropRect): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(patch.width));
  canvas.height = Math.max(1, Math.round(patch.height));
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image.element,
    patch.x,
    patch.y,
    patch.width,
    patch.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

function createMiganImageTensor(ort: OrtWasmModule, canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas context failed');

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixelCount = canvas.width * canvas.height;
  const tensorData = new Uint8Array(3 * pixelCount);
  const source = imageData.data;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const alpha = source[sourceIndex + 3] / 255;
    tensorData[pixelIndex] = clampNumber(Math.round((source[sourceIndex] * alpha) + 255 * (1 - alpha)), 0, 255);
    tensorData[pixelCount + pixelIndex] = clampNumber(Math.round((source[sourceIndex + 1] * alpha) + 255 * (1 - alpha)), 0, 255);
    tensorData[pixelCount * 2 + pixelIndex] = clampNumber(Math.round((source[sourceIndex + 2] * alpha) + 255 * (1 - alpha)), 0, 255);
  }

  return new ort.Tensor('uint8', tensorData, [1, 3, canvas.height, canvas.width]);
}

function createMiganMaskTensor(
  ort: OrtWasmModule,
  selection: ImageCropRect,
  patch: ImageCropRect,
  feather: number
) {
  const width = Math.max(1, Math.round(patch.width));
  const height = Math.max(1, Math.round(patch.height));
  const tensorData = new Uint8Array(width * height);
  tensorData.fill(255);

  const maskPadding = clampNumber(Math.round(feather / 2), 1, 18);
  const left = clampNumber(Math.floor(selection.x - patch.x - maskPadding), 0, width);
  const top = clampNumber(Math.floor(selection.y - patch.y - maskPadding), 0, height);
  const right = clampNumber(Math.ceil(selection.x + selection.width - patch.x + maskPadding), 0, width);
  const bottom = clampNumber(Math.ceil(selection.y + selection.height - patch.y + maskPadding), 0, height);

  for (let y = top; y < bottom; y += 1) {
    tensorData.fill(0, y * width + left, y * width + right);
  }

  return new ort.Tensor('uint8', tensorData, [1, 1, height, width]);
}

interface OrtTensorLike {
  data: ArrayLike<number>;
  dims: readonly number[];
}

function isOrtTensorLike(value: unknown): value is OrtTensorLike {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'data' in value &&
    'dims' in value &&
    Array.isArray((value as { dims?: unknown }).dims)
  );
}

function normalizeTensorByte(value: number, normalizedOutput: boolean): number {
  const scaled = normalizedOutput ? value * 255 : value;
  return clampNumber(Math.round(scaled), 0, 255);
}

function tensorToImageCanvas(tensor: OrtTensorLike): HTMLCanvasElement | null {
  const dims = Array.from(tensor.dims);
  const data = tensor.data;
  const maxSample = Math.min(data.length, 512);
  let sampleMax = -Infinity;

  for (let index = 0; index < maxSample; index += 1) {
    sampleMax = Math.max(sampleMax, data[index]);
  }

  const normalizedOutput = sampleMax <= 1.5;
  let width = WATERMARK_AI_INPUT_SIZE;
  let height = WATERMARK_AI_INPUT_SIZE;
  let channels = 3;
  let layout: 'chw' | 'nhwc' = 'chw';
  let offset = 0;

  if (dims.length === 4 && dims[1] >= 3) {
    channels = dims[1];
    height = dims[2];
    width = dims[3];
    layout = 'chw';
    offset = 0;
  } else if (dims.length === 4 && dims[3] >= 3) {
    height = dims[1];
    width = dims[2];
    channels = dims[3];
    layout = 'nhwc';
    offset = 0;
  } else if (dims.length === 3 && dims[0] >= 3) {
    channels = dims[0];
    height = dims[1];
    width = dims[2];
    layout = 'chw';
  } else if (dims.length === 3 && dims[2] >= 3) {
    height = dims[0];
    width = dims[1];
    channels = dims[2];
    layout = 'nhwc';
  } else {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const output = context.createImageData(width, height);
  const planeSize = width * height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x;
      const targetIndex = pixelIndex * 4;
      let red: number;
      let green: number;
      let blue: number;

      if (layout === 'chw') {
        red = data[offset + pixelIndex];
        green = data[offset + planeSize + pixelIndex];
        blue = data[offset + planeSize * 2 + pixelIndex];
      } else {
        const sourceIndex = offset + pixelIndex * channels;
        red = data[sourceIndex];
        green = data[sourceIndex + 1];
        blue = data[sourceIndex + 2];
      }

      output.data[targetIndex] = normalizeTensorByte(red, normalizedOutput);
      output.data[targetIndex + 1] = normalizeTensorByte(green, normalizedOutput);
      output.data[targetIndex + 2] = normalizeTensorByte(blue, normalizedOutput);
      output.data[targetIndex + 3] = 255;
    }
  }

  context.putImageData(output, 0, 0);
  return canvas;
}

async function runMiganWatermarkInpaint(
  image: LoadedImage,
  selection: ImageCropRect,
  feather: number,
  onProgress?: (progress: ImageWatermarkRemovalProgress) => void
): Promise<HTMLCanvasElement> {
  const { ort, session } = await getWatermarkMiganSession(onProgress);
  onProgress?.(createWatermarkRemovalProgress('prepare', 'prepare:patch', 36));

  const patch = createWatermarkInpaintPatchRect(selection, image.width, image.height);
  const patchCanvas = createWatermarkOriginalPatchCanvas(image, patch);

  if (!patchCanvas) {
    throw new Error('Canvas context failed');
  }

  const imageTensor = createMiganImageTensor(ort, patchCanvas);
  const maskTensor = createMiganMaskTensor(ort, selection, patch, feather);
  const imageInputName =
    session.inputNames.find((name) => /image|img|input/i.test(name)) ?? session.inputNames[0];
  const maskInputName =
    session.inputNames.find((name) => /mask/i.test(name)) ??
    session.inputNames.find((name) => name !== imageInputName);

  if (!imageInputName || !maskInputName) {
    throw new Error('Unexpected model inputs');
  }

  onProgress?.(createWatermarkRemovalProgress('compute', 'compute:inpaint', 58));

  const result = await session.run({
    [imageInputName]: imageTensor,
    [maskInputName]: maskTensor,
  });
  const outputName =
    session.outputNames.find((name) => /result|output|image/i.test(name)) ??
    session.outputNames[0] ??
    Object.keys(result)[0];
  const output = outputName ? result[outputName] : undefined;

  if (!isOrtTensorLike(output)) {
    throw new Error('Unexpected model output');
  }

  const outputPatchCanvas = tensorToImageCanvas(output);
  const repairCanvas = createCanvasFromLoadedImage(image);
  if (!outputPatchCanvas || !repairCanvas) {
    throw new Error('Canvas context failed');
  }

  const repairContext = repairCanvas.getContext('2d');
  if (!repairContext) {
    throw new Error('Canvas context failed');
  }

  onProgress?.(createWatermarkRemovalProgress('compute', 'compute:blend', 86));
  repairContext.save();
  repairContext.beginPath();
  repairContext.rect(selection.x, selection.y, selection.width, selection.height);
  repairContext.clip();
  repairContext.imageSmoothingEnabled = true;
  repairContext.imageSmoothingQuality = 'high';
  repairContext.drawImage(outputPatchCanvas, patch.x, patch.y, patch.width, patch.height);
  repairContext.restore();
  softenRepairArea(repairCanvas, selection, feather);

  return repairCanvas;
}

async function runAiWatermarkInpaint(
  image: LoadedImage,
  selection: ImageCropRect,
  feather: number,
  onProgress?: (progress: ImageWatermarkRemovalProgress) => void
): Promise<HTMLCanvasElement> {
  const { ort, session } = await getWatermarkInpaintSession(onProgress);
  onProgress?.(createWatermarkRemovalProgress('prepare', 'prepare:patch', 36));

  const patch = createWatermarkInpaintPatchRect(selection, image.width, image.height);
  const patchCanvas = createWatermarkPatchCanvas(image, patch);
  const maskCanvas = createWatermarkMaskCanvas(selection, patch, feather);

  if (!patchCanvas || !maskCanvas) {
    throw new Error('Canvas context failed');
  }

  const imageTensor = createWatermarkImageTensor(ort, patchCanvas);
  const maskTensor = createWatermarkMaskTensor(ort, maskCanvas);
  const imageInputName =
    session.inputNames.find((name) => /image|img|input/i.test(name)) ?? session.inputNames[0];
  const maskInputName =
    session.inputNames.find((name) => /mask/i.test(name)) ??
    session.inputNames.find((name) => name !== imageInputName);

  if (!imageInputName || !maskInputName) {
    throw new Error('Unexpected model inputs');
  }

  onProgress?.(createWatermarkRemovalProgress('compute', 'compute:inpaint', 58));

  const result = await session.run({
    [imageInputName]: imageTensor,
    [maskInputName]: maskTensor,
  });
  const outputName = session.outputNames[0] ?? Object.keys(result)[0];
  const output = outputName ? result[outputName] : undefined;

  if (!isOrtTensorLike(output)) {
    throw new Error('Unexpected model output');
  }

  const outputPatchCanvas = tensorToImageCanvas(output);
  const repairCanvas = createCanvasFromLoadedImage(image);
  if (!outputPatchCanvas || !repairCanvas) {
    throw new Error('Canvas context failed');
  }

  const repairContext = repairCanvas.getContext('2d');
  if (!repairContext) {
    throw new Error('Canvas context failed');
  }

  onProgress?.(createWatermarkRemovalProgress('compute', 'compute:blend', 86));
  repairContext.save();
  repairContext.beginPath();
  repairContext.rect(selection.x, selection.y, selection.width, selection.height);
  repairContext.clip();
  repairContext.imageSmoothingEnabled = true;
  repairContext.imageSmoothingQuality = 'high';
  repairContext.drawImage(outputPatchCanvas, patch.x, patch.y, patch.width, patch.height);
  repairContext.restore();
  softenRepairArea(repairCanvas, selection, feather);

  return repairCanvas;
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

  if (sourceType === 'image/svg+xml' && outputMode === 'preserve') {
    return compressSvgFilePreservingFormat(file, startedAt);
  }

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
    let forcedWebpFallback:
      | {
          blob: Blob;
          candidate: CompressionCandidate;
          quality?: number;
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

        if (outputMode === 'webp' && !forcedWebpFallback) {
          forcedWebpFallback = { blob, candidate, quality };
        }

        const diff = await compareBlobToSample(blob, sourceSample);
        if (!isVisuallySafe(diff, hasAlpha)) continue;
        if (!best || blob.size < best.blob.size) {
          best = { blob, candidate, quality };
        }
      }
    }

    if (!best && forcedWebpFallback) {
      best = forcedWebpFallback;
    }

    if (!best) {
      if (outputMode === 'webp') {
        return { ok: false, code: 'unsupported_output', detail: 'WebP' };
      }

      const watermarked = await maybeWatermarkImageBlob(file, sourceType || file.type, {
        jpegBackground,
      });

      if (shouldWatermarkImageOutput()) {
        return {
          ok: true,
          blob: watermarked.blob,
          filename: createCompressedImageFilename(file.name, watermarked.extension),
          mimeType: watermarked.mimeType,
          format: watermarked.format,
          width: image.width,
          height: image.height,
          originalSize: file.size,
          outputSize: watermarked.blob.size,
          durationMs: Math.round(performance.now() - startedAt),
          savingsRatio: calculateSavingsRatio(file.size, watermarked.blob.size),
          strategy: 'reencoded',
        };
      }

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

    const watermarked = await maybeWatermarkImageBlob(best.blob, best.candidate.mimeType, {
      jpegBackground,
      quality: best.quality,
    });

    return {
      ok: true,
      blob: watermarked.blob,
      filename: createCompressedImageFilename(file.name, watermarked.extension),
      mimeType: watermarked.mimeType,
      format: watermarked.format,
      width: image.width,
      height: image.height,
      originalSize: file.size,
      outputSize: watermarked.blob.size,
      durationMs: Math.round(performance.now() - startedAt),
      savingsRatio: calculateSavingsRatio(file.size, watermarked.blob.size),
      quality: best.quality,
      quantizedColors: best.quantizedColors,
      strategy: 'reencoded',
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

async function compressSvgFilePreservingFormat(
  file: File,
  startedAt = performance.now()
): Promise<ImageCompressionOutcome> {
  try {
    const svgText = await file.text();
    if (!getSvgDocumentRoot(svgText)) return { ok: false, code: 'load_failed' };

    const size = await getSvgDisplaySize(file, svgText);
    if (!size.width || !size.height) return { ok: false, code: 'load_failed' };

    const pixelCount = size.width * size.height;

    if (pixelCount > MAX_IMAGE_PIXELS) {
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    const minifiedText = await chooseSmallestValidSvgText(svgText);
    const minifiedBlob = new Blob([minifiedText], { type: 'image/svg+xml' });
    const originalBlob = file.type === 'image/svg+xml'
      ? file
      : new Blob([svgText], { type: 'image/svg+xml' });
    const blob = minifiedBlob.size < file.size ? minifiedBlob : originalBlob;
    const strategy: ImageCompressionStrategy = blob === minifiedBlob ? 'reencoded' : 'kept-original';

    return {
      ok: true,
      blob,
      filename: createCompressedImageFilename(file.name, 'svg'),
      mimeType: 'image/svg+xml',
      format: 'original',
      width: size.width,
      height: size.height,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
      savingsRatio: calculateSavingsRatio(file.size, blob.size),
      strategy,
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
    const conversionSizes = sourceType === 'image/svg+xml'
      ? await getSvgConversionSizes(sourceFile, image)
      : {
          outputSize: { width: image.width, height: image.height },
          renderSize: { width: image.width, height: image.height },
        };
    const { outputSize, renderSize } = conversionSizes;
    const pixelCount = outputSize.width * outputSize.height;

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

    const canvas = createRasterCanvas(outputSize);

    const context = canvas.getContext('2d');
    if (!context) return { ok: false, code: 'canvas_context' };

    if (target.mimeType === 'image/jpeg') {
      context.fillStyle = options.jpegBackground ?? '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    setHighQualitySmoothing(context);

    if (
      sourceType === 'image/svg+xml' &&
      (renderSize.width !== outputSize.width || renderSize.height !== outputSize.height)
    ) {
      const renderCanvas = createRasterCanvas(renderSize);
      const renderContext = renderCanvas.getContext('2d', { willReadFrequently: true });
      if (!renderContext) return { ok: false, code: 'canvas_context' };

      setHighQualitySmoothing(renderContext);
      renderContext.drawImage(image.element, 0, 0, renderSize.width, renderSize.height);
      const resizedCanvas = await resizeSvgRenderCanvas(renderCanvas, outputSize);
      if (!resizedCanvas) return { ok: false, code: 'canvas_context' };

      context.drawImage(resizedCanvas, 0, 0);
    } else {
      context.drawImage(image.element, 0, 0, outputSize.width, outputSize.height);
    }

    const quality = target.supportsQuality
      ? normalizeImageQuality(options.quality ?? target.defaultQuality)
      : undefined;
    const output = shouldWatermarkImageOutput()
      ? await addWatermarkToCanvasBlob(canvas, target, quality)
      : {
          blob: target.mimeType === 'image/avif'
            ? await encodeCanvasToAvifBlob(canvas, quality)
            : await canvasToBlob(canvas, target.mimeType, quality),
          mimeType: target.mimeType,
          extension: target.extension,
        };
    const blob = output.blob;

    if ((blob.type && blob.type !== output.mimeType) || !(await blobMatchesMime(blob, output.mimeType))) {
      return {
        ok: false,
        code: 'unsupported_output',
        detail: target.label,
      };
    }

    return {
      ok: true,
      blob,
      filename: createImageOutputFilename(file.name, output.extension),
      mimeType: output.mimeType,
      width: outputSize.width,
      height: outputSize.height,
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
    const pngBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
    const output = await maybeWatermarkImageBlob(pngBlob, 'image/png');

    return {
      ok: true,
      blob: output.blob,
      filename: createBackgroundRemovedImageFilename(file.name),
      mimeType: 'image/png',
      width: image.width,
      height: image.height,
      originalSize: file.size,
      outputSize: output.blob.size,
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

export async function upscaleImageFile(
  file: File,
  options: UpscaleImageOptions
): Promise<ImageUpscaleOutcome> {
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
  const target = getBasicImageTargetConfig(options.targetFormat);
  const mode = options.mode ?? 'pixel';

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

    const canvas = mode === 'sharp'
      ? await resizeImageWithSharpEnhancement(image, { width: outputWidth, height: outputHeight })
      : createRasterCanvas({ width: outputWidth, height: outputHeight });
    if (!canvas) return { ok: false, code: 'canvas_context' };

    const context = canvas.getContext('2d');
    if (!context) return { ok: false, code: 'canvas_context' };

    if (target.mimeType === 'image/jpeg') {
      context.fillStyle = options.jpegBackground ?? '#ffffff';
      context.globalCompositeOperation = 'destination-over';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'source-over';
    }

    if (mode !== 'sharp') {
      context.imageSmoothingEnabled = mode === 'smooth';
      if (mode === 'smooth') context.imageSmoothingQuality = 'high';
      context.drawImage(image.element, 0, 0, image.width, image.height, 0, 0, outputWidth, outputHeight);
    }

    const quality = target.supportsQuality
      ? normalizeImageQuality(options.quality ?? target.defaultQuality)
      : undefined;
    const output = shouldWatermarkImageOutput()
      ? await addWatermarkToCanvasBlob(canvas, target, quality)
      : {
          blob: await canvasToBlob(canvas, target.mimeType, quality),
          mimeType: target.mimeType,
          format: target.format,
          extension: target.extension,
        };
    const blob = output.blob;
    const outputMimeType = output.mimeType as ImageUpscaleSuccess['mimeType'];
    const outputFormat = output.format as BasicImageTargetFormat;
    const outputExtension = output.extension as BasicImageTargetFormat;

    if (blob.type && blob.type !== outputMimeType) {
      return {
        ok: false,
        code: 'unsupported_output',
        detail: target.label,
      };
    }

    return {
      ok: true,
      blob,
      filename: createUpscaledImageFilename(file.name, outputExtension),
      mimeType: outputMimeType,
      format: outputFormat,
      width: outputWidth,
      height: outputHeight,
      sourceWidth: image.width,
      sourceHeight: image.height,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
      mode,
    };
  } catch {
    return { ok: false, code: 'load_failed' };
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
    const output = shouldWatermarkImageOutput()
      ? await addWatermarkToCanvasBlob(canvas, target, quality)
      : {
          blob: await canvasToBlob(canvas, target.mimeType, quality),
          mimeType: target.mimeType,
          format: target.format,
          extension: target.extension,
        };
    const blob = output.blob;

    if (blob.type && blob.type !== output.mimeType) {
      return {
        ok: false,
        code: 'unsupported_output',
        detail: target.label,
      };
    }

    return {
      ok: true,
      blob,
      filename: createEditedImageFilename(file.name, output.extension),
      mimeType: output.mimeType,
      format: output.format,
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

export async function removeImageWatermark(
  file: File,
  options: RemoveImageWatermarkOptions
): Promise<ImageWatermarkRemovalOutcome> {
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

    const selection = normalizeCropRect(options.selection, image.width, image.height);
    const feather = clampNumber(Math.round(options.feather ?? 12), 0, 36);
    let repairCanvas: HTMLCanvasElement | null = null;
    let method: ImageWatermarkRemovalMethod = 'local';
    const requestedMethod = options.method ?? 'migan';

    if (requestedMethod === 'migan') {
      try {
        repairCanvas = await runMiganWatermarkInpaint(image, selection, feather, options.onProgress);
        method = 'migan';
      } catch {
        options.onProgress?.(createWatermarkRemovalProgress('fallback', 'fallback:lama', 72));
      }
    }

    if (!repairCanvas && (requestedMethod === 'migan' || requestedMethod === 'ai')) {
      try {
        repairCanvas = await runAiWatermarkInpaint(image, selection, feather, options.onProgress);
        method = 'ai';
      } catch {
        options.onProgress?.(createWatermarkRemovalProgress('fallback', 'fallback:local', 90));
      }
    }

    if (!repairCanvas) {
      repairCanvas = createCanvasFromLoadedImage(image);
      if (!repairCanvas) return { ok: false, code: 'canvas_context' };

      if (!repairWatermarkArea(repairCanvas, selection, feather)) {
        return { ok: false, code: 'canvas_context' };
      }
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = image.width;
    outputCanvas.height = image.height;
    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) return { ok: false, code: 'canvas_context' };

    if (target.mimeType === 'image/jpeg') {
      outputContext.fillStyle = options.jpegBackground ?? '#ffffff';
      outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    }
    outputContext.drawImage(repairCanvas, 0, 0);

    options.onProgress?.(createWatermarkRemovalProgress('encode', 'encode:image', 96));

    const quality = target.supportsQuality
      ? normalizeImageQuality(options.quality ?? target.defaultQuality)
      : undefined;
    const output = shouldWatermarkImageOutput()
      ? await addWatermarkToCanvasBlob(outputCanvas, target, quality)
      : {
          blob: await canvasToBlob(outputCanvas, target.mimeType, quality),
          mimeType: target.mimeType,
          format: target.format,
          extension: target.extension,
        };
    const blob = output.blob;

    if (blob.type && blob.type !== output.mimeType) {
      return {
        ok: false,
        code: 'unsupported_output',
        detail: target.label,
      };
    }

    return {
      ok: true,
      blob,
      filename: createWatermarkRemovedImageFilename(file.name, output.extension),
      mimeType: output.mimeType,
      format: output.format,
      method,
      width: image.width,
      height: image.height,
      selection,
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
  if (workerResult) {
    const target = getImageTargetConfig(targetFormat);
    const quality = target.supportsQuality
      ? normalizeImageQuality(options.quality ?? target.defaultQuality)
      : undefined;
    return watermarkConversionSuccess(workerResult, {
      preferredMimeType: target.mimeType,
      jpegBackground: options.jpegBackground ?? '#ffffff',
      quality,
    });
  }

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
  if (sourceType === 'image/svg+xml' && outputMode === 'preserve') {
    return compressSvgFilePreservingFormat(file);
  }

  const shouldUseWorker = !(sourceType === 'image/png' && outputMode === 'preserve');
  const workerResult = shouldUseWorker ? await compressImageFileInWorker(file, options) : null;
  if (workerResult) {
    const preferredMimeType = workerResult.ok ? workerResult.mimeType : sourceType;
    return watermarkCompressionSuccess(file, workerResult, {
      preferredMimeType,
      jpegBackground: options.jpegBackground ?? '#ffffff',
    });
  }

  return compressImageFileOnMainThread(file, options);
}
