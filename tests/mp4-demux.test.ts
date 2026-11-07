import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildAvcCDescription, demuxMp4Video, type DemuxedSample } from '../lib/utils/mp4-demux';

/**
 * 解封装是解码路径里唯一的新外部依赖（mp4box.js），在 Node 里用真实 H.264 MP4
 * 验证：轨道识别、avcC 重建、样本时间戳、时间窗过滤、moov 在尾部的文件。
 * 没有 ffmpeg 的环境自动跳过（不阻塞 CI）。
 */
const hasFfmpeg = (() => {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const workDir = mkdtempSync(path.join(tmpdir(), 'mp4-demux-'));

function makeFixture(name: string, faststart: boolean): string {
  const target = path.join(workDir, name);
  if (existsSync(target)) return target;
  execFileSync('ffmpeg', [
    '-y',
    '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=30:duration=2',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac',
    ...(faststart ? ['-movflags', '+faststart'] : []),
    target,
  ], { stdio: 'ignore' });
  return target;
}

function toArrayBuffer(filePath: string): ArrayBuffer {
  const data = readFileSync(filePath);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

describe.skipIf(!hasFfmpeg)('demuxMp4Video', () => {
  it('reads the video track and rebuilds a valid avcC description', async () => {
    const buffer = toArrayBuffer(makeFixture('faststart.mp4', true));
    let config: Awaited<ReturnType<typeof demuxMp4Video>>['config'] | null = null;
    const samples: DemuxedSample[] = [];

    const result = await demuxMp4Video(buffer, {
      onConfig: (next) => { config = next; },
      onBatch: (batch) => { samples.push(...batch); },
    });

    expect(config).not.toBeNull();
    expect(result.config.codec.startsWith('avc1')).toBe(true);
    expect(result.config.codedWidth).toBe(320);
    expect(result.config.codedHeight).toBe(240);
    // 2 秒 30fps ≈ 60 帧
    expect(result.config.fps).toBeGreaterThanOrEqual(28);
    expect(result.config.fps).toBeLessThanOrEqual(32);

    // AVCDecoderConfigurationRecord：version 1，1 组 SPS，至少 1 组 PPS
    const description = result.config.description;
    expect(description[0]).toBe(1);
    expect(description[4] & 0x03).toBe(3);
    expect(description[5] & 0x1f).toBeGreaterThanOrEqual(1);
    expect(description.byteLength).toBeGreaterThan(10);

    expect(result.totalSamples).toBe(samples.length);
    expect(samples.length).toBeGreaterThanOrEqual(58);
    expect(samples[0].isKey).toBe(true);
    // 样本按解码顺序返回，B 帧会让 cts 局部回退；按显示时间排序后应为约 33ms 等间隔
    const sorted = [...samples].sort((a, b) => a.timestampUs - b.timestampUs);
    // B 帧重排会带来首个 CTS 偏移（约一帧），不必强求从 0 开始
    expect(sorted[0].timestampUs).toBeGreaterThanOrEqual(0);
    expect(sorted[0].timestampUs).toBeLessThan(100_000);
    for (let index = 1; index < sorted.length; index += 1) {
      expect(sorted[index].timestampUs).toBeGreaterThan(sorted[index - 1].timestampUs);
    }
    const secondDelta = sorted[1].timestampUs - sorted[0].timestampUs;
    expect(secondDelta).toBeGreaterThan(30_000);
    expect(secondDelta).toBeLessThan(36_000);
  });

  it('filters samples into the requested time window, keeping the preceding keyframe', async () => {
    const buffer = toArrayBuffer(makeFixture('faststart.mp4', true));
    const samples: DemuxedSample[] = [];

    const result = await demuxMp4Video(
      buffer,
      {
        onConfig: () => undefined,
        onBatch: (batch) => { samples.push(...batch); },
      },
      { rangeUs: { start: 1_000_000, end: 2_000_000 } }
    );

    expect(result.emittedSamples).toBe(samples.length);
    // 序列必须从关键帧开始（否则解码器拒绝首个 delta 帧）；
    // 关键帧可能在起点之前很远处，因此允许包含起点前的一段 GOP
    expect(samples[0].isKey).toBe(true);
    expect(samples[0].timestampUs).toBeLessThanOrEqual(1_000_000);
    // 尾窗：不晚于 end + 1 秒
    expect(samples[samples.length - 1].timestampUs).toBeLessThanOrEqual(3_000_000);
  });

  it('keeps the keyframe anchor even when the GOP is longer than the tail window', async () => {
    // 10 秒、关键帧间隔 5 秒（-g 150），从 7 秒处截取：
    // 起点前 1 秒内没有关键帧，必须回溯到 5 秒处的关键帧，否则解码器拒绝首个 delta 帧
    const sparse = path.join(workDir, 'sparse-gop.mp4');
    if (!existsSync(sparse)) {
      execFileSync('ffmpeg', [
        '-y',
        '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=30:duration=10',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '150', '-keyint_min', '150', '-sc_threshold', '0',
        sparse,
      ], { stdio: 'ignore' });
    }
    const samples: DemuxedSample[] = [];
    const result = await demuxMp4Video(
      toArrayBuffer(sparse),
      {
        onConfig: () => undefined,
        onBatch: (batch) => { samples.push(...batch); },
      },
      { rangeUs: { start: 7_000_000, end: 8_000_000 } }
    );

    expect(result.emittedSamples).toBeGreaterThan(0);
    // 序列必须以关键帧开头，且该关键帧早于起点（5 秒处的那个）
    expect(samples[0].isKey).toBe(true);
    expect(samples[0].timestampUs).toBeLessThan(7_000_000);
    expect(samples[0].timestampUs).toBeGreaterThan(4_000_000);
  });

  it('handles files whose moov atom sits at the end', async () => {
    const buffer = toArrayBuffer(makeFixture('moov-tail.mp4', false));
    const samples: DemuxedSample[] = [];

    const result = await demuxMp4Video(buffer, {
      onConfig: () => undefined,
      onBatch: (batch) => { samples.push(...batch); },
    });

    expect(result.config.codedWidth).toBe(320);
    expect(samples.length).toBeGreaterThanOrEqual(58);
    expect(samples[0].isKey).toBe(true);
  });

  it('rejects non-video input instead of hanging', async () => {
    const junk = new TextEncoder().encode('not an mp4 file at all').buffer as ArrayBuffer;
    await expect(
      demuxMp4Video(junk, { onConfig: () => undefined, onBatch: () => undefined })
    ).rejects.toThrow();
  });

  it('rejects videos carrying a display rotation matrix so they fall back to playback', async () => {
    // 先生成常规素材，再以流复制方式写入 90° display matrix（不重编码、不改变像素）
    const base = makeFixture('faststart.mp4', true);
    const rotated = path.join(workDir, 'rotated.mp4');
    if (!existsSync(rotated)) {
      execFileSync('ffmpeg', ['-y', '-display_rotation', '90', '-i', base, '-c', 'copy', '-an', rotated], { stdio: 'ignore' });
    }
    const buffer = toArrayBuffer(rotated);
    await expect(
      demuxMp4Video(buffer, { onConfig: () => undefined, onBatch: () => undefined })
    ).rejects.toThrow(/rotated/i);
  });
});

describe('buildAvcCDescription', () => {
  it('serializes SPS and PPS with the documented header layout', () => {
    const sps = new Uint8Array([0x67, 0x64, 0x00, 0x1f]);
    const pps = new Uint8Array([0x68, 0xee, 0x3c, 0x80]);
    const description = buildAvcCDescription({
      configurationVersion: 1,
      AVCProfileIndication: 0x64,
      profile_compatibility: 0x00,
      AVCLevelIndication: 0x1f,
      lengthSizeMinusOne: 3,
      SPS: [{ nalu: sps }],
      PPS: [{ nalu: pps }],
    });

    expect(description).not.toBeNull();
    const bytes = description!;
    expect(Array.from(bytes.slice(0, 6))).toEqual([1, 0x64, 0x00, 0x1f, 0xff, 0xe1]);
    expect(bytes[6] << 8 | bytes[7]).toBe(sps.length);
    expect(Array.from(bytes.slice(8, 8 + sps.length))).toEqual(Array.from(sps));
    expect(bytes[8 + sps.length]).toBe(1);
    expect(Array.from(bytes.slice(-pps.length))).toEqual(Array.from(pps));
  });

  it('returns null when SPS or PPS is missing', () => {
    expect(buildAvcCDescription({ SPS: [], PPS: [] })).toBeNull();
    expect(buildAvcCDescription({ SPS: [{ nalu: new Uint8Array([1]) }], PPS: [] })).toBeNull();
  });
});
