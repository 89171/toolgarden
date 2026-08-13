import { describe, expect, it } from 'vitest';
import {
  MAX_TTS_TEXT_LENGTH,
  createTtsFilename,
  createTtsWavBlob,
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

describe('TTS WAV encoding', () => {
  it('encodes finite samples as mono 16-bit PCM WAV', async () => {
    const blob = createTtsWavBlob(new Float32Array([0, 0.5, -0.5]));
    const view = new DataView(await blob.arrayBuffer());
    const ascii = (offset: number, length: number) => Array.from(
      { length },
      (_, index) => String.fromCharCode(view.getUint8(offset + index)),
    ).join('');

    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(50);
    expect(ascii(0, 4)).toBe('RIFF');
    expect(ascii(8, 4)).toBe('WAVE');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(24_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(16_384);
    expect(view.getInt16(48, true)).toBe(-16_384);
  });

  it('rejects non-finite and silent model output', () => {
    expect(() => createTtsWavBlob(new Float32Array([0, Number.NaN])))
      .toThrow('tts_invalid_audio');
    expect(() => createTtsWavBlob(new Float32Array([0, 0])))
      .toThrow('tts_invalid_audio');
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
