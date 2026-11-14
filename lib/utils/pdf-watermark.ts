import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { parseColor } from './color';
import { createBatchFilename } from './batch';

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  layout: 'center' | 'tile' | 'diagonal';
}

export interface PdfWatermarkBatchItem {
  filename: string;
  blob: Blob;
}

/** 对一组 PDF 套用同一份水印设置，逐个返回产物，单文件失败不影响其余文件。 */
export async function addPdfWatermarkBatch(
  files: File[],
  options: WatermarkOptions,
  onProgress?: (current: number, total: number) => void,
): Promise<{ items: PdfWatermarkBatchItem[]; failedCount: number }> {
  const items: PdfWatermarkBatchItem[] = [];
  let failedCount = 0;

  for (const [index, file] of files.entries()) {
    onProgress?.(index + 1, files.length);
    try {
      const blob = await addPdfWatermark(file, options);
      if (!blob) throw new Error('Watermark generation failed.');
      items.push({
        filename: createBatchFilename(file.name, 'watermarked', 'pdf'),
        blob,
      });
    } catch {
      failedCount += 1;
    }
  }

  return { items, failedCount };
}

export async function addPdfWatermark(file: File, options: WatermarkOptions): Promise<Blob | null> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const colorOutcome = parseColor(options.color);
  const color = colorOutcome.ok
    ? rgb(colorOutcome.rgb.r / 255, colorOutcome.rgb.g / 255, colorOutcome.rgb.b / 255)
    : rgb(0.6, 0.6, 0.6);

  const opacity = Math.min(1, Math.max(0.05, options.opacity));
  const size = Math.max(8, options.fontSize);
  const rotation = degrees(options.rotation);
  const textWidth = font.widthOfTextAtSize(options.text, size);
  const textHeight = font.heightAtSize(size);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    if (options.layout === 'center') {
      page.drawText(options.text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        font,
        size,
        color,
        opacity,
        rotate: rotation,
      });
    } else if (options.layout === 'diagonal') {
      const diagonalRotation = degrees(-Math.atan2(height, width) * (180 / Math.PI));
      page.drawText(options.text, {
        x: width / 2 - textWidth / 2,
        y: height / 2,
        font,
        size,
        color,
        opacity,
        rotate: diagonalRotation,
      });
    } else {
      const stepX = Math.max(textWidth * 1.5, 120);
      const stepY = Math.max(textHeight * 6, 80);
      for (let y = 0; y < height + stepY; y += stepY) {
        for (let x = -stepX; x < width + stepX; x += stepX) {
          page.drawText(options.text, {
            x,
            y,
            font,
            size,
            color,
            opacity,
            rotate: rotation,
          });
        }
      }
    }
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
