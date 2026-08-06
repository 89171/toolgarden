import type { PDFDocument } from 'pdf-lib';
import type { CellObject, Range, WorkSheet } from 'xlsx';

const PDF_MIME_TYPE = 'application/pdf';
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const RENDER_WIDTH = 794;
const RENDER_SCALE = 1.5;
const MAX_EXCEL_ROWS = 2000;
const MAX_EXCEL_COLUMNS = 50;
const PDF_POINTS_PER_CSS_PIXEL = 72 / 96;

interface CanvasPdfSize {
  height: number;
  width: number;
}

interface RenderElementOptions {
  foreignObjectRendering?: boolean;
  height?: number;
  preserveCssPageSize?: boolean;
  useElementBounds?: boolean;
  width?: number;
  y?: number;
}

type PdfLibModule = typeof import('pdf-lib');

let pdfLibPromise: Promise<PdfLibModule> | null = null;
const canvasPdfSizes = new WeakMap<HTMLCanvasElement, CanvasPdfSize>();

function loadPdfLib(): Promise<PdfLibModule> {
  pdfLibPromise ??= import('pdf-lib');
  return pdfLibPromise;
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function createPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytesToArrayBuffer(bytes)], { type: PDF_MIME_TYPE });
}

function createHiddenFrame(): HTMLIFrameElement {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  Object.assign(frame.style, {
    position: 'fixed',
    top: '0',
    left: '-100000px',
    width: `${RENDER_WIDTH}px`,
    height: '1123px',
    border: '0',
    pointerEvents: 'none',
  });
  document.body.appendChild(frame);

  const frameDocument = frame.contentDocument;
  if (!frameDocument) {
    frame.remove();
    throw new Error('Unable to create the document renderer.');
  }

  frameDocument.open();
  frameDocument.write('<!doctype html><html><head></head><body></body></html>');
  frameDocument.close();
  return frame;
}

function createHiddenHost(): HTMLDivElement {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '-100000px',
    width: `${RENDER_WIDTH}px`,
    minHeight: '1123px',
    background: '#ffffff',
    pointerEvents: 'none',
  });
  document.body.appendChild(host);
  return host;
}

async function waitForAssets(root: ParentNode, ownerDocument: Document): Promise<void> {
  const fonts = ownerDocument.fonts;
  if (fonts) {
    await Promise.race([
      fonts.ready,
      new Promise<void>((resolve) => window.setTimeout(resolve, 3000)),
    ]);
  }

  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map(async (image) => {
    image.loading = 'eager';
    if (image.complete && image.naturalWidth > 0) {
      try {
        await image.decode();
      } catch {
        // Broken or cross-origin images should not prevent the rest of the document rendering.
      }
      return;
    }

    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 15000);
      const finish = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    });
  }));

  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Image encoding failed.'));
    reader.readAsDataURL(blob);
  });
}

async function inlineImageUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image load failed: ${response.status}`);
  return blobToDataUrl(await response.blob());
}

async function inlineDocumentImages(root: ParentNode): Promise<void> {
  const htmlImages = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  await Promise.all(htmlImages.map(async (image) => {
    image.loading = 'eager';
    image.removeAttribute('srcset');
    const source = image.currentSrc || image.src;
    if (!source) return;

    try {
      image.src = await inlineImageUrl(source);
      await image.decode();
    } catch {
      // Keep the original source so html2canvas can still attempt its own decoder.
    }
  }));

  const svgImages = Array.from(root.querySelectorAll<SVGImageElement>('svg image'));
  await Promise.all(svgImages.map(async (image) => {
    const source = image.getAttribute('href') ?? image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ?? '';
    if (!source) return;

    try {
      const dataUrl = await inlineImageUrl(source);
      image.setAttribute('href', dataUrl);
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataUrl);
    } catch {
      // Keep the original source so html2canvas can still attempt its own decoder.
    }
  }));
}

async function renderElementPage(
  element: HTMLElement,
  options?: RenderElementOptions
): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas');
  const bounds = element.getBoundingClientRect();
  const width = options?.width ?? Math.ceil(options?.useElementBounds ? bounds.width : element.scrollWidth);
  const height = options?.height ?? Math.ceil(options?.useElementBounds ? bounds.height : element.scrollHeight);

  const canvas = await html2canvas(element, {
    x: 0,
    y: options?.y ?? 0,
    width,
    height,
    scale: RENDER_SCALE,
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: options?.foreignObjectRendering ?? false,
    imageTimeout: 30000,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: Math.max(RENDER_WIDTH, width),
    windowHeight: Math.max(1123, height),
    onclone: (_ownerDocument, clonedElement) => {
      const sourceImages = Array.from(element.querySelectorAll<HTMLImageElement>('img'));
      const clonedImages = Array.from(clonedElement.querySelectorAll<HTMLImageElement>('img'));
      clonedImages.forEach((image, index) => {
        const source = sourceImages[index];
        if (!source) return;
        image.loading = 'eager';
        image.removeAttribute('srcset');
        image.src = source.currentSrc || source.src;
      });

      const sourceSvgImages = Array.from(element.querySelectorAll<SVGImageElement>('svg image'));
      const clonedSvgImages = Array.from(clonedElement.querySelectorAll<SVGImageElement>('svg image'));
      clonedSvgImages.forEach((image, index) => {
        const source = sourceSvgImages[index];
        const href = source?.getAttribute('href') ?? source?.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (href) image.setAttribute('href', href);
      });
    },
  });

  if (options?.preserveCssPageSize) {
    canvasPdfSizes.set(canvas, {
      width: bounds.width * PDF_POINTS_PER_CSS_PIXEL,
      height: bounds.height * PDF_POINTS_PER_CSS_PIXEL,
    });
  }
  return canvas;
}

async function renderPaginatedElement(element: HTMLElement): Promise<HTMLCanvasElement[]> {
  const width = Math.max(1, Math.ceil(element.scrollWidth));
  const contentHeight = Math.max(1, Math.ceil(element.scrollHeight));
  const pageHeight = Math.round(width * (A4_HEIGHT / A4_WIDTH));
  const pageCount = Math.max(1, Math.ceil(contentHeight / pageHeight));
  const canvases: HTMLCanvasElement[] = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    canvases.push(await renderElementPage(element, {
      y: pageIndex * pageHeight,
      width,
      height: pageHeight,
    }));
  }

  return canvases;
}

async function addCanvasToPdf(pdf: PDFDocument, canvas: HTMLCanvasElement): Promise<void> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Canvas export failed.'));
    }, 'image/png');
  });
  const image = await pdf.embedPng(await blob.arrayBuffer());
  const preservedSize = canvasPdfSizes.get(canvas);
  const aspectRatio = canvas.height / canvas.width;
  const pageWidth = preservedSize?.width ?? (aspectRatio >= 1 ? A4_WIDTH : A4_HEIGHT);
  const pageHeight = preservedSize?.height ?? pageWidth * aspectRatio;
  const page = pdf.addPage([pageWidth, pageHeight]);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });
}

async function createPdfFromCanvases(canvases: HTMLCanvasElement[]): Promise<Blob> {
  if (canvases.length === 0) throw new Error('No document content.');

  const { PDFDocument } = await loadPdfLib();
  const pdf = await PDFDocument.create();
  for (const canvas of canvases) await addCanvasToPdf(pdf, canvas);
  return createPdfBlob(await pdf.save());
}

const HTML_BASE_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; }
  body { font-family: Arial, "Helvetica Neue", sans-serif; font-size: 16px; line-height: 1.55; }
  .pdf-html-document {
    width: ${RENDER_WIDTH}px;
    min-height: 1123px;
    padding: 56px;
    overflow-wrap: anywhere;
    background: #ffffff;
  }
  .pdf-html-document h1, .pdf-html-document h2, .pdf-html-document h3,
  .pdf-html-document h4, .pdf-html-document h5, .pdf-html-document h6 {
    margin: 1.25em 0 0.55em;
    line-height: 1.25;
    break-after: avoid;
  }
  .pdf-html-document h1:first-child, .pdf-html-document h2:first-child,
  .pdf-html-document h3:first-child { margin-top: 0; }
  .pdf-html-document p { margin: 0 0 0.9em; }
  .pdf-html-document img, .pdf-html-document svg, .pdf-html-document canvas {
    max-width: 100%;
    height: auto;
  }
  .pdf-html-document table {
    width: 100%;
    margin: 0 0 1em;
    border: 1px solid #6b7280;
    border-collapse: collapse;
    table-layout: auto;
  }
  .pdf-html-document th, .pdf-html-document td {
    padding: 7px 9px;
    border: 1px solid #6b7280;
    text-align: left;
    vertical-align: top;
    overflow-wrap: anywhere;
  }
  .pdf-html-document th { background: #f3f4f6; font-weight: 700; }
  .pdf-html-document tr { break-inside: avoid; }
  .pdf-html-document pre {
    margin: 0 0 1em;
    padding: 14px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #f6f8fa;
    font: 13px/1.55 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .pdf-html-document code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  }
  .pdf-html-document blockquote {
    margin: 0 0 1em;
    padding-left: 1em;
    border-left: 4px solid #d1d5db;
    color: #4b5563;
  }
  .pdf-html-document ul, .pdf-html-document ol { margin: 0 0 1em; padding-left: 2em; }
  .pdf-html-document a { color: #1d4ed8; text-decoration: underline; }
`;

function sanitizeHtml(sourceDocument: Document): void {
  sourceDocument
    .querySelectorAll('script, noscript, template, iframe, object, embed, title, meta, link')
    .forEach((element) => element.remove());

  sourceDocument.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') {
        element.removeAttribute(attribute.name);
        continue;
      }
      if ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    }
  });
}

function appendStyle(ownerDocument: Document, css: string): void {
  const style = ownerDocument.createElement('style');
  style.textContent = css;
  ownerDocument.head.appendChild(style);
}

function prepareHtmlFrame(sourceDocument: Document): { frame: HTMLIFrameElement; root: HTMLDivElement } {
  const userStyles = Array.from(sourceDocument.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .filter(Boolean);
  sourceDocument.querySelectorAll('style').forEach((style) => style.remove());
  sanitizeHtml(sourceDocument);

  const frame = createHiddenFrame();
  const frameDocument = frame.contentDocument;
  if (!frameDocument) {
    frame.remove();
    throw new Error('Unable to create the document renderer.');
  }

  appendStyle(frameDocument, HTML_BASE_STYLES);
  userStyles.forEach((css) => appendStyle(frameDocument, css));

  const root = frameDocument.createElement('div');
  root.className = 'pdf-html-document';
  for (const child of Array.from(sourceDocument.body.childNodes)) {
    root.appendChild(frameDocument.importNode(child, true));
  }
  frameDocument.body.appendChild(root);
  return { frame, root };
}

export async function createPdfFromHtmlDocument(html: string): Promise<Blob> {
  const sourceDocument = new DOMParser().parseFromString(html, 'text/html');
  if (!sourceDocument.body.textContent?.trim() && !sourceDocument.body.querySelector('img, svg, table, pre')) {
    throw new Error('No document content.');
  }

  const { frame, root } = prepareHtmlFrame(sourceDocument);
  try {
    await waitForAssets(root, frame.contentDocument ?? document);
    return createPdfFromCanvases(await renderPaginatedElement(root));
  } finally {
    frame.remove();
  }
}

function buildCsvDocument(rows: unknown[][]): Document {
  const sourceDocument = new DOMParser().parseFromString('<!doctype html><html><body></body></html>', 'text/html');
  const table = sourceDocument.createElement('table');
  const [headers, ...bodyRows] = rows;

  if (headers) {
    const head = sourceDocument.createElement('thead');
    const row = sourceDocument.createElement('tr');
    headers.forEach((value) => {
      const cell = sourceDocument.createElement('th');
      cell.textContent = String(value ?? '');
      row.appendChild(cell);
    });
    head.appendChild(row);
    table.appendChild(head);
  }

  const body = sourceDocument.createElement('tbody');
  bodyRows.forEach((values) => {
    const row = sourceDocument.createElement('tr');
    values.forEach((value) => {
      const cell = sourceDocument.createElement('td');
      cell.textContent = String(value ?? '');
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
  table.appendChild(body);
  sourceDocument.body.appendChild(table);
  return sourceDocument;
}

type XlsxModule = typeof import('xlsx');

interface ExcelCellStyle {
  alignment?: {
    horizontal?: string;
    vertical?: string;
    wrapText?: boolean;
    textRotation?: number;
  };
  bgColor?: { rgb?: string };
  fgColor?: { rgb?: string };
  fill?: {
    bgColor?: { rgb?: string };
    fgColor?: { rgb?: string };
  };
  font?: {
    bold?: boolean;
    color?: { rgb?: string };
    italic?: boolean;
    name?: string;
    sz?: number;
    underline?: boolean;
  };
  patternType?: string;
}

function excelRgbToCss(rgb?: string): string | null {
  if (!rgb) return null;
  const normalized = rgb.replace(/^#/, '').slice(-6);
  return /^[0-9a-f]{6}$/i.test(normalized) ? `#${normalized}` : null;
}

function applyExcelCellStyle(element: HTMLTableCellElement, cell?: CellObject): void {
  const style = cell?.s as ExcelCellStyle | undefined;
  if (!style) return;

  const fill = excelRgbToCss(style.fill?.fgColor?.rgb ?? style.fgColor?.rgb)
    ?? excelRgbToCss(style.fill?.bgColor?.rgb ?? style.bgColor?.rgb);
  if (fill && style.patternType !== 'none') element.style.backgroundColor = fill;

  const fontColor = excelRgbToCss(style.font?.color?.rgb);
  if (fontColor) element.style.color = fontColor;
  if (style.font?.bold) element.style.fontWeight = '700';
  if (style.font?.italic) element.style.fontStyle = 'italic';
  if (style.font?.underline) element.style.textDecoration = 'underline';
  if (style.font?.name) element.style.fontFamily = style.font.name;
  if (style.font?.sz) element.style.fontSize = `${style.font.sz}pt`;

  const horizontal = style.alignment?.horizontal;
  if (horizontal === 'center' || horizontal === 'right' || horizontal === 'left' || horizontal === 'justify') {
    element.style.textAlign = horizontal;
  }
  const vertical = style.alignment?.vertical;
  if (vertical === 'top' || vertical === 'middle' || vertical === 'bottom') {
    element.style.verticalAlign = vertical;
  }
  if (style.alignment?.wrapText === false) element.style.whiteSpace = 'nowrap';
  if (style.alignment?.textRotation) {
    element.style.writingMode = 'vertical-rl';
  }
}

function createMergeMaps(merges: Range[], renderedRange: Range): {
  covered: Set<string>;
  starts: Map<string, Range>;
} {
  const covered = new Set<string>();
  const starts = new Map<string, Range>();

  for (const merge of merges) {
    if (
      merge.e.r < renderedRange.s.r || merge.s.r > renderedRange.e.r
      || merge.e.c < renderedRange.s.c || merge.s.c > renderedRange.e.c
    ) continue;

    const clipped: Range = {
      s: {
        r: Math.max(merge.s.r, renderedRange.s.r),
        c: Math.max(merge.s.c, renderedRange.s.c),
      },
      e: {
        r: Math.min(merge.e.r, renderedRange.e.r),
        c: Math.min(merge.e.c, renderedRange.e.c),
      },
    };
    const startKey = `${clipped.s.r}:${clipped.s.c}`;
    starts.set(startKey, clipped);

    for (let rowIndex = clipped.s.r; rowIndex <= clipped.e.r; rowIndex += 1) {
      for (let columnIndex = clipped.s.c; columnIndex <= clipped.e.c; columnIndex += 1) {
        const key = `${rowIndex}:${columnIndex}`;
        if (key !== startKey) covered.add(key);
      }
    }
  }

  return { covered, starts };
}

function getExcelCellText(cell: CellObject | undefined, XLSX: XlsxModule): string {
  if (!cell) return '';
  if (cell.w != null) return cell.w;
  try {
    return XLSX.utils.format_cell(cell);
  } catch {
    return cell.v == null ? '' : String(cell.v);
  }
}

function buildExcelSheetDocument(sheetName: string, sheet: WorkSheet, XLSX: XlsxModule): Document {
  const sourceDocument = new DOMParser().parseFromString('<!doctype html><html><body></body></html>', 'text/html');
  const section = sourceDocument.createElement('section');
  section.className = 'pdf-excel-sheet';
  const heading = sourceDocument.createElement('h1');
  heading.textContent = sheetName;
  section.appendChild(heading);

  const reference = sheet['!ref'];
  if (!reference) {
    sourceDocument.body.appendChild(section);
    return sourceDocument;
  }

  const sourceRange = XLSX.utils.decode_range(reference);
  const renderedRange: Range = {
    s: sourceRange.s,
    e: {
      r: Math.min(sourceRange.e.r, sourceRange.s.r + MAX_EXCEL_ROWS - 1),
      c: Math.min(sourceRange.e.c, sourceRange.s.c + MAX_EXCEL_COLUMNS - 1),
    },
  };
  const table = sourceDocument.createElement('table');
  table.className = 'pdf-excel-table';
  const columnGroup = sourceDocument.createElement('colgroup');

  for (let columnIndex = renderedRange.s.c; columnIndex <= renderedRange.e.c; columnIndex += 1) {
    const column = sourceDocument.createElement('col');
    const columnInfo = sheet['!cols']?.[columnIndex];
    const width = columnInfo?.wpx ?? (columnInfo?.wch ? columnInfo.wch * 8 : undefined);
    if (width) column.style.width = `${Math.min(240, Math.max(28, width))}px`;
    columnGroup.appendChild(column);
  }
  table.appendChild(columnGroup);

  const body = sourceDocument.createElement('tbody');
  const { covered, starts } = createMergeMaps(sheet['!merges'] ?? [], renderedRange);

  for (let rowIndex = renderedRange.s.r; rowIndex <= renderedRange.e.r; rowIndex += 1) {
    const row = sourceDocument.createElement('tr');
    const rowInfo = sheet['!rows']?.[rowIndex];
    const rowHeight = rowInfo?.hpx ?? (rowInfo?.hpt ? rowInfo.hpt * (96 / 72) : undefined);
    if (rowHeight) row.style.height = `${Math.max(18, rowHeight)}px`;

    for (let columnIndex = renderedRange.s.c; columnIndex <= renderedRange.e.c; columnIndex += 1) {
      const key = `${rowIndex}:${columnIndex}`;
      if (covered.has(key)) continue;

      const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })] as CellObject | undefined;
      const element = sourceDocument.createElement('td');
      element.textContent = getExcelCellText(cell, XLSX);
      applyExcelCellStyle(element, cell);

      const merge = starts.get(key);
      if (merge) {
        element.rowSpan = merge.e.r - merge.s.r + 1;
        element.colSpan = merge.e.c - merge.s.c + 1;
      }
      row.appendChild(element);
    }
    body.appendChild(row);
  }

  table.appendChild(body);
  section.appendChild(table);

  if (renderedRange.e.r < sourceRange.e.r || renderedRange.e.c < sourceRange.e.c) {
    const note = sourceDocument.createElement('p');
    note.className = 'pdf-sheet-limit';
    note.textContent = `Rendered the first ${MAX_EXCEL_ROWS} rows and ${MAX_EXCEL_COLUMNS} columns of this sheet.`;
    section.appendChild(note);
  }

  const style = sourceDocument.createElement('style');
  style.textContent = `
    .pdf-excel-sheet > h1 { margin-bottom: 16px; font-size: 22px; }
    .pdf-excel-table { font-size: 12px; line-height: 1.35; }
    .pdf-excel-table td { min-width: 28px; white-space: pre-wrap; }
    .pdf-sheet-limit { margin-top: 12px; color: #6b7280; font-size: 11px; }
  `;
  sourceDocument.head.appendChild(style);
  sourceDocument.body.appendChild(section);
  return sourceDocument;
}

export async function createPdfFromCsvDocument(text: string): Promise<Blob> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(text, { type: 'string', raw: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) throw new Error('No document content.');

  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    blankrows: false,
    defval: '',
    raw: false,
  });
  if (rows.length === 0) throw new Error('No document content.');

  const sourceDocument = buildCsvDocument(rows);
  const { frame, root } = prepareHtmlFrame(sourceDocument);
  try {
    await waitForAssets(root, frame.contentDocument ?? document);
    return createPdfFromCanvases(await renderPaginatedElement(root));
  } finally {
    frame.remove();
  }
}

export async function createPdfFromExcelDocument(buffer: ArrayBuffer): Promise<Blob> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellStyles: true,
  });
  const canvases: HTMLCanvasElement[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const sourceDocument = buildExcelSheetDocument(sheetName, sheet, XLSX);
    const { frame, root } = prepareHtmlFrame(sourceDocument);
    try {
      await waitForAssets(root, frame.contentDocument ?? document);
      canvases.push(...await renderPaginatedElement(root));
    } finally {
      frame.remove();
    }
  }

  return createPdfFromCanvases(canvases);
}

export async function createPdfFromDocxDocument(buffer: ArrayBuffer): Promise<Blob> {
  const host = createHiddenHost();
  const styleContainer = document.createElement('div');
  const bodyContainer = document.createElement('div');
  host.append(styleContainer, bodyContainer);

  try {
    const { renderAsync } = await import('docx-preview');
    await renderAsync(buffer, bodyContainer, styleContainer, {
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      renderComments: false,
      renderAltChunks: true,
    });

    const overrideStyles = document.createElement('style');
    overrideStyles.textContent = `
      .docx-wrapper { padding: 0 !important; background: #ffffff !important; }
      .docx-wrapper > section.docx {
        margin: 0 !important;
        box-shadow: none !important;
        background: #ffffff !important;
      }
      .docx-wrapper > section.docx + section.docx { margin-top: 24px !important; }
      section.docx img { max-width: 100%; }
    `;
    styleContainer.appendChild(overrideStyles);

    await inlineDocumentImages(bodyContainer);
    await waitForAssets(bodyContainer, document);
    const pages = Array.from(bodyContainer.querySelectorAll<HTMLElement>('section.docx'));
    const renderTargets = pages.length > 0 ? pages : [bodyContainer];
    const canvases: HTMLCanvasElement[] = [];

    for (const page of renderTargets) {
      canvases.push(await renderElementPage(page, {
        preserveCssPageSize: true,
        useElementBounds: true,
      }));
    }

    return createPdfFromCanvases(canvases);
  } finally {
    host.remove();
  }
}
