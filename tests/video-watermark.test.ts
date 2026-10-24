import { describe, expect, it } from 'vitest';
import type { ImageCropRect } from '../lib/utils/image';
import {
  computeSampleTimestamps,
  computeTemporalMedian,
  createOutputFilename,
  createVideoWatermarkPlan,
  decideRepairMethod,
  getSampleCount,
  mapProgressRange,
  STATIC_MOTION_THRESHOLD,
  validateVideoFile,
} from '../lib/utils/video-watermark';

function makeRgbaSample(
  width: number,
  height: number,
  fill: (x: number, y: number, channel: number) => number
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        const index = (y * width + x) * 4 + channel;
        data[index] = fill(x, y, channel);
      }
      data[(y * width + x) * 4 + 3] = 255;
    }
  }
  return data;
}

describe('validateVideoFile', () => {
  it('accepts video files by type or extension', () => {
    expect(validateVideoFile(new File(['x'], 'clip.mp4', { type: 'video/mp4' })).ok).toBe(true);
    expect(validateVideoFile(new File(['x'], 'clip.mkv', { type: '' })).ok).toBe(true);
  });

  it('rejects non-video input', () => {
    const result = validateVideoFile(new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(result).toEqual({ ok: false, code: 'unsupported_input' });
  });

  it('rejects oversized files', () => {
    const file = new File([new ArrayBuffer(8)], 'big.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 301 * 1024 * 1024 });
    const result = validateVideoFile(file);
    expect(result).toEqual({ ok: false, code: 'file_too_large' });
  });
});

describe('getSampleCount / computeSampleTimestamps', () => {
  it('bounds the sample count between 8 and 24', () => {
    expect(getSampleCount(1)).toBe(8);
    expect(getSampleCount(10)).toBe(16);
    expect(getSampleCount(60)).toBe(24);
  });

  it('creates ascending timestamps away from the edges', () => {
    const timestamps = computeSampleTimestamps(10, 5);
    expect(timestamps).toHaveLength(5);
    expect(timestamps[0]).toBeGreaterThan(0);
    expect(timestamps[4]).toBeLessThan(10);
    for (let index = 1; index < timestamps.length; index += 1) {
      expect(timestamps[index]).toBeGreaterThan(timestamps[index - 1]);
    }
  });
});

describe('computeTemporalMedian', () => {
  it('returns the per-pixel temporal median for static samples', () => {
    const width = 2;
    const height = 1;
    const samples = [
      makeRgbaSample(width, height, () => 100),
      makeRgbaSample(width, height, () => 120),
      makeRgbaSample(width, height, () => 140),
    ];

    const { median, motion } = computeTemporalMedian(samples);
    expect(median[0]).toBe(120);
    // 每像素三通道相对中值的平均偏差 = (20+0+20)/3；再乘 3/4（alpha 恒为 255 不产生偏差）
    expect(motion).toBeCloseTo(((20 + 0 + 20) / 3) * (3 / 4) / 255, 5);
  });

  it('picks the middle value so a persistent watermark survives while flicker is removed', () => {
    const width = 1;
    const height = 1;
    // 第一个样本是水印色，其余样本露出不同背景：中值取背景，不取水印
    const samples = [
      makeRgbaSample(width, height, () => 250),
      makeRgbaSample(width, height, () => 10),
      makeRgbaSample(width, height, () => 30),
      makeRgbaSample(width, height, () => 50),
    ];

    const { median } = computeTemporalMedian(samples);
    // 偶数帧取两个中间值的平均：[(10,30,50,250) → (30+50)/2]，中值落在背景侧而非水印色
    expect(median[0]).toBe(40);
  });

  it('handles mismatched and empty sample sets', () => {
    expect(computeTemporalMedian([]).median).toHaveLength(0);
    const single = makeRgbaSample(1, 1, () => 42);
    const mismatched = new Uint8ClampedArray(8);
    expect(computeTemporalMedian([single, mismatched]).median).toHaveLength(4);
  });
});

describe('decideRepairMethod', () => {
  it('uses temporal rebuild on motion and AI on static backgrounds', () => {
    expect(decideRepairMethod('auto', 0.5)).toBe('temporal');
    expect(decideRepairMethod('auto', 0.001)).toBe('ai');
    expect(decideRepairMethod('temporal', 0)).toBe('temporal');
    expect(decideRepairMethod('ai', 0.9)).toBe('ai');
  });

  it('always honours the explicit HQ choice and never picks it automatically', () => {
    expect(decideRepairMethod('hq', 0.9)).toBe('hq');
    expect(decideRepairMethod('hq', 0)).toBe('hq');
    expect(decideRepairMethod('auto', 0.001)).not.toBe('hq');
    expect(decideRepairMethod('auto', 0.9)).not.toBe('hq');
  });

  it('treats motion at the threshold as moving background', () => {
    expect(decideRepairMethod('auto', STATIC_MOTION_THRESHOLD)).toBe('temporal');
    expect(decideRepairMethod('auto', STATIC_MOTION_THRESHOLD - 0.0001)).toBe('ai');
  });
});

describe('createVideoWatermarkPlan', () => {
  it('normalizes the selection into the video frame', () => {
    const selection: ImageCropRect = { x: -10, y: -5, width: 100000, height: 40 };
    const plan = createVideoWatermarkPlan({
      selection,
      videoWidth: 640,
      videoHeight: 360,
      method: 'auto',
      durationSeconds: 20,
    });

    expect(plan.selection.x).toBeGreaterThanOrEqual(0);
    expect(plan.selection.y).toBeGreaterThanOrEqual(0);
    expect(plan.selection.x + plan.selection.width).toBeLessThanOrEqual(640);
    expect(plan.selection.y + plan.selection.height).toBeLessThanOrEqual(360);
  });
});

describe('createOutputFilename / mapProgressRange', () => {
  it('derives an mp4 output name from the source', () => {
    expect(createOutputFilename('holiday.clip.mov')).toBe('holiday.clip-no-watermark.mp4');
    expect(createOutputFilename('noext')).toBe('noext-no-watermark.mp4');
  });

  it('maps sub-progress into the given range', () => {
    expect(mapProgressRange(0, 40, 86)).toBe(40);
    expect(mapProgressRange(100, 40, 86)).toBe(86);
    expect(mapProgressRange(50, 40, 86)).toBe(63);
  });
});
