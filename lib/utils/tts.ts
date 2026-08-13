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

const WAV_HEADER_SIZE = 44;
const PCM_BYTES_PER_SAMPLE = 2;
const MIN_AUDIBLE_PEAK = 1e-5;

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

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

/**
 * 将模型输出编码为浏览器和常见播放器广泛支持的 16-bit PCM WAV。
 * 同时拒绝 NaN、Infinity 和全静音波形，避免生成“能播放但没有声音”的文件。
 */
export function createTtsWavBlob(
  samples: Float32Array,
  sampleRate = TTS_SAMPLE_RATE,
): Blob {
  if (samples.length === 0 || !Number.isInteger(sampleRate) || sampleRate <= 0) {
    throw new Error('tts_invalid_audio');
  }

  let peak = 0;
  for (const sample of samples) {
    if (!Number.isFinite(sample)) throw new Error('tts_invalid_audio');
    peak = Math.max(peak, Math.abs(sample));
  }
  if (peak < MIN_AUDIBLE_PEAK) throw new Error('tts_invalid_audio');

  const dataSize = samples.length * PCM_BYTES_PER_SAMPLE;
  const buffer = new ArrayBuffer(WAV_HEADER_SIZE + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * PCM_BYTES_PER_SAMPLE, true);
  view.setUint16(32, PCM_BYTES_PER_SAMPLE, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(WAV_HEADER_SIZE + index * PCM_BYTES_PER_SAMPLE, Math.round(pcm), true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
