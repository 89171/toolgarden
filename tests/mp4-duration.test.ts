import { describe, expect, it } from 'vitest';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

/**
 * 回归测试：输出 MP4 的容器时长必须与帧时间戳一致。
 *
 * 曾发的事故：渲染循环把 VideoFrame 的 duration 设成了
 * (expectedDisplayTime - mediaTime) × 1e6 —— 两者是不同时钟，差值达数小时；
 * mp4-muxer 的 mvhd/tkhd/mdhd 时长 = 最后一帧 PTS + 最后一帧 duration，
 * 于是 5 秒视频被声明成几个小时。此处用合成 chunk 验证容器时长正确。
 */

function findBox(buffer: ArrayBuffer, type: string): { offset: number; size: number } | null {
  const bytes = new Uint8Array(buffer);
  const target = Array.from(type, (char) => char.charCodeAt(0));
  for (let index = 4; index < bytes.length - 4; index += 1) {
    if (
      bytes[index] === target[0] &&
      bytes[index + 1] === target[1] &&
      bytes[index + 2] === target[2] &&
      bytes[index + 3] === target[3]
    ) {
      const size =
        (bytes[index - 4] << 24) | (bytes[index - 3] << 16) | (bytes[index - 2] << 8) | bytes[index - 1];
      return { offset: index, size };
    }
  }
  return null;
}

function muxFrames(frameCount: number, intervalMicros: number, frameDurationMicros: number): ArrayBuffer {
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: 'avc', width: 2, height: 2 },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  });
  for (let index = 0; index < frameCount; index += 1) {
    muxer.addVideoChunkRaw(
      new Uint8Array(16),
      index === 0 ? 'key' : 'delta',
      index * intervalMicros,
      frameDurationMicros,
      index === 0
        ? {
            decoderConfig: {
              codec: 'avc1.42E01E',
              colorSpace: { primaries: 'bt709', transfer: 'bt709', matrix: 'bt709', fullRange: true },
              description: new Uint8Array([1, 66, 0, 30, 255, 225, 0, 8, 103, 66, 0, 30, 172, 20, 50, 32, 1, 0, 4, 104, 206, 60, 128]),
            },
          }
        : undefined,
    );
  }
  muxer.finalize();
  return target.buffer;
}

function readMvhdDurationSeconds(buffer: ArrayBuffer): number {
  const mvhd = findBox(buffer, 'mvhd');
  expect(mvhd).not.toBeNull();
  const view = new DataView(buffer);
  const version = view.getUint8(mvhd!.offset + 4);
  // mvhd: version/flags(4) creation modification timescale duration
  // v0: creation(4) modification(4) → timescale@+16 duration@+20
  // v1: creation(8) modification(8) → timescale@+24 duration@+28
  if (version === 1) {
    const timescale = view.getUint32(mvhd!.offset + 24);
    const duration = view.getBigUint64(mvhd!.offset + 28);
    return Number(duration) / timescale;
  }
  const timescale = view.getUint32(mvhd!.offset + 16);
  const duration = view.getUint32(mvhd!.offset + 20);
  return duration / timescale;
}

describe('mp4 container duration', () => {
  it('declares ~5s for 150 frames at 30fps with correct frame durations', () => {
    const buffer = muxFrames(150, 33_333, 33_333);
    const durationSeconds = readMvhdDurationSeconds(buffer);
    expect(durationSeconds).toBeGreaterThan(4.8);
    expect(durationSeconds).toBeLessThan(5.2);
  });

  it('declares ~5s for 5s of variable-framerate frames (durations match deltas)', () => {
    // 模拟采集抖动：帧间隔在 20ms~50ms 之间浮动
    let cursor = 0;
    const timestamps: number[] = [];
    while (cursor < 5_000_000) {
      timestamps.push(cursor);
      cursor += 20_000 + Math.round(Math.random() * 30_000);
    }
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width: 2, height: 2 },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset',
    });
    timestamps.forEach((timestamp, index) => {
      const next = timestamps[index + 1] ?? timestamp + 33_333;
      muxer.addVideoChunkRaw(
        new Uint8Array(16),
        index === 0 ? 'key' : 'delta',
        timestamp,
        next - timestamp,
        index === 0
          ? {
              decoderConfig: {
                codec: 'avc1.42E01E',
                colorSpace: { primaries: 'bt709', transfer: 'bt709', matrix: 'bt709', fullRange: true },
                description: new Uint8Array([1, 66, 0, 30, 255, 225, 0, 8, 103, 66, 0, 30, 172, 20, 50, 32, 1, 0, 4, 104, 206, 60, 128]),
              },
            }
          : undefined,
      );
    });
    muxer.finalize();

    const durationSeconds = readMvhdDurationSeconds(target.buffer);
    expect(durationSeconds).toBeGreaterThan(4.8);
    expect(durationSeconds).toBeLessThan(5.2);
  });

  it('reproduces the old bug signature: a huge last-frame duration inflates the declared duration', () => {
    // 证明时长元数据取自最后一帧的 duration：旧代码的污染值会直接进入 mvhd
    const buffer = muxFrames(150, 33_333, 3_600_000_000);
    expect(readMvhdDurationSeconds(buffer)).toBeGreaterThan(3_000);
  });
});
