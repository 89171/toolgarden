export interface ZipEntryInput {
  filename: string;
  blob: Blob;
}

const ZIP_STORE_METHOD = 0;
const UINT32_MAX = 0xffffffff;

let crcTable: Uint32Array | null = null;

function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }

  crcTable = table;
  return table;
}

function crc32(data: Uint8Array): number {
  const table = getCrcTable();
  let crc = UINT32_MAX;

  for (const byte of data) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ UINT32_MAX) >>> 0;
}

function encodeText(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  return { dosDate, dosTime };
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function createLocalHeader({
  crc,
  dosDate,
  dosTime,
  filenameBytes,
  size,
}: {
  crc: number;
  dosDate: number;
  dosTime: number;
  filenameBytes: Uint8Array;
  size: number;
}) {
  const buffer = new ArrayBuffer(30);
  const view = new DataView(buffer);

  writeUint32(view, 0, 0x04034b50);
  writeUint16(view, 4, 20);
  writeUint16(view, 6, 0x0800);
  writeUint16(view, 8, ZIP_STORE_METHOD);
  writeUint16(view, 10, dosTime);
  writeUint16(view, 12, dosDate);
  writeUint32(view, 14, crc);
  writeUint32(view, 18, size);
  writeUint32(view, 22, size);
  writeUint16(view, 26, filenameBytes.length);
  writeUint16(view, 28, 0);

  return new Uint8Array(buffer);
}

function createCentralHeader({
  crc,
  dosDate,
  dosTime,
  filenameBytes,
  localHeaderOffset,
  size,
}: {
  crc: number;
  dosDate: number;
  dosTime: number;
  filenameBytes: Uint8Array;
  localHeaderOffset: number;
  size: number;
}) {
  const buffer = new ArrayBuffer(46);
  const view = new DataView(buffer);

  writeUint32(view, 0, 0x02014b50);
  writeUint16(view, 4, 20);
  writeUint16(view, 6, 20);
  writeUint16(view, 8, 0x0800);
  writeUint16(view, 10, ZIP_STORE_METHOD);
  writeUint16(view, 12, dosTime);
  writeUint16(view, 14, dosDate);
  writeUint32(view, 16, crc);
  writeUint32(view, 20, size);
  writeUint32(view, 24, size);
  writeUint16(view, 28, filenameBytes.length);
  writeUint16(view, 30, 0);
  writeUint16(view, 32, 0);
  writeUint16(view, 34, 0);
  writeUint16(view, 36, 0);
  writeUint32(view, 38, 0);
  writeUint32(view, 42, localHeaderOffset);

  return new Uint8Array(buffer);
}

function createEndRecord({
  centralDirectoryOffset,
  centralDirectorySize,
  entryCount,
}: {
  centralDirectoryOffset: number;
  centralDirectorySize: number;
  entryCount: number;
}) {
  const buffer = new ArrayBuffer(22);
  const view = new DataView(buffer);

  writeUint32(view, 0, 0x06054b50);
  writeUint16(view, 4, 0);
  writeUint16(view, 6, 0);
  writeUint16(view, 8, entryCount);
  writeUint16(view, 10, entryCount);
  writeUint32(view, 12, centralDirectorySize);
  writeUint32(view, 16, centralDirectoryOffset);
  writeUint16(view, 20, 0);

  return new Uint8Array(buffer);
}

function assertZipLimit(value: number, message: string) {
  if (value > UINT32_MAX) throw new Error(message);
}

function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function createZipArchive(entries: ZipEntryInput[]): Promise<Blob> {
  if (entries.length === 0) return new Blob([], { type: 'application/zip' });
  if (entries.length > 0xffff) throw new Error('Too many files for a standard ZIP archive.');

  const parts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const filenameBytes = encodeText(entry.filename);
    const size = data.byteLength;
    const crc = crc32(data);
    const { dosDate, dosTime } = getDosDateTime();

    assertZipLimit(size, 'A file is too large for a standard ZIP archive.');
    assertZipLimit(offset, 'The archive is too large for a standard ZIP archive.');

    const localHeader = createLocalHeader({ crc, dosDate, dosTime, filenameBytes, size });
    const centralHeader = createCentralHeader({
      crc,
      dosDate,
      dosTime,
      filenameBytes,
      localHeaderOffset: offset,
      size,
    });

    parts.push(localHeader, filenameBytes, data);
    centralParts.push(centralHeader, filenameBytes);
    offset += localHeader.byteLength + filenameBytes.byteLength + data.byteLength;
  }

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralParts.reduce((total, part) => total + part.byteLength, 0);

  assertZipLimit(centralDirectoryOffset, 'The archive is too large for a standard ZIP archive.');
  assertZipLimit(centralDirectoryOffset + centralDirectorySize, 'The archive is too large for a standard ZIP archive.');

  const endRecord = createEndRecord({
    centralDirectoryOffset,
    centralDirectorySize,
    entryCount: entries.length,
  });

  const blobParts = [...parts, ...centralParts, endRecord].map(toBlobPart);
  return new Blob(blobParts, { type: 'application/zip' });
}
