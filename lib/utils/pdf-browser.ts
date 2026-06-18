import { unzipSync } from 'fflate';
import { PDFDocument, type PDFImage } from 'pdf-lib';
import { formatFileSize } from './image';
import {
  createPdfDerivedFilename,
  createPdfOutputFilename,
  inferPdfInputKind,
  isPdfFile,
  MAX_PDF_INPUT_FILE_SIZE,
  type PdfPageGroup,
  type PdfConversionOutcome,
} from './pdf';

type TextBlockKind = 'title' | 'heading' | 'body' | 'mono' | 'spacer';

interface TextBlock {
  kind: TextBlockKind;
  text: string;
}

interface CanvasPage {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  cursorY: number;
}

export type PdfOperationErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'load_failed'
  | 'empty_selection';

export type PdfOperationError = {
  ok: false;
  code: PdfOperationErrorCode;
  detail?: string;
  maxSize?: string;
};

export interface PdfFileInspectionSuccess {
  ok: true;
  filename: string;
  pageCount: number;
  size: number;
}

export type PdfFileInspectionOutcome = PdfFileInspectionSuccess | PdfOperationError;

export interface PdfOperationSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  outputSize: number;
  durationMs: number;
}

export type PdfOperationOutcome = PdfOperationSuccess | PdfOperationError;

export interface PdfSplitFile {
  blob: Blob;
  filename: string;
  pageCount: number;
  label: string;
}

export type PdfSplitOutcome =
  | { ok: true; files: PdfSplitFile[]; durationMs: number }
  | PdfOperationError;

export interface PdfOrganizeEntry {
  id: string;
  sourcePageIndex: number;
}

const PDF_MIME_TYPE = 'application/pdf';
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const CANVAS_WIDTH = 794;
const CANVAS_HEIGHT = 1123;
const CANVAS_MARGIN = 56;
const CONTENT_WIDTH = CANVAS_WIDTH - CANVAS_MARGIN * 2;
const FONT_FAMILY = 'Arial, "Helvetica Neue", sans-serif';
const MONO_FONT_FAMILY = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function createPage(): CanvasPage {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context is unavailable.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.textBaseline = 'top';

  return { canvas, context, cursorY: CANVAS_MARGIN };
}

function getBlockStyle(kind: TextBlockKind) {
  switch (kind) {
    case 'title':
      return { font: `700 30px ${FONT_FAMILY}`, fill: '#111827', lineHeight: 38, gapAfter: 18 };
    case 'heading':
      return { font: `700 21px ${FONT_FAMILY}`, fill: '#111827', lineHeight: 29, gapAfter: 10 };
    case 'mono':
      return { font: `400 14px ${MONO_FONT_FAMILY}`, fill: '#1f2937', lineHeight: 21, gapAfter: 8 };
    case 'spacer':
      return { font: `400 15px ${FONT_FAMILY}`, fill: '#374151', lineHeight: 14, gapAfter: 0 };
    default:
      return { font: `400 16px ${FONT_FAMILY}`, fill: '#374151', lineHeight: 24, gapAfter: 8 };
  }
}

function wrapLine(context: CanvasRenderingContext2D, line: string, maxWidth: number): string[] {
  if (line.length === 0) return [''];

  const wrapped: string[] = [];
  let current = '';

  for (const char of line.replace(/\t/g, '    ')) {
    const next = `${current}${char}`;
    if (current && context.measureText(next).width > maxWidth) {
      wrapped.push(current.trimEnd());
      current = char.trimStart();
    } else {
      current = next;
    }
  }

  if (current) wrapped.push(current.trimEnd());
  return wrapped.length > 0 ? wrapped : [''];
}

function normalizeText(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(/\u0000/g, '').trim();
}

function textToBlocks(title: string, text: string, kind: TextBlockKind = 'body'): TextBlock[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  return [
    { kind: 'title', text: title },
    ...normalized.split(/\n{2,}/).flatMap((paragraph) => {
      const lines = paragraph.split('\n').map((line) => line.trimEnd());
      return [{ kind, text: lines.join('\n') } satisfies TextBlock];
    }),
  ];
}

function markdownToBlocks(title: string, text: string): TextBlock[] {
  const lines = normalizeText(text).split('\n');
  const blocks: TextBlock[] = [{ kind: 'title', text: title }];
  let paragraph: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  function flushParagraph() {
    const content = paragraph.join('\n').trim();
    if (content) blocks.push({ kind: 'body', text: content });
    paragraph = [];
  }

  function flushCode() {
    const content = codeLines.join('\n').trim();
    if (content) blocks.push({ kind: 'mono', text: content });
    codeLines = [];
  }

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push({ kind: 'heading', text: heading[1].trim() });
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    paragraph.push(line.replace(/[*_`~]/g, ''));
  }

  flushParagraph();
  flushCode();
  return blocks;
}

function htmlToBlocks(title: string, html: string): TextBlock[] {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const pageTitle = document.querySelector('title')?.textContent?.trim() || title;
  const body = document.body;
  const blocks: TextBlock[] = [{ kind: 'title', text: pageTitle }];
  const blockTags = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE']);
  const headingTags = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
  const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);

  function collect(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.replace(/\s+/g, ' ') ?? '';
    if (!(node instanceof Element) || ignoredTags.has(node.tagName)) return '';

    if (node.tagName === 'BR') return '\n';
    if (node.tagName === 'LI') return `- ${Array.from(node.childNodes).map(collect).join('').trim()}\n`;
    if (node.tagName === 'TR') return `${Array.from(node.children).map(collect).join('    ')}\n`;

    return Array.from(node.childNodes).map(collect).join('');
  }

  function visit(element: Element) {
    if (ignoredTags.has(element.tagName)) return;

    if (headingTags.has(element.tagName)) {
      const text = collect(element).trim();
      if (text) blocks.push({ kind: 'heading', text });
      return;
    }

    if (blockTags.has(element.tagName) || element.tagName === 'UL' || element.tagName === 'OL') {
      const text = collect(element).trim();
      if (text) blocks.push({ kind: 'body', text });
      return;
    }

    Array.from(element.children).forEach(visit);
  }

  Array.from(body.children).forEach(visit);

  if (blocks.length === 1) {
    const fallback = body.textContent?.replace(/\s+/g, ' ').trim();
    if (fallback) blocks.push({ kind: 'body', text: fallback });
  }

  return blocks;
}

function htmlToContentBlocks(html: string): TextBlock[] {
  return htmlToBlocks('', html).filter((block, index) => !(index === 0 && block.kind === 'title'));
}

function getElementsByLocalName(root: ParentNode, localName: string): Element[] {
  return Array.from(root.querySelectorAll('*')).filter((element) => element.localName === localName);
}

function parseXml(value: string): XMLDocument {
  return new DOMParser().parseFromString(value, 'application/xml');
}

function decodeXmlEntry(entry?: Uint8Array): string {
  return entry ? new TextDecoder().decode(entry) : '';
}

function decodeZipTextEntry(entry?: Uint8Array): string {
  return entry ? new TextDecoder('utf-8').decode(entry) : '';
}

function getFirstElementText(root: ParentNode, localName: string): string {
  return getElementsByLocalName(root, localName)[0]?.textContent?.trim() ?? '';
}

function getParentDirectory(path: string): string {
  const index = path.lastIndexOf('/');
  return index >= 0 ? path.slice(0, index) : '';
}

function decodeHref(href: string): string {
  try {
    return decodeURI(href);
  } catch {
    return href;
  }
}

function resolveZipPath(baseDir: string, href: string): string {
  const cleanHref = decodeHref(href.split('#')[0] ?? '');
  const parts = baseDir ? baseDir.split('/').filter(Boolean) : [];

  for (const part of cleanHref.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return parts.join('/');
}

function extractParagraphText(element: Element): string {
  let output = '';

  for (const child of Array.from(element.querySelectorAll('*'))) {
    if (child.localName === 't') output += child.textContent ?? '';
    if (child.localName === 'tab') output += '    ';
    if (child.localName === 'br') output += '\n';
  }

  return output.trim();
}

function extractDocxBlocks(filename: string, buffer: ArrayBuffer): TextBlock[] {
  const entries = unzipSync(new Uint8Array(buffer));
  const documentXml = parseXml(decodeXmlEntry(entries['word/document.xml']));
  const paragraphs = getElementsByLocalName(documentXml, 'p')
    .map(extractParagraphText)
    .filter(Boolean);

  return textToBlocks(filename, paragraphs.join('\n\n'));
}

function extractEpubBlocks(filename: string, buffer: ArrayBuffer): TextBlock[] {
  const entries = unzipSync(new Uint8Array(buffer));
  const containerXml = parseXml(decodeZipTextEntry(entries['META-INF/container.xml']));
  const rootfilePath =
    getElementsByLocalName(containerXml, 'rootfile')[0]?.getAttribute('full-path') ??
    Object.keys(entries).find((name) => /\.opf$/i.test(name));

  if (!rootfilePath) throw new Error('No EPUB package document found.');

  const opfXml = parseXml(decodeZipTextEntry(entries[rootfilePath]));
  const baseDir = getParentDirectory(rootfilePath);
  const title = getFirstElementText(opfXml, 'title') || filename;
  const manifest = new Map<string, { href: string; mediaType: string }>();

  getElementsByLocalName(opfXml, 'item').forEach((item) => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (!id || !href) return;
    manifest.set(id, {
      href,
      mediaType: item.getAttribute('media-type') ?? '',
    });
  });

  const spineIds = getElementsByLocalName(opfXml, 'itemref')
    .map((itemref) => itemref.getAttribute('idref'))
    .filter((idref): idref is string => Boolean(idref));
  const readingOrder = spineIds.length > 0 ? spineIds : Array.from(manifest.keys());
  const blocks: TextBlock[] = [{ kind: 'title', text: title }];

  for (const id of readingOrder) {
    const item = manifest.get(id);
    if (!item) continue;

    const isHtmlItem =
      /xhtml|html/i.test(item.mediaType) ||
      /\.(xhtml|html?|xml)$/i.test(item.href);
    if (!isHtmlItem) continue;

    const path = resolveZipPath(baseDir, item.href);
    const html = decodeZipTextEntry(entries[path]);
    if (!html) continue;

    const contentBlocks = htmlToContentBlocks(html);
    if (contentBlocks.length > 0) {
      blocks.push(...contentBlocks);
    }
  }

  return blocks;
}

function extractPptxBlocks(filename: string, buffer: ArrayBuffer): TextBlock[] {
  const entries = unzipSync(new Uint8Array(buffer));
  const slideNames = Object.keys(entries)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      const rightNumber = Number(right.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      return leftNumber - rightNumber;
    });
  const blocks: TextBlock[] = [{ kind: 'title', text: filename }];

  slideNames.forEach((name, index) => {
    const slide = parseXml(decodeXmlEntry(entries[name]));
    const texts = getElementsByLocalName(slide, 't')
      .map((node) => node.textContent?.trim() ?? '')
      .filter(Boolean);

    if (texts.length > 0) {
      blocks.push({ kind: 'heading', text: `Slide ${index + 1}` });
      blocks.push({ kind: 'body', text: texts.join('\n') });
    }
  });

  return blocks;
}

function readBigEndianUint16(view: DataView, offset: number): number {
  return view.getUint16(offset, false);
}

function readBigEndianUint32(view: DataView, offset: number): number {
  return view.getUint32(offset, false);
}

function decodePalmDatabaseName(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer, 0, Math.min(32, buffer.byteLength));
  const end = bytes.indexOf(0);
  const nameBytes = bytes.slice(0, end >= 0 ? end : bytes.length);

  try {
    return new TextDecoder('windows-1252').decode(nameBytes).trim();
  } catch {
    return new TextDecoder('utf-8').decode(nameBytes).trim();
  }
}

function decompressPalmDoc(data: Uint8Array): Uint8Array {
  const output: number[] = [];

  for (let index = 0; index < data.length; index += 1) {
    const byte = data[index];

    if (byte === 0) {
      output.push(byte);
      continue;
    }

    if (byte >= 1 && byte <= 8) {
      for (let count = 0; count < byte && index + 1 < data.length; count += 1) {
        index += 1;
        output.push(data[index]);
      }
      continue;
    }

    if (byte <= 0x7f) {
      output.push(byte);
      continue;
    }

    if (byte <= 0xbf) {
      if (index + 1 >= data.length) break;
      index += 1;
      const next = data[index];
      const distance = ((byte & 0x3f) << 5) | (next >> 3);
      const length = (next & 0x07) + 3;
      const start = output.length - distance;

      if (distance <= 0 || start < 0) throw new Error('mobi_unsupported');

      for (let count = 0; count < length; count += 1) {
        output.push(output[start + count]);
      }
      continue;
    }

    output.push(0x20, byte ^ 0x80);
  }

  return new Uint8Array(output);
}

function concatBytes(chunks: Uint8Array[], maxLength?: number): Uint8Array {
  const length = Math.min(
    maxLength ?? Number.POSITIVE_INFINITY,
    chunks.reduce((total, chunk) => total + chunk.length, 0)
  );
  const output = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    const remaining = length - offset;
    if (remaining <= 0) break;
    output.set(chunk.slice(0, remaining), offset);
    offset += Math.min(chunk.length, remaining);
  }

  return output;
}

function decodeMobiText(bytes: Uint8Array, encoding: number): string {
  const label = encoding === 65001 ? 'utf-8' : 'windows-1252';

  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

function extractMobiBlocks(filename: string, buffer: ArrayBuffer): TextBlock[] {
  if (buffer.byteLength < 86) throw new Error('mobi_unsupported');

  const view = new DataView(buffer);
  const recordCount = readBigEndianUint16(view, 76);
  if (recordCount < 2 || 78 + recordCount * 8 > buffer.byteLength) {
    throw new Error('mobi_unsupported');
  }

  const offsets = Array.from({ length: recordCount }, (_, index) =>
    readBigEndianUint32(view, 78 + index * 8)
  );
  offsets.push(buffer.byteLength);

  const firstRecordOffset = offsets[0];
  if (firstRecordOffset + 16 > buffer.byteLength) throw new Error('mobi_unsupported');

  const compression = readBigEndianUint16(view, firstRecordOffset);
  const textLength = readBigEndianUint32(view, firstRecordOffset + 4);
  const textRecordCount = readBigEndianUint16(view, firstRecordOffset + 8);
  const encryptionType = readBigEndianUint16(view, firstRecordOffset + 12);

  if (encryptionType !== 0) throw new Error('mobi_unsupported');
  if (compression !== 1 && compression !== 2) throw new Error('mobi_unsupported');

  const mobiHeaderOffset = firstRecordOffset + 16;
  let encoding = 1252;

  if (mobiHeaderOffset + 16 <= buffer.byteLength) {
    const marker = new TextDecoder('ascii').decode(new Uint8Array(buffer, mobiHeaderOffset, 4));
    if (marker === 'MOBI') {
      encoding = readBigEndianUint32(view, mobiHeaderOffset + 12);
    }
  }

  const textChunks: Uint8Array[] = [];
  const maxTextRecords = Math.min(textRecordCount, recordCount - 1);

  for (let recordIndex = 1; recordIndex <= maxTextRecords; recordIndex += 1) {
    const start = offsets[recordIndex];
    const end = offsets[recordIndex + 1];
    if (start >= end || end > buffer.byteLength) continue;

    const record = new Uint8Array(buffer, start, end - start);
    textChunks.push(compression === 2 ? decompressPalmDoc(record) : record);
  }

  const bytes = concatBytes(textChunks, textLength || undefined);
  const title = decodePalmDatabaseName(buffer) || filename;
  const text = normalizeText(decodeMobiText(bytes, encoding).replace(/\0/g, ''));
  if (!text) return [];

  return /<[a-z][\s\S]*>/i.test(text)
    ? htmlToBlocks(title, text)
    : textToBlocks(title, text);
}

async function extractExcelBlocks(filename: string, buffer: ArrayBuffer): Promise<TextBlock[]> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const blocks: TextBlock[] = [{ kind: 'title', text: filename }];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: '',
    });

    blocks.push({ kind: 'heading', text: sheetName });

    if (rows.length === 0) {
      blocks.push({ kind: 'body', text: '(empty sheet)' });
      continue;
    }

    const columnCount = Math.min(8, Math.max(...rows.map((row) => row.length)));
    const clippedRows = rows.slice(0, 600);
    const widths = Array.from({ length: columnCount }, (_, columnIndex) => {
      const width = Math.max(
        4,
        ...clippedRows.map((row) => String(row[columnIndex] ?? '').slice(0, 28).length)
      );
      return Math.min(28, width);
    });
    const lines = clippedRows.map((row) =>
      widths
        .map((width, columnIndex) => String(row[columnIndex] ?? '').replace(/\s+/g, ' ').slice(0, width).padEnd(width))
        .join('  ')
        .trimEnd()
    );

    if (rows.length > clippedRows.length) {
      lines.push(`... ${rows.length - clippedRows.length} more rows`);
    }

    blocks.push({ kind: 'mono', text: lines.join('\n') });
  }

  return blocks;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed.'));
    }, 'image/png');
  });
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function createPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytesToArrayBuffer(bytes)], { type: PDF_MIME_TYPE });
}

function validatePdfFile(file: File): PdfOperationError | null {
  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (!isPdfFile(file)) return { ok: false, code: 'unsupported_input', detail: file.type || file.name };
  if (file.size > MAX_PDF_INPUT_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_PDF_INPUT_FILE_SIZE),
    };
  }
  return null;
}

async function addCanvasPage(pdf: PDFDocument, canvasPage: CanvasPage): Promise<void> {
  const blob = await canvasToBlob(canvasPage.canvas);
  const image = await pdf.embedPng(await blob.arrayBuffer());
  const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  page.drawImage(image, { x: 0, y: 0, width: A4_WIDTH, height: A4_HEIGHT });
}

async function createPdfFromBlocks(blocks: TextBlock[]): Promise<Blob> {
  if (blocks.length === 0) throw new Error('No document content.');

  const pdf = await PDFDocument.create();
  let page = createPage();
  let renderedBlocks = 0;

  async function ensureSpace(height: number) {
    if (page.cursorY + height <= CANVAS_HEIGHT - CANVAS_MARGIN) return;
    await addCanvasPage(pdf, page);
    page = createPage();
  }

  for (const block of blocks) {
    const style = getBlockStyle(block.kind);
    const spacing = block.kind === 'spacer' ? style.lineHeight : style.lineHeight + style.gapAfter;

    if (block.kind === 'spacer') {
      await ensureSpace(spacing);
      page.cursorY += spacing;
      continue;
    }

    page.context.font = style.font;
    page.context.fillStyle = style.fill;

    const lines = block.text
      .split('\n')
      .flatMap((line) => wrapLine(page.context, line, CONTENT_WIDTH));

    for (const line of lines) {
      await ensureSpace(style.lineHeight);
      page.context.fillText(line, CANVAS_MARGIN, page.cursorY);
      page.cursorY += style.lineHeight;
    }

    page.cursorY += style.gapAfter;
    renderedBlocks += 1;
  }

  if (renderedBlocks === 0) throw new Error('No document content.');

  await addCanvasPage(pdf, page);
  const bytes = await pdf.save();
  return createPdfBlob(bytes);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed.'));
    };
    image.src = url;
  });
}

async function embedWebpImage(pdf: PDFDocument, file: File): Promise<PDFImage> {
  const image = await loadImage(file);
  const maxSide = 3000;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context is unavailable.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToBlob(canvas);
  return pdf.embedPng(await blob.arrayBuffer());
}

async function createPdfFromImage(file: File): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const bytes = await file.arrayBuffer();
  const mimeType = file.type || '';
  const image = mimeType === 'image/jpeg' || /\.(jpe?g)$/i.test(file.name)
    ? await pdf.embedJpg(bytes)
    : mimeType === 'image/png' || /\.png$/i.test(file.name)
      ? await pdf.embedPng(bytes)
      : await embedWebpImage(pdf, file);

  const landscape = image.width > image.height;
  const pageWidth = landscape ? A4_HEIGHT : A4_WIDTH;
  const pageHeight = landscape ? A4_WIDTH : A4_HEIGHT;
  const margin = 36;
  const scale = Math.min((pageWidth - margin * 2) / image.width, (pageHeight - margin * 2) / image.height, 1);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const page = pdf.addPage([pageWidth, pageHeight]);

  page.drawImage(image, {
    x: (pageWidth - drawWidth) / 2,
    y: (pageHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });

  const output = await pdf.save();
  return createPdfBlob(output);
}

async function readFileText(file: File): Promise<string> {
  return new TextDecoder('utf-8').decode(await file.arrayBuffer());
}

async function createPdfBlobForFile(file: File): Promise<Blob> {
  const kind = inferPdfInputKind(file);

  switch (kind) {
    case 'image':
      return createPdfFromImage(file);
    case 'text':
      return createPdfFromBlocks(textToBlocks(file.name, await readFileText(file)));
    case 'markdown':
      return createPdfFromBlocks(markdownToBlocks(file.name, await readFileText(file)));
    case 'html':
      return createPdfFromBlocks(htmlToBlocks(file.name, await readFileText(file)));
    case 'epub':
      return createPdfFromBlocks(extractEpubBlocks(file.name, await file.arrayBuffer()));
    case 'mobi':
      return createPdfFromBlocks(extractMobiBlocks(file.name, await file.arrayBuffer()));
    case 'word':
      return createPdfFromBlocks(extractDocxBlocks(file.name, await file.arrayBuffer()));
    case 'excel':
      return createPdfFromBlocks(await extractExcelBlocks(file.name, await file.arrayBuffer()));
    case 'powerpoint':
      return createPdfFromBlocks(extractPptxBlocks(file.name, await file.arrayBuffer()));
    default:
      throw new Error('Unsupported input.');
  }
}

export async function convertFileToPdf(file: File): Promise<PdfConversionOutcome> {
  if (file.size === 0) return { ok: false, code: 'empty_file' };
  if (file.size > MAX_PDF_INPUT_FILE_SIZE) {
    return {
      ok: false,
      code: 'file_too_large',
      maxSize: formatFileSize(MAX_PDF_INPUT_FILE_SIZE),
    };
  }

  const inputKind = inferPdfInputKind(file);
  if (inputKind === 'legacy-office') return { ok: false, code: 'legacy_office' };
  if (inputKind === 'unsupported') {
    return { ok: false, code: 'unsupported_input', detail: file.type || file.name };
  }

  const startedAt = now();

  try {
    const blob = await createPdfBlobForFile(file);
    const pageCount = await PDFDocument.load(await blob.arrayBuffer()).then((pdf) => pdf.getPageCount());

    return {
      ok: true,
      blob,
      filename: createPdfOutputFilename(file.name),
      inputKind,
      pageCount,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(now() - startedAt),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/No document content|empty/i.test(message)) return { ok: false, code: 'empty_document' };
    if (/mobi_unsupported/i.test(message)) return { ok: false, code: 'mobi_unsupported' };
    if (/load/i.test(message)) return { ok: false, code: 'load_failed' };
    return { ok: false, code: 'render_failed', detail: message };
  }
}

export async function inspectPdfFile(file: File): Promise<PdfFileInspectionOutcome> {
  const validationError = validatePdfFile(file);
  if (validationError) return validationError;

  try {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    return {
      ok: true,
      filename: file.name,
      pageCount: pdf.getPageCount(),
      size: file.size,
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

export async function mergePdfFiles(files: File[], filename = 'merged.pdf'): Promise<PdfOperationOutcome> {
  if (files.length === 0) return { ok: false, code: 'empty_selection' };

  const startedAt = now();
  const output = await PDFDocument.create();

  try {
    for (const file of files) {
      const validationError = validatePdfFile(file);
      if (validationError) return validationError;

      const source = await PDFDocument.load(await file.arrayBuffer());
      const pageIndexes = source.getPageIndices();
      const pages = await output.copyPages(source, pageIndexes);
      pages.forEach((page) => output.addPage(page));
    }

    if (output.getPageCount() === 0) return { ok: false, code: 'empty_selection' };

    const bytes = await output.save();
    const blob = createPdfBlob(bytes);

    return {
      ok: true,
      blob,
      filename,
      pageCount: output.getPageCount(),
      outputSize: blob.size,
      durationMs: Math.round(now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

export async function extractPdfPages(
  file: File,
  pages: number[],
  filename = createPdfDerivedFilename(file.name, 'extracted')
): Promise<PdfOperationOutcome> {
  const validationError = validatePdfFile(file);
  if (validationError) return validationError;
  if (pages.length === 0) return { ok: false, code: 'empty_selection' };

  const startedAt = now();

  try {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(source, pages);
    copiedPages.forEach((page) => output.addPage(page));

    const bytes = await output.save();
    const blob = createPdfBlob(bytes);

    return {
      ok: true,
      blob,
      filename,
      pageCount: output.getPageCount(),
      outputSize: blob.size,
      durationMs: Math.round(now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

export async function splitPdfFile(file: File, groups: PdfPageGroup[]): Promise<PdfSplitOutcome> {
  const validationError = validatePdfFile(file);
  if (validationError) return validationError;
  if (groups.length === 0) return { ok: false, code: 'empty_selection' };

  const startedAt = now();

  try {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const files: PdfSplitFile[] = [];

    for (const [index, group] of groups.entries()) {
      const output = await PDFDocument.create();
      const copiedPages = await output.copyPages(source, group.pages);
      copiedPages.forEach((page) => output.addPage(page));
      const bytes = await output.save();
      const blob = createPdfBlob(bytes);
      const safeLabel = group.label.replace(/[^\d,-]+/g, '_').replace(/_+/g, '_') || String(index + 1);

      files.push({
        blob,
        filename: createPdfDerivedFilename(file.name, `part-${index + 1}-${safeLabel}`),
        pageCount: output.getPageCount(),
        label: group.label,
      });
    }

    return { ok: true, files, durationMs: Math.round(now() - startedAt) };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}

export async function organizePdfPages(
  file: File,
  entries: PdfOrganizeEntry[],
  filename = createPdfDerivedFilename(file.name, 'organized')
): Promise<PdfOperationOutcome> {
  const validationError = validatePdfFile(file);
  if (validationError) return validationError;
  if (entries.length === 0) return { ok: false, code: 'empty_selection' };

  const startedAt = now();

  try {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(
      source,
      entries.map((entry) => entry.sourcePageIndex)
    );
    copiedPages.forEach((page) => output.addPage(page));

    const bytes = await output.save();
    const blob = createPdfBlob(bytes);

    return {
      ok: true,
      blob,
      filename,
      pageCount: output.getPageCount(),
      outputSize: blob.size,
      durationMs: Math.round(now() - startedAt),
    };
  } catch {
    return { ok: false, code: 'load_failed' };
  }
}
