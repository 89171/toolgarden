import { describe, expect, it } from 'vitest';
import { createZipCompression, extractZipArchive } from '../lib/utils/zip';

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function createStoredZipWithRawName(filenameBytes: Uint8Array, data: Uint8Array): Blob {
  const localHeader = new Uint8Array(30);
  const localView = new DataView(localHeader.buffer);
  writeUint32(localView, 0, 0x04034b50);
  writeUint16(localView, 4, 20);
  writeUint16(localView, 8, 0);
  writeUint32(localView, 18, data.byteLength);
  writeUint32(localView, 22, data.byteLength);
  writeUint16(localView, 26, filenameBytes.byteLength);

  const centralHeader = new Uint8Array(46);
  const centralView = new DataView(centralHeader.buffer);
  writeUint32(centralView, 0, 0x02014b50);
  writeUint16(centralView, 4, 20);
  writeUint16(centralView, 6, 20);
  writeUint16(centralView, 10, 0);
  writeUint32(centralView, 20, data.byteLength);
  writeUint32(centralView, 24, data.byteLength);
  writeUint16(centralView, 28, filenameBytes.byteLength);

  const centralOffset = localHeader.byteLength + filenameBytes.byteLength + data.byteLength;
  const centralSize = centralHeader.byteLength + filenameBytes.byteLength;
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 8, 1);
  writeUint16(endView, 10, 1);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, centralOffset);

  return new Blob([
    toBlobPart(localHeader),
    toBlobPart(filenameBytes),
    toBlobPart(data),
    toBlobPart(centralHeader),
    toBlobPart(filenameBytes),
    toBlobPart(endRecord),
  ]);
}

describe('zip utilities', () => {
  it('creates and extracts a zip with nested paths', async () => {
    const archive = await createZipCompression([
      { filename: 'docs/readme.txt', blob: new Blob(['hello']) },
      { filename: 'assets/icons/icon.txt', blob: new Blob(['icon']) },
    ]);

    expect(archive.ok).toBe(true);
    if (!archive.ok) return;

    const extracted = await extractZipArchive(new File([archive.blob], archive.filename));
    expect(extracted.ok).toBe(true);
    if (!extracted.ok) return;

    expect(extracted.entries.map((entry) => entry.path)).toEqual([
      'assets/icons/icon.txt',
      'docs/readme.txt',
    ]);
    expect(await extracted.entries[1].blob.text()).toBe('hello');
  });

  it('decodes GBK filenames when the ZIP lacks a UTF-8 filename flag', async () => {
    const gbkFilename = new Uint8Array([0xd6, 0xd0, 0xce, 0xc4, 0x2e, 0x74, 0x78, 0x74]);
    const archive = createStoredZipWithRawName(gbkFilename, new TextEncoder().encode('ok'));

    const extracted = await extractZipArchive(new File([archive], 'gbk.zip'));

    expect(extracted.ok).toBe(true);
    if (!extracted.ok) return;
    expect(extracted.entries[0].path).toBe('中文.txt');
    expect(await extracted.entries[0].blob.text()).toBe('ok');
  });
});
