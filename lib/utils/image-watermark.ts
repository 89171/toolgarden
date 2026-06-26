import {
  createImageOutputFilename,
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

export type WatermarkType = 'text' | 'image';
export type WatermarkLayout = 'single' | 'tile' | 'diagonal';

/** 九宫格预设位置；用于 single 模式。'custom' 表示已手动拖动到自由位置。 */
export type WatermarkAnchor =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'custom';

export interface TextWatermarkStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  /** 描边颜色，留空表示不描边 */
  strokeColor: string;
  strokeWidth: number;
}

export interface ImageWatermarkAsset {
  /** Image element ready to draw */
  element: HTMLImageElement;
  width: number;
  height: number;
}

export interface WatermarkOptions {
  type: WatermarkType;
  /** 文字水印参数 — type=text 时必填 */
  text?: TextWatermarkStyle;
  /** 图片水印资源 — type=image 时必填 */
  image?: ImageWatermarkAsset;
  /** 图片水印缩放（相对原图宽度的比例 0.05 ~ 1.5） */
  imageScale: number;
  opacity: number;
  rotation: number;
  layout: WatermarkLayout;
  /** single 模式生效：水印中心点在原图坐标系中的归一化位置 0~1 */
  position: { x: number; y: number };
  /** tile/diagonal 模式生效：水印之间的横向/纵向间距，相对原图宽度 */
  spacingX: number;
  spacingY: number;
}

export interface WatermarkApplyInput {
  source: ImageWatermarkAsset;
  sourceFilename: string;
  originalSize: number;
  targetFormat: ImageTargetFormat;
  quality?: number;
  options: WatermarkOptions;
  jpegBackground?: string;
}

export interface WatermarkApplySuccess {
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

export type WatermarkApplyOutcome = WatermarkApplySuccess | ImageConversionError;

const DEFAULT_JPEG_BACKGROUND = '#ffffff';

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export function createImageAssetFromUrl(url: string): Promise<ImageWatermarkAsset> {
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

export function validateWatermarkImageFile(file: File): ImageConversionError | null {
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

export function validateWatermarkImageDimensions(width: number, height: number): ImageConversionError | null {
  if (width * height > MAX_IMAGE_PIXELS) {
    return {
      ok: false,
      code: 'too_many_pixels',
      maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
    };
  }
  return null;
}

export function createWatermarkedFilename(filename: string, extension: string): string {
  return createImageOutputFilename(filename, extension);
}

export function getDefaultTextStyle(): TextWatermarkStyle {
  return {
    text: 'CONFIDENTIAL',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 48,
    color: '#ffffff',
    bold: true,
    italic: false,
    strokeColor: '#000000',
    strokeWidth: 0,
  };
}

export function getDefaultWatermarkOptions(): WatermarkOptions {
  return {
    type: 'text',
    text: getDefaultTextStyle(),
    imageScale: 0.25,
    opacity: 0.5,
    rotation: -20,
    layout: 'single',
    position: { x: 0.5, y: 0.5 },
    spacingX: 0.35,
    spacingY: 0.28,
  };
}

/** 九宫格位置 → 归一化坐标（中心点） */
export function anchorToPosition(anchor: WatermarkAnchor): { x: number; y: number } | null {
  const map: Record<Exclude<WatermarkAnchor, 'custom'>, { x: number; y: number }> = {
    'top-left':       { x: 0.08, y: 0.10 },
    'top-center':     { x: 0.50, y: 0.10 },
    'top-right':      { x: 0.92, y: 0.10 },
    'middle-left':    { x: 0.08, y: 0.50 },
    'middle-center':  { x: 0.50, y: 0.50 },
    'middle-right':   { x: 0.92, y: 0.50 },
    'bottom-left':    { x: 0.08, y: 0.90 },
    'bottom-center':  { x: 0.50, y: 0.90 },
    'bottom-right':   { x: 0.92, y: 0.90 },
  };
  if (anchor === 'custom') return null;
  return map[anchor];
}

/** 在 canvas 上绘制一次完整的水印（基于当前 options） */
export function renderWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  options: WatermarkOptions,
) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, options.opacity));

  const stamp = (cx: number, cy: number, rotationDeg: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotationDeg * Math.PI) / 180);
    drawSingleStamp(ctx, options);
    ctx.restore();
  };

  if (options.layout === 'single') {
    const cx = options.position.x * canvasWidth;
    const cy = options.position.y * canvasHeight;
    stamp(cx, cy, options.rotation);
  } else {
    const stampSize = measureStampSize(ctx, options, canvasWidth);
    const stepX = Math.max(20, stampSize.width + options.spacingX * canvasWidth);
    const stepY = Math.max(20, stampSize.height + options.spacingY * canvasHeight);

    const rotation = options.layout === 'diagonal' ? -30 : options.rotation;

    // 平铺需要超出画布范围，避免旋转后留白
    const margin = Math.max(stampSize.width, stampSize.height);
    for (let y = -margin; y <= canvasHeight + margin; y += stepY) {
      const rowOffset = options.layout === 'diagonal'
        ? (Math.floor((y + margin) / stepY) % 2) * (stepX / 2)
        : 0;
      for (let x = -margin + rowOffset; x <= canvasWidth + margin; x += stepX) {
        stamp(x, y, rotation);
      }
    }
  }

  ctx.restore();
}

function drawSingleStamp(ctx: CanvasRenderingContext2D, options: WatermarkOptions) {
  if (options.type === 'text' && options.text) {
    drawTextStamp(ctx, options.text);
  } else if (options.type === 'image' && options.image) {
    drawImageStamp(ctx, options.image, options.imageScale);
  }
}

function drawTextStamp(ctx: CanvasRenderingContext2D, style: TextWatermarkStyle) {
  const text = style.text || '';
  if (!text) return;

  const weight = style.bold ? 'bold' : 'normal';
  const italic = style.italic ? 'italic' : 'normal';
  ctx.font = `${italic} ${weight} ${style.fontSize}px ${style.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (style.strokeWidth > 0 && style.strokeColor) {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, 0, 0);
  }
  ctx.fillStyle = style.color;
  ctx.fillText(text, 0, 0);
}

function drawImageStamp(ctx: CanvasRenderingContext2D, asset: ImageWatermarkAsset, scale: number) {
  const canvasWidth = ctx.canvas.width;
  const targetWidth = Math.max(1, canvasWidth * scale);
  const aspect = asset.width / Math.max(1, asset.height);
  const targetHeight = Math.max(1, targetWidth / aspect);
  ctx.drawImage(asset.element, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
}

/** 估算水印单个戳的尺寸（用于平铺时计算步长） */
function measureStampSize(
  ctx: CanvasRenderingContext2D,
  options: WatermarkOptions,
  canvasWidth: number,
): { width: number; height: number } {
  if (options.type === 'text' && options.text) {
    const style = options.text;
    const weight = style.bold ? 'bold' : 'normal';
    const italic = style.italic ? 'italic' : 'normal';
    ctx.save();
    ctx.font = `${italic} ${weight} ${style.fontSize}px ${style.fontFamily}`;
    const metrics = ctx.measureText(style.text || ' ');
    ctx.restore();
    return {
      width: metrics.width || 1,
      height: style.fontSize * 1.2,
    };
  }
  if (options.type === 'image' && options.image) {
    const width = canvasWidth * options.imageScale;
    const aspect = options.image.width / Math.max(1, options.image.height);
    return { width, height: width / aspect };
  }
  return { width: 1, height: 1 };
}

export async function applyWatermark({
  source,
  sourceFilename,
  originalSize,
  targetFormat,
  quality,
  options,
  jpegBackground = DEFAULT_JPEG_BACKGROUND,
}: WatermarkApplyInput): Promise<WatermarkApplyOutcome> {
  if (!source.width || !source.height) return { ok: false, code: 'load_failed' };
  if (source.width * source.height > MAX_IMAGE_PIXELS) {
    return {
      ok: false,
      code: 'too_many_pixels',
      maxPixels: formatPixelLimit(MAX_IMAGE_PIXELS),
    };
  }

  const startedAt = now();
  const target = getImageTargetConfig(targetFormat);
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return { ok: false, code: 'canvas_context' };

  if (target.mimeType === 'image/jpeg') {
    ctx.fillStyle = jpegBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(source.element, 0, 0, canvas.width, canvas.height);
  renderWatermark(ctx, canvas.width, canvas.height, options);

  const blob = await canvasToBlob(
    canvas,
    target.mimeType,
    target.supportsQuality ? normalizeImageQuality(quality ?? target.defaultQuality) : undefined,
  );

  if (!blob) return { ok: false, code: 'canvas_export' };

  return {
    ok: true,
    blob,
    filename: createWatermarkedFilename(sourceFilename, target.extension),
    mimeType: target.mimeType,
    format: target.format,
    width: canvas.width,
    height: canvas.height,
    originalSize,
    outputSize: blob.size,
    durationMs: Math.round(now() - startedAt),
  };
}

/** 仅用于消除 ESLint 警告：将导出包装函数以便未来扩展 */
export function getWatermarkOutputFilename(filename: string, extension: string): string {
  return createImageOutputFilename(filename, extension);
}
