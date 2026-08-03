'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import type { ToolContent } from '@/lib/tools/content';
import {
  convertRecordedAudioToMp3,
  processAudioFiles,
  transcribeAudioFile,
} from '@/lib/utils/audio-browser';
import {
  formatAudioFileSize,
  getAudioAcceptValue,
  type AudioOutputFormat,
  type AudioProcessingError,
  type AudioProcessingProgress,
  type AudioToolMode,
} from '@/lib/utils/audio';

interface AudioToolProps {
  toolId: string;
  mode: AudioToolMode;
  content?: ToolContent;
}

interface OutputState {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  durationMs: number;
}

const bitrateOptions = [32, 48, 64, 96, 128, 160, 192, 256, 320];
const sampleRateOptions = [8000, 11025, 16000, 22050, 32000, 44100, 48000, 96000];
const LIVE_TRANSCRIPTION_REFRESH_MS = 15_000;

function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 0);
}

function createRecordingFilename(mimeType: string): string {
  const extension = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm';
  return `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
}

function getRecorderMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/webm',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function AudioTool({ toolId, mode, content }: AudioToolProps) {
  const t = useTranslations('audio_tool');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveChunksRef = useRef<Blob[]>([]);
  const liveMimeTypeRef = useRef('');
  const liveIntervalRef = useRef<number | null>(null);
  const liveSnapshotRunningRef = useRef(false);
  const liveTranscriptionStateRef = useRef<'idle' | 'recording' | 'stopping'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AudioProcessingProgress | null>(null);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<OutputState | null>(null);
  const [transcript, setTranscript] = useState('');
  const [bitrate, setBitrate] = useState(mode === 'compress' ? 96 : 192);
  const [volumeGain, setVolumeGain] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sampleRate, setSampleRate] = useState(44100);
  const [silenceThresholdDb, setSilenceThresholdDb] = useState(-45);
  const [silenceDuration, setSilenceDuration] = useState(0.3);
  const [startSeconds, setStartSeconds] = useState(0);
  const [endSeconds, setEndSeconds] = useState(30);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'ready'>('idle');
  const [recording, setRecording] = useState<{ blob: Blob; url: string; filename: string } | null>(null);
  const [liveTranscriptionState, setLiveTranscriptionState] = useState<'idle' | 'recording' | 'stopping'>('idle');
  const [ttsText, setTtsText] = useState('');
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [ttsVolume, setTtsVolume] = useState(1);
  const [ttsVoiceUri, setTtsVoiceUri] = useState('');
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isMerge = mode === 'merge';
  const isRecorder = mode === 'recorder';
  const isTranscribe = mode === 'transcribe';
  const isExtract = mode === 'extract';
  const isTrim = mode === 'trim';
  const isTts = mode === 'tts';
  const isStandalone = isRecorder || isTts;
  const liveTranscriptionActive = isTranscribe && liveTranscriptionState !== 'idle';
  const usesBitrate = [
    'to-mp3',
    'compress',
    'merge',
    'trim',
    'volume',
    'speed',
    'sample-rate',
    'bitrate',
    'remove-silence',
  ].includes(mode);
  const targetFormat: AudioOutputFormat = mode === 'to-wav' ? 'wav' : 'mp3';
  const accept = getAudioAcceptValue(isExtract);
  const canRun = isRecorder
    ? Boolean(recording)
    : isTts
      ? ttsText.trim().length > 0 && !isSpeaking
      : files.length > 0 && !isProcessing && !liveTranscriptionActive;

  const uploadTitle = useMemo(() => {
    if (isExtract) return t('upload_video_title');
    if (isMerge) return t('upload_multiple_title');
    return t('upload_audio_title');
  }, [isExtract, isMerge, t]);

  const actionLabel = useMemo(() => {
    if (mode === 'to-mp3') return t('actions.to_mp3');
    if (mode === 'to-wav') return t('actions.to_wav');
    if (mode === 'extract') return t('actions.extract');
    if (mode === 'merge') return t('actions.merge');
    if (mode === 'trim') return t('actions.trim');
    if (mode === 'compress') return t('actions.compress');
    if (mode === 'transcribe') return t('actions.transcribe');
    if (mode === 'volume') return t('actions.volume');
    if (mode === 'speed') return t('actions.speed');
    if (mode === 'sample-rate') return t('actions.sample_rate');
    if (mode === 'bitrate') return t('actions.bitrate');
    if (mode === 'remove-silence') return t('actions.remove_silence');
    if (mode === 'tts') return t('actions.speak');
    return t('actions.export_recording');
  }, [mode, t]);

  const getErrorMessage = useCallback((processingError: AudioProcessingError): string => {
    switch (processingError.code) {
      case 'empty_file':
        return t('errors.empty_file');
      case 'unsupported_input':
        return t('errors.unsupported_input', { type: processingError.detail ?? t('unknown_type') });
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: processingError.maxSize ?? '' });
      case 'too_many_files':
        return processingError.detail === 'merge-needs-two-files'
          ? t('errors.merge_needs_two')
          : t('errors.too_many_files');
      case 'invalid_range':
        return t('errors.invalid_range');
      case 'recorder_unsupported':
        return t('errors.recorder_unsupported');
      case 'microphone_denied':
        return t('errors.microphone_denied');
      case 'tts_unsupported':
        return t('errors.tts_unsupported');
      case 'empty_text':
        return t('errors.empty_text');
      case 'invalid_value':
        return t('errors.invalid_value');
      case 'model_failed':
        return processingError.detail
          ? `${t('errors.model_failed')} ${processingError.detail}`
          : t('errors.model_failed');
      default:
        return processingError.detail
          ? `${t('errors.processing_failed')} ${processingError.detail}`
          : t('errors.processing_failed');
    }
  }, [t]);

  const clearOutput = useCallback(() => {
    setOutput((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
    setTranscript('');
    setProgress(null);
    setError('');
  }, []);

  useEffect(() => () => {
    if (output) URL.revokeObjectURL(output.url);
    if (recording) URL.revokeObjectURL(recording.url);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    liveStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (liveIntervalRef.current !== null) window.clearInterval(liveIntervalRef.current);
    if (liveMediaRecorderRef.current && liveMediaRecorderRef.current.state !== 'inactive') {
      liveMediaRecorderRef.current.ondataavailable = null;
      liveMediaRecorderRef.current.onstop = null;
      liveMediaRecorderRef.current.stop();
    }
  }, [output, recording]);

  useEffect(() => {
    liveTranscriptionStateRef.current = liveTranscriptionState;
  }, [liveTranscriptionState]);

  useEffect(() => {
    if (!isTts || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setTtsVoices(voices);
      setTtsVoiceUri((current) => current || voices[0]?.voiceURI || '');
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [isTts]);

  const setSelectedFiles = useCallback((nextFiles: FileList | File[]) => {
    const selected = Array.from(nextFiles);
    if (selected.length === 0) return;
    clearOutput();
    setFiles((current) => (isMerge ? [...current, ...selected] : selected.slice(0, 1)));
  }, [clearOutput, isMerge]);

  const moveSelectedFile = useCallback((index: number, direction: -1 | 1) => {
    clearOutput();
    setFiles((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
  }, [clearOutput]);

  const removeSelectedFile = useCallback((index: number) => {
    clearOutput();
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearOutput]);

  const runTool = useCallback(async () => {
    if (mode === 'recorder' || mode === 'tts') return;

    setIsProcessing(true);
    clearOutput();

    try {
      if (mode === 'transcribe') {
        const result = await transcribeAudioFile(files[0], {
          language: 'auto',
          onProgress: setProgress,
        });

        if (!result.ok) {
          setError(getErrorMessage(result));
          return;
        }

        setTranscript(result.text || t('empty_transcript'));
        setProgress({ stage: 'done', label: 'done', percent: 100 });
        return;
      }

      const result = await processAudioFiles(files, {
        mode,
        targetFormat,
        bitrateKbps: bitrate,
        startSeconds,
        endSeconds,
        volumeGain,
        playbackRate,
        sampleRate,
        silenceThresholdDb,
        silenceDuration,
        onProgress: setProgress,
      });

      if (!result.ok) {
        setError(getErrorMessage(result));
        return;
      }

      setOutput({
        url: URL.createObjectURL(result.blob),
        filename: result.filename,
        mimeType: result.mimeType,
        size: result.outputSize,
        durationMs: result.durationMs,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    bitrate,
    clearOutput,
    endSeconds,
    files,
    getErrorMessage,
    mode,
    playbackRate,
    sampleRate,
    silenceDuration,
    silenceThresholdDb,
    startSeconds,
    t,
    targetFormat,
    volumeGain,
  ]);

  const exportRecording = useCallback(async () => {
    if (!recording) return;

    setIsProcessing(true);
    clearOutput();
    try {
      const result = await convertRecordedAudioToMp3(recording.blob, recording.filename, setProgress);

      if (!result.ok) {
        setError(getErrorMessage(result));
        return;
      }

      const url = URL.createObjectURL(result.blob);
      downloadUrl(url, result.filename);
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setProgress({ stage: 'done', label: 'done', percent: 100 });
    } finally {
      setIsProcessing(false);
    }
  }, [clearOutput, getErrorMessage, recording]);

  const startRecording = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined') {
      setError(getErrorMessage({ ok: false, code: 'recorder_unsupported' }));
      return;
    }

    const mimeType = getRecorderMimeType();
    if (!mimeType) {
      setError(getErrorMessage({ ok: false, code: 'recorder_unsupported' }));
      return;
    }

    try {
      setError('');
      setProgress(null);
      chunksRef.current = [];
      setRecording((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const filename = createRecordingFilename(mimeType);
        const url = URL.createObjectURL(blob);
        setRecording((current) => {
          if (current) URL.revokeObjectURL(current.url);
          return { blob, filename, url };
        });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecordingState('ready');
      };

      recorder.start();
      setRecordingState('recording');
    } catch {
      setError(getErrorMessage({ ok: false, code: 'microphone_denied' }));
    }
  }, [getErrorMessage]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }, []);

  const clearLiveTranscriptionInterval = useCallback(() => {
    if (liveIntervalRef.current === null) return;
    window.clearInterval(liveIntervalRef.current);
    liveIntervalRef.current = null;
  }, []);

  const createLiveTranscriptionFile = useCallback((): File | null => {
    const chunks = liveChunksRef.current.filter((chunk) => chunk.size > 0);
    if (chunks.length === 0) return null;

    const mimeType = liveMimeTypeRef.current || chunks[0]?.type || 'audio/webm';
    const blob = new Blob(chunks, { type: mimeType });
    if (blob.size === 0) return null;

    return new File([blob], createRecordingFilename(mimeType), { type: mimeType });
  }, []);

  const transcribeLiveMicrophoneSnapshot = useCallback(async (final = false) => {
    if (liveSnapshotRunningRef.current) {
      if (!final) return;
      while (liveSnapshotRunningRef.current) {
        await wait(300);
      }
    }

    const file = createLiveTranscriptionFile();
    if (!file) return;

    liveSnapshotRunningRef.current = true;
    try {
      const result = await transcribeAudioFile(file, {
        language: 'auto',
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
        },
      });

      if (!result.ok) {
        if (final || result.code === 'model_failed') {
          setError(getErrorMessage(result));
        }
        return;
      }

      if (result.text.trim()) {
        setTranscript(result.text.trim());
      }

      if (final) {
        setProgress({ stage: 'done', label: 'done', percent: 100 });
      } else if (liveTranscriptionStateRef.current === 'recording') {
        setProgress({ stage: 'processing', label: t('microphone_listening'), percent: 75 });
      }
    } finally {
      liveSnapshotRunningRef.current = false;
    }
  }, [createLiveTranscriptionFile, getErrorMessage, t]);

  const startLiveTranscription = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(getErrorMessage({ ok: false, code: 'recorder_unsupported' }));
      return;
    }

    const mimeType = getRecorderMimeType();
    if (!mimeType) {
      setError(getErrorMessage({ ok: false, code: 'recorder_unsupported' }));
      return;
    }

    try {
      clearOutput();
      setError('');
      setProgress({ stage: 'prepare', label: t('microphone_requesting'), percent: 5 });
      liveChunksRef.current = [];
      liveMimeTypeRef.current = mimeType;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      liveStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType });
      liveMediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) liveChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        void (async () => {
          clearLiveTranscriptionInterval();
          liveStreamRef.current?.getTracks().forEach((track) => track.stop());
          liveStreamRef.current = null;
          liveMediaRecorderRef.current = null;
          setLiveTranscriptionState('stopping');
          liveTranscriptionStateRef.current = 'stopping';
          setIsProcessing(true);
          setProgress({ stage: 'processing', label: t('microphone_finalizing'), percent: 92 });
          await transcribeLiveMicrophoneSnapshot(true);
          setLiveTranscriptionState('idle');
          liveTranscriptionStateRef.current = 'idle';
          setIsProcessing(false);
        })();
      };

      recorder.start(1000);
      setLiveTranscriptionState('recording');
      liveTranscriptionStateRef.current = 'recording';
      setProgress({ stage: 'processing', label: t('microphone_listening'), percent: 35 });
      liveIntervalRef.current = window.setInterval(() => {
        void transcribeLiveMicrophoneSnapshot(false);
      }, LIVE_TRANSCRIPTION_REFRESH_MS);
    } catch {
      clearLiveTranscriptionInterval();
      liveStreamRef.current?.getTracks().forEach((track) => track.stop());
      liveStreamRef.current = null;
      liveMediaRecorderRef.current = null;
      setLiveTranscriptionState('idle');
      liveTranscriptionStateRef.current = 'idle';
      setError(getErrorMessage({ ok: false, code: 'microphone_denied' }));
      setProgress(null);
    }
  }, [
    clearLiveTranscriptionInterval,
    clearOutput,
    getErrorMessage,
    t,
    transcribeLiveMicrophoneSnapshot,
  ]);

  const stopLiveTranscription = useCallback(() => {
    clearLiveTranscriptionInterval();
    const recorder = liveMediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    setLiveTranscriptionState('stopping');
    liveTranscriptionStateRef.current = 'stopping';
    setProgress({ stage: 'processing', label: t('microphone_finalizing'), percent: 90 });
    recorder.requestData();
    recorder.stop();
  }, [clearLiveTranscriptionInterval, t]);

  const speakTts = useCallback(() => {
    const text = ttsText.trim();
    if (!text) {
      setError(getErrorMessage({ ok: false, code: 'empty_text' }));
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setError(getErrorMessage({ ok: false, code: 'tts_unsupported' }));
      return;
    }

    clearOutput();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = ttsVoices.find((item) => item.voiceURI === ttsVoiceUri);
    if (voice) utterance.voice = voice;
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.volume = ttsVolume;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError(getErrorMessage({ ok: false, code: 'processing_failed' }));
    };

    setError('');
    window.speechSynthesis.speak(utterance);
  }, [clearOutput, getErrorMessage, ttsPitch, ttsRate, ttsText, ttsVoiceUri, ttsVoices, ttsVolume]);

  const stopTts = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) setSelectedFiles(event.dataTransfer.files);
  }, [setSelectedFiles]);

  const progressBlock = progress ? (
    <div className="rounded-lg border border-border-base bg-surface p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-content-secondary">{t(`stages.${progress.stage}`)}</span>
        <span className="text-content-muted">{progress.percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-surface-raised">
        <div className="h-full bg-action transition-[width]" style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-content-faint">{progress.label}</p>
    </div>
  ) : null;

  const errorBlock = error ? (
    <div className="rounded-lg border border-danger-content bg-danger-surface p-4 text-sm text-danger-content">
      {error}
    </div>
  ) : null;

  return (
    <ToolLayout toolId={toolId} content={content}>
      <div className={[
        'grid min-h-0 flex-grow gap-4',
        isStandalone ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]',
      ].join(' ')}>
        <Panel title={isRecorder ? t('record_title') : isTts ? t('tts_input_title') : uploadTitle}>
          {isTts ? (
            <div className="flex flex-col gap-4">
              <textarea
                value={ttsText}
                onChange={(event) => setTtsText(event.target.value)}
                placeholder={t('tts_placeholder')}
                className="min-h-56 resize-y rounded border border-border-input bg-surface-raised p-3 text-sm leading-6 text-content-secondary placeholder:text-content-faint focus:outline-none focus:ring-2 focus:ring-action"
              />

              <div className="grid gap-3 rounded-lg border border-border-base bg-surface p-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-content-secondary">
                  {t('tts_voice_label')}
                  <select
                    value={ttsVoiceUri}
                    onChange={(event) => setTtsVoiceUri(event.target.value)}
                    className="mt-2 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
                  >
                    <option value="">{t('tts_default_voice')}</option>
                    {ttsVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name}{voice.lang ? ` (${voice.lang})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-content-secondary">
                  <span className="flex items-center justify-between gap-3">
                    <span>{t('tts_rate_label')}</span>
                    <span className="text-content-muted">{ttsRate.toFixed(1)}x</span>
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ttsRate}
                    onChange={(event) => setTtsRate(Number(event.target.value))}
                    className="mt-3 w-full accent-action"
                  />
                </label>

                <label className="text-sm font-medium text-content-secondary">
                  <span className="flex items-center justify-between gap-3">
                    <span>{t('tts_pitch_label')}</span>
                    <span className="text-content-muted">{ttsPitch.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ttsPitch}
                    onChange={(event) => setTtsPitch(Number(event.target.value))}
                    className="mt-3 w-full accent-action"
                  />
                </label>

                <label className="text-sm font-medium text-content-secondary">
                  <span className="flex items-center justify-between gap-3">
                    <span>{t('tts_volume_label')}</span>
                    <span className="text-content-muted">{Math.round(ttsVolume * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ttsVolume}
                    onChange={(event) => setTtsVolume(Number(event.target.value))}
                    className="mt-3 w-full accent-action"
                  />
                </label>
              </div>

              {isSpeaking && (
                <div className="rounded-lg border border-border-base bg-surface-raised p-4 text-sm font-medium text-content-secondary">
                  {t('tts_speaking')}
                </div>
              )}

              {errorBlock}
            </div>
          ) : isRecorder ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border-base bg-surface-raised p-4">
                <div className="flex flex-wrap gap-2">
                  {recordingState !== 'recording' ? (
                    <Button onClick={startRecording} disabled={isProcessing}>
                      {t('start_recording')}
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={stopRecording}>
                      {t('stop_recording')}
                    </Button>
                  )}
                  {recording && (
                    <Button
                      variant="secondary"
                      onClick={() => downloadUrl(recording.url, recording.filename)}
                    >
                      {t('download_raw')}
                    </Button>
                  )}
                </div>
                <p className="mt-3 text-sm text-content-muted">
                  {recordingState === 'recording' ? t('recording_now') : t('record_hint')}
                </p>
              </div>

              {recording && (
                <audio controls src={recording.url} className="w-full" />
              )}

              {(progressBlock || errorBlock) && (
                <div className="flex flex-col gap-3">
                  {progressBlock}
                  {errorBlock}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <label
                className={[
                  'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors',
                  liveTranscriptionActive
                    ? 'cursor-not-allowed border-border-subtle bg-surface text-content-faint'
                    : dragging
                    ? 'border-border-strong bg-surface-hover'
                    : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover',
                ].join(' ')}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (liveTranscriptionActive) return;
                  setDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  if (liveTranscriptionActive) {
                    event.preventDefault();
                    setDragging(false);
                    return;
                  }
                  onDrop(event);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={isMerge}
                  disabled={liveTranscriptionActive}
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) setSelectedFiles(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
                <span className="text-sm font-semibold text-content">{t('drop_title')}</span>
                <span className="max-w-sm text-sm leading-relaxed text-content-muted">
                  {isExtract ? t('drop_video_hint') : isMerge ? t('drop_multiple_hint') : t('drop_audio_hint')}
                </span>
              </label>

              {isTranscribe && (
                <div className="rounded-lg border border-border-base bg-surface p-4">
                  <div className="flex flex-wrap gap-2">
                    {liveTranscriptionState === 'recording' ? (
                      <Button variant="danger" onClick={stopLiveTranscription}>
                        {t('stop_microphone_transcription')}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={startLiveTranscription}
                        disabled={isProcessing || liveTranscriptionState === 'stopping'}
                      >
                        {t('start_microphone_transcription')}
                      </Button>
                    )}
                    {transcript && liveTranscriptionState === 'idle' && (
                      <Button variant="secondary" onClick={clearOutput}>
                        {t('clear')}
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-content-muted">
                    {liveTranscriptionState === 'recording'
                      ? t('microphone_transcribing_now')
                      : liveTranscriptionState === 'stopping'
                        ? t('microphone_finalizing')
                        : t('microphone_transcription_hint')}
                  </p>
                </div>
              )}
            </div>
          )}

          {files.length > 0 && !isStandalone && (
            <ul className="mt-4 flex flex-col gap-2">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="rounded border border-border-subtle bg-surface-raised p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-content">
                        {isMerge ? `${index + 1}. ` : ''}{file.name}
                      </div>
                      <div className="mt-1 text-xs text-content-muted">
                        {file.type || t('unknown_type')} · {formatAudioFileSize(file.size)}
                      </div>
                    </div>
                    {isMerge && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => moveSelectedFile(index, -1)}
                          disabled={index === 0 || isProcessing}
                          aria-label={t('move_up')}
                        >
                          {t('move_up')}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => moveSelectedFile(index, 1)}
                          disabled={index === files.length - 1 || isProcessing}
                          aria-label={t('move_down')}
                        >
                          {t('move_down')}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeSelectedFile(index)}
                          disabled={isProcessing}
                          aria-label={t('remove_file')}
                        >
                          {t('remove_file')}
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {usesBitrate && !isStandalone && (
            <div className="mt-4 rounded-lg border border-border-base bg-surface p-4">
              <label className="text-sm font-medium text-content-secondary" htmlFor="audio-bitrate">
                {t('bitrate_label')}
              </label>
              <select
                id="audio-bitrate"
                value={bitrate}
                onChange={(event) => setBitrate(Number(event.target.value))}
                className="mt-2 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              >
                {bitrateOptions.map((value) => (
                  <option key={value} value={value}>{value} kbps</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'volume' && (
            <div className="mt-4 rounded-lg border border-border-base bg-surface p-4">
              <label className="text-sm font-medium text-content-secondary" htmlFor="audio-volume">
                <span className="flex items-center justify-between gap-3">
                  <span>{t('volume_label')}</span>
                  <span className="text-content-muted">{Math.round(volumeGain * 100)}%</span>
                </span>
              </label>
              <input
                id="audio-volume"
                type="range"
                min="0"
                max="4"
                step="0.05"
                value={volumeGain}
                onChange={(event) => setVolumeGain(Number(event.target.value))}
                className="mt-3 w-full accent-action"
              />
            </div>
          )}

          {mode === 'speed' && (
            <div className="mt-4 rounded-lg border border-border-base bg-surface p-4">
              <label className="text-sm font-medium text-content-secondary" htmlFor="audio-speed">
                <span className="flex items-center justify-between gap-3">
                  <span>{t('speed_label')}</span>
                  <span className="text-content-muted">{playbackRate.toFixed(2)}x</span>
                </span>
              </label>
              <input
                id="audio-speed"
                type="range"
                min="0.25"
                max="4"
                step="0.05"
                value={playbackRate}
                onChange={(event) => setPlaybackRate(Number(event.target.value))}
                className="mt-3 w-full accent-action"
              />
            </div>
          )}

          {mode === 'sample-rate' && (
            <div className="mt-4 rounded-lg border border-border-base bg-surface p-4">
              <label className="text-sm font-medium text-content-secondary" htmlFor="audio-sample-rate">
                {t('sample_rate_label')}
              </label>
              <select
                id="audio-sample-rate"
                value={sampleRate}
                onChange={(event) => setSampleRate(Number(event.target.value))}
                className="mt-2 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              >
                {sampleRateOptions.map((value) => (
                  <option key={value} value={value}>{value} Hz</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'remove-silence' && (
            <div className="mt-4 grid gap-3 rounded-lg border border-border-base bg-surface p-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-content-secondary">
                <span className="flex items-center justify-between gap-3">
                  <span>{t('silence_threshold_label')}</span>
                  <span className="text-content-muted">{silenceThresholdDb} dB</span>
                </span>
                <input
                  type="range"
                  min="-80"
                  max="-10"
                  step="1"
                  value={silenceThresholdDb}
                  onChange={(event) => setSilenceThresholdDb(Number(event.target.value))}
                  className="mt-3 w-full accent-action"
                />
              </label>
              <label className="text-sm font-medium text-content-secondary">
                <span className="flex items-center justify-between gap-3">
                  <span>{t('silence_duration_label')}</span>
                  <span className="text-content-muted">{silenceDuration.toFixed(2)}s</span>
                </span>
                <input
                  type="range"
                  min="0.05"
                  max="2"
                  step="0.05"
                  value={silenceDuration}
                  onChange={(event) => setSilenceDuration(Number(event.target.value))}
                  className="mt-3 w-full accent-action"
                />
              </label>
            </div>
          )}

          {isTrim && (
            <div className="mt-4 grid gap-3 rounded-lg border border-border-base bg-surface p-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-content-secondary">
                {t('start_seconds')}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={startSeconds}
                  onChange={(event) => setStartSeconds(Number(event.target.value))}
                  className="mt-2 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
                />
              </label>
              <label className="text-sm font-medium text-content-secondary">
                {t('end_seconds')}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={endSeconds}
                  onChange={(event) => setEndSeconds(Number(event.target.value))}
                  className="mt-2 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
                />
              </label>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {isTts ? (
              <>
                <Button onClick={speakTts} disabled={!canRun}>
                  {isSpeaking ? t('tts_speaking') : actionLabel}
                </Button>
                <Button variant="secondary" onClick={stopTts} disabled={!isSpeaking}>
                  {t('actions.stop_speaking')}
                </Button>
                {ttsText && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      stopTts();
                      setTtsText('');
                      clearOutput();
                    }}
                  >
                    {t('clear')}
                  </Button>
                )}
              </>
            ) : isRecorder ? (
              <Button onClick={exportRecording} disabled={!recording || isProcessing}>
                {isProcessing ? t('processing') : t('actions.export_recording')}
              </Button>
            ) : (
              <Button onClick={runTool} disabled={!canRun}>
                {isProcessing ? t('processing') : actionLabel}
              </Button>
            )}
            {!isStandalone && files.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  setFiles([]);
                  clearOutput();
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                {t('clear')}
              </Button>
            )}
          </div>
        </Panel>

        {!isStandalone && (
          <Panel title={isTranscribe ? t('transcript_title') : t('output_title')}>
            <div className="flex min-h-80 flex-grow flex-col gap-4">
              {progressBlock}
              {errorBlock}

              {isTranscribe ? (
                <textarea
                  value={transcript}
                  readOnly
                  placeholder={t('empty_transcript')}
                  className="min-h-72 flex-grow resize-none rounded border border-border-input bg-surface-raised p-3 text-sm leading-6 text-content-secondary placeholder:text-content-faint focus:outline-none"
                />
              ) : output ? (
                <div className="flex flex-col gap-4">
                  <audio controls src={output.url} className="w-full" />
                  <div className="rounded-lg border border-border-base bg-surface p-4 text-sm text-content-muted">
                    <div className="font-medium text-content">{output.filename}</div>
                    <div className="mt-1">
                      {output.mimeType} · {formatAudioFileSize(output.size)} · {output.durationMs} ms
                    </div>
                  </div>
                  <Button onClick={() => downloadUrl(output.url, output.filename)}>
                    {t('download_output')}
                  </Button>
                </div>
              ) : (
                <div className="flex min-h-72 flex-grow items-center justify-center rounded-lg border border-border-subtle bg-surface-raised p-6 text-center text-sm text-content-muted">
                  {isTranscribe ? t('empty_transcript') : t('empty_output')}
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </ToolLayout>
  );
}
