export type ImageTargetFormat = 'jpg' | 'png' | 'webp';

export interface ImageTargetConfig {
  format: ImageTargetFormat;
  label: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: 'jpg' | 'png' | 'webp';
  supportsQuality: boolean;
  defaultQuality: number;
}

export interface ImageInputFormat {
  mimeType: string;
  label: string;
  extensions: string[];
}

export type ImageConversionErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'too_many_pixels'
  | 'load_failed'
  | 'canvas_context'
  | 'canvas_export'
  | 'unsupported_output';

export interface ImageConversionError {
  ok: false;
  code: ImageConversionErrorCode;
  detail?: string;
  maxSize?: string;
  maxPixels?: string;
}

export interface ImageConversionSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: ImageTargetConfig['mimeType'];
  width: number;
  height: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export type ImageConversionOutcome = ImageConversionSuccess | ImageConversionError;

export type ImageCompressionStrategy = 'reencoded' | 'kept-original';
export type ImageCompressionOutputMode = 'preserve' | 'webp';

export interface ImageCompressionSuccess {
  ok: true;
  blob: Blob;
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
  quantizedColors?: number;
  strategy: ImageCompressionStrategy;
}

export type ImageCompressionOutcome = ImageCompressionSuccess | ImageConversionError;

export type ImageBackgroundRemovalModel = 'small' | 'medium';

export interface ImageBackgroundRemovalProgress {
  stage: 'model' | 'compute';
  label: string;
  current: number;
  total: number;
  percent: number;
}

export interface ImageBackgroundRemovalSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: 'image/png';
  width: number;
  height: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export type ImageBackgroundRemovalOutcome = ImageBackgroundRemovalSuccess | ImageConversionError;

export interface ImageCropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageCropHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ImageInspectionSuccess {
  ok: true;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

export type ImageInspectionOutcome = ImageInspectionSuccess | ImageConversionError;

export interface ImageEditSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: ImageTargetConfig['mimeType'];
  format: ImageTargetFormat;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  crop: ImageCropRect;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export type ImageEditOutcome = ImageEditSuccess | ImageConversionError;

export const MAX_IMAGE_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;

export const imageTargetConfigs: Record<ImageTargetFormat, ImageTargetConfig> = {
  jpg: {
    format: 'jpg',
    label: 'JPG',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    supportsQuality: true,
    defaultQuality: 0.92,
  },
  png: {
    format: 'png',
    label: 'PNG',
    mimeType: 'image/png',
    extension: 'png',
    supportsQuality: false,
    defaultQuality: 1,
  },
  webp: {
    format: 'webp',
    label: 'WebP',
    mimeType: 'image/webp',
    extension: 'webp',
    supportsQuality: true,
    defaultQuality: 0.9,
  },
};

export const supportedImageInputs: ImageInputFormat[] = [
  { mimeType: 'image/jpeg', label: 'JPG', extensions: ['jpg', 'jpeg'] },
  { mimeType: 'image/png', label: 'PNG', extensions: ['png'] },
  { mimeType: 'image/webp', label: 'WebP', extensions: ['webp'] },
  { mimeType: 'image/gif', label: 'GIF', extensions: ['gif'] },
  { mimeType: 'image/bmp', label: 'BMP', extensions: ['bmp'] },
  { mimeType: 'image/svg+xml', label: 'SVG', extensions: ['svg'] },
  { mimeType: 'image/avif', label: 'AVIF', extensions: ['avif'] },
];

const extensionToMime = new Map(
  supportedImageInputs.flatMap((format) =>
    format.extensions.map((extension) => [extension, format.mimeType] as const)
  )
);

const supportedInputMimes = new Set(supportedImageInputs.map((format) => format.mimeType));

export function getImageTargetConfig(format: ImageTargetFormat): ImageTargetConfig {
  return imageTargetConfigs[format];
}

export function getImageAcceptValue(): string {
  const extensions = supportedImageInputs.flatMap((format) =>
    format.extensions.map((extension) => `.${extension}`)
  );

  return [...supportedInputMimes, ...extensions].join(',');
}

export function getSupportedImageInputLabel(): string {
  return supportedImageInputs.map((format) => format.label).join(' / ');
}

export function normalizeImageQuality(value: number): number {
  return Math.max(0.1, Math.min(1, value));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatPixelLimit(pixels: number): string {
  return `${(pixels / 1_000_000).toFixed(0)} MP`;
}

export function getFileExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? '';
}

export function inferImageMimeType(file: File): string {
  if (supportedInputMimes.has(file.type)) return file.type;

  const extension = getFileExtension(file.name);
  return extensionToMime.get(extension) ?? file.type;
}

export function isSupportedImageInput(file: File): boolean {
  return supportedInputMimes.has(inferImageMimeType(file));
}

export function createImageOutputFilename(filename: string, extension: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}.${extension}`;
}

export function createCompressedImageFilename(filename: string, extension: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-compressed.${extension}`;
}

export function createEditedImageFilename(filename: string, extension: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-edited.${extension}`;
}

export function createBackgroundRemovedImageFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-no-bg.png`;
}

export function calculateSavingsRatio(originalSize: number, outputSize: number): number {
  if (originalSize <= 0) return 0;
  return Math.max(0, (originalSize - outputSize) / originalSize);
}

export function formatSavingsPercent(ratio: number): string {
  return `${Math.round(Math.max(0, ratio) * 100)}%`;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeCropRect(rect: ImageCropRect, imageWidth: number, imageHeight: number): ImageCropRect {
  const minSize = Math.max(1, Math.min(imageWidth, imageHeight, 4));
  const width = clampNumber(Math.round(rect.width), minSize, Math.max(minSize, imageWidth));
  const height = clampNumber(Math.round(rect.height), minSize, Math.max(minSize, imageHeight));
  const x = clampNumber(Math.round(rect.x), 0, Math.max(0, imageWidth - width));
  const y = clampNumber(Math.round(rect.y), 0, Math.max(0, imageHeight - height));

  return { x, y, width, height };
}

export function createInitialCropRect(imageWidth: number, imageHeight: number): ImageCropRect {
  const sideRatio = 0.82;
  const width = Math.max(1, Math.round(imageWidth * sideRatio));
  const height = Math.max(1, Math.round(imageHeight * sideRatio));

  return normalizeCropRect({
    x: Math.round((imageWidth - width) / 2),
    y: Math.round((imageHeight - height) / 2),
    width,
    height,
  }, imageWidth, imageHeight);
}

export function getCropAspectRatio(crop: ImageCropRect): number {
  return crop.width / Math.max(1, crop.height);
}

export function getLinkedHeight(width: number, crop: ImageCropRect): number {
  return Math.max(1, Math.round(width / getCropAspectRatio(crop)));
}

export function getLinkedWidth(height: number, crop: ImageCropRect): number {
  return Math.max(1, Math.round(height * getCropAspectRatio(crop)));
}

export function moveCropRect(
  crop: ImageCropRect,
  deltaX: number,
  deltaY: number,
  imageWidth: number,
  imageHeight: number
): ImageCropRect {
  return normalizeCropRect({
    ...crop,
    x: crop.x + deltaX,
    y: crop.y + deltaY,
  }, imageWidth, imageHeight);
}

export function createCropRectFromPoints(
  start: { x: number; y: number },
  end: { x: number; y: number },
  imageWidth: number,
  imageHeight: number
): ImageCropRect {
  const x = clampNumber(Math.min(start.x, end.x), 0, imageWidth);
  const y = clampNumber(Math.min(start.y, end.y), 0, imageHeight);
  const right = clampNumber(Math.max(start.x, end.x), 0, imageWidth);
  const bottom = clampNumber(Math.max(start.y, end.y), 0, imageHeight);

  return normalizeCropRect({
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  }, imageWidth, imageHeight);
}

export function resizeCropRect(
  crop: ImageCropRect,
  handle: ImageCropHandle,
  deltaX: number,
  deltaY: number,
  imageWidth: number,
  imageHeight: number
): ImageCropRect {
  const minSize = Math.max(1, Math.min(imageWidth, imageHeight, 4));
  let left = crop.x;
  let top = crop.y;
  let right = crop.x + crop.width;
  let bottom = crop.y + crop.height;

  if (handle.includes('w')) {
    left = clampNumber(left + deltaX, 0, right - minSize);
  }
  if (handle.includes('e')) {
    right = clampNumber(right + deltaX, left + minSize, imageWidth);
  }
  if (handle.includes('n')) {
    top = clampNumber(top + deltaY, 0, bottom - minSize);
  }
  if (handle.includes('s')) {
    bottom = clampNumber(bottom + deltaY, top + minSize, imageHeight);
  }

  return normalizeCropRect({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }, imageWidth, imageHeight);
}
