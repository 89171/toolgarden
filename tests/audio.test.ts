import { describe, expect, it } from 'vitest';
import { removeConsecutiveRepeatedTranscriptSentences } from '@/lib/utils/audio';

describe('audio transcription text cleanup', () => {
  it('removes consecutive repeated transcript sentences', () => {
    expect(removeConsecutiveRepeatedTranscriptSentences(
      "Okay, so I'm going to use it. I'm going to use it up. I'm going to use it up. I'm going to use it up.",
    )).toBe("Okay, so I'm going to use it. I'm going to use it up.");
  });

  it('keeps repeated phrases when they are separated by different speech', () => {
    expect(removeConsecutiveRepeatedTranscriptSentences(
      'Start now. Keep going. Start now. Keep going.',
    )).toBe('Start now. Keep going. Start now. Keep going.');
  });

  it('handles Chinese sentence punctuation', () => {
    expect(removeConsecutiveRepeatedTranscriptSentences(
      '开始使用。开始使用。然后保存！然后保存！',
    )).toBe('开始使用。 然后保存！');
  });
});
