'use client';

/* eslint-disable @next/next/no-img-element -- Image previews use local blob URLs. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { eraseImageObject, inspectImageFile, paintEraseStrokes } from '@/lib/utils/image-browser';
import {
  createEraseStrokeBounds,
  formatFileSize,
  getBasicImageTargetConfig,
  getDefaultEraseBrushRadius,
  getEraseBrushRadiusRange,
  getImageAcceptValue,
  getSupportedImageInputLabel,
  inferImageMimeType,
  type BasicImageTargetFormat,
  type ImageConversionError,
  type ImageEraseMethod,
  type ImageEraseStroke,
  type ImageEraseSuccess,
  type ImageInspectionSuccess,
  type ImageWatermarkRemovalProgress,
} from '@/lib/utils/image';
import { imageEraseContent } from '@/lib/tools/content/image-erase';

interface OutputState {
  result: ImageEraseSuccess;
  url: string;
}

const OUTPUT_FORMATS: BasicImageTargetFormat[] = ['png', 'jpg', 'webp'];
const ERASE_METHODS: ImageEraseMethod[] = ['migan', 'ai'];

function formatDimensions(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)} px`;
}

function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 0);
}

function getDefaultOutputFormat(file: File): BasicImageTargetFormat {
  const sourceType = inferImageMimeType(file);
  if (sourceType === 'image/jpeg') return 'jpg';
  if (sourceType === 'image/webp') return 'webp';
  return 'png';
}

export function ImageObjectEraser() {
  const tc = useTranslations('common');
  const ti = useTranslations('image_erase');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<ImageInspectionSuccess | null>(null);
  const strokesRef = useRef<ImageEraseStroke[]>([]);
  const draftRef = useRef<ImageEraseStroke | null>(null);
  const brushRadiusRef = useRef(24);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const loadRequestRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [image, setImage] = useState<ImageInspectionSuccess | null>(null);
  const [strokes, setStrokes] = useState<ImageEraseStroke[]>([]);
  const [brushRadius, setBrushRadius] = useState(24);
  const [method, setMethod] = useState<ImageEraseMethod>('migan');
  const [outputFormat, setOutputFormat] = useState<BasicImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [feather, setFeather] = useState(12);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [isOutputPreviewOpen, setIsOutputPreviewOpen] = useState(false);
  const [progress, setProgress] = useState<ImageWatermarkRemovalProgress | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);

  const accept = getImageAcceptValue();
  const inputFormatLabels = useMemo(() => getSupportedImageInputLabel().split(' / '), []);
  const target = getBasicImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const hasStrokes = strokes.length > 0;
  const canProcess = Boolean(file && image && hasStrokes && !isLoading && !isProcessing);
  const brushRange = useMemo(
    () => (image ? getEraseBrushRadiusRange(image.width, image.height) : { min: 2, max: 200 }),
    [image]
  );
  const area = useMemo(
    () => (image ? createEraseStrokeBounds(strokes, image.width, image.height) : null),
    [image, strokes]
  );

  const progressLabel = useMemo(() => {
    if (!progress) return '';

    switch (progress.stage) {
      case 'model':
        return ti('progress_model');
      case 'prepare':
        return ti('progress_prepare');
      case 'compute':
        return ti('progress_compute');
      case 'encode':
        return ti('progress_encode');
      case 'fallback':
        return ti('progress_fallback');
      default:
        return ti('processing');
    }
  }, [progress, ti]);

  const getMethodLabel = useCallback(
    (value: ImageEraseMethod) => (value === 'migan' ? ti('method_migan') : ti('method_ai')),
    [ti]
  );
  const getMethodDescription = useCallback(
    (value: ImageEraseMethod) => (
      value === 'migan' ? ti('method_migan_description') : ti('method_ai_description')
    ),
    [ti]
  );
  const getResultMethodLabel = useCallback(
    (value: ImageEraseMethod) => (
      value === 'migan' ? ti('method_value_migan') : ti('method_value_ai')
    ),
    [ti]
  );

  useEffect(() => {
    imageRef.current = image;
  }, [image]);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    brushRadiusRef.current = brushRadius;
  }, [brushRadius]);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
  }, []);

  const clearOutput = useCallback(() => {
    setIsOutputPreviewOpen(false);
    setOutput((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  /** 重画整层预览：已提交的笔画 + 正在画的那一笔。 */
  const redrawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    const currentImage = imageRef.current;
    if (!canvas || !currentImage) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    const pending = draftRef.current;
    const visible = pending ? [...strokesRef.current, pending] : strokesRef.current;
    if (visible.length === 0) return;

    // 用主题的 danger 色而不是写死的红，深浅色模式各自有合适的对比度；
    // 半透明是为了盖在照片上仍能看清底下涂到了什么。
    const danger = getComputedStyle(document.documentElement)
      .getPropertyValue('--danger-content')
      .trim() || '#991b1b';
    context.globalAlpha = 0.55;
    context.strokeStyle = danger;
    context.fillStyle = danger;
    paintEraseStrokes(context, visible);
    context.globalAlpha = 1;
  }, []);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !image) return;

    if (canvas.width !== image.width || canvas.height !== image.height) {
      canvas.width = image.width;
      canvas.height = image.height;
    }
    redrawOverlay();
  }, [image, redrawOverlay, strokes]);

  const getErrorMessage = useCallback((imageError: ImageConversionError): string => {
    switch (imageError.code) {
      case 'empty_file':
        return ti('errors.empty_file');
      case 'unsupported_input':
        return ti('errors.unsupported_input', { type: imageError.detail ?? ti('unknown_type') });
      case 'file_too_large':
        return ti('errors.file_too_large', { maxSize: imageError.maxSize ?? '' });
      case 'too_many_pixels':
        return ti('errors.too_many_pixels', { maxPixels: imageError.maxPixels ?? '' });
      case 'load_failed':
        return ti('errors.load_failed');
      case 'canvas_context':
        return ti('errors.canvas_context');
      case 'canvas_export':
        return ti('errors.canvas_export');
      case 'unsupported_output':
        return ti('errors.unsupported_output', { format: imageError.detail ?? '' });
      case 'ai_model_unavailable':
        return ti('errors.ai_model_unavailable');
      default:
        return ti('errors.general');
    }
  }, [ti]);

  const clearImage = useCallback(() => {
    loadRequestRef.current += 1;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearOutput();
    draftRef.current = null;
    setFile(null);
    setSourceUrl('');
    setImage(null);
    setStrokes([]);
    setError('');
    setIsLoading(false);
    setIsProcessing(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput, sourceUrl]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList)[0];
    if (!selected) return;

    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setIsLoading(true);
    setError('');
    clearOutput();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    draftRef.current = null;
    setFile(null);
    setSourceUrl('');
    setImage(null);
    setStrokes([]);

    const inspected = await inspectImageFile(selected);
    if (requestId !== loadRequestRef.current) return;

    setIsLoading(false);

    if (!inspected.ok) {
      setError(getErrorMessage(inspected));
      return;
    }

    setFile(selected);
    setSourceUrl(URL.createObjectURL(selected));
    setImage(inspected);
    setBrushRadius(getDefaultEraseBrushRadius(inspected.width, inspected.height));
    setOutputFormat(getDefaultOutputFormat(selected));
  }, [clearOutput, getErrorMessage, sourceUrl]);

  const getNaturalPoint = useCallback((
    event: PointerEvent | React.PointerEvent
  ): { x: number; y: number } | null => {
    // 量 <img> 而不是外层容器：容器带 1px 边框，用它换算会整体偏移一个像素。
    const element = imageElementRef.current ?? imageWrapRef.current;
    const currentImage = imageRef.current;
    if (!element || !currentImage) return null;

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * currentImage.width;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * currentImage.height;

    return {
      x: Math.min(currentImage.width, Math.max(0, x)),
      y: Math.min(currentImage.height, Math.max(0, y)),
    };
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const draft = draftRef.current;
      if (!draft) return;

      const point = getNaturalPoint(event);
      if (!point) return;

      const last = draft.points[draft.points.length - 1];
      // 丢掉几乎重合的点：一次拖动会产生几百个事件，去掉抖动能让路径更短。
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1) return;

      draft.points.push(point);
      redrawOverlay();
    }

    function handlePointerUp() {
      const draft = draftRef.current;
      draftRef.current = null;
      setIsPainting(false);
      if (!draft || draft.points.length === 0) return;

      setStrokes((current) => [...current, draft]);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [getNaturalPoint, redrawOverlay]);

  const beginStroke = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    const point = getNaturalPoint(event);
    if (!point) return;

    event.preventDefault();
    draftRef.current = { points: [point], radius: brushRadiusRef.current };
    setIsPainting(true);
    clearOutput();
    redrawOverlay();
  }, [clearOutput, getNaturalPoint, isProcessing, redrawOverlay]);

  const undoStroke = useCallback(() => {
    clearOutput();
    setStrokes((current) => current.slice(0, -1));
  }, [clearOutput]);

  const clearStrokes = useCallback(() => {
    clearOutput();
    draftRef.current = null;
    setStrokes([]);
  }, [clearOutput]);

  const generateOutput = useCallback(async () => {
    if (!file || strokes.length === 0) {
      setError(ti('errors.no_strokes'));
      return;
    }

    setIsProcessing(true);
    setProgress(null);
    setError('');
    clearOutput();

    const result = await eraseImageObject(file, {
      strokes,
      targetFormat: outputFormat,
      method,
      quality,
      feather,
      jpegBackground: '#ffffff',
      onProgress: setProgress,
    });

    setIsProcessing(false);
    setProgress(null);

    if (!result.ok) {
      setError(getErrorMessage(result));
      return;
    }

    setOutput({ result, url: URL.createObjectURL(result.blob) });
  }, [clearOutput, feather, file, getErrorMessage, method, outputFormat, quality, strokes, ti]);

  const downloadOutput = useCallback(() => {
    const current = outputRef.current;
    if (!current) return;
    downloadUrl(current.url, current.result.filename);
  }, []);

  const outputStats = useMemo(() => {
    if (!output) return null;
    return [
      { label: ti('output_size'), value: formatDimensions(output.result.width, output.result.height) },
      { label: ti('result_method'), value: getResultMethodLabel(output.result.method) },
      { label: ti('file_size'), value: formatFileSize(output.result.outputSize) },
      { label: ti('duration'), value: ti('duration_value', { value: output.result.durationMs }) },
    ];
  }, [getResultMethodLabel, output, ti]);

  return (
    <ToolLayout toolId="image-erase" content={imageEraseContent}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(320px,420px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={(
            <Button variant="secondary" onClick={clearImage} disabled={!file && !error}>
              {tc('clear')}
            </Button>
          )}
          className="h-[min(40rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-auto pr-1">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                if (event.target.files) void handleFiles(event.target.files);
              }}
            />

            {!file ? (
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
                  if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
                }}
                className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                  draggingFile
                    ? 'border-border-strong bg-surface-hover'
                    : 'border-border-input hover:border-border-strong hover:bg-surface-hover'
                }`}
              >
                <span className="text-sm font-medium text-content">{ti('drop_title')}</span>
                <span className="text-xs text-content-muted">{ti('drop_hint')}</span>
                <span className="mt-1 text-xs font-medium text-content-secondary underline">
                  {ti('drop_action')}
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm text-content-secondary">{file.name}</span>
                  <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                    {ti('replace')}
                  </Button>
                </div>
                {image && (
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded border border-border-subtle bg-surface-raised p-2">
                      <dt className="text-content-muted">{ti('source_size')}</dt>
                      <dd className="mt-0.5 font-medium text-content">
                        {formatDimensions(image.width, image.height)}
                      </dd>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface-raised p-2">
                      <dt className="text-content-muted">{ti('stroke_count')}</dt>
                      <dd className="mt-0.5 font-medium text-content">{strokes.length}</dd>
                    </div>
                  </dl>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-content-secondary">{ti('method_title')}</span>
              <div className="grid grid-cols-2 gap-2">
                {ERASE_METHODS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMethod(value);
                      clearOutput();
                    }}
                    disabled={isProcessing}
                    className={`rounded border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                      method === value
                        ? 'border-border-strong bg-surface-hover text-content'
                        : 'border-border-input text-content-secondary hover:border-border-strong hover:bg-surface-hover'
                    }`}
                  >
                    {getMethodLabel(value)}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-content-muted">
                {getMethodDescription(method)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-content-secondary">{ti('brush_size')}</span>
                <span className="text-xs text-content-muted">
                  {ti('brush_size_value', { value: brushRadius * 2 })}
                </span>
              </div>
              <input
                type="range"
                min={brushRange.min}
                max={brushRange.max}
                step={1}
                value={brushRadius}
                disabled={!image}
                onChange={(event) => setBrushRadius(Number(event.target.value))}
                className="w-full accent-action"
                aria-label={ti('brush_size')}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={undoStroke} disabled={!hasStrokes || isProcessing}>
                  {ti('undo_stroke')}
                </Button>
                <Button variant="secondary" onClick={clearStrokes} disabled={!hasStrokes || isProcessing}>
                  {ti('clear_strokes')}
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-content-muted">{ti('stroke_hint')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-content-secondary">{ti('feather')}</span>
                <span className="text-xs text-content-muted">{ti('feather_value', { value: feather })}</span>
              </div>
              <input
                type="range"
                min={0}
                max={36}
                step={1}
                value={feather}
                onChange={(event) => {
                  setFeather(Number(event.target.value));
                  clearOutput();
                }}
                className="w-full accent-action"
                aria-label={ti('feather')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-content-secondary">{ti('output_format')}</span>
              <div className="grid grid-cols-3 gap-2">
                {OUTPUT_FORMATS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setOutputFormat(value);
                      clearOutput();
                    }}
                    className={`rounded border px-3 py-2 text-xs font-medium uppercase transition-colors ${
                      outputFormat === value
                        ? 'border-border-strong bg-surface-hover text-content'
                        : 'border-border-input text-content-secondary hover:border-border-strong hover:bg-surface-hover'
                    }`}
                  >
                    {getBasicImageTargetConfig(value).label}
                  </button>
                ))}
              </div>
            </div>

            {showQuality && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-content-secondary">{ti('quality')}</span>
                  <span className="text-xs text-content-muted">
                    {ti('quality_value', { value: quality.toFixed(2) })}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={quality}
                  onChange={(event) => {
                    setQuality(Number(event.target.value));
                    clearOutput();
                  }}
                  className="w-full accent-action"
                  aria-label={ti('quality')}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-content-secondary">{ti('input_formats')}</span>
              <div className="flex flex-wrap gap-1.5">
                {inputFormatLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-border-subtle bg-surface-raised px-2 py-0.5 text-xs text-content-muted"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-content-muted">{ti('local_note')}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
            <Button variant="primary" size="md" onClick={generateOutput} disabled={!canProcess}>
              {isProcessing ? ti('processing') : ti('apply')}
            </Button>
            <Button variant="secondary" size="md" onClick={downloadOutput} disabled={!output}>
              {ti('download')}
            </Button>
          </div>
        </Panel>

        <Panel title={ti('editor_title')} className="min-h-0 xl:overflow-hidden">
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto pr-1">
            {error && (
              <p className="rounded border border-border-base bg-danger-surface px-3 py-2 text-xs text-danger-content">
                {error}
              </p>
            )}

            {isLoading && <p className="text-xs text-content-muted">{ti('loading')}</p>}

            {!image ? (
              <div className="flex flex-grow flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-input p-8 text-center">
                <p className="text-sm font-medium text-content">{ti('empty_title')}</p>
                <p className="max-w-sm text-xs text-content-muted">{ti('empty_body')}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/*
                  容器必须严丝合缝地包住 <img>：指针坐标是按容器矩形换算成原图
                  像素的（getNaturalPoint），一旦容器比图大（例如用 object-contain
                  产生了留白），涂抹位置就会整体偏移。所以这里让图片自己决定尺寸，
                  容器 w-fit 收紧，canvas 再按 inset-0 铺满同一个盒子。
                */}
                <div
                  ref={imageWrapRef}
                  onPointerDown={beginStroke}
                  className={`relative mx-auto w-fit max-w-full touch-none select-none overflow-hidden rounded border border-border-subtle bg-surface-raised ${
                    isPainting ? 'cursor-grabbing' : 'cursor-crosshair'
                  }`}
                >
                  <img
                    ref={imageElementRef}
                    src={sourceUrl}
                    alt=""
                    draggable={false}
                    className="pointer-events-none block max-h-[52svh] w-auto max-w-full"
                  />
                  <canvas
                    ref={overlayRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />
                </div>

                {area && (
                  <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div className="rounded border border-border-subtle bg-surface-raised p-2">
                      <dt className="text-content-muted">{ti('erase_area')}</dt>
                      <dd className="mt-0.5 font-medium text-content">
                        {formatDimensions(area.width, area.height)}
                      </dd>
                    </div>
                  </dl>
                )}

                {isProcessing && progress && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-content-muted">
                      <span>{progressLabel}</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-surface-hover">
                      <div
                        className="h-full rounded bg-action transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-content">{ti('preview_title')}</span>
                {output && (
                  <Button variant="secondary" onClick={() => setIsOutputPreviewOpen(true)}>
                    {ti('preview_open_output')}
                  </Button>
                )}
              </div>

              {output?.result.fallbackFrom && (
                <p className="rounded border border-border-subtle bg-surface-raised px-3 py-2 text-xs text-content-secondary">
                  {ti('fallback_notice')}
                </p>
              )}

              {output ? (
                <>
                  <img
                    src={output.url}
                    alt=""
                    className="mx-auto max-h-[40svh] w-auto max-w-full rounded border border-border-subtle"
                  />
                  {outputStats && (
                    <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      {outputStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded border border-border-subtle bg-surface-raised p-2"
                        >
                          <dt className="text-content-muted">{stat.label}</dt>
                          <dd className="mt-0.5 font-medium text-content">{stat.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </>
              ) : (
                <p className="text-xs text-content-muted">
                  {image ? ti('result_hint') : ti('output_empty')}
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {output && (
        <ImagePreviewDialog
          open={isOutputPreviewOpen}
          src={output.url}
          alt={ti('preview_title')}
          title={ti('preview_title')}
          closeLabel={ti('preview_close')}
          onClose={() => setIsOutputPreviewOpen(false)}
        />
      )}
    </ToolLayout>
  );
}
