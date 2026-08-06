import type { PDFDocument } from 'pdf-lib';

const PDF_MIME_TYPE = 'application/pdf';
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const RENDER_WIDTH = 794;
const RENDER_SCALE = 1.5;

type PdfLibModule = typeof import('pdf-lib');

let pdfLibPromise: Promise<PdfLibModule> | null = null;

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
    if (image.complete) {
      try {
        await image.decode();
      } catch {
        // Broken or cross-origin images should not prevent the rest of the document rendering.
      }
      return;
    }

    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 5000);
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

async function renderElementPage(
  element: HTMLElement,
  options?: { y?: number; width?: number; height?: number }
): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas');
  const width = options?.width ?? Math.ceil(element.scrollWidth);
  const height = options?.height ?? Math.ceil(element.scrollHeight);

  return html2canvas(element, {
    x: 0,
    y: options?.y ?? 0,
    width,
    height,
    scale: RENDER_SCALE,
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: false,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: Math.max(RENDER_WIDTH, width),
    windowHeight: Math.max(1123, height),
  });
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
  const aspectRatio = canvas.height / canvas.width;
  const pageWidth = aspectRatio >= 1 ? A4_WIDTH : A4_HEIGHT;
  const pageHeight = pageWidth * aspectRatio;
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

    await waitForAssets(bodyContainer, document);
    const pages = Array.from(bodyContainer.querySelectorAll<HTMLElement>('section.docx'));
    const renderTargets = pages.length > 0 ? pages : [bodyContainer];
    const canvases: HTMLCanvasElement[] = [];

    for (const page of renderTargets) {
      canvases.push(await renderElementPage(page));
    }

    return createPdfFromCanvases(canvases);
  } finally {
    host.remove();
  }
}
