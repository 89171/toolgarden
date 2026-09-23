import { readFileSync } from 'node:fs';
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  applyPdfAnnotations,
  getDisplayMatrix,
  getVisiblePageBox,
  isWinAnsiEncodable,
  type AnnotationShape,
} from '../lib/utils/pdf-annotations';
import { repairGlyphAdvances, subsetFontBytes } from '../lib/utils/pdf-cjk-font';

const FULL_PAGE = { x: 0, y: 0, width: 400, height: 600 };

const INK: AnnotationShape = {
  kind: 'ink',
  polylines: [[{ x: 10, y: 10 }, { x: 100, y: 80 }]],
  color: { r: 1, g: 0, b: 0 },
  opacity: 1,
  lineWidth: 2,
};

const SQUARE: AnnotationShape = {
  kind: 'square',
  polygon: [{ x: 20, y: 200 }, { x: 120, y: 200 }, { x: 120, y: 150 }, { x: 20, y: 150 }],
  stroke: { r: 0, g: 0, b: 1 },
  fill: { r: 1, g: 1, b: 1 },
  opacity: 0.8,
  lineWidth: 1,
};

const TEXT: AnnotationShape = {
  kind: 'text',
  text: 'Signed 2026',
  size: 12,
  color: { r: 0, g: 0, b: 0 },
  opacity: 1,
  matrix: [1, 0, 0, 1, 40, 300],
};

async function createPdf(configure?: (page: ReturnType<PDFDocument['addPage']>) => void): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  configure?.(page);
  return pdfDoc.save();
}

async function readAnnots(bytes: Uint8Array, pageIndex = 0): Promise<PDFDict[]> {
  const pdfDoc = await PDFDocument.load(bytes);
  const page = pdfDoc.getPages()[pageIndex];
  const annots = page.node.lookup(PDFName.of('Annots'));
  if (!(annots instanceof PDFArray)) return [];
  return Array.from({ length: annots.size() }, (_, i) => annots.lookup(i)).filter(
    (value): value is PDFDict => value instanceof PDFDict
  );
}

function subtypeOf(annot: PDFDict): string | undefined {
  const value = annot.lookup(PDFName.of('Subtype'));
  return value instanceof PDFName ? value.asString() : undefined;
}

describe('getVisiblePageBox', () => {
  it('intersects the crop box with the media box and keeps the origin', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    page.setCropBox(50, 60, 300, 500);
    expect(getVisiblePageBox(page)).toEqual({ x: 50, y: 60, width: 300, height: 500 });
  });

  it('falls back to the media box when the crop box does not overlap', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    page.setCropBox(500, 500, 10, 10);
    expect(getVisiblePageBox(page)).toEqual({ x: 0, y: 0, width: 400, height: 600 });
  });
});

describe('getDisplayMatrix', () => {
  it('is a plain translation on an unrotated page', () => {
    expect(getDisplayMatrix(0, FULL_PAGE)).toEqual([1, 0, 0, 1, 0, 0]);
  });

  it('maps the display corners onto the rotated page corners', () => {
    const apply = (matrix: readonly number[], x: number, y: number) => [
      matrix[0] * x + matrix[2] * y + matrix[4],
      matrix[1] * x + matrix[3] * y + matrix[5],
    ];
    // 90° 顺时针显示：显示空间左下角对应未旋转页面的右下角
    expect(apply(getDisplayMatrix(90, FULL_PAGE), 0, 0)).toEqual([400, 0]);
    expect(apply(getDisplayMatrix(180, FULL_PAGE), 0, 0)).toEqual([400, 600]);
    expect(apply(getDisplayMatrix(270, FULL_PAGE), 0, 0)).toEqual([0, 600]);
  });

  it('offsets by the visible box origin on cropped pages', () => {
    expect(getDisplayMatrix(0, { x: 50, y: 60, width: 300, height: 500 })).toEqual([1, 0, 0, 1, 50, 60]);
    expect(getDisplayMatrix(180, { x: 50, y: 60, width: 300, height: 500 })).toEqual([-1, 0, 0, -1, 350, 560]);
  });
});

describe('isWinAnsiEncodable', () => {
  it('accepts latin text and rejects CJK', () => {
    expect(isWinAnsiEncodable('Signed 2026')).toBe(true);
    expect(isWinAnsiEncodable('café · 2026')).toBe(true); // Latin-1 范围内
    expect(isWinAnsiEncodable('签名')).toBe(false);
    expect(isWinAnsiEncodable('emoji 🚀')).toBe(false);
  });
});

describe('applyPdfAnnotations', () => {
  it('writes one native annotation per shape with an appearance stream', async () => {
    const bytes = await applyPdfAnnotations(await createPdf(), [
      { pageIndex: 0, shapes: [INK, SQUARE, TEXT] },
    ]);
    const annots = await readAnnots(bytes);

    expect(annots.map(subtypeOf)).toEqual(['/Ink', '/Square', '/FreeText']);
    for (const annot of annots) {
      const appearance = annot.lookup(PDFName.of('AP'));
      expect(appearance).toBeInstanceOf(PDFDict);
      expect((appearance as PDFDict).get(PDFName.of('N'))).toBeDefined();
    }
  });

  it('stays vector: no image XObject is added for pen, box or text', async () => {
    const bytes = await applyPdfAnnotations(await createPdf(), [
      { pageIndex: 0, shapes: [INK, SQUARE, TEXT] },
    ]);
    expect(Buffer.from(bytes).toString('latin1')).not.toContain('/Subtype /Image');
  });

  it('keeps ink geometry in user space for viewers that ignore the appearance', async () => {
    const bytes = await applyPdfAnnotations(await createPdf(), [{ pageIndex: 0, shapes: [INK] }]);
    const inkList = (await readAnnots(bytes))[0].lookup(PDFName.of('InkList'));
    expect(inkList).toBeInstanceOf(PDFArray);
    expect(((inkList as PDFArray).lookup(0) as PDFArray).size()).toBe(4);
  });

  it('shifts annotations by the crop box origin', async () => {
    const cropped = await createPdf((page) => page.setCropBox(50, 60, 300, 500));
    const bytes = await applyPdfAnnotations(cropped, [
      { pageIndex: 0, shapes: [{ ...TEXT, matrix: [1, 0, 0, 1, 0, 0] }] },
    ]);
    const rect = (await readAnnots(bytes))[0].lookup(PDFName.of('Rect')) as PDFArray;
    const left = (rect.lookup(0, PDFNumber) as PDFNumber).asNumber();
    const bottom = (rect.lookup(1, PDFNumber) as PDFNumber).asNumber();

    // 文字画在显示空间原点，裁切页面里它应该落在 CropBox 的左下角附近
    expect(left).toBeGreaterThanOrEqual(48);
    expect(left).toBeLessThan(55);
    expect(bottom).toBeGreaterThanOrEqual(55);
    expect(bottom).toBeLessThan(65);
  });

  it('appends to annotations the page already has', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    page.node.set(
      PDFName.of('Annots'),
      pdfDoc.context.obj([
        pdfDoc.context.register(
          pdfDoc.context.obj({ Type: 'Annot', Subtype: 'Square', Rect: [0, 0, 10, 10] })
        ),
      ])
    );
    const bytes = await applyPdfAnnotations(await pdfDoc.save(), [{ pageIndex: 0, shapes: [INK] }]);

    expect((await readAnnots(bytes)).map(subtypeOf)).toEqual(['/Square', '/Ink']);
  });

  it('ignores pages that do not exist and keeps the page count', async () => {
    const bytes = await applyPdfAnnotations(await createPdf(), [{ pageIndex: 4, shapes: [INK] }]);
    const pdfDoc = await PDFDocument.load(bytes);
    expect(pdfDoc.getPageCount()).toBe(1);
  });
});

describe('non-latin annotation text', () => {
  // Liberation Sans 在 pdfjs-dist 里，离线可用；中文字体走 CDN 的路径在浏览器里验证
  const unicodeFont = readFileSync(
    'node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf'
  );
  const greek: AnnotationShape = { ...TEXT, text: 'Ωμέγα' } as AnnotationShape;

  it('embeds a subset of the supplied font instead of rasterising', async () => {
    const bytes = await applyPdfAnnotations(await createPdf(), [{ pageIndex: 0, shapes: [greek] }], {
      unicodeFont: new Uint8Array(unicodeFont),
    });

    // 字体描述符可能被打进对象流，所以解析后再找，而不是在原始字节里搜
    const pdfDoc = await PDFDocument.load(bytes);
    const hasEmbeddedFontFile = pdfDoc.context
      .enumerateIndirectObjects()
      .some(([, object]) => object instanceof PDFDict && object.has(PDFName.of('FontFile2')));

    expect(hasEmbeddedFontFile).toBe(true);
    expect(Buffer.from(bytes).toString('latin1')).not.toContain('/Subtype /Image');
    // 子集化后整份文件远小于原始字体
    expect(bytes.length).toBeLessThan(unicodeFont.length);
  });

  it('skips non-latin text instead of crashing when no unicode font is supplied', async () => {
    // 编辑器在这条路径上会把这个文字对象单独栅格化，所以这里跳过是预期行为
    const bytes = await applyPdfAnnotations(await createPdf(), [{ pageIndex: 0, shapes: [greek] }]);
    expect(await readAnnots(bytes)).toHaveLength(0);
  });
});

describe('font subsetting for non-latin text', () => {
  const source = readFileSync('node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf');
  const sourceBuffer = source.buffer.slice(
    source.byteOffset,
    source.byteOffset + source.byteLength
  ) as ArrayBuffer;

  it('cuts the font down to the characters actually used', () => {
    const subset = subsetFontBytes(sourceBuffer, 'Ωμέγα');
    expect(subset).not.toBeNull();
    // 子集应该比原字体小一个数量级
    expect(subset!.length).toBeLessThan(source.length / 2);
  });

  it('gives up when a character has no glyph, so we never export tofu', () => {
    // Liberation Sans 没有中文字形
    expect(subsetFontBytes(sourceBuffer, '张三')).toBeNull();
  });

  it('embeds the prepared subset as is', async () => {
    const subset = subsetFontBytes(sourceBuffer, 'Ωμέγα')!;
    const bytes = await applyPdfAnnotations(
      await createPdf(),
      [{ pageIndex: 0, shapes: [{ ...TEXT, text: 'Ωμέγα' } as AnnotationShape] }],
      { unicodeFont: subset }
    );

    const pdfDoc = await PDFDocument.load(bytes);
    const embedded = pdfDoc.context
      .enumerateIndirectObjects()
      .some(([, object]) => object instanceof PDFDict && object.has(PDFName.of('FontFile2')));
    expect(embedded).toBe(true);
    expect(Buffer.from(bytes).toString('latin1')).not.toContain('/Subtype /Image');
  });
});

describe('repairGlyphAdvances', () => {
  // fonteditor-core 把 CFF 空格转成 glyf 时会写出负的 advanceWidth，
  // 无符号读出来是 65125，后面的字就被推出页面
  it('replaces a negative advance on an empty glyph with a space-sized one', () => {
    const glyphs = [{ advanceWidth: -411, contours: [] }] as never[];
    expect(repairGlyphAdvances(glyphs, 1000)).toBe(1);
    expect((glyphs[0] as { advanceWidth: number }).advanceWidth).toBe(250);
  });

  it('replaces an absurd advance on a drawn glyph with one em', () => {
    const glyphs = [{ advanceWidth: 65125, contours: [[{ x: 0, y: 0 }]] }] as never[];
    repairGlyphAdvances(glyphs, 1000);
    expect((glyphs[0] as { advanceWidth: number }).advanceWidth).toBe(1000);
  });

  it('leaves sane advances alone', () => {
    const glyphs = [{ advanceWidth: 1000, contours: [[{ x: 0, y: 0 }]] }, { advanceWidth: 0, contours: [] }] as never[];
    expect(repairGlyphAdvances(glyphs, 1000)).toBe(0);
  });
});
