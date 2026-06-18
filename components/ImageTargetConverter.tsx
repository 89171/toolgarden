'use client';

/* eslint-disable @next/next/no-img-element -- Image previews use local blob URLs. */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { convertImageFile } from '@/lib/utils/image-browser';
import {
  formatFileSize,
  getImageAcceptValue,
  getImageTargetConfig,
  getSupportedImageInputLabel,
  type ImageConversionError,
  type ImageTargetFormat,
} from '@/lib/utils/image';
import { createZipArchive } from '@/lib/utils/zip';

type ImageItemStatus = 'ready' | 'converting' | 'done' | 'error';
type PreviewKind = 'source' | 'output';

interface ImageItem {
  id: string;
  file: File;
  sourceUrl: string;
  status: ImageItemStatus;
  error?: ImageConversionError;
  outputBlob?: Blob;
  outputUrl?: string;
  outputName?: string;
  width?: number;
  height?: number;
  outputSize?: number;
  durationMs?: number;
}

interface ImageTargetConverterProps {
  toolId: 'image-to-jpg' | 'image-to-png' | 'image-to-webp';
  targetFormat: ImageTargetFormat;
}

function createItemId(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}-${Date.now()}`;
}

function revokeItemUrls(item: ImageItem) {
  URL.revokeObjectURL(item.sourceUrl);
  if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
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

export function ImageTargetConverter({ toolId, targetFormat }: ImageTargetConverterProps) {
  const tc = useTranslations('common');
  const ti = useTranslations('image_converter');
  const target = getImageTargetConfig(targetFormat);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageItem[]>([]);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(target.defaultQuality);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<{ itemId: string; kind: PreviewKind } | null>(null);
  const accept = getImageAcceptValue();
  const hasFiles = items.length > 0;
  const hasDownloads = items.some((item) => item.status === 'done' && item.outputUrl);
  const doneCount = items.filter((item) => item.status === 'done').length;
  const inputFormatLabels = getSupportedImageInputLabel().split(' / ');

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => {
    itemsRef.current.forEach(revokeItemUrls);
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
        return ti('errors.canvas_export');
      case 'unsupported_output':
        return ti('errors.unsupported_output', { format: error.detail ?? target.label });
      default:
        return ti('errors.general');
    }
  }, [target.label, ti]);

  const clearItems = useCallback(() => {
    itemsRef.current.forEach(revokeItemUrls);
    itemsRef.current = [];
    setItems([]);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const updateItem = useCallback((id: string, updater: (item: ImageItem) => ImageItem) => {
    setItems((current) => current.map((item) => (item.id === id ? updater(item) : item)));
  }, []);

  const convertItems = useCallback(async (targetItems: ImageItem[]) => {
    for (const item of targetItems) {
      updateItem(item.id, (current) => {
        if (current.outputUrl) URL.revokeObjectURL(current.outputUrl);
        return {
          ...current,
          status: 'converting',
          error: undefined,
          outputBlob: undefined,
          outputUrl: undefined,
          outputName: undefined,
          outputSize: undefined,
          durationMs: undefined,
        };
      });

      const result = await convertImageFile(item.file, targetFormat, {
        quality,
        jpegBackground: '#ffffff',
      });

      if (result.ok) {
        const outputUrl = URL.createObjectURL(result.blob);
        updateItem(item.id, (current) => ({
          ...current,
          status: 'done',
          outputBlob: result.blob,
          outputUrl,
          outputName: result.filename,
          width: result.width,
          height: result.height,
          outputSize: result.outputSize,
          durationMs: result.durationMs,
        }));
      } else {
        updateItem(item.id, (current) => ({
          ...current,
          status: 'error',
          error: result,
        }));
      }
    }
  }, [quality, targetFormat, updateItem]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const selectedFiles = Array.from(fileList);
    if (selectedFiles.length === 0) return;

    itemsRef.current.forEach(revokeItemUrls);

    const nextItems = selectedFiles.map((file, index) => ({
      id: createItemId(file, index),
      file,
      sourceUrl: URL.createObjectURL(file),
      status: 'ready' as const,
    }));

    itemsRef.current = nextItems;
    setItems(nextItems);
    void convertItems(nextItems);
  }, [convertItems]);

  const reconvert = useCallback(() => {
    if (itemsRef.current.length === 0) return;
    void convertItems(itemsRef.current);
  }, [convertItems]);

  const downloadItem = useCallback((item: ImageItem) => {
    if (!item.outputUrl || !item.outputName) return;
    downloadUrl(item.outputUrl, item.outputName);
  }, []);

  const downloadAll = useCallback(async () => {
    const entries = itemsRef.current
      .filter((item) => item.status === 'done' && item.outputBlob && item.outputName)
      .map((item) => ({
        filename: item.outputName as string,
        blob: item.outputBlob as Blob,
      }));

    if (entries.length === 0) return;

    const zipBlob = await createZipArchive(entries);
    const zipUrl = URL.createObjectURL(zipBlob);
    downloadUrl(zipUrl, `converted-${target.format}.zip`);
    window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
  }, [target.format]);

  const openPreview = useCallback((item: ImageItem, kind: PreviewKind) => {
    if (kind === 'output' && !item.outputUrl) return;
    setPreview({ itemId: item.id, kind });
  }, []);

  const switchPreviewKind = useCallback((kind: PreviewKind) => {
    setPreview((current) => (current ? { ...current, kind } : current));
  }, []);

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
        switchPreviewKind('source');
        return;
      }

      if (event.key === 'ArrowRight') {
        const previewItem = itemsRef.current.find((item) => item.id === preview.itemId);
        if (!previewItem?.outputUrl) return;
        event.preventDefault();
        switchPreviewKind('output');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [preview, switchPreviewKind]);

  const previewItem = preview ? items.find((item) => item.id === preview.itemId) : undefined;
  const previewKind: PreviewKind = preview?.kind === 'output' && previewItem?.outputUrl ? 'output' : 'source';
  const previewImage = previewItem
    ? {
        url: previewKind === 'output' && previewItem.outputUrl ? previewItem.outputUrl : previewItem.sourceUrl,
        label: previewKind === 'output' ? ti('output') : ti('source'),
        name: previewKind === 'output' ? previewItem.outputName ?? previewItem.file.name : previewItem.file.name,
      }
    : null;
  const canPreviewOutput = Boolean(previewItem?.outputUrl);

  return (
    <ToolLayout toolId={toolId}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,440px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearItems} disabled={!hasFiles}>{tc('clear')}</Button>}
          className="h-[min(34rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-contain pr-1 sm:gap-5">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
              }}
            />

            <div className="rounded-lg border border-border-base bg-surface-raised p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <span className="text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {ti('format_route')}
                </span>
                <span className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-muted">
                  {target.label}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_76px] sm:items-center">
                <div className="min-w-0">
                  <span className="mb-2 block text-xs text-content-faint">{ti('input_formats')}</span>
                  <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
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
                <span aria-hidden="true" className="hidden font-mono text-content-faint sm:block">-&gt;</span>
                <div className="min-w-0">
                  <span className="mb-2 block text-xs text-content-faint">{ti('output_format')}</span>
                  <span className="flex h-10 items-center justify-center rounded border border-border-strong bg-action px-3 font-mono text-sm font-semibold text-background sm:h-12">
                    {target.label}
                  </span>
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
                addFiles(event.dataTransfer.files);
              }}
              aria-label={ti('drop_action')}
              className={`group flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors sm:min-h-60 sm:gap-4 sm:p-6 ${
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-muted transition-colors group-hover:border-border-strong group-hover:text-content-secondary sm:h-14 sm:w-14">
                IMG
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-base font-semibold text-content sm:text-lg">{ti('drop_title')}</span>
                <span className="max-w-72 text-xs leading-relaxed text-content-muted sm:text-sm">
                  {ti('drop_hint', {
                    formats: getSupportedImageInputLabel(),
                    target: target.label,
                  })}
                </span>
              </span>
              <span className="rounded bg-action px-3 py-1.5 text-sm font-medium text-background transition-colors group-hover:bg-action-hover sm:px-4 sm:py-2">
                {ti('drop_action')}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="border-t border-border-subtle pt-3">
                <span className="block text-xs text-content-faint">{ti('summary_files')}</span>
                <span className="mt-1 block text-sm font-medium text-content-secondary">
                  {ti('selected_count', { count: items.length })}
                </span>
              </div>
              <div className="border-t border-border-subtle pt-3">
                <span className="block text-xs text-content-faint">{ti('summary_ready')}</span>
                <span className="mt-1 block text-sm font-medium text-content-secondary">
                  {ti('ready_count', { count: doneCount })}
                </span>
              </div>
            </div>

            {target.supportsQuality && (
              <div className="rounded-lg border border-border-base bg-surface-raised p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label htmlFor={`${toolId}-quality`} className="text-sm font-medium text-content-secondary">
                    {ti('quality')}
                  </label>
                  <span className="font-mono text-sm text-content-muted">
                    {ti('quality_value', { value: Math.round(quality * 100) })}
                  </span>
                </div>
                <input
                  id={`${toolId}-quality`}
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={Math.round(quality * 100)}
                  onChange={(event) => setQuality(Number(event.target.value) / 100)}
                  className="w-full accent-action"
                />
                <p className="mt-2 text-xs leading-relaxed text-content-faint">
                  {targetFormat === 'jpg' ? ti('jpeg_background') : ti('quality_note')}
                </p>
              </div>
            )}

            <p className="border-t border-border-subtle pt-3 text-xs leading-relaxed text-content-faint">
              {ti('local_worker_note')}
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button variant="primary" size="md" onClick={reconvert} disabled={!hasFiles}>
                {ti('convert_again')}
              </Button>
              <Button variant="secondary" size="md" onClick={() => void downloadAll()} disabled={!hasDownloads}>
                {ti('download_zip')}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title={ti('results_title')}
          actions={(
            <Button variant="primary" size="md" onClick={() => void downloadAll()} disabled={!hasDownloads}>
              {ti('download_zip')}
            </Button>
          )}
          className="min-h-[24rem] sm:min-h-[28rem] xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col overflow-hidden rounded border border-border-input bg-surface-raised">
            {items.length === 0 ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="grid w-full max-w-md grid-cols-2 gap-3">
                  <div className="aspect-[4/3] rounded border border-border-subtle bg-surface" />
                  <div className="aspect-[4/3] rounded border border-border-base bg-surface-hover" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-content">{ti('empty_title')}</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                    {ti('empty_body')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 border-b border-border-subtle bg-surface px-4 py-3 text-sm">
                  <div>
                    <span className="block text-xs text-content-faint">{ti('summary_files')}</span>
                    <span className="font-medium text-content-secondary">{items.length}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-content-faint">{ti('summary_ready')}</span>
                    <span className="font-medium text-content-secondary">{doneCount}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-content-faint">{ti('summary_target')}</span>
                    <span className="font-mono font-medium text-content-secondary">{target.label}</span>
                  </div>
                </div>

                <div className="min-h-0 flex-grow overflow-auto divide-y divide-border-subtle">
                  {items.map((item) => (
                    <div key={item.id} className="grid gap-5 p-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
                      <div className="grid grid-cols-2 gap-3">
                        <figure className="min-w-0">
                          <figcaption className="mb-2 text-xs font-medium text-content-faint">
                            {ti('source')}
                          </figcaption>
                          <button
                            type="button"
                            aria-label={ti('preview_open_source')}
                            onClick={() => openPreview(item, 'source')}
                            className="group flex aspect-[4/3] w-full cursor-zoom-in appearance-none items-center justify-center overflow-hidden rounded border border-border-base bg-surface transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                          >
                            <img src={item.sourceUrl} alt={item.file.name} className="h-full w-full object-contain" />
                          </button>
                        </figure>

                        <figure className="min-w-0">
                          <figcaption className="mb-2 text-xs font-medium text-content-faint">
                            {ti('output')}
                          </figcaption>
                          {item.outputUrl ? (
                            <button
                              type="button"
                              aria-label={ti('preview_open_output')}
                              onClick={() => openPreview(item, 'output')}
                              className="group flex aspect-[4/3] w-full cursor-zoom-in appearance-none items-center justify-center overflow-hidden rounded border border-border-base bg-surface transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                            >
                              <img src={item.outputUrl} alt={item.outputName ?? item.file.name} className="h-full w-full object-contain" />
                            </button>
                          ) : (
                            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-border-base bg-surface">
                              <span className="px-3 text-center text-xs text-content-faint">
                                {item.status === 'converting' ? ti('status_converting') : ti('status_waiting')}
                              </span>
                            </div>
                          )}
                        </figure>
                      </div>

                      <div className="flex min-w-0 flex-col gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-content-secondary">{item.file.name}</h3>
                            <p className="mt-1 text-sm text-content-muted">
                              {formatFileSize(item.file.size)}
                              {item.width && item.height ? ` · ${item.width} × ${item.height}` : ''}
                            </p>
                          </div>
                          <span className={`rounded border px-2 py-1 text-xs font-medium ${
                            item.status === 'error'
                              ? 'border-border-base bg-danger-surface text-danger-content'
                              : 'border-border-subtle bg-surface text-content-muted'
                          }`}>
                            {item.status === 'done' && ti('status_done')}
                            {item.status === 'error' && ti('status_error')}
                            {item.status === 'converting' && ti('status_converting')}
                            {item.status === 'ready' && ti('status_waiting')}
                          </span>
                        </div>

                        {item.status === 'converting' && (
                          <div className="h-1.5 overflow-hidden rounded bg-surface-hover">
                            <div className="h-full w-2/3 rounded bg-action animate-pulse" />
                          </div>
                        )}

                        {item.error ? (
                          <p className="rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
                            {getErrorMessage(item.error)}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 border-t border-border-subtle pt-3 text-sm text-content-muted sm:grid-cols-3">
                            <div>
                              <span className="block text-xs text-content-faint">{ti('target_format')}</span>
                              <span className="font-mono font-medium text-content-secondary">{target.label}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-content-faint">{ti('output_size')}</span>
                              <span className="font-medium text-content-secondary">
                                {item.outputSize ? formatFileSize(item.outputSize) : '--'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs text-content-faint">{ti('duration')}</span>
                              <span className="font-medium text-content-secondary">
                                {item.durationMs === undefined ? '--' : ti('duration_value', { value: item.durationMs })}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex flex-wrap gap-2">
                          <Button onClick={() => downloadItem(item)} disabled={!item.outputUrl}>
                            {tc('download')}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              void convertItems([item]);
                            }}
                            disabled={item.status === 'converting'}
                          >
                            {ti('convert_again')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Panel>
      </div>

      {previewItem && previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ti('preview_title')}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-3 sm:p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[calc(100svh-1.5rem)] w-full max-w-6xl flex-col gap-3 rounded-lg border border-border-base bg-surface p-3 shadow sm:max-h-[calc(100svh-3rem)] sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-content-faint">{ti('preview_title')}</p>
                  <span className="rounded-full border border-border-subtle bg-surface-raised px-2.5 py-1 text-xs font-medium text-content-secondary">
                    {previewImage.label}
                  </span>
                </div>
                <h2 className="truncate text-base font-semibold text-content-secondary">
                  {previewImage.name}
                </h2>
              </div>
              <button
                type="button"
                aria-label={ti('preview_close')}
                onClick={() => setPreview(null)}
                className="flex h-9 w-9 items-center justify-center rounded border border-border-subtle bg-surface-raised text-content-muted transition-colors hover:border-border-strong hover:text-content-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
              >
                x
              </button>
            </div>

            <div className="relative flex max-h-[calc(100svh-8rem)] items-center justify-center overflow-hidden rounded border border-border-subtle bg-surface-raised p-2 sm:max-h-[calc(100svh-9.5rem)] sm:p-3">
              <button
                type="button"
                aria-label={ti('preview_open_source')}
                onClick={() => switchPreviewKind('source')}
                disabled={previewKind === 'source'}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-action text-lg font-semibold text-background shadow-lg transition hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-35 sm:left-4 sm:h-12 sm:w-12"
              >
                <span aria-hidden="true">&lt;</span>
              </button>

              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="block max-h-[calc(100svh-9rem)] max-w-full object-contain sm:max-h-[calc(100svh-11rem)]"
              />

              <button
                type="button"
                aria-label={ti('preview_open_output')}
                onClick={() => switchPreviewKind('output')}
                disabled={!canPreviewOutput || previewKind === 'output'}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-action text-lg font-semibold text-background shadow-lg transition hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-35 sm:right-4 sm:h-12 sm:w-12"
              >
                <span aria-hidden="true">&gt;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
