import {
  createImageOutputFilename,
  formatFileSize,
  formatPixelLimit,
  inferImageMimeType,
  isSupportedImageInput,
  MAX_IMAGE_FILE_SIZE,
  MAX_IMAGE_PIXELS,
  type ImageConversionError,
} from './image';
import { createZipArchive } from './zip';

export type IconOutputFormat = 'ico' | 'icns' | 'png-zip';

export interface IconRenderTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  radius: number;
}

export interface LoadedIconImage {
  element: HTMLImageElement;
  width: number;
  height: number;
  filename: string;
  mimeType: string;
  originalSize: number;
  sourceUrl: string;
}

export interface LoadedIconImageSuccess {
  ok: true;
  image: LoadedIconImage;
}

export type LoadedIconImageOutcome = LoadedIconImageSuccess | ImageConversionError;

export interface IconOutputConfig {
  format: IconOutputFormat;
  label: string;
  extension: 'ico' | 'icns' | 'zip';
  mimeType: 'image/x-icon' | 'image/icns' | 'application/zip';
  sizes: number[];
}

export interface IconPackageSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: IconOutputConfig['mimeType'];
  format: IconOutputFormat;
  sizes: number[];
  outputSize: number;
  zipBlob?: Blob;
  zipFilename?: string;
  zipOutputSize?: number;
  durationMs: number;
}

export type IconPackageOutcome = IconPackageSuccess | ImageConversionError;

interface IconEntry {
  size: number;
  blob: Blob;
  pngBytes: Uint8Array;
  icoBytes: Uint8Array;
}

const ICO_ICON_SIZES = [16, 24, 32, 48, 64, 128, 256];
const ICNS_ICON_SIZES = [16, 32, 64, 128, 256, 512, 1024];
const PNG_ZIP_ICON_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

export const iconOutputConfigs: Record<IconOutputFormat, IconOutputConfig> = {
  ico: {
    format: 'ico',
    label: 'ICO',
    extension: 'ico',
    mimeType: 'image/x-icon',
    sizes: ICO_ICON_SIZES,
  },
  icns: {
    format: 'icns',
    label: 'ICNS',
    extension: 'icns',
    mimeType: 'image/icns',
    sizes: ICNS_ICON_SIZES,
  },
  'png-zip': {
    format: 'png-zip',
    label: 'PNG ZIP',
    extension: 'zip',
    mimeType: 'application/zip',
    sizes: PNG_ZIP_ICON_SIZES,
  },
};

const ICNS_CHUNK_TYPES = new Map<number, string>([
  [16, 'icp4'],
  [32, 'icp5'],
  [64, 'icp6'],
  [128, 'ic07'],
  [256, 'ic08'],
  [512, 'ic09'],
  [1024, 'ic10'],
]);

export function getIconAcceptValue(): string {
  return [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/avif',
    'image/bmp',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.svg',
    '.avif',
    '.bmp',
  ].join(',');
}

export function getIconOutputConfig(format: IconOutputFormat): IconOutputConfig {
  return iconOutputConfigs[format];
}

export function createIconOutputFilename(filename: string, format: IconOutputFormat): string {
  const config = getIconOutputConfig(format);
  return createImageOutputFilename(filename, config.extension);
}

export function createIconZipFilename(filename: string): string {
  return createImageOutputFilename(filename, 'zip');
}

export function createIconPngFilename(filename: string): string {
  return createImageOutputFilename(filename, 'png');
}

export function releaseLoadedIconImage(image: LoadedIconImage | null | undefined) {
  if (!image) return;
  URL.revokeObjectURL(image.sourceUrl);
}

export async function loadIconImageFile(file: File): Promise<LoadedIconImageOutcome> {
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

  const mimeType = inferImageMimeType(file);
  const sourceFile = mimeType === file.type ? file : new File([file], file.name, { type: mimeType });
  const sourceUrl = URL.createObjectURL(sourceFile);

  try {
    const element = await loadImageElement(sourceUrl);
    const width = element.naturalWidth || element.width;
    const height = element.naturalHeight || element.height;

    if (!width || !height) {
      URL.revokeObjectURL(sourceUrl);
      return { ok: false, code: 'load_failed' };
    }

    if (width * height > MAX_IMAGE_PIXELS) {
      URL.revokeObjectURL(sourceUrl);
      return {
        ok: false,
        code: 'too_many_pixels',
        maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
      };
    }

    return {
      ok: true,
      image: {
        element,
        width,
        height,
        filename: file.name,
        mimeType,
        originalSize: file.size,
        sourceUrl,
      },
    };
  } catch {
    URL.revokeObjectURL(sourceUrl);
    return { ok: false, code: 'load_failed' };
  }
}

function loadImageElement(sourceUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image failed to load.'));
    image.src = sourceUrl;
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function drawRoundedRect(context: CanvasRenderingContext2D, size: number, radius: number) {
  const safeRadius = clamp(radius, 0, size / 2);

  context.beginPath();
  context.moveTo(safeRadius, 0);
  context.lineTo(size - safeRadius, 0);
  context.quadraticCurveTo(size, 0, size, safeRadius);
  context.lineTo(size, size - safeRadius);
  context.quadraticCurveTo(size, size, size - safeRadius, size);
  context.lineTo(safeRadius, size);
  context.quadraticCurveTo(0, size, 0, size - safeRadius);
  context.lineTo(0, safeRadius);
  context.quadraticCurveTo(0, 0, safeRadius, 0);
  context.closePath();
}

export function renderIconToCanvas(
  canvas: HTMLCanvasElement,
  source: LoadedIconImage,
  transform: IconRenderTransform,
  size = canvas.width || 256
): boolean {
  const outputSize = Math.max(1, Math.round(size));
  if (canvas.width !== outputSize) canvas.width = outputSize;
  if (canvas.height !== outputSize) canvas.height = outputSize;

  const context = canvas.getContext('2d');
  if (!context) return false;

  context.clearRect(0, 0, outputSize, outputSize);
  context.save();

  const radius = (clamp(transform.radius, 0, 50) / 100) * outputSize;
  if (radius > 0) {
    drawRoundedRect(context, outputSize, radius);
    context.clip();
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const fitScale = Math.min(outputSize / source.width, outputSize / source.height);
  const userScale = clamp(transform.scale, 0.2, 6);
  const drawWidth = source.width * fitScale * userScale;
  const drawHeight = source.height * fitScale * userScale;
  const drawX = (outputSize - drawWidth) / 2 + clamp(transform.offsetX, -1.5, 1.5) * outputSize;
  const drawY = (outputSize - drawHeight) / 2 + clamp(transform.offsetY, -1.5, 1.5) * outputSize;

  context.drawImage(source.element, drawX, drawY, drawWidth, drawHeight);
  context.restore();

  return true;
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas export failed.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}

async function renderIconEntry(
  source: LoadedIconImage,
  size: number,
  transform: IconRenderTransform
): Promise<IconEntry> {
  const canvas = document.createElement('canvas');
  const rendered = renderIconToCanvas(canvas, source, transform, size);
  if (!rendered) throw new Error('Canvas context failed.');

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context failed.');

  const imageData = context.getImageData(0, 0, size, size);
  const blob = await canvasToBlob(canvas);
  const pngBytes = new Uint8Array(await blob.arrayBuffer());

  return {
    size,
    blob,
    pngBytes,
    icoBytes: size >= 256 ? pngBytes : createIcoDibBytes(imageData),
  };
}

function createIcoDibBytes(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  const xorStride = width * 4;
  const andStride = Math.ceil(width / 32) * 4;
  const pixelBytes = xorStride * height;
  const maskBytes = andStride * height;
  const bytes = new Uint8Array(40 + pixelBytes + maskBytes);
  const view = new DataView(bytes.buffer);

  view.setUint32(0, 40, true);
  view.setInt32(4, width, true);
  view.setInt32(8, height * 2, true);
  view.setUint16(12, 1, true);
  view.setUint16(14, 32, true);
  view.setUint32(16, 0, true);
  view.setUint32(20, pixelBytes + maskBytes, true);
  view.setInt32(24, 0, true);
  view.setInt32(28, 0, true);
  view.setUint32(32, 0, true);
  view.setUint32(36, 0, true);

  let targetOffset = 40;
  for (let y = height - 1; y >= 0; y -= 1) {
    const sourceRow = y * width * 4;

    for (let x = 0; x < width; x += 1) {
      const sourceOffset = sourceRow + x * 4;
      bytes[targetOffset] = data[sourceOffset + 2];
      bytes[targetOffset + 1] = data[sourceOffset + 1];
      bytes[targetOffset + 2] = data[sourceOffset];
      bytes[targetOffset + 3] = data[sourceOffset + 3];
      targetOffset += 4;
    }
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function writeAscii(bytes: Uint8Array, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
  }
}

function createIcoBlob(entries: IconEntry[]): Blob {
  const directorySize = 6 + entries.length * 16;
  const header = new Uint8Array(directorySize);
  const view = new DataView(header.buffer);
  let imageOffset = directorySize;

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, entries.length, true);

  entries.forEach((entry, index) => {
    const offset = 6 + index * 16;
    const sizeByte = entry.size >= 256 ? 0 : entry.size;

    header[offset] = sizeByte;
    header[offset + 1] = sizeByte;
    header[offset + 2] = 0;
    header[offset + 3] = 0;
    view.setUint16(offset + 4, 1, true);
    view.setUint16(offset + 6, 32, true);
    view.setUint32(offset + 8, entry.icoBytes.byteLength, true);
    view.setUint32(offset + 12, imageOffset, true);
    imageOffset += entry.icoBytes.byteLength;
  });

  return new Blob([toArrayBuffer(header), ...entries.map((entry) => toArrayBuffer(entry.icoBytes))], {
    type: iconOutputConfigs.ico.mimeType,
  });
}

function createIcnsChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(8 + data.byteLength);
  const view = new DataView(chunk.buffer);

  writeAscii(chunk, 0, type);
  view.setUint32(4, chunk.byteLength, false);
  chunk.set(data, 8);

  return chunk;
}

function createIcnsBlob(entries: IconEntry[]): Blob {
  const chunks = entries
    .map((entry) => {
      const chunkType = ICNS_CHUNK_TYPES.get(entry.size);
      return chunkType ? createIcnsChunk(chunkType, entry.pngBytes) : null;
    })
    .filter((chunk): chunk is Uint8Array => Boolean(chunk));
  const totalLength = 8 + chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const header = new Uint8Array(8);
  const view = new DataView(header.buffer);

  writeAscii(header, 0, 'icns');
  view.setUint32(4, totalLength, false);

  return new Blob([toArrayBuffer(header), ...chunks.map(toArrayBuffer)], {
    type: iconOutputConfigs.icns.mimeType,
  });
}

async function createIconArchiveBlob(
  source: LoadedIconImage,
  entries: IconEntry[],
  format: IconOutputFormat
): Promise<Blob> {
  const base = source.filename.replace(/\.[^.]+$/, '') || 'icon';

  if (format === 'ico') {
    return createZipArchive(
      entries.map((entry) => ({
        filename: `${base}-${entry.size}x${entry.size}.ico`,
        blob: createIcoBlob([entry]),
      }))
    );
  }

  if (format === 'icns') {
    return createZipArchive(
      entries.map((entry) => ({
        filename: `${base}-${entry.size}x${entry.size}.icns`,
        blob: createIcnsBlob([entry]),
      }))
    );
  }

  return createZipArchive(
    entries.map((entry) => ({
      filename: `${base}-${entry.size}x${entry.size}.png`,
      blob: entry.blob,
    }))
  );
}

export async function createIconPackage(
  source: LoadedIconImage,
  format: IconOutputFormat,
  transform: IconRenderTransform
): Promise<IconPackageOutcome> {
  const startedAt = performance.now();
  const config = getIconOutputConfig(format);

  try {
    const entries: IconEntry[] = [];

    for (const size of config.sizes) {
      entries.push(await renderIconEntry(source, size, transform));
    }

    const zipBlob = await createIconArchiveBlob(source, entries, format);
    const blob = format === 'ico' ? createIcoBlob(entries) : format === 'icns' ? createIcnsBlob(entries) : zipBlob;

    return {
      ok: true,
      blob,
      filename: createIconOutputFilename(source.filename, format),
      mimeType: config.mimeType,
      format,
      sizes: config.sizes,
      outputSize: blob.size,
      zipBlob: format === 'png-zip' ? undefined : zipBlob,
      zipFilename: format === 'png-zip' ? undefined : createIconZipFilename(source.filename),
      zipOutputSize: format === 'png-zip' ? undefined : zipBlob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      code: error instanceof Error && error.message.includes('context') ? 'canvas_context' : 'canvas_export',
      detail: error instanceof Error ? error.message : undefined,
    };
  }
}
