import { describe, expect, it } from 'vitest';
import {
  MAX_TTS_TEXT_LENGTH,
  createTtsFilename,
  getDefaultTtsVoice,
  getTtsVoices,
  normalizeTtsSpeed,
  splitTtsText,
  validateTtsText,
} from '@/lib/utils/tts';

describe('TTS configuration', () => {
  it('exposes only Chinese and English voices', () => {
    expect(getTtsVoices('zh').map((voice) => voice.id)).toEqual(['zf_001', 'zm_009']);
    expect(getTtsVoices('en').map((voice) => voice.id)).toEqual(['af_maple', 'bf_vale']);
    expect(getDefaultTtsVoice('zh')).toBe('zf_001');
    expect(getDefaultTtsVoice('en')).toBe('af_maple');
  });

  it('clamps synthesis speed to the supported range', () => {
    expect(normalizeTtsSpeed(0.2)).toBe(0.75);
    expect(normalizeTtsSpeed(1.1)).toBe(1.1);
    expect(normalizeTtsSpeed(3)).toBe(1.5);
    expect(normalizeTtsSpeed(Number.NaN)).toBe(1);
  });
});

describe('TTS text preparation', () => {
  it('splits Chinese text more aggressively than English text', () => {
    const text = '这是一个用于测试语音分段的句子。'.repeat(20);
    const chinese = splitTtsText(text, 'zh');
    const english = splitTtsText(text, 'en');

    expect(chinese.length).toBeGreaterThan(english.length);
    expect(chinese.every((chunk) => chunk.length <= 80)).toBe(true);
  });

  it('rejects empty and overlong text', () => {
    expect(validateTtsText('   ')?.code).toBe('empty_text');
    expect(validateTtsText('a'.repeat(MAX_TTS_TEXT_LENGTH + 1))?.code).toBe('tts_text_too_long');
    expect(validateTtsText('Hello')).toBeNull();
  });

  it('creates a safe wav filename', () => {
    expect(createTtsFilename('en', Date.UTC(2026, 0, 2, 3, 4, 5)))
      .toBe('text-to-speech-en-2026-01-02T03-04-05-000Z.wav');
  });
});
