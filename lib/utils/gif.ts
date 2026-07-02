import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';

export interface DecodedFrame {
  index: number;
  delay: number;
  dataUrl: string;
}

export async function decodeGif(file: File): Promise<DecodedFrame[]> {
  const buffer = await file.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames: ParsedFrame[] = decompressFrames(gif, true);
  if (frames.length === 0) return [];

  const width = frames[0].dims.width;
  const height = frames[0].dims.height;

  const backdrop = document.createElement('canvas');
  backdrop.width = width;
  backdrop.height = height;
  const bctx = backdrop.getContext('2d');
  if (!bctx) return [];

  const results: DecodedFrame[] = [];
  const patch = document.createElement('canvas');
  const pctx = patch.getContext('2d');
  if (!pctx) return [];

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    patch.width = frame.dims.width;
    patch.height = frame.dims.height;
    const imageData = pctx.createImageData(frame.dims.width, frame.dims.height);
    imageData.data.set(frame.patch);
    pctx.putImageData(imageData, 0, 0);
    bctx.drawImage(patch, frame.dims.left, frame.dims.top);
    results.push({
      index: i,
      delay: frame.delay || 100,
      dataUrl: backdrop.toDataURL('image/png'),
    });
    if (frame.disposalType === 2) {
      bctx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
    }
  }

  return results;
}

export async function downloadFramesAsZip(frames: DecodedFrame[], baseName: string): Promise<void> {
  const { zipSync, strToU8 } = await import('fflate');
  const files: Record<string, Uint8Array> = {};
  for (const frame of frames) {
    const base64 = frame.dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    files[`${baseName}-${String(frame.index + 1).padStart(4, '0')}.png`] = bytes;
  }
  files[`${baseName}-manifest.txt`] = strToU8(
    frames.map((f, i) => `${i + 1}: delay=${f.delay}ms`).join('\n')
  );
  const zipped = zipSync(files);
  const blob = new Blob([zipped as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-frames.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
