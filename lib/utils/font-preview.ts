export const FONT_PREVIEW_ACCEPT = '.ttf,.otf,.woff,.woff2';
export const FONT_PREVIEW_MAX_BYTES = 30 * 1024 * 1024;
export type FontPreviewError = 'empty' | 'format' | 'size' | 'load';

export function validatePreviewFont(file: { name: string; size: number }):
  { ok: true } | { ok: false; code: FontPreviewError } {
  if (!file.size) return { ok: false, code: 'empty' };
  if (file.size > FONT_PREVIEW_MAX_BYTES) return { ok: false, code: 'size' };
  if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) return { ok: false, code: 'format' };
  return { ok: true };
}
