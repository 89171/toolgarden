'use client';

/* eslint-disable @next/next/no-img-element -- Image previews use local blob URLs. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { inspectImageFile, removeImageBackground } from '@/lib/utils/image-browser';
import {
  formatFileSize,
  getImageAcceptValue,
  getSupportedImageInputLabel,
  type ImageBackgroundRemovalModel,
  type ImageBackgroundRemovalProgress,
  type ImageBackgroundRemovalSuccess,
  type ImageConversionError,
  type ImageInspectionSuccess,
} from '@/lib/utils/image';
import { imageRemoveBgContent } from '@/lib/tools/content/image-remove-bg';

type RemoveBgStatus = 'idle' | 'ready' | 'processing' | 'done' | 'error';
type PreviewKind = 'source' | 'output';

interface RemoveBgImage {
  id: string;
  file: File;
  sourceUrl: string;
  status: RemoveBgStatus;
  sourceInfo?: ImageInspectionSuccess;
  error?: ImageConversionError;
  progress?: ImageBackgroundRemovalProgress;
  outputBlob?: Blob;
  outputUrl?: string;
  outputName?: string;
  result?: ImageBackgroundRemovalSuccess;
}

const checkerboardStyle: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(45deg, var(--border-subtle) 25%, transparent 25%)',
    'linear-gradient(-45deg, var(--border-subtle) 25%, transparent 25%)',
    'linear-gradient(45deg, transparent 75%, var(--border-subtle) 75%)',
    'linear-gradient(-45deg, transparent 75%, var(--border-subtle) 75%)',
  ].join(', '),
  backgroundSize: '18px 18px',
  backgroundPosition: '0 0, 0 9px, 9px -9px, -9px 0px',
};

const backgroundRemovalModelOptions: Array<{
  value: ImageBackgroundRemovalModel;
  labelKey: 'model_balanced_label' | 'model_speed_label' | 'model_hd_label';
  sizeKey: 'model_size_medium' | 'model_size_small' | 'model_size_hd';
  descriptionKey: 'model_balanced_description' | 'model_speed_description' | 'model_hd_description';
}> = [
  {
    value: 'medium',
    labelKey: 'model_balanced_label',
    sizeKey: 'model_size_medium',
    descriptionKey: 'model_balanced_description',
  },
  {
    value: 'small',
    labelKey: 'model_speed_label',
    sizeKey: 'model_size_small',
    descriptionKey: 'model_speed_description',
  },
  {
    value: 'birefnet-lite',
    labelKey: 'model_hd_label',
    sizeKey: 'model_size_hd',
    descriptionKey: 'model_hd_description',
  },
];

function createImageId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
}

function revokeImageUrls(image: RemoveBgImage | null) {
  if (!image) return;
  URL.revokeObjectURL(image.sourceUrl);
  if (image.outputUrl) URL.revokeObjectURL(image.outputUrl);
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

export function ImageBackgroundRemover() {
  const tc = useTranslations('common');
  const ti = useTranslations('image_remove_bg');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<RemoveBgImage | null>(null);
  const activeJobRef = useRef<string | null>(null);
  const [image, setImage] = useState<RemoveBgImage | null>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<PreviewKind | null>(null);
  const [selectedModel, setSelectedModel] = useState<ImageBackgroundRemovalModel>('medium');
  const accept = getImageAcceptValue();
  const inputFormatLabels = useMemo(() => getSupportedImageInputLabel().split(' / '), []);
  const hasImage = Boolean(image);
  const hasOutput = Boolean(image?.outputUrl && image.outputName);
  const canRun = Boolean(image && image.status !== 'processing' && image.sourceInfo);
  const canPreviewOutput = Boolean(image?.outputUrl);
  const canChangeModel = image?.status !== 'processing';

  useEffect(() => {
    imageRef.current = image;
  }, [image]);

  useEffect(() => () => {
    revokeImageUrls(imageRef.current);
  }, []);

  const getErrorMessage = useCallback((error: ImageConversionError): string => {
    switch (error.code) {
      case 'empty_file':
        return ti('errors.empty_file');
      case 'unsupported_input':
        return ti('errors.unsupported_input', { type: error.detail ?? ti('unknown_type') });
      case 'file_too_large':
        return ti('errors.file_too_large', { maxSize: error.maxSize ?? '' });
      case 'too_many_pixels':
        return ti('errors.too_many_pixels', { maxPixels: error.maxPixels ?? '' });
      case 'load_failed':
        return ti('errors.load_failed');
      case 'canvas_context':
        return ti('errors.canvas_context');
      case 'canvas_export':
        if (error.detail === 'background_removal_timeout') return ti('errors.model_timeout');
        return error.detail ? `${ti('errors.canvas_export')} ${error.detail}` : ti('errors.canvas_export');
      case 'unsupported_output':
        return ti('errors.unsupported_output', { format: error.detail ?? '' });
      case 'ai_model_unavailable':
        return error.detail === 'birefnet_webgpu_unavailable'
          ? ti('errors.hd_requires_webgpu')
          : ti('errors.ai_model_unavailable');
      default:
        return ti('errors.general');
    }
  }, [ti]);

  const clearImage = useCallback(() => {
    activeJobRef.current = null;
    revokeImageUrls(imageRef.current);
    imageRef.current = null;
    setImage(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const setCurrentImage = useCallback((updater: (current: RemoveBgImage) => RemoveBgImage) => {
    setImage((current) => (current ? updater(current) : current));
  }, []);

  const changeModel = useCallback((model: ImageBackgroundRemovalModel) => {
    if (imageRef.current?.status === 'processing') return;
    setSelectedModel(model);
    setImage((current) => {
      if (!current?.outputUrl) return current;
      URL.revokeObjectURL(current.outputUrl);
      return {
        ...current,
        status: current.sourceInfo ? 'ready' : current.status,
        progress: undefined,
        outputBlob: undefined,
        outputUrl: undefined,
        outputName: undefined,
        result: undefined,
      };
    });
    setPreview(null);
  }, []);

  const addFile = useCallback((fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];
    if (!file) return;

    activeJobRef.current = null;
    revokeImageUrls(imageRef.current);

    const id = createImageId(file);
    const nextImage: RemoveBgImage = {
      id,
      file,
      sourceUrl: URL.createObjectURL(file),
      status: 'ready',
    };

    imageRef.current = nextImage;
    setImage(nextImage);
    setPreview(null);

    void inspectImageFile(file).then((inspection) => {
      setImage((current) => {
        if (!current || current.id !== id) return current;
        if (inspection.ok) {
          return {
            ...current,
            sourceInfo: inspection,
            status: 'ready',
            error: undefined,
          };
        }

        return {
          ...current,
          status: 'error',
          error: inspection,
        };
      });
    });
  }, []);

  const runRemoval = useCallback(async () => {
    const target = imageRef.current;
    if (!target || target.status === 'processing' || !target.sourceInfo) return;

    const jobId = `${target.id}-${Date.now()}`;
    const model = selectedModel;
    activeJobRef.current = jobId;

    setCurrentImage((current) => {
      if (current.outputUrl) URL.revokeObjectURL(current.outputUrl);
      return {
        ...current,
        status: 'processing',
        error: undefined,
        progress: {
          stage: 'model',
          label: 'model:prepare',
          current: 0,
          total: 1,
          percent: 0,
        },
        outputBlob: undefined,
        outputUrl: undefined,
        outputName: undefined,
        result: undefined,
      };
    });

    const result = await removeImageBackground(target.file, {
      model,
      onProgress: (progress) => {
        if (activeJobRef.current !== jobId) return;
        setCurrentImage((current) => ({
          ...current,
          progress,
        }));
      },
    });

    if (activeJobRef.current !== jobId) return;

    if (result.ok) {
      const outputUrl = URL.createObjectURL(result.blob);
      setCurrentImage((current) => ({
        ...current,
        status: 'done',
        progress: undefined,
        outputBlob: result.blob,
        outputUrl,
        outputName: result.filename,
        result,
      }));
      return;
    }

    setCurrentImage((current) => ({
      ...current,
      status: 'error',
      progress: undefined,
      error: result,
    }));
  }, [selectedModel, setCurrentImage]);

  const downloadOutput = useCallback(() => {
    const current = imageRef.current;
    if (!current?.outputUrl || !current.outputName) return;
    downloadUrl(current.outputUrl, current.outputName);
  }, []);

  const progressPercent = image?.status === 'processing'
    ? Math.min(100, Math.round(image.progress?.percent ?? 0))
    : 0;

  const progressLabel = (() => {
    const progress = image?.progress;
    if (!progress) return ti('progress_model', { value: progressPercent });
    if (progress.label === 'model:prepare') return ti('progress_prepare');
    if (progress.label === 'model:compile') return ti('progress_compile');
    if (progress.label === 'model:retry') return ti('progress_retry');
    if (progress.label === 'model:fallback') return ti('progress_fallback');
    if (progress.stage === 'model') {
      return ti('progress_model', { value: progressPercent });
    }

    if (progress.label.includes('inference')) {
      return ti('progress_inference', { value: progressPercent });
    }

    if (progress.label.includes('encode')) {
      return ti('progress_encode', { value: progressPercent });
    }

    return ti('progress_compute', { value: progressPercent });
  })();

  useEffect(() => {
    if (!preview) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreview(null);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setPreview('source');
        return;
      }

      if (event.key === 'ArrowRight' && imageRef.current?.outputUrl) {
        event.preventDefault();
        setPreview('output');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [preview]);

  const previewImage = image && preview
    ? {
        url: preview === 'output' && image.outputUrl ? image.outputUrl : image.sourceUrl,
        name: preview === 'output' ? image.outputName ?? image.file.name : image.file.name,
        label: preview === 'output' ? ti('preview_output') : ti('preview_source'),
      }
    : null;

  return (
    <ToolLayout toolId="image-remove-bg" content={imageRemoveBgContent}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(320px,420px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearImage} disabled={!hasImage}>{tc('clear')}</Button>}
          className="h-[min(32rem,calc(100svh-10rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col">
            <div className="flex min-h-0 flex-grow flex-col gap-3 overflow-y-auto overscroll-auto pr-1 sm:gap-4">
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) addFile(event.target.files);
                }}
              />

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-normal text-content-faint">
                    {ti('model_label')}
                  </span>
                  <h2 className="mt-1.5 text-lg font-semibold leading-tight text-content">
                    {ti('model_title')}
                  </h2>
                </div>
                <span className="rounded border border-border-strong bg-surface px-2 py-1 font-mono text-xs font-semibold text-content-secondary">
                  PNG
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-content-muted">
                {ti('model_description')}
              </p>
              <div className="mt-3" role="radiogroup" aria-label={ti('model_choice')}>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('model_choice')}
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {backgroundRemovalModelOptions.map((option) => {
                    const selected = selectedModel === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`${ti(option.labelKey)} ${ti(option.sizeKey)} ${ti(option.descriptionKey)}`}
                        disabled={!canChangeModel}
                        onClick={() => changeModel(option.value)}
                        className={`min-w-0 rounded border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                          selected
                            ? 'border-border-strong bg-surface'
                            : 'border-border-subtle bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
                        }`}
                      >
                        <span className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="font-semibold text-content">{ti(option.labelKey)}</span>
                          <span className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-xs text-content-muted">
                            {ti(option.sizeKey)}
                          </span>
                          {option.value === 'medium' && (
                            <span className="rounded border border-border-subtle bg-action px-1.5 py-0.5 text-xs font-medium text-background">
                              {ti('model_default_badge')}
                            </span>
                          )}
                        </span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-content-muted">
                          {ti(option.descriptionKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

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
                addFile(event.dataTransfer.files);
              }}
              aria-label={ti('drop_action')}
              className={`group flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center transition-colors sm:min-h-32 ${
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

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="block text-xs text-content-faint">{ti('selected_file')}</span>
                  <span className="mt-1 block truncate font-medium text-content-secondary">
                    {image?.file.name ?? '--'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                  <span className="mt-1 block font-medium text-content-secondary">
                    {image ? formatFileSize(image.file.size) : '--'}
                  </span>
                </div>
              </div>
            </div>

            <p className="border-t border-border-subtle pt-2 text-xs leading-relaxed text-content-faint">
              {ti('local_note')}
            </p>

            </div>

            <div className="grid shrink-0 grid-cols-1 gap-2 border-t border-border-subtle bg-surface pt-3 sm:grid-cols-2">
              <Button variant="primary" size="md" onClick={() => void runRemoval()} disabled={!canRun}>
                {image?.status === 'processing' ? ti('processing') : ti('remove_action')}
              </Button>
              <Button variant="secondary" size="md" onClick={downloadOutput} disabled={!hasOutput}>
                {ti('download')}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title={ti('results_title')}
          actions={(
            <Button variant="primary" size="md" onClick={downloadOutput} disabled={!hasOutput}>
              {ti('download')}
            </Button>
          )}
          className="min-h-[24rem] sm:min-h-[28rem] xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col overflow-hidden rounded border border-border-input bg-surface-raised">
            {!image ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="grid w-full max-w-md grid-cols-[1fr_1fr] gap-3">
                  <div className="aspect-[4/3] rounded border border-border-subtle bg-surface" />
                  <div className="aspect-[4/3] rounded border border-border-base bg-surface" style={checkerboardStyle} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-content">{ti('empty_title')}</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                    {ti('empty_body')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-grow overflow-auto p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <figure className="min-w-0">
                    <figcaption className="mb-2 text-xs font-medium text-content-faint">
                      {ti('source')}
                    </figcaption>
                    <button
                      type="button"
                      aria-label={ti('preview_open_source')}
                      onClick={() => setPreview('source')}
                      className="group flex h-64 w-full cursor-zoom-in appearance-none items-center justify-center overflow-hidden rounded border border-border-base bg-surface transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong sm:h-80 xl:h-[min(44svh,28rem)]"
                    >
                      <img src={image.sourceUrl} alt={image.file.name} className="h-full w-full object-contain" />
                    </button>
                  </figure>

                  <figure className="min-w-0">
                    <figcaption className="mb-2 text-xs font-medium text-content-faint">
                      {ti('output')}
                    </figcaption>
                    {image.outputUrl ? (
                      <button
                        type="button"
                        aria-label={ti('preview_open_output')}
                        onClick={() => setPreview('output')}
                        className="group flex h-64 w-full cursor-zoom-in appearance-none items-center justify-center overflow-hidden rounded border border-border-base bg-surface transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong sm:h-80 xl:h-[min(44svh,28rem)]"
                        style={checkerboardStyle}
                      >
                        <img src={image.outputUrl} alt={image.outputName ?? image.file.name} className="h-full w-full object-contain" />
                      </button>
                    ) : (
                      <div
                        className="flex h-64 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded border border-border-base bg-surface p-6 text-center sm:h-80 xl:h-[min(44svh,28rem)]"
                        style={checkerboardStyle}
                      >
                        {image.status === 'processing' ? (
                          <>
                            <span
                              className="rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-xs font-medium text-content-secondary"
                              aria-live="polite"
                            >
                              {progressLabel}
                            </span>
                            <div className="h-2 w-full max-w-72 overflow-hidden rounded bg-surface-hover">
                              <div
                                className={`h-full rounded bg-action transition-all ${
                                  image.progress?.label === 'model:compile' ? 'model-progress-pulse' : ''
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-xs text-content-muted">
                            {ti('output_empty')}
                          </span>
                        )}
                      </div>
                    )}
                  </figure>
                </div>

                {image.error && (
                  <p className="mt-4 rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
                    {getErrorMessage(image.error)}
                  </p>
                )}

                {image.result?.fallbackFrom === 'birefnet-lite' && (
                  <p className="mt-4 rounded border border-border-base bg-surface-raised p-3 text-sm text-content-secondary">
                    {ti('fallback_notice')}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-content-muted lg:grid-cols-4">
                  <div className="rounded border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{ti('dimensions')}</span>
                    <span className="mt-1 block font-medium text-content-secondary">
                      {image.sourceInfo ? `${image.sourceInfo.width} × ${image.sourceInfo.height}` : '--'}
                    </span>
                  </div>
                  <div className="rounded border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                    <span className="mt-1 block font-medium text-content-secondary">
                      {formatFileSize(image.file.size)}
                    </span>
                  </div>
                  <div className="rounded border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{ti('output_size')}</span>
                    <span className="mt-1 block font-medium text-content-secondary">
                      {image.result ? formatFileSize(image.result.outputSize) : '--'}
                    </span>
                  </div>
                  <div className="rounded border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{ti('duration')}</span>
                    <span className="mt-1 block font-medium text-content-secondary">
                      {image.result ? ti('duration_value', { value: image.result.durationMs }) : '--'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {previewImage && image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-content/80 p-4" role="dialog" aria-modal="true" aria-label={ti('preview_title')}>
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            aria-label={ti('preview_close')}
            onClick={() => setPreview(null)}
          />
          <div className="relative z-10 flex h-[min(86svh,54rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-border-base bg-surface-raised shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface px-4 py-3">
              <span className="rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-sm font-medium text-content-secondary">
                {previewImage.label}
              </span>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded border border-border-subtle bg-surface-raised px-3 py-1 text-sm text-content-muted transition-colors hover:text-content-secondary"
              >
                {ti('preview_close')}
              </button>
            </div>

            <div className="relative min-h-0 flex-grow bg-surface" style={preview === 'output' ? checkerboardStyle : undefined}>
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="h-full w-full object-contain p-4 sm:p-6"
              />
              <button
                type="button"
                aria-label={ti('preview_source')}
                onClick={() => setPreview('source')}
                disabled={preview === 'source'}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-content text-lg font-semibold text-background shadow-lg transition-opacity hover:opacity-90 disabled:opacity-35 sm:left-5"
              >
                {'<'}
              </button>
              <button
                type="button"
                aria-label={ti('preview_output')}
                onClick={() => setPreview('output')}
                disabled={!canPreviewOutput || preview === 'output'}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-content text-lg font-semibold text-background shadow-lg transition-opacity hover:opacity-90 disabled:opacity-35 sm:right-5"
              >
                {'>'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
