import { toDataURL, type QRCodeErrorCorrectionLevel } from 'qrcode';
import jsQR from 'jsqr';
import {
  createQrCodeFilename,
  getUtf8ByteLength,
  normalizeQrCodeOptions,
  QR_DECODE_LIMITS,
  QR_LOGO_LIMITS,
  type QrCodeDecodeOutcome,
  type QrCodeGenerateOutcome,
  type QrCodeLogoInfo,
  type QrFailureCode,
  type QrCodeOptions,
} from './qr';

const SUPPORTED_DECODE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];
const SUPPORTED_LOGO_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];
const LOGO_BOX_RATIO = 0.28;
const LOGO_IMAGE_RATIO = 0.22;
const LOGO_RADIUS_RATIO = 0.035;

interface LoadedImage {
  element: HTMLImageElement;
  width: number;
  height: number;
  cleanup: () => void;
}

export async function generateQrCodeDataUrl(
  text: string,
  options: QrCodeOptions = {},
  logoFile?: File | null
): Promise<QrCodeGenerateOutcome> {
  if (!text.trim()) return { ok: false, code: 'empty_text' };

  const normalizedOptions = normalizeQrCodeOptions({
    ...options,
    errorCorrectionLevel: logoFile ? 'H' : options.errorCorrectionLevel,
  });

  try {
    let dataUrl = await toDataURL(text, {
      type: 'image/png',
      width: normalizedOptions.size,
      margin: normalizedOptions.margin,
      errorCorrectionLevel: normalizedOptions.errorCorrectionLevel as QRCodeErrorCorrectionLevel,
      color: {
        dark: '#111111ff',
        light: '#ffffffff',
      },
    });
    let logo: QrCodeLogoInfo | undefined;

    if (logoFile) {
      const logoResult = await composeQrLogo(dataUrl, logoFile);
      if (!logoResult.ok) return logoResult;
      dataUrl = logoResult.dataUrl;
      logo = logoResult.logo;
    }

    return {
      ok: true,
      dataUrl,
      filename: createQrCodeFilename(),
      inputBytes: getUtf8ByteLength(text),
      options: normalizedOptions,
      logo,
    };
  } catch (error) {
    return {
      ok: false,
      code: 'generate_failed',
      detail: error instanceof Error ? error.message : undefined,
    };
  }
}

type QrLogoCompositionOutcome =
  | { ok: true; dataUrl: string; logo: QrCodeLogoInfo }
  | { ok: false; code: QrFailureCode; detail?: string };

async function composeQrLogo(qrDataUrl: string, logoFile: File): Promise<QrLogoCompositionOutcome> {
  if (logoFile.size === 0) return { ok: false, code: 'empty_file' };
  if (logoFile.size > QR_LOGO_LIMITS.maxFileBytes) return { ok: false, code: 'logo_file_too_large' };
  if (!isSupportedLogoFile(logoFile)) {
    return { ok: false, code: 'logo_unsupported_file', detail: logoFile.type || logoFile.name };
  }

  let qrImage: LoadedImage | null = null;
  let logoImage: LoadedImage | null = null;

  try {
    qrImage = await loadImageFromDataUrl(qrDataUrl);
    logoImage = await loadImage(logoFile);

    if (logoImage.width * logoImage.height > QR_LOGO_LIMITS.maxPixels) {
      return { ok: false, code: 'logo_too_many_pixels' };
    }

    const size = Math.max(qrImage.width, qrImage.height);
    const canvas = document.createElement('canvas');
    canvas.width = qrImage.width;
    canvas.height = qrImage.height;

    const context = canvas.getContext('2d');
    if (!context) return { ok: false, code: 'canvas_context' };

    context.drawImage(qrImage.element, 0, 0, qrImage.width, qrImage.height);

    const boxSize = Math.round(size * LOGO_BOX_RATIO);
    const logoSize = Math.round(size * LOGO_IMAGE_RATIO);
    const boxX = Math.round((qrImage.width - boxSize) / 2);
    const boxY = Math.round((qrImage.height - boxSize) / 2);
    const radius = Math.round(size * LOGO_RADIUS_RATIO);

    context.save();
    drawRoundedRect(context, boxX, boxY, boxSize, boxSize, radius);
    context.fillStyle = '#ffffff';
    context.fill();
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = Math.max(1, Math.round(size * 0.004));
    context.stroke();
    context.restore();

    const logoRect = containImage(logoImage.width, logoImage.height, logoSize, logoSize);
    const logoX = Math.round((qrImage.width - logoRect.width) / 2);
    const logoY = Math.round((qrImage.height - logoRect.height) / 2);
    context.drawImage(logoImage.element, logoX, logoY, logoRect.width, logoRect.height);

    return {
      ok: true,
      dataUrl: canvas.toDataURL('image/png'),
      logo: {
        filename: logoFile.name,
        fileSize: logoFile.size,
        width: logoImage.width,
        height: logoImage.height,
      },
    };
  } catch (error) {
    return {
      ok: false,
      code: 'logo_load_failed',
      detail: error instanceof Error ? error.message : undefined,
    };
  } finally {
    qrImage?.cleanup();
    logoImage?.cleanup();
  }
}

export async function decodeQrCodeFile(file: File): Promise<QrCodeDecodeOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (file.size > QR_DECODE_LIMITS.maxFileBytes) return { ok: false, code: 'file_too_large' };
  if (!isSupportedQrDecodeFile(file)) {
    return { ok: false, code: 'unsupported_file', detail: file.type || file.name };
  }

  let image: LoadedImage | null = null;

  try {
    image = await loadImage(file);
    const { width, height } = image;

    if (width * height > QR_DECODE_LIMITS.maxPixels) {
      return { ok: false, code: 'too_many_pixels' };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return { ok: false, code: 'canvas_context' };

    context.drawImage(image.element, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const qr = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' });

    if (!qr?.data) return { ok: false, code: 'decode_failed' };

    return {
      ok: true,
      decoded: {
        text: qr.data,
        version: qr.version,
        binaryBytes: qr.binaryData.length,
        width,
        height,
        filename: file.name,
        fileSize: file.size,
      },
    };
  } catch (error) {
    return {
      ok: false,
      code: 'image_load_failed',
      detail: error instanceof Error ? error.message : undefined,
    };
  } finally {
    image?.cleanup();
  }
}

function isSupportedQrDecodeFile(file: File): boolean {
  if (file.type && !file.type.startsWith('image/')) return false;
  const normalizedName = file.name.toLowerCase();

  return SUPPORTED_DECODE_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
}

function isSupportedLogoFile(file: File): boolean {
  if (file.type && !file.type.startsWith('image/')) return false;
  const normalizedName = file.name.toLowerCase();

  return SUPPORTED_LOGO_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
}

function loadImage(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);
  return loadImageFromSource(url, () => URL.revokeObjectURL(url));
}

function loadImageFromDataUrl(dataUrl: string): Promise<LoadedImage> {
  return loadImageFromSource(dataUrl, () => undefined);
}

function loadImageFromSource(src: string, cleanup: () => void): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        cleanup();
        reject(new Error('Image has no readable dimensions.'));
        return;
      }

      resolve({
        element: image,
        width,
        height,
        cleanup,
      });
    };

    image.onerror = () => {
      cleanup();
      reject(new Error('Image failed to load.'));
    };

    image.src = src;
  });
}

function containImage(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  };
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}
