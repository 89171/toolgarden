'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { extractFramesFromVideo } from '@/lib/utils/video-frames-browser';
import {
  planFrameExtraction,
  validateFramesFile,
  formatFrameTime,
  FRAMES_MAX_MOMENTS,
  FRAMES_JPEG_QUALITY_OPTIONS,
  FRAMES_MAX_FILE_SIZE,
  FRAMES_MAX_DURATION_SECONDS,
  type FrameExtractionMode,
  type FrameFormat,
  type ExtractedFrame,
  type VideoFramesProgress,
} from '@/lib/utils/video-frames';
import { createZipArchive } from '@/lib/utils/zip';
import { ToolLayout } from '@/components/ToolLayout';
import { videoFramesContent } from '@/lib/tools/content/video-frames';

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
}

interface FrameOutput extends ExtractedFrame {
  url: string;
}

/** 视频抽帧 / 截图：按时间点或固定间隔导出 PNG / JPG，多帧可打包 ZIP */
export default function VideoFrameExtractor() {
  const t = useTranslations('video_frames') as unknown as (key: string, values?: Record<string, string | number>) => string;

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceUrlRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [mode, setMode] = useState<FrameExtractionMode>('moments');
  const [moments, setMoments] = useState<number[]>([]);
  const [intervalStart, setIntervalStart] = useState(0);
  const [intervalEnd, setIntervalEnd] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(1);
  const [format, setFormat] = useState<FrameFormat>('png');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);
  const [progress, setProgress] = useState<VideoFramesProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [frames, setFrames] = useState<FrameOutput[]>([]);
  const [zipUrl, setZipUrl] = useState('');
  const [zipName, setZipName] = useState('');

  /** 卸载时统一释放所有 blob URL（clearFrames 在交互中已按批释放） */
  const cleanupRef = useRef<{ frameUrls: string[]; zip: string }>({ frameUrls: [], zip: '' });
  useEffect(() => () => {
    for (const url of cleanupRef.current.frameUrls) URL.revokeObjectURL(url);
    if (cleanupRef.current.zip) URL.revokeObjectURL(cleanupRef.current.zip);
  }, []);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    abortRef.current?.abort();
  }, []);

  const getErrorMessage = useCallback((code: string, detail?: string): string => {
    switch (code) {
      case 'unsupported_input':
        return t('errors.unsupported_input');
      case 'unsupported_browser':
        return t('errors.unsupported_browser');
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: formatFileSize(FRAMES_MAX_FILE_SIZE) });
      case 'video_too_long':
        return t('errors.video_too_long', { maxDuration: FRAMES_MAX_DURATION_SECONDS });
      case 'video_load_failed':
        return t('errors.video_load_failed');
      case 'canvas_context':
        return t('errors.canvas_context');
      case 'encode_failed':
        return t('errors.encode_failed');
      case 'no_frames':
        return t('errors.no_frames');
      case 'range_invalid':
        return t('errors.range_invalid');
      case 'cancelled':
        return t('errors.cancelled');
      default:
        return detail ? `${t('errors.general')} (${detail})` : t('errors.general');
    }
  }, [t]);

  const clearFrames = useCallback(() => {
    setFrames((current) => {
      for (const frame of current) URL.revokeObjectURL(frame.url);
      return [];
    });
    setZipUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return '';
    });
    setZipName('');
  }, []);

  const acceptFile = useCallback((selected: File) => {
    const check = validateFramesFile(selected);
    if (!check.ok) {
      setError(getErrorMessage(check.code));
      return;
    }

    setError('');
    clearFrames();
    setVideoMeta(null);
    setMoments([]);
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);

    const url = URL.createObjectURL(selected);
    sourceUrlRef.current = url;
    setSourceUrl(url);
    setFile(selected);
  }, [clearFrames, getErrorMessage]);

  const addCurrentMoment = useCallback(() => {
    const current = videoRef.current?.currentTime;
    if (!Number.isFinite(current)) return;
    setMoments((list) => {
      if (list.length >= FRAMES_MAX_MOMENTS) {
        setError(t('errors.too_many_moments', { maxMoments: FRAMES_MAX_MOMENTS }));
        return list;
      }
      setError('');
      return [...list, Number(current!.toFixed(3))];
    });
  }, [t]);

  const removeMoment = useCallback((index: number) => {
    setMoments((list) => list.filter((_, position) => position !== index));
  }, []);

  const cancelProcessing = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startProcessing = useCallback(async () => {
    if (!file || !videoMeta || isProcessing) return;

    const plan = planFrameExtraction({
      mode,
      timestamps: moments,
      intervalSeconds,
      start: intervalStart,
      end: intervalEnd || videoMeta.duration,
      duration: videoMeta.duration,
    });
    if (!plan.ok) {
      setError(getErrorMessage(plan.code));
      return;
    }

    setIsProcessing(true);
    setError('');
    clearFrames();
    setProgress({ stage: 'prepare', label: 'loading', percent: 2, completedFrames: 0, totalFrames: plan.times.length });

    const controller = new AbortController();
    abortRef.current = controller;

    const outcome = await extractFramesFromVideo(file, {
      times: plan.times,
      format,
      jpegQuality,
      signal: controller.signal,
      onProgress: (next) => setProgress(next),
    });

    setIsProcessing(false);
    abortRef.current = null;

    if (outcome.ok) {
      const frameUrls = outcome.frames.map((frame) => URL.createObjectURL(frame.blob));
      cleanupRef.current.frameUrls = frameUrls;
      setFrames(outcome.frames.map((frame, index) => ({ ...frame, url: frameUrls[index] })));
      setProgress(null);
      if (outcome.frames.length > 1) {
        const blob = await createZipArchive(outcome.frames.map((frame) => ({ filename: frame.filename, blob: frame.blob })));
        const url = URL.createObjectURL(blob);
        if (cleanupRef.current.zip) URL.revokeObjectURL(cleanupRef.current.zip);
        cleanupRef.current.zip = url;
        setZipUrl(url);
        setZipName(`${file.name.replace(/\.[^.]+$/, '') || 'video'}-frames.zip`);
      }
    } else {
      console.error('[video-frames] failed:', outcome.code, outcome.detail ?? '');
      setError(getErrorMessage(outcome.code, outcome.detail));
      setProgress(null);
    }
  }, [file, videoMeta, isProcessing, mode, moments, intervalSeconds, intervalStart, intervalEnd, format, jpegQuality, clearFrames, getErrorMessage]);

  const downloadFrame = useCallback((frame: FrameOutput) => {
    const anchor = document.createElement('a');
    anchor.href = frame.url;
    anchor.download = frame.filename;
    anchor.click();
  }, []);

  const canProcess = Boolean(file && videoMeta && !isProcessing)
    && (mode === 'interval' || moments.length > 0);

  return (
    <ToolLayout toolId="video-frames" content={videoFramesContent}>
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
              <span className="text-3xl" aria-hidden>📸</span>
              <span className="text-base font-semibold text-content">{t('drop_title')}</span>
              <span className="max-w-md text-sm text-content-muted">{t('drop_hint')}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <video
                ref={videoRef}
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
                  setIntervalEnd(Number(meta.duration.toFixed(2)));
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
                <span>{progress.stage === 'done' ? t('progress_done') : t('progress_extract', { done: progress.completedFrames, total: progress.totalFrames })}</span>
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
            <legend className="text-sm font-semibold text-content">{t('mode_title')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['moments', 'interval'] as FrameExtractionMode[]).map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm transition-colors ${
                    mode === option ? 'border-border-strong bg-surface-hover font-medium text-content' : 'border-border-base text-content-secondary hover:border-border-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="video-frames-mode"
                    className="sr-only"
                    checked={mode === option}
                    onChange={() => setMode(option)}
                    disabled={isProcessing}
                  />
                  {t(`mode_${option}`)}
                </label>
              ))}
            </div>
          </fieldset>

          {mode === 'moments' ? (
            <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4">
              <legend className="text-sm font-semibold text-content">{t('moments_title')}</legend>
              <Button variant="secondary" size="sm" onClick={addCurrentMoment} disabled={!videoMeta || isProcessing || moments.length >= FRAMES_MAX_MOMENTS} className="self-start">
                {t('add_current_time')}
              </Button>
              {moments.length === 0 ? (
                <p className="text-xs text-content-muted">{t('moments_empty')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {moments.map((moment, index) => (
                    <span
                      key={`${moment}-${index}`}
                      className="flex items-center gap-1 rounded-lg border border-border-base bg-surface px-2 py-1 font-mono text-xs text-content"
                    >
                      {formatFrameTime(moment)}
                      <button
                        type="button"
                        onClick={() => removeMoment(index)}
                        disabled={isProcessing}
                        className="text-content-muted hover:text-danger"
                        aria-label={t('remove_moment', { time: formatFrameTime(moment) })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </fieldset>
          ) : (
            <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4">
              <legend className="text-sm font-semibold text-content">{t('interval_title')}</legend>
              <label className="flex flex-col gap-1.5 text-xs text-content-muted">
                <span>{t('interval_start')}: <span className="font-mono text-content">{formatFrameTime(intervalStart)}</span></span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, (videoMeta?.duration ?? 1) - 0.1)}
                  step={0.1}
                  value={intervalStart}
                  onChange={(event) => setIntervalStart(Number(event.target.value))}
                  className="w-full"
                  aria-label={t('interval_start')}
                  disabled={!videoMeta || isProcessing}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs text-content-muted">
                <span>{t('interval_end')}: <span className="font-mono text-content">{formatFrameTime(intervalEnd)}</span></span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0.1, videoMeta?.duration ?? 1)}
                  step={0.1}
                  value={intervalEnd}
                  onChange={(event) => setIntervalEnd(Number(event.target.value))}
                  className="w-full"
                  aria-label={t('interval_end')}
                  disabled={!videoMeta || isProcessing}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs text-content-muted">
                <span>{t('interval_seconds')}</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={intervalSeconds}
                  onChange={(event) => setIntervalSeconds(Math.max(0.1, Number(event.target.value) || 1))}
                  className="w-full rounded-lg border border-border-input bg-surface px-2 py-1.5 text-sm text-content"
                  disabled={!videoMeta || isProcessing}
                />
              </label>
            </fieldset>
          )}

          <fieldset className="flex flex-col gap-3 border-b border-border-base pb-4">
            <legend className="text-sm font-semibold text-content">{t('format_title')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['png', 'jpeg'] as FrameFormat[]).map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm transition-colors ${
                    format === option ? 'border-border-strong bg-surface-hover font-medium text-content' : 'border-border-base text-content-secondary hover:border-border-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="video-frames-format"
                    className="sr-only"
                    checked={format === option}
                    onChange={() => setFormat(option)}
                    disabled={isProcessing}
                  />
                  {t(`format_${option}`)}
                </label>
              ))}
            </div>
            {format === 'jpeg' ? (
              <label className="flex flex-col gap-1.5 text-xs text-content-muted">
                <span>{t('jpeg_quality')}</span>
                <select
                  value={jpegQuality}
                  onChange={(event) => setJpegQuality(Number(event.target.value))}
                  className="w-full rounded-lg border border-border-input bg-surface px-2 py-1.5 text-sm text-content"
                  disabled={isProcessing}
                >
                  {FRAMES_JPEG_QUALITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{Math.round(option * 100)}%</option>
                  ))}
                </select>
              </label>
            ) : null}
          </fieldset>

          <Button onClick={startProcessing} disabled={!canProcess} className="mt-1 w-full">
            {isProcessing ? t('processing') : t('apply')}
          </Button>

          <p className="text-xs leading-5 text-content-muted">{t('local_note')}</p>
        </Panel>

        <Panel title={t('output_title')} className="flex flex-col gap-4 lg:col-span-2">
          {frames.length === 0 ? (
            <p className="text-sm text-content-muted">{t('output_empty')}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {frames.map((frame) => (
                  <figure key={frame.filename} className="flex flex-col gap-2 rounded-lg border border-border-base bg-surface p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frame.url} alt={t('frame_alt', { time: formatFrameTime(frame.timeSeconds) })} className="w-full rounded bg-surface-raised" loading="lazy" />
                    <figcaption className="flex items-center justify-between gap-1 text-xs text-content-muted">
                      <span className="font-mono">{formatFrameTime(frame.timeSeconds)}</span>
                      <button
                        type="button"
                        onClick={() => downloadFrame(frame)}
                        className="text-content-secondary underline-offset-2 hover:text-content hover:underline"
                      >
                        {t('download_frame')}
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
                <span>{t('frame_count', { count: frames.length })}</span>
                <span>{t('output_size', { size: formatFileSize(frames.reduce((sum, frame) => sum + frame.blob.size, 0)) })}</span>
                <span>{t('dimensions', { width: frames[0].width, height: frames[0].height })}</span>
              </div>
              {zipUrl ? (
                <Button
                  onClick={() => {
                    const anchor = document.createElement('a');
                    anchor.href = zipUrl;
                    anchor.download = zipName;
                    anchor.click();
                  }}
                  className="self-start"
                >
                  {t('download_zip', { count: frames.length })}
                </Button>
              ) : null}
            </>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
