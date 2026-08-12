'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { convertFileToPdf } from '@/lib/utils/pdf-browser';
import {
  getPdfAcceptValue,
  getSupportedPdfInputLabel,
  inferPdfInputKind,
  type PdfConversionError,
  type PdfInputKind,
} from '@/lib/utils/pdf';
import { formatFileSize } from '@/lib/utils/image';
import { createZipArchive } from '@/lib/utils/zip';
import { pdfToPdfContent } from '@/lib/tools/content/pdf-to-pdf';

type PdfItemStatus = 'converting' | 'done' | 'error';

interface PdfItem {
  id: string;
  file: File;
  status: PdfItemStatus;
  error?: PdfConversionError;
  outputBlob?: Blob;
  outputUrl?: string;
  outputName?: string;
  outputSize?: number;
  pageCount?: number;
  durationMs?: number;
  inputKind: PdfInputKind;
}

function createItemId(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}-${Date.now()}`;
}

function revokeItemUrl(item: PdfItem) {
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

export function PdfToPdfConverter() {
  const tc = useTranslations('common');
  const tp = useTranslations('pdf_converter');
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<PdfItem[]>([]);
  const [items, setItems] = useState<PdfItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const accept = getPdfAcceptValue();
  const supportedLabels = getSupportedPdfInputLabel().split(' / ');
  const hasFiles = items.length > 0;
  const doneItems = items.filter((item) => item.status === 'done' && item.outputUrl);
  const selectedPreview = items.find((item) => item.id === previewId && item.outputUrl) ?? doneItems[0];

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => {
    itemsRef.current.forEach(revokeItemUrl);
  }, []);

  const getErrorMessage = useCallback((error: PdfConversionError): string => {
    switch (error.code) {
      case 'empty_file':
        return tp('errors.empty_file');
      case 'unsupported_input':
        return tp('errors.unsupported_input', { type: error.detail ?? tp('unknown_type') });
      case 'legacy_office':
        return tp('errors.legacy_office');
      case 'file_too_large':
        return tp('errors.file_too_large', { maxSize: error.maxSize ?? '' });
      case 'load_failed':
        return tp('errors.load_failed');
      case 'empty_document':
        return tp('errors.empty_document');
      case 'mobi_unsupported':
        return tp('errors.mobi_unsupported');
      case 'render_failed':
        return tp('errors.render_failed');
      default:
        return tp('errors.general');
    }
  }, [tp]);

  const updateItem = useCallback((id: string, updater: (item: PdfItem) => PdfItem) => {
    setItems((current) => current.map((item) => (item.id === id ? updater(item) : item)));
  }, []);

  const convertItems = useCallback(async (targetItems: PdfItem[]) => {
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
          pageCount: undefined,
          durationMs: undefined,
        };
      });

      const result = await convertFileToPdf(item.file);

      if (result.ok) {
        const outputUrl = URL.createObjectURL(result.blob);
        updateItem(item.id, (current) => ({
          ...current,
          status: 'done',
          outputBlob: result.blob,
          outputUrl,
          outputName: result.filename,
          outputSize: result.outputSize,
          pageCount: result.pageCount,
          durationMs: result.durationMs,
          inputKind: result.inputKind,
        }));
        setPreviewId((current) => current ?? item.id);
      } else {
        updateItem(item.id, (current) => ({
          ...current,
          status: 'error',
          error: result,
        }));
      }
    }
  }, [updateItem]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const selectedFiles = Array.from(fileList);
    if (selectedFiles.length === 0) return;

    itemsRef.current.forEach(revokeItemUrl);

    const nextItems = selectedFiles.map((file, index) => ({
      id: createItemId(file, index),
      file,
      status: 'converting' as const,
      inputKind: inferPdfInputKind(file),
    }));

    itemsRef.current = nextItems;
    setItems(nextItems);
    setPreviewId(null);
    void convertItems(nextItems);
  }, [convertItems]);

  const clearItems = useCallback(() => {
    itemsRef.current.forEach(revokeItemUrl);
    itemsRef.current = [];
    setItems([]);
    setPreviewId(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const reconvert = useCallback(() => {
    if (itemsRef.current.length === 0) return;
    void convertItems(itemsRef.current);
  }, [convertItems]);

  const downloadItem = useCallback((item: PdfItem) => {
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
    downloadUrl(zipUrl, 'pdf-results.zip');
    window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
  }, []);

  return (
    <ToolLayout toolId="pdf-to-pdf" content={pdfToPdfContent}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,440px)_1fr] xl:overflow-hidden">
        <Panel
          title={tp('settings_title')}
          actions={<Button variant="secondary" onClick={clearItems} disabled={!hasFiles}>{tc('clear')}</Button>}
          className="h-[min(34rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-auto pr-1 sm:gap-5">
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
              <span className="mb-3 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {tp('input_formats')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {supportedLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-muted"
                  >
                    {label}
                  </span>
                ))}
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
              className={`group flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-5 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-muted transition-colors group-hover:border-border-strong group-hover:text-content-secondary">
                PDF
              </span>
              <span className="text-base font-semibold text-content-secondary">{tp('drop_title')}</span>
              <span className="max-w-72 text-xs leading-relaxed text-content-muted sm:text-sm">
                {tp('drop_hint')}
              </span>
              <span className="rounded bg-action px-3 py-1.5 text-sm font-medium text-background transition-colors group-hover:bg-action-hover sm:px-4 sm:py-2">
                {tp('drop_action')}
              </span>
            </button>

            <div className="grid grid-cols-3 gap-3 border-t border-border-subtle pt-3 text-sm">
              <div>
                <span className="block text-xs text-content-faint">{tp('summary_files')}</span>
                <span className="mt-1 block font-medium text-content-secondary">{items.length}</span>
              </div>
              <div>
                <span className="block text-xs text-content-faint">{tp('summary_ready')}</span>
                <span className="mt-1 block font-medium text-content-secondary">{doneItems.length}</span>
              </div>
              <div>
                <span className="block text-xs text-content-faint">{tp('summary_target')}</span>
                <span className="mt-1 block font-mono font-medium text-content-secondary">PDF</span>
              </div>
            </div>

            <p className="border-t border-border-subtle pt-3 text-xs leading-relaxed text-content-faint">
              {tp('local_note')}
            </p>
          </div>
        </Panel>

        <Panel
          title={tp('results_title')}
          actions={(
            <>
              <Button variant="secondary" onClick={reconvert} disabled={!hasFiles}>
                {tp('convert_again')}
              </Button>
              <Button onClick={downloadAll} disabled={doneItems.length === 0}>
                {tp('download_zip')}
              </Button>
            </>
          )}
          className={`${items.length === 0 ? 'min-h-[32rem]' : 'min-h-[42rem]'} xl:min-h-0 xl:overflow-hidden`}
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4">
            {items.length === 0 ? (
              <div className="flex min-h-[28rem] flex-grow flex-col items-center justify-center rounded border border-border-input bg-surface-raised px-6 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                  PDF
                </span>
                <h3 className="text-base font-semibold text-content-secondary">{tp('empty_title')}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                  {tp('empty_body')}
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-64 shrink-0 overflow-y-auto rounded border border-border-input bg-surface-raised p-3">
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className={`group relative flex min-w-0 flex-col gap-3 rounded border p-3 transition-colors ${
                          selectedPreview?.id === item.id
                            ? 'border-border-strong bg-surface-hover'
                            : 'border-border-subtle bg-surface'
                        } ${item.status === 'done' && item.outputUrl ? 'cursor-pointer hover:border-border-strong hover:bg-surface-hover' : ''}`}
                      >
                        {item.status === 'done' && item.outputUrl && (
                          <button
                            type="button"
                            aria-label={`${tp('preview')} ${item.file.name}`}
                            onClick={() => setPreviewId(item.id)}
                            className="absolute inset-0 z-0 cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                          >
                            <span className="sr-only">{tp('preview')}</span>
                          </button>
                        )}

                        <div className="pointer-events-none relative z-10 flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-content-secondary">{item.file.name}</h3>
                            <p className="mt-1 text-xs text-content-muted">
                              {formatFileSize(item.file.size)} · {tp(`kinds.${item.inputKind}`)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded border px-2 py-1 text-xs ${
                              item.status === 'done'
                                ? 'border-border-base bg-surface-raised text-content-secondary'
                                : item.status === 'error'
                                  ? 'border-border-base bg-danger-surface text-danger-content'
                                  : 'border-border-subtle bg-surface-raised text-content-muted'
                            }`}
                          >
                            {tp(`status_${item.status}`)}
                          </span>
                        </div>

                        {item.status === 'done' && item.outputUrl && (
                          <div className="pointer-events-none relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs text-content-muted">
                            <span>
                              {tp('pages_value', { count: item.pageCount ?? 0 })} · {formatFileSize(item.outputSize ?? 0)}
                              {typeof item.durationMs === 'number' ? ` · ${tp('duration_value', { value: item.durationMs })}` : ''}
                            </span>
                            <div className="pointer-events-auto flex gap-2">
                              <Button
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  downloadItem(item);
                                }}
                              >
                                {tc('download')}
                              </Button>
                            </div>
                          </div>
                        )}

                        {item.status === 'error' && item.error && (
                          <p className="relative z-10 rounded border border-border-base bg-danger-surface px-3 py-2 text-xs leading-relaxed text-danger-content">
                            {getErrorMessage(item.error)}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>

                <div className="min-h-[28rem] flex-grow overflow-hidden rounded border border-border-input bg-surface-raised">
                  {selectedPreview?.outputUrl ? (
                    <iframe
                      key={selectedPreview.outputUrl}
                      title={tp('preview_title')}
                      src={selectedPreview.outputUrl}
                      className="h-full min-h-[28rem] w-full bg-surface"
                    />
                  ) : (
                    <div className="flex h-full min-h-[28rem] flex-col items-center justify-center px-6 text-center">
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                        PDF
                      </span>
                      <h3 className="text-base font-semibold text-content-secondary">{tp('preview_empty_title')}</h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                        {tp('preview_empty_body')}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
