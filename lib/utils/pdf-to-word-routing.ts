import type { OcrLanguage, OcrTextBlock } from './ocr';
import type { PdfWordImage, PdfWordTextLine } from './pdf-to-word-docx';

const MIN_NATIVE_TEXT_CHARACTERS = 24;
const MIN_SPARSE_NATIVE_TEXT_CHARACTERS = 4;
const MIN_NATIVE_TEXT_COVERAGE = 0.0015;
const MAX_OCR_EMBEDDED_IMAGE_COVERAGE = 0.5;

export type PdfToWordPageRoute = 'native' | 'ocr' | 'visual';

export interface PdfNativeTextCandidate {
  text: string;
  width: number;
  height: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function getOcrFontFamily(language: OcrLanguage): string {
  switch (language) {
    case 'chi_sim':
      return 'Microsoft YaHei';
    case 'chi_tra':
      return 'Microsoft JhengHei';
    case 'jpn':
      return 'Yu Gothic';
    case 'eng':
    default:
      return 'Arial';
  }
}

/**
 * A tiny text fragment such as a page number is not enough evidence that the
 * PDF contains a useful text layer. Those pages should still be sent through
 * OCR so a scanned page with a sparse hidden overlay is not treated as native.
 */
export function shouldUseNativePdfText(
  items: PdfNativeTextCandidate[],
  pageWidth: number,
  pageHeight: number
): boolean {
  const meaningfulItems = items.filter((item) => item.text.replace(/\s/g, '').length > 0);
  const characterCount = meaningfulItems.reduce(
    (total, item) => total + item.text.replace(/\s/g, '').length,
    0
  );
  if (characterCount >= MIN_NATIVE_TEXT_CHARACTERS) return true;

  const pageArea = Math.max(1, pageWidth * pageHeight);
  const coveredArea = meaningfulItems.reduce(
    (total, item) => total + Math.max(0, item.width) * Math.max(0, item.height),
    0
  );
  const coverage = coveredArea / pageArea;

  return (
    meaningfulItems.length >= 3 ||
    (characterCount >= MIN_SPARSE_NATIVE_TEXT_CHARACTERS &&
      coverage >= MIN_NATIVE_TEXT_COVERAGE)
  );
}

export function createPdfWordLinesFromOcr(
  blocks: OcrTextBlock[],
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
  language: OcrLanguage
): PdfWordTextLine[] {
  if (imageWidth <= 0 || imageHeight <= 0) return [];

  const scaleX = pageWidth / imageWidth;
  const scaleY = pageHeight / imageHeight;
  const fontFamily = getOcrFontFamily(language);

  return [...blocks]
    .sort((left, right) => {
      const yDifference = left.box.y - right.box.y;
      if (Math.abs(yDifference) > Math.max(4, Math.min(left.box.height, right.box.height) * 0.4)) {
        return yDifference;
      }
      return left.box.x - right.box.x;
    })
    .flatMap((block) => {
      const text = block.text.replace(/\u0000/g, '').replace(/\s+/g, ' ').trim();
      if (!text) return [];

      const height = Math.max(1, block.box.height * scaleY);
      return [
        {
          kind: 'text' as const,
          x: Math.max(0, block.box.x * scaleX),
          y: Math.max(0, block.box.y * scaleY),
          width: Math.max(1, block.box.width * scaleX),
          height,
          runs: [
            {
              text,
              fontFamily,
              fontSize: clamp(height * 0.72, 6, 72),
              bold: false,
              italic: false,
            },
          ],
        },
      ];
    });
}

/**
 * OCR pages often contain one full-page raster image. Keeping that image with
 * recognized text would duplicate the entire page, so only retain independently
 * embedded figures that occupy less than half of the page.
 */
export function retainImagesForOcrPage(
  images: PdfWordImage[],
  pageWidth: number,
  pageHeight: number
): PdfWordImage[] {
  const pageArea = Math.max(1, pageWidth * pageHeight);
  return images.filter(
    (image) => (Math.max(0, image.width) * Math.max(0, image.height)) / pageArea <
      MAX_OCR_EMBEDDED_IMAGE_COVERAGE
  );
}
