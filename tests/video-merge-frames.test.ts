import { describe, expect, it } from 'vitest';
import {
  computeTransformedSize,
  isIdentityTransform,
  normalizeVideoRotation,
  normalizeVideoTransform,
} from '../lib/utils/video-reencode';
import {
  computeFitRect,
  computeMergeOutputSize,
  createMergedFilename,
  mapMergeProgress,
  validateMergeFiles,
  MERGE_MAX_FILES,
} from '../lib/utils/video-merge';
import {
  createFrameFilename,
  formatFrameTime,
  planFrameExtraction,
  validateFramesFile,
  FRAMES_MAX_COUNT,
} from '../lib/utils/video-frames';

describe('video transform helpers', () => {
  it('swaps dimensions for 90°/270° rotations and keeps them otherwise', () => {
    expect(computeTransformedSize(1920, 1080, 0)).toEqual({ width: 1920, height: 1080 });
    expect(computeTransformedSize(1920, 1080, 180)).toEqual({ width: 1920, height: 1080 });
    expect(computeTransformedSize(1920, 1080, 90)).toEqual({ width: 1080, height: 1920 });
    expect(computeTransformedSize(1920, 1080, 270)).toEqual({ width: 1080, height: 1920 });
  });

  it('aligns rotated output sizes to even values', () => {
    const size = computeTransformedSize(1081, 601, 90);
    expect(size.width % 2).toBe(0);
    expect(size.height % 2).toBe(0);
  });

  it('normalizes arbitrary rotation values into the four presets', () => {
    expect(normalizeVideoRotation(90)).toBe(90);
    expect(normalizeVideoRotation(450)).toBe(90);
    expect(normalizeVideoRotation(-90)).toBe(270);
    expect(normalizeVideoRotation(45)).toBe(0);
    expect(normalizeVideoRotation(Number.NaN)).toBe(0);
  });

  it('detects identity transforms and normalizes partial input', () => {
    expect(isIdentityTransform(null)).toBe(true);
    expect(isIdentityTransform({ rotation: 0, flipHorizontal: false, flipVertical: false })).toBe(true);
    expect(isIdentityTransform({ rotation: 180, flipHorizontal: false, flipVertical: false })).toBe(false);
    expect(normalizeVideoTransform({ rotation: 90, flipHorizontal: true })).toEqual({
      rotation: 90,
      flipHorizontal: true,
      flipVertical: false,
    });
    expect(normalizeVideoTransform(null)).toEqual({ rotation: 0, flipHorizontal: false, flipVertical: false });
  });
});

describe('merge validation and planning', () => {
  const video = (name: string, size = 16) => {
    const file = new File([new ArrayBuffer(size)], name, { type: 'video/mp4' });
    if (size !== 16) Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('requires at least two files and enforces the count cap', () => {
    expect(validateMergeFiles([video('a.mp4')]).ok).toBe(false);
    expect(validateMergeFiles([video('a.mp4'), video('b.mp4')]).ok).toBe(true);
    const tooMany = Array.from({ length: MERGE_MAX_FILES + 1 }, (_, index) => video(`v${index}.mp4`));
    const result = validateMergeFiles(tooMany);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('too_many_files');
  });

  it('rejects non-video files and oversized totals', () => {
    const result = validateMergeFiles([video('a.mp4'), video('notes.txt'.replace('txt', 'mp4'))]);
    expect(result.ok).toBe(true);
    const text = new File(['x'], 'notes.txt', { type: 'text/plain' });
    expect(validateMergeFiles([video('a.mp4'), text]).ok).toBe(false);
    const big = video('big.mp4', 400 * 1024 * 1024);
    const oversized = validateMergeFiles([video('a.mp4'), big]);
    expect(oversized.ok).toBe(false);
    if (!oversized.ok) expect(oversized.code).toBe('file_too_large');
  });

  it('uses the first video as the output frame and fits others inside', () => {
    expect(computeMergeOutputSize([{ width: 1920, height: 1080 }, { width: 640, height: 480 }]))
      .toEqual({ width: 1920, height: 1080 });
    const fit = computeFitRect(1080, 1920, 1920, 1080);
    expect(fit.width).toBeLessThanOrEqual(1920);
    expect(fit.height).toBeLessThanOrEqual(1080);
    expect(fit.x).toBeGreaterThanOrEqual(0);
    expect(fit.y).toBeGreaterThanOrEqual(0);
    const same = computeFitRect(1920, 1080, 1920, 1080);
    expect(same).toEqual({ x: 0, y: 0, width: 1920, height: 1080 });
  });

  it('derives the merged filename from the first file', () => {
    expect(createMergedFilename([new File([], 'first.mov'), new File([], 'second.mp4')])).toBe('first-merged.mp4');
  });

  it('maps progress into the given range', () => {
    expect(mapMergeProgress(50, 10, 60)).toBe(35);
    expect(mapMergeProgress(200, 10, 60)).toBe(60);
  });
});

describe('frame extraction planning', () => {
  it('accepts video files and rejects others', () => {
    expect(validateFramesFile(new File(['x'], 'clip.mp4', { type: 'video/mp4' })).ok).toBe(true);
    expect(validateFramesFile(new File(['x'], 'song.mp3', { type: 'audio/mpeg' })).ok).toBe(false);
  });

  it('cleans moments: clamp, sort, dedupe and cap', () => {
    const plan = planFrameExtraction({
      mode: 'moments',
      timestamps: [12, -1, 5, 5.01, 10],
      intervalSeconds: 1,
      start: 0,
      end: 10,
      duration: 10,
    });
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.times).toEqual([0, 5, 10]);
  });

  it('returns no_frames for an empty moment list', () => {
    const plan = planFrameExtraction({ mode: 'moments', timestamps: [], intervalSeconds: 1, start: 0, end: 1, duration: 10 });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.code).toBe('no_frames');
  });

  it('builds evenly spaced interval plans and stretches the interval to honor the cap', () => {
    const plan = planFrameExtraction({
      mode: 'interval',
      timestamps: [],
      intervalSeconds: 2,
      start: 0,
      end: 10,
      duration: 10,
    });
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.times).toEqual([0, 2, 4, 6, 8, 10]);

    const capped = planFrameExtraction({
      mode: 'interval',
      timestamps: [],
      intervalSeconds: 0.1,
      start: 0,
      end: 300,
      duration: 300,
    });
    expect(capped.ok).toBe(true);
    if (capped.ok) expect(capped.times.length).toBeLessThanOrEqual(FRAMES_MAX_COUNT);
  });

  it('rejects degenerate ranges', () => {
    expect(planFrameExtraction({ mode: 'interval', timestamps: [], intervalSeconds: 1, start: 0, end: 10, duration: 0 }).ok).toBe(false);
    expect(planFrameExtraction({ mode: 'interval', timestamps: [], intervalSeconds: 1, start: 5, end: 5.02, duration: 10 }).ok).toBe(false);
  });

  it('creates zero-padded frame filenames and readable timestamps', () => {
    expect(createFrameFilename('clip.mp4', 0, 'png')).toBe('clip-frame-001.png');
    expect(createFrameFilename('clip.webm', 11, 'jpeg')).toBe('clip-frame-012.jpg');
    expect(formatFrameTime(65.5)).toBe('01:05.5');
    expect(formatFrameTime(0)).toBe('00:00.0');
  });
});
