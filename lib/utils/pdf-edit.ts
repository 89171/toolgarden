import { PDFDocument, degrees } from 'pdf-lib';

export interface PdfPageOverlay {
  /** 0-based 页码 */
  pageIndex: number;
  /** 覆盖整页的透明 PNG dataURL，坐标系与 pdf.js 渲染出的显示方向一致 */
  dataUrl: string;
}

export interface OverlayPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  /** 逆时针角度，传给 pdf-lib 的 degrees() */
  rotate: number;
}

/**
 * 把「按显示方向绘制的整页覆盖层」放回未旋转的页面坐标系。
 *
 * pdf.js 渲染时已经应用了页面的 /Rotate，而 pdf-lib 绘图用的是未旋转的 MediaBox，
 * 旋转页面上直接按 (0,0,width,height) 贴图会错位。
 */
export function getOverlayPlacement(rotation: number, width: number, height: number): OverlayPlacement {
  const angle = ((Math.round(rotation) % 360) + 360) % 360;
  if (angle === 90) return { x: width, y: 0, width: height, height: width, rotate: 90 };
  if (angle === 180) return { x: width, y: height, width, height, rotate: 180 };
  if (angle === 270) return { x: 0, y: height, width: height, height: width, rotate: -90 };
  return { x: 0, y: 0, width, height, rotate: 0 };
}

/** 把每页的标注图层盖回原 PDF，原页面内容与文字层保持不变。 */
export async function applyPdfOverlays(
  source: ArrayBuffer | Uint8Array,
  overlays: PdfPageOverlay[]
): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(source);
  const pages = pdfDoc.getPages();

  for (const overlay of overlays) {
    const page = pages[overlay.pageIndex];
    if (!page) continue;
    const image = await pdfDoc.embedPng(overlay.dataUrl);
    const { width, height } = page.getSize();
    const placement = getOverlayPlacement(page.getRotation().angle, width, height);
    page.drawImage(image, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotate: degrees(placement.rotate),
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
