import {
  formatFileSize,
  inferImageMimeType,
  isSupportedImageInput,
  MAX_IMAGE_FILE_SIZE,
} from './image';

export type ImageBase64ErrorCode =
  | 'empty_file'
  | 'empty_input'
  | 'unsupported_input'
  | 'file_too_large'
  | 'read_failed'
  | 'invalid_base64';

export interface ImageBase64Error {
  ok: false;
  code: ImageBase64ErrorCode;
  detail?: string;
  maxSize?: string;
}

export interface ImageToBase64Success {
  ok: true;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  dataUrl: string;
  base64: string;
  durationMs: number;
}

export interface Base64ToImageSuccess {
  ok: true;
  filename: string;
  mimeType: string;
  extension: string;
  blob: Blob;
  size: number;
  width?: number;
  height?: number;
  dataUrl: string;
  base64: string;
  durationMs: number;
}

export type ImageToBase64Outcome = ImageToBase64Success | ImageBase64Error;
export type Base64ToImageOutcome = Base64ToImageSuccess | ImageBase64Error;

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/avif',
]);

const MIME_TO_EXTENSION = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/bmp', 'bmp'],
  ['image/svg+xml', 'svg'],
  ['image/avif', 'avif'],
]);

function normalizeImageMimeType(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (normalized === 'image/jpg') return 'image/jpeg';
  return normalized;
}

function getExtensionForMimeType(mimeType: string): string {
  return MIME_TO_EXTENSION.get(normalizeImageMimeType(mimeType)) ?? 'png';
}

function stripDataUrlPrefix(value: string): { base64: string; mimeType?: string } | null {
  const trimmed = value.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;,]+)(?:;[^,]*)?;base64,([\s\S]*)$/i);

  if (!dataUrlMatch) {
    return {
      base64: trimmed,
    };
  }

  return {
    mimeType: normalizeImageMimeType(dataUrlMatch[1]),
    base64: dataUrlMatch[2],
  };
}

function normalizeBase64(value: string): string {
  const compact = value.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const remainder = compact.length % 4;

  if (remainder === 0) return compact;
  if (remainder === 2) return `${compact}==`;
  if (remainder === 3) return `${compact}=`;

  return compact;
}

function getBase64ByteLength(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function decodeBase64ToBytes(base64: string): Uint8Array | null {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch {
    return null;
  }
}

function startsWithAscii(bytes: Uint8Array, value: string, offset = 0): boolean {
  if (bytes.length < offset + value.length) return false;

  for (let index = 0; index < value.length; index += 1) {
    if (bytes[offset + index] !== value.charCodeAt(index)) return false;
  }

  return true;
}

function inferMimeTypeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 4 && bytes[0] === 0x89 && startsWithAscii(bytes, 'PNG', 1)) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (startsWithAscii(bytes, 'GIF8')) return 'image/gif';
  if (startsWithAscii(bytes, 'BM')) return 'image/bmp';
  if (bytes.length >= 12 && startsWithAscii(bytes, 'RIFF') && startsWithAscii(bytes, 'WEBP', 8)) {
    return 'image/webp';
  }
  if (bytes.length >= 16 && startsWithAscii(bytes, 'ftyp', 4)) {
    const brand = new TextDecoder().decode(bytes.slice(8, Math.min(bytes.length, 32)));
    if (/avif|avis/i.test(brand)) return 'image/avif';
  }

  const textSample = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 512))).trimStart();
  if (/^(?:<\?xml[\s\S]*?)?<svg[\s>]/i.test(textSample)) return 'image/svg+xml';

  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unexpected file result'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    image.decoding = 'async';
    image.src = url;
  });
}

export async function imageFileToBase64(file: File): Promise<ImageToBase64Outcome> {
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
      detail: inferImageMimeType(file) || file.type || 'unknown',
    };
  }

  const startedAt = performance.now();

  try {
    const inferredMimeType = inferImageMimeType(file);
    const fileDataUrl = await readFileAsDataUrl(file);
    const commaIndex = fileDataUrl.indexOf(',');
    const base64 = commaIndex >= 0 ? fileDataUrl.slice(commaIndex + 1) : fileDataUrl;
    const dataUrl = `data:${inferredMimeType};base64,${base64}`;
    const dimensions = await getImageDimensions(file);

    return {
      ok: true,
      filename: file.name,
      mimeType: inferredMimeType,
      size: file.size,
      width: dimensions?.width,
      height: dimensions?.height,
      dataUrl,
      base64,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'read_failed' };
  }
}

export async function base64ToImage(input: string): Promise<Base64ToImageOutcome> {
  if (!input.trim()) return { ok: false, code: 'empty_input' };

  const startedAt = performance.now();
  const parsed = stripDataUrlPrefix(input);
  if (!parsed) return { ok: false, code: 'invalid_base64' };

  const base64 = normalizeBase64(parsed.base64);
  if (!base64 || /[^a-z0-9+/=]/i.test(base64)) return { ok: false, code: 'invalid_base64' };

  const byteLength = getBase64ByteLength(base64);
  if (byteLength <= 0) return { ok: false, code: 'invalid_base64' };

  if (byteLength > MAX_IMAGE_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_IMAGE_FILE_SIZE),
    };
  }

  const bytes = decodeBase64ToBytes(base64);
  if (!bytes) return { ok: false, code: 'invalid_base64' };

  const inferredMimeType = inferMimeTypeFromBytes(bytes);
  const mimeType = normalizeImageMimeType(parsed.mimeType ?? inferredMimeType ?? '');
  if (!mimeType || !SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
    return {
      ok: false,
      code: 'unsupported_input',
      detail: parsed.mimeType ?? inferredMimeType ?? 'unknown',
    };
  }

  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const dimensions = await getImageDimensions(blob);
  const extension = getExtensionForMimeType(mimeType);

  return {
    ok: true,
    filename: `base64-image.${extension}`,
    mimeType,
    extension,
    blob,
    size: blob.size,
    width: dimensions?.width,
    height: dimensions?.height,
    dataUrl: `data:${mimeType};base64,${base64}`,
    base64,
    durationMs: Math.round(performance.now() - startedAt),
  };
}
