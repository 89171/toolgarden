'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { preloadFfmpeg } from '@/lib/utils/audio-browser';
import {
  reencodeVideoToMp4,
} from '@/lib/utils/video-reencode-browser';
import {
  computeOutputSize,
  validateReencodeFile,
  REENCODE_MAX_DURATION_SECONDS,
  REENCODE_MAX_FILE_SIZE,
  type ReencodeQuality,
  type VideoReencodeProgress,
  type VideoReencodeSuccess,
} from '@/lib/utils/video-reencode';
import { ToolLayout } from '@/components/ToolLayout';
import { videoCompressContent } from '@/lib/tools/content/video-compress';

const QUALITY_OPTIONS: ReadonlyArray<{ value: ReencodeQuality; labelKey: string; hintKey: string }> = [
  { value: 'high', labelKey: 'quality_high', hintKey: 'quality_high_hint' },
  { value: 'medium', labelKey: 'quality_medium', hintKey: 'quality_medium_hint' },
  { value: 'low', labelKey: 'quality_low', hintKey: 'quality_low_hint' },
];

const RESOLUTION_OPTIONS: ReadonlyArray<{ value: number | null; labelKey: string }> = [
  { value: null, labelKey: 'resolution_original' },
  { value: 1080, labelKey: 'resolution_1080' },
  { value: 720, labelKey: 'resolution_720' },
  { value: 480, labelKey: 'resolution_480' },
];

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
}

export default function VideoCompressor() {
  const t = useTranslations('video_compress') as unknown as (key: string, values?: Record<string, string | number>) => string;

  const inputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [quality, setQuality] = useState<ReencodeQuality>('medium');
  const [maxLongSide, setMaxLongSide] = useState<number | null>(720);
  const [progress, setProgress] = useState<VideoReencodeProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoReencodeSuccess | null>(null);
  const [draggingFile, setDraggingFile] = useState(false);

  useEffect(() => {
    // 进入页面即在空闲时预加载 ffmpeg 内核（下载 + 缓存 + 编译），处理时无需再等
    preloadFfmpeg();
  }, []);

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

  const handleMetaLoaded = useCallback((meta: VideoMeta) => {
    setVideoMeta(meta);
  }, []);

  const acceptFile = useCallback((selected: File) => {
    const check = validateReencodeFile(selected);
    if (!check.ok) {
      setError(getErrorMessage(check.code));
      return;
    }

    setError('');
    setResult(null);
    setVideoMeta(null);
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
    if (!file || !videoMeta || isProcessing) return;

    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress({ stage: 'prepare', label: 'loading', percent: 1 });

    const controller = new AbortController();
    abortRef.current = controller;

    const outcome = await reencodeVideoToMp4(file, {
      quality,
      maxLongSide,
      trim: null,
      suffix: 'compressed',
      signal: controller.signal,
      onProgress: (next) => setProgress(next),
    });

    setIsProcessing(false);
    abortRef.current = null;

    if (outcome.ok) {
      setResult(outcome);
      setProgress(null);
    } else {
      console.error('[video-compress] failed:', outcome.code, outcome.detail ?? '');
      setError(getErrorMessage(outcome.code, outcome.detail));
      setProgress(null);
    }
  }, [file, videoMeta, isProcessing, quality, maxLongSide, getErrorMessage]);

  const estimatedSize = file && videoMeta
    ? (() => {
        const size = computeOutputSize(videoMeta.width, videoMeta.height, maxLongSide);
        const bitrateByQuality: Record<ReencodeQuality, number> = { high: 0.12, medium: 0.07, low: 0.04 };
        const bps = size.width * size.height * 30 * bitrateByQuality[quality];
        const audioBps = { high: 160, medium: 128, low: 96 }[quality] * 1000;
        return (bps + audioBps) / 8 * videoMeta.duration;
      })()
    : 0;

  return (
    <ToolLayout toolId="video-compress" content={videoCompressContent}>
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
              onDragOver={(event) => {
                event.preventDefault();
                setDraggingFile(true);
              }}
              onDragLeave={() => setDraggingFile(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDraggingFile(false);
                const dropped = event.dataTransfer.files?.[0];
                if (dropped) acceptFile(dropped);
              }}
              className={`flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                draggingFile ? 'border-border-strong bg-surface-hover' : 'border-border-base hover:border-border-strong'
              }`}
            >
              <span className="text-3xl" aria-hidden>🎥</span>
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
                  handleMetaLoaded({
                    width: element.videoWidth,
                    height: element.videoHeight,
                    duration: element.duration,
                  });
                }}
                className="mx-auto block max-h-[52vh] w-auto max-w-full rounded-lg bg-surface-raised"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
                <span className="truncate font-medium text-content-secondary">{file.name}</span>
                <span>{formatFileSize(file.size)}</span>
                {videoMeta ? (
                  <span>
                    {videoMeta.width}×{videoMeta.height} · {videoMeta.duration.toFixed(1)}s
                  </span>
                ) : null}
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
          <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4">
            <legend className="text-sm font-semibold text-content">{t('quality_title')}</legend>
            {QUALITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 transition-colors ${
                  quality === option.value ? 'border-border-strong bg-surface-hover' : 'border-border-base hover:border-border-strong'
                }`}
              >
                <input
                  type="radio"
                  name="video-compress-quality"
                  className="mt-1 shrink-0"
                  checked={quality === option.value}
                  onChange={() => setQuality(option.value)}
                  disabled={isProcessing}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-content">{t(option.labelKey)}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-content-muted">{t(option.hintKey)}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4">
            <legend className="text-sm font-semibold text-content">{t('resolution_title')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTION_OPTIONS.map((option) => (
                <label
                  key={String(option.value)}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm transition-colors ${
                    maxLongSide === option.value ? 'border-border-strong bg-surface-hover font-medium text-content' : 'border-border-base text-content-secondary hover:border-border-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="video-compress-resolution"
                    className="sr-only"
                    checked={maxLongSide === option.value}
                    onChange={() => setMaxLongSide(option.value)}
                    disabled={isProcessing}
                  />
                  {t(option.labelKey)}
                </label>
              ))}
            </div>
          </fieldset>

          {file && videoMeta && estimatedSize > 0 ? (
            <p className="text-xs leading-5 text-content-muted">{t('estimate', { size: formatFileSize(Math.round(estimatedSize)) })}</p>
          ) : null}

          <Button onClick={startProcessing} disabled={!file || !videoMeta || isProcessing} className="mt-1 w-full">
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
