'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { preloadFfmpeg } from '@/lib/utils/audio-browser';
import { reencodeVideoToMp4 } from '@/lib/utils/video-reencode-browser';
import {
  validateReencodeFile,
  REENCODE_MAX_DURATION_SECONDS,
  REENCODE_MAX_FILE_SIZE,
  type ReencodeQuality,
  type VideoReencodeProgress,
  type VideoReencodeSuccess,
} from '@/lib/utils/video-reencode';
import {
  CROP_RATIO_PRESETS,
  cropRectToPixelRegion,
  describeCropRegion,
  resizeCropRect,
  snapCropRectToPixelRatio,
  type CropHandle,
  type CropRect,
  type CropRatioId,
} from '@/lib/utils/video-crop';
import { ToolLayout } from '@/components/ToolLayout';
import { videoCropContent } from '@/lib/tools/content/video-crop';

interface VideoMeta {
  width: number;
  height: number;
  duration: number;
}

const HANDLES: Array<{ id: CropHandle; className: string }> = [
  { id: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
  { id: 'n', className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
  { id: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
  { id: 'e', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
  { id: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
  { id: 's', className: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
  { id: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
  { id: 'w', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
];

/** 初始选区：居中 80% 画面，比例随源视频 */
function createInitialRect(): CropRect {
  return { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
}

export default function VideoCropper() {
  const t = useTranslations('video_crop') as unknown as (key: string, values?: Record<string, string | number>) => string;

  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sourceUrlRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);
  const gestureRef = useRef<{ handle: CropHandle; startRect: CropRect; startPoint: { x: number; y: number } } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [rect, setRect] = useState<CropRect>(createInitialRect);
  const [ratioId, setRatioId] = useState<CropRatioId>('free');
  const [quality, setQuality] = useState<ReencodeQuality>('high');
  const [progress, setProgress] = useState<VideoReencodeProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoReencodeSuccess | null>(null);

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
      case 'crop_invalid':
        return t('errors.crop_invalid');
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
    setRect(createInitialRect());
    setRatioId('free');
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);

    const url = URL.createObjectURL(selected);
    sourceUrlRef.current = url;
    setSourceUrl(url);
    setFile(selected);
  }, [getErrorMessage]);

  const cancelProcessing = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /**
   * 把指针事件坐标换算成选区空间的归一化坐标。
   * 手势起点需要夹进舞台（一定在 [0,1]），移动中的指针则不夹：
   * 相对位移要保留拖出画面外的距离，最终由 resizeCropRect 把选区夹回画面内。
   */
  const pointerToNormalized = useCallback((clientX: number, clientY: number, clampToStage = true) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const bounds = stage.getBoundingClientRect();
    const x = bounds.width > 0 ? (clientX - bounds.left) / bounds.width : 0;
    const y = bounds.height > 0 ? (clientY - bounds.top) / bounds.height : 0;
    if (!clampToStage) return { x, y };
    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  }, []);

  const beginGesture = useCallback((handle: CropHandle) => (event: React.PointerEvent) => {
    if (!videoMeta || isProcessing) return;
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    gestureRef.current = {
      handle,
      startRect: rect,
      startPoint: pointerToNormalized(event.clientX, event.clientY),
    };
  }, [videoMeta, isProcessing, rect, pointerToNormalized]);

  useEffect(() => {
    if (!videoMeta) return;

    const onPointerMove = (event: PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      const pointer = pointerToNormalized(event.clientX, event.clientY, false);
      // 比例换算成归一化空间：像素比例 × (videoHeight / videoWidth)
      const preset = CROP_RATIO_PRESETS.find((item) => item.id === ratioId);
      const normalizedRatio = preset?.ratio ? preset.ratio * (videoMeta.height / videoMeta.width) : null;
      // 用按下时的指针位置做相对位移：在选区内部任意位置按下拖动时，
      // 选区应整体平移，而不是把中心瞬间吸附到指针；缩放手柄同理。
      const next = resizeCropRect({
        rect: gesture.startRect,
        handle: gesture.handle,
        pointer,
        startPoint: gesture.startPoint,
        ratio: normalizedRatio,
      });
      setRect(next);
    };

    const onPointerUp = () => {
      gestureRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [videoMeta, ratioId, pointerToNormalized]);

  /** 选择比例预设：以当前选区为中心套用比例 */
  const applyRatioPreset = useCallback((id: CropRatioId) => {
    setRatioId(id);
    if (!videoMeta) return;
    const preset = CROP_RATIO_PRESETS.find((item) => item.id === id);
    if (!preset?.ratio) return;
    setRect((current) => snapCropRectToPixelRatio(current, preset.ratio, videoMeta.width, videoMeta.height));
  }, [videoMeta]);

  const resetCrop = useCallback(() => {
    setRatioId('free');
    setRect(createInitialRect());
  }, []);

  const fillCrop = useCallback(() => {
    setRatioId('free');
    setRect({ x: 0, y: 0, width: 1, height: 1 });
  }, []);

  const startProcessing = useCallback(async () => {
    if (!file || !videoMeta || isProcessing) return;

    const region = cropRectToPixelRegion(rect, videoMeta.width, videoMeta.height);
    if (!region) {
      setError(getErrorMessage('crop_invalid'));
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress({ stage: 'prepare', label: 'loading', percent: 1 });

    const controller = new AbortController();
    abortRef.current = controller;

    const outcome = await reencodeVideoToMp4(file, {
      quality,
      maxLongSide: null,
      trim: null,
      crop: region,
      suffix: 'cropped',
      signal: controller.signal,
      onProgress: (next) => setProgress(next),
    });

    setIsProcessing(false);
    abortRef.current = null;

    if (outcome.ok) {
      setResult(outcome);
      setProgress(null);
    } else {
      console.error('[video-crop] failed:', outcome.code, outcome.detail ?? '');
      setError(getErrorMessage(outcome.code, outcome.detail));
      setProgress(null);
    }
  }, [file, videoMeta, rect, isProcessing, quality, getErrorMessage]);

  const canProcess = Boolean(file && videoMeta && !isProcessing);
  const regionInfo = videoMeta ? describeCropRegion(rect, videoMeta.width, videoMeta.height) : null;

  return (
    <ToolLayout toolId="video-crop" content={videoCropContent}>
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
              <span className="text-3xl" aria-hidden>🎯</span>
              <span className="text-base font-semibold text-content">{t('drop_title')}</span>
              <span className="max-w-md text-sm text-content-muted">{t('drop_hint')}</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {/* 裁剪舞台：与视频显示区域重合，选区坐标在此空间内归一化 */}
              <div className="flex justify-center">
                <div ref={stageRef} className="relative select-none" style={{ touchAction: 'none' }}>
                  <video
                    src={sourceUrl}
                    controls
                    muted
                    playsInline
                    loop
                    onLoadedMetadata={(event) => {
                      const element = event.currentTarget;
                      setVideoMeta({
                        width: element.videoWidth,
                        height: element.videoHeight,
                        duration: element.duration,
                      });
                    }}
                    className="block max-h-[52vh] w-auto max-w-full rounded-lg bg-surface-raised"
                  />
                  {/* 遮罩：选区外半透明变暗，选区内完全透明 */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-lg"
                    style={{
                      clipPath: `polygon(
                        0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                        ${rect.x * 100}% ${rect.y * 100}%,
                        ${rect.x * 100}% ${(rect.y + rect.height) * 100}%,
                        ${(rect.x + rect.width) * 100}% ${(rect.y + rect.height) * 100}%,
                        ${(rect.x + rect.width) * 100}% ${rect.y * 100}%,
                        ${rect.x * 100}% ${rect.y * 100}%
                      )`,
                      backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    }}
                  />
                  {/* 选区框：可整体拖动 */}
                  <div
                    role="application"
                    aria-label={t('crop_box_label')}
                    onPointerDown={beginGesture('move')}
                    className="absolute cursor-move border-2 border-[var(--accent,#3b82f6)]"
                    style={{
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.width * 100}%`,
                      height: `${rect.height * 100}%`,
                      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.65) inset',
                    }}
                  >
                    {HANDLES.map((handle) => (
                      <button
                        key={handle.id}
                        type="button"
                        aria-label={t(`handle_${handle.id}`)}
                        disabled={isProcessing}
                        onPointerDown={beginGesture(handle.id)}
                        className={`absolute h-3.5 w-3.5 rounded-sm border border-white bg-[var(--accent,#3b82f6)] ${handle.className}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
                <span className="truncate font-medium text-content-secondary">{file.name}</span>
                <span>{formatFileSize(file.size)}</span>
                {videoMeta ? <span>{videoMeta.width}×{videoMeta.height}</span> : null}
                <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={isProcessing}>
                  {t('replace')}
                </Button>
              </div>
              <p className="text-xs text-content-muted">{t('crop_hint')}</p>
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
            <legend className="text-sm font-semibold text-content">{t('ratio_title')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {CROP_RATIO_PRESETS.map((preset) => (
                <label
                  key={preset.id}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm transition-colors ${
                    ratioId === preset.id ? 'border-border-strong bg-surface-hover font-medium text-content' : 'border-border-base text-content-secondary hover:border-border-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="video-crop-ratio"
                    className="sr-only"
                    checked={ratioId === preset.id}
                    onChange={() => applyRatioPreset(preset.id)}
                    disabled={!videoMeta || isProcessing}
                  />
                  {preset.id === 'free' ? t('ratio_free') : preset.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={fillCrop} disabled={!videoMeta || isProcessing} className="flex-1">
                {t('fill_frame')}
              </Button>
              <Button variant="secondary" size="sm" onClick={resetCrop} disabled={!videoMeta || isProcessing} className="flex-1">
                {t('reset_crop')}
              </Button>
            </div>
            {regionInfo ? (
              <p className="text-xs text-content-muted">
                {t('region_summary', {
                  x: regionInfo.pixel.x,
                  y: regionInfo.pixel.y,
                  width: regionInfo.pixel.width,
                  height: regionInfo.pixel.height,
                  ratio: regionInfo.ratioLabel,
                })}
              </p>
            ) : (
              <p className="text-xs text-content-muted">{t('region_empty')}</p>
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
                    name="video-crop-quality"
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
          ) : (
            <p className="text-sm text-content-muted">{t('output_empty')}</p>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
