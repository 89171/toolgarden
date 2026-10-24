import { describe, expect, it } from 'vitest';
import {
  clampGifFps,
  clampGifRange,
  clampGifWidth,
  createGifFilename,
  planGifFrames,
  validateGifSourceFile,
  GIF_MAX_FRAME_COUNT,
  GIF_MAX_PIXELS_PER_FRAME,
} from '../lib/utils/video-gif';
import {
  clampTrimRange,
  computeOutputSize,
  computeTargetBitrate,
  createReencodeFilename,
  mapReencodeProgress,
  validateReencodeFile,
  MAX_VIDEO_BITRATE,
  MIN_VIDEO_BITRATE,
} from '../lib/utils/video-reencode';

describe('validateGifSourceFile', () => {
  it('accepts video files and rejects others', () => {
    expect(validateGifSourceFile(new File(['x'], 'clip.mp4', { type: 'video/mp4' })).ok).toBe(true);
    expect(validateGifSourceFile(new File(['x'], 'clip.webm', { type: '' })).ok).toBe(true);
    const rejected = validateGifSourceFile(new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(rejected.ok).toBe(false);
  });

  it('rejects oversized files', () => {
    const file = new File([new ArrayBuffer(16)], 'clip.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 400 * 1024 * 1024 });
    const result = validateGifSourceFile(file);
    expect(result.ok).toBe(false);
  });
});

describe('gif clamps', () => {
  it('snaps fps and width to supported presets', () => {
    expect(clampGifFps(9)).toBe(8);
    expect(clampGifFps(13)).toBe(12);
    expect(clampGifFps(20)).toBe(15);
    expect(clampGifWidth(300)).toBe(240);
    expect(clampGifWidth(480)).toBe(480);
  });

  it('clamps the trim range and rejects degenerate ranges', () => {
    expect(clampGifRange({ start: -1, end: 99, duration: 10 })).toEqual({ start: 0, end: 10 });
    expect(clampGifRange({ start: 5, end: 5.05, duration: 10 })).toBeNull();
    expect(clampGifRange({ start: 0, end: 10, duration: 0 })).toBeNull();
  });
});

describe('planGifFrames', () => {
  it('creates evenly spaced timestamps with matching delay', () => {
    const plan = planGifFrames({ start: 0, end: 2, fps: 12, sourceWidth: 1920, sourceHeight: 1080, targetWidth: 360 });
    expect(plan.timestamps.length).toBe(24);
    expect(plan.timestamps[0]).toBeCloseTo(0, 2);
    expect(plan.timestamps[plan.timestamps.length - 1]).toBeLessThan(2);
    expect(plan.delayMs).toBe(Math.round(1000 / 12));
    expect(plan.width).toBe(360);
    // 1080 * 360/1920 = 202.5 → 四舍五入 203 → 偶数对齐 204
    expect(plan.height).toBe(204);
  });

  it('caps frame count by lowering fps for long segments', () => {
    const plan = planGifFrames({ start: 0, end: 300, fps: 15, sourceWidth: 640, sourceHeight: 480, targetWidth: 480 });
    expect(plan.timestamps.length).toBeLessThanOrEqual(GIF_MAX_FRAME_COUNT);
    expect(plan.delayMs).toBeGreaterThan(Math.round(1000 / 15));
  });

  it('caps pixel area per frame', () => {
    const plan = planGifFrames({ start: 0, end: 1, fps: 8, sourceWidth: 1920, sourceHeight: 1080, targetWidth: 480 });
    expect(plan.width * plan.height).toBeLessThanOrEqual(GIF_MAX_PIXELS_PER_FRAME);
  });
});

describe('gif filename', () => {
  it('derives gif filename from source name', () => {
    expect(createGifFilename('clip.mp4')).toBe('clip.gif');
    expect(createGifFilename('no-extension')).toBe('no-extension.gif');
  });
});

describe('validateReencodeFile', () => {
  it('accepts video and rejects non-video', () => {
    expect(validateReencodeFile(new File(['x'], 'clip.mov', { type: 'video/quicktime' })).ok).toBe(true);
    expect(validateReencodeFile(new File(['x'], 'song.mp3', { type: 'audio/mpeg' })).ok).toBe(false);
  });
});

describe('clampTrimRange', () => {
  it('clamps into duration and enforces a minimum span', () => {
    expect(clampTrimRange({ start: 2, end: 8, duration: 10 })).toEqual({ start: 2, end: 8 });
    expect(clampTrimRange({ start: -5, end: 50, duration: 10 })).toEqual({ start: 0, end: 10 });
    expect(clampTrimRange({ start: 5, end: 5.1, duration: 10 })).toBeNull();
  });
});

describe('computeTargetBitrate', () => {
  it('scales with quality and clamps to bounds', () => {
    const low = computeTargetBitrate(1920, 1080, 'low');
    const high = computeTargetBitrate(1920, 1080, 'high');
    expect(high).toBeGreaterThan(low);
    expect(low).toBeGreaterThanOrEqual(MIN_VIDEO_BITRATE);
    expect(high).toBeLessThanOrEqual(MAX_VIDEO_BITRATE);
    expect(computeTargetBitrate(1920, 1080, 'medium', 0.5)).toBeLessThan(computeTargetBitrate(1920, 1080, 'medium'));
  });
});

describe('computeOutputSize', () => {
  it('keeps even alignment and downscales by long side', () => {
    expect(computeOutputSize(1920, 1080, null)).toEqual({ width: 1920, height: 1080 });
    const scaled = computeOutputSize(1920, 1080, 720);
    expect(Math.max(scaled.width, scaled.height)).toBe(720);
    expect(scaled.width % 2).toBe(0);
    expect(scaled.height % 2).toBe(0);
    expect(computeOutputSize(640, 480, 1080)).toEqual({ width: 640, height: 480 });
  });
});

describe('createReencodeFilename / mapReencodeProgress', () => {
  it('derives filenames with suffix', () => {
    expect(createReencodeFilename('clip.mp4', 'compressed')).toBe('clip-compressed.mp4');
    expect(createReencodeFilename('clip.webm', 'trimmed')).toBe('clip-trimmed.mp4');
  });

  it('maps percent into range and clamps', () => {
    expect(mapReencodeProgress(50, 30, 80)).toBe(55);
    expect(mapReencodeProgress(0, 30, 80)).toBe(30);
    expect(mapReencodeProgress(120, 30, 80)).toBe(80);
  });
});
