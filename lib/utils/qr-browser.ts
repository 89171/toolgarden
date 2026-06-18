import { toDataURL, type QRCodeErrorCorrectionLevel } from 'qrcode';
import jsQR from 'jsqr';
import {
  createQrCodeFilename,
  getUtf8ByteLength,
  normalizeQrCodeOptions,
  QR_DECODE_LIMITS,
  type QrCodeDecodeOutcome,
  type QrCodeGenerateOutcome,
  type QrCodeOptions,
} from './qr';

const SUPPORTED_DECODE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];

interface LoadedImage {
  element: HTMLImageElement;
  width: number;
  height: number;
  cleanup: () => void;
}

export async function generateQrCodeDataUrl(
  text: string,
  options: QrCodeOptions = {}
): Promise<QrCodeGenerateOutcome> {
  if (!text.trim()) return { ok: false, code: 'empty_text' };

  const normalizedOptions = normalizeQrCodeOptions(options);

  try {
    const dataUrl = await toDataURL(text, {
      type: 'image/png',
      width: normalizedOptions.size,
      margin: normalizedOptions.margin,
      errorCorrectionLevel: normalizedOptions.errorCorrectionLevel as QRCodeErrorCorrectionLevel,
      color: {
        dark: '#111111ff',
        light: '#ffffffff',
      },
    });

    return {
      ok: true,
      dataUrl,
      filename: createQrCodeFilename(),
      inputBytes: getUtf8ByteLength(text),
      options: normalizedOptions,
    };
  } catch (error) {
    return {
      ok: false,
      code: 'generate_failed',
      detail: error instanceof Error ? error.message : undefined,
    };
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

function loadImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        URL.revokeObjectURL(url);
        reject(new Error('Image has no readable dimensions.'));
        return;
      }

      resolve({
        element: image,
        width,
        height,
        cleanup: () => URL.revokeObjectURL(url),
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image failed to load.'));
    };

    image.src = url;
  });
}
