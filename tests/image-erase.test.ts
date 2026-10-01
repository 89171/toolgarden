import { describe, expect, it } from 'vitest';
import {
  createEraseStrokeBounds,
  getDefaultEraseBrushRadius,
  getEraseBrushRadiusRange,
  type ImageEraseStroke,
} from '../lib/utils/image';

describe('erase stroke bounds', () => {
  it('grows the box by the brush radius and clamps it to the image', () => {
    const strokes: ImageEraseStroke[] = [{ points: [{ x: 100, y: 120 }], radius: 20 }];

    expect(createEraseStrokeBounds(strokes, 400, 300)).toEqual({
      x: 80,
      y: 100,
      width: 40,
      height: 40,
    });

    // A stroke on the edge must not produce negative origins or overflow the image.
    const edge: ImageEraseStroke[] = [{ points: [{ x: 2, y: 298 }], radius: 40 }];
    const bounds = createEraseStrokeBounds(edge, 400, 300);

    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(400);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(300);
  });

  it('spans every stroke and ignores empty or non-finite input', () => {
    const strokes: ImageEraseStroke[] = [
      { points: [{ x: 50, y: 50 }], radius: 10 },
      { points: [{ x: 200, y: 160 }, { x: 210, y: 170 }], radius: 10 },
      { points: [{ x: Number.NaN, y: 10 }], radius: 10 },
    ];

    expect(createEraseStrokeBounds(strokes, 400, 300)).toEqual({
      x: 40,
      y: 40,
      width: 180,
      height: 140,
    });

    expect(createEraseStrokeBounds([], 400, 300)).toBeNull();
    expect(createEraseStrokeBounds([{ points: [], radius: 8 }], 400, 300)).toBeNull();
  });

  it('keeps the default brush inside the selectable range', () => {
    for (const [width, height] of [[64, 64], [800, 600], [6000, 4000]] as const) {
      const radius = getDefaultEraseBrushRadius(width, height);
      const { min, max } = getEraseBrushRadiusRange(width, height);

      expect(radius).toBeGreaterThanOrEqual(min);
      expect(radius).toBeLessThanOrEqual(max);
    }
  });
});
