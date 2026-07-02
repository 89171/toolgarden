export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPdfPages(
  file: File,
  options: { format: 'png' | 'jpeg'; scale: number; onProgress?: (current: number, total: number) => void }
): Promise<RenderedPage[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
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
