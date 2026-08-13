import type { AudioProcessingProgress } from './audio';
import {
  createTtsFilename,
  getDefaultTtsVoice,
  isTtsVoiceForLanguage,
  normalizeTtsSpeed,
  validateTtsText,
  type TtsLanguage,
  type TtsSynthesisOutcome,
  type TtsVoiceId,
} from './tts';

interface SynthesizeTtsOptions {
  text: string;
  language: TtsLanguage;
  voiceId: TtsVoiceId;
  speed: number;
  onProgress?: (progress: AudioProcessingProgress) => void;
}

type TtsWorkerResponse =
  | { id: string; type: 'progress'; progress: AudioProcessingProgress }
  | { id: string; type: 'result'; blob: Blob; durationMs: number }
  | { id: string; type: 'error'; detail?: string };

let ttsWorker: Worker | null = null;
let ttsWorkerUnavailable = false;
let requestCounter = 0;
let pendingCancellation: (() => void) | null = null;

function getTtsWorker(): Worker | null {
  if (ttsWorkerUnavailable || typeof Worker === 'undefined') return null;
  if (ttsWorker) return ttsWorker;

  try {
    ttsWorker = new Worker(new URL('../workers/tts.worker.ts', import.meta.url), {
      type: 'module',
    });
    return ttsWorker;
  } catch {
    ttsWorkerUnavailable = true;
    return null;
  }
}

export function cancelTtsSynthesis(): void {
  ttsWorker?.terminate();
  ttsWorker = null;
  const cancel = pendingCancellation;
  pendingCancellation = null;
  cancel?.();
}

export async function synthesizeTts({
  text,
  language,
  voiceId,
  speed,
  onProgress,
}: SynthesizeTtsOptions): Promise<TtsSynthesisOutcome> {
  const validation = validateTtsText(text);
  if (validation) return validation;

  const worker = getTtsWorker();
  if (!worker) return { ok: false, code: 'tts_unsupported' };

  const selectedVoice = isTtsVoiceForLanguage(voiceId, language)
    ? voiceId
    : getDefaultTtsVoice(language);
  const id = `tts-${requestCounter}`;
  requestCounter += 1;

  return new Promise((resolve) => {
    let settled = false;

    const cleanup = () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      if (pendingCancellation === cancel) pendingCancellation = null;
    };

    const settle = (outcome: TtsSynthesisOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    };

    const handleMessage = (event: MessageEvent<TtsWorkerResponse>) => {
      const message = event.data;
      if (!message || message.id !== id) return;

      if (message.type === 'progress') {
        onProgress?.(message.progress);
        return;
      }

      if (message.type === 'error') {
        settle({ ok: false, code: 'tts_generation_failed', detail: message.detail });
        return;
      }

      settle({
        ok: true,
        blob: message.blob,
        filename: createTtsFilename(language, Date.now()),
        mimeType: 'audio/wav',
        outputSize: message.blob.size,
        durationMs: message.durationMs,
      });
    };

    const handleError = (event: ErrorEvent) => {
      if (ttsWorker === worker) {
        worker.terminate();
        ttsWorker = null;
      }
      settle({ ok: false, code: 'tts_generation_failed', detail: event.message });
    };

    const cancel = () => settle({ ok: false, code: 'tts_cancelled' });
    pendingCancellation = cancel;

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    worker.postMessage({
      id,
      type: 'synthesize',
      text: text.trim(),
      language,
      voiceId: selectedVoice,
      speed: normalizeTtsSpeed(speed),
    });
  });
}
