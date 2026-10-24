'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { reencodeVideoToMp4 } from '@/lib/utils/video-reencode-browser';
import {
  validateReencodeFile,
  REENCODE_MAX_DURATION_SECONDS,
  REENCODE_MAX_FILE_SIZE,
  type ReencodeQuality,
  type VideoReencodeProgress,
  type VideoReencodeSuccess,
} from '@/lib/utils/video-reencode';
import { ToolLayout } from '@/components/ToolLayout';
import { videoTrimContent } from '@/lib/tools/content/video-trim';

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(1).padStart(4, '0')}`;
}

export default function VideoTrimmer() {
  const t = useTranslations('video_trim') as unknown as (key: string, values?: Record<string, string | number>) => string;

  const inputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [quality, setQuality] = useState<ReencodeQuality>('high');
  const [progress, setProgress] = useState<VideoReencodeProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoReencodeSuccess | null>(null);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    abortRef.current?.abort();
  }, []);

  const getProgressLabel = useCallback((next: VideoReencodeProgress): string => {
    switch (next.stage) {
      case 'prepare':
        return t('progress_prepare');
      case 'model':
        return t('progress_analyze');
      case 'render':
        return t('progress_render');
      case 'audio':
        return t('progress_audio');
      default:
        return t('progress_done');
    }
  }, [t]);

  const getErrorMessage = useCallback((code: string, detail?: string): string => {
    switch (code) {
      case 'unsupported_input':
        return t('errors.unsupported_input');
      case 'unsupported_browser':
        return t('errors.unsupported_browser');
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: formatFileSize(REENCODE_MAX_FILE_SIZE) });
      case 'video_too_long':
        return t('errors.video_too_long', { maxDuration: REENCODE_MAX_DURATION_SECONDS });
      case 'video_load_failed':
        return t('errors.video_load_failed');
      case 'encode_failed':
        return t('errors.encode_failed');
      case 'canvas_context':
        return t('errors.canvas_context');
      case 'range_invalid':
        return t('errors.range_invalid');
      case 'cancelled':
        return t('errors.cancelled');
      default:
        return detail ? `${t('errors.general')} (${detail})` : t('errors.general');
    }
  }, [t]);

  const acceptFile = useCallback((selected: File) => {
    const check = validateReencodeFile(selected);
    if (!check.ok) {
      setError(getErrorMessage(check.code));
      return;
    }

    setError('');
    setResult(null);
    setVideoMeta(null);
    setRange(null);
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);

    const url = URL.createObjectURL(selected);
    sourceUrlRef.current = url;
    setSourceUrl(url);
    setFile(selected);
  }, [getErrorMessage]);

  const cancelProcessing = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startProcessing = useCallback(async () => {
    if (!file || !videoMeta || !range || isProcessing) return;

    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress({ stage: 'prepare', label: 'loading', percent: 1 });

    const controller = new AbortController();
    abortRef.current = controller;

    const outcome = await reencodeVideoToMp4(file, {
      quality,
      maxLongSide: null,
      trim: range,
      suffix: 'trimmed',
      signal: controller.signal,
      onProgress: (next) => setProgress(next),
    });

    setIsProcessing(false);
    abortRef.current = null;

    if (outcome.ok) {
      setResult(outcome);
      setProgress(null);
    } else {
      console.error('[video-trim] failed:', outcome.code, outcome.detail ?? '');
      setError(getErrorMessage(outcome.code, outcome.detail));
      setProgress(null);
    }
  }, [file, videoMeta, range, isProcessing, quality, getErrorMessage]);

  const canProcess = Boolean(file && videoMeta && range && !isProcessing);
  const trimmedDuration = range ? range.end - range.start : 0;

  return (
    <ToolLayout toolId="video-trim" content={videoTrimContent}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title={t('preview_title')} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) acceptFile(selected);
              event.target.value = '';
            }}
          />

          {!file || !sourceUrl ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-base p-8 text-center transition-colors hover:border-border-strong"
            >
              <span className="text-3xl" aria-hidden>✂️</span>
              <span className="text-base font-semibold text-content">{t('drop_title')}</span>
              <span className="max-w-md text-sm text-content-muted">{t('drop_hint')}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              { }
              <video
                src={sourceUrl}
                controls
                muted
                playsInline
                onLoadedMetadata={(event) => {
                  const element = event.currentTarget;
                  const meta = {
                    width: element.videoWidth,
                    height: element.videoHeight,
                    duration: element.duration,
                  };
                  setVideoMeta(meta);
                  if (!range) {
                    setRange({ start: 0, end: meta.duration });
                  }
                }}
                className="mx-auto block max-h-[52vh] w-auto max-w-full rounded-lg bg-surface-raised"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
                <span className="truncate font-medium text-content-secondary">{file.name}</span>
                <span>{formatFileSize(file.size)}</span>
                {videoMeta ? <span>{videoMeta.width}×{videoMeta.height} · {videoMeta.duration.toFixed(1)}s</span> : null}
                <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={isProcessing}>
                  {t('replace')}
                </Button>
              </div>
            </div>
          )}

          {error ? (
            <p role="alert" className="rounded-lg bg-danger-weak px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}

          {progress ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-content-secondary">
                <span>{getProgressLabel(progress)}</span>
                <span>{Math.round(progress.percent)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-[var(--accent,#3b82f6)] transition-[width] duration-200"
                  style={{ width: `${Math.min(100, Math.max(2, progress.percent))}%` }}
                />
              </div>
              <Button variant="secondary" size="sm" onClick={cancelProcessing} className="self-start">
                {t('cancel')}
              </Button>
            </div>
          ) : null}
        </Panel>

        <Panel title={t('settings_title')} className="flex flex-col gap-4 self-start">
          <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4" disabled={!videoMeta || isProcessing}>
            <legend className="text-sm font-semibold text-content">{t('range_title')}</legend>
            {videoMeta && range ? (
              <>
                <label className="flex flex-col gap-1.5 text-xs text-content-muted">
                  <span>{t('range_start')}: <span className="font-mono text-content">{formatTime(range.start)}</span></span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0.1, videoMeta.duration - 0.2)}
                    step={0.1}
                    value={range.start}
                    onChange={(event) => {
                      const next = Math.min(Number(event.target.value), range.end - 0.2);
                      setRange({ ...range, start: next });
                    }}
                    className="w-full"
                    aria-label={t('range_start')}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-content-muted">
                  <span>{t('range_end')}: <span className="font-mono text-content">{formatTime(range.end)}</span></span>
                  <input
                    type="range"
                    min={0.2}
                    max={Math.max(0.2, videoMeta.duration)}
                    step={0.1}
                    value={range.end}
                    onChange={(event) => {
                      const next = Math.max(Number(event.target.value), range.start + 0.2);
                      setRange({ ...range, end: next });
                    }}
                    className="w-full"
                    aria-label={t('range_end')}
                  />
                </label>
                <p className="text-xs text-content-muted">
                  {t('range_summary', { start: formatTime(range.start), end: formatTime(range.end), duration: trimmedDuration.toFixed(1) })}
                </p>
              </>
            ) : (
              <p className="text-sm text-content-muted">{t('range_empty')}</p>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4">
            <legend className="text-sm font-semibold text-content">{t('quality_title')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as ReencodeQuality[]).map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm transition-colors ${
                    quality === option ? 'border-border-strong bg-surface-hover font-medium text-content' : 'border-border-base text-content-secondary hover:border-border-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="video-trim-quality"
                    className="sr-only"
                    checked={quality === option}
                    onChange={() => setQuality(option)}
                    disabled={isProcessing}
                  />
                  {t(`quality_${option}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <Button onClick={startProcessing} disabled={!canProcess} className="mt-1 w-full">
            {isProcessing ? t('processing') : t('apply')}
          </Button>

          <p className="text-xs leading-5 text-content-muted">{t('local_note')}</p>
        </Panel>

        <Panel title={t('output_title')} className="flex flex-col gap-3 lg:col-span-2">
          {result ? (
            <div className="flex flex-col gap-3">
              { }
              <video src={URL.createObjectURL(result.blob)} controls muted playsInline className="mx-auto block max-h-[52vh] w-auto max-w-full rounded-lg bg-surface-raised" />
              <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
                <span className="font-medium text-content-secondary">{result.filename}</span>
                <span>{formatFileSize(result.outputSize)}</span>
                <span>{result.width}×{result.height}</span>
                <span>{t('audio_track')}: {result.hasAudio ? t('audio_track_kept') : t('audio_track_dropped')}</span>
                <span>{t('duration_value', { value: result.durationMs })}</span>
              </div>
              <Button
                onClick={() => {
                  const url = URL.createObjectURL(result.blob);
                  const anchor = document.createElement('a');
                  anchor.href = url;
                  anchor.download = result.filename;
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
                className="self-start"
              >
                {t('download')}
              </Button>
            </div>
          ) : error ? (
            <p role="alert" className="rounded-lg bg-danger-weak px-3 py-2 text-sm text-danger">{error}</p>
          ) : (
            <p className="text-sm text-content-muted">{t('output_empty')}</p>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
