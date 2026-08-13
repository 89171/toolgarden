import type { AudioProcessingError } from './audio';

export type TtsLanguage = 'zh' | 'en';
export type TtsVoiceId = 'zf_001' | 'zm_009' | 'af_maple' | 'bf_vale';

export interface TtsVoiceOption {
  id: TtsVoiceId;
  language: TtsLanguage;
  labelKey: 'zh_female' | 'zh_male' | 'en_us_female' | 'en_gb_female';
}

export interface TtsSynthesisSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: 'audio/wav';
  outputSize: number;
  durationMs: number;
}

export type TtsSynthesisOutcome = TtsSynthesisSuccess | AudioProcessingError;

export const TTS_MODEL_ID = 'onnx-community/Kokoro-82M-v1.1-zh-ONNX';
export const TTS_SAMPLE_RATE = 24_000;
export const MAX_TTS_TEXT_LENGTH = 2_000;

export const ttsVoices: readonly TtsVoiceOption[] = [
  { id: 'zf_001', language: 'zh', labelKey: 'zh_female' },
  { id: 'zm_009', language: 'zh', labelKey: 'zh_male' },
  { id: 'af_maple', language: 'en', labelKey: 'en_us_female' },
  { id: 'bf_vale', language: 'en', labelKey: 'en_gb_female' },
] as const;

export function getTtsVoices(language: TtsLanguage): readonly TtsVoiceOption[] {
  return ttsVoices.filter((voice) => voice.language === language);
}

export function getDefaultTtsVoice(language: TtsLanguage): TtsVoiceId {
  return language === 'zh' ? 'zf_001' : 'af_maple';
}

export function isTtsVoiceForLanguage(voiceId: string, language: TtsLanguage): voiceId is TtsVoiceId {
  return ttsVoices.some((voice) => voice.id === voiceId && voice.language === language);
}

export function normalizeTtsSpeed(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1.5, Math.max(0.75, value));
}

export function validateTtsText(text: string): AudioProcessingError | null {
  const normalized = text.trim();
  if (!normalized) return { ok: false, code: 'empty_text' };
  if (normalized.length > MAX_TTS_TEXT_LENGTH) {
    return { ok: false, code: 'tts_text_too_long', maxSize: String(MAX_TTS_TEXT_LENGTH) };
  }
  return null;
}

/**
 * 将长文本按自然句界切开，防止单次输入超过 Kokoro 的 512 token 上限。
 * 中文音素通常比原字符膨胀更多，因此使用更短的分段上限。
 */
export function splitTtsText(text: string, language: TtsLanguage): string[] {
  const maxChars = language === 'zh' ? 80 : 220;
  const normalized = text.replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?。！？\n]+[.!?。！？]?|\n+/g) ?? [normalized];
  const chunks: string[] = [];
  let current = '';

  const pushCurrent = () => {
    const value = current.trim();
    if (value) chunks.push(value);
    current = '';
  };

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) {
      pushCurrent();
      continue;
    }

    if (sentence.length > maxChars) {
      pushCurrent();
      const characters = Array.from(sentence);
      for (let index = 0; index < characters.length; index += maxChars) {
        chunks.push(characters.slice(index, index + maxChars).join('').trim());
      }
      continue;
    }

    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars) pushCurrent();
    current = current ? `${current} ${sentence}` : sentence;
  }

  pushCurrent();
  return chunks.filter(Boolean);
}

export function createTtsFilename(language: TtsLanguage, timestamp: number): string {
  const safeTimestamp = new Date(timestamp).toISOString().replace(/[:.]/g, '-');
  return `text-to-speech-${language}-${safeTimestamp}.wav`;
}
