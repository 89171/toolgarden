/**
 * 视频画面截取（裁剪区域）— 纯函数层。
 *
 * 选区用「归一化坐标」表示：x / y / width / height 均为 0~1，
 * 相对源视频宽高。这样选区与预览尺寸、视频真实分辨率解耦，
 * 拖拽与导出共用同一份数据。
 *
 * 本文件保持纯函数：不依赖 DOM / React，返回判别联合类型，不抛异常。
 */

export interface CropRect {
  /** 归一化左上角 x（0~1） */
  x: number;
  /** 归一化左上角 y（0~1） */
  y: number;
  /** 归一化宽度（0~1） */
  width: number;
  /** 归一化高度（0~1） */
  height: number;
}

/** 常见固定比例预设；free 表示不锁定比例 */
export const CROP_RATIO_PRESETS = [
  { id: 'free', label: 'free', ratio: null },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
  { id: '9:16', label: '9:16', ratio: 9 / 16 },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '3:4', label: '3:4', ratio: 3 / 4 },
] as const;

export type CropRatioId = (typeof CROP_RATIO_PRESETS)[number]['id'];

/** 选区最小归一化边长：低于该值的手势视为无效，防止选区缩成一点 */
export const CROP_MIN_SIZE = 0.05;

/** 把任意数值夹进 [min, max] */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

/** 修正非法选区：夹进 [0,1]、保证最小尺寸、宽度高度不为负 */
export function normalizeCropRect(rect: CropRect): CropRect {
  const width = clamp(rect.width, 0, 1);
  const height = clamp(rect.height, 0, 1);
  return {
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
    width: Math.max(width, Math.min(CROP_MIN_SIZE, 1)),
    height: Math.max(height, Math.min(CROP_MIN_SIZE, 1)),
  };
}

/**
 * 把拖动后的选区夹回画面内：不允许任何一边越出 [0,1]。
 * 移动时整体平移（宽高不变），只调 x / y。
 */
export function clampCropRectInside(rect: CropRect): CropRect {
  const width = clamp(rect.width, CROP_MIN_SIZE, 1);
  const height = clamp(rect.height, CROP_MIN_SIZE, 1);
  return {
    width,
    height,
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
  };
}

/**
 * 把自由拖出的选区吸附到指定比例。
 * 以选区当前面积为主要依据：优先保持面积不变，取「按比例算出的宽」与
 * 「按比例算出的高」中受画面边界限制更小的那个方向，再反推另一边。
 */
export function snapCropRectToRatio(rect: CropRect, ratio: number | null): CropRect {
  const base = clampCropRectInside(rect);
  if (!ratio || !Number.isFinite(ratio) || ratio <= 0) {
    return base;
  }
  const area = base.width * base.height;
  // 由面积反推理想宽高
  let width = Math.sqrt(area * ratio);
  let height = width / ratio;

  // 超出画面时按边界收缩并保持比例
  if (width > 1) {
    width = 1;
    height = width / ratio;
  }
  if (height > 1) {
    height = 1;
    width = height * ratio;
  }
  if (width < CROP_MIN_SIZE || height < CROP_MIN_SIZE) {
    return base;
  }

  // 保持选区中心不动
  const centerX = base.x + base.width / 2;
  const centerY = base.y + base.height / 2;
  return clampCropRectInside({
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  });
}

/**
 * 在归一化空间里按「像素空间的比例」调整选区大小。
 * 归一化空间的纵横比与像素空间不同（画面非 1:1 时），直接按数值比例会变形；
 * 这里把像素比例换算成归一化比例后再套用 snapCropRectToRatio。
 */
export function snapCropRectToPixelRatio(
  rect: CropRect,
  pixelRatio: number | null,
  videoWidth: number,
  videoHeight: number
): CropRect {
  if (!pixelRatio || !Number.isFinite(pixelRatio) || pixelRatio <= 0) {
    return clampCropRectInside(rect);
  }
  if (!Number.isFinite(videoWidth) || !Number.isFinite(videoHeight) || videoWidth <= 0 || videoHeight <= 0) {
    return clampCropRectInside(rect);
  }
  // 归一化空间中 1 单位宽 = videoWidth 像素，1 单位高 = videoHeight 像素。
  // 归一化比例 = (像素宽 / videoWidth) / (像素高 / videoHeight) = pixelRatio * videoHeight / videoWidth
  const normalizedRatio = (pixelRatio * videoHeight) / videoWidth;
  return snapCropRectToRatio(rect, normalizedRatio);
}

/** 拖拽手柄类型：四角 + 四边 */
export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export interface ResizeGestureInput {
  /** 拖拽前的选区 */
  rect: CropRect;
  handle: CropHandle;
  /** 指针在归一化空间中的位置 */
  pointer: { x: number; y: number };
  /** 归一化空间中的目标比例（像素比例换算后），null 表示自由 */
  ratio: number | null;
  /**
   * 手势按下时的指针位置。传入后按「相对位移」计算：
   * 把位移加到被拖动手柄（或选区中心）的初始锚点上，得到等效指针位置。
   * 不传则沿用旧行为（pointer 直接作为落点），保留给非手势调用方。
   */
  startPoint?: { x: number; y: number };
}

/** 手势起始时被拖动的锚点：move 是选区中心，其余手柄是对应的边/角 */
export function getCropHandleAnchor(rect: CropRect, handle: CropHandle): { x: number; y: number } {
  const base = clampCropRectInside(rect);
  const centerX = base.x + base.width / 2;
  const centerY = base.y + base.height / 2;
  // 注意必须先排除 'move'：字符串 'move' 里含字母 e/w 语义无关，
  // 直接用 includes('e') 判断会把它当成东边手柄。
  if (handle === 'move') return { x: centerX, y: centerY };
  return {
    x: handle.includes('w') ? base.x : handle.includes('e') ? base.x + base.width : centerX,
    y: handle.includes('n') ? base.y : handle.includes('s') ? base.y + base.height : centerY,
  };
}

/** 把「指针绝对位置」换算成手柄锚点应到达的位置 */
function resolveGesturePointer(start: CropRect, input: ResizeGestureInput): { x: number; y: number } {
  if (!input.startPoint) return input.pointer;
  const anchor = getCropHandleAnchor(start, input.handle);
  return {
    x: anchor.x + (input.pointer.x - input.startPoint.x),
    y: anchor.y + (input.pointer.y - input.startPoint.y),
  };
}

/**
 * 手柄缩放：根据被拖动的边/角更新选区，锁定比例时以拖动主方向为准。
 * 结果保证在画面内且不小于最小尺寸。
 */
export function resizeCropRect(input: ResizeGestureInput): CropRect {
  const { handle, ratio } = input;
  const start = clampCropRectInside(input.rect);
  const pointer = resolveGesturePointer(start, input);

  if (handle === 'move') {
    return clampCropRectInside({ ...start, x: pointer.x - start.width / 2, y: pointer.y - start.height / 2 });
  }

  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (handle.includes('w')) left = clamp(pointer.x, 0, right - CROP_MIN_SIZE);
  if (handle.includes('e')) right = clamp(pointer.x, left + CROP_MIN_SIZE, 1);
  if (handle.includes('n')) top = clamp(pointer.y, 0, bottom - CROP_MIN_SIZE);
  if (handle.includes('s')) bottom = clamp(pointer.y, top + CROP_MIN_SIZE, 1);

  let rect: CropRect = { x: left, y: top, width: right - left, height: bottom - top };

  if (ratio && ratio > 0) {
    // 锁定比例：以被拖动的主方向为准反推另一维度，锚定对侧边
    if (handle === 'n' || handle === 's') {
      // 只拖上下边：以宽度为准反推高度
      const height = Math.min(rect.width / ratio, handle === 'n' ? bottom : 1 - top);
      rect = handle === 'n'
        ? { x: rect.x, y: bottom - height, width: rect.width, height }
        : { x: rect.x, y: top, width: rect.width, height };
    } else if (handle === 'e' || handle === 'w') {
      // 只拖左右边：以高度为准反推宽度
      const width = Math.min(rect.height * ratio, handle === 'w' ? right : 1 - left);
      rect = handle === 'w'
        ? { x: right - width, y: rect.y, width, height: rect.height }
        : { x: left, y: rect.y, width, height: rect.height };
    } else {
      // 角手柄：宽高都跟随指针，再按比例取交集
      rect = fitRectToRatioFromCorner(rect, handle, ratio);
    }
  }

  return clampCropRectInside(rect);
}

/** 角手柄的比例拟合：保持对角锚点不动，选区在指针位置与比例约束间取最大可满足者 */
function fitRectToRatioFromCorner(rect: CropRect, handle: CropHandle, ratio: number): CropRect {
  const widthByPointer = rect.width;
  const heightByPointer = rect.height;
  // 两种满足方式：给定宽反推高 / 给定高反推宽，取能同时容纳指针拖动量的那个
  const heightFromWidth = widthByPointer / ratio;
  const widthFromHeight = heightByPointer * ratio;

  let width: number;
  let height: number;
  if (heightFromWidth <= heightByPointer) {
    width = widthByPointer;
    height = heightFromWidth;
  } else {
    width = widthFromHeight;
    height = heightByPointer;
  }

  width = Math.max(width, CROP_MIN_SIZE);
  height = Math.max(height, CROP_MIN_SIZE);

  // 对角锚点固定
  const anchorRight = handle.includes('w');
  const anchorBottom = handle.includes('n');
  const x = anchorRight ? rect.x + rect.width - width : rect.x;
  const y = anchorBottom ? rect.y + rect.height - height : rect.y;

  return clampCropRectInside({ x, y, width, height });
}

/**
 * 把归一化选区换算成源视频像素坐标，并做偶数对齐（H.264 要求）。
 * 返回 null 表示选区或视频尺寸非法。
 */
export function cropRectToPixelRegion(
  rect: CropRect,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number; width: number; height: number } | null {
  if (!Number.isFinite(videoWidth) || !Number.isFinite(videoHeight) || videoWidth < 2 || videoHeight < 2) {
    return null;
  }
  const base = clampCropRectInside(rect);
  const left = Math.round(base.x * videoWidth);
  const top = Math.round(base.y * videoHeight);
  const width = Math.round(base.width * videoWidth);
  const height = Math.round(base.height * videoHeight);
  if (width < 2 || height < 2) {
    return null;
  }
  const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);
  // 偶数对齐后可能超出画面，往回夹
  const x = Math.min(Math.max(0, Math.round(left / 2) * 2), videoWidth - even(width));
  const y = Math.min(Math.max(0, Math.round(top / 2) * 2), videoHeight - even(height));
  return { x, y, width: even(width), height: even(height) };
}

/** 选区信息展示：换算成源视频像素值与比例标签 */
export function describeCropRegion(
  rect: CropRect,
  videoWidth: number,
  videoHeight: number
): { pixel: { x: number; y: number; width: number; height: number }; ratioLabel: string } | null {
  const region = cropRectToPixelRegion(rect, videoWidth, videoHeight);
  if (!region) return null;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(region.width, region.height);
  const ratioLabel = `${Math.round(region.width / divisor)}:${Math.round(region.height / divisor)}`;
  return { pixel: region, ratioLabel };
}
