import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import {
  createPdfToWordDocxBlob,
  type PdfWordPage,
} from '../lib/utils/pdf-to-word-docx';

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
