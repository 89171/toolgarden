export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QrFailureCode =
  | 'canvas_context'
  | 'decode_failed'
  | 'empty_file'
  | 'empty_text'
  | 'file_too_large'
  | 'generate_failed'
  | 'image_load_failed'
  | 'logo_file_too_large'
  | 'logo_load_failed'
  | 'logo_too_many_pixels'
  | 'logo_unsupported_file'
  | 'too_many_pixels'
  | 'unsupported_file';

export interface QrCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: QrErrorCorrectionLevel;
}

export interface NormalizedQrCodeOptions {
  size: number;
  margin: number;
  errorCorrectionLevel: QrErrorCorrectionLevel;
}

export type QrCodeGenerateOutcome =
  | {
      ok: true;
      dataUrl: string;
      filename: string;
      inputBytes: number;
      options: NormalizedQrCodeOptions;
      logo?: QrCodeLogoInfo;
    }
  | { ok: false; code: QrFailureCode; detail?: string };

export interface QrCodeLogoInfo {
  filename: string;
  fileSize: number;
  width: number;
  height: number;
}

export interface DecodedQrCode {
  text: string;
  version: number;
  binaryBytes: number;
  width: number;
  height: number;
  filename: string;
  fileSize: number;
  sourceLabel?: string;
}

export type QrCodeDecodeOutcome =
  | { ok: true; decoded: DecodedQrCode }
  | { ok: false; code: QrFailureCode; detail?: string };

export const QR_CODE_SIZE = {
  default: 320,
  min: 160,
  max: 1024,
};

export const QR_CODE_MARGIN = {
  default: 2,
  min: 0,
  max: 8,
};

export const QR_DECODE_LIMITS = {
  maxFileBytes: 12 * 1024 * 1024,
  maxPixels: 24_000_000,
};

export const QR_LOGO_LIMITS = {
  maxFileBytes: 4 * 1024 * 1024,
  maxPixels: 4_000_000,
};

export const QR_ERROR_CORRECTION_LEVELS: QrErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

export function normalizeQrCodeOptions(options: QrCodeOptions = {}): NormalizedQrCodeOptions {
  return {
    size: clampInteger(options.size, QR_CODE_SIZE.min, QR_CODE_SIZE.max, QR_CODE_SIZE.default),
    margin: clampInteger(options.margin, QR_CODE_MARGIN.min, QR_CODE_MARGIN.max, QR_CODE_MARGIN.default),
    errorCorrectionLevel: normalizeErrorCorrectionLevel(options.errorCorrectionLevel),
  };
}

export function createQrCodeFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 19).replace(/[-:T]/g, '');
  return `qr-code-${stamp}.png`;
}

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function formatQrFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** exponent;
  return `${size >= 10 || exponent === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[exponent]}`;
}

export function formatQrPixelLimit(pixels: number): string {
  if (pixels >= 1_000_000) return `${Math.floor(pixels / 1_000_000)}MP`;
  if (pixels >= 1_000) return `${Math.floor(pixels / 1_000)}K`;
  return String(pixels);
}

function normalizeErrorCorrectionLevel(level: QrErrorCorrectionLevel | undefined): QrErrorCorrectionLevel {
  return level && QR_ERROR_CORRECTION_LEVELS.includes(level) ? level : 'M';
}

function clampInteger(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const integer = Math.round(Number(value));
  return Math.min(max, Math.max(min, integer));
}
