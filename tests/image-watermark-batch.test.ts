import { describe, expect, it } from 'vitest';
import { scaleCropRectToImage } from '../lib/utils/image';

describe('batch watermark selection mapping', () => {
  it('keeps the selection unchanged when the target has the same dimensions', () => {
    const rect = { x: 320, y: 180, width: 160, height: 40 };
    expect(
      scaleCropRectToImage(rect, { width: 1280, height: 720 }, { width: 1280, height: 720 })
    ).toEqual(rect);
  });

  it('scales the selection proportionally for a uniformly larger image', () => {
    const rect = { x: 100, y: 50, width: 200, height: 100 };
    expect(
      scaleCropRectToImage(rect, { width: 1000, height: 500 }, { width: 2000, height: 1000 })
    ).toEqual({ x: 200, y: 100, width: 400, height: 200 });
  });

  it('uses independent horizontal and vertical scales for a different aspect ratio', () => {
    const rect = { x: 100, y: 100, width: 200, height: 50 };
    // 1000x500 -> 2000x2000: x2 horizontally, x4 vertically.
    expect(
      scaleCropRectToImage(rect, { width: 1000, height: 500 }, { width: 2000, height: 2000 })
    ).toEqual({ x: 200, y: 400, width: 400, height: 200 });
  });

  it('keeps a bottom-right watermark attached to the bottom-right corner', () => {
    const rect = { x: 1100, y: 660, width: 180, height: 60 };
    const mapped = scaleCropRectToImage(
      rect,
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 }
    );

    expect(mapped.x + mapped.width).toBe(1920);
    expect(mapped.y + mapped.height).toBe(1080);
  });

  it('clamps a scaled selection inside a smaller image', () => {
    const mapped = scaleCropRectToImage(
      { x: 900, y: 600, width: 300, height: 100 },
      { width: 1280, height: 720 },
      { width: 320, height: 180 }
    );

    expect(mapped.x).toBeGreaterThanOrEqual(0);
    expect(mapped.y).toBeGreaterThanOrEqual(0);
    expect(mapped.x + mapped.width).toBeLessThanOrEqual(320);
    expect(mapped.y + mapped.height).toBeLessThanOrEqual(180);
    expect(Number.isFinite(mapped.width)).toBe(true);
    expect(Number.isFinite(mapped.height)).toBe(true);
  });

  it('does not produce NaN values for degenerate dimensions', () => {
    const mapped = scaleCropRectToImage(
      { x: 10, y: 10, width: 20, height: 20 },
      { width: 0, height: 0 },
      { width: 0, height: 0 }
    );

    expect(Object.values(mapped).every(Number.isFinite)).toBe(true);
  });
});
