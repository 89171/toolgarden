'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
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
}

interface OutputState {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  durationMs: number;
}

const bitrateOptions = [64, 96, 128, 192, 256, 320];

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

export function AudioTool({ toolId, mode }: AudioToolProps) {
  const t = useTranslations('audio_tool');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AudioProcessingProgress | null>(null);
  const [error, setError] = useState('');
  const [output, setOutput] = useState<OutputState | null>(null);
  const [transcript, setTranscript] = useState('');
  const [bitrate, setBitrate] = useState(mode === 'compress' ? 96 : 192);
  const [startSeconds, setStartSeconds] = useState(0);
  const [endSeconds, setEndSeconds] = useState(30);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'ready'>('idle');
  const [recording, setRecording] = useState<{ blob: Blob; url: string; filename: string } | null>(null);

  const isMerge = mode === 'merge';
  const isRecorder = mode === 'recorder';
  const isTranscribe = mode === 'transcribe';
  const isExtract = mode === 'extract';
  const isTrim = mode === 'trim';
  const targetFormat: AudioOutputFormat = mode === 'to-wav' ? 'wav' : 'mp3';
  const accept = getAudioAcceptValue(isExtract);
  const canRun = isRecorder ? Boolean(recording) : files.length > 0 && !isProcessing;

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
  }, [output, recording]);

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
    if (mode === 'recorder') return;

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
  }, [bitrate, clearOutput, endSeconds, files, getErrorMessage, mode, startSeconds, t, targetFormat]);

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
    <ToolLayout toolId={toolId}>
      <div className={[
        'grid min-h-0 flex-grow gap-4',
        isRecorder ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]',
      ].join(' ')}>
        <Panel title={isRecorder ? t('record_title') : uploadTitle}>
          {isRecorder ? (
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
            <label
              className={[
                'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors',
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover',
              ].join(' ')}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={isMerge}
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
          )}

          {files.length > 0 && !isRecorder && (
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

          {(mode === 'to-mp3' || mode === 'compress' || mode === 'merge' || mode === 'trim') && (
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
            {isRecorder ? (
              <Button onClick={exportRecording} disabled={!recording || isProcessing}>
                {isProcessing ? t('processing') : t('actions.export_recording')}
              </Button>
            ) : (
              <Button onClick={runTool} disabled={!canRun}>
                {isProcessing ? t('processing') : actionLabel}
              </Button>
            )}
            {!isRecorder && files.length > 0 && (
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

        {!isRecorder && (
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
