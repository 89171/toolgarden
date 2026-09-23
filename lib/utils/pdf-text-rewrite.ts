import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFStream,
  decodePDFRawStream,
} from 'pdf-lib';

/**
 * 直接改写页面内容流里的文字，而不是在页面上盖一层标注。
 *
 * 能做到的前提很硬：目标文字必须在页面自己的内容流里（不在 Form XObject 里）、
 * 字体是单字节的简单字体（Type1 / TrueType / Type3），且新文字的每个字符在该字体里
 * 确实有字形。任何一条不满足都返回失败原因，由调用方退回到叠加标注，绝不写出
 * 渲染成空白方块的 PDF。
 */

export interface PdfTextRewrite {
  /** 0-based 页码 */
  pageIndex: number;
  /** 原文，必须与 pdf.js 抽取（disableNormalization）出来的字符串完全一致 */
  original: string;
  /** 同一页内相同原文的第几次出现，0-based */
  occurrence: number;
  /** 新文字 */
  next: string;
}

export type PdfTextRewriteFailureReason =
  /** 内容流里找不到这段文字：它可能在 Form XObject 里，或被拆得过碎 */
  | 'not_found'
  /** CID / Type0 等多字节字体，字节与字符不是一一对应，无法安全改写 */
  | 'unsupported_font'
  /** 新文字里有该字体没有字形的字符，写进去会变成空白或豆腐块 */
  | 'unavailable_glyph';

export interface PdfTextRewriteFailure {
  rewrite: PdfTextRewrite;
  reason: PdfTextRewriteFailureReason;
}

export interface PdfTextRewriteResult {
  bytes: Uint8Array;
  applied: PdfTextRewrite[];
  failed: PdfTextRewriteFailure[];
}

interface StringPiece {
  /** 字符串 token 在内容流中的起止（含定界符） */
  start: number;
  end: number;
  hex: boolean;
  /** 解码后的字节，按 latin1 存成字符串 */
  bytes: string;
}

interface ShowRun {
  font: string | null;
  pieces: StringPiece[];
  text: string;
}

interface Token {
  type: 'string' | 'name' | 'op' | 'other' | 'arrayStart' | 'arrayEnd';
  value?: string;
  piece?: StringPiece;
}

const WHITESPACE = new Set([' ', '\t', '\r', '\n', '\f', '\0']);
const DELIMITERS = new Set(['(', ')', '<', '>', '[', ']', '{', '}', '/', '%']);
/** 一段 pdf.js 文本最多可能由几个连续的 show 操作符拼成 */
const MAX_RUN_WINDOW = 8;

/**
 * pdf-lib 的 lookupMaybe(key, Type) 在取到的值类型不符时会抛异常（例如
 * /Encoding 既可能是字典也可能是 /WinAnsiEncoding 这样的名字），所以统一先无类型
 * 取值再自己判断。
 */
function lookupDict(dict: PDFDict, key: string): PDFDict | undefined {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFDict ? value : undefined;
}

function lookupName(dict: PDFDict, key: string): PDFName | undefined {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFName ? value : undefined;
}

function lookupArray(dict: PDFDict, key: string): PDFArray | undefined {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFArray ? value : undefined;
}

function lookupNumber(dict: PDFDict, key: string): number | undefined {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFNumber ? value.asNumber() : undefined;
}

function latin1Decode(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    out += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return out;
}

function latin1Encode(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff;
  return bytes;
}

function isRegular(char: string): boolean {
  return !WHITESPACE.has(char) && !DELIMITERS.has(char);
}

function readLiteralString(content: string, start: number): StringPiece {
  let depth = 0;
  let bytes = '';
  let index = start;

  while (index < content.length) {
    const char = content[index];
    if (char === '\\') {
      const next = content[index + 1];
      index += 2;
      switch (next) {
        case 'n': bytes += '\n'; break;
        case 'r': bytes += '\r'; break;
        case 't': bytes += '\t'; break;
        case 'b': bytes += '\b'; break;
        case 'f': bytes += '\f'; break;
        case '\n': break;
        case '\r': if (content[index] === '\n') index += 1; break;
        default:
          if (next >= '0' && next <= '7') {
            let octal = next;
            while (octal.length < 3 && content[index] >= '0' && content[index] <= '7') {
              octal += content[index];
              index += 1;
            }
            bytes += String.fromCharCode(Number.parseInt(octal, 8) & 0xff);
          } else {
            bytes += next ?? '';
          }
      }
      continue;
    }

    index += 1;
    if (char === '(') {
      depth += 1;
      if (depth === 1) continue;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) return { start, end: index, hex: false, bytes };
    }
    bytes += char;
  }

  return { start, end: content.length, hex: false, bytes };
}

function readHexString(content: string, start: number): StringPiece {
  const close = content.indexOf('>', start);
  const end = close === -1 ? content.length : close + 1;
  const digits = content.slice(start + 1, end - 1).replace(/[^0-9a-fA-F]/g, '');
  const padded = digits.length % 2 === 0 ? digits : `${digits}0`;
  let bytes = '';
  for (let i = 0; i < padded.length; i += 2) {
    bytes += String.fromCharCode(Number.parseInt(padded.slice(i, i + 2), 16));
  }
  return { start, end, hex: true, bytes };
}

/** 跳过内联图片的二进制数据，否则其中的字节会被当成字符串解析。 */
function skipInlineImage(content: string, start: number): number {
  const dataStart = content.indexOf('ID', start);
  if (dataStart === -1) return content.length;
  for (let i = dataStart + 3; i < content.length - 1; i += 1) {
    if (content[i] === 'E' && content[i + 1] === 'I' && WHITESPACE.has(content[i - 1] ?? ' ')) {
      return i + 2;
    }
  }
  return content.length;
}

function tokenize(content: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < content.length) {
    const char = content[index];

    if (WHITESPACE.has(char)) {
      index += 1;
    } else if (char === '%') {
      const lineEnd = content.slice(index).search(/[\r\n]/);
      index = lineEnd === -1 ? content.length : index + lineEnd + 1;
    } else if (char === '(') {
      const piece = readLiteralString(content, index);
      tokens.push({ type: 'string', piece });
      index = piece.end;
    } else if (char === '<') {
      if (content[index + 1] === '<') {
        tokens.push({ type: 'other' });
        index += 2;
      } else {
        const piece = readHexString(content, index);
        tokens.push({ type: 'string', piece });
        index = piece.end;
      }
    } else if (char === '>') {
      tokens.push({ type: 'other' });
      index += content[index + 1] === '>' ? 2 : 1;
    } else if (char === '[') {
      tokens.push({ type: 'arrayStart' });
      index += 1;
    } else if (char === ']') {
      tokens.push({ type: 'arrayEnd' });
      index += 1;
    } else if (char === '/') {
      let end = index + 1;
      while (end < content.length && isRegular(content[end])) end += 1;
      tokens.push({ type: 'name', value: content.slice(index + 1, end) });
      index = end;
    } else if (DELIMITERS.has(char)) {
      tokens.push({ type: 'other' });
      index += 1;
    } else {
      let end = index;
      while (end < content.length && isRegular(content[end])) end += 1;
      const value = content.slice(index, end);
      index = end === index ? index + 1 : end;
      if (/^[+-]?[\d.]+$/.test(value)) {
        tokens.push({ type: 'other' });
      } else if (value === 'BI') {
        index = skipInlineImage(content, index);
      } else {
        tokens.push({ type: 'op', value });
      }
    }
  }

  return tokens;
}

/** 按内容流顺序取出所有文字绘制操作。 */
export function parseShowRuns(content: string): ShowRun[] {
  const runs: ShowRun[] = [];
  const operands: Token[] = [];
  let font: string | null = null;

  for (const token of tokenize(content)) {
    if (token.type !== 'op') {
      operands.push(token);
      continue;
    }

    if (token.value === 'Tf') {
      const name = [...operands].reverse().find((operand) => operand.type === 'name');
      if (name?.value) font = name.value;
    } else if (token.value === 'Tj' || token.value === "'" || token.value === '"') {
      const piece = [...operands].reverse().find((operand) => operand.type === 'string')?.piece;
      if (piece) runs.push({ font, pieces: [piece], text: piece.bytes });
    } else if (token.value === 'TJ') {
      const pieces = operands
        .filter((operand) => operand.type === 'string')
        .map((operand) => operand.piece as StringPiece);
      if (pieces.length > 0) {
        runs.push({ font, pieces, text: pieces.map((piece) => piece.bytes).join('') });
      }
    }

    operands.length = 0;
  }

  return runs;
}

const stripSpaces = (text: string) => text.replace(/\s+/g, '');

/**
 * pdf.js 的一条文本可能由连续几个 show 操作符拼成，所以按窗口而不是单条匹配。
 *
 * `normalize` 用于第二轮匹配：pdf.js 会把 TJ 数组里较大的字距位移**合成成空格**
 * （`[(Hello)-400(world)]` 抽出来是 "Hello world"，内容流里其实是 "Helloworld"），
 * 而用字距代替空格是 LaTeX / Ghostscript 等排版器的常规做法。只按字节精确比较，
 * 这类文档整页都会匹配不上。
 */
function findRunWindow(
  runs: ShowRun[],
  original: string,
  occurrence: number,
  normalize: (text: string) => string = (text) => text
): ShowRun[] | null {
  const target = normalize(original);
  if (target.length === 0) return null;
  let seen = 0;

  for (let start = 0; start < runs.length; start += 1) {
    let text = '';
    for (let end = start; end < Math.min(runs.length, start + MAX_RUN_WINDOW); end += 1) {
      if (runs[end].font !== runs[start].font) break;
      text += runs[end].text;
      const normalized = normalize(text);
      if (normalized === target) {
        if (seen === occurrence) return runs.slice(start, end + 1);
        seen += 1;
        start = end;
        break;
      }
      if (normalized.length >= target.length) break;
    }
  }

  return null;
}

/** 先按字节精确匹配，失败再退回忽略空白的匹配。 */
function locateRunWindow(runs: ShowRun[], rewrite: PdfTextRewrite): ShowRun[] | null {
  return (
    findRunWindow(runs, rewrite.original, rewrite.occurrence) ??
    findRunWindow(runs, rewrite.original, rewrite.occurrence, stripSpaces)
  );
}

function getPageFontDict(page: ReturnType<PDFDocument['getPages']>[number], name: string): PDFDict | undefined {
  // normalize 会把从 Pages 节点继承来的 Resources 拉到本页上，否则继承的页面取不到字体。
  page.node.normalize();
  const resources = page.node.Resources();
  const fonts = resources ? lookupDict(resources, 'Font') : undefined;
  return fonts ? lookupDict(fonts, name) : undefined;
}

/**
 * 新文字能不能用这个字体写出来。
 *
 * 宁可判失败也不写出空白字形：多字节字体直接拒绝；带 /Differences 的自定义编码只允许
 * 复用原文里已经出现过的字符；有 /Widths 的字体逐个字符检查宽度是否存在。
 */
function canEncodeWithFont(fontDict: PDFDict | undefined, next: string, knownChars: Set<string>): boolean {
  for (const char of next) {
    if (char.charCodeAt(0) > 0xff) return false;
  }
  if (!fontDict) return false;

  if (isMultiByteFont(fontDict)) return false;

  const encoding = lookupDict(fontDict, 'Encoding');
  if (encoding && lookupArray(encoding, 'Differences')) {
    return [...next].every((char) => knownChars.has(char));
  }

  const widths = lookupArray(fontDict, 'Widths');
  const firstChar = lookupNumber(fontDict, 'FirstChar');
  if (!widths || firstChar === undefined) return true;

  return [...next].every((char) => {
    if (knownChars.has(char)) return true;
    const width = widths.lookup(char.charCodeAt(0) - firstChar);
    return width instanceof PDFNumber && width.asNumber() > 0;
  });
}

function isMultiByteFont(fontDict: PDFDict): boolean {
  return lookupName(fontDict, 'Subtype')?.asString() === '/Type0';
}

function escapeLiteral(text: string): string {
  let out = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (char === '\\' || char === '(' || char === ')') out += `\\${char}`;
    else if (code < 32 || code > 126) out += `\\${code.toString(8).padStart(3, '0')}`;
    else out += char;
  }
  return `(${out})`;
}

function readPageContent(pdfDoc: PDFDocument, page: ReturnType<PDFDocument['getPages']>[number]): string | null {
  const contents = page.node.Contents();
  if (!contents) return null;

  const streams: PDFStream[] = [];
  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i += 1) {
      const stream = contents.lookup(i);
      if (stream instanceof PDFStream) streams.push(stream);
    }
  } else if (contents instanceof PDFStream) {
    streams.push(contents);
  } else {
    const stream = pdfDoc.context.lookup(contents);
    if (stream instanceof PDFStream) streams.push(stream);
  }

  if (streams.length === 0) return null;

  return streams
    .map((stream) =>
      latin1Decode(stream instanceof PDFRawStream ? decodePDFRawStream(stream).decode() : stream.getContents())
    )
    .join('\n');
}

/**
 * 把改写结果写回页面。
 *
 * 覆盖原来的内容流对象而不是注册一个新对象：注册新对象会让写着旧文字的旧流以孤立
 * 对象的形式留在文件里，用文本编辑器就能把被改掉的原文捞出来。多段内容流会合并到
 * 第一段，其余几段写成空流。
 */
function writePageContent(
  pdfDoc: PDFDocument,
  page: ReturnType<PDFDocument['getPages']>[number],
  content: string
): void {
  const stream = pdfDoc.context.flateStream(latin1Encode(content));
  const contents = page.node.get(PDFName.of('Contents'));

  if (contents instanceof PDFRef) {
    pdfDoc.context.assign(contents, stream);
    return;
  }

  if (contents instanceof PDFArray) {
    const refs: PDFRef[] = [];
    for (let i = 0; i < contents.size(); i += 1) {
      const ref = contents.get(i);
      if (ref instanceof PDFRef) refs.push(ref);
    }
    if (refs.length > 0) {
      pdfDoc.context.assign(refs[0], stream);
      for (const ref of refs.slice(1)) {
        pdfDoc.context.assign(ref, pdfDoc.context.flateStream(new Uint8Array()));
      }
      return;
    }
  }

  page.node.set(PDFName.of('Contents'), pdfDoc.context.register(stream));
}

export async function applyPdfTextRewrites(
  source: ArrayBuffer | Uint8Array,
  rewrites: PdfTextRewrite[]
): Promise<PdfTextRewriteResult> {
  const pdfDoc = await PDFDocument.load(source);
  const pages = pdfDoc.getPages();
  const applied: PdfTextRewrite[] = [];
  const failed: PdfTextRewriteFailure[] = [];

  const byPage = new Map<number, PdfTextRewrite[]>();
  for (const rewrite of rewrites) {
    const list = byPage.get(rewrite.pageIndex) ?? [];
    list.push(rewrite);
    byPage.set(rewrite.pageIndex, list);
  }

  for (const [pageIndex, pageRewrites] of byPage) {
    const page = pages[pageIndex];
    const content = page ? readPageContent(pdfDoc, page) : null;
    if (!page || content === null) {
      for (const rewrite of pageRewrites) failed.push({ rewrite, reason: 'not_found' });
      continue;
    }

    const runs = parseShowRuns(content);
    // 先算出全部替换区间，再从后往前写，避免前面的替换挪动后面的偏移。
    const spans: Array<{ start: number; end: number; text: string }> = [];

    for (const rewrite of pageRewrites) {
      const window = locateRunWindow(runs, rewrite);
      if (!window) {
        failed.push({ rewrite, reason: 'not_found' });
        continue;
      }

      const fontName = window[0].font;
      const fontDict = fontName ? getPageFontDict(page, fontName) : undefined;
      const knownChars = new Set(window.map((run) => run.text).join(''));
      if (!canEncodeWithFont(fontDict, rewrite.next, knownChars)) {
        failed.push({
          rewrite,
          reason: fontDict && isMultiByteFont(fontDict) ? 'unsupported_font' : 'unavailable_glyph',
        });
        continue;
      }

      const pieces = window.flatMap((run) => run.pieces);
      spans.push({ start: pieces[0].start, end: pieces[0].end, text: escapeLiteral(rewrite.next) });
      // 其余片段（TJ 的字距微调分段）清空，新文字整体放进第一段。
      for (const piece of pieces.slice(1)) {
        spans.push({ start: piece.start, end: piece.end, text: piece.hex ? '<>' : '()' });
      }
      applied.push(rewrite);
    }

    if (spans.length === 0) continue;

    let next = content;
    for (const span of spans.sort((a, b) => b.start - a.start)) {
      next = next.slice(0, span.start) + span.text + next.slice(span.end);
    }
    writePageContent(pdfDoc, page, next);
  }

  return { bytes: await pdfDoc.save(), applied, failed };
}
