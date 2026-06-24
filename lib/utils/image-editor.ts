import {
  createEditedImageFilename,
  formatFileSize,
  formatPixelLimit,
  getImageTargetConfig,
  inferImageMimeType,
  isSupportedImageInput,
  MAX_IMAGE_FILE_SIZE,
  MAX_IMAGE_PIXELS,
  normalizeImageQuality,
  type ImageConversionError,
  type ImageTargetFormat,
} from './image';

export interface Point {
  x: number;
  y: number;
}

export interface EditorImageSource {
  element: HTMLImageElement;
  width: number;
  height: number;
}

export interface ExportEditedImageOptions {
  baseCanvas: HTMLCanvasElement;
  drawingCanvas: HTMLCanvasElement;
  sourceFilename: string;
  originalSize: number;
  targetFormat: ImageTargetFormat;
  quality?: number;
  jpegBackground?: string;
}

export interface ExportEditedImageDataUrlOptions {
  dataUrl: string;
  sourceFilename: string;
  originalSize: number;
  targetFormat: ImageTargetFormat;
  width: number;
  height: number;
}

export type ExportEditedImageOutcome =
  | {
      ok: true;
      blob: Blob;
      filename: string;
      mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
      format: ImageTargetFormat;
      width: number;
      height: number;
      originalSize: number;
      outputSize: number;
      durationMs: number;
    }
  | ImageConversionError;

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const [meta, payload] = dataUrl.split(',');
  const mimeType = meta.match(/^data:([^;]+);base64$/)?.[1];
  if (!mimeType || !payload) return null;

  try {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mimeType });
  } catch {
    return null;
  }
}

export function createImageSourceFromUrl(url: string): Promise<EditorImageSource> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if (!width || !height) {
        reject(new Error('Image has no dimensions.'));
        return;
      }
      resolve({ element: image, width, height });
    };
    image.onerror = () => reject(new Error('Image could not be loaded.'));
    image.src = url;
  });
}

export function validateEditorImageFile(file: File): ImageConversionError | null {
  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (!isSupportedImageInput(file)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: inferImageMimeType(file) || file.name.split('.').pop() || 'unknown',
    };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }
  return null;
}

export function validateEditorImageDimensions(width: number, height: number): ImageConversionError | null {
  if (width * height > MAX_IMAGE_PIXELS) {
    return {
      ok: false,
      code: 'too_many_pixels',
      maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
    };
  }
  return null;
}

export function resizeCanvasToImage(canvas: HTMLCanvasElement, width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
}

export function drawImageToCanvas(canvas: HTMLCanvasElement, source: EditorImageSource): boolean {
  resizeCanvasToImage(canvas, source.width, source.height);
  const context = canvas.getContext('2d');
  if (!context) return false;
  context.clearRect(0, 0, source.width, source.height);
  context.drawImage(source.element, 0, 0, source.width, source.height);
  return true;
}

export function createNormalizedRect(start: Point, end: Point, width: number, height: number) {
  const left = Math.max(0, Math.min(start.x, end.x, width));
  const top = Math.max(0, Math.min(start.y, end.y, height));
  const right = Math.max(0, Math.min(Math.max(start.x, end.x), width));
  const bottom = Math.max(0, Math.min(Math.max(start.y, end.y), height));

  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.max(1, Math.round(right - left)),
    height: Math.max(1, Math.round(bottom - top)),
  };
}

export function applyMosaic(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number },
  blockSize: number
): boolean {
  const context = canvas.getContext('2d');
  if (!context) return false;

  const size = Math.max(4, Math.round(blockSize));
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const width = Math.min(rect.width, canvas.width - x);
  const height = Math.min(rect.height, canvas.height - y);
  if (width <= 0 || height <= 0) return true;

  const imageData = context.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let blockY = 0; blockY < height; blockY += size) {
    for (let blockX = 0; blockX < width; blockX += size) {
      const sampleX = Math.min(width - 1, blockX + Math.floor(size / 2));
      const sampleY = Math.min(height - 1, blockY + Math.floor(size / 2));
      const sampleIndex = (sampleY * width + sampleX) * 4;
      const red = data[sampleIndex];
      const green = data[sampleIndex + 1];
      const blue = data[sampleIndex + 2];
      const alpha = data[sampleIndex + 3];

      for (let pixelY = blockY; pixelY < Math.min(blockY + size, height); pixelY += 1) {
        for (let pixelX = blockX; pixelX < Math.min(blockX + size, width); pixelX += 1) {
          const index = (pixelY * width + pixelX) * 4;
          data[index] = red;
          data[index + 1] = green;
          data[index + 2] = blue;
          data[index + 3] = alpha;
        }
      }
    }
  }

  context.putImageData(imageData, x, y);
  return true;
}

export function applyBlur(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number },
  radius: number
): boolean {
  const context = canvas.getContext('2d');
  if (!context) return false;

  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const width = Math.min(rect.width, canvas.width - x);
  const height = Math.min(rect.height, canvas.height - y);
  if (width <= 0 || height <= 0) return true;

  const patch = document.createElement('canvas');
  patch.width = width;
  patch.height = height;
  const patchContext = patch.getContext('2d');
  if (!patchContext) return false;

  patchContext.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  context.save();
  context.filter = `blur(${Math.max(2, Math.round(radius))}px)`;
  context.drawImage(patch, x, y);
  context.restore();
  return true;
}

export function snapshotCanvases(baseCanvas: HTMLCanvasElement, drawingCanvas: HTMLCanvasElement): string | null {
  try {
    return JSON.stringify({
      base: baseCanvas.toDataURL('image/png'),
      drawing: drawingCanvas.toDataURL('image/png'),
    });
  } catch {
    return null;
  }
}

export async function restoreCanvasSnapshot(
  snapshot: string,
  baseCanvas: HTMLCanvasElement,
  drawingCanvas: HTMLCanvasElement
): Promise<boolean> {
  try {
    const parsed = JSON.parse(snapshot) as { base: string; drawing: string };
    const [base, drawing] = await Promise.all([
      createImageSourceFromUrl(parsed.base),
      createImageSourceFromUrl(parsed.drawing),
    ]);
    drawImageToCanvas(baseCanvas, base);
    drawImageToCanvas(drawingCanvas, drawing);
    return true;
  } catch {
    return false;
  }
}

export async function exportEditedImage({
  baseCanvas,
  drawingCanvas,
  sourceFilename,
  originalSize,
  targetFormat,
  quality,
  jpegBackground = '#ffffff',
}: ExportEditedImageOptions): Promise<ExportEditedImageOutcome> {
  if (!baseCanvas.width || !baseCanvas.height) return { ok: false, code: 'load_failed' };
  if (baseCanvas.width * baseCanvas.height > MAX_IMAGE_PIXELS) {
    return {
      ok: false,
      code: 'too_many_pixels',
      maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
    };
  }

  const startedAt = now();
  const target = getImageTargetConfig(targetFormat);
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = baseCanvas.width;
  outputCanvas.height = baseCanvas.height;

  const context = outputCanvas.getContext('2d');
  if (!context) return { ok: false, code: 'canvas_context' };

  if (target.mimeType === 'image/jpeg') {
    context.fillStyle = jpegBackground;
    context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  }
  context.drawImage(baseCanvas, 0, 0);
  context.drawImage(drawingCanvas, 0, 0);

  const blob = await canvasToBlob(
    outputCanvas,
    target.mimeType,
    target.supportsQuality ? normalizeImageQuality(quality ?? target.defaultQuality) : undefined
  );

  if (!blob) return { ok: false, code: 'canvas_export' };

  return {
    ok: true,
    blob,
    filename: createEditedImageFilename(sourceFilename, target.extension),
    mimeType: target.mimeType,
    format: target.format,
    width: outputCanvas.width,
    height: outputCanvas.height,
    originalSize,
    outputSize: blob.size,
    durationMs: Math.round(now() - startedAt),
  };
}

export function exportEditedImageDataUrl({
  dataUrl,
  sourceFilename,
  originalSize,
  targetFormat,
  width,
  height,
}: ExportEditedImageDataUrlOptions): ExportEditedImageOutcome {
  if (!width || !height) return { ok: false, code: 'load_failed' };
  if (width * height > MAX_IMAGE_PIXELS) {
    return {
      ok: false,
      code: 'too_many_pixels',
      maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
    };
  }

  const startedAt = now();
  const target = getImageTargetConfig(targetFormat);
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) return { ok: false, code: 'canvas_export' };

  return {
    ok: true,
    blob,
    filename: createEditedImageFilename(sourceFilename, target.extension),
    mimeType: target.mimeType,
    format: target.format,
    width,
    height,
    originalSize,
    outputSize: blob.size,
    durationMs: Math.round(now() - startedAt),
  };
}
