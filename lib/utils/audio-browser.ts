import {
  createAudioOutputFilename,
  getAudioFileExtension,
  getAudioOutputMimeType,
  normalizeSeconds,
  validateAudioFiles,
  type AudioOutputFormat,
  type AudioProcessingOutcome,
  type AudioProcessingProgress,
  type AudioTranscriptionOutcome,
} from './audio';

interface ProcessAudioOptions {
  mode:
    | 'to-mp3'
    | 'to-wav'
    | 'extract'
    | 'merge'
    | 'trim'
    | 'compress'
    | 'volume'
    | 'speed'
    | 'sample-rate'
    | 'bitrate'
    | 'remove-silence';
  targetFormat?: AudioOutputFormat;
  bitrateKbps?: number;
  startSeconds?: number;
  endSeconds?: number;
  volumeGain?: number;
  playbackRate?: number;
  sampleRate?: number;
  silenceThresholdDb?: number;
  silenceDuration?: number;
  onProgress?: (progress: AudioProcessingProgress) => void;
}

interface TranscribeAudioOptions {
  language?: 'auto' | 'zh' | 'en';
  model?: string;
  onProgress?: (progress: AudioProcessingProgress) => void;
}

type FFmpegInstance = import('@ffmpeg/ffmpeg').FFmpeg;
type TransformersModule = typeof import('@xenova/transformers');
type Transcriber = (audio: string | URL, options?: Record<string, unknown>) => Promise<{ text?: string }>;

const FFMPEG_CORE_CDN_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
const FFMPEG_CORE_URL = `${FFMPEG_CORE_CDN_BASE}/ffmpeg-core.js`;
const FFMPEG_WASM_URL = `${FFMPEG_CORE_CDN_BASE}/ffmpeg-core.wasm`;
const FFMPEG_WORKER_URL = '/vendor/ffmpeg/worker.js';
const DEFAULT_MP3_BITRATE = 192;
const DEFAULT_COMPRESS_BITRATE = 96;
const DEFAULT_SAMPLE_RATE = 44100;
const MIN_VOLUME_GAIN = 0;
const MAX_VOLUME_GAIN = 4;
const MIN_PLAYBACK_RATE = 0.25;
const MAX_PLAYBACK_RATE = 4;
const MIN_SILENCE_THRESHOLD_DB = -80;
const MAX_SILENCE_THRESHOLD_DB = -10;
const MIN_SILENCE_DURATION = 0.05;
const MAX_SILENCE_DURATION = 10;
const DEFAULT_TRANSCRIPTION_MODEL = 'Xenova/whisper-tiny';
const TRANSFORMERS_WASM_PATH = '/models/transformers/';

let ffmpegPromise: Promise<FFmpegInstance> | null = null;
let ffmpeg: FFmpegInstance | null = null;
let ffmpegCoreAssetPromise: Promise<{ coreURL: string; wasmURL: string }> | null = null;
let transcriberPromise: Promise<Transcriber> | null = null;

function toPublicAssetUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).href;
}

async function loadFfmpegCoreAssets(
  onProgress?: (progress: AudioProcessingProgress) => void
): Promise<{ coreURL: string; wasmURL: string }> {
  if (!ffmpegCoreAssetPromise) {
    ffmpegCoreAssetPromise = (async () => {
      const { toBlobURL } = await import('@ffmpeg/util');
      onProgress?.({ stage: 'prepare', label: 'downloading-ffmpeg-core', percent: 10 });
      const coreURL = await toBlobURL(FFMPEG_CORE_URL, 'text/javascript');
      onProgress?.({ stage: 'prepare', label: 'downloading-ffmpeg-wasm', percent: 12 });
      const wasmURL = await toBlobURL(FFMPEG_WASM_URL, 'application/wasm');
      onProgress?.({ stage: 'prepare', label: 'ffmpeg-core-ready', percent: 18 });
      return { coreURL, wasmURL };
    })().catch((error) => {
      ffmpegCoreAssetPromise = null;
      throw error;
    });
  }

  return ffmpegCoreAssetPromise;
}

function toProgress(label: string, percent: number): AudioProcessingProgress {
  return {
    stage: percent < 20 ? 'prepare' : percent > 95 ? 'encode' : 'processing',
    label,
    percent: Math.max(0, Math.min(100, Math.round(percent))),
  };
}

async function loadFfmpeg(onProgress?: (progress: AudioProcessingProgress) => void): Promise<FFmpegInstance> {
  if (ffmpeg?.loaded) return ffmpeg;
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { coreURL, wasmURL } = await loadFfmpegCoreAssets(onProgress);
      const instance = new FFmpeg();
      instance.on('log', ({ message }) => {
        if (/error|failed|invalid/i.test(message)) {
          onProgress?.({ stage: 'processing', label: message.slice(0, 140), percent: 55 });
        }
      });
      await instance.load({
        classWorkerURL: toPublicAssetUrl(FFMPEG_WORKER_URL),
        coreURL,
        wasmURL,
      });
      ffmpeg = instance;
      return instance;
    })().catch((error) => {
      ffmpeg = null;
      ffmpegPromise = null;
      throw error;
    });
  }

  onProgress?.({ stage: 'prepare', label: 'loading-ffmpeg', percent: 8 });
  const instance = await ffmpegPromise;
  onProgress?.({ stage: 'prepare', label: 'ffmpeg-ready', percent: 18 });
  return instance;
}

function getInputName(file: File, index = 0): string {
  const extension = getAudioFileExtension(file.name) || 'media';
  return `input-${index}.${extension}`;
}

function getOutputName(format: AudioOutputFormat): string {
  return `output.${format}`;
}

async function readOutput(instance: FFmpegInstance, outputName: string): Promise<Uint8Array> {
  const data = await instance.readFile(outputName);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return data;
}

async function cleanupFiles(instance: FFmpegInstance, names: string[]) {
  await Promise.all(
    names.map((name) =>
      instance.deleteFile(name).catch(() => {
        // Ignore virtual FS cleanup misses.
      })
    )
  );
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value as number));
}

function buildAtempoFilter(rate: number): string {
  const filters: string[] = [];
  let remaining = clampNumber(rate, MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE, 1);

  while (remaining > 2) {
    filters.push('atempo=2');
    remaining /= 2;
  }

  while (remaining < 0.5) {
    filters.push('atempo=0.5');
    remaining /= 0.5;
  }

  filters.push(`atempo=${remaining.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}`);
  return filters.join(',');
}

function buildCommand(inputNames: string[], outputName: string, options: ProcessAudioOptions): string[] {
  const bitrate = `${options.bitrateKbps ?? (options.mode === 'compress' ? DEFAULT_COMPRESS_BITRATE : DEFAULT_MP3_BITRATE)}k`;

  if (options.mode === 'merge') {
    const inputs = inputNames.flatMap((name) => ['-i', name]);
    const filterInputs = inputNames.map((_, index) => `[${index}:a]`).join('');
    return [
      ...inputs,
      '-filter_complex',
      `${filterInputs}concat=n=${inputNames.length}:v=0:a=1[a]`,
      '-map',
      '[a]',
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      outputName,
    ];
  }

  if (options.mode === 'trim') {
    const start = normalizeSeconds(options.startSeconds ?? 0);
    const end = normalizeSeconds(options.endSeconds ?? 0);
    if (end <= start) return [];
    return [
      '-i',
      inputNames[0],
      '-ss',
      String(start),
      '-t',
      String(end - start),
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      outputName,
    ];
  }

  if (options.mode === 'to-wav' || options.targetFormat === 'wav') {
    return ['-i', inputNames[0], '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', outputName];
  }

  if (options.mode === 'volume') {
    const gain = clampNumber(options.volumeGain, MIN_VOLUME_GAIN, MAX_VOLUME_GAIN, 1);
    return [
      '-i',
      inputNames[0],
      '-vn',
      '-filter:a',
      `volume=${gain}`,
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      outputName,
    ];
  }

  if (options.mode === 'speed') {
    return [
      '-i',
      inputNames[0],
      '-vn',
      '-filter:a',
      buildAtempoFilter(options.playbackRate ?? 1),
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      outputName,
    ];
  }

  if (options.mode === 'sample-rate') {
    const sampleRate = Math.round(clampNumber(options.sampleRate, 8000, 96000, DEFAULT_SAMPLE_RATE));
    return [
      '-i',
      inputNames[0],
      '-vn',
      '-ar',
      String(sampleRate),
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      outputName,
    ];
  }

  if (options.mode === 'remove-silence') {
    const threshold = clampNumber(
      options.silenceThresholdDb,
      MIN_SILENCE_THRESHOLD_DB,
      MAX_SILENCE_THRESHOLD_DB,
      -45
    );
    const duration = clampNumber(options.silenceDuration, MIN_SILENCE_DURATION, MAX_SILENCE_DURATION, 0.3);
    return [
      '-i',
      inputNames[0],
      '-vn',
      '-af',
      `silenceremove=start_periods=1:start_duration=${duration}:start_threshold=${threshold}dB:stop_periods=-1:stop_duration=${duration}:stop_threshold=${threshold}dB`,
      '-codec:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      outputName,
    ];
  }

  return [
    '-i',
    inputNames[0],
    '-vn',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    bitrate,
    outputName,
  ];
}

export async function processAudioFiles(
  files: File[],
  options: ProcessAudioOptions
): Promise<AudioProcessingOutcome> {
  const validation = validateAudioFiles(files, {
    allowVideo: options.mode === 'extract',
    multiple: options.mode === 'merge',
  });
  if (validation) return validation;

  if (options.mode === 'merge' && files.length < 2) {
    return { ok: false, code: 'too_many_files', detail: 'merge-needs-two-files' };
  }

  if (options.mode === 'trim') {
    const start = normalizeSeconds(options.startSeconds ?? 0);
    const end = normalizeSeconds(options.endSeconds ?? 0);
    if (end <= start) return { ok: false, code: 'invalid_range' };
  }

  const startedAt = performance.now();
  const outputFormat = options.mode === 'to-wav' || options.targetFormat === 'wav' ? 'wav' : 'mp3';
  const outputName = getOutputName(outputFormat);
  const inputNames = files.map(getInputName);
  const touchedFiles = [...inputNames, outputName];

  try {
    const instance = await loadFfmpeg(options.onProgress);
    const { fetchFile } = await import('@ffmpeg/util');
    options.onProgress?.(toProgress('writing-input', 22));

    for (const [index, file] of files.entries()) {
      await instance.writeFile(inputNames[index], await fetchFile(file));
    }

    const progressHandler = ({ progress }: { progress: number }) => {
      options.onProgress?.(toProgress('processing', 25 + progress * 68));
    };
    instance.on('progress', progressHandler);
    const command = buildCommand(inputNames, outputName, options);
    if (command.length === 0) return { ok: false, code: 'invalid_range' };

    const exitCode = await instance.exec(command, 10 * 60 * 1000);
    instance.off('progress', progressHandler);
    if (exitCode !== 0) {
      return { ok: false, code: 'processing_failed', detail: `ffmpeg exited with ${exitCode}` };
    }

    const bytes = await readOutput(instance, outputName);
    const safeBytes = new Uint8Array(bytes.length);
    safeBytes.set(bytes);
    const blob = new Blob([safeBytes.buffer as ArrayBuffer], { type: getAudioOutputMimeType(outputFormat) });
    options.onProgress?.({ stage: 'done', label: 'done', percent: 100 });

    const suffix = options.mode === 'extract'
      ? 'audio'
      : options.mode === 'compress'
        ? 'compressed'
        : options.mode === 'trim'
          ? 'trimmed'
          : options.mode === 'merge'
            ? 'merged'
            : options.mode === 'volume'
              ? 'volume'
              : options.mode === 'speed'
                ? 'speed'
                : options.mode === 'sample-rate'
                  ? 'sample-rate'
                  : options.mode === 'bitrate'
                    ? 'bitrate'
                    : options.mode === 'remove-silence'
                      ? 'no-silence'
                      : outputFormat;

    return {
      ok: true,
      blob,
      filename: createAudioOutputFilename(files[0].name, suffix, outputFormat),
      mimeType: getAudioOutputMimeType(outputFormat),
      originalSize: files.reduce((sum, file) => sum + file.size, 0),
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      code: 'processing_failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (ffmpeg) await cleanupFiles(ffmpeg, touchedFiles);
  }
}

export async function convertRecordedAudioToMp3(
  blob: Blob,
  filename = 'recording.webm',
  onProgress?: (progress: AudioProcessingProgress) => void
): Promise<AudioProcessingOutcome> {
  const file = new File([blob], filename, { type: blob.type || 'audio/webm' });
  return processAudioFiles([file], {
    mode: 'to-mp3',
    targetFormat: 'mp3',
    bitrateKbps: 192,
    onProgress,
  });
}

async function loadTranscriber(options: TranscribeAudioOptions): Promise<Transcriber> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      options.onProgress?.({ stage: 'model', label: 'loading-model', percent: 5 });
      const transformers = await import('@xenova/transformers/dist/transformers.min.js') as TransformersModule;
      transformers.env.allowLocalModels = false;
      transformers.env.useBrowserCache = true;
      transformers.env.backends.onnx.wasm.wasmPaths = TRANSFORMERS_WASM_PATH;
      transformers.env.backends.onnx.wasm.numThreads = 1;

      const pipe = await transformers.pipeline(
        'automatic-speech-recognition',
        options.model ?? DEFAULT_TRANSCRIPTION_MODEL,
        {
          progress_callback: (event: { status?: string; progress?: number; file?: string }) => {
            const percent = typeof event.progress === 'number' ? Math.min(90, event.progress) : 20;
            options.onProgress?.({
              stage: 'model',
              label: event.status ?? event.file ?? 'model',
              percent,
            });
          },
        }
      );
      options.onProgress?.({ stage: 'model', label: 'model-ready', percent: 92 });
      return pipe as unknown as Transcriber;
    })().catch((error) => {
      transcriberPromise = null;
      throw error;
    });
  }

  return transcriberPromise;
}

export async function transcribeAudioFile(
  file: File,
  options: TranscribeAudioOptions = {}
): Promise<AudioTranscriptionOutcome> {
  const validation = validateAudioFiles([file], { allowVideo: false });
  if (validation) return validation;

  const startedAt = performance.now();
  const url = URL.createObjectURL(file);
  try {
    const transcriber = await loadTranscriber(options);
    options.onProgress?.({ stage: 'processing', label: 'transcribing', percent: 94 });
    const language = options.language === 'auto' ? undefined : options.language;
    const result = await transcriber(url, {
      chunk_length_s: 30,
      stride_length_s: 5,
      ...(language ? { language } : {}),
    });
    return {
      ok: true,
      text: result.text?.trim() ?? '',
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      code: 'model_failed',
      detail: error instanceof Error ? error.message : undefined,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
