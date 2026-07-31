import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import {
  createPdfToWordDocxBlob,
  type PdfWordPage,
} from '../lib/utils/pdf-to-word-docx';
import {
  createPdfWordLinesFromOcr,
  retainImagesForOcrPage,
  shouldUseNativePdfText,
} from '../lib/utils/pdf-to-word-routing';

const ONE_PIXEL_PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Av8L9QAAAABJRU5ErkJggg==',
    'base64'
  )
);

function createPage(): PdfWordPage {
  return {
    width: 612,
    height: 792,
    lines: [
      {
        kind: 'text',
        x: 72,
        y: 72,
        width: 240,
        height: 28,
        runs: [
          {
            text: 'Large heading',
            fontFamily: 'Arial',
            fontSize: 24,
            bold: true,
            italic: false,
          },
        ],
      },
      {
        kind: 'text',
        x: 72,
        y: 120,
        width: 300,
        height: 14,
        runs: [
          {
            text: 'Regular body',
            fontFamily: 'Times New Roman',
            fontSize: 10,
            bold: false,
            italic: true,
          },
        ],
      },
    ],
    images: [
      {
        kind: 'image',
        x: 72,
        y: 160,
        width: 144,
        height: 72,
        data: ONE_PIXEL_PNG,
        description: 'Fixture image',
      },
    ],
  };
}

describe('PDF to Word DOCX builder', () => {
  it('writes source font sizes and basic run styling into document XML', async () => {
    const blob = createPdfToWordDocxBlob([createPage()]);
    const archive = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const documentXml = strFromU8(archive['word/document.xml']);

    expect(documentXml).toContain('<w:sz w:val="48"/>');
    expect(documentXml).toContain('<w:sz w:val="20"/>');
    expect(documentXml).toContain('<w:b/><w:bCs/>');
    expect(documentXml).toContain('<w:i/><w:iCs/>');
    expect(documentXml).toContain('w:ascii="Times New Roman"');
  });

  it('packages PDF images with valid Word relationships and drawing markup', async () => {
    const blob = createPdfToWordDocxBlob([createPage()]);
    const archive = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const documentXml = strFromU8(archive['word/document.xml']);
    const relationshipsXml = strFromU8(archive['word/_rels/document.xml.rels']);
    const contentTypesXml = strFromU8(archive['[Content_Types].xml']);

    expect(archive['word/media/image1.png']).toEqual(ONE_PIXEL_PNG);
    expect(documentXml).toContain('r:embed="rIdImage1"');
    expect(documentXml).toContain('descr="Fixture image"');
    expect(relationshipsXml).toContain('Target="media/image1.png"');
    expect(contentTypesXml).toContain('Extension="png" ContentType="image/png"');
  });

  it('preserves the PDF page size in the Word section properties', async () => {
    const blob = createPdfToWordDocxBlob([createPage()]);
    const archive = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const documentXml = strFromU8(archive['word/document.xml']);

    expect(documentXml).toContain('<w:pgSz w:w="12240" w:h="15840"/>');
  });

  it('uses zero margins for full-page PDF images so scanned pages are not clipped', async () => {
    const page = createPage();
    page.lines = [];
    page.images[0] = {
      ...page.images[0],
      x: 0,
      y: 0,
      width: page.width,
      height: page.height,
    };

    const blob = createPdfToWordDocxBlob([page]);
    const archive = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    const documentXml = strFromU8(archive['word/document.xml']);

    expect(documentXml).toContain(
      '<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0"'
    );
  });
});

describe('PDF to Word hybrid page routing', () => {
  it('uses OCR for a sparse page-number overlay but keeps a meaningful native text layer', () => {
    expect(
      shouldUseNativePdfText(
        [{ text: '7', width: 8, height: 10 }],
        612,
        792
      )
    ).toBe(false);

    expect(
      shouldUseNativePdfText(
        [
          { text: 'Quarterly report', width: 180, height: 24 },
          { text: 'Revenue increased during the period.', width: 260, height: 12 },
        ],
        612,
        792
      )
    ).toBe(true);
  });

  it('maps local OCR blocks from rendered pixels back to Word page points', () => {
    const lines = createPdfWordLinesFromOcr(
      [
        {
          text: '扫描标题',
          confidence: 0.96,
          angle: 0,
          box: { x: 200, y: 240, width: 800, height: 80 },
        },
      ],
      1224,
      1584,
      612,
      792,
      'chi_sim'
    );

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      x: 100,
      y: 120,
      width: 400,
      height: 40,
    });
    expect(lines[0].runs[0]).toMatchObject({
      text: '扫描标题',
      fontFamily: 'Microsoft YaHei',
    });
    expect(lines[0].runs[0].fontSize).toBeCloseTo(28.8);
  });

  it('drops a full-page scan image after successful OCR but keeps smaller figures', () => {
    const page = createPage();
    const fullPageImage = {
      ...page.images[0],
      x: 0,
      y: 0,
      width: page.width,
      height: page.height,
    };
    const retained = retainImagesForOcrPage(
      [fullPageImage, page.images[0]],
      page.width,
      page.height
    );

    expect(retained).toEqual([page.images[0]]);
  });
});
