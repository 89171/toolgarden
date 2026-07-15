import { createFont, type TTF } from 'fonteditor-core';
import { deflateSync, inflateSync } from 'fflate';

export type FontSubsetFormat = 'ttf' | 'woff';

export interface FontSubsetOptions {
  outputFormat: FontSubsetFormat;
  characters: string;
  keepHinting?: boolean;
  keepKerning?: boolean;
}

export interface FontSubsetSuccess {
  ok: true;
  output: ArrayBuffer;
  outputFormat: FontSubsetFormat;
  filename: string;
  inputSize: number;
  outputSize: number;
  requestedCount: number;
  includedCount: number;
  glyphCount: number;
  missingCharacters: string[];
  includedCharacters: string[];
  savedBytes: number;
  savedRatio: number;
}

export type FontSubsetErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'empty_chars'
  | 'parse_failed'
  | 'no_glyphs'
  | 'render_failed';

export interface FontSubsetFailure {
  ok: false;
  code: FontSubsetErrorCode;
  maxSize?: string;
  detail?: string;
}

export type FontSubsetOutcome = FontSubsetSuccess | FontSubsetFailure;

const MAX_FONT_FILE_SIZE = 64 * 1024 * 1024;
const CONTROL_CODE_POINT_RANGES = [
  [0x0000, 0x001f],
  [0x007f, 0x009f],
] as const;

const supportedFontInputs: Array<{
  format: FontSubsetFormat;
  extensions: string[];
  mimes: string[];
  label: string;
}> = [
  {
    format: 'ttf',
    extensions: ['ttf'],
    mimes: ['font/ttf', 'application/x-font-ttf', 'application/font-sfnt'],
    label: 'TTF',
  },
  {
    format: 'woff',
    extensions: ['woff'],
    mimes: ['font/woff', 'application/font-woff', 'application/x-font-woff'],
    label: 'WOFF',
  },
];

export function getFontSubsetAcceptValue(): string {
  const extensions = supportedFontInputs.flatMap((format) =>
    format.extensions.map((extension) => `.${extension}`)
  );
  const mimes = supportedFontInputs.flatMap((format) => format.mimes);

  return [...mimes, ...extensions].join(',');
}

export function getSupportedFontInputLabel(): string {
  return supportedFontInputs.map((format) => format.label).join(' / ');
}

export function getMaxFontFileSizeLabel(): string {
  return formatFontFileSize(MAX_FONT_FILE_SIZE);
}

export function formatFontFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function inferFontSubsetInputFormat(file: File): FontSubsetFormat | null {
  const normalizedType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);

  for (const input of supportedFontInputs) {
    if (input.mimes.includes(normalizedType) || input.extensions.includes(extension)) {
      return input.format;
    }
  }

  return null;
}

export function createFontSubsetFilename(filename: string, outputFormat: FontSubsetFormat): string {
  const baseName = filename.replace(/\.[^.]+$/u, '').trim() || 'font';
  return `${baseName}.subset.${outputFormat}`;
}

export function getUniqueSubsetCharacters(text: string): string[] {
  const seen = new Set<number>();
  const characters: string[] = [];

  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined || isIgnoredControlCodePoint(codePoint)) continue;

    if (!seen.has(codePoint)) {
      seen.add(codePoint);
      characters.push(character);
    }
  }

  return characters;
}

export function getUniqueSubsetCodePoints(text: string): number[] {
  return getUniqueSubsetCharacters(text).map((character) => character.codePointAt(0) as number);
}

export function formatFontCodePointLabel(character: string): string {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) return '';

  const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');

  if (character === ' ') return `SPACE (U+${hex})`;
  if (/\s/u.test(character)) return `U+${hex}`;

  return `${character} (U+${hex})`;
}

export async function subsetFontFile(file: File, options: FontSubsetOptions): Promise<FontSubsetOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (file.size > MAX_FONT_FILE_SIZE) {
    return { ok: false, code: 'file_too_large', maxSize: getMaxFontFileSizeLabel() };
  }

  const inputFormat = inferFontSubsetInputFormat(file);
  if (!inputFormat) {
    return { ok: false, code: 'unsupported_input', detail: getFileExtension(file.name).toUpperCase() || file.type };
  }

  const codePoints = getUniqueSubsetCodePoints(options.characters);
  if (codePoints.length === 0) return { ok: false, code: 'empty_chars' };

  let inputBuffer: ArrayBuffer;
  try {
    inputBuffer = await file.arrayBuffer();
  } catch {
    return { ok: false, code: 'parse_failed' };
  }

  try {
    const font = createFont(inputBuffer, {
      type: inputFormat,
      subset: codePoints,
      hinting: Boolean(options.keepHinting),
      kerning: Boolean(options.keepKerning),
      inflate: inflateWoffData,
    });
    const fontObject = font.get();
    const includedCodePoints = getIncludedCodePoints(fontObject.glyf);

    if (includedCodePoints.size === 0) return { ok: false, code: 'no_glyphs' };

    const outputBuffer = toArrayBuffer(
      font.write({
        type: options.outputFormat,
        hinting: Boolean(options.keepHinting),
        kerning: Boolean(options.keepKerning),
        deflate: deflateWoffData,
      })
    );
    const includedCharacters = getCharactersFromCodePoints(codePoints.filter((codePoint) => includedCodePoints.has(codePoint)));
    const missingCharacters = getCharactersFromCodePoints(codePoints.filter((codePoint) => !includedCodePoints.has(codePoint)));
    const savedBytes = file.size - outputBuffer.byteLength;

    return {
      ok: true,
      output: outputBuffer,
      outputFormat: options.outputFormat,
      filename: createFontSubsetFilename(file.name, options.outputFormat),
      inputSize: file.size,
      outputSize: outputBuffer.byteLength,
      requestedCount: codePoints.length,
      includedCount: includedCharacters.length,
      glyphCount: fontObject.glyf.length,
      missingCharacters,
      includedCharacters,
      savedBytes,
      savedRatio: file.size > 0 ? savedBytes / file.size : 0,
    };
  } catch {
    return { ok: false, code: 'render_failed' };
  }
}

function getFileExtension(filename: string): string {
  return filename.toLowerCase().match(/\.([a-z0-9]+)$/u)?.[1] ?? '';
}

function isIgnoredControlCodePoint(codePoint: number): boolean {
  return CONTROL_CODE_POINT_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function getIncludedCodePoints(glyphs: TTF.Glyph[]): Set<number> {
  const codePoints = new Set<number>();

  for (const glyph of glyphs) {
    for (const codePoint of glyph.unicode ?? []) {
      codePoints.add(codePoint);
    }
  }

  return codePoints;
}

function getCharactersFromCodePoints(codePoints: number[]): string[] {
  return codePoints.map((codePoint) => String.fromCodePoint(codePoint));
}

function inflateWoffData(data: number[]): number[] {
  return Array.from(inflateSync(new Uint8Array(data)));
}

function deflateWoffData(data: number[]): number[] {
  return Array.from(deflateSync(new Uint8Array(data)));
}

function toArrayBuffer(output: ArrayBuffer | ArrayBufferView | string): ArrayBuffer {
  if (output instanceof ArrayBuffer) return output;

  if (ArrayBuffer.isView(output)) {
    const buffer = new ArrayBuffer(output.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(output.buffer, output.byteOffset, output.byteLength));
    return buffer;
  }

  const encoded = new TextEncoder().encode(output);
  const buffer = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(buffer).set(encoded);
  return buffer;
}
