'use client';

/* eslint-disable @next/next/no-img-element -- Local previews use object URLs. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { imageEnhanceContent } from '@/lib/tools/content/image-enhance';
import {
  enhanceImageFile,
  inspectImageFile,
  supportsImageEnhanceWebGpu,
} from '@/lib/utils/image-browser';
import {
  formatFileSize,
  getBasicImageTargetConfig,
  getImageAcceptValue,
  getSupportedImageInputLabel,
  IMAGE_ENHANCE_MAX_SOURCE_PIXELS,
  IMAGE_ENHANCE_SCALES,
  MAX_IMAGE_PIXELS,
  type BasicImageTargetFormat,
  type ImageConversionError,
  type ImageEnhanceProgress,
  type ImageEnhanceScale,
  type ImageEnhanceSuccess,
  type ImageInspectionSuccess,
} from '@/lib/utils/image';

interface OutputState {
  result: ImageEnhanceSuccess;
  url: string;
}

const OUTPUT_FORMATS: BasicImageTargetFormat[] = ['png', 'jpg', 'webp'];

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

function getOverallProgress(progress: ImageEnhanceProgress | null): number {
  if (!progress) return 0;
  if (progress.stage === 'model') return Math.round(progress.percent * 0.44);
  if (progress.stage === 'compute') return Math.round(44 + progress.percent * 0.51);
  return Math.round(95 + progress.percent * 0.05);
}

export function ImageEnhancer() {
  const tc = useTranslations('common');
  const ti = useTranslations('image_enhance');
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const jobRef = useRef(0);

  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [image, setImage] = useState<ImageInspectionSuccess | null>(null);
  const [scale, setScale] = useState<ImageEnhanceScale>(1);
  const [outputFormat, setOutputFormat] = useState<BasicImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [progress, setProgress] = useState<ImageEnhanceProgress | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [webGpuSupported, setWebGpuSupported] = useState<boolean | null>(null);

  const target = getBasicImageTargetConfig(outputFormat);
  const outputWidth = image ? image.width * scale : 0;
  const outputHeight = image ? image.height * scale : 0;
  const sourceTooLarge = Boolean(image && image.width * image.height > IMAGE_ENHANCE_MAX_SOURCE_PIXELS);
  const outputTooLarge = Boolean(image && outputWidth * outputHeight > MAX_IMAGE_PIXELS);
  const canProcess = Boolean(
    file && image && !sourceTooLarge && !outputTooLarge && webGpuSupported === true && !isLoading
  );
  const progressPercent = getOverallProgress(progress);
  const inputFormatLabels = useMemo(() => getSupportedImageInputLabel().split(' / '), []);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supported = await supportsImageEnhanceWebGpu();
      if (!cancelled) setWebGpuSupported(supported);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      case 'ai_model_unavailable':
        if (imageError.detail === 'realesrgan_webgpu_unavailable') return ti('errors.webgpu_unavailable');
        if (imageError.detail === 'realesrgan_model_download_failed') return ti('errors.model_download_failed');
        return ti('errors.ai_model_unavailable');
      default:
        return ti('errors.general');
    }
  }, [ti]);

  const clearImage = useCallback(() => {
    jobRef.current += 1;
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = '';
    clearOutput();
    setFile(null);
    setSourceUrl('');
    setImage(null);
    setProgress(null);
    setError('');
    setIsLoading(false);
    setIsProcessing(false);
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList)[0];
    if (!selected) return;

    const jobId = jobRef.current + 1;
    jobRef.current = jobId;
    setIsLoading(true);
    setError('');
    setProgress(null);
    clearOutput();
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = '';
    setSourceUrl('');
    setFile(null);
    setImage(null);

    const inspected = await inspectImageFile(selected);
    if (jobRef.current !== jobId) return;
    setIsLoading(false);

    if (!inspected.ok) {
      setError(getErrorMessage(inspected));
      return;
    }

    const url = URL.createObjectURL(selected);
    sourceUrlRef.current = url;
    setFile(selected);
    setSourceUrl(url);
    setImage(inspected);
    setScale(1);
    setOutputFormat('png');
  }, [clearOutput, getErrorMessage]);

  const handleProcess = useCallback(async () => {
    if (!file || !image || !canProcess || isProcessing) return;

    const jobId = jobRef.current + 1;
    jobRef.current = jobId;
    setIsProcessing(true);
    setError('');
    setProgress(null);
    clearOutput();

    const result = await enhanceImageFile(file, {
      scale,
      targetFormat: outputFormat,
      quality,
      jpegBackground: '#ffffff',
      onProgress: (nextProgress) => {
        if (jobRef.current === jobId) setProgress(nextProgress);
      },
    });
    if (jobRef.current !== jobId) return;

    setIsProcessing(false);
    setProgress(null);
    if (!result.ok) {
      setError(getErrorMessage(result));
      return;
    }

    setOutput({ result, url: URL.createObjectURL(result.blob) });
  }, [canProcess, clearOutput, file, getErrorMessage, image, isProcessing, outputFormat, quality, scale]);

  const downloadOutput = useCallback(() => {
    if (output) downloadUrl(output.url, output.result.filename);
  }, [output]);

  const progressLabel = progress
    ? ti(`progress_${progress.stage}`, {
        current: progress.current,
        total: progress.total,
        value: progress.percent,
      })
    : ti('progress_prepare');

  return (
    <ToolLayout toolId="image-enhance" content={imageEnhanceContent}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,430px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearImage} disabled={!file || isProcessing}>{tc('clear')}</Button>}
          className="h-[min(42rem,calc(100svh-10rem))] min-h-0 overflow-hidden xl:h-auto"
        >
          <div className="flex min-h-0 flex-grow flex-col">
            <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto pr-1">
              <input
                ref={inputRef}
                type="file"
                accept={getImageAcceptValue()}
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) void handleFiles(event.target.files);
                }}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void handleFiles(event.dataTransfer.files);
                }}
                className={`group flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors ${
                  dragging
                    ? 'border-border-strong bg-surface-hover'
                    : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-muted">
                  HD
                </span>
                <span>
                  <span className="block text-sm font-semibold text-content sm:text-base">{ti('drop_title')}</span>
                  <span className="mt-1 block max-w-72 text-xs leading-relaxed text-content-muted sm:text-sm">
                    {ti('drop_hint', { formats: getSupportedImageInputLabel() })}
                  </span>
                </span>
                <span className="rounded bg-action px-3 py-1.5 text-sm font-medium text-background transition-colors group-hover:bg-action-hover">
                  {ti('drop_action')}
                </span>
              </button>

              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm font-semibold text-content-secondary">{ti('model_name')}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-content-muted">{ti('model_detail')}</span>
                  </div>
                  <span className="shrink-0 rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-faint">
                    FP16
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border-subtle pt-3 text-xs">
                  <span className="text-content-muted">{ti('model_size')}</span>
                  <span className="text-right font-medium text-content-secondary">32.2 MiB</span>
                  <span className="text-content-muted">{ti('runtime')}</span>
                  <span className="text-right font-medium text-content-secondary">WebGPU</span>
                </div>
              </div>

              {webGpuSupported === false ? (
                <p className="rounded border border-danger-border bg-danger-surface p-3 text-sm leading-relaxed text-danger-content">
                  {ti('errors.webgpu_unavailable')}
                </p>
              ) : null}

              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('output_scale')}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_ENHANCE_SCALES.map((scaleOption) => (
                    <button
                      key={scaleOption}
                      type="button"
                      disabled={!image || isProcessing}
                      onClick={() => {
                        setScale(scaleOption);
                        clearOutput();
                        setError('');
                      }}
                      className={`rounded border px-2 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        scale === scaleOption
                          ? 'border-border-strong bg-action text-background'
                          : 'border-border-base bg-surface text-content-secondary hover:border-border-strong hover:bg-surface-hover'
                      }`}
                    >
                      {scaleOption === 1 ? ti('scale_original') : `${scaleOption}×`}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-content-muted">
                  {ti(`scale_hint_${scale}`)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-medium text-content-faint">{ti('output_format')}</span>
                  <select
                    value={outputFormat}
                    disabled={isProcessing}
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
                    disabled={!target.supportsQuality || isProcessing}
                    onChange={(event) => {
                      setQuality(Number(event.target.value) / 100);
                      clearOutput();
                    }}
                    className="mt-2 w-full accent-action disabled:opacity-45"
                  />
                  <span className="mt-1 block text-xs text-content-muted">
                    {target.supportsQuality
                      ? ti('quality_value', { value: Math.round(quality * 100) })
                      : ti('lossless_png')}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                  <span className="mt-1 block text-sm font-medium text-content-secondary">
                    {image ? formatDimensions(image.width, image.height) : '--'}
                  </span>
                </div>
                <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                  <span className="block text-xs text-content-faint">{ti('output_size')}</span>
                  <span className="mt-1 block text-sm font-medium text-content-secondary">
                    {image ? formatDimensions(outputWidth, outputHeight) : '--'}
                  </span>
                </div>
              </div>

              {sourceTooLarge || outputTooLarge ? (
                <p className="rounded border border-danger-border bg-danger-surface p-3 text-xs leading-relaxed text-danger-content">
                  {sourceTooLarge
                    ? ti('source_limit', { value: Math.round(IMAGE_ENHANCE_MAX_SOURCE_PIXELS / 1_000_000) })
                    : ti('output_limit', { value: Math.round(MAX_IMAGE_PIXELS / 1_000_000) })}
                </p>
              ) : null}

              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('input_formats')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inputFormatLabels.map((label) => (
                    <span key={label} className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-muted">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <p className="border-t border-border-subtle pt-3 text-xs leading-relaxed text-content-faint">
                {ti('local_note')}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-1 gap-2 border-t border-border-subtle bg-surface pt-3 sm:grid-cols-2">
              <Button size="md" onClick={() => void handleProcess()} disabled={!canProcess || isProcessing}>
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
          actions={<Button size="md" onClick={downloadOutput} disabled={!output}>{tc('download')}</Button>}
          className="min-h-[28rem] xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col overflow-hidden rounded border border-border-input bg-surface-raised">
            {!file ? (
              <div className="flex min-h-96 flex-grow flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="relative h-36 w-full max-w-sm overflow-hidden rounded-lg border border-border-base bg-surface">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-surface-hover" />
                  <div className="absolute inset-y-4 left-1/2 border-l border-border-strong" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-content-faint">
                    AI / HD
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-content">{ti('empty_title')}</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">{ti('empty_body')}</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-grow flex-col">
                <div className="grid gap-3 border-b border-border-subtle bg-surface p-4 text-sm sm:grid-cols-3">
                  <div>
                    <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                    <span className="font-medium text-content-secondary">{image ? formatDimensions(image.width, image.height) : '--'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-content-faint">{ti('output_size')}</span>
                    <span className="font-medium text-content-secondary">{image ? formatDimensions(outputWidth, outputHeight) : '--'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-content-faint">{ti('file_size')}</span>
                    <span className="font-medium text-content-secondary">{output ? formatFileSize(output.result.outputSize) : formatFileSize(file.size)}</span>
                  </div>
                </div>

                {isProcessing ? (
                  <div className="border-b border-border-subtle bg-surface px-4 py-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-content-muted">
                      <span>{progressLabel}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-surface-hover">
                      <div className="h-full rounded bg-action transition-[width]" style={{ width: `${progressPercent}%` }} />
                    </div>
                    {progress?.stage === 'model' ? (
                      <p className="mt-2 text-xs leading-relaxed text-content-faint">{ti('first_download_note')}</p>
                    ) : null}
                  </div>
                ) : null}

                {error ? (
                  <p className="m-4 rounded border border-danger-border bg-danger-surface p-3 text-sm text-danger-content">{error}</p>
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
                        onClick={() => setPreviewOpen(true)}
                        className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded border border-border-base bg-surface transition-colors hover:border-border-strong"
                        aria-label={ti('preview_open')}
                      >
                        <img src={output.url} alt={output.result.filename} className="h-full w-full object-contain" />
                      </button>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center rounded border border-dashed border-border-base bg-surface p-6 text-center text-sm text-content-muted">
                        {isProcessing ? ti('processing_hint') : ti('output_empty')}
                      </div>
                    )}
                  </figure>
                </div>

                {output ? (
                  <div className="grid gap-3 border-t border-border-subtle bg-surface p-4 text-xs sm:grid-cols-3">
                    <div>
                      <span className="text-content-faint">{ti('duration')}</span>
                      <span className="ml-2 font-medium text-content-secondary">{ti('duration_value', { value: output.result.durationMs })}</span>
                    </div>
                    <div>
                      <span className="text-content-faint">{ti('result_scale')}</span>
                      <span className="ml-2 font-medium text-content-secondary">{output.result.scale}×</span>
                    </div>
                    <div>
                      <span className="text-content-faint">{ti('result_model')}</span>
                      <span className="ml-2 font-medium text-content-secondary">Real-ESRGAN</span>
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
