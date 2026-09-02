export type AudioToolMode =
  | 'to-mp3'
  | 'to-wav'
  | 'extract'
  | 'merge'
  | 'trim'
  | 'compress'
  | 'recorder'
  | 'transcribe'
  | 'volume'
  | 'speed'
  | 'sample-rate'
  | 'bitrate'
  | 'remove-silence'
  | 'tts';

export type AudioOutputFormat = 'mp3' | 'wav' | 'webm';

export type AudioProcessingStage = 'model' | 'prepare' | 'processing' | 'encode' | 'done';

export interface AudioProcessingProgress {
  stage: AudioProcessingStage;
  label: string;
  percent: number;
}

export interface AudioProcessingSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  mimeType: string;
  originalSize: number;
  outputSize: number;
  durationMs: number;
}

export interface AudioTranscriptionSuccess {
  ok: true;
  text: string;
  durationMs: number;
}

export type AudioProcessingErrorCode =
  | 'empty_file'
  | 'unsupported_input'
  | 'file_too_large'
  | 'too_many_files'
  | 'invalid_range'
  | 'recorder_unsupported'
  | 'microphone_denied'
  | 'tts_unsupported'
  | 'tts_text_too_long'
  | 'tts_generation_failed'
  | 'tts_cancelled'
  | 'empty_text'
  | 'invalid_value'
  | 'processing_failed'
  | 'model_failed';

export interface AudioProcessingError {
  ok: false;
  code: AudioProcessingErrorCode;
  detail?: string;
  maxSize?: string;
}

export type AudioProcessingOutcome = AudioProcessingSuccess | AudioProcessingError;
export type AudioTranscriptionOutcome = AudioTranscriptionSuccess | AudioProcessingError;

export const MAX_AUDIO_FILE_SIZE = 512 * 1024 * 1024;

export const supportedAudioInputs = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/aac',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/opus',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
];

export const supportedVideoInputs = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/mpeg',
];

const audioExtensionToMime = new Map<string, string>([
  ['mp3', 'audio/mpeg'],
  ['mpeg', 'audio/mpeg'],
  ['wav', 'audio/wav'],
  ['aac', 'audio/aac'],
  ['m4a', 'audio/mp4'],
  ['mp4', 'video/mp4'],
  ['ogg', 'audio/ogg'],
  ['opus', 'audio/opus'],
  ['webm', 'audio/webm'],
  ['flac', 'audio/flac'],
  ['mov', 'video/quicktime'],
  ['mkv', 'video/x-matroska'],
  ['avi', 'video/x-msvideo'],
]);

export function formatAudioFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

export function getAudioFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function inferAudioMimeType(file: File): string {
  if (file.type) return file.type;
  return audioExtensionToMime.get(getAudioFileExtension(file.name)) ?? '';
}

export function isSupportedAudioInput(file: File): boolean {
  const type = inferAudioMimeType(file);
  if (supportedAudioInputs.includes(type)) return true;
  const extension = getAudioFileExtension(file.name);
  return ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'webm', 'flac'].includes(extension);
}

export function isSupportedVideoInput(file: File): boolean {
  const type = inferAudioMimeType(file);
  if (supportedVideoInputs.includes(type)) return true;
  const extension = getAudioFileExtension(file.name);
  return ['mp4', 'webm', 'mov', 'mkv', 'avi', 'mpeg'].includes(extension);
}

export function isSupportedMediaInput(file: File): boolean {
  return isSupportedAudioInput(file) || isSupportedVideoInput(file);
}

export function getAudioAcceptValue(includeVideo = false): string {
  const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.opus', '.webm', '.flac'];
  const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.mpeg'];
  const mimes = includeVideo
    ? [...supportedAudioInputs, ...supportedVideoInputs]
    : supportedAudioInputs;
  const extensions = includeVideo ? [...audioExtensions, ...videoExtensions] : audioExtensions;
  return [...mimes, ...extensions].join(',');
}

export function createAudioOutputFilename(filename: string, suffix: string, extension: AudioOutputFormat): string {
  const base = filename.replace(/\.[^.]+$/, '').trim() || 'audio';
  return `${base}-${suffix}.${extension}`;
}

export function getAudioOutputMimeType(format: AudioOutputFormat): string {
  if (format === 'mp3') return 'audio/mpeg';
  if (format === 'wav') return 'audio/wav';
  return 'audio/webm';
}

export function validateAudioFiles(
  files: File[],
  options: { allowVideo?: boolean; multiple?: boolean } = {}
): AudioProcessingError | null {
  if (files.length === 0) return { ok: false, code: 'empty_file' };
  if (!options.multiple && files.length > 1) return { ok: false, code: 'too_many_files' };

  for (const file of files) {
    if (file.size === 0) return { ok: false, code: 'empty_file' };
    if (file.size > MAX_AUDIO_FILE_SIZE) {
      return {
        ok: false,
        code: 'file_too_large',
        maxSize: formatAudioFileSize(MAX_AUDIO_FILE_SIZE),
      };
    }

    const supported = options.allowVideo ? isSupportedMediaInput(file) : isSupportedAudioInput(file);
    if (!supported) {
      return {
        ok: false,
        code: 'unsupported_input',
        detail: inferAudioMimeType(file) || getAudioFileExtension(file.name) || 'unknown',
      };
    }
  }

  return null;
}

export function normalizeSeconds(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 1000) / 1000;
}

function normalizeTranscriptSentence(sentence: string): string {
  return sentence
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[。！？!?.,，、；;：:\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function removeConsecutiveRepeatedTranscriptSentences(text: string): string {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  if (!normalizedText) return '';

  const sentences = normalizedText.match(/[^。！？!?.]+[。！？!?.]?/g) ?? [normalizedText];
  const kept: string[] = [];
  let previous = '';

  for (const sentence of sentences) {
    const current = sentence.trim();
    if (!current) continue;

    const normalized = normalizeTranscriptSentence(current);
    if (!normalized || normalized === previous) continue;

    kept.push(current);
    previous = normalized;
  }

  return kept.join(' ').trim();
}
