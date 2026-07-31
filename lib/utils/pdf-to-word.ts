import { createPdfDerivedFilename, isPdfFile, MAX_PDF_INPUT_FILE_SIZE } from './pdf';
import { formatFileSize } from './image';
import type { OcrLanguage, OcrProgressStage } from './ocr';
import { recognizeImageOcr } from './ocr-browser';
import {
  createPdfToWordDocxBlob,
  type PdfWordImage,
  type PdfWordPage,
  type PdfWordTextLine,
  type PdfWordTextRun,
} from './pdf-to-word-docx';
import {
  createPdfWordLinesFromOcr,
  retainImagesForOcrPage,
  shouldUseNativePdfText,
  type PdfToWordPageRoute,
} from './pdf-to-word-routing';

const MAX_TEXT_ITEMS_PER_PAGE = 12000;
const MAX_IMAGES_PER_PAGE = 80;
const MAX_IMAGE_PIXELS = 6_000_000;
const MAX_TOTAL_IMAGE_PIXELS_PER_PAGE = 30_000_000;
const MAX_SOURCE_IMAGE_PIXELS = 40_000_000;
const MIN_IMAGE_SIZE_POINTS = 3;
const OCR_RENDER_SCALE = 2;
const MAX_OCR_PAGE_PIXELS = 12_000_000;

type PdfToWordErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'load_failed'
  | 'empty_text'
  | 'render_failed';

export type PdfToWordError = {
  ok: false;
  code: PdfToWordErrorCode;
  maxSize?: string;
};

export interface PdfToWordSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  paragraphCount: number;
  imageCount: number;
  nativePageCount: number;
  ocrPageCount: number;
  visualPageCount: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export type PdfToWordOutcome = PdfToWordSuccess | PdfToWordError;

export type PdfToWordProgressStage = 'loading' | 'analyzing' | 'ocr' | 'building';

export interface PdfToWordProgress {
  stage: PdfToWordProgressStage;
  percent: number;
  pageNumber?: number;
  totalPages?: number;
  ocrStage?: OcrProgressStage;
}

export interface ConvertPdfToWordOptions {
  ocrLanguage?: OcrLanguage;
  onProgress?: (progress: PdfToWordProgress) => void;
}

interface PdfTextStyleLike {
  fontFamily?: string;
}

interface PdfTextItemLike {
  str: string;
  transform: number[];
  width?: number;
  height?: number;
  fontName?: string;
  hasEOL?: boolean;
}

interface PdfViewportLike {
  width: number;
  height: number;
  transform: number[];
  convertToViewportPoint(x: number, y: number): [number, number];
}

interface PdfRenderTaskLike {
  promise: Promise<void>;
}

interface PdfImageDataLike {
  width: number;
  height: number;
  kind?: number;
  data?: Uint8Array | Uint8ClampedArray;
  bitmap?: CanvasImageSource;
}

interface PdfObjectPoolLike {
  get(id: string, callback?: (value: unknown) => void): unknown;
  has?(id: string): boolean;
}

interface PdfPageLike {
  objs: PdfObjectPoolLike;
  commonObjs: PdfObjectPoolLike;
}

interface PdfConversionPageLike extends PdfPageLike {
  getViewport(options: { scale: number }): PdfViewportLike;
  getTextContent(): Promise<{
    items: unknown[];
    styles: Record<string, PdfTextStyleLike>;
  }>;
  getOperatorList(): Promise<PdfOperatorListLike>;
  render(options: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewportLike;
  }): PdfRenderTaskLike;
}

interface PdfOperatorListLike {
  fnArray: number[];
  argsArray: unknown[][];
}

interface PdfOperationsLike {
  save: number;
  restore: number;
  transform: number;
  paintFormXObjectBegin: number;
  paintFormXObjectEnd: number;
  paintImageXObject: number;
  paintInlineImageXObject: number;
  paintInlineImageXObjectGroup: number;
  paintImageXObjectRepeat: number;
}

type TransformationMatrix = [number, number, number, number, number, number];

interface PositionedText {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  hasEOL: boolean;
}

interface ImagePlacement {
  source: PdfImageDataLike;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  x: number;
  y: number;
  width: number;
  height: number;
  xVector: [number, number];
  yVector: [number, number];
  origin: [number, number];
}

interface RenderedOcrPage {
  data: Uint8Array;
  pixelWidth: number;
  pixelHeight: number;
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function reportProgress(
  options: ConvertPdfToWordOptions,
  progress: PdfToWordProgress
): void {
  options.onProgress?.({
    ...progress,
    percent: Math.round(clamp(progress.percent, 0, 100)),
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function isPdfTextItem(item: unknown): item is PdfTextItemLike {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as { str?: unknown; transform?: unknown };
  return typeof candidate.str === 'string' && Array.isArray(candidate.transform);
}

function isPdfImageData(value: unknown): value is PdfImageDataLike {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { width?: unknown; height?: unknown };
  return (
    typeof candidate.width === 'number' &&
    candidate.width > 0 &&
    typeof candidate.height === 'number' &&
    candidate.height > 0
  );
}

function normalizeText(value: string): string {
  return value.replace(/\u0000/g, '').replace(/\s+/g, ' ');
}

function normalizeFontFamily(value: string | undefined): string {
  return value?.trim() || 'Arial';
}

function detectFontStyle(fontFamily: string, fontName: string | undefined) {
  const descriptor = `${fontFamily} ${fontName ?? ''}`.toLowerCase();
  return {
    bold: /(bold|black|heavy|semibold|demibold)/.test(descriptor),
    italic: /(italic|oblique)/.test(descriptor),
  };
}

function isCjkCharacter(value: string): boolean {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(value);
}

function shouldInsertSpace(previous: PositionedText, current: PositionedText): boolean {
  if (/\s$/.test(previous.text) || /^\s/.test(current.text)) return false;

  const previousLast = previous.text.at(-1) ?? '';
  const currentFirst = current.text.at(0) ?? '';
  if (isCjkCharacter(previousLast) && isCjkCharacter(currentFirst)) return false;

  const gap = current.x - (previous.x + previous.width);
  const fontReference = Math.min(previous.fontSize, current.fontSize);
  return gap > Math.max(0.75, fontReference * 0.12);
}

function toTextRun(item: PositionedText, prefix = ''): PdfWordTextRun {
  return {
    text: `${prefix}${item.text}`,
    fontFamily: item.fontFamily,
    fontSize: item.fontSize,
    bold: item.bold,
    italic: item.italic,
  };
}

function groupTextItemsIntoLines(items: PositionedText[]): PdfWordTextLine[] {
  const sorted = [...items].sort((a, b) => {
    const yDifference = a.y - b.y;
    if (Math.abs(yDifference) > Math.max(2, Math.min(a.fontSize, b.fontSize) * 0.3)) {
      return yDifference;
    }
    return a.x - b.x;
  });
  const groups: PositionedText[][] = [];

  for (const item of sorted) {
    const currentLine = groups[groups.length - 1];
    const baselineTolerance = currentLine
      ? Math.max(2, Math.min(currentLine[0].fontSize, item.fontSize) * 0.3)
      : 0;
    const startsNewLine =
      !currentLine ||
      Math.abs(currentLine[0].y - item.y) > baselineTolerance ||
      Boolean(currentLine[currentLine.length - 1]?.hasEOL);

    if (startsNewLine) {
      groups.push([item]);
    } else {
      currentLine.push(item);
    }
  }

  return groups.flatMap((group) => {
    const lineItems = group.sort((a, b) => a.x - b.x);
    const runs: PdfWordTextRun[] = [];

    for (const [index, item] of lineItems.entries()) {
      const previous = lineItems[index - 1];
      const prefix = previous && shouldInsertSpace(previous, item) ? ' ' : '';
      const run = toTextRun(item, prefix);
      const lastRun = runs[runs.length - 1];

      if (
        lastRun &&
        lastRun.fontFamily === run.fontFamily &&
        Math.abs(lastRun.fontSize - run.fontSize) < 0.1 &&
        lastRun.bold === run.bold &&
        lastRun.italic === run.italic
      ) {
        lastRun.text += run.text;
      } else {
        runs.push(run);
      }
    }

    const text = runs.map((run) => run.text).join('').trim();
    if (!text) return [];

    if (text !== runs.map((run) => run.text).join('')) {
      runs[0].text = runs[0].text.trimStart();
      runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd();
    }

    const x = Math.min(...lineItems.map((item) => item.x));
    const right = Math.max(...lineItems.map((item) => item.x + item.width));
    const maximumFontSize = Math.max(...lineItems.map((item) => item.fontSize));
    const baseline = lineItems.reduce((total, item) => total + item.y, 0) / lineItems.length;

    return [
      {
        kind: 'text' as const,
        x,
        y: Math.max(0, baseline - maximumFontSize * 0.82),
        width: Math.max(1, right - x),
        height: Math.max(maximumFontSize * 1.15, ...lineItems.map((item) => item.height)),
        runs,
      },
    ];
  });
}

function extractPositionedText(
  items: unknown[],
  styles: Record<string, PdfTextStyleLike>,
  viewport: PdfViewportLike
): PositionedText[] {
  const positioned: PositionedText[] = [];

  for (const item of items.slice(0, MAX_TEXT_ITEMS_PER_PAGE)) {
    if (!isPdfTextItem(item)) continue;
    const text = normalizeText(item.str);
    if (!text.trim()) continue;

    const fontName = item.fontName ?? '';
    const fontFamily = normalizeFontFamily(styles[fontName]?.fontFamily);
    const fontSize = clamp(
      Math.hypot(Number(item.transform[2] ?? 0), Number(item.transform[3] ?? 0)) ||
        Number(item.height ?? 0) ||
        11,
      4,
      200
    );
    const style = detectFontStyle(fontFamily, fontName);
    const [x, baseline] = viewport.convertToViewportPoint(
      Number(item.transform[4] ?? 0),
      Number(item.transform[5] ?? 0)
    );

    positioned.push({
      text,
      x,
      y: baseline,
      width: Math.max(0, Number(item.width ?? 0)),
      height: Math.max(fontSize, Number(item.height ?? fontSize)),
      fontFamily,
      fontSize,
      bold: style.bold,
      italic: style.italic,
      hasEOL: Boolean(item.hasEOL),
    });
  }

  return positioned;
}

function toMatrix(value: unknown): TransformationMatrix | null {
  if (!Array.isArray(value) && !ArrayBuffer.isView(value)) return null;
  const values = Array.from(value as ArrayLike<unknown>, Number);
  if (values.length < 6 || values.some((entry) => !Number.isFinite(entry))) return null;
  return values.slice(0, 6) as TransformationMatrix;
}

function multiplyMatrices(
  first: TransformationMatrix,
  second: TransformationMatrix
): TransformationMatrix {
  const [a1, b1, c1, d1, e1, f1] = first;
  const [a2, b2, c2, d2, e2, f2] = second;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function applyMatrix(
  matrix: TransformationMatrix,
  x: number,
  y: number
): [number, number] {
  return [
    matrix[0] * x + matrix[2] * y + matrix[4],
    matrix[1] * x + matrix[3] * y + matrix[5],
  ];
}

async function resolveImageObject(
  page: PdfPageLike,
  objectId: unknown
): Promise<PdfImageDataLike | null> {
  if (typeof objectId !== 'string') return null;
  const pool = objectId.startsWith('g_') ? page.commonObjs : page.objs;

  try {
    if (pool.has?.(objectId)) {
      const value = pool.get(objectId);
      return isPdfImageData(value) ? value : null;
    }

    const value = await new Promise<unknown>((resolve) => {
      pool.get(objectId, resolve);
    });
    return isPdfImageData(value) ? value : null;
  } catch {
    return null;
  }
}

function createImagePlacement(
  source: PdfImageDataLike,
  matrix: TransformationMatrix,
  crop?: ImagePlacement['crop']
): ImagePlacement | null {
  const topLeft = applyMatrix(matrix, 0, 1);
  const bottomLeft = applyMatrix(matrix, 0, 0);
  const topRight = applyMatrix(matrix, 1, 1);
  const bottomRight: [number, number] = [
    topRight[0] + bottomLeft[0] - topLeft[0],
    topRight[1] + bottomLeft[1] - topLeft[1],
  ];
  const xValues = [topLeft[0], bottomLeft[0], topRight[0], bottomRight[0]];
  const yValues = [topLeft[1], bottomLeft[1], topRight[1], bottomRight[1]];
  const x = Math.min(...xValues);
  const y = Math.min(...yValues);
  const width = Math.max(...xValues) - x;
  const height = Math.max(...yValues) - y;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < MIN_IMAGE_SIZE_POINTS ||
    height < MIN_IMAGE_SIZE_POINTS
  ) {
    return null;
  }

  return {
    source,
    crop,
    x,
    y,
    width,
    height,
    xVector: [topRight[0] - topLeft[0], topRight[1] - topLeft[1]],
    yVector: [bottomLeft[0] - topLeft[0], bottomLeft[1] - topLeft[1]],
    origin: [topLeft[0] - x, topLeft[1] - y],
  };
}

async function collectImagePlacements(
  page: PdfPageLike,
  operatorList: PdfOperatorListLike,
  operations: PdfOperationsLike,
  viewport: PdfViewportLike
): Promise<ImagePlacement[]> {
  let currentMatrix =
    toMatrix(viewport.transform) ?? ([1, 0, 0, 1, 0, 0] as TransformationMatrix);
  const matrixStack: TransformationMatrix[] = [];
  const placements: ImagePlacement[] = [];
  const imageCache = new Map<string, Promise<PdfImageDataLike | null>>();

  const getImage = (objectId: unknown) => {
    if (typeof objectId !== 'string') return Promise.resolve(null);
    const cached = imageCache.get(objectId);
    if (cached) return cached;
    const pending = resolveImageObject(page, objectId);
    imageCache.set(objectId, pending);
    return pending;
  };
  const addPlacement = (
    source: PdfImageDataLike | null,
    matrix: TransformationMatrix,
    crop?: ImagePlacement['crop']
  ) => {
    if (!source || placements.length >= MAX_IMAGES_PER_PAGE) return;
    const placement = createImagePlacement(source, matrix, crop);
    if (placement) placements.push(placement);
  };

  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
    if (placements.length >= MAX_IMAGES_PER_PAGE) break;
    const operation = operatorList.fnArray[index];
    const args = operatorList.argsArray[index] ?? [];

    if (operation === operations.save) {
      matrixStack.push([...currentMatrix] as TransformationMatrix);
      continue;
    }

    if (operation === operations.restore) {
      currentMatrix = matrixStack.pop() ?? currentMatrix;
      continue;
    }

    if (operation === operations.transform) {
      const transform = toMatrix(args);
      if (transform) currentMatrix = multiplyMatrices(currentMatrix, transform);
      continue;
    }

    if (operation === operations.paintFormXObjectBegin) {
      matrixStack.push([...currentMatrix] as TransformationMatrix);
      const transform = toMatrix(args[0]);
      if (transform) currentMatrix = multiplyMatrices(currentMatrix, transform);
      continue;
    }

    if (operation === operations.paintFormXObjectEnd) {
      currentMatrix = matrixStack.pop() ?? currentMatrix;
      continue;
    }

    if (operation === operations.paintImageXObject) {
      addPlacement(await getImage(args[0]), currentMatrix);
      continue;
    }

    if (operation === operations.paintInlineImageXObject) {
      addPlacement(isPdfImageData(args[0]) ? args[0] : null, currentMatrix);
      continue;
    }

    if (operation === operations.paintInlineImageXObjectGroup) {
      const source = isPdfImageData(args[0]) ? args[0] : null;
      const entries = Array.isArray(args[1]) ? args[1] : [];
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;
        const candidate = entry as {
          transform?: unknown;
          x?: unknown;
          y?: unknown;
          w?: unknown;
          h?: unknown;
        };
        const transform = toMatrix(candidate.transform);
        if (!transform) continue;
        const crop = {
          x: Number(candidate.x ?? 0),
          y: Number(candidate.y ?? 0),
          width: Number(candidate.w ?? source?.width ?? 0),
          height: Number(candidate.h ?? source?.height ?? 0),
        };
        addPlacement(source, multiplyMatrices(currentMatrix, transform), crop);
      }
      continue;
    }

    if (operation === operations.paintImageXObjectRepeat) {
      const source = await getImage(args[0]);
      const scaleX = Number(args[1] ?? 1);
      const scaleY = Number(args[2] ?? 1);
      const positions = (
        Array.isArray(args[3]) || ArrayBuffer.isView(args[3]) ? args[3] : []
      ) as ArrayLike<unknown>;
      for (let positionIndex = 0; positionIndex < positions.length; positionIndex += 2) {
        const transform: TransformationMatrix = [
          scaleX,
          0,
          0,
          scaleY,
          Number(positions[positionIndex] ?? 0),
          Number(positions[positionIndex + 1] ?? 0),
        ];
        addPlacement(source, multiplyMatrices(currentMatrix, transform));
      }
    }
  }

  return placements;
}

function putPdfImageData(
  context: CanvasRenderingContext2D,
  image: PdfImageDataLike,
  width: number,
  height: number
) {
  if (image.bitmap) {
    context.drawImage(image.bitmap, 0, 0, width, height);
    return;
  }

  if (!image.data) {
    throw new Error('The PDF image does not contain raster data.');
  }

  const output = context.createImageData(width, height);
  const destination = output.data;
  const source = image.data;

  if (image.kind === 3 || source.length === width * height * 4) {
    destination.set(source.subarray(0, destination.length));
  } else if (image.kind === 2 || source.length === width * height * 3) {
    for (let sourceIndex = 0, destinationIndex = 0; destinationIndex < destination.length; ) {
      destination[destinationIndex++] = source[sourceIndex++] ?? 0;
      destination[destinationIndex++] = source[sourceIndex++] ?? 0;
      destination[destinationIndex++] = source[sourceIndex++] ?? 0;
      destination[destinationIndex++] = 255;
    }
  } else if (image.kind === 1) {
    const rowBytes = Math.ceil(width / 8);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const byte = source[y * rowBytes + Math.floor(x / 8)] ?? 0;
        const isWhite = (byte & (128 >> (x % 8))) !== 0;
        const destinationIndex = (y * width + x) * 4;
        const value = isWhite ? 255 : 0;
        destination[destinationIndex] = value;
        destination[destinationIndex + 1] = value;
        destination[destinationIndex + 2] = value;
        destination[destinationIndex + 3] = 255;
      }
    }
  } else {
    throw new Error('The PDF image uses an unsupported pixel format.');
  }

  context.putImageData(output, 0, 0);
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Could not encode the PDF image.'));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

async function renderPageForOcr(
  page: PdfConversionPageLike,
  pageViewport: PdfViewportLike
): Promise<RenderedOcrPage | null> {
  const desiredPixels =
    pageViewport.width *
    pageViewport.height *
    OCR_RENDER_SCALE *
    OCR_RENDER_SCALE;
  const scale =
    desiredPixels > MAX_OCR_PAGE_PIXELS
      ? OCR_RENDER_SCALE * Math.sqrt(MAX_OCR_PAGE_PIXELS / desiredPixels)
      : OCR_RENDER_SCALE;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return null;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;

  return {
    data: await canvasToPng(canvas),
    pixelWidth: canvas.width,
    pixelHeight: canvas.height,
  };
}

function createVisualFallbackImage(
  page: RenderedOcrPage,
  viewport: PdfViewportLike,
  pageNumber: number
): PdfWordImage {
  return {
    kind: 'image',
    x: 0,
    y: 0,
    width: viewport.width,
    height: viewport.height,
    data: page.data,
    description: `Rendered PDF page ${pageNumber}`,
  };
}

async function recognizeRenderedPdfPage(
  renderedPage: RenderedOcrPage,
  pageNumber: number,
  viewport: PdfViewportLike,
  language: OcrLanguage,
  options: ConvertPdfToWordOptions,
  totalPages: number
): Promise<PdfWordTextLine[]> {
  const imageFile = new File(
    [renderedPage.data as BlobPart],
    `pdf-page-${pageNumber}.png`,
    { type: 'image/png' }
  );
  const pageBaseProgress = 5 + ((pageNumber - 1) / totalPages) * 88;
  const pageProgressSpan = 88 / totalPages;
  const outcome = await recognizeImageOcr(imageFile, {
    language,
    onProgress: (ocrProgress) => {
      reportProgress(options, {
        stage: 'ocr',
        percent:
          pageBaseProgress +
          pageProgressSpan * (0.25 + (ocrProgress.percent / 100) * 0.7),
        pageNumber,
        totalPages,
        ocrStage: ocrProgress.stage,
      });
    },
  });

  if (!outcome.ok) return [];

  return createPdfWordLinesFromOcr(
    outcome.blocks,
    outcome.imageWidth,
    outcome.imageHeight,
    viewport.width,
    viewport.height,
    language
  );
}

async function renderImagePlacement(
  placement: ImagePlacement,
  pageNumber: number,
  imageNumber: number,
  remainingPixelBudget: number
): Promise<{ image: PdfWordImage; pixelCount: number } | null> {
  if (placement.source.width * placement.source.height > MAX_SOURCE_IMAGE_PIXELS) {
    return null;
  }

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = placement.source.width;
  sourceCanvas.height = placement.source.height;
  const sourceContext = sourceCanvas.getContext('2d', { alpha: true });
  if (!sourceContext) return null;

  putPdfImageData(
    sourceContext,
    placement.source,
    placement.source.width,
    placement.source.height
  );

  const sourceRegion = placement.crop ?? {
    x: 0,
    y: 0,
    width: placement.source.width,
    height: placement.source.height,
  };
  const horizontalPoints = Math.hypot(...placement.xVector);
  const verticalPoints = Math.hypot(...placement.yVector);
  const sourceDensity = Math.max(
    sourceRegion.width / Math.max(horizontalPoints, 1),
    sourceRegion.height / Math.max(verticalPoints, 1)
  );
  let pixelScale = clamp(sourceDensity, 1, 3);
  const initialArea = placement.width * placement.height * pixelScale * pixelScale;
  const pixelBudget = Math.max(1, Math.min(MAX_IMAGE_PIXELS, remainingPixelBudget));
  if (initialArea > pixelBudget) {
    pixelScale *= Math.sqrt(pixelBudget / initialArea);
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = Math.max(1, Math.ceil(placement.width * pixelScale));
  outputCanvas.height = Math.max(1, Math.ceil(placement.height * pixelScale));
  const pixelCount = outputCanvas.width * outputCanvas.height;
  const outputContext = outputCanvas.getContext('2d', { alpha: true });
  if (!outputContext) return null;

  outputContext.setTransform(
    (placement.xVector[0] * pixelScale) / sourceRegion.width,
    (placement.xVector[1] * pixelScale) / sourceRegion.width,
    (placement.yVector[0] * pixelScale) / sourceRegion.height,
    (placement.yVector[1] * pixelScale) / sourceRegion.height,
    placement.origin[0] * pixelScale,
    placement.origin[1] * pixelScale
  );
  outputContext.drawImage(
    sourceCanvas,
    sourceRegion.x,
    sourceRegion.y,
    sourceRegion.width,
    sourceRegion.height,
    0,
    0,
    sourceRegion.width,
    sourceRegion.height
  );

  return {
    pixelCount,
    image: {
      kind: 'image',
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      data: await canvasToPng(outputCanvas),
      description: `Image ${imageNumber} from PDF page ${pageNumber}`,
    },
  };
}

async function extractPageImages(
  page: PdfPageLike & {
    getOperatorList(): Promise<PdfOperatorListLike>;
  },
  viewport: PdfViewportLike,
  operations: PdfOperationsLike,
  pageNumber: number
): Promise<PdfWordImage[]> {
  const operatorList = await page.getOperatorList();
  const placements = await collectImagePlacements(page, operatorList, operations, viewport);
  const images: PdfWordImage[] = [];
  let usedImagePixels = 0;

  for (const [index, placement] of placements.entries()) {
    const remainingPixelBudget = MAX_TOTAL_IMAGE_PIXELS_PER_PAGE - usedImagePixels;
    if (remainingPixelBudget <= 0) break;

    try {
      const extracted = await renderImagePlacement(
        placement,
        pageNumber,
        index + 1,
        remainingPixelBudget
      );
      if (extracted) {
        images.push(extracted.image);
        usedImagePixels += extracted.pixelCount;
      }
    } catch {
      // One unsupported PDF image should not prevent all remaining content from converting.
    }
  }

  return images;
}

export async function convertPdfToWord(
  file: File,
  options: ConvertPdfToWordOptions = {}
): Promise<PdfToWordOutcome> {
  const startedAt = now();
  const ocrLanguage = options.ocrLanguage ?? 'eng';

  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (!isPdfFile(file)) return { ok: false, code: 'unsupported_input' };
  if (file.size > MAX_PDF_INPUT_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_PDF_INPUT_FILE_SIZE),
    };
  }

  try {
    reportProgress(options, { stage: 'loading', percent: 2 });
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data, useSystemFonts: true });
    const pdf = await loadingTask.promise;
    const pages: PdfWordPage[] = [];
    const pageRoutes: PdfToWordPageRoute[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = (await pdf.getPage(pageNumber)) as unknown as PdfConversionPageLike;
      const viewport = page.getViewport({ scale: 1 });
      const pageBaseProgress = 5 + ((pageNumber - 1) / pdf.numPages) * 88;
      const pageProgressSpan = 88 / pdf.numPages;
      reportProgress(options, {
        stage: 'analyzing',
        percent: pageBaseProgress,
        pageNumber,
        totalPages: pdf.numPages,
      });
      const textContent = await page.getTextContent();
      const positionedText = extractPositionedText(
        textContent.items,
        textContent.styles,
        viewport
      );
      const nativeLines = groupTextItemsIntoLines(positionedText);
      let extractedImages: PdfWordImage[] = [];
      try {
        extractedImages = await extractPageImages(page, viewport, pdfjs.OPS, pageNumber);
      } catch {
        // A malformed image operator list should not block text or OCR conversion.
      }

      let lines = nativeLines;
      let images = extractedImages;
      let route: PdfToWordPageRoute = 'native';

      if (!shouldUseNativePdfText(positionedText, viewport.width, viewport.height)) {
        let renderedPage: RenderedOcrPage | null = null;
        try {
          renderedPage = await renderPageForOcr(page, viewport);
        } catch {
          // Fall back to the sparse native content below when page rendering fails.
        }

        if (renderedPage) {
          const ocrLines = await recognizeRenderedPdfPage(
            renderedPage,
            pageNumber,
            viewport,
            ocrLanguage,
            options,
            pdf.numPages
          );

          if (ocrLines.length > 0) {
            lines = ocrLines;
            images = retainImagesForOcrPage(
              extractedImages,
              viewport.width,
              viewport.height
            );
            route = 'ocr';
          } else {
            lines = [];
            images = [createVisualFallbackImage(renderedPage, viewport, pageNumber)];
            route = 'visual';
          }
        } else if (nativeLines.length === 0 && extractedImages.length === 0) {
          return { ok: false, code: 'render_failed' };
        } else {
          route = nativeLines.length > 0 ? 'native' : 'visual';
        }
      }

      pages.push({
        width: viewport.width,
        height: viewport.height,
        lines,
        images,
      });
      pageRoutes.push(route);
      reportProgress(options, {
        stage: 'analyzing',
        percent: pageBaseProgress + pageProgressSpan,
        pageNumber,
        totalPages: pdf.numPages,
      });
    }

    const paragraphCount = pages.reduce((total, page) => total + page.lines.length, 0);
    const imageCount = pages.reduce((total, page) => total + page.images.length, 0);
    if (paragraphCount === 0 && imageCount === 0) {
      return { ok: false, code: 'empty_text' };
    }

    reportProgress(options, { stage: 'building', percent: 95 });
    const blob = createPdfToWordDocxBlob(pages);
    reportProgress(options, { stage: 'building', percent: 100 });

    return {
      ok: true,
      blob,
      filename: createPdfDerivedFilename(file.name, 'word').replace(/\.pdf$/, '.docx'),
      pageCount: pdf.numPages,
      paragraphCount,
      imageCount,
      nativePageCount: pageRoutes.filter((route) => route === 'native').length,
      ocrPageCount: pageRoutes.filter((route) => route === 'ocr').length,
      visualPageCount: pageRoutes.filter((route) => route === 'visual').length,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}
