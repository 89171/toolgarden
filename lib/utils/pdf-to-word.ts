import { strToU8, zipSync } from 'fflate';
import { createPdfDerivedFilename, isPdfFile, MAX_PDF_INPUT_FILE_SIZE } from './pdf';
import { formatFileSize } from './image';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_TEXT_ITEMS_PER_PAGE = 12000;

type PdfToWordErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'load_failed'
  | 'empty_text'
  | 'render_failed';

export type PdfToWordError = {
  ok: false;
  code: PdfToWordErrorCode;
  maxSize?: string;
};

export interface PdfToWordSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  paragraphCount: number;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export type PdfToWordOutcome = PdfToWordSuccess | PdfToWordError;

interface PdfTextItemLike {
  str: string;
  transform: number[];
  hasEOL?: boolean;
}

interface PositionedText {
  text: string;
  x: number;
  y: number;
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function isPdfTextItem(item: unknown): item is PdfTextItemLike {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as { str?: unknown; transform?: unknown };
  return typeof candidate.str === 'string' && Array.isArray(candidate.transform);
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\u0000/g, '').trim();
}

function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createParagraph(text: string): string {
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function createPageBreak(): string {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function groupTextItemsIntoLines(items: PositionedText[]): string[] {
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3) return yDiff;
    return a.x - b.x;
  });

  const lines: PositionedText[][] = [];

  for (const item of sorted) {
    const current = lines[lines.length - 1];
    if (!current || Math.abs(current[0].y - item.y) > 3) {
      lines.push([item]);
      continue;
    }
    current.push(item);
  }

  return lines
    .map((line) => normalizeText(line.sort((a, b) => a.x - b.x).map((item) => item.text).join(' ')))
    .filter(Boolean);
}

function buildDocumentXml(pages: string[][]): string {
  const body = pages
    .flatMap((lines, pageIndex) => [
      ...(pageIndex > 0 ? [createPageBreak()] : []),
      ...lines.map(createParagraph),
    ])
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function createDocxBlob(pages: string[][]): Blob {
  const entries: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`),
    'docProps/core.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>PDF to Word conversion</dc:title>
  <dc:creator>Toolgarden</dc:creator>
  <cp:lastModifiedBy>Toolgarden</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`),
    'docProps/app.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Toolgarden</Application>
</Properties>`),
    'word/document.xml': strToU8(buildDocumentXml(pages)),
  };

  const zipped = zipSync(entries, { level: 6 });
  const part = zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength) as ArrayBuffer;
  return new Blob([part], { type: DOCX_MIME_TYPE });
}

export async function convertPdfToWord(file: File): Promise<PdfToWordOutcome> {
  const startedAt = now();

  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (!isPdfFile(file)) return { ok: false, code: 'unsupported_input' };
  if (file.size > MAX_PDF_INPUT_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_PDF_INPUT_FILE_SIZE),
    };
  }

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data, useSystemFonts: true });
    const pdf = await loadingTask.promise;
    const pages: string[][] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const positioned: PositionedText[] = [];

      for (const item of textContent.items.slice(0, MAX_TEXT_ITEMS_PER_PAGE)) {
        if (!isPdfTextItem(item)) continue;
        const text = normalizeText(item.str);
        if (!text) continue;

        positioned.push({
          text,
          x: Number(item.transform[4] ?? 0),
          y: Number(item.transform[5] ?? 0),
        });
      }

      pages.push(groupTextItemsIntoLines(positioned));
    }

    const paragraphCount = pages.reduce((total, page) => total + page.length, 0);
    if (paragraphCount === 0) return { ok: false, code: 'empty_text' };

    const blob = createDocxBlob(pages);

    return {
      ok: true,
      blob,
      filename: createPdfDerivedFilename(file.name, 'word').replace(/\.pdf$/, '.docx'),
      pageCount: pdf.numPages,
      paragraphCount,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}
