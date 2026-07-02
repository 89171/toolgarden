'use client';

/* eslint-disable @next/next/no-img-element -- Image previews use local blob URLs. */
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { inspectImageFile, upscaleImageFile } from '@/lib/utils/image-browser';
import {
  formatFileSize,
  getBasicImageTargetConfig,
  getImageAcceptValue,
  getSupportedImageInputLabel,
  type BasicImageTargetFormat,
  type ImageConversionError,
  type ImageInspectionSuccess,
  type ImageUpscaleMode,
  type ImageUpscaleSuccess,
} from '@/lib/utils/image';

interface OutputState {
  result: ImageUpscaleSuccess;
  url: string;
}

const SCALE_PRESETS = [2, 3, 4] as const;
const OUTPUT_FORMATS: BasicImageTargetFormat[] = ['png', 'jpg', 'webp'];
const UPSCALE_MODES: ImageUpscaleMode[] = ['pixel', 'smooth', 'sharp'];

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

export function ImageUpscaler() {
  const locale = useLocale();
  const tc = useTranslations('common');
  const ti = useTranslations('image_upscale');
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const loadRequestRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [image, setImage] = useState<ImageInspectionSuccess | null>(null);
  const [scale, setScale] = useState(2);
  const [outputWidth, setOutputWidth] = useState('');
  const [outputHeight, setOutputHeight] = useState('');
  const [mode, setMode] = useState<ImageUpscaleMode>('pixel');
  const [outputFormat, setOutputFormat] = useState<BasicImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const accept = getImageAcceptValue();
  const inputFormatLabels = getSupportedImageInputLabel().split(' / ');
  const target = getBasicImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const canProcess = Boolean(file && image && parseDimension(outputWidth) && parseDimension(outputHeight));

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
    setPreviewOpen(false);
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

  const syncDimensionsFromScale = useCallback((nextScale: number, sourceImage = image) => {
    if (!sourceImage) return;
    setOutputWidth(String(Math.round(sourceImage.width * nextScale)));
    setOutputHeight(String(Math.round(sourceImage.height * nextScale)));
  }, [image]);

  const clearImage = useCallback(() => {
    loadRequestRef.current += 1;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearOutput();
    setFile(null);
    setSourceUrl('');
    setImage(null);
    setOutputWidth('');
    setOutputHeight('');
    setError('');
    setIsLoading(false);
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

    const inspected = await inspectImageFile(selected);
    if (requestId !== loadRequestRef.current) return;

    setIsLoading(false);

    if (!inspected.ok) {
      setError(getErrorMessage(inspected));
      return;
    }

    const url = URL.createObjectURL(selected);
    setFile(selected);
    setSourceUrl(url);
    setImage(inspected);
    setScale(2);
    syncDimensionsFromScale(2, inspected);
    setOutputFormat('png');
  }, [clearOutput, getErrorMessage, sourceUrl, syncDimensionsFromScale]);

  const handleWidthChange = useCallback((value: string) => {
    setOutputWidth(value);
    clearOutput();
    if (!image) return;
    const width = parseDimension(value);
    if (!width) return;
    setOutputHeight(String(Math.max(1, Math.round((width * image.height) / image.width))));
    setScale(width / image.width);
  }, [clearOutput, image]);

  const handleHeightChange = useCallback((value: string) => {
    setOutputHeight(value);
    clearOutput();
    if (!image) return;
    const height = parseDimension(value);
    if (!height) return;
    setOutputWidth(String(Math.max(1, Math.round((height * image.width) / image.height))));
    setScale(height / image.height);
  }, [clearOutput, image]);

  const handleScalePreset = useCallback((nextScale: number) => {
    setScale(nextScale);
    clearOutput();
    syncDimensionsFromScale(nextScale);
  }, [clearOutput, syncDimensionsFromScale]);

  const handleProcess = useCallback(async () => {
    const width = parseDimension(outputWidth);
    const height = parseDimension(outputHeight);
    if (!file || !image || !width || !height) {
      setError(ti('errors.invalid_dimensions'));
      return;
    }

    setIsProcessing(true);
    setError('');
    clearOutput();

    const result = await upscaleImageFile(file, {
      outputWidth: width,
      outputHeight: height,
      targetFormat: outputFormat,
      mode,
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
  }, [clearOutput, file, getErrorMessage, image, mode, outputFormat, outputHeight, outputWidth, quality, ti]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    downloadUrl(output.url, output.result.filename);
  }, [output]);

  const outputScaleLabel = image
    ? `${(parseDimension(outputWidth) ?? image.width) / image.width >= 10
      ? ((parseDimension(outputWidth) ?? image.width) / image.width).toFixed(1)
      : ((parseDimension(outputWidth) ?? image.width) / image.width).toFixed(2)}x`
    : '--';

  return (
    <ToolLayout toolId="image-upscale">
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,430px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearImage} disabled={!file}>{tc('clear')}</Button>}
          className="h-[min(38rem,calc(100svh-10rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col">
            <div className="flex min-h-0 flex-grow flex-col gap-3 overflow-y-auto overscroll-contain pr-1 sm:gap-4">
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) void handleFiles(event.target.files);
                }}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void handleFiles(event.dataTransfer.files);
                }}
                aria-label={ti('drop_action')}
                className={`group flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center transition-colors sm:min-h-40 sm:p-4 ${
                  dragging
                    ? 'border-border-strong bg-surface-hover'
                    : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
                }`}
              >
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-content sm:text-base">{ti('drop_title')}</span>
                  <span className="max-w-72 text-xs leading-relaxed text-content-muted sm:text-sm">
                    {ti('drop_hint', { formats: getSupportedImageInputLabel() })}
                  </span>
                </span>
                <span className="rounded bg-action px-3 py-1.5 text-sm font-medium text-background transition-colors group-hover:bg-action-hover">
                  {ti('drop_action')}
                </span>
              </button>

              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('scale_title')}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SCALE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleScalePreset(preset)}
                      disabled={!image}
                      className={`rounded border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        Math.abs(scale - preset) < 0.01
                          ? 'border-border-strong bg-action text-background'
                          : 'border-border-base bg-surface text-content-secondary hover:border-border-strong hover:bg-surface-hover'
                      }`}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="min-w-0">
                  <span className="mb-1 block text-xs font-medium text-content-faint">{ti('output_width')}</span>
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={outputWidth}
                    onChange={(event) => handleWidthChange(event.target.value)}
                    disabled={!image}
                    className="w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary outline-none transition focus:border-border-strong focus:ring-2 focus:ring-action disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>
                <label className="min-w-0">
                  <span className="mb-1 block text-xs font-medium text-content-faint">{ti('output_height')}</span>
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={outputHeight}
                    onChange={(event) => handleHeightChange(event.target.value)}
                    disabled={!image}
                    className="w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary outline-none transition focus:border-border-strong focus:ring-2 focus:ring-action disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('mode_title')}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {UPSCALE_MODES.map((modeOption) => (
                    <button
                      key={modeOption}
                      type="button"
                      onClick={() => {
                        setMode(modeOption);
                        clearOutput();
                      }}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        mode === modeOption
                          ? 'border-border-strong bg-surface-hover'
                          : 'border-border-base bg-surface hover:border-border-strong hover:bg-surface-hover'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-content-secondary">
                        {ti(`modes.${modeOption}.label`)}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-content-muted">
                        {ti(`modes.${modeOption}.hint`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-medium text-content-faint">{ti('output_format')}</span>
                  <select
                    value={outputFormat}
                    onChange={(event) => {
                      setOutputFormat(event.target.value as BasicImageTargetFormat);
                      clearOutput();
                    }}
                    className="w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content-secondary outline-none transition focus:border-border-strong focus:ring-2 focus:ring-action"
                  >
                    {OUTPUT_FORMATS.map((format) => (
                      <option key={format} value={format}>{getBasicImageTargetConfig(format).label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-content-faint">{ti('quality')}</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(quality * 100)}
                    disabled={!showQuality}
                    onChange={(event) => {
                      setQuality(Number(event.target.value) / 100);
                      clearOutput();
                    }}
                    className="mt-2 w-full accent-action disabled:opacity-45"
                  />
                  <span className="mt-1 block text-xs text-content-muted">
                    {showQuality ? ti('quality_value', { value: Math.round(quality * 100) }) : ti('lossless_png')}
                  </span>
                </label>
              </div>

              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('input_formats')}
                </span>
                <div className="flex max-h-14 flex-wrap gap-1.5 overflow-y-auto pr-1">
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

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border-base bg-surface-raised p-2.5">
                  <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                  <span className="mt-1 block text-sm font-medium text-content-secondary">
                    {image ? formatDimensions(image.width, image.height) : '--'}
                  </span>
                </div>
                <div className="rounded-lg border border-border-base bg-surface-raised p-2.5">
                  <span className="block text-xs text-content-faint">{ti('scale_value')}</span>
                  <span className="mt-1 block text-sm font-medium text-content-secondary">{outputScaleLabel}</span>
                </div>
              </div>

              <Link
                href={`/${locale}/image/compress`}
                className="rounded-lg border border-border-base bg-surface-raised p-3 transition-colors hover:border-border-strong hover:bg-surface-hover"
              >
                <span className="block text-sm font-semibold text-content-secondary">{ti('related_compress_title')}</span>
                <span className="mt-1 block text-xs leading-relaxed text-content-muted">{ti('related_compress_body')}</span>
              </Link>

              <p className="border-t border-border-subtle pt-2 text-xs leading-relaxed text-content-faint">
                {ti('local_note')}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-1 gap-2 border-t border-border-subtle bg-surface pt-3 sm:grid-cols-2">
              <Button variant="primary" size="md" onClick={() => void handleProcess()} disabled={!canProcess || isProcessing || isLoading}>
                {isProcessing ? ti('processing') : ti('apply')}
              </Button>
              <Button variant="secondary" size="md" onClick={downloadOutput} disabled={!output}>
                {tc('download')}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title={ti('result_title')}
          actions={<Button variant="primary" size="md" onClick={downloadOutput} disabled={!output}>{tc('download')}</Button>}
          className="min-h-[24rem] sm:min-h-[28rem] xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col overflow-hidden rounded border border-border-input bg-surface-raised">
            {!file ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="grid w-full max-w-md grid-cols-[0.85fr_1.15fr] items-center gap-3">
                  <div className="aspect-square rounded border border-border-subtle bg-surface" />
                  <div className="aspect-square rounded border border-border-base bg-surface-hover" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-content">{ti('empty_title')}</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                    {ti('empty_body')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-grow flex-col">
                <div className="grid gap-4 border-b border-border-subtle bg-surface p-4 text-sm sm:grid-cols-3">
                  <div>
                    <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                    <span className="font-medium text-content-secondary">
                      {image ? formatDimensions(image.width, image.height) : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-content-faint">{ti('output_size')}</span>
                    <span className="font-medium text-content-secondary">
                      {parseDimension(outputWidth) && parseDimension(outputHeight)
                        ? formatDimensions(parseDimension(outputWidth) as number, parseDimension(outputHeight) as number)
                        : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-content-faint">{ti('file_size')}</span>
                    <span className="font-medium text-content-secondary">
                      {output ? formatFileSize(output.result.outputSize) : formatFileSize(file.size)}
                    </span>
                  </div>
                </div>

                {error ? (
                  <p className="m-4 rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
                    {error}
                  </p>
                ) : null}

                <div className="grid min-h-0 flex-grow gap-4 overflow-auto p-4 lg:grid-cols-2">
                  <figure className="min-w-0">
                    <figcaption className="mb-2 text-xs font-medium text-content-faint">{ti('source_image')}</figcaption>
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-border-base bg-surface">
                      {sourceUrl ? <img src={sourceUrl} alt={file.name} className="h-full w-full object-contain" /> : null}
                    </div>
                  </figure>
                  <figure className="min-w-0">
                    <figcaption className="mb-2 text-xs font-medium text-content-faint">{ti('output_image')}</figcaption>
                    {output ? (
                      <button
                        type="button"
                        aria-label={ti('preview_open_output')}
                        onClick={() => setPreviewOpen(true)}
                        className="flex aspect-[4/3] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded border border-border-base bg-surface transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                      >
                        <img src={output.url} alt={output.result.filename} className="h-full w-full object-contain" />
                      </button>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-border-base bg-surface">
                        <span className="px-3 text-center text-sm text-content-faint">
                          {isProcessing ? ti('processing') : ti('output_empty')}
                        </span>
                      </div>
                    )}
                  </figure>
                </div>

                {output ? (
                  <div className="grid gap-3 border-t border-border-subtle bg-surface p-4 text-sm sm:grid-cols-4">
                    <div>
                      <span className="block text-xs text-content-faint">{ti('output_format')}</span>
                      <span className="font-mono font-medium text-content-secondary">{target.label}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-content-faint">{ti('algorithm')}</span>
                      <span className="font-medium text-content-secondary">{ti(`modes.${output.result.mode}.label`)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-content-faint">{ti('file_size')}</span>
                      <span className="font-medium text-content-secondary">{formatFileSize(output.result.outputSize)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-content-faint">{ti('duration')}</span>
                      <span className="font-medium text-content-secondary">
                        {ti('duration_value', { value: output.result.durationMs })}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Panel>
      </div>

      <ImagePreviewDialog
        open={previewOpen}
        src={output?.url}
        alt={output?.result.filename ?? ti('output_image')}
        title={ti('preview_title')}
        closeLabel={ti('preview_close')}
        onClose={() => setPreviewOpen(false)}
      />
    </ToolLayout>
  );
}
