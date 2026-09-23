import { Point as FabricPoint, util, type FabricObject } from 'fabric';
import { parseColor } from './color';
import { isWinAnsiEncodable, type AnnotationShape, type Point, type Rgb } from './pdf-annotations';

/**
 * 把画布上的标注对象转成矢量注释形状。
 *
 * 输出坐标是「显示点空间」：原点在显示出来的页面左下角、y 向上、单位 pt，
 * 与 pdf-annotations 的约定一致。
 *
 * 认不出来的对象类型（以及字体写不出来的文字）会退回到「只栅格化这一个对象」，
 * 而不是把整页压成图片。
 */

export interface ShapeConversionOptions {
  /** 画布像素 → 显示点的倍率，也就是渲染页面时用的 scale */
  scale: number;
  /** 画布像素高度，用于把 y 轴翻成向上 */
  canvasHeight: number;
  /**
   * 是否允许把非 WinAnsi 文字（中文等）也写成文字。
   * 只有在拿到了 Unicode 字体时才置 true，否则这类文字会退回栅格化。
   */
  allowUnicodeText?: boolean;
}

/** 单个对象栅格化时的分辨率倍率，只影响退化路径。 */
const RASTER_MULTIPLIER = 3;
/** fabric 默认行高系数与基线位置的经验值 */
const LINE_HEIGHT = 1.16;
const BASELINE_RATIO = 0.79;

function toRgb(value: unknown, fallback: Rgb | null = null): { rgb: Rgb; alpha: number } | null {
  if (typeof value !== 'string' || value === '' || value === 'transparent') {
    return fallback ? { rgb: fallback, alpha: 1 } : null;
  }
  const outcome = parseColor(value);
  if (!outcome.ok) return fallback ? { rgb: fallback, alpha: 1 } : null;
  const { r, g, b, a } = outcome.rgb;
  return { rgb: { r: r / 255, g: g / 255, b: b / 255 }, alpha: a ?? 1 };
}

function createToDisplay({ scale, canvasHeight }: ShapeConversionOptions) {
  return (x: number, y: number): Point => ({ x: x / scale, y: (canvasHeight - y) / scale });
}

function cornersOf(object: FabricObject, toDisplay: (x: number, y: number) => Point): Point[] {
  return object.getCoords().map((point) => toDisplay(point.x, point.y));
}

/** 把 Path 的命令终点串成折线；PencilBrush 生成的是密集的二次曲线，取终点足够平滑。 */
function pathPolyline(object: FabricObject, toDisplay: (x: number, y: number) => Point): Point[] {
  const commands = (object as unknown as { path?: unknown[] }).path;
  if (!Array.isArray(commands)) return [];
  const offset = (object as unknown as { pathOffset?: FabricPoint }).pathOffset ?? new FabricPoint(0, 0);
  const matrix = object.calcTransformMatrix();
  const points: Point[] = [];

  for (const command of commands) {
    if (!Array.isArray(command) || command.length < 3) continue;
    const x = Number(command[command.length - 2]);
    const y = Number(command[command.length - 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const mapped = util.transformPoint(new FabricPoint(x - offset.x, y - offset.y), matrix);
    points.push(toDisplay(mapped.x, mapped.y));
  }

  return points;
}

function rasterShape(
  object: FabricObject,
  toDisplay: (x: number, y: number) => Point
): AnnotationShape | null {
  try {
    const rect = object.getBoundingRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const dataUrl = object.toDataURL({ format: 'png', multiplier: RASTER_MULTIPLIER });
    return {
      kind: 'image',
      dataUrl,
      opacity: 1,
      polygon: [
        toDisplay(rect.left, rect.top),
        toDisplay(rect.left + rect.width, rect.top),
        toDisplay(rect.left + rect.width, rect.top + rect.height),
        toDisplay(rect.left, rect.top + rect.height),
      ],
    };
  } catch {
    return null;
  }
}

function textShapes(
  object: FabricObject,
  options: ShapeConversionOptions,
  toDisplay: (x: number, y: number) => Point
): AnnotationShape[] {
  const text = String((object as unknown as { text?: string }).text ?? '');
  if (text.trim() === '') return [];

  const fill = toRgb(object.fill, { r: 0, g: 0, b: 0 });
  if (!fill) return [];

  // 没有 Unicode 字体时，标准 14 字体只能写 WinAnsi 范围内的字符，中文等退回栅格化这一个对象
  if (!options.allowUnicodeText && !isWinAnsiEncodable(text)) {
    const raster = rasterShape(object, toDisplay);
    return raster ? [raster] : [];
  }

  const fontSize = Number((object as unknown as { fontSize?: number }).fontSize ?? 16);
  const matrix = object.calcTransformMatrix();
  const scaleY = Math.hypot(matrix[2], matrix[3]);
  const displaySize = (fontSize * scaleY) / options.scale;
  const angle = ((object.angle ?? 0) * Math.PI) / 180;
  // 画布 y 向下、角度顺时针；显示空间 y 向上，所以旋转方向取反。
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const localLeft = -(object.width ?? 0) / 2;
  const localTop = -(object.height ?? 0) / 2;

  return text.split('\n').flatMap((line, index) => {
    if (line.trim() === '') return [];
    const baselineY = localTop + fontSize * (LINE_HEIGHT * index + BASELINE_RATIO);
    const origin = util.transformPoint(new FabricPoint(localLeft, baselineY), matrix);
    const start = toDisplay(origin.x, origin.y);
    return [
      {
        kind: 'text' as const,
        text: line,
        size: displaySize,
        color: fill.rgb,
        opacity: (object.opacity ?? 1) * fill.alpha,
        matrix: [cos, -sin, sin, cos, start.x, start.y] as const,
      },
    ];
  });
}

export function fabricObjectsToShapes(
  objects: FabricObject[],
  options: ShapeConversionOptions
): AnnotationShape[] {
  const toDisplay = createToDisplay(options);
  const shapes: AnnotationShape[] = [];

  for (const object of objects) {
    const opacity = object.opacity ?? 1;
    const type = object.type;

    if (type === 'path') {
      const stroke = toRgb(object.stroke);
      const polyline = pathPolyline(object, toDisplay);
      if (!stroke || polyline.length < 2) continue;
      shapes.push({
        kind: 'ink',
        polylines: [polyline],
        color: stroke.rgb,
        opacity: opacity * stroke.alpha,
        lineWidth: (object.strokeWidth ?? 1) * Math.hypot(...object.calcTransformMatrix().slice(0, 2)) / options.scale,
      });
      continue;
    }

    if (type === 'rect') {
      const stroke = toRgb(object.stroke);
      const fill = toRgb(object.fill);
      if (!stroke && !fill) continue;
      shapes.push({
        kind: 'square',
        polygon: cornersOf(object, toDisplay),
        stroke: stroke?.rgb,
        fill: fill?.rgb,
        opacity: opacity * (fill?.alpha ?? stroke?.alpha ?? 1),
        lineWidth: (object.strokeWidth ?? 1) / options.scale,
      });
      continue;
    }

    if (type === 'i-text' || type === 'text' || type === 'textbox') {
      shapes.push(...textShapes(object, options, toDisplay));
      continue;
    }

    if (type === 'image') {
      const source = (object as unknown as { getSrc?: () => string }).getSrc?.();
      if (typeof source === 'string' && source.startsWith('data:image/png')) {
        shapes.push({ kind: 'image', dataUrl: source, opacity, polygon: cornersOf(object, toDisplay) });
        continue;
      }
      // 非 PNG（JPEG / SVG 等）统一走栅格化，避免再引一套解码分支
      const raster = rasterShape(object, toDisplay);
      if (raster) shapes.push({ ...raster, opacity });
      continue;
    }

    const raster = rasterShape(object, toDisplay);
    if (raster) shapes.push({ ...raster, opacity });
  }

  return shapes;
}

/**
 * 收集这批对象里所有非 WinAnsi 的文字字符。
 * 返回空串表示不需要额外字体，也就不用去下载。
 */
export function collectNonWinAnsiText(objects: FabricObject[]): string {
  const chars = new Set<string>();
  for (const object of objects) {
    const type = object.type;
    if (type !== 'i-text' && type !== 'text' && type !== 'textbox') continue;
    const text = String((object as unknown as { text?: string }).text ?? '');
    if (text.trim() === '' || isWinAnsiEncodable(text)) continue;
    for (const char of text) chars.add(char);
  }
  return [...chars].join('');
}
