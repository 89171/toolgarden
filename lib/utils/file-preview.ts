import { markdownToHtml, type MarkdownHtmlOutcome } from './markdown';

export type PreviewKind =
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'text'
  | 'markdown'
  | 'spreadsheet'
  | 'document'
  | 'zip'
  | 'binary';

export interface PreviewFileLike {
  name: string;
  type?: string;
}

export interface TextPreview {
  text: string;
  truncated: boolean;
  totalCharacters: number;
}

export interface SpreadsheetPreviewSheet {
  name: string;
  rows: string[][];
  totalRows: number;
  totalColumns: number;
}

export interface SpreadsheetPreview {
  sheets: SpreadsheetPreviewSheet[];
}

export type FilePreviewData =
  | { ok: true; kind: Exclude<PreviewKind, 'text' | 'markdown' | 'spreadsheet'> }
  | { ok: true; kind: 'text'; text: TextPreview }
  | { ok: true; kind: 'markdown'; markdown: MarkdownHtmlOutcome & { ok: true }; text: TextPreview }
  | { ok: true; kind: 'spreadsheet'; spreadsheet: SpreadsheetPreview }
  | { ok: false; message: string };

const MAX_TEXT_CHARACTERS = 300_000;
const MAX_SPREADSHEET_ROWS = 200;
const MAX_SPREADSHEET_COLUMNS = 30;

const TEXT_EXTENSIONS = new Set([
  'asm', 'c', 'cc', 'cfg', 'conf', 'cpp', 'cs', 'css', 'csv', 'env', 'go', 'graphql',
  'h', 'hpp', 'html', 'ini', 'java', 'js', 'jsx', 'json', 'log', 'md', 'mjs', 'php',
  'py', 'rs', 'scss', 'sh', 'sql', 'svg', 'toml', 'ts', 'tsx', 'txt', 'vue', 'xml',
  'yaml', 'yml', 'zsh',
]);

function getExtension(name: string): string {
  const basename = name.split(/[\\/]/u).at(-1) ?? name;
  const dotIndex = basename.lastIndexOf('.');
  return dotIndex > -1 ? basename.slice(dotIndex + 1).toLowerCase() : '';
}

function normalizeMimeType(type: string | undefined): string {
  return type?.toLowerCase().split(';', 1)[0].trim() ?? '';
}

/** Determine the safest browser preview strategy from both MIME type and filename. */
export function getFilePreviewKind(file: PreviewFileLike): PreviewKind {
  const mimeType = normalizeMimeType(file.type);
  const extension = getExtension(file.name);

  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed' || extension === 'zip') {
    return 'zip';
  }
  if (mimeType.startsWith('image/') || ['avif', 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png', 'svg', 'webp'].includes(extension)) {
    return 'image';
  }
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
    return 'document';
  }
  if (
    mimeType.includes('spreadsheet') ||
    mimeType === 'application/vnd.ms-excel' ||
    ['csv', 'xls', 'xlsx'].includes(extension)
  ) {
    return 'spreadsheet';
  }
  if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown' || ['md', 'markdown'].includes(extension)) {
    return 'markdown';
  }
  if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/xml' || TEXT_EXTENSIONS.has(extension)) {
    return 'text';
  }

  return 'binary';
}

function decodeText(bytes: ArrayBuffer): string {
  return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/u, '');
}

export async function readTextPreview(
  file: Blob,
  maxCharacters = MAX_TEXT_CHARACTERS
): Promise<TextPreview> {
  const text = decodeText(await file.arrayBuffer());
  return {
    text: text.slice(0, maxCharacters),
    truncated: text.length > maxCharacters,
    totalCharacters: text.length,
  };
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value) ?? '';
  return String(value);
}

export async function readSpreadsheetPreview(file: Blob): Promise<SpreadsheetPreview> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: 'array',
    cellDates: true,
    raw: false,
  });

  const sheets = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const range = sheet?.['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : null;
    const totalRows = range ? range.e.r - range.s.r + 1 : 0;
    const totalColumns = range ? range.e.c - range.s.c + 1 : 0;
    const rows = sheet
      ? XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          raw: false,
          defval: '',
          blankrows: false,
        })
          .slice(0, MAX_SPREADSHEET_ROWS)
          .map((row) => row.slice(0, MAX_SPREADSHEET_COLUMNS).map(cellToString))
      : [];

    return { name, rows, totalRows, totalColumns };
  });

  return { sheets };
}

export async function loadFilePreview(
  file: Blob & PreviewFileLike,
  locale: 'zh' | 'en'
): Promise<FilePreviewData> {
  const kind = getFilePreviewKind(file);

  try {
    if (kind === 'text') {
      return { ok: true, kind, text: await readTextPreview(file) };
    }

    if (kind === 'markdown') {
      const text = await readTextPreview(file);
      const markdown = markdownToHtml(text.text, {
        fallbackTitle: file.name,
        lang: locale === 'zh' ? 'zh-CN' : 'en',
      });
      if (!markdown.ok) return { ok: false, message: markdown.message };
      return { ok: true, kind, markdown, text };
    }

    if (kind === 'spreadsheet') {
      return { ok: true, kind, spreadsheet: await readSpreadsheetPreview(file) };
    }

    return { ok: true, kind };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'preview_failed',
    };
  }
}

export function formatPreviewMimeType(file: PreviewFileLike): string {
  return normalizeMimeType(file.type) || 'application/octet-stream';
}
