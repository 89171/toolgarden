import {
  AutoTokenizer,
  StyleTextToSpeech2Model,
  Tensor,
  type PreTrainedTokenizer,
} from '@huggingface/transformers';
import { pinyin } from 'pinyin-pro';
import { p2z } from 'pinyin-to-zhuyin';
import type { AudioProcessingProgress } from '../utils/audio';
import {
  TTS_MODEL_ID,
  TTS_SAMPLE_RATE,
  createTtsWavBlob,
  normalizeTtsSpeed,
  splitTtsText,
  type TtsLanguage,
  type TtsVoiceId,
} from '../utils/tts';

interface SynthesizeRequest {
  id: string;
  type: 'synthesize';
  text: string;
  language: TtsLanguage;
  voiceId: TtsVoiceId;
  speed: number;
}

type WorkerResponse =
  | { id: string; type: 'progress'; progress: AudioProcessingProgress }
  | { id: string; type: 'result'; blob: Blob; durationMs: number }
  | { id: string; type: 'error'; detail?: string };

interface LoadedTtsModel {
  model: StyleTextToSpeech2Model;
  tokenizer: PreTrainedTokenizer;
}

interface ProgressEvent {
  status?: string;
  progress?: number;
}

interface ESpeakModule {
  FS: {
    readFile(path: string, options: { encoding: 'utf8' }): string;
  };
}

type ESpeakFactory = (options: {
  arguments: string[];
}) => Promise<ESpeakModule>;

const workerScope = self as unknown as {
  postMessage: (message: WorkerResponse) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<SynthesizeRequest>) => void,
  ) => void;
};

const STYLE_DIM = 256;
const MAX_STYLE_INDEX = 509;
const VOICE_BASE_URL = `https://huggingface.co/${TTS_MODEL_ID}/resolve/main/voices`;
const voiceCache = new Map<TtsVoiceId, Promise<Float32Array>>();
let modelPromise: Promise<LoadedTtsModel> | null = null;
let espeakFactoryPromise: Promise<ESpeakFactory> | null = null;

function post(message: WorkerResponse): void {
  workerScope.postMessage(message);
}

function report(id: string, progress: AudioProcessingProgress): void {
  post({ id, type: 'progress', progress });
}

function loadModel(id: string): Promise<LoadedTtsModel> {
  if (modelPromise) return modelPromise;

  const onProgress = (event: ProgressEvent) => {
    if (event.status !== 'progress' || !Number.isFinite(event.progress)) return;
    report(id, {
      stage: 'model',
      label: 'tts_model_loading',
      percent: Math.max(2, Math.min(68, Math.round(2 + (event.progress as number) * 0.66))),
    });
  };

  modelPromise = Promise.all([
    StyleTextToSpeech2Model.from_pretrained(TTS_MODEL_ID, {
      // 曾尝试改用 transformers.js 对 wasm 设备默认推荐的 q8 量化权重来提速，
      // 但这个自定义架构（style_text_to_speech_2）用量化权重会直接输出异常音频
      // （NaN/静音），触发 tts_invalid_audio；该模型只在 fp32 下验证可用，
      // 保留 fp32，速度问题留给后续换用更小模型或 WebGPU 设备解决。
      dtype: 'fp32',
      device: 'wasm',
      progress_callback: onProgress,
    }),
    AutoTokenizer.from_pretrained(TTS_MODEL_ID, { progress_callback: onProgress }),
  ])
    .then(([model, tokenizer]) => ({ model, tokenizer }))
    .catch((error) => {
      modelPromise = null;
      throw error;
    });

  return modelPromise;
}

function loadVoice(voiceId: TtsVoiceId): Promise<Float32Array> {
  const cached = voiceCache.get(voiceId);
  if (cached) return cached;

  const promise = fetch(`${VOICE_BASE_URL}/${voiceId}.bin`)
    .then((response) => {
      if (!response.ok) throw new Error(`voice download failed (${response.status})`);
      return response.arrayBuffer();
    })
    .then((buffer) => new Float32Array(buffer))
    .catch((error) => {
      voiceCache.delete(voiceId);
      throw error;
    });

  voiceCache.set(voiceId, promise);
  return promise;
}

function normalizeTextForSpeech(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/、/g, ', ')
    .replace(/。/g, '. ')
    .replace(/！/g, '! ')
    .replace(/，/g, ', ')
    .replace(/：/g, ': ')
    .replace(/；/g, '; ')
    .replace(/？/g, '? ')
    .replace(/\s+/g, ' ')
    .trim();
}

function postProcessPhonemes(value: string): string {
  return value
    .replace(/\u200d/g, '')
    .replace(/kəkˈoːɹoʊ/g, 'kˈoʊkəɹoʊ')
    .replace(/kəkˈɔːɹəʊ/g, 'kˈəʊkəɹəʊ')
    .replace(/ʲ/g, 'j')
    .replace(/r/g, 'ɹ')
    .replace(/x/g, 'k')
    .replace(/ɬ/g, 'l')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadESpeakFactory(): Promise<ESpeakFactory> {
  if (espeakFactoryPromise) return espeakFactoryPromise;

  const moduleUrl = new URL('/vendor/espeak-ng/espeak-ng.js', self.location.origin).href;
  espeakFactoryPromise = import(/* webpackIgnore: true */ moduleUrl)
    .then((loaded: { default?: ESpeakFactory }) => {
      if (!loaded.default) throw new Error('phonemizer module is unavailable');
      return loaded.default;
    })
    .catch((error) => {
      espeakFactoryPromise = null;
      throw error;
    });

  return espeakFactoryPromise;
}

async function phonemizeEnglish(normalized: string): Promise<string> {
  const punctuation = normalized.match(/[;:,.!?]+/g) ?? [];
  const ESpeakNg = await loadESpeakFactory();
  const espeak = await ESpeakNg({
    arguments: [
      '-v',
      'en-us',
      '--ipa=3',
      '--phonout',
      'generated',
      '-q',
      normalized,
    ],
  }) as ESpeakModule;
  const lines = espeak.FS.readFile('generated', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) throw new Error('phonemizer returned no speech tokens');

  return postProcessPhonemes(
    lines.map((line, index) => `${line}${punctuation[index] ?? ''}`).join(' '),
  );
}

function pinyinToZhuyin(hanziSegment: string): string {
  // pinyin-pro 标注中性调用的是 "0"，pinyin-to-zhuyin 认的是 "5"。
  const numericPinyin = pinyin(hanziSegment, { toneType: 'num', type: 'string', separator: ' ' });
  const withNeutralTone = numericPinyin.replace(/([a-z])0(?=[\s,.!?;:]|$)/gi, '$15');
  return p2z(withNeutralTone, { tonemarks: false });
}

async function phonemizeChinese(normalized: string): Promise<string> {
  // pinyin-pro 只管把汉字转成拼音，遇到夹在中文里的整段拉丁字母
  // （品牌名、代码术语等）会逐字母瞎转，所以先按连续拉丁字母切开：
  // 英文片段仍走 espeak 的英文注音，其余汉字/数字/标点部分转拼音再转
  // 注音符号（ㄅㄆㄇㄈ）——这才是 Kokoro 中文模型词表实际匹配的注音
  // 方式，而不是 espeak 的 IPA 转写。
  const segments = normalized.split(/([A-Za-z]+)/);
  const parts: string[] = [];

  for (const segment of segments) {
    if (!segment) continue;
    parts.push(/^[A-Za-z]+$/.test(segment) ? await phonemizeEnglish(segment) : pinyinToZhuyin(segment));
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

async function phonemize(text: string, language: TtsLanguage): Promise<string> {
  const normalized = normalizeTextForSpeech(text);
  return language === 'zh' ? phonemizeChinese(normalized) : phonemizeEnglish(normalized);
}

function concatAudio(chunks: Float32Array[]): Float32Array {
  const pause = new Float32Array(Math.round(TTS_SAMPLE_RATE * 0.12));
  const totalLength = chunks.reduce((total, chunk, index) => (
    total + chunk.length + (index === chunks.length - 1 ? 0 : pause.length)
  ), 0);
  const output = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk, index) => {
    output.set(chunk, offset);
    offset += chunk.length;
    if (index < chunks.length - 1) offset += pause.length;
  });

  return output;
}

async function synthesize(request: SynthesizeRequest): Promise<void> {
  const { id, text, language, voiceId } = request;
  report(id, { stage: 'model', label: 'tts_model_loading', percent: 2 });
  const [{ model, tokenizer }, voice] = await Promise.all([loadModel(id), loadVoice(voiceId)]);
  const chunks = splitTtsText(text, language);
  const audioChunks: Float32Array[] = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const phonemes = await phonemize(chunks[index], language);
    const { input_ids: inputIds } = tokenizer(phonemes, { truncation: true });
    const tokenCount = Math.min(
      Math.max((inputIds.dims.at(-1) ?? 2) - 2, 0),
      MAX_STYLE_INDEX,
    );
    const offset = tokenCount * STYLE_DIM;
    const voiceStyle = voice.slice(offset, offset + STYLE_DIM);
    if (voiceStyle.length !== STYLE_DIM) throw new Error('voice data is incomplete');

    report(id, {
      stage: 'processing',
      label: 'tts_generating',
      percent: 70 + Math.round((index / Math.max(chunks.length, 1)) * 25),
    });

    const { waveform } = await model({
      input_ids: inputIds,
      style: new Tensor('float32', voiceStyle, [1, STYLE_DIM]),
      speed: new Tensor('float32', [normalizeTtsSpeed(request.speed)], [1]),
    });
    audioChunks.push(new Float32Array(waveform.data as Float32Array));
  }

  report(id, { stage: 'encode', label: 'tts_encoding', percent: 97 });
  const samples = concatAudio(audioChunks);
  const blob = createTtsWavBlob(samples, TTS_SAMPLE_RATE);
  const durationMs = Math.round((samples.length / TTS_SAMPLE_RATE) * 1_000);
  post({ id, type: 'result', blob, durationMs });
}

workerScope.addEventListener('message', (event) => {
  const request = event.data;
  if (!request || request.type !== 'synthesize') return;

  void synthesize(request).catch((error) => {
    post({
      id: request.id,
      type: 'error',
      detail: error instanceof Error ? error.message : String(error),
    });
  });
});
