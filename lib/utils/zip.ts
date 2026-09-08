import { unzipSync, zipSync, type ZipOptions } from 'fflate';

export interface ZipEntryInput {
  filename: string;
  blob: Blob;
}

export type ZipCompressionOutcome =
  | {
      ok: true;
      blob: Blob;
      filename: string;
      fileCount: number;
      originalSize: number;
      outputSize: number;
      durationMs: number;
    }
  | {
      ok: false;
      code: 'empty_selection' | 'empty_file' | 'zip_failed';
      message?: string;
    };

export interface ZipExtractedEntry {
  path: string;
  name: string;
  size: number;
  blob: Blob;
}

export type ZipExtractionOutcome =
  | {
      ok: true;
      filename: string;
      entries: ZipExtractedEntry[];
      fileCount: number;
      totalSize: number;
      durationMs: number;
    }
  | {
      ok: false;
      code: 'no_file' | 'empty_file' | 'invalid_zip' | 'empty_archive';
      message?: string;
    };

function sanitizeZipPath(value: string): string {
  const normalized = value.replace(/\\/g, '/');
  return normalized
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .join('/');
}

function createUniqueFilename(filename: string, usedNames: Set<string>, index: number): string {
  const safeName = sanitizeZipPath(filename) || `file-${index + 1}`;

  if (!usedNames.has(safeName)) {
    usedNames.add(safeName);
    return safeName;
  }

  const extensionIndex = safeName.lastIndexOf('.');
  const hasExtension = extensionIndex > 0;
  const base = hasExtension ? safeName.slice(0, extensionIndex) : safeName;
  const extension = hasExtension ? safeName.slice(extensionIndex) : '';
  let suffix = 2;
  let candidate = `${base}-${suffix}${extension}`;

  while (usedNames.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}${extension}`;
  }

  usedNames.add(candidate);
  return candidate;
}

async function createZipBytes(
  entries: ZipEntryInput[],
  options: { level?: ZipOptions['level'] } = {}
): Promise<{ bytes: Uint8Array; originalSize: number }> {
  const zipEntries: Record<string, Uint8Array> = {};
  const usedNames = new Set<string>();
  let originalSize = 0;

  for (const [index, entry] of entries.entries()) {
    const filename = createUniqueFilename(entry.filename, usedNames, index);
    const bytes = new Uint8Array(await entry.blob.arrayBuffer());
    originalSize += bytes.byteLength;
    zipEntries[filename] = bytes;
  }

  return {
    bytes: zipSync(zipEntries, { level: options.level ?? 6 }),
    originalSize,
  };
}

export async function createZipArchive(entries: ZipEntryInput[]): Promise<Blob> {
  if (entries.length === 0) return new Blob([], { type: 'application/zip' });
  const { bytes } = await createZipBytes(entries);
  return new Blob([bytes as BlobPart], { type: 'application/zip' });
}

export async function createZipCompression(
  entries: ZipEntryInput[],
  options: { outputName?: string; level?: ZipOptions['level'] } = {}
): Promise<ZipCompressionOutcome> {
  if (entries.length === 0) {
    return { ok: false, code: 'empty_selection' };
  }

  const startedAt = performance.now();

  try {
    const { bytes, originalSize } = await createZipBytes(entries, options);
    const blob = new Blob([bytes as BlobPart], { type: 'application/zip' });

    return {
      ok: true,
      blob,
      filename: options.outputName?.trim() || 'archive.zip',
      fileCount: entries.length,
      originalSize,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      code: 'zip_failed',
      message: error instanceof Error ? error.message : undefined,
    };
  }
}

function getBasename(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments.at(-1) || path;
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function decodeBytes(bytes: Uint8Array, encoding: string): string {
  try {
    return new TextDecoder(encoding).decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

function latin1StringFromBytes(bytes: Uint8Array): string {
  let output = '';
  for (const byte of bytes) output += String.fromCharCode(byte);
  return output;
}

function getZipNameOverrides(bytes: Uint8Array): Map<string, string> {
  const overrides = new Map<string, string>();
  const minEndOffset = Math.max(0, bytes.length - 0xffff - 22);
  let endOffset = -1;

  for (let offset = bytes.length - 22; offset >= minEndOffset; offset -= 1) {
    if (readUint32(bytes, offset) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }

  if (endOffset < 0) return overrides;

  const entryCount = readUint16(bytes, endOffset + 10);
  let offset = readUint32(bytes, endOffset + 16);

  for (let index = 0; index < entryCount && offset + 46 <= bytes.length; index += 1) {
    if (readUint32(bytes, offset) !== 0x02014b50) break;

    const flags = readUint16(bytes, offset + 8);
    const nameLength = readUint16(bytes, offset + 28);
    const extraLength = readUint16(bytes, offset + 30);
    const commentLength = readUint16(bytes, offset + 32);
    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;

    if (nameEnd > bytes.length) break;

    const nameBytes = bytes.subarray(nameStart, nameEnd);
    if ((flags & 0x0800) === 0) {
      const latin1Name = latin1StringFromBytes(nameBytes);
      const localizedName = decodeBytes(nameBytes, 'gb18030');
      if (localizedName && localizedName !== latin1Name) overrides.set(latin1Name, localizedName);
    }

    offset = nameEnd + extraLength + commentLength;
  }

  return overrides;
}

export async function extractZipArchive(file: Blob & { name?: string }): Promise<ZipExtractionOutcome> {
  if (!file) return { ok: false, code: 'no_file' };
  if (file.size === 0) return { ok: false, code: 'empty_file' };

  const startedAt = performance.now();

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const nameOverrides = getZipNameOverrides(bytes);
    const archive = unzipSync(bytes);
    const entries = Object.entries(archive)
      .map(([path, data]) => {
        const decodedPath = nameOverrides.get(path) ?? path;
        const safePath = sanitizeZipPath(decodedPath);
        return safePath && data.byteLength > 0
          ? {
              path: safePath,
              name: getBasename(safePath),
              size: data.byteLength,
              blob: new Blob([data as BlobPart], { type: 'application/octet-stream' }),
            }
          : null;
      })
      .filter((entry): entry is ZipExtractedEntry => entry !== null)
      .sort((left, right) => left.path.localeCompare(right.path));

    if (entries.length === 0) {
      return { ok: false, code: 'empty_archive' };
    }

    return {
      ok: true,
      filename: file.name || 'archive.zip',
      entries,
      fileCount: entries.length,
      totalSize: entries.reduce((total, entry) => total + entry.size, 0),
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      code: 'invalid_zip',
      message: error instanceof Error ? error.message : undefined,
    };
  }
}
