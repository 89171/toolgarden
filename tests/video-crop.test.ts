import { describe, expect, it } from 'vitest';
import {
  clampCropRectInside,
  cropRectToPixelRegion,
  describeCropRegion,
  resizeCropRect,
  snapCropRectToPixelRatio,
  CROP_MIN_SIZE,
  type CropRect,
} from '../lib/utils/video-crop';

const FULL: CropRect = { x: 0, y: 0, width: 1, height: 1 };

describe('clampCropRectInside', () => {
  it('keeps the rect within [0,1] while moving', () => {
    expect(clampCropRectInside({ x: -0.2, y: 0.9, width: 0.4, height: 0.3 })).toEqual({
      x: 0,
      y: 0.7,
      width: 0.4,
      height: 0.3,
    });
  });

  it('enforces the minimum size', () => {
    const tiny = clampCropRectInside({ x: 0.4, y: 0.4, width: 0.001, height: 0.001 });
    expect(tiny.width).toBeGreaterThanOrEqual(CROP_MIN_SIZE);
    expect(tiny.height).toBeGreaterThanOrEqual(CROP_MIN_SIZE);
  });
});

describe('snapCropRectToPixelRatio', () => {
  it('centers a 16:9 region on a 16:9 video in normalized space', () => {
    // 1920×1080 视频：像素 16:9 在归一化空间里是 1:1
    const snapped = snapCropRectToPixelRatio(FULL, 16 / 9, 1920, 1080);
    expect(snapped.width).toBeCloseTo(1, 5);
    expect(snapped.height).toBeCloseTo(1, 5);
  });

  it('keeps pixel ratio 1:1 square on a 1920×1080 video', () => {
    const snapped = snapCropRectToPixelRatio({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 }, 1, 1920, 1080);
    // 高度顶满 1 时，宽度应为 1080/1920 = 0.5625
    expect(snapped.height).toBeCloseTo(1, 5);
    expect(snapped.width).toBeCloseTo(0.5625, 5);
    expect(snapped.x).toBeCloseTo(0.21875, 5);
  });

  it('returns the clamped rect for free ratio', () => {
    expect(snapCropRectToPixelRatio(FULL, null, 1920, 1080)).toEqual(FULL);
  });
});

describe('resizeCropRect', () => {
  it('moves the rect with the move handle', () => {
    const rect: CropRect = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
    const moved = resizeCropRect({ rect, handle: 'move', pointer: { x: 0.5, y: 0.5 }, ratio: null });
    expect(moved.x).toBeCloseTo(0.3, 5);
    expect(moved.y).toBeCloseTo(0.3, 5);
    expect(moved.width).toBeCloseTo(0.4, 5);
  });

  it('resizes from the south-east handle freely', () => {
    const rect: CropRect = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
    const resized = resizeCropRect({ rect, handle: 'se', pointer: { x: 0.9, y: 0.7 }, ratio: null });
    expect(resized.x).toBeCloseTo(0.2, 5);
    expect(resized.y).toBeCloseTo(0.2, 5);
    expect(resized.width).toBeCloseTo(0.7, 5);
    expect(resized.height).toBeCloseTo(0.5, 5);
  });

  it('respects the ratio when resizing from a corner handle', () => {
    const rect: CropRect = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
    // 归一化空间比例 1（如 16:9 视频 + 16:9 预设）
    const resized = resizeCropRect({ rect, handle: 'se', pointer: { x: 0.9, y: 0.5 }, ratio: 1 });
    expect(resized.width).toBeCloseTo(resized.height, 5);
    expect(resized.x).toBeCloseTo(0.2, 5);
    expect(resized.y).toBeCloseTo(0.2, 5);
  });

  it('anchors the opposite edge when dragging the west handle with a ratio', () => {
    const rect: CropRect = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
    const resized = resizeCropRect({ rect, handle: 'w', pointer: { x: 0.1, y: 0.4 }, ratio: 1 });
    expect(resized.x + resized.width).toBeCloseTo(0.6, 5);
    expect(resized.width).toBeCloseTo(resized.height, 5);
  });
});

describe('cropRectToPixelRegion', () => {
  it('converts to even-aligned pixel coordinates', () => {
    const region = cropRectToPixelRegion({ x: 0.25, y: 0.25, width: 0.5, height: 0.5 }, 1920, 1080);
    expect(region).toEqual({ x: 480, y: 270, width: 960, height: 540 });
  });

  it('rounds odd sizes to even values', () => {
    const region = cropRectToPixelRegion({ x: 0, y: 0, width: 0.5, height: 0.5 }, 641, 481);
    expect(region).not.toBeNull();
    expect(region!.width % 2).toBe(0);
    expect(region!.height % 2).toBe(0);
    expect(region!.x + region!.width).toBeLessThanOrEqual(642);
    expect(region!.y + region!.height).toBeLessThanOrEqual(482);
  });

  it('bumps tiny selections to the minimum size and rejects invalid video sizes', () => {
    // 极小选区会被夹到最小尺寸（0.05 × 1920 = 96px），而不是被拒绝
    const tiny = cropRectToPixelRegion({ x: 0, y: 0, width: 0.0005, height: 0.0005 }, 1920, 1080);
    expect(tiny?.width).toBe(96);
    expect(tiny?.height).toBe(54);
    expect(cropRectToPixelRegion(FULL, 0, 0)).toBeNull();
    expect(cropRectToPixelRegion(FULL, 1, 1)).toBeNull();
  });
});

describe('describeCropRegion', () => {
  it('reports pixel values and a simplified ratio label', () => {
    const info = describeCropRegion(FULL, 1920, 1080);
    expect(info?.pixel).toEqual({ x: 0, y: 0, width: 1920, height: 1080 });
    expect(info?.ratioLabel).toBe('16:9');
  });
});
