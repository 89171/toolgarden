'use client';

/* eslint-disable @next/next/no-img-element -- Icon previews use generated local data URLs. */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  createIconPackage,
  createIconPngFilename,
  getIconAcceptValue,
  getIconOutputConfig,
  iconOutputConfigs,
  loadIconImageFile,
  releaseLoadedIconImage,
  renderIconToCanvas,
  type IconOutputFormat,
  type IconPackageSuccess,
  type IconRenderTransform,
  type LoadedIconImage,
} from '@/lib/utils/image-icon';
import { formatFileSize, getSupportedImageInputLabel, type ImageConversionError } from '@/lib/utils/image';
import type { ImageBackgroundRemovalProgress } from '@/lib/utils/image';

const FORMAT_OPTIONS: IconOutputFormat[] = ['ico', 'icns', 'png-zip'];
const DEFAULT_TRANSFORM: IconRenderTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  radius: 0,
};

type DragMode = 'move' | 'scale';

interface DragState {
  mode: DragMode;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startOffsetX: number;
  startOffsetY: number;
  startScale: number;
  startDistance: number;
}

type IconOutputState = IconPackageSuccess & {
  url: string;
  zipUrl?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

function getCanvasPoint(canvas: HTMLCanvasElement, event: React.PointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function getDistanceFromCenter(point: { x: number; y: number; width: number; height: number }) {
  const centerX = point.width / 2;
  const centerY = point.height / 2;
  return Math.hypot(point.x - centerX, point.y - centerY);
}

export function ImageIconConverter() {
  const ti = useTranslations('image_icon_converter');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<LoadedIconImage | null>(null);
  const outputUrlRef = useRef<string | null>(null);
  const outputZipUrlRef = useRef<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [source, setSource] = useState<LoadedIconImage | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<IconOutputFormat>('ico');
  const [transform, setTransform] = useState<IconRenderTransform>(DEFAULT_TRANSFORM);
  const [output, setOutput] = useState<IconOutputState | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [error, setError] = useState('');
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [backgroundProgress, setBackgroundProgress] = useState<ImageBackgroundRemovalProgress | null>(null);
  const [backgroundApplied, setBackgroundApplied] = useState(false);

  const accept = getIconAcceptValue();
  const sourceFormats = getSupportedImageInputLabel();
  const activeFormatConfig = getIconOutputConfig(outputFormat);
  const checkerStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-raised)',
    backgroundImage:
      'linear-gradient(45deg, var(--border-subtle) 25%, transparent 25%), linear-gradient(-45deg, var(--border-subtle) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--border-subtle) 75%), linear-gradient(-45deg, transparent 75%, var(--border-subtle) 75%)',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
    backgroundSize: '16px 16px',
  };

  const clearOutput = useCallback(() => {
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
    if (outputZipUrlRef.current) {
      URL.revokeObjectURL(outputZipUrlRef.current);
      outputZipUrlRef.current = null;
    }
    setOutput((current) => (current ? null : current));
  }, []);

  const replaceSource = useCallback((image: LoadedIconImage) => {
    releaseLoadedIconImage(sourceRef.current);
    sourceRef.current = image;
    setSource(image);
  }, []);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => () => {
    releaseLoadedIconImage(sourceRef.current);
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    if (outputZipUrlRef.current) URL.revokeObjectURL(outputZipUrlRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) {
      setPreviewDataUrl('');
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const rendered = renderIconToCanvas(canvas, source, transform, 512);
      setPreviewDataUrl(rendered ? canvas.toDataURL('image/png') : '');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [source, transform]);

  const getErrorMessage = useCallback((conversionError: ImageConversionError): string => {
    switch (conversionError.code) {
      case 'empty_file':
        return ti('errors.empty_file');
      case 'unsupported_input':
        return ti('errors.unsupported_input', { type: conversionError.detail ?? ti('unknown_type') });
      case 'file_too_large':
        return ti('errors.file_too_large', { maxSize: conversionError.maxSize ?? '' });
      case 'too_many_pixels':
        return ti('errors.too_many_pixels', { maxPixels: conversionError.maxPixels ?? '' });
      case 'load_failed':
        return ti('errors.load_failed');
      case 'canvas_context':
        return ti('errors.canvas_context');
      case 'canvas_export':
        return ti('errors.canvas_export');
      case 'unsupported_output':
        return ti('errors.unsupported_output', { format: conversionError.detail ?? activeFormatConfig.label });
      default:
        return ti('errors.general');
    }
  }, [activeFormatConfig.label, ti]);

  const updateTransform = useCallback((updater: (current: IconRenderTransform) => IconRenderTransform) => {
    clearOutput();
    setTransform((current) => updater(current));
  }, [clearOutput]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const [file] = Array.from(fileList);
    if (!file) return;

    setIsLoadingSource(true);
    setError('');
    setBackgroundProgress(null);
    clearOutput();

    const result = await loadIconImageFile(file);

    if (result.ok) {
      replaceSource(result.image);
      setOriginalFile(file);
      setActiveFile(file);
      setTransform(DEFAULT_TRANSFORM);
      setBackgroundApplied(false);
    } else {
      setError(getErrorMessage(result));
    }

    setIsLoadingSource(false);
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput, getErrorMessage, replaceSource]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void handleFiles(event.target.files);
  }, [handleFiles]);

  const handleUploadDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingUpload(false);
    if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
  }, [handleFiles]);

  const handleRemoveBackground = useCallback(async () => {
    if (!activeFile || !source) return;

    setIsRemovingBackground(true);
    setBackgroundProgress(null);
    setError('');
    clearOutput();

    try {
      const { removeImageBackground } = await import('@/lib/utils/image-browser');
      const result = await removeImageBackground(activeFile, {
        model: 'medium',
        onProgress: (progress) => setBackgroundProgress(progress),
      });

      if (!result.ok) {
        setError(getErrorMessage(result));
        return;
      }

      const nextFilename = createIconPngFilename(originalFile?.name ?? activeFile.name);
      const transparentFile = new File([result.blob], nextFilename, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      const loaded = await loadIconImageFile(transparentFile);

      if (loaded.ok) {
        replaceSource(loaded.image);
        setActiveFile(transparentFile);
        setBackgroundApplied(true);
      } else {
        setError(getErrorMessage(loaded));
      }
    } catch {
      setError(ti('errors.background_remove_failed'));
    } finally {
      setIsRemovingBackground(false);
      setBackgroundProgress(null);
    }
  }, [activeFile, clearOutput, getErrorMessage, originalFile?.name, replaceSource, source, ti]);

  const handleRestoreSource = useCallback(async () => {
    if (!originalFile) return;
    await handleFiles([originalFile]);
  }, [handleFiles, originalFile]);

  const handleGenerate = useCallback(async () => {
    if (!source) return;

    setIsGenerating(true);
    setError('');
    clearOutput();

    const result = await createIconPackage(source, outputFormat, transform);

    if (result.ok) {
      const url = URL.createObjectURL(result.blob);
      const zipUrl = result.zipBlob ? URL.createObjectURL(result.zipBlob) : undefined;
      outputUrlRef.current = url;
      outputZipUrlRef.current = zipUrl ?? null;
      setOutput({ ...result, url, zipUrl });
    } else {
      setError(getErrorMessage(result));
    }

    setIsGenerating(false);
  }, [clearOutput, getErrorMessage, outputFormat, source, transform]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    downloadUrl(output.url, output.filename);
  }, [output]);

  const handleDownloadZip = useCallback(() => {
    if (!output?.zipUrl || !output.zipFilename) return;
    downloadUrl(output.zipUrl, output.zipFilename);
  }, [output]);

  const handleCanvasPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!source) return;

    const point = getCanvasPoint(event.currentTarget, event);
    const isScaleHandle = point.x > point.width - 64 && point.y > point.height - 64;
    const mode: DragMode = isScaleHandle ? 'scale' : 'move';

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: transform.offsetX,
      startOffsetY: transform.offsetY,
      startScale: transform.scale,
      startDistance: Math.max(24, getDistanceFromCenter(point)),
    };
  }, [source, transform.offsetX, transform.offsetY, transform.scale]);

  const handleCanvasPointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (dragState.mode === 'move') {
      const rect = event.currentTarget.getBoundingClientRect();
      const deltaX = (event.clientX - dragState.startClientX) / Math.max(1, rect.width);
      const deltaY = (event.clientY - dragState.startClientY) / Math.max(1, rect.height);

      updateTransform((current) => ({
        ...current,
        offsetX: clamp(dragState.startOffsetX + deltaX, -1.5, 1.5),
        offsetY: clamp(dragState.startOffsetY + deltaY, -1.5, 1.5),
      }));
      return;
    }

    const point = getCanvasPoint(event.currentTarget, event);
    const distance = Math.max(24, getDistanceFromCenter(point));

    updateTransform((current) => ({
      ...current,
      scale: clamp(dragState.startScale * (distance / dragState.startDistance), 0.2, 6),
    }));
  }, [updateTransform]);

  const handleCanvasPointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleCanvasWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    if (!source) return;

    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.08 : 0.92;
    updateTransform((current) => ({
      ...current,
      scale: clamp(current.scale * factor, 0.2, 6),
    }));
  }, [source, updateTransform]);

  const setFormat = useCallback((format: IconOutputFormat) => {
    clearOutput();
    setOutputFormat(format);
  }, [clearOutput]);

  const resetTransform = useCallback(() => {
    updateTransform(() => DEFAULT_TRANSFORM);
  }, [updateTransform]);

  const scalePercent = Math.round(transform.scale * 100);
  const roundedRadius = Math.round(transform.radius);
  const progressPercent = backgroundProgress?.percent ?? 0;

  return (
    <ToolLayout toolId="image-to-icon">
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel
          title={ti('settings_title')}
          actions={
            source ? (
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                {ti('replace')}
              </Button>
            ) : null
          }
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
          />

          <div
            role="button"
            tabIndex={0}
            className={clsx(
              'flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition-colors',
              isDraggingUpload
                ? 'border-action bg-surface-hover'
                : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
            )}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingUpload(true);
            }}
            onDragLeave={() => setIsDraggingUpload(false)}
            onDrop={handleUploadDrop}
          >
            <p className="text-base font-semibold text-content">{ti('drop_title')}</p>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">
              {ti('drop_hint', { formats: sourceFormats })}
            </p>
            <Button type="button" className="mt-4" onClick={() => inputRef.current?.click()}>
              {isLoadingSource ? ti('loading') : ti('drop_action')}
            </Button>
          </div>

          {error && (
            <p className="mt-4 rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
              {error}
            </p>
          )}

          {source && (
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border-base bg-surface-raised p-3">
                  <p className="text-xs text-content-muted">{ti('source_dimensions')}</p>
                  <p className="mt-1 font-mono text-content">{source.width} x {source.height}</p>
                </div>
                <div className="rounded-md border border-border-base bg-surface-raised p-3">
                  <p className="text-xs text-content-muted">{ti('source_size')}</p>
                  <p className="mt-1 font-mono text-content">{formatFileSize(source.originalSize)}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-content">{ti('format_label')}</p>
                <div className="grid gap-2">
                  {FORMAT_OPTIONS.map((format) => {
                    const config = iconOutputConfigs[format];
                    const isActive = outputFormat === format;

                    return (
                      <button
                        key={format}
                        type="button"
                        className={clsx(
                          'rounded-md border px-3 py-2 text-left transition-colors',
                          isActive
                            ? 'border-action bg-action text-brand-fg'
                            : 'border-border-base bg-surface-raised text-content-secondary hover:border-border-strong hover:bg-surface-hover'
                        )}
                        onClick={() => setFormat(format)}
                      >
                        <span className="block text-sm font-semibold">{config.label}</span>
                        <span className={clsx('mt-1 block text-xs', isActive ? 'text-brand-fg' : 'text-content-muted')}>
                          {ti(`format_descriptions.${format}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-medium text-content">
                    <span>{ti('scale')}</span>
                    <span className="font-mono text-content-muted">{ti('scale_value', { value: scalePercent })}</span>
                  </span>
                  <input
                    type="range"
                    min="20"
                    max="600"
                    value={scalePercent}
                    className="mt-2 w-full accent-action"
                    onChange={(event) => {
                      const nextScale = Number(event.target.value) / 100;
                      updateTransform((current) => ({ ...current, scale: nextScale }));
                    }}
                  />
                </label>

                <label className="block">
                  <span className="flex items-center justify-between text-sm font-medium text-content">
                    <span>{ti('radius')}</span>
                    <span className="font-mono text-content-muted">{ti('radius_value', { value: roundedRadius })}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={roundedRadius}
                    className="mt-2 w-full accent-action"
                    onChange={(event) => {
                      const radius = Number(event.target.value);
                      updateTransform((current) => ({ ...current, radius }));
                    }}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBackground || backgroundApplied}
                >
                  {isRemovingBackground ? ti('removing_background') : backgroundApplied ? ti('background_removed') : ti('remove_background')}
                </Button>
                {backgroundApplied && (
                  <Button type="button" variant="secondary" onClick={handleRestoreSource}>
                    {ti('restore_source')}
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={resetTransform}>
                  {ti('reset')}
                </Button>
              </div>

              {isRemovingBackground && (
                <div className="rounded-md border border-border-base bg-surface-raised p-3">
                  <div className="flex items-center justify-between text-xs text-content-muted">
                    <span>{ti('background_progress')}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-action transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                type="button"
                size="md"
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || isRemovingBackground}
              >
                {isGenerating ? ti('generating') : ti('generate')}
              </Button>
            </div>
          )}
        </Panel>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <Panel title={ti('workspace_title')} className="min-h-[520px]">
            {source ? (
              <div className="flex flex-grow flex-col items-center justify-center gap-4">
                <div
                  className="relative aspect-square w-full max-w-[30rem] overflow-hidden rounded-lg border border-border-base shadow-sm"
                  style={checkerStyle}
                >
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full touch-none cursor-move"
                    aria-label={ti('canvas_label')}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerCancel={handleCanvasPointerUp}
                    onWheel={handleCanvasWheel}
                  />
                  <div className="pointer-events-none absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-md border border-border-strong bg-surface-raised shadow">
                    <span className="block h-4 w-4 border-b-2 border-r-2 border-border-strong" />
                  </div>
                </div>
                <p className="text-center text-xs text-content-muted">{ti('drag_hint')}</p>
              </div>
            ) : (
              <div className="flex flex-grow flex-col items-center justify-center rounded-lg border border-dashed border-border-input bg-surface-raised p-8 text-center">
                <p className="text-base font-semibold text-content">{ti('empty_title')}</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-content-muted">{ti('empty_body')}</p>
              </div>
            )}
          </Panel>

          <div className="grid gap-4">
            <Panel title={ti('demo_title')}>
              <div className="space-y-4">
                <div className="rounded-md border border-border-base bg-surface-raised">
                  <div className="flex items-end gap-1 border-b border-border-subtle px-3 pt-3">
                    <div className="flex max-w-52 items-center gap-2 rounded-t-md border border-border-base border-b-0 bg-surface px-3 py-2">
                      {previewDataUrl && <img src={previewDataUrl} alt="" className="h-4 w-4 shrink-0" />}
                      <span className="truncate text-xs text-content-secondary">{ti('favicon_title')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-3">
                    {previewDataUrl && <img src={previewDataUrl} alt="" className="h-4 w-4 shrink-0" />}
                    <span className="truncate rounded-full border border-border-base bg-surface px-3 py-1 text-xs text-content-muted">
                      {ti('address_text')}
                    </span>
                  </div>
                </div>

                <div className="rounded-md border border-border-base bg-surface-raised p-3">
                  <p className="mb-3 text-sm font-medium text-content">{ti('favorites_demo')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[24, 32, 48].map((size) => (
                      <div key={size} className="flex flex-col items-center gap-2 rounded-md border border-border-subtle bg-surface p-3">
                        {previewDataUrl ? (
                          <img
                            src={previewDataUrl}
                            alt=""
                            className="shrink-0"
                            style={{ width: size, height: size }}
                          />
                        ) : (
                          <span className="block rounded border border-border-base bg-surface-hover" style={{ width: size, height: size }} />
                        )}
                        <span className="text-xs text-content-muted">{size}px</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title={ti('output_title')}>
              {output ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-border-base bg-surface-raised p-3">
                      <p className="text-xs text-content-muted">{ti('output_format')}</p>
                      <p className="mt-1 font-mono text-content">{activeFormatConfig.label}</p>
                    </div>
                    <div className="rounded-md border border-border-base bg-surface-raised p-3">
                      <p className="text-xs text-content-muted">{ti('output_size')}</p>
                      <p className="mt-1 font-mono text-content">{formatFileSize(output.outputSize)}</p>
                    </div>
                    {output.zipOutputSize ? (
                      <div className="rounded-md border border-border-base bg-surface-raised p-3">
                        <p className="text-xs text-content-muted">{ti('zip_output_size')}</p>
                        <p className="mt-1 font-mono text-content">{formatFileSize(output.zipOutputSize)}</p>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-content-muted">{ti('icon_sizes')}</p>
                    <div className="flex flex-wrap gap-2">
                      {output.sizes.map((size) => (
                        <span key={size} className="rounded border border-border-base bg-surface-raised px-2 py-1 font-mono text-xs text-content-secondary">
                          {size}x{size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="rounded-md border border-border-base bg-surface-raised px-3 py-2 text-sm leading-relaxed text-content-muted">
                    {ti(`output_notes.${output.format}`)}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      size="md"
                      className={clsx('w-full', !output.zipUrl && 'sm:col-span-2')}
                      onClick={handleDownload}
                    >
                      {ti(`download_actions.${output.format}`)}
                    </Button>
                    {output.zipUrl ? (
                      <Button type="button" size="md" variant="secondary" className="w-full" onClick={handleDownloadZip}>
                        {ti(`download_zip_actions.${output.format}`)}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-40 flex-col justify-center rounded-lg border border-dashed border-border-input bg-surface-raised p-5 text-center">
                  <p className="text-sm font-semibold text-content">{ti('empty_output_title')}</p>
                  <p className="mt-2 text-sm leading-relaxed text-content-muted">
                    {ti('empty_output_body', { format: activeFormatConfig.label })}
                  </p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
