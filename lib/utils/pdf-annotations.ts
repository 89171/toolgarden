import fontkit from '@pdf-lib/fontkit';
import {
  PDFArray,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFRef,
  PDFString,
  StandardFonts,
  type PDFFont,
  type PDFObject,
  type PDFPage,
} from 'pdf-lib';

/**
 * 把标注写成 PDF 原生注释对象（Ink / Square / FreeText / Stamp），而不是把整页
 * 压成一张透明 PNG 贴上去。
 *
 * 这样标注是矢量的：放大不糊、体积小两三个数量级、与导出分辨率无关，而且在
 * Acrobat 等阅读器里还能被单独选中和删除。
 *
 * 坐标约定：所有输入都在「显示点空间」——原点在**显示出来的页面**左下角、y 向上、
 * 单位是 pt。调用方负责把画布像素除以渲染倍率并翻转 y。页面旋转、CropBox 原点
 * 由这里的 /Matrix 统一处理。
 */

/** pdf-lib 的 context.obj() / flateStream() 接受的字面量结构 */
type PdfLiteral = PDFObject | string | number | boolean | null | undefined | PdfLiteral[] | { [key: string]: PdfLiteral };
type PdfDictLiteral = { [key: string]: PdfLiteral };

/** 页面的可见区域：CropBox 与 MediaBox 的交集，原点不一定是 (0,0) */
export interface PageBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * pdf.js 按 CropBox（与 MediaBox 的交集）渲染，而 pdf-lib 的 getSize() 给的是
 * MediaBox 尺寸且忽略原点。裁切过的页面（印刷出血稿、部分扫描件）两者不一致，
 * 按 getSize() 定位会被缩放并偏移。
 */
export function getVisiblePageBox(page: PDFPage): PageBox {
  const media = page.getMediaBox();
  const crop = page.getCropBox();
  const left = Math.max(media.x, crop.x);
  const bottom = Math.max(media.y, crop.y);
  const right = Math.min(media.x + media.width, crop.x + crop.width);
  const top = Math.min(media.y + media.height, crop.y + crop.height);
  if (right <= left || top <= bottom) return media;
  return { x: left, y: bottom, width: right - left, height: top - bottom };
}

export interface Point {
  x: number;
  y: number;
}

/** 0-1 区间的 RGB */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** [a, b, c, d, e, f] */
export type Matrix = readonly [number, number, number, number, number, number];

export type AnnotationShape =
  | {
      kind: 'ink';
      polylines: Point[][];
      color: Rgb;
      opacity: number;
      lineWidth: number;
    }
  | {
      kind: 'square';
      /** 四个角，顺序为左上、右上、右下、左下（支持旋转过的矩形） */
      polygon: Point[];
      stroke?: Rgb;
      fill?: Rgb;
      opacity: number;
      lineWidth: number;
    }
  | {
      kind: 'text';
      text: string;
      size: number;
      color: Rgb;
      opacity: number;
      /** 文本矩阵：把字号为 1 的文字空间映射到显示点空间 */
      matrix: Matrix;
    }
  | {
      kind: 'image';
      /** 四个角，顺序为左上、右上、右下、左下 */
      polygon: Point[];
      dataUrl: string;
      opacity: number;
    };

export interface AnnotationOptions {
  /**
   * 非 WinAnsi 文字（中文等）用的字体字节，**必须是已经裁好的 TTF 子集**
   * （见 pdf-cjk-font.ts：pdf-lib 自己的子集化对 CJK 字体会写错字形）。
   * 不给就只能写 Latin，调用方需要自己把这类文字栅格化。
   */
  unicodeFont?: Uint8Array | null;
}

export interface PageAnnotations {
  /** 0-based 页码 */
  pageIndex: number;
  shapes: AnnotationShape[];
}

/** WinAnsi 大致覆盖 Latin-1，超出的字符标准 14 字体写不出来。 */
export function isWinAnsiEncodable(text: string): boolean {
  return [...text].every((char) => char.charCodeAt(0) <= 0xff);
}

function format(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value * 1000) / 1000) : '0';
}

function colorOps(color: Rgb, stroke: boolean): string {
  const op = stroke ? 'RG' : 'rg';
  return `${format(color.r)} ${format(color.g)} ${format(color.b)} ${op}`;
}

function boundsOf(points: Point[]): { x: number; y: number; width: number; height: number } {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

/**
 * 显示点空间 → 未旋转的页面用户空间。
 *
 * 四个角度都是纯旋转（没有翻转），所以文字不会被镜像；页面盒子原点非零时一并平移。
 */
export function getDisplayMatrix(rotation: number, box: PageBox): Matrix {
  const angle = ((Math.round(rotation) % 360) + 360) % 360;
  const { x, y, width, height } = box;
  if (angle === 90) return [0, 1, -1, 0, x + width, y];
  if (angle === 180) return [-1, 0, 0, -1, x + width, y + height];
  if (angle === 270) return [0, -1, 1, 0, x, y + height];
  return [1, 0, 0, 1, x, y];
}

function applyMatrix(matrix: Matrix, point: Point): Point {
  const [a, b, c, d, e, f] = matrix;
  return { x: a * point.x + c * point.y + e, y: b * point.x + d * point.y + f };
}

/** 注释的 /Rect 必须是用户空间里的轴对齐外框。 */
function rectInUserSpace(matrix: Matrix, points: Point[]): [number, number, number, number] {
  const mapped = points.map((point) => applyMatrix(matrix, point));
  const bounds = boundsOf(mapped);
  return [bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height];
}

function inkOperators(shape: Extract<AnnotationShape, { kind: 'ink' }>): string {
  const path = shape.polylines
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .map((point, index) => `${format(point.x)} ${format(point.y)} ${index === 0 ? 'm' : 'l'}`)
        .join('\n')
    )
    .join('\n');
  return [
    '/GS0 gs',
    colorOps(shape.color, true),
    `${format(Math.max(0.1, shape.lineWidth))} w`,
    '1 J',
    '1 j',
    path,
    'S',
  ].join('\n');
}

function squareOperators(shape: Extract<AnnotationShape, { kind: 'square' }>): string {
  const [first, ...rest] = shape.polygon;
  if (!first) return '';
  const path = [
    `${format(first.x)} ${format(first.y)} m`,
    ...rest.map((point) => `${format(point.x)} ${format(point.y)} l`),
    'h',
  ].join('\n');

  const paint = shape.fill && shape.stroke ? 'B' : shape.fill ? 'f' : 'S';
  return [
    '/GS0 gs',
    shape.fill ? colorOps(shape.fill, false) : '',
    shape.stroke ? colorOps(shape.stroke, true) : '',
    `${format(Math.max(0.1, shape.lineWidth))} w`,
    path,
    paint,
  ]
    .filter(Boolean)
    .join('\n');
}

function escapeLiteral(text: string): string {
  let out = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (char === '\\' || char === '(' || char === ')') out += `\\${char}`;
    else if (code < 32 || code > 126) out += `\\${(code & 0xff).toString(8).padStart(3, '0')}`;
    else out += char;
  }
  return `(${out})`;
}

function textOperators(shape: Extract<AnnotationShape, { kind: 'text' }>, font: PDFFont): string {
  const [a, b, c, d, e, f] = shape.matrix;
  // 内嵌字体有自己的编码（子集化后更是如此），必须用 encodeText 而不是原样写字节
  const encoded = font.name.startsWith('Helvetica')
    ? escapeLiteral(shape.text)
    : font.encodeText(shape.text).toString();
  return [
    '/GS0 gs',
    colorOps(shape.color, false),
    'BT',
    `/F0 ${format(shape.size)} Tf`,
    `${format(a)} ${format(b)} ${format(c)} ${format(d)} ${format(e)} ${format(f)} Tm`,
    `${encoded} Tj`,
    'ET',
  ].join('\n');
}

function imageOperators(shape: Extract<AnnotationShape, { kind: 'image' }>): string {
  const [topLeft, topRight, , bottomLeft] = shape.polygon;
  // 图像画在单位正方形里，用 cm 把它摆到四个角围出的平行四边形上。
  const ax = topRight.x - topLeft.x;
  const ay = topRight.y - topLeft.y;
  const bx = topLeft.x - bottomLeft.x;
  const by = topLeft.y - bottomLeft.y;
  return [
    'q',
    '/GS0 gs',
    `${format(ax)} ${format(ay)} ${format(bx)} ${format(by)} ${format(bottomLeft.x)} ${format(bottomLeft.y)} cm`,
    '/Im0 Do',
    'Q',
  ].join('\n');
}

function shapePoints(shape: AnnotationShape, font: PDFFont | null): Point[] {
  switch (shape.kind) {
    case 'ink':
      return shape.polylines.flat();
    case 'square':
    case 'image':
      return shape.polygon;
    case 'text': {
      // 宽度必须按字体实测：中文一个字接近 1em，按字符数估会把后面的字裁掉
      const width = font
        ? font.widthOfTextAtSize(shape.text, shape.size)
        : shape.text.length * shape.size;
      const corners: Point[] = [
        { x: 0, y: -shape.size * 0.3 },
        { x: width, y: -shape.size * 0.3 },
        { x: width, y: shape.size * 1.1 },
        { x: 0, y: shape.size * 1.1 },
      ];
      return corners.map((point) => applyMatrix(shape.matrix, point));
    }
  }
}

const SUBTYPE: Record<AnnotationShape['kind'], string> = {
  ink: 'Ink',
  square: 'Square',
  text: 'FreeText',
  image: 'Stamp',
};

/** 把标注写进 PDF。返回新的字节，原页面内容与文字层不变。 */
export async function applyPdfAnnotations(
  source: ArrayBuffer | Uint8Array,
  annotations: PageAnnotations[],
  options: AnnotationOptions = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(source);
  const pages = pdfDoc.getPages();
  let helvetica: PDFFont | null = null;
  let unicodeFont: PDFFont | null = null;

  const fontFor = async (text: string): Promise<PDFFont> => {
    if (isWinAnsiEncodable(text) || !options.unicodeFont) {
      helvetica ??= await pdfDoc.embedFont(StandardFonts.Helvetica);
      return helvetica;
    }
    if (!unicodeFont) {
      pdfDoc.registerFontkit(fontkit);
      // 字体在外面已经裁过子集，这里原样嵌入；交给 pdf-lib 再裁会写出错位的字形
      unicodeFont = await pdfDoc.embedFont(options.unicodeFont, { subset: false });
    }
    return unicodeFont;
  };

  for (const { pageIndex, shapes } of annotations) {
    const page = pages[pageIndex];
    if (!page || shapes.length === 0) continue;

    const matrix = getDisplayMatrix(page.getRotation().angle, getVisiblePageBox(page));
    const refs: PDFRef[] = [];

    for (const shape of shapes) {
      // 没有 Unicode 字体时写不出非 WinAnsi 文字，跳过而不是崩掉；
      // 调用方（编辑器）在这种情况下会把这个对象单独栅格化。
      if (shape.kind === 'text' && !options.unicodeFont && !isWinAnsiEncodable(shape.text)) continue;

      const font = shape.kind === 'text' ? await fontFor(shape.text) : null;
      const points = shapePoints(shape, font);
      if (points.length === 0) continue;

      const bounds = boundsOf(points);
      // BBox 留一点余量，描边和抗锯齿不会被裁掉
      const pad = shape.kind === 'ink' || shape.kind === 'square' ? shape.lineWidth + 1 : 1;
      const bbox = [
        bounds.x - pad,
        bounds.y - pad,
        bounds.x + bounds.width + pad,
        bounds.y + bounds.height + pad,
      ];

      const resources: PdfDictLiteral = {
        ExtGState: { GS0: { Type: 'ExtGState', ca: shape.opacity, CA: shape.opacity } },
      };

      if (font) resources.Font = { F0: font.ref };
      if (shape.kind === 'image') {
        const image = await pdfDoc.embedPng(shape.dataUrl);
        resources.XObject = { Im0: image.ref };
      }

      const operators =
        shape.kind === 'ink'
          ? inkOperators(shape)
          : shape.kind === 'square'
            ? squareOperators(shape)
            : shape.kind === 'text'
              ? textOperators(shape, font as PDFFont)
              : imageOperators(shape);
      if (!operators) continue;

      const appearance = pdfDoc.context.flateStream(operators, {
        Type: 'XObject',
        Subtype: 'Form',
        FormType: 1,
        BBox: bbox,
        Matrix: [...matrix],
        Resources: resources,
      });
      const appearanceRef = pdfDoc.context.register(appearance);

      const annotation: PdfDictLiteral = {
        Type: 'Annot',
        Subtype: SUBTYPE[shape.kind],
        Rect: rectInUserSpace(matrix, [
          { x: bbox[0], y: bbox[1] },
          { x: bbox[2], y: bbox[1] },
          { x: bbox[2], y: bbox[3] },
          { x: bbox[0], y: bbox[3] },
        ]),
        // 4 = Print：不加这个标志有些阅读器打印时会漏掉标注
        F: 4,
        AP: { N: appearanceRef },
      };

      if (shape.kind === 'ink') {
        annotation.InkList = shape.polylines.map((line) =>
          line.flatMap((point) => {
            const mapped = applyMatrix(matrix, point);
            return [mapped.x, mapped.y];
          })
        );
        annotation.C = [shape.color.r, shape.color.g, shape.color.b];
        annotation.CA = shape.opacity;
        annotation.BS = { W: shape.lineWidth };
      }
      if (shape.kind === 'square') {
        annotation.CA = shape.opacity;
        if (shape.stroke) annotation.C = [shape.stroke.r, shape.stroke.g, shape.stroke.b];
        if (shape.fill) annotation.IC = [shape.fill.r, shape.fill.g, shape.fill.b];
        annotation.BS = { W: shape.lineWidth };
      }

      const ref = pdfDoc.context.register(pdfDoc.context.obj(annotation));

      if (shape.kind === 'text') {
        // /Contents 走 UTF-16BE，非 ASCII 的批注内容在阅读器里也能正确显示
        const dict = pdfDoc.context.lookup(ref);
        if (dict && 'set' in dict) {
          const contents = isWinAnsiEncodable(shape.text)
            ? PDFString.of(shape.text)
            : PDFHexString.fromText(shape.text);
          (dict as { set: (key: PDFName, value: unknown) => void }).set(
            PDFName.of('Contents'),
            contents
          );
          (dict as { set: (key: PDFName, value: unknown) => void }).set(
            PDFName.of('DA'),
            PDFString.of(
              `${format(shape.color.r)} ${format(shape.color.g)} ${format(shape.color.b)} rg /Helv ${format(shape.size)} Tf`
            )
          );
        }
      }

      refs.push(ref);
    }

    if (refs.length > 0) appendAnnots(pdfDoc, page, refs);
  }

  return pdfDoc.save();
}

function appendAnnots(pdfDoc: PDFDocument, page: PDFPage, refs: PDFRef[]): void {
  const existing = page.node.lookup(PDFName.of('Annots'));
  if (existing instanceof PDFArray) {
    for (const ref of refs) existing.push(ref);
    return;
  }
  page.node.set(PDFName.of('Annots'), pdfDoc.context.obj(refs));
}
