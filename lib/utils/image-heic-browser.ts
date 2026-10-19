import { createImageOutputFilename, type ImageConversionError } from './image';

type DecodeOutcome = { ok: true; file: File } | ImageConversionError;
const decodedFiles = new WeakMap<File, Promise<DecodeOutcome>>();

/** Decode on demand; cache by source File so quality changes do not repeat HEVC decoding. */
export function decodeHeicImage(file: File): Promise<DecodeOutcome> {
  const cached = decodedFiles.get(file);
  if (cached) return cached;
  const pending = (async (): Promise<DecodeOutcome> => {
    try {
      const { heicTo } = await import('heic-to/csp');
      const blob = await heicTo({ blob: file, type: 'image/png' });
      return {
        ok: true,
        file: new File([blob], createImageOutputFilename(file.name, 'png'), { type: 'image/png' }),
      };
    } catch {
      decodedFiles.delete(file);
      return { ok: false, code: 'load_failed' };
    }
  })();
  decodedFiles.set(file, pending);
  return pending;
}
