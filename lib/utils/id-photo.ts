import { clampNumber } from './image';

export type IdPhotoPresetId =
  | 'cn-one-inch'
  | 'cn-two-inch'
  | 'cn-visa'
  | 'us-passport'
  | 'eu-passport'
  | 'jp-passport'
  | 'custom';

export interface IdPhotoPreset {
  id: IdPhotoPresetId;
  labelKey: string;
  widthMm: number;
  heightMm: number;
  headRatio: number;
  headTopRatio: number;
}

export interface IdPhotoSize {
  widthMm: number;
  heightMm: number;
  dpi: number;
}

export interface IdPhotoCanvasSize {
  width: number;
  height: number;
}

export interface IdPhotoBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IdPhotoTransform {
  x: number;
  y: number;
  scale: number;
}

export type IdPhotoFaceStatus = 'detected' | 'fallback' | 'unsupported';

export interface IdPhotoRenderSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: 'image/jpeg' | 'image/png';
  width: number;
  height: number;
  outputSize: number;
  durationMs: number;
}

export type IdPhotoRenderOutcome =
  | IdPhotoRenderSuccess
  | { ok: false; code: 'canvas_context' | 'canvas_export' | 'load_failed' | 'invalid_dimensions' };

interface FaceDetectorResult {
  boundingBox: DOMRectReadOnly;
}

interface FaceDetectorInstance {
  detect(image: ImageBitmapSource): Promise<FaceDetectorResult[]>;
}

interface FaceDetectorConstructor {
  new (options?: { fastMode?: boolean; maxDetectedFaces?: number }): FaceDetectorInstance;
}

type FaceDetectorWindow = Window & {
  FaceDetector?: FaceDetectorConstructor;
};

export const ID_PHOTO_DPI = 300;
export const ID_PHOTO_HEAD_RATIO_MIN = 0.5;
export const ID_PHOTO_HEAD_RATIO_MAX = 0.7;
export const ID_PHOTO_DEFAULT_HEAD_RATIO = 0.62;
export const ID_PHOTO_DEFAULT_HEAD_TOP_RATIO = 0.12;
export const ID_PHOTO_CUSTOM_MIN_MM = 10;
export const ID_PHOTO_CUSTOM_MAX_MM = 100;
export const ID_PHOTO_SCALE_MIN = 0.2;
export const ID_PHOTO_SCALE_MAX = 8;

export const idPhotoPresets: IdPhotoPreset[] = [
  {
    id: 'cn-one-inch',
    labelKey: 'preset_cn_one_inch',
    widthMm: 25,
    heightMm: 35,
    headRatio: 0.62,
    headTopRatio: 0.12,
  },
  {
    id: 'cn-two-inch',
    labelKey: 'preset_cn_two_inch',
    widthMm: 35,
    heightMm: 49,
    headRatio: 0.62,
    headTopRatio: 0.12,
  },
  {
    id: 'cn-visa',
    labelKey: 'preset_cn_visa',
    widthMm: 33,
    heightMm: 48,
    headRatio: 0.62,
    headTopRatio: 0.11,
  },
  {
    id: 'us-passport',
    labelKey: 'preset_us_passport',
    widthMm: 51,
    heightMm: 51,
    headRatio: 0.6,
    headTopRatio: 0.14,
  },
  {
    id: 'eu-passport',
    labelKey: 'preset_eu_passport',
    widthMm: 35,
    heightMm: 45,
    headRatio: 0.6,
    headTopRatio: 0.13,
  },
  {
    id: 'jp-passport',
    labelKey: 'preset_jp_passport',
    widthMm: 35,
    heightMm: 45,
    headRatio: 0.58,
    headTopRatio: 0.15,
  },
];

export const idPhotoBackgroundColors = [
  { id: 'white', value: '#ffffff', labelKey: 'background_white' },
  { id: 'blue', value: '#4387f4', labelKey: 'background_blue' },
  { id: 'red', value: '#d83838', labelKey: 'background_red' },
  { id: 'gray', value: '#f3f6fb', labelKey: 'background_gray' },
] as const;

export function mmToPixels(mm: number, dpi = ID_PHOTO_DPI): number {
  return Math.max(1, Math.round((mm / 25.4) * dpi));
}

export function getIdPhotoCanvasSize(size: IdPhotoSize): IdPhotoCanvasSize {
  return {
    width: mmToPixels(size.widthMm, size.dpi),
    height: mmToPixels(size.heightMm, size.dpi),
  };
}

export function formatIdPhotoMm(widthMm: number, heightMm: number): string {
  return `${formatMm(widthMm)} x ${formatMm(heightMm)} mm`;
}

export function formatIdPhotoPixels(width: number, height: number): string {
  return `${width} x ${height} px`;
}

export function normalizeCustomMillimeters(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clampNumber(parsed, ID_PHOTO_CUSTOM_MIN_MM, ID_PHOTO_CUSTOM_MAX_MM);
}

export function createIdPhotoFilename(filename: string, presetId: IdPhotoPresetId, extension: 'jpg' | 'png'): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'id-photo';
  return `${base}-${presetId}.${extension}`;
}

export function clampIdPhotoScale(scale: number): number {
  return clampNumber(scale, ID_PHOTO_SCALE_MIN, ID_PHOTO_SCALE_MAX);
}

export function scaleIdPhotoTransform(
  transform: IdPhotoTransform,
  nextScale: number,
  anchor: { x: number; y: number }
): IdPhotoTransform {
  const scale = clampIdPhotoScale(nextScale);
  const currentScale = transform.scale > 0 ? transform.scale : 1;
  const imageX = (anchor.x - transform.x) / currentScale;
  const imageY = (anchor.y - transform.y) / currentScale;

  return {
    scale,
    x: anchor.x - imageX * scale,
    y: anchor.y - imageY * scale,
  };
}

export function estimateHeadBoundsFromFace(face: IdPhotoBounds, sourceWidth: number, sourceHeight: number): IdPhotoBounds {
  const width = face.width * 1.55;
  const height = face.height * 1.8;
  const centerX = face.x + face.width / 2;
  const x = clampNumber(centerX - width / 2, 0, Math.max(0, sourceWidth - width));
  const y = clampNumber(face.y - face.height * 0.38, 0, Math.max(0, sourceHeight - height));

  return {
    x,
    y,
    width: Math.min(width, sourceWidth - x),
    height: Math.min(height, sourceHeight - y),
  };
}

export function createInitialIdPhotoTransform(options: {
  canvas: IdPhotoCanvasSize;
  sourceWidth: number;
  sourceHeight: number;
  preset?: Pick<IdPhotoPreset, 'headRatio' | 'headTopRatio'>;
  faceBounds?: IdPhotoBounds | null;
  subjectBounds?: IdPhotoBounds | null;
}): IdPhotoTransform {
  const { canvas, sourceWidth, sourceHeight, preset, faceBounds, subjectBounds } = options;
  const headRatio = preset?.headRatio ?? ID_PHOTO_DEFAULT_HEAD_RATIO;
  const headTopRatio = preset?.headTopRatio ?? ID_PHOTO_DEFAULT_HEAD_TOP_RATIO;
  const targetHeadHeight = canvas.height * clampNumber(headRatio, ID_PHOTO_HEAD_RATIO_MIN, ID_PHOTO_HEAD_RATIO_MAX);

  if (faceBounds) {
    const headBounds = estimateHeadBoundsFromFace(faceBounds, sourceWidth, sourceHeight);
    const scale = clampIdPhotoScale(targetHeadHeight / headBounds.height);

    return {
      scale,
      x: canvas.width / 2 - (headBounds.x + headBounds.width / 2) * scale,
      y: canvas.height * headTopRatio - headBounds.y * scale,
    };
  }

  if (subjectBounds) {
    const scale = clampIdPhotoScale((canvas.height * 0.9) / subjectBounds.height);

    return {
      scale,
      x: canvas.width / 2 - (subjectBounds.x + subjectBounds.width / 2) * scale,
      y: canvas.height * 0.05 - subjectBounds.y * scale,
    };
  }

  const scale = clampIdPhotoScale(Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight));

  return {
    scale,
    x: (canvas.width - sourceWidth * scale) / 2,
    y: (canvas.height - sourceHeight * scale) / 2,
  };
}

export async function detectFaceBounds(file: File): Promise<{ bounds: IdPhotoBounds | null; status: IdPhotoFaceStatus }> {
  if (typeof window === 'undefined' || typeof createImageBitmap === 'undefined') {
    return { bounds: null, status: 'unsupported' };
  }

  const FaceDetectorClass = (window as FaceDetectorWindow).FaceDetector;
  if (!FaceDetectorClass) return { bounds: null, status: 'unsupported' };

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const detector = new FaceDetectorClass({ fastMode: true, maxDetectedFaces: 4 });
    const faces = await detector.detect(bitmap);
    const largest = faces
      .map((face) => rectToBounds(face.boundingBox))
      .sort((a, b) => b.width * b.height - a.width * a.height)[0];

    return largest ? { bounds: largest, status: 'detected' } : { bounds: null, status: 'fallback' };
  } catch {
    return { bounds: null, status: 'fallback' };
  } finally {
    bitmap?.close();
  }
}

export async function getSubjectBoundsFromImageUrl(url: string): Promise<IdPhotoBounds | null> {
  const image = await loadImageElement(url);
  const maxSide = 1400;
  const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= 16) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return null;

  return {
    x: minX / ratio,
    y: minY / ratio,
    width: (maxX - minX + 1) / ratio,
    height: (maxY - minY + 1) / ratio,
  };
}

export async function renderIdPhotoImage(options: {
  subjectUrl: string;
  canvas: IdPhotoCanvasSize;
  transform: IdPhotoTransform;
  backgroundColor: string;
  filename: string;
  format?: 'jpg' | 'png';
}): Promise<IdPhotoRenderOutcome> {
  const startedAt = performance.now();
  const { subjectUrl, canvas, transform, backgroundColor, filename, format = 'jpg' } = options;

  if (canvas.width <= 0 || canvas.height <= 0) return { ok: false, code: 'invalid_dimensions' };

  try {
    const image = await loadImageElement(subjectUrl);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const context = outputCanvas.getContext('2d');
    if (!context) return { ok: false, code: 'canvas_context' };

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      transform.x,
      transform.y,
      image.naturalWidth * transform.scale,
      image.naturalHeight * transform.scale
    );

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(outputCanvas, mimeType, 0.95);
    if (!blob) return { ok: false, code: 'canvas_export' };

    return {
      ok: true,
      blob,
      filename,
      mimeType,
      width: canvas.width,
      height: canvas.height,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

function formatMm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function rectToBounds(rect: DOMRectReadOnly): IdPhotoBounds {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load failed'));
    image.decoding = 'async';
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: 'image/jpeg' | 'image/png',
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}
