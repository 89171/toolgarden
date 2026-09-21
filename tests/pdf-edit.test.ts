import { PDFDocument, degrees } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { applyPdfOverlays, getOverlayPlacement } from '../lib/utils/pdf-edit';

const RED_DOT_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function createPdf(rotation: number): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  page.setRotation(degrees(rotation));
  return pdfDoc.save();
}

describe('pdf overlay placement', () => {
  it('covers the whole page when it is not rotated', () => {
    expect(getOverlayPlacement(0, 400, 600)).toEqual({ x: 0, y: 0, width: 400, height: 600, rotate: 0 });
  });

  it('swaps the axes on quarter-turned pages so the overlay stays aligned', () => {
    expect(getOverlayPlacement(90, 400, 600)).toEqual({ x: 400, y: 0, width: 600, height: 400, rotate: 90 });
    expect(getOverlayPlacement(270, 400, 600)).toEqual({ x: 0, y: 600, width: 600, height: 400, rotate: -90 });
    expect(getOverlayPlacement(-90, 400, 600)).toEqual({ x: 0, y: 600, width: 600, height: 400, rotate: -90 });
  });

  it('anchors a half-turned overlay at the opposite corner', () => {
    expect(getOverlayPlacement(180, 400, 600)).toEqual({ x: 400, y: 600, width: 400, height: 600, rotate: 180 });
  });
});

describe('applyPdfOverlays', () => {
  it('keeps the page count and only touches requested pages', async () => {
    const blob = await applyPdfOverlays(await createPdf(0), [{ pageIndex: 0, dataUrl: RED_DOT_PNG }]);
    const result = await PDFDocument.load(await blob.arrayBuffer());
    expect(result.getPageCount()).toBe(1);
    expect(blob.type).toBe('application/pdf');
  });

  it('ignores overlays pointing at pages that do not exist', async () => {
    const blob = await applyPdfOverlays(await createPdf(90), [{ pageIndex: 5, dataUrl: RED_DOT_PNG }]);
    expect((await PDFDocument.load(await blob.arrayBuffer())).getPageCount()).toBe(1);
  });
});
