'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { preloadFfmpeg } from '@/lib/utils/audio-browser';
import { mergeVideosToMp4 } from '@/lib/utils/video-merge-browser';
import {
  validateReencodeFile,
  type ReencodeQuality,
} from '@/lib/utils/video-reencode';
import {
  validateMergeFiles,
  MERGE_MAX_FILES,
  MERGE_MAX_FILE_SIZE,
  MERGE_MAX_TOTAL_SIZE,
  type VideoMergeProgress,
  type VideoMergeSuccess,
} from '@/lib/utils/video-merge';
import { ToolLayout } from '@/components/ToolLayout';
import { videoMergeContent } from '@/lib/tools/content/video-merge';

/** 视频合并：多段视频按添加顺序拼接为单个 MP4，统一到第一段的分辨率 */
export default function VideoMerger() {
  const t = useTranslations('video_merge') as unknown as (key: string, values?: Record<string, string | number>) => string;

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<ReencodeQuality>('high');
  const [progress, setProgress] = useState<VideoMergeProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoMergeSuccess | null>(null);
  const [resultUrl, setResultUrl] = useState('');

  useEffect(() => {
    preloadFfmpeg();
  }, []);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const getProgressLabel = useCallback((next: VideoMergeProgress): string => {
    switch (next.stage) {
      case 'prepare':
        return t('progress_prepare');
      case 'render':
        return t('progress_render_segment', { current: next.currentFile, total: next.fileCount });
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
        return t('errors.file_too_large', { maxSize: formatFileSize(MERGE_MAX_FILE_SIZE) });
      case 'video_too_long':
        return t('errors.video_too_long');
      case 'total_too_long':
        return t('errors.total_too_long');
      case 'too_few_files':
        return t('errors.too_few_files');
      case 'too_many_files':
        return t('errors.too_many_files', { maxFiles: MERGE_MAX_FILES });
      case 'total_too_large':
        return t('errors.total_too_large', { maxSize: formatFileSize(MERGE_MAX_TOTAL_SIZE) });
      case 'video_load_failed':
        return t('errors.video_load_failed');
      case 'canvas_context':
        return t('errors.canvas_context');
      case 'cancelled':
        return t('errors.cancelled');
      default:
        return detail ? `${t('errors.general')} (${detail})` : t('errors.general');
    }
  }, [t]);

  const addFiles = useCallback((selected: FileList | File[]) => {
    const incoming = Array.from(selected);
    const next = [...files, ...incoming];
    if (next.length > MERGE_MAX_FILES) {
      setError(getErrorMessage('too_many_files', String(MERGE_MAX_FILES)));
      return;
    }
    for (const item of incoming) {
      const check = validateReencodeFile(item);
      if (!check.ok) {
        setError(getErrorMessage(check.code));
        return;
      }
      if (item.size > MERGE_MAX_FILE_SIZE) {
        setError(getErrorMessage('file_too_large'));
        return;
      }
    }
    const total = next.reduce((sum, item) => sum + item.size, 0);
    if (total > MERGE_MAX_TOTAL_SIZE) {
      setError(getErrorMessage('total_too_large'));
      return;
    }
    setError('');
    setResult(null);
    setFiles(next);
  }, [files, getErrorMessage]);

  const removeFile = useCallback((index: number) => {
    setFiles((current) => current.filter((_, position) => position !== index));
    setResult(null);
    setError('');
  }, []);

  const moveFile = useCallback((index: number, offset: -1 | 1) => {
    setFiles((current) => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult(null);
  }, []);

  const cancelProcessing = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startProcessing = useCallback(async () => {
    if (files.length < 2 || isProcessing) return;

    const check = validateMergeFiles(files);
    if (!check.ok) {
      setError(getErrorMessage(check.code));
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress({ stage: 'prepare', label: 'loading', percent: 1, currentFile: 0, fileCount: files.length });

    const controller = new AbortController();
    abortRef.current = controller;

    const outcome = await mergeVideosToMp4(files, {
      quality,
      signal: controller.signal,
      onProgress: (next) => setProgress(next),
    });

    setIsProcessing(false);
    abortRef.current = null;

    if (outcome.ok) {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(outcome.blob));
      setResult(outcome);
      setProgress(null);
    } else {
      console.error('[video-merge] failed:', outcome.code, outcome.detail ?? '');
      setError(getErrorMessage(outcome.code, outcome.detail));
      setProgress(null);
    }
  }, [files, isProcessing, quality, resultUrl, getErrorMessage]);

  const canProcess = files.length >= 2 && !isProcessing;
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);

  return (
    <ToolLayout toolId="video-merge" content={videoMergeContent}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title={t('list_title')} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files);
              event.target.value = '';
            }}
          />

          {files.length === 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-base p-8 text-center transition-colors hover:border-border-strong"
            >
              <span className="text-3xl" aria-hidden>🎬</span>
              <span className="text-base font-semibold text-content">{t('drop_title')}</span>
              <span className="max-w-md text-sm text-content-muted">{t('drop_hint')}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {files.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-border-base bg-surface px-3 py-2"
                >
                  <span className="w-6 text-center text-sm font-medium text-content-muted">{index + 1}</span>
                  <span className="min-w-0 flex-grow truncate text-sm text-content">{item.name}</span>
                  <span className="text-xs text-content-muted">{formatFileSize(item.size)}</span>
                  <Button variant="secondary" size="sm" onClick={() => moveFile(index, -1)} disabled={index === 0 || isProcessing} aria-label={t('move_up')}>
                    ↑
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1 || isProcessing} aria-label={t('move_down')}>
                    ↓
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => removeFile(index)} disabled={isProcessing} aria-label={t('remove')}>
                    ×
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
                <span>{t('file_count', { count: files.length, max: MERGE_MAX_FILES })}</span>
                <span>{t('total_size', { size: formatFileSize(totalSize) })}</span>
                <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={files.length >= MERGE_MAX_FILES || isProcessing}>
                  {t('add_more')}
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
                    name="video-merge-quality"
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
              <video src={resultUrl || undefined} controls muted playsInline className="mx-auto block max-h-[52vh] w-auto max-w-full rounded-lg bg-surface-raised" />
              <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
                <span className="font-medium text-content-secondary">{result.filename}</span>
                <span>{formatFileSize(result.outputSize)}</span>
                <span>{result.width}×{result.height}</span>
                <span>{t('segment_count', { count: result.segmentCount })}</span>
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
