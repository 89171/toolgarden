export type PdfInputKind =
  | 'image'
  | 'text'
  | 'markdown'
  | 'html'
  | 'epub'
  | 'mobi'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'legacy-office'
  | 'unsupported';

export type PdfConversionErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'legacy_office'
  | 'file_too_large'
  | 'load_failed'
  | 'render_failed'
  | 'empty_document'
  | 'mobi_unsupported';

export interface PdfConversionError {
  ok: false;
  code: PdfConversionErrorCode;
  detail?: string;
  maxSize?: string;
}

export interface PdfConversionSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  inputKind: Exclude<PdfInputKind, 'legacy-office' | 'unsupported'>;
  pageCount: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export type PdfConversionOutcome = PdfConversionSuccess | PdfConversionError;

export interface PdfInputFormat {
  kind: Exclude<PdfInputKind, 'unsupported'>;
  label: string;
  extensions: string[];
  mimeTypes: string[];
}

export const MAX_PDF_INPUT_FILE_SIZE = 80 * 1024 * 1024;
export const PDF_FILE_ACCEPT_VALUE = 'application/pdf,.pdf';

export const supportedPdfInputs: PdfInputFormat[] = [
  {
    kind: 'word',
    label: 'Word',
    extensions: ['docx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  {
    kind: 'excel',
    label: 'Excel',
    extensions: ['xlsx', 'xls'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
  },
  {
    kind: 'powerpoint',
    label: 'PowerPoint',
    extensions: ['pptx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  },
  {
    kind: 'epub',
    label: 'EPUB',
    extensions: ['epub'],
    mimeTypes: ['application/epub+zip'],
  },
  {
    kind: 'mobi',
    label: 'MOBI',
    extensions: ['mobi'],
    mimeTypes: ['application/x-mobipocket-ebook', 'application/vnd.amazon.ebook'],
  },
  {
    kind: 'image',
    label: 'JPG',
    extensions: ['jpg', 'jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  {
    kind: 'image',
    label: 'PNG',
    extensions: ['png'],
    mimeTypes: ['image/png'],
  },
  {
    kind: 'image',
    label: 'WebP',
    extensions: ['webp'],
    mimeTypes: ['image/webp'],
  },
  {
    kind: 'text',
    label: 'TXT',
    extensions: ['txt', 'text'],
    mimeTypes: ['text/plain'],
  },
  {
    kind: 'markdown',
    label: 'Markdown',
    extensions: ['md', 'markdown'],
    mimeTypes: ['text/markdown', 'text/x-markdown'],
  },
  {
    kind: 'html',
    label: 'HTML',
    extensions: ['html', 'htm'],
    mimeTypes: ['text/html', 'application/xhtml+xml'],
  },
  {
    kind: 'legacy-office',
    label: 'Legacy Office',
    extensions: ['doc', 'ppt'],
    mimeTypes: ['application/msword', 'application/vnd.ms-powerpoint'],
  },
];

const extensionToKind = new Map(
  supportedPdfInputs.flatMap((format) =>
    format.extensions.map((extension) => [extension, format.kind] as const)
  )
);

const mimeToKind = new Map(
  supportedPdfInputs.flatMap((format) =>
    format.mimeTypes.map((mimeType) => [mimeType, format.kind] as const)
  )
);

export function getPdfAcceptValue(): string {
  const extensions = supportedPdfInputs.flatMap((format) =>
    format.extensions.map((extension) => `.${extension}`)
  );
  const mimeTypes = supportedPdfInputs.flatMap((format) => format.mimeTypes);

  return [...new Set([...mimeTypes, ...extensions])].join(',');
}

export function getSupportedPdfInputLabel(): string {
  return supportedPdfInputs
    .filter((format) => format.kind !== 'legacy-office')
    .map((format) => format.label)
    .join(' / ');
}

export function getFileExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? '';
}

export function inferPdfInputKind(file: File): PdfInputKind {
  if (file.type && mimeToKind.has(file.type)) {
    return mimeToKind.get(file.type) ?? 'unsupported';
  }

  const extension = getFileExtension(file.name);
  return extensionToKind.get(extension) ?? 'unsupported';
}

export function createPdfOutputFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'document';
  return `${base}.pdf`;
}

export function createPdfDerivedFilename(filename: string, suffix: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'document';
  return `${base}-${suffix}.pdf`;
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || getFileExtension(file.name) === 'pdf';
}

export type PdfPageSelectionOutcome =
  | { ok: true; pages: number[]; label: string }
  | { ok: false; message: string };

export interface PdfPageGroup {
  pages: number[];
  label: string;
}

export type PdfPageGroupOutcome =
  | { ok: true; groups: PdfPageGroup[] }
  | { ok: false; message: string };

function parsePageToken(token: string, pageCount: number): PdfPageSelectionOutcome {
  const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);
  const singleMatch = token.match(/^\d+$/);

  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      return { ok: false, message: `页码 ${token} 超出 1-${pageCount} 范围` };
    }
    if (start > end) return { ok: false, message: `页码范围 ${token} 无效` };

    return {
      ok: true,
      pages: Array.from({ length: end - start + 1 }, (_, index) => start + index - 1),
      label: `${start}-${end}`,
    };
  }

  if (singleMatch) {
    const page = Number(token);
    if (page < 1 || page > pageCount) {
      return { ok: false, message: `页码 ${token} 超出 1-${pageCount} 范围` };
    }
    return { ok: true, pages: [page - 1], label: String(page) };
  }

  return { ok: false, message: `无法识别页码：${token}` };
}

export function parsePdfPageSelection(input: string, pageCount: number): PdfPageSelectionOutcome {
  const normalized = input.replace(/[，、]/g, ',').trim();
  if (!normalized) return { ok: false, message: '请输入页码，例如 1,3,5-7' };
  if (pageCount < 1) return { ok: false, message: 'PDF 没有可用页面' };

  const seen = new Set<number>();
  const pages: number[] = [];
  const labels: string[] = [];

  for (const token of normalized.split(',').map((part) => part.trim()).filter(Boolean)) {
    const parsed = parsePageToken(token, pageCount);
    if (!parsed.ok) return parsed;

    labels.push(parsed.label);
    for (const page of parsed.pages) {
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
    }
  }

  if (pages.length === 0) return { ok: false, message: '没有有效页面' };
  return { ok: true, pages, label: labels.join(', ') };
}

export function parsePdfPageGroups(input: string, pageCount: number): PdfPageGroupOutcome {
  const groupInputs = input
    .replace(/[；]/g, ';')
    .split(/[;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (groupInputs.length === 0) {
    return { ok: false, message: '请输入页面范围组，例如 1-3; 4-6; 7' };
  }

  const groups: PdfPageGroup[] = [];

  for (const groupInput of groupInputs) {
    const parsed = parsePdfPageSelection(groupInput, pageCount);
    if (!parsed.ok) return parsed;
    groups.push({ pages: parsed.pages, label: parsed.label });
  }

  return { ok: true, groups };
}
