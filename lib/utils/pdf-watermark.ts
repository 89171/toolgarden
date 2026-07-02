import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { parseColor } from './color';

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  layout: 'center' | 'tile' | 'diagonal';
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
