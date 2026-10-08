import { describe, expect, it } from 'vitest';
import { lyricAt, parseLrc, prepareLyrics } from '../lib/utils/mv-lyrics';

describe('mv lyrics', () => {
  it('parses multi-tag LRC and finds the active line', () => {
    const timed = parseLrc('[00:01.50][00:03.250]one\n[01:02]two');
    expect(timed).toEqual([
      { time: 1.5, text: 'one' },
      { time: 3.25, text: 'one' },
      { time: 62, text: 'two' },
    ]);
    expect(lyricAt(timed, 3)).toBe(0);
    expect(lyricAt(timed, 63)).toBe(2);
    expect(lyricAt(timed, 0)).toBe(-1);
  });

  it('spreads untimed lyrics evenly', () => {
    expect(prepareLyrics('a\nb', 10)).toEqual([{ time: 0, text: 'a' }, { time: 5, text: 'b' }]);
  });
});
