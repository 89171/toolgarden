import { convertFileToPdf } from './pdf-browser';
import type { PdfConversionOutcome } from './pdf';
import { isMarkdownFile } from './markdown';

export type MarkdownFileReadOutcome =
  | { ok: true; text: string; filename: string }
  | { ok: false; code: 'invalid_markdown_file' | 'empty_markdown_file' | 'markdown_file_read_failed' };

export async function readMarkdownFile(file: File): Promise<MarkdownFileReadOutcome> {
  if (!isMarkdownFile(file)) return { ok: false, code: 'invalid_markdown_file' };
  if (file.size === 0) return { ok: false, code: 'empty_markdown_file' };

  try {
    const text = (await file.text()).replace(/^\uFEFF/u, '');
    if (!text.trim()) return { ok: false, code: 'empty_markdown_file' };
    return { ok: true, text, filename: file.name };
  } catch {
    return { ok: false, code: 'markdown_file_read_failed' };
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

export function downloadTextFile(content: string, filename: string): void {
  downloadBlob(new Blob([content], { type: 'text/html;charset=utf-8' }), filename);
}

export async function copyText(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}

export function convertMarkdownTextToPdf(
  markdown: string,
  filenameStem: string
): Promise<PdfConversionOutcome> {
  const file = new File([markdown], `${filenameStem}.md`, {
    type: 'text/markdown',
    lastModified: Date.now(),
  });

  return convertFileToPdf(file);
}
