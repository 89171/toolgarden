import { describe, expect, it } from 'vitest';
import { createZipCompression, extractZipArchive } from '../lib/utils/zip';

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
});
