'use client';

/* eslint-disable @next/next/no-img-element -- Image editor previews use local blob URLs. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { cropResizeImageFile, inspectImageFile } from '@/lib/utils/image-browser';
import {
  createCropRectFromPoints,
  createInitialCropRect,
  formatFileSize,
  getImageAcceptValue,
  getImageTargetConfig,
  getLinkedHeight,
  getLinkedWidth,
  getSupportedImageInputLabel,
  inferImageMimeType,
  moveCropRect,
  resizeCropRect,
  type ImageConversionError,
  type ImageCropHandle,
  type ImageCropRect,
  type ImageEditSuccess,
  type ImageInspectionSuccess,
  type ImageTargetFormat,
} from '@/lib/utils/image';

type DragMode = 'draw' | 'move' | 'resize';
type ResizeSource = 'width' | 'height';
type ImageEditorMode = 'crop' | 'resize';

interface ImageCropResizeProps {
  mode: ImageEditorMode;
}

interface DragState {
  mode: DragMode;
  handle?: ImageCropHandle;
  startPoint: { x: number; y: number };
  startCrop: ImageCropRect;
}

interface OutputState {
  result: ImageEditSuccess;
  url: string;
}

const OUTPUT_FORMATS: ImageTargetFormat[] = ['jpg', 'png', 'webp'];

const CROP_HANDLES: Array<{ handle: ImageCropHandle; className: string }> = [
  { handle: 'nw', className: '-left-2 -top-2 cursor-nwse-resize' },
  { handle: 'n', className: 'left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'ne', className: '-right-2 -top-2 cursor-nesw-resize' },
  { handle: 'e', className: '-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize' },
  { handle: 'se', className: '-bottom-2 -right-2 cursor-nwse-resize' },
  { handle: 's', className: 'left-1/2 -bottom-2 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'sw', className: '-bottom-2 -left-2 cursor-nesw-resize' },
  { handle: 'w', className: '-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize' },
];

function parseDimension(value: string): number | null {
  const dimension = Number.parseInt(value, 10);
  return Number.isFinite(dimension) && dimension > 0 ? dimension : null;
}

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

function getCropStyle(crop: ImageCropRect, image: ImageInspectionSuccess): React.CSSProperties {
  return {
    left: `${(crop.x / image.width) * 100}%`,
    top: `${(crop.y / image.height) * 100}%`,
    width: `${(crop.width / image.width) * 100}%`,
    height: `${(crop.height / image.height) * 100}%`,
  };
}

function createFullImageCropRect(image: ImageInspectionSuccess): ImageCropRect {
  return {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  };
}

export function ImageCropResize({ mode }: ImageCropResizeProps) {
  const tc = useTranslations('common');
  const ti = useTranslations(mode === 'crop' ? 'image_crop' : 'image_resize');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const cropRef = useRef<ImageCropRect | null>(null);
  const imageRef = useRef<ImageInspectionSuccess | null>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const outputWidthRef = useRef('');
  const outputHeightRef = useRef('');
  const resizeSourceRef = useRef<ResizeSource>('width');
  const resizeTouchedRef = useRef(false);
  const loadRequestRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [image, setImage] = useState<ImageInspectionSuccess | null>(null);
  const [crop, setCrop] = useState<ImageCropRect | null>(null);
  const [outputWidth, setOutputWidth] = useState('');
  const [outputHeight, setOutputHeight] = useState('');
  const [outputFormat, setOutputFormat] = useState<ImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [isOutputPreviewOpen, setIsOutputPreviewOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);
  const [activeDragMode, setActiveDragMode] = useState<DragMode | null>(null);

  const accept = getImageAcceptValue();
  const inputFormatLabels = getSupportedImageInputLabel().split(' / ');
  const target = getImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const isCropMode = mode === 'crop';
  const toolId = isCropMode ? 'image-crop' : 'image-resize';
  const editorIcon = isCropMode ? 'CUT' : 'SIZ';
  const canProcess = Boolean(file && image && crop && parseDimension(outputWidth) && parseDimension(outputHeight));

  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);

  useEffect(() => {
    imageRef.current = image;
  }, [image]);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => {
    outputWidthRef.current = outputWidth;
  }, [outputWidth]);

  useEffect(() => {
    outputHeightRef.current = outputHeight;
  }, [outputHeight]);

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

  const syncOutputSize = useCallback((nextCrop: ImageCropRect, force = false) => {
    if (isCropMode || force || !resizeTouchedRef.current) {
      setOutputWidth(String(Math.round(nextCrop.width)));
      setOutputHeight(String(Math.round(nextCrop.height)));
      return;
    }

    if (resizeSourceRef.current === 'height') {
      const height = parseDimension(outputHeightRef.current) ?? Math.round(nextCrop.height);
      setOutputWidth(String(getLinkedWidth(height, nextCrop)));
      return;
    }

    const width = parseDimension(outputWidthRef.current) ?? Math.round(nextCrop.width);
    setOutputHeight(String(getLinkedHeight(width, nextCrop)));
  }, [isCropMode]);

  const updateCrop = useCallback((nextCrop: ImageCropRect) => {
    setCrop(nextCrop);
    syncOutputSize(nextCrop);
    clearOutput();
  }, [clearOutput, syncOutputSize]);

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
    setCrop(null);
    setOutputWidth('');
    setOutputHeight('');
    setError('');
    setIsLoading(false);
    resizeTouchedRef.current = false;
    resizeSourceRef.current = 'width';
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
    setFile(null);
    setSourceUrl('');
    setImage(null);
    setCrop(null);
    resizeTouchedRef.current = false;
    resizeSourceRef.current = 'width';

    const inspected = await inspectImageFile(selected);
    if (requestId !== loadRequestRef.current) return;

    setIsLoading(false);

    if (!inspected.ok) {
      setError(getErrorMessage(inspected));
      return;
    }

    const nextCrop = isCropMode
      ? createInitialCropRect(inspected.width, inspected.height)
      : createFullImageCropRect(inspected);
    const url = URL.createObjectURL(selected);
    setFile(selected);
    setSourceUrl(url);
    setImage(inspected);
    setCrop(nextCrop);
    cropRef.current = nextCrop;
    syncOutputSize(nextCrop, true);
    setOutputFormat(getDefaultOutputFormat(selected));
  }, [clearOutput, getErrorMessage, isCropMode, sourceUrl, syncOutputSize]);

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
      let nextCrop = dragState.startCrop;

      if (dragState.mode === 'draw') {
        nextCrop = createCropRectFromPoints(
          dragState.startPoint,
          point,
          currentImage.width,
          currentImage.height
        );
      } else if (dragState.mode === 'move') {
        nextCrop = moveCropRect(
          dragState.startCrop,
          deltaX,
          deltaY,
          currentImage.width,
          currentImage.height
        );
      } else if (dragState.handle) {
        nextCrop = resizeCropRect(
          dragState.startCrop,
          dragState.handle,
          deltaX,
          deltaY,
          currentImage.width,
          currentImage.height
        );
      }

      updateCrop(nextCrop);
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
  }, [getNaturalPoint, updateCrop]);

  const beginDraw = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const point = getNaturalPoint(event);
    const currentImage = imageRef.current;
    if (!point || !currentImage) return;

    const startCrop = createCropRectFromPoints(point, point, currentImage.width, currentImage.height);
    dragStateRef.current = {
      mode: 'draw',
      startPoint: point,
      startCrop,
    };
    setActiveDragMode('draw');
    updateCrop(startCrop);
  }, [getNaturalPoint, updateCrop]);

  const beginMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const point = getNaturalPoint(event);
    const currentCrop = cropRef.current;
    if (!point || !currentCrop) return;

    dragStateRef.current = {
      mode: 'move',
      startPoint: point,
      startCrop: currentCrop,
    };
    setActiveDragMode('move');
  }, [getNaturalPoint]);

  const beginResize = useCallback((handle: ImageCropHandle, event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const point = getNaturalPoint(event);
    const currentCrop = cropRef.current;
    if (!point || !currentCrop) return;

    dragStateRef.current = {
      mode: 'resize',
      handle,
      startPoint: point,
      startCrop: currentCrop,
    };
    setActiveDragMode('resize');
  }, [getNaturalPoint]);

  const handleWidthChange = useCallback((value: string) => {
    resizeTouchedRef.current = true;
    resizeSourceRef.current = 'width';
    setOutputWidth(value);
    const width = parseDimension(value);
    const currentCrop = cropRef.current;
    if (width && currentCrop) setOutputHeight(String(getLinkedHeight(width, currentCrop)));
    clearOutput();
  }, [clearOutput]);

  const handleHeightChange = useCallback((value: string) => {
    resizeTouchedRef.current = true;
    resizeSourceRef.current = 'height';
    setOutputHeight(value);
    const height = parseDimension(value);
    const currentCrop = cropRef.current;
    if (height && currentCrop) setOutputWidth(String(getLinkedWidth(height, currentCrop)));
    clearOutput();
  }, [clearOutput]);

  const resetCrop = useCallback(() => {
    if (!image) return;
    const nextCrop = createInitialCropRect(image.width, image.height);
    resizeTouchedRef.current = false;
    resizeSourceRef.current = 'width';
    setCrop(nextCrop);
    syncOutputSize(nextCrop, true);
    clearOutput();
  }, [clearOutput, image, syncOutputSize]);

  const resetResize = useCallback(() => {
    if (!image) return;
    const nextCrop = createFullImageCropRect(image);
    resizeTouchedRef.current = false;
    resizeSourceRef.current = 'width';
    setCrop(nextCrop);
    syncOutputSize(nextCrop, true);
    clearOutput();
  }, [clearOutput, image, syncOutputSize]);

  const generateOutput = useCallback(async () => {
    if (!file || !crop) return;
    const width = parseDimension(outputWidth);
    const height = parseDimension(outputHeight);

    if (!width || !height) {
      setError(ti('errors.invalid_dimensions'));
      return;
    }

    setIsProcessing(true);
    setError('');
    clearOutput();

    const result = await cropResizeImageFile(file, {
      crop,
      outputWidth: width,
      outputHeight: height,
      targetFormat: outputFormat,
      quality,
      jpegBackground: '#ffffff',
    });

    setIsProcessing(false);

    if (!result.ok) {
      setError(getErrorMessage(result));
      return;
    }

    setOutput({
      result,
      url: URL.createObjectURL(result.blob),
    });
  }, [clearOutput, crop, file, getErrorMessage, outputFormat, outputHeight, outputWidth, quality, ti]);

  const outputStats = useMemo(() => {
    if (!output) return null;
    return [
      { label: ti('output_size'), value: formatDimensions(output.result.width, output.result.height) },
      { label: ti('file_size'), value: formatFileSize(output.result.outputSize) },
      { label: ti('duration'), value: ti('duration_value', { value: output.result.durationMs }) },
    ];
  }, [output, ti]);

  return (
    <ToolLayout toolId={toolId}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(320px,400px)_1fr] xl:overflow-hidden">
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
              className={`group flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors ${
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

            {image && crop && (
              <>
                {isCropMode && (
                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-content">{ti('crop_title')}</h2>
                    <Button variant="secondary" onClick={resetCrop}>{ti('reset_crop')}</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('crop_x')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(crop.x)}</span>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('crop_y')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(crop.y)}</span>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('crop_width')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(crop.width)}</span>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface p-2">
                      <span className="block text-xs text-content-faint">{ti('crop_height')}</span>
                      <span className="font-mono text-content-secondary">{Math.round(crop.height)}</span>
                    </div>
                  </div>
                </div>
                )}

                {!isCropMode && (
                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-content">{ti('resize_title')}</h2>
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-border-subtle bg-surface px-2 py-1 text-xs text-content-muted">
                        {ti('keep_ratio')}
                      </span>
                      <Button variant="secondary" onClick={resetResize}>{ti('reset_size')}</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-content-faint">{ti('output_width')}</span>
                      <input
                        type="number"
                        min={1}
                        value={outputWidth}
                        onChange={(event) => handleWidthChange(event.target.value)}
                        className="w-full rounded border border-border-input bg-surface px-3 py-2 font-mono text-sm text-content outline-none transition-colors focus:border-border-strong"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-content-faint">{ti('output_height')}</span>
                      <input
                        type="number"
                        min={1}
                        value={outputHeight}
                        onChange={(event) => handleHeightChange(event.target.value)}
                        className="w-full rounded border border-border-input bg-surface px-3 py-2 font-mono text-sm text-content outline-none transition-colors focus:border-border-strong"
                      />
                    </label>
                  </div>
                </div>
                )}

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

                {image && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="border-t border-border-subtle pt-3">
                      <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                      <span className="font-mono font-semibold text-content-secondary">
                        {formatDimensions(image.width, image.height)}
                      </span>
                    </div>
                    <div className="border-t border-border-subtle pt-3">
                      <span className="block text-xs text-content-faint">{isCropMode ? ti('crop_size') : ti('output_size')}</span>
                      <span className="font-mono font-semibold text-content-secondary">
                        {isCropMode
                          ? formatDimensions(crop.width, crop.height)
                          : formatDimensions(parseDimension(outputWidth) ?? crop.width, parseDimension(outputHeight) ?? crop.height)}
                      </span>
                    </div>
                  </div>
                )}

                <Button onClick={generateOutput} disabled={!canProcess || isProcessing || isLoading} className="w-full justify-center">
                  {isProcessing ? ti('processing') : ti('apply')}
                </Button>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-danger-surface bg-danger-surface px-3 py-2 text-sm text-danger-content">
                {error}
              </div>
            )}
          </div>
        </Panel>

        <Panel title={ti('editor_title')} className="min-h-[38rem] overflow-hidden xl:min-h-0">
          <div className="grid min-h-0 flex-grow grid-cols-1 gap-4 overflow-y-auto xl:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] xl:overflow-hidden">
            <div className="flex min-h-0 flex-col gap-3">
              <div className="flex min-h-[20rem] flex-grow items-center justify-center overflow-auto rounded-lg border border-border-input bg-surface-raised p-3 xl:min-h-0">
                {image && sourceUrl && crop ? (
                  <div
                    ref={imageWrapRef}
                    className={`relative inline-block max-h-full max-w-full touch-none select-none ${
                      isCropMode && activeDragMode === 'draw' ? 'cursor-crosshair' : ''
                    }`}
                    onPointerDown={isCropMode ? beginDraw : undefined}
                  >
                    <img
                      src={sourceUrl}
                      alt={file?.name ?? ti('source_image')}
                      className="block max-h-[64svh] max-w-full select-none object-contain"
                      draggable={false}
                    />
                    {isCropMode && (
                      <div
                        className="absolute border-2 border-action bg-background/10 shadow-lg"
                        style={getCropStyle(crop, image)}
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
                        {CROP_HANDLES.map(({ handle, className }) => (
                          <button
                            key={handle}
                            type="button"
                            aria-label={`${ti('resize_handle')} ${handle}`}
                            onPointerDown={(event) => beginResize(handle, event)}
                            className={`absolute h-4 w-4 rounded-full border border-border-strong bg-surface-raised shadow ${className}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                      IMG
                    </span>
                    <div>
                      <h2 className="font-semibold text-content">{isLoading ? ti('processing') : ti('empty_title')}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-content-muted">{ti('empty_body')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="flex min-h-0 flex-col gap-3 xl:overflow-y-auto xl:pr-1">
              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-content">{ti('output_title')}</h2>
                  <Button
                    variant="secondary"
                    onClick={() => output && downloadUrl(output.url, output.result.filename)}
                    disabled={!output}
                  >
                    {ti('download')}
                  </Button>
                </div>

                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-border-subtle bg-surface">
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
                    <p className="px-4 text-center text-sm text-content-faint">{ti('output_empty')}</p>
                  )}
                </div>
              </div>

              {outputStats && (
                <div className="grid grid-cols-1 gap-2">
                  {outputStats.map((item) => (
                    <div key={item.label} className="rounded border border-border-subtle bg-surface-raised p-3">
                      <span className="block text-xs text-content-faint">{item.label}</span>
                      <span className="font-mono text-sm font-semibold text-content-secondary">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </Panel>
      </div>
      <ImagePreviewDialog
        open={Boolean(isOutputPreviewOpen && output)}
        src={output?.url}
        alt={output?.result.filename ?? ti('output_title')}
        title={ti('preview_title')}
        closeLabel={ti('preview_close')}
        onClose={() => setIsOutputPreviewOpen(false)}
      />
    </ToolLayout>
  );
}
