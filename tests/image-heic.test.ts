import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getImageAcceptValue, getSupportedImageInputLabel, isHeicImageInput, isSupportedImageInput } from '../lib/utils/image';
import { decodeHeicImage } from '../lib/utils/image-heic-browser';
import { convertImageFile } from '../lib/utils/image-browser';

const heicTo = vi.hoisted(() => vi.fn());
vi.mock('heic-to/csp', () => ({ heicTo }));

beforeEach(() => { heicTo.mockReset(); });

describe('HEIC input and decoding', () => {
  it('recognizes missing MIME, uppercase extensions and MIME-only files', () => {
    for (const file of [new File(['x'], 'photo.HEIC'), new File(['x'], 'photo.heif', { type: 'application/octet-stream' }), new File(['x'], 'photo', { type: 'image/heic' })]) {
      expect(isHeicImageInput(file)).toBe(true);
    }
    expect(isHeicImageInput(new File(['x'], 'photo.avif'))).toBe(false);
    expect(getImageAcceptValue(true)).toContain('.heic');
    expect(getSupportedImageInputLabel(true)).toContain('HEIF');
    expect(getImageAcceptValue()).not.toContain('.heic');
  });

  it('caches a lossless decode and creates a browser-readable intermediate', async () => {
    heicTo.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    const source = new File(['heic'], 'photo.HEIC');
    const [a, b] = await Promise.all([decodeHeicImage(source), decodeHeicImage(source)]);
    expect(a).toBe(b);
    expect(heicTo).toHaveBeenCalledTimes(1);
    expect(heicTo).toHaveBeenCalledWith({ blob: source, type: 'image/png' });
    expect(a.ok).toBe(true);
    if (a.ok) {
      expect(a.file.name).toBe('photo.png');
      expect(isHeicImageInput(a.file)).toBe(false);
      expect(isSupportedImageInput(a.file)).toBe(true);
    }
  });

  it('returns recoverable failures and permits retry', async () => {
    heicTo.mockRejectedValueOnce(new Error('corrupt'));
    const source = new File(['bad'], 'broken.heic');
    expect(await decodeHeicImage(source)).toEqual({ ok: false, code: 'load_failed' });
    heicTo.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    expect((await decodeHeicImage(source)).ok).toBe(true);
  });

  it.each(['jpg', 'png', 'webp', 'avif'] as const)('handles malformed HEIC safely for %s', async (format) => {
    heicTo.mockRejectedValue(new Error('bad image'));
    expect(await convertImageFile(new File(['bad'], 'bad.heic'), format)).toEqual({ ok: false, code: 'load_failed' });
  });
});
