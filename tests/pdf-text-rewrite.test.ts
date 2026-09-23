import { PDFArray, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  applyPdfTextRewrites,
  parseShowRuns,
  type PdfTextRewrite,
} from '../lib/utils/pdf-text-rewrite';

interface PageSpec {
  content: string;
  font?: Record<string, unknown>;
}

/** 手写一份未压缩的小 PDF，方便断言内容流里到底写了什么。 */
async function createPdf(pages: PageSpec[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  for (const spec of pages) {
    const page = pdfDoc.addPage([400, 600]);
    const font = pdfDoc.context.obj({
      Type: 'Font',
      Subtype: 'Type1',
      BaseFont: 'Helvetica',
      ...spec.font,
    });
    page.node.set(
      PDFName.of('Resources'),
      pdfDoc.context.obj({ Font: { F1: pdfDoc.context.register(font) } })
    );
    const stream = pdfDoc.context.stream(spec.content);
    page.node.set(PDFName.of('Contents'), pdfDoc.context.register(stream));
  }
  return pdfDoc.save();
}

async function readContent(bytes: Uint8Array, pageIndex = 0): Promise<string> {
  const pdfDoc = await PDFDocument.load(bytes);
  const page = pdfDoc.getPages()[pageIndex];
  // pdf-lib 会把 /Contents 规范化成数组，所以两种形态都要能读。
  const contents = page.node.Contents();
  const streams = contents instanceof PDFArray
    ? Array.from({ length: contents.size() }, (_, i) => contents.lookup(i))
    : [contents];
  return streams
    .filter((stream): stream is PDFRawStream => stream instanceof PDFRawStream)
    .map((stream) => Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1'))
    .join('\n');
}

function rewrite(overrides: Partial<PdfTextRewrite> = {}): PdfTextRewrite {
  return { pageIndex: 0, original: 'Page One', occurrence: 0, next: 'Page Two', ...overrides };
}

describe('parseShowRuns', () => {
  it('reads Tj, TJ and quote operators with their font', () => {
    const runs = parseShowRuns('BT /F1 12 Tf (a) Tj [(b) -20 (c)] TJ (d) \' ET');
    expect(runs.map((run) => run.text)).toEqual(['a', 'bc', 'd']);
    expect(runs.every((run) => run.font === 'F1')).toBe(true);
  });

  it('ignores bytes inside inline images', () => {
    const runs = parseShowRuns('BI /W 2 ID (notText) Tj EI (real) Tj');
    expect(runs.map((run) => run.text)).toEqual(['real']);
  });

  it('decodes escapes and hex strings', () => {
    const runs = parseShowRuns('(a\\(b\\)) Tj <414243> Tj');
    expect(runs.map((run) => run.text)).toEqual(['a(b)', 'ABC']);
  });
});

describe('applyPdfTextRewrites', () => {
  it('rewrites the text in the content stream instead of covering it', async () => {
    const source = await createPdf([{ content: 'BT /F1 24 Tf 60 500 Td (Page One) Tj ET' }]);
    const result = await applyPdfTextRewrites(source, [rewrite()]);

    expect(result.applied).toHaveLength(1);
    expect(result.failed).toHaveLength(0);
    const content = await readContent(result.bytes);
    expect(content).toContain('(Page Two) Tj');
    expect(content).not.toContain('Page One');
  });

  it('keeps the rest of the page untouched', async () => {
    const source = await createPdf([
      { content: 'BT /F1 24 Tf 60 500 Td (Page One) Tj 0 -30 Td (Keep me) Tj ET' },
    ]);
    const content = await readContent((await applyPdfTextRewrites(source, [rewrite()])).bytes);
    expect(content).toContain('(Keep me) Tj');
    expect(content).toContain('60 500 Td');
  });

  it('targets the requested occurrence of a repeated string', async () => {
    const source = await createPdf([
      { content: 'BT /F1 24 Tf (Page One) Tj 0 -30 Td (Page One) Tj ET' },
    ]);
    const result = await applyPdfTextRewrites(source, [rewrite({ occurrence: 1 })]);
    const content = await readContent(result.bytes);

    expect(result.applied).toHaveLength(1);
    expect(content.indexOf('(Page One) Tj')).toBeLessThan(content.indexOf('(Page Two) Tj'));
  });

  it('collapses a kerned TJ array into the first piece', async () => {
    const source = await createPdf([
      { content: 'BT /F1 24 Tf [(Pa) -20 (ge ) 15 (One)] TJ ET' },
    ]);
    const result = await applyPdfTextRewrites(source, [rewrite()]);
    const content = await readContent(result.bytes);

    expect(result.applied).toHaveLength(1);
    expect(content).toContain('[(Page Two) -20 () 15 ()] TJ');
  });

  it('joins consecutive show operators that pdf.js reports as one item', async () => {
    const source = await createPdf([{ content: 'BT /F1 24 Tf (Page ) Tj (One) Tj ET' }]);
    const result = await applyPdfTextRewrites(source, [rewrite()]);
    const content = await readContent(result.bytes);

    expect(result.applied).toHaveLength(1);
    expect(content).toContain('(Page Two) Tj () Tj');
  });

  it('applies several rewrites on one page without shifting offsets', async () => {
    const source = await createPdf([{ content: 'BT /F1 24 Tf (Alpha) Tj (Beta) Tj ET' }]);
    const result = await applyPdfTextRewrites(source, [
      rewrite({ original: 'Alpha', next: 'ALPHA!' }),
      rewrite({ original: 'Beta', next: 'B' }),
    ]);
    const content = await readContent(result.bytes);

    expect(result.applied).toHaveLength(2);
    expect(content).toContain('(ALPHA!) Tj');
    expect(content).toContain('(B) Tj');
  });

  it('reports text it cannot find in the page content stream', async () => {
    const source = await createPdf([{ content: 'BT /F1 24 Tf (Page One) Tj ET' }]);
    const result = await applyPdfTextRewrites(source, [rewrite({ original: 'Missing' })]);

    expect(result.applied).toHaveLength(0);
    expect(result.failed[0].reason).toBe('not_found');
  });

  it('refuses multi-byte CID fonts instead of writing broken bytes', async () => {
    const source = await createPdf([
      { content: 'BT /F1 24 Tf (Page One) Tj ET', font: { Subtype: 'Type0' } },
    ]);
    const result = await applyPdfTextRewrites(source, [rewrite()]);

    expect(result.applied).toHaveLength(0);
    expect(result.failed[0].reason).toBe('unsupported_font');
  });

  it('refuses characters the subset font has no glyph for', async () => {
    const source = await createPdf([
      {
        content: 'BT /F1 24 Tf (PAGE) Tj ET',
        // 只覆盖 A-Z 的子集字体：小写字母没有字形
        font: { Subtype: 'TrueType', FirstChar: 65, LastChar: 90, Widths: Array(26).fill(500) },
      },
    ]);
    const result = await applyPdfTextRewrites(source, [
      rewrite({ original: 'PAGE', next: 'Page' }),
    ]);

    expect(result.applied).toHaveLength(0);
    expect(result.failed[0].reason).toBe('unavailable_glyph');
  });

  it('rejects non latin1 text such as CJK', async () => {
    const source = await createPdf([{ content: 'BT /F1 24 Tf (Page One) Tj ET' }]);
    const result = await applyPdfTextRewrites(source, [rewrite({ next: '第一页' })]);

    expect(result.applied).toHaveLength(0);
    expect(result.failed[0].reason).toBe('unavailable_glyph');
  });

  it('escapes parentheses and backslashes in the new text', async () => {
    const source = await createPdf([{ content: 'BT /F1 24 Tf (Page One) Tj ET' }]);
    const result = await applyPdfTextRewrites(source, [rewrite({ next: 'a(b)\\c' })]);

    expect(result.applied).toHaveLength(1);
    expect(await readContent(result.bytes)).toContain('(a\\(b\\)\\\\c) Tj');
  });

  it('leaves the page count and other pages alone', async () => {
    const source = await createPdf([
      { content: 'BT /F1 24 Tf (Page One) Tj ET' },
      { content: 'BT /F1 24 Tf (Page Two) Tj ET' },
    ]);
    const result = await applyPdfTextRewrites(source, [rewrite()]);
    const reloaded = await PDFDocument.load(result.bytes);

    expect(reloaded.getPageCount()).toBe(2);
    expect(await readContent(result.bytes, 1)).toContain('(Page Two) Tj');
  });
});

describe('applyPdfTextRewrites file hygiene', () => {
  it('does not leave the replaced text behind as an orphan object', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    page.node.set(
      PDFName.of('Resources'),
      pdfDoc.context.obj({
        Font: {
          F1: pdfDoc.context.register(
            pdfDoc.context.obj({ Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' })
          ),
        },
      })
    );
    page.node.set(
      PDFName.of('Contents'),
      pdfDoc.context.register(pdfDoc.context.stream('BT /F1 24 Tf (Secret 12345) Tj ET'))
    );

    const result = await applyPdfTextRewrites(await pdfDoc.save(), [
      { pageIndex: 0, original: 'Secret 12345', occurrence: 0, next: 'Public 00000' },
    ]);

    expect(result.applied).toHaveLength(1);
    // 整个文件里都不应再出现被改掉的原文
    expect(Buffer.from(result.bytes).toString('latin1')).not.toContain('Secret 12345');
    expect(await readContent(result.bytes)).toContain('(Public 00000) Tj');
  });
});

describe('text split by kerning', () => {
  it('matches text whose spaces pdf.js synthesised from TJ offsets', async () => {
    // pdf.js 把 [(Hello)-400(world)] 抽成 "Hello world"，内容流里其实没有空格字节
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    page.node.set(
      PDFName.of('Resources'),
      pdfDoc.context.obj({
        Font: {
          F1: pdfDoc.context.register(
            pdfDoc.context.obj({ Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' })
          ),
        },
      })
    );
    page.node.set(
      PDFName.of('Contents'),
      pdfDoc.context.register(pdfDoc.context.stream('BT /F1 20 Tf [(Hello)-400(world)] TJ ET'))
    );

    const result = await applyPdfTextRewrites(await pdfDoc.save(), [
      { pageIndex: 0, original: 'Hello world', occurrence: 0, next: 'Bye all' },
    ]);

    expect(result.failed).toHaveLength(0);
    expect(result.applied).toHaveLength(1);
    expect(await readContent(result.bytes)).toContain('[(Bye all)-400()] TJ');
  });

  it('still prefers an exact byte match over the space-insensitive one', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    page.node.set(
      PDFName.of('Resources'),
      pdfDoc.context.obj({
        Font: {
          F1: pdfDoc.context.register(
            pdfDoc.context.obj({ Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' })
          ),
        },
      })
    );
    page.node.set(
      PDFName.of('Contents'),
      pdfDoc.context.register(
        pdfDoc.context.stream('BT /F1 20 Tf [(Hello)-400(world)] TJ (Hello world) Tj ET')
      )
    );

    const result = await applyPdfTextRewrites(await pdfDoc.save(), [
      { pageIndex: 0, original: 'Hello world', occurrence: 0, next: 'EXACT' },
    ]);
    const content = await readContent(result.bytes);

    // 精确匹配的那一段（第二段）被改写，靠字距拼出来的那段保持原样
    expect(content).toContain('[(Hello)-400(world)] TJ');
    expect(content).toContain('(EXACT) Tj');
  });
});
