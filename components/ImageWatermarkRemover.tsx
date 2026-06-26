'use client';

/* eslint-disable @next/next/no-img-element -- Image previews use local blob URLs. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { inspectImageFile, removeImageWatermark } from '@/lib/utils/image-browser';
import {
  createCropRectFromPoints,
  createInitialWatermarkRect,
  formatFileSize,
  getImageAcceptValue,
  getImageTargetConfig,
  getSupportedImageInputLabel,
  inferImageMimeType,
  moveCropRect,
  resizeCropRect,
  type ImageConversionError,
  type ImageCropHandle,
  type ImageCropRect,
  type ImageInspectionSuccess,
  type ImageTargetFormat,
  type ImageWatermarkRemovalMethod,
  type ImageWatermarkRemovalProgress,
  type ImageWatermarkRemovalSuccess,
} from '@/lib/utils/image';

type DragMode = 'draw' | 'move' | 'resize';

interface DragState {
  mode: DragMode;
  handle?: ImageCropHandle;
  startPoint: { x: number; y: number };
  startSelection: ImageCropRect;
}

interface OutputState {
  result: ImageWatermarkRemovalSuccess;
  url: string;
}

const OUTPUT_FORMATS: ImageTargetFormat[] = ['jpg', 'png', 'webp'];
const REMOVAL_METHODS: ImageWatermarkRemovalMethod[] = ['migan', 'ai', 'local'];

const SELECTION_HANDLES: Array<{ handle: ImageCropHandle; className: string }> = [
  { handle: 'nw', className: '-left-2 -top-2 cursor-nwse-resize' },
  { handle: 'n', className: 'left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'ne', className: '-right-2 -top-2 cursor-nesw-resize' },
  { handle: 'e', className: '-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize' },
  { handle: 'se', className: '-bottom-2 -right-2 cursor-nwse-resize' },
  { handle: 's', className: 'left-1/2 -bottom-2 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'sw', className: '-bottom-2 -left-2 cursor-nesw-resize' },
  { handle: 'w', className: '-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize' },
];

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

function getDefaultOutputFormat(file: File): ImageTargetFormat {
  const sourceType = inferImageMimeType(file);
  if (sourceType === 'image/jpeg') return 'jpg';
  if (sourceType === 'image/webp') return 'webp';
  return 'png';
}

function getSelectionStyle(selection: ImageCropRect, image: ImageInspectionSuccess): React.CSSProperties {
  return {
    left: `${(selection.x / image.width) * 100}%`,
    top: `${(selection.y / image.height) * 100}%`,
    width: `${(selection.width / image.width) * 100}%`,
    height: `${(selection.height / image.height) * 100}%`,
  };
}

export function ImageWatermarkRemover() {
  const tc = useTranslations('common');
  const ti = useTranslations('image_remove_watermark');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const selectionRef = useRef<ImageCropRect | null>(null);
  const imageRef = useRef<ImageInspectionSuccess | null>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const loadRequestRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [image, setImage] = useState<ImageInspectionSuccess | null>(null);
  const [selection, setSelection] = useState<ImageCropRect | null>(null);
  const [method, setMethod] = useState<ImageWatermarkRemovalMethod>('migan');
  const [outputFormat, setOutputFormat] = useState<ImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [feather, setFeather] = useState(12);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [isOutputPreviewOpen, setIsOutputPreviewOpen] = useState(false);
  const [progress, setProgress] = useState<ImageWatermarkRemovalProgress | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);
  const [activeDragMode, setActiveDragMode] = useState<DragMode | null>(null);

  const accept = getImageAcceptValue();
  const inputFormatLabels = useMemo(() => getSupportedImageInputLabel().split(' / '), []);
  const target = getImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const canProcess = Boolean(file && image && selection && !isLoading && !isProcessing);
  const canDownload = Boolean(output?.url);
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

  const getMethodLabel = useCallback((nextMethod: ImageWatermarkRemovalMethod): string => {
    switch (nextMethod) {
      case 'migan':
        return ti('method_migan');
      case 'ai':
        return ti('method_ai');
      default:
        return ti('method_local');
    }
  }, [ti]);

  const getMethodDescription = useCallback((nextMethod: ImageWatermarkRemovalMethod): string => {
    switch (nextMethod) {
      case 'migan':
        return ti('method_migan_description');
      case 'ai':
        return ti('method_ai_description');
      default:
        return ti('method_local_description');
    }
  }, [ti]);

  const getResultMethodLabel = useCallback((nextMethod: ImageWatermarkRemovalMethod): string => {
    switch (nextMethod) {
      case 'migan':
        return ti('method_value_migan');
      case 'ai':
        return ti('method_value_ai');
      default:
        return ti('method_value_local');
    }
  }, [ti]);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    imageRef.current = image;
  }, [image]);

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
      default:
        return ti('errors.general');
    }
  }, [ti]);

  const clearImage = useCallback(() => {
    loadRequestRef.current += 1;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearOutput();
    setFile(null);
    setSourceUrl('');
    setImage(null);
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

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList)[0];
    if (!selected) return;

    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setIsLoading(true);
    setError('');
    clearOutput();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setFile(null);
    setSourceUrl('');
    setImage(null);
    setSelection(null);

    const inspected = await inspectImageFile(selected);
    if (requestId !== loadRequestRef.current) return;

    setIsLoading(false);

    if (!inspected.ok) {
      setError(getErrorMessage(inspected));
      return;
    }

    const nextSelection = createInitialWatermarkRect(inspected.width, inspected.height);
    const url = URL.createObjectURL(selected);
    setFile(selected);
    setSourceUrl(url);
    setImage(inspected);
    setSelection(nextSelection);
    selectionRef.current = nextSelection;
    setOutputFormat(getDefaultOutputFormat(selected));
  }, [clearOutput, getErrorMessage, sourceUrl]);

  const getNaturalPoint = useCallback((event: PointerEvent | React.PointerEvent): { x: number; y: number } | null => {
    const element = imageWrapRef.current;
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
      const dragState = dragStateRef.current;
      const currentImage = imageRef.current;
      if (!dragState || !currentImage) return;

      const point = getNaturalPoint(event);
      if (!point) return;

      const deltaX = point.x - dragState.startPoint.x;
      const deltaY = point.y - dragState.startPoint.y;
      let nextSelection = dragState.startSelection;

      if (dragState.mode === 'draw') {
        nextSelection = createCropRectFromPoints(
          dragState.startPoint,
          point,
          currentImage.width,
          currentImage.height
        );
      } else if (dragState.mode === 'move') {
        nextSelection = moveCropRect(
          dragState.startSelection,
          deltaX,
          deltaY,
          currentImage.width,
          currentImage.height
        );
      } else if (dragState.handle) {
        nextSelection = resizeCropRect(
          dragState.startSelection,
          dragState.handle,
          deltaX,
          deltaY,
          currentImage.width,
          currentImage.height
        );
      }

      updateSelection(nextSelection);
    }

    function handlePointerUp() {
      dragStateRef.current = null;
      setActiveDragMode(null);
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
    const currentImage = imageRef.current;
    if (!point || !currentImage) return;

    const startSelection = createCropRectFromPoints(point, point, currentImage.width, currentImage.height);
    dragStateRef.current = {
      mode: 'draw',
      startPoint: point,
      startSelection,
    };
    setActiveDragMode('draw');
    updateSelection(startSelection);
  }, [getNaturalPoint, updateSelection]);

  const beginMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const point = getNaturalPoint(event);
    const currentSelection = selectionRef.current;
    if (!point || !currentSelection) return;

    dragStateRef.current = {
      mode: 'move',
      startPoint: point,
      startSelection: currentSelection,
    };
    setActiveDragMode('move');
  }, [getNaturalPoint]);

  const beginResize = useCallback((handle: ImageCropHandle, event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const point = getNaturalPoint(event);
    const currentSelection = selectionRef.current;
    if (!point || !currentSelection) return;

    dragStateRef.current = {
      mode: 'resize',
      handle,
      startPoint: point,
      startSelection: currentSelection,
    };
    setActiveDragMode('resize');
  }, [getNaturalPoint]);

  const resetSelection = useCallback(() => {
    if (!image) return;
    updateSelection(createInitialWatermarkRect(image.width, image.height));
  }, [image, updateSelection]);

  const generateOutput = useCallback(async () => {
    if (!file || !selection) return;

    setIsProcessing(true);
    setProgress(null);
    setError('');
    clearOutput();

    const result = await removeImageWatermark(file, {
      selection,
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

    setOutput({
      result,
      url: URL.createObjectURL(result.blob),
    });
  }, [clearOutput, feather, file, getErrorMessage, method, outputFormat, quality, selection]);

  const downloadOutput = useCallback(() => {
    const current = outputRef.current;
    if (!current) return;
    downloadUrl(current.url, current.result.filename);
  }, []);

  const outputStats = useMemo(() => {
    if (!output) return null;
    return [
      { label: ti('output_size'), value: formatDimensions(output.result.width, output.result.height) },
      {
        label: ti('result_method'),
        value: getResultMethodLabel(output.result.method),
      },
      { label: ti('file_size'), value: formatFileSize(output.result.outputSize) },
      { label: ti('duration'), value: ti('duration_value', { value: output.result.durationMs }) },
    ];
  }, [getResultMethodLabel, output, ti]);

  return (
    <ToolLayout toolId="image-remove-watermark">
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(320px,420px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearImage} disabled={!file && !error}>{tc('clear')}</Button>}
          className="h-[min(40rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-contain pr-1">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                if (event.target.files) handleFiles(event.target.files);
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDraggingFile(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDraggingFile(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDraggingFile(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDraggingFile(false);
                handleFiles(event.dataTransfer.files);
              }}
              aria-label={ti('drop_action')}
              className={`group flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors ${
                draggingFile
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="flex flex-col gap-1">
                <span className="text-base font-semibold text-content">{file ? ti('replace') : ti('drop_title')}</span>
                <span className="max-w-72 text-xs leading-relaxed text-content-muted">
                  {ti('drop_hint', { formats: getSupportedImageInputLabel() })}
                </span>
              </span>
            </button>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {ti('input_formats')}
              </span>
              <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {inputFormatLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-muted"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <p className="rounded-lg border border-border-subtle bg-surface-raised p-3 text-xs leading-relaxed text-content-muted">
              {ti('local_note')}
            </p>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {ti('method_title')}
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {REMOVAL_METHODS.map((nextMethod) => {
                  const active = method === nextMethod;
                  return (
                    <button
                      key={nextMethod}
                      type="button"
                      onClick={() => {
                        setMethod(nextMethod);
                        clearOutput();
                      }}
                      className={`rounded border px-2 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-border-strong bg-action text-background'
                          : 'border-border-subtle bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary'
                      }`}
                    >
                      {getMethodLabel(nextMethod)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-content-muted">
                {getMethodDescription(method)}
              </p>
            </div>

            {image && selection && (
              <>
                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-content">{ti('selection_title')}</h2>
                    <Button variant="secondary" onClick={resetSelection}>{ti('reset_selection')}</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('selection_x')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(selection.x)}</span>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('selection_y')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(selection.y)}</span>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('selection_width')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(selection.width)}</span>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('selection_height')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(selection.height)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                      <span>{ti('feather')}</span>
                      <span className="font-mono">{ti('feather_value', { value: feather })}</span>
                    </span>
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
                    />
                  </label>
                </div>

                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                    {ti('output_format')}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {OUTPUT_FORMATS.map((format) => {
                      const config = getImageTargetConfig(format);
                      const active = outputFormat === format;
                      return (
                        <button
                          key={format}
                          type="button"
                          onClick={() => {
                            setOutputFormat(format);
                            clearOutput();
                          }}
                          className={`rounded border px-2 py-2 font-mono text-sm font-semibold transition-colors ${
                            active
                              ? 'border-border-strong bg-action text-background'
                              : 'border-border-subtle bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary'
                          }`}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>

                  {showQuality && (
                    <label className="mt-4 block">
                      <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                        <span>{ti('quality')}</span>
                        <span className="font-mono">{ti('quality_value', { value: Math.round(quality * 100) })}</span>
                      </span>
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
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="border-t border-border-subtle pt-3">
                    <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                    <span className="font-mono font-semibold text-content-secondary">
                      {formatDimensions(image.width, image.height)}
                    </span>
                  </div>
                  <div className="border-t border-border-subtle pt-3">
                    <span className="block text-xs text-content-faint">{ti('selection_size')}</span>
                    <span className="font-mono font-semibold text-content-secondary">
                      {formatDimensions(selection.width, selection.height)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button onClick={generateOutput} disabled={!canProcess} className="justify-center">
                    {isProcessing ? ti('processing') : ti('apply')}
                  </Button>
                  <Button variant="secondary" onClick={downloadOutput} disabled={!canDownload} className="justify-center">
                    {ti('download')}
                  </Button>
                </div>

                {isProcessing && progress && (
                  <div className="rounded-lg border border-border-subtle bg-surface-raised p-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-content-muted">
                      <span>{progressLabel}</span>
                      <span className="font-mono">{progress.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface">
                      <span
                        className="block h-full rounded-full bg-action transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="rounded-lg border border-danger-surface bg-danger-surface px-3 py-2 text-sm text-danger-content">
                {error}
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title={ti('editor_title')}
          actions={<Button variant="primary" onClick={downloadOutput} disabled={!canDownload}>{ti('download')}</Button>}
          className="min-h-[38rem] overflow-hidden xl:min-h-0"
        >
          <div className="grid min-h-0 flex-grow grid-cols-1 gap-4 overflow-y-auto xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:overflow-hidden">
            <div className="flex min-h-[20rem] items-center justify-center overflow-auto rounded-lg border border-border-input bg-surface-raised p-3 xl:min-h-0">
              {image && sourceUrl && selection ? (
                <div
                  ref={imageWrapRef}
                  className={`relative inline-block max-h-full max-w-full touch-none select-none ${
                    activeDragMode === 'draw' ? 'cursor-crosshair' : ''
                  }`}
                  onPointerDown={beginDraw}
                >
                  <img
                    src={sourceUrl}
                    alt={file?.name ?? ti('source_image')}
                    className="block max-h-[64svh] max-w-full select-none object-contain"
                    draggable={false}
                  />
                  <div
                    className="absolute border-2 border-action bg-background/10 shadow-lg"
                    style={getSelectionStyle(selection, image)}
                    onPointerDown={beginMove}
                  >
                    <div className="pointer-events-none absolute inset-1 grid grid-cols-3 grid-rows-3">
                      <span className="border-r border-b border-border-subtle" />
                      <span className="border-r border-b border-border-subtle" />
                      <span className="border-b border-border-subtle" />
                      <span className="border-r border-b border-border-subtle" />
                      <span className="border-r border-b border-border-subtle" />
                      <span className="border-b border-border-subtle" />
                      <span className="border-r border-border-subtle" />
                      <span className="border-r border-border-subtle" />
                      <span />
                    </div>
                    {SELECTION_HANDLES.map(({ handle, className }) => (
                      <button
                        key={handle}
                        type="button"
                        title={`${ti('resize_handle')} ${handle}`}
                        aria-label={`${ti('resize_handle')} ${handle}`}
                        onPointerDown={(event) => beginResize(handle, event)}
                        className={`absolute h-4 w-4 rounded-full border border-border-strong bg-surface-raised shadow ${className}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                    WM-
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-content">{ti('empty_title')}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-content-muted">
                      {isLoading ? ti('loading') : ti('empty_body')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col gap-3">
              <div className="flex min-h-64 flex-grow items-center justify-center overflow-hidden rounded-lg border border-border-input bg-surface-raised p-3">
                {output ? (
                  <button
                    type="button"
                    aria-label={ti('preview_open_output')}
                    onClick={() => setIsOutputPreviewOpen(true)}
                    className="flex h-full w-full cursor-zoom-in items-center justify-center transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                  >
                    <img
                      src={output.url}
                      alt={output.result.filename}
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                ) : (
                  <span className="rounded border border-border-subtle bg-surface px-3 py-2 text-sm text-content-muted">
                    {ti('output_empty')}
                  </span>
                )}
              </div>

              {outputStats ? (
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 xl:grid-cols-1">
                  {outputStats.map((stat) => (
                    <div key={stat.label} className="rounded border border-border-subtle bg-surface p-3">
                      <span className="block text-xs text-content-faint">{stat.label}</span>
                      <span className="mt-1 block font-mono font-semibold text-content-secondary">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded border border-border-subtle bg-surface p-3 text-sm text-content-muted">
                  {ti('result_hint')}
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>
      <ImagePreviewDialog
        open={Boolean(isOutputPreviewOpen && output)}
        src={output?.url}
        alt={output?.result.filename ?? ti('output_empty')}
        title={ti('preview_title')}
        closeLabel={ti('preview_close')}
        onClose={() => setIsOutputPreviewOpen(false)}
      />
    </ToolLayout>
  );
}
