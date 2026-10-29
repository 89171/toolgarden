'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { preloadFfmpeg } from '@/lib/utils/audio-browser';
import type {
  ImageCropHandle,
  ImageCropRect,
} from '@/lib/utils/image';
import {
  createCropRectFromPoints,
  createInitialWatermarkRect,
  moveCropRect,
  resizeCropRect,
} from '@/lib/utils/image';
import { removeVideoWatermark } from '@/lib/utils/video-watermark-browser';
import {
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_FILE_SIZE,
  type VideoWatermarkErrorCode,
  type VideoWatermarkProgress,
  type VideoWatermarkRemovalSuccess,
  type VideoWatermarkRepairMethod,
} from '@/lib/utils/video-watermark';
import { videoRemoveWatermarkContent } from '@/lib/tools/content/video-remove-watermark';
import { useUrlOption } from '@/components/useUrlOption';

const METHOD_URL_OPTIONS: Readonly<Record<string, VideoWatermarkRepairMethod>> = {
  auto: 'auto',
  temporal: 'temporal',
  fast: 'temporal',
  ai: 'ai',
  hq: 'hq',
};

type DragMode = 'draw' | 'move' | 'resize';

interface DragState {
  mode: DragMode;
  handle?: ImageCropHandle;
  startPoint: { x: number; y: number };
  startSelection: ImageCropRect;
}

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
}

interface OutputState {
  result: VideoWatermarkRemovalSuccess;
  url: string;
}

const SELECTION_HANDLES: Array<{ handle: ImageCropHandle; className: string }> = [
  { handle: 'nw', className: '-left-2 -top-2 cursor-nwse-resize' },
  { handle: 'n', className: 'left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'ne', className: '-right-2 -top-2 cursor-nesw-resize' },
  { handle: 'e', className: '-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize' },
  { handle: 'se', className: '-bottom-2 -right-2 cursor-nwse-resize' },
  { handle: 's', className: 'left-1/2 -bottom-2 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'sw', className: '-bottom-2 -left-2 cursor-nwse-resize' },
  { handle: 'w', className: '-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize' },
];

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function getSelectionStyle(selection: ImageCropRect, video: VideoMeta): React.CSSProperties {
  return {
    left: `${(selection.x / video.width) * 100}%`,
    top: `${(selection.y / video.height) * 100}%`,
    width: `${(selection.width / video.width) * 100}%`,
    height: `${(selection.height / video.height) * 100}%`,
  };
}

export function VideoWatermarkRemover() {
  const tc = useTranslations('common');
  const ti = useTranslations('video_remove_watermark');
  const inputRef = useRef<HTMLInputElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const selectionRef = useRef<ImageCropRect | null>(null);
  const videoMetaRef = useRef<VideoMeta | null>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadRequestRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [selection, setSelection] = useState<ImageCropRect | null>(null);
  const [method, selectMethod] = useUrlOption('mode', 'hq', METHOD_URL_OPTIONS);
  const [feather, setFeather] = useState(12);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [progress, setProgress] = useState<VideoWatermarkProgress | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);

  const canProcess = Boolean(file && videoMeta && selection && !isLoading && !isProcessing);

  const progressLabel = useMemo(() => {
    if (!progress) return '';
    switch (progress.stage) {
      case 'prepare':
        return ti('progress_prepare');
      case 'analyze':
        return ti('progress_analyze');
      case 'model':
        return progress.label === 'temporal-ready' ? ti('progress_analyze') : ti('progress_model');
      case 'render':
        return ti('progress_render');
      case 'audio':
        return ti('progress_audio');
      case 'done':
        return ti('progress_done');
      default:
        return ti('processing');
    }
  }, [progress, ti]);

  const getMethodLabel = useCallback((nextMethod: VideoWatermarkRepairMethod): string => {
    switch (nextMethod) {
      case 'temporal':
        return ti('method_temporal');
      case 'ai':
        return ti('method_ai');
      case 'hq':
        return ti('method_hq');
      default:
        return ti('method_auto');
    }
  }, [ti]);

  const getMethodDescription = useCallback((nextMethod: VideoWatermarkRepairMethod): string => {
    switch (nextMethod) {
      case 'temporal':
        return ti('method_temporal_description');
      case 'ai':
        return ti('method_ai_description');
      case 'hq':
        return ti('method_hq_description');
      default:
        return ti('method_auto_description');
    }
  }, [ti]);

  const getAppliedMethodLabel = useCallback(
    (result: VideoWatermarkRemovalSuccess): string => {
      const base =
        result.method === 'temporal'
          ? ti('method_value_temporal')
          : result.method === 'hq'
            ? ti('method_value_hq')
            : ti('method_value_ai');
      return method === 'auto' ? ti('method_value_auto', { method: base }) : base;
    },
    [method, ti]
  );

  const getErrorMessage = useCallback((code: VideoWatermarkErrorCode, detail?: string): string => {
    switch (code) {
      case 'selection_required':
        return ti('errors.selection_required');
      case 'unsupported_browser':
        return ti('errors.unsupported_browser');
      case 'unsupported_input':
        return ti('errors.unsupported_input');
      case 'file_too_large':
        return ti('errors.file_too_large', { maxSize: `${Math.round(MAX_VIDEO_FILE_SIZE / 1024 / 1024)}MB` });
      case 'video_too_long':
        return ti('errors.video_too_long', { maxDuration: `${Math.round(MAX_VIDEO_DURATION_SECONDS / 60)} 分钟` });
      case 'video_load_failed':
        return ti('errors.video_load_failed');
      case 'encode_failed':
        return ti('errors.encode_failed', { detail: detail ?? '' });
      case 'canvas_context':
        return ti('errors.canvas_context');
      case 'cancelled':
        return ti('errors.cancelled');
      default:
        return detail ? `${ti('errors.general')} (${detail})` : ti('errors.general');
    }
  }, [ti]);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    videoMetaRef.current = videoMeta;
  }, [videoMeta]);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => {
    // 进入页面即在空闲时预加载 ffmpeg 内核（下载 + 缓存 + 编译），处理时无需再等
    preloadFfmpeg();
  }, []);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const element = previewVideoRef.current;
    if (!element) return;
    const syncTime = () => setPreviewTime(element.currentTime);
    element.addEventListener('timeupdate', syncTime);
    element.addEventListener('seeked', syncTime);
    return () => {
      element.removeEventListener('timeupdate', syncTime);
      element.removeEventListener('seeked', syncTime);
    };
  }, [sourceUrl]);

  const clearOutput = useCallback(() => {
    setOutput((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  const clearVideo = useCallback(() => {
    loadRequestRef.current += 1;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearOutput();
    setFile(null);
    setSourceUrl('');
    setVideoMeta(null);
    setSelection(null);
    setError('');
    setIsLoading(false);
    setIsProcessing(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput, sourceUrl]);

  const updateSelection = useCallback((nextSelection: ImageCropRect) => {
    setSelection(nextSelection);
    clearOutput();
  }, [clearOutput]);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const selected = Array.from(fileList)[0];
    if (!selected) return;

    // 选择动作已落袋，立即清空 input value：
    // 否则下一次通过对话框重选同一个文件时不会触发 change，更换视频会静默失效
    if (inputRef.current) inputRef.current.value = '';

    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setIsLoading(true);
    setError('');
    clearOutput();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setFile(null);
    setSourceUrl('');
    setVideoMeta(null);
    setSelection(null);
    setPreviewTime(0);

    const url = URL.createObjectURL(selected);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fail = (message: string) => {
      if (requestId !== loadRequestRef.current) return;
      URL.revokeObjectURL(url);
      setIsLoading(false);
      setError(message);
    };

    video.onloadedmetadata = () => {
      if (requestId !== loadRequestRef.current) return;
      if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration) || video.duration <= 0) {
        fail(ti('errors.video_load_failed'));
        return;
      }
      const meta: VideoMeta = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      };
      const nextSelection = createInitialWatermarkRect(meta.width, meta.height);
      setFile(selected);
      setSourceUrl(url);
      setVideoMeta(meta);
      setSelection(nextSelection);
      selectionRef.current = nextSelection;
      setIsLoading(false);
    };
    video.onerror = () => fail(ti('errors.video_load_failed'));
    video.src = url;
  }, [clearOutput, sourceUrl, ti]);

  const getNaturalPoint = useCallback((event: PointerEvent | React.PointerEvent): { x: number; y: number } | null => {
    const element = previewWrapRef.current;
    const currentMeta = videoMetaRef.current;
    if (!element || !currentMeta) return null;

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * currentMeta.width;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * currentMeta.height;

    return {
      x: Math.min(currentMeta.width, Math.max(0, x)),
      y: Math.min(currentMeta.height, Math.max(0, y)),
    };
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;
      const currentMeta = videoMetaRef.current;
      if (!dragState || !currentMeta) return;

      const point = getNaturalPoint(event);
      if (!point) return;

      const deltaX = point.x - dragState.startPoint.x;
      const deltaY = point.y - dragState.startPoint.y;
      let nextSelection = dragState.startSelection;

      if (dragState.mode === 'draw') {
        nextSelection = createCropRectFromPoints(
          dragState.startPoint,
          point,
          currentMeta.width,
          currentMeta.height
        );
      } else if (dragState.mode === 'move') {
        nextSelection = moveCropRect(
          dragState.startSelection,
          deltaX,
          deltaY,
          currentMeta.width,
          currentMeta.height
        );
      } else if (dragState.handle) {
        nextSelection = resizeCropRect(
          dragState.startSelection,
          dragState.handle,
          deltaX,
          deltaY,
          currentMeta.width,
          currentMeta.height
        );
      }

      updateSelection(nextSelection);
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [getNaturalPoint, updateSelection]);

  const beginDraw = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const point = getNaturalPoint(event);
    const currentMeta = videoMetaRef.current;
    if (!point || !currentMeta) return;

    const startSelection = createCropRectFromPoints(point, point, currentMeta.width, currentMeta.height);
    dragStateRef.current = { mode: 'draw', startPoint: point, startSelection };
    updateSelection(startSelection);
  }, [getNaturalPoint, updateSelection]);

  const beginMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const point = getNaturalPoint(event);
    const currentSelection = selectionRef.current;
    if (!point || !currentSelection) return;

    dragStateRef.current = { mode: 'move', startPoint: point, startSelection: currentSelection };
  }, [getNaturalPoint]);

  const beginResize = useCallback((handle: ImageCropHandle, event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const point = getNaturalPoint(event);
    const currentSelection = selectionRef.current;
    if (!point || !currentSelection) return;

    dragStateRef.current = { mode: 'resize', handle, startPoint: point, startSelection: currentSelection };
  }, [getNaturalPoint]);

  const resetSelection = useCallback(() => {
    if (!videoMeta) return;
    updateSelection(createInitialWatermarkRect(videoMeta.width, videoMeta.height));
  }, [updateSelection, videoMeta]);

  const processVideo = useCallback(async () => {
    if (!file || !selection) return;

    setIsProcessing(true);
    setProgress(null);
    setError('');
    clearOutput();

    const controller = new AbortController();
    abortRef.current = controller;

    const result = await removeVideoWatermark(file, {
      selection,
      method,
      feather,
      onProgress: setProgress,
      signal: controller.signal,
    });

    abortRef.current = null;
    setIsProcessing(false);
    setProgress(null);

    if (!result.ok) {
      setError(getErrorMessage(result.code, result.detail));
      return;
    }

    setOutput({
      result,
      url: URL.createObjectURL(result.blob),
    });
  }, [clearOutput, feather, file, getErrorMessage, method, selection]);

  const cancelProcessing = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const downloadOutput = useCallback(() => {
    const current = outputRef.current;
    if (!current) return;
    const anchor = document.createElement('a');
    anchor.href = current.url;
    anchor.download = current.result.filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => anchor.remove(), 0);
  }, []);

  const sourceStats = useMemo(() => {
    if (!videoMeta || !file) return null;
    return [
      { label: ti('resolution'), value: `${videoMeta.width} × ${videoMeta.height}` },
      { label: ti('source_duration'), value: formatDuration(videoMeta.duration) },
      { label: ti('file_size'), value: formatFileSize(file.size) },
    ];
  }, [file, ti, videoMeta]);

  const outputStats = useMemo(() => {
    if (!output) return null;
    return [
      { label: ti('resolution'), value: `${output.result.width} × ${output.result.height}` },
      { label: ti('result_method'), value: getAppliedMethodLabel(output.result) },
      {
        label: ti('audio_track'),
        value: output.result.hasAudio ? ti('audio_track_kept') : ti('audio_track_dropped'),
      },
      { label: ti('file_size'), value: formatFileSize(output.result.outputSize) },
      { label: ti('duration'), value: ti('duration_value', { value: output.result.durationMs }) },
    ];
  }, [getAppliedMethodLabel, output, ti]);

  return (
    <ToolLayout toolId="video-remove-watermark" content={videoRemoveWatermarkContent}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(320px,420px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearVideo} disabled={!file && !error}>{tc('clear')}</Button>}
          className="h-[min(40rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-auto pr-1">
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) handleFiles(event.target.files);
              }}
            />

            {!file ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDraggingFile(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDraggingFile(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDraggingFile(false);
                  if (event.dataTransfer.files.length > 0) handleFiles(event.dataTransfer.files);
                }}
                className={`flex min-h-[180px] flex-grow flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  draggingFile ? 'border-border-strong bg-surface-hover' : 'border-border-base hover:bg-surface-hover'
                }`}
              >
                <span className="text-sm font-semibold text-content">{ti('drop_title')}</span>
                <span className="text-xs leading-5 text-content-muted">{ti('drop_hint')}</span>
                <span className="mt-1 text-xs text-content-faint">{ti('drop_action')}</span>
              </button>
            ) : (
              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <p className="truncate text-sm font-medium text-content" title={file.name}>{file.name}</p>
                {sourceStats ? (
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    {sourceStats.map((item) => (
                      <div key={item.label}>
                        <dt className="text-content-faint">{item.label}</dt>
                        <dd className="mt-0.5 font-medium text-content-secondary">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => inputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {ti('replace')}
                </Button>
              </div>
            )}

            <p className="text-xs leading-5 text-content-muted">{ti('local_note')}</p>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-semibold text-content">{ti('method_title')}</legend>
              {(['auto', 'temporal', 'ai', 'hq'] as VideoWatermarkRepairMethod[]).map((nextMethod) => (
                <label
                  key={nextMethod}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 transition-colors ${
                    method === nextMethod
                      ? 'border-border-strong bg-surface-hover'
                      : 'border-border-base hover:border-border-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="video-watermark-method"
                    className="mt-1 shrink-0"
                    checked={method === nextMethod}
                    onChange={() => selectMethod(nextMethod)}
                    disabled={isProcessing}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-content">
                      {getMethodLabel(nextMethod)}
                      {nextMethod === 'hq' ? (
                        <span className="rounded bg-surface-hover px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-content-muted">
                          HQ
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-content-muted">
                      {getMethodDescription(nextMethod)}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="video-watermark-feather" className="text-sm font-semibold text-content">
                  {ti('feather')}
                </label>
                <span className="text-xs text-content-muted">{ti('feather_value', { value: feather })}</span>
              </div>
              <input
                id="video-watermark-feather"
                type="range"
                min={0}
                max={40}
                step={2}
                value={feather}
                onChange={(event) => {
                  setFeather(Number(event.target.value));
                  clearOutput();
                }}
                disabled={isProcessing}
                className="accent-[var(--action)]"
              />
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <Button onClick={processVideo} disabled={!canProcess}>
                {isProcessing ? ti('processing') : ti('apply')}
              </Button>
              {isProcessing ? (
                <>
                  <div className="h-1.5 w-full overflow-hidden rounded bg-surface-hover">
                    <div
                      className="h-full rounded bg-action transition-all duration-300"
                      style={{ width: `${Math.max(4, progress?.percent ?? 4)}%` }}
                    />
                  </div>
                  <p className="text-xs text-content-muted">
                    {progressLabel}
                    {progress ? ` ${Math.round(progress.percent)}%` : ''}
                  </p>
                  <Button variant="secondary" size="sm" onClick={cancelProcessing}>
                    {ti('cancel')}
                  </Button>
                </>
              ) : null}
              {error ? (
                <p className="rounded border border-border-base bg-danger-surface px-3 py-2 text-xs leading-5 text-danger-content">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </Panel>

        <div className="flex min-h-0 flex-col gap-4 sm:gap-6 xl:min-h-0 xl:flex-row xl:overflow-hidden">
          <Panel
            title={ti('preview_title')}
            className="min-h-0 xl:h-auto xl:min-h-0 xl:flex-1"
          >
            {file && sourceUrl ? (
              <div className="flex min-h-0 flex-grow flex-col gap-2">
                <div
                  ref={previewWrapRef}
                  onPointerDown={beginDraw}
                  className="relative mx-auto w-fit max-w-full select-none touch-none"
                >
                  <video
                    ref={previewVideoRef}
                    src={sourceUrl}
                    muted
                    playsInline
                    preload="auto"
                    className="block max-h-[52vh] w-auto max-w-full rounded-lg bg-surface-raised"
                  />
                  {selection && videoMeta ? (
                    <div role="presentation" className="absolute inset-0 cursor-crosshair">
                      <div
                        className="absolute border-2 border-dashed border-content-faint bg-surface-hover/30"
                        style={getSelectionStyle(selection, videoMeta)}
                        onPointerDown={beginMove}
                      >
                        {!isProcessing
                          ? SELECTION_HANDLES.map(({ handle, className }) => (
                            <button
                              key={handle}
                              type="button"
                              aria-label={handle}
                              className={`absolute h-4 w-4 rounded-full border border-border-strong bg-surface ${className}`}
                              onPointerDown={(event) => beginResize(handle, event)}
                            />
                          ))
                          : null}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-content-muted">
                    {formatDuration(previewTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0.1, videoMeta?.duration ?? 0.1)}
                    step={0.05}
                    value={previewTime}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setPreviewTime(next);
                      const element = previewVideoRef.current;
                      if (element) element.currentTime = next;
                    }}
                    className="w-full accent-[var(--color-action,#111827)]"
                    aria-label={ti('preview_scrubber')}
                  />
                  <span className="w-12 shrink-0 text-xs tabular-nums text-content-muted">
                    {formatDuration(videoMeta?.duration ?? 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-grow flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-base p-8 text-center">
                <p className="text-sm font-semibold text-content">{ti('empty_title')}</p>
                <p className="max-w-sm text-xs leading-5 text-content-muted">{ti('empty_body')}</p>
              </div>
            )}
            {selection && videoMeta ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-content-muted">
                <span>{ti('selection_x', { value: Math.round(selection.x) })}</span>
                <span>{ti('selection_y', { value: Math.round(selection.y) })}</span>
                <span>{ti('selection_width', { value: Math.round(selection.width) })}</span>
                <span>{ti('selection_height', { value: Math.round(selection.height) })}</span>
                <Button variant="secondary" size="sm" onClick={resetSelection} disabled={isProcessing}>
                  {ti('reset_selection')}
                </Button>
              </div>
            ) : null}
          </Panel>

          <Panel title={ti('output_title')} className="min-h-0 xl:h-auto xl:min-h-0 xl:flex-1">
            {output ? (
              <div className="flex min-h-0 flex-grow flex-col gap-3 overflow-y-auto">
                <video
                  src={output.url}
                  controls
                  playsInline
                  className="max-h-[46vh] w-full rounded-lg bg-surface-raised"
                />
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  {outputStats?.map((item) => (
                    <div key={item.label} className="rounded border border-border-base bg-surface-raised px-2.5 py-2">
                      <dt className="text-content-faint">{item.label}</dt>
                      <dd className="mt-0.5 font-medium text-content-secondary">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button onClick={downloadOutput}>{ti('download')}</Button>
              </div>
            ) : (
              <div className="flex flex-grow items-center justify-center rounded-lg border-2 border-dashed border-border-base p-8 text-center">
                <p className="max-w-sm text-xs leading-5 text-content-muted">{ti('output_empty')}</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
