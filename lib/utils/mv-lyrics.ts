export interface LyricLine {
  time: number;
  text: string;
}

export type MvRatio = '16:9' | '9:16' | '4:3' | '1:1';

export const MV_RATIO_SIZES: Record<MvRatio, readonly [number, number]> = {
  '16:9': [1280, 720],
  '9:16': [720, 1280],
  '4:3': [960, 720],
  '1:1': [720, 720],
};

const TIME_TAG = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

/** Parse `[mm:ss.xx]` LRC rows; one row may carry several tags. */
export function parseLrc(source: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const row of source.split(/\r?\n/)) {
    const tags = [...row.matchAll(TIME_TAG)];
    if (!tags.length) continue;
    const text = row.replace(TIME_TAG, '').trim();
    for (const tag of tags) {
      const fraction = (tag[3] ?? '').padEnd(3, '0').slice(0, 3);
      lines.push({ time: Number(tag[1]) * 60 + Number(tag[2]) + Number(fraction) / 1000, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

/** LRC when it has timestamps, otherwise plain lines spread evenly over `duration`. */
export function prepareLyrics(source: string, duration: number): LyricLine[] {
  const timed = parseLrc(source);
  if (timed.length) return timed;
  const plain = source.split(/\r?\n/).map((text) => text.trim()).filter(Boolean);
  return plain.map((text, index) => ({ time: (index * duration) / plain.length, text }));
}

/** Index of the last line whose time <= `time`, or -1. */
export function lyricAt(lines: LyricLine[], time: number): number {
  let low = 0;
  let high = lines.length - 1;
  let answer = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (lines[middle].time <= time) {
      answer = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return answer;
}
