import { describe, expect, it } from 'vitest';
import { FONT_PREVIEW_MAX_BYTES, validatePreviewFont } from '../lib/utils/font-preview';

describe('font preview validation', () => {
  it.each(['sample.ttf', 'sample.OTF', 'sample.woff', 'sample.WOFF2'])('accepts %s', (name) => {
    expect(validatePreviewFont({ name, size: 123 })).toEqual({ ok: true });
  });
  it('rejects empty, unsupported and oversized files', () => {
    expect(validatePreviewFont({ name: 'a.ttf', size: 0 })).toEqual({ ok: false, code: 'empty' });
    expect(validatePreviewFont({ name: 'a.ttf.exe', size: 10 })).toEqual({ ok: false, code: 'format' });
    expect(validatePreviewFont({ name: 'a.ttf', size: FONT_PREVIEW_MAX_BYTES + 1 })).toEqual({ ok: false, code: 'size' });
    expect(validatePreviewFont({ name: 'a.ttf', size: FONT_PREVIEW_MAX_BYTES })).toEqual({ ok: true });
  });
});
