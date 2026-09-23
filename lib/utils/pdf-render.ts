export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  /** 仅在 extractText 时返回：页面上的文字块及其在画布像素坐标中的位置 */
  textItems?: PdfTextItem[];
}

export interface PdfTextItem {
  /** 未做归一化的原文，必须与内容流里的字节一一对应，改写时用它定位 */
  text: string;
  /** 同一页内相同 text 的第几次出现，0-based */
  occurrence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type PdfjsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjsPromise: Promise<PdfjsModule> | null = null;

function loadPdfjs(): Promise<PdfjsModule> {
  pdfjsPromise ??= (async () => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    return pdfjs;
  })();
  return pdfjsPromise;
}

/** 渲染单页，用于「改写后立刻看结果」这类只需要重画一页的场景。 */
export async function renderPdfPageImage(
  source: Uint8Array,
  pageNumber: number,
  scale: number
): Promise<string | null> {
  const pdfjs = await loadPdfjs();
  // pdf.js 会接管传进去的 buffer，所以每次都给它一份副本。
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(source), useSystemFonts: true }).promise;
  if (pageNumber < 1 || pageNumber > pdf.numPages) return null;

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas.toDataURL('image/png');
}

export async function renderPdfPages(
  file: File,
  options: {
    format: 'png' | 'jpeg';
    scale: number;
    /** 额外抽取文字块位置，用于「改原文」这类需要点选原有文字的场景 */
    extractText?: boolean;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<RenderedPage[]> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages: RenderedPage[] = [];

  const mime = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: options.scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    pages.push({
      pageNumber,
      dataUrl: canvas.toDataURL(mime, options.format === 'jpeg' ? 0.92 : undefined),
      width: viewport.width,
      height: viewport.height,
      ...(options.extractText
        ? { textItems: await extractTextItems(pdfjs, page, viewport, options.scale) }
        : {}),
    });
    options.onProgress?.(pageNumber, pdf.numPages);
  }

  return pages;
}

export async function downloadPagesAsZip(pages: RenderedPage[], baseName: string, ext: 'png' | 'jpg'): Promise<void> {
  const { zipSync } = await import('fflate');
  const files: Record<string, Uint8Array> = {};
  for (const page of pages) {
    const base64 = page.dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    files[`${baseName}-page-${String(page.pageNumber).padStart(3, '0')}.${ext}`] = bytes;
  }
  const zipped = zipSync(files);
  const blob = new Blob([zipped as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-pages.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

async function extractTextItems(
  pdfjs: PdfjsModule,
  page: Awaited<ReturnType<Awaited<ReturnType<PdfjsModule['getDocument']>['promise']>['getPage']>>,
  viewport: { transform: number[] },
  scale: number
): Promise<PdfTextItem[]> {
  // disableNormalization: 归一化会合并空白、拆连字，改写时就对不上内容流里的字节了。
  const content = await page.getTextContent({ disableNormalization: true });
  const seen = new Map<string, number>();
  const items: PdfTextItem[] = [];

  for (const item of content.items) {
    if (!('str' in item) || item.str.length === 0) continue;
    const transform = pdfjs.Util.transform(viewport.transform, item.transform);
    const height = Math.hypot(transform[2], transform[3]);
    const occurrence = seen.get(item.str) ?? 0;
    seen.set(item.str, occurrence + 1);
    items.push({
      text: item.str,
      occurrence,
      x: transform[4],
      y: transform[5] - height,
      width: item.width * scale,
      height,
    });
  }

  return items;
}
