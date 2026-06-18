'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import { inspectPdfFile, mergePdfFiles, type PdfOperationError } from '@/lib/utils/pdf-browser';
import { PDF_FILE_ACCEPT_VALUE } from '@/lib/utils/pdf';

type MergeItemStatus = 'loading' | 'ready' | 'error';

interface MergeItem {
  id: string;
  file: File;
  status: MergeItemStatus;
  pageCount?: number;
  error?: PdfOperationError;
}

interface MergeResult {
  url: string;
  filename: string;
  pageCount: number;
  outputSize: number;
  durationMs: number;
}

function createItemId(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}-${Date.now()}`;
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

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function PdfMergeTool() {
  const tc = useTranslations('common');
  const t = useTranslations('pdf_merge');
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MergeItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const readyItems = items.filter((item) => item.status === 'ready');
  const canMerge = readyItems.length >= 2 && !processing;

  useEffect(() => () => {
    if (result?.url) URL.revokeObjectURL(result.url);
  }, [result]);

  const getErrorMessage = useCallback((error: PdfOperationError): string => {
    switch (error.code) {
      case 'empty_file':
        return t('errors.empty_file');
      case 'unsupported_input':
        return t('errors.unsupported_input');
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: error.maxSize ?? '' });
      case 'load_failed':
        return t('errors.load_failed');
      default:
        return t('errors.general');
    }
  }, [t]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const selectedFiles = Array.from(fileList);
    if (selectedFiles.length === 0) return;

    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);

    const nextItems = selectedFiles.map((file, index) => ({
      id: createItemId(file, index),
      file,
      status: 'loading' as const,
    }));

    setItems((current) => [...current, ...nextItems]);

    nextItems.forEach((item) => {
      void inspectPdfFile(item.file).then((inspection) => {
        setItems((current) => current.map((currentItem) => {
          if (currentItem.id !== item.id) return currentItem;
          if (inspection.ok) {
            return { ...currentItem, status: 'ready', pageCount: inspection.pageCount };
          }
          return { ...currentItem, status: 'error', error: inspection };
        }));
      });
    });
  }, [result]);

  const clearItems = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setItems([]);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [result]);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  }, [result]);

  const moveBy = useCallback((id: string, delta: number) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const nextIndex = Math.max(0, Math.min(current.length - 1, index + delta));
      if (nextIndex === index) return current;
      return moveItem(current, index, nextIndex);
    });
  }, []);

  const merge = useCallback(async () => {
    if (!canMerge) return;
    setProcessing(true);
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);

    const merged = await mergePdfFiles(readyItems.map((item) => item.file), 'merged.pdf');
    setProcessing(false);

    if (merged.ok) {
      setResult({
        url: URL.createObjectURL(merged.blob),
        filename: merged.filename,
        pageCount: merged.pageCount,
        outputSize: merged.outputSize,
        durationMs: merged.durationMs,
      });
    }
  }, [canMerge, readyItems, result]);

  return (
    <ToolLayout toolId="pdf-merge">
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,460px)_1fr] xl:overflow-hidden">
        <Panel
          title={t('settings_title')}
          actions={<Button variant="secondary" onClick={clearItems} disabled={items.length === 0}>{tc('clear')}</Button>}
          className="min-h-[32rem] overflow-hidden xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto pr-1">
            <input
              ref={inputRef}
              type="file"
              accept={PDF_FILE_ACCEPT_VALUE}
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
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
                addFiles(event.dataTransfer.files);
              }}
              className={`group flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-5 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-muted transition-colors group-hover:border-border-strong group-hover:text-content-secondary">
                PDF
              </span>
              <span className="text-base font-semibold text-content-secondary">{t('drop_title')}</span>
              <span className="max-w-72 text-sm leading-relaxed text-content-muted">{t('drop_hint')}</span>
              <span className="rounded bg-action px-4 py-2 text-sm font-medium text-background transition-colors group-hover:bg-action-hover">
                {t('drop_action')}
              </span>
            </button>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-content-secondary">{t('order_title')}</span>
                <span className="text-xs text-content-faint">{t('ready_count', { count: readyItems.length })}</span>
              </div>

              {items.length === 0 ? (
                <p className="rounded border border-border-subtle bg-surface px-3 py-4 text-sm text-content-muted">
                  {t('empty_list')}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item, index) => (
                    <article
                      key={item.id}
                      draggable
                      onDragStart={() => setDragItemId(item.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!dragItemId || dragItemId === item.id) return;
                        setItems((current) => {
                          const fromIndex = current.findIndex((entry) => entry.id === dragItemId);
                          const toIndex = current.findIndex((entry) => entry.id === item.id);
                          return fromIndex >= 0 && toIndex >= 0 ? moveItem(current, fromIndex, toIndex) : current;
                        });
                        setDragItemId(null);
                      }}
                      className="rounded border border-border-base bg-surface p-3"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-content-secondary">
                            {index + 1}. {item.file.name}
                          </h3>
                          <p className="mt-1 text-xs text-content-muted">
                            {formatFileSize(item.file.size)}
                            {item.status === 'ready' && typeof item.pageCount === 'number' ? ` · ${t('pages_value', { count: item.pageCount })}` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 rounded border border-border-subtle bg-surface-raised px-2 py-1 text-xs text-content-muted">
                          {t(`status_${item.status}`)}
                        </span>
                      </div>

                      {item.status === 'error' && item.error && (
                        <p className="mt-2 rounded border border-border-base bg-danger-surface px-3 py-2 text-xs text-danger-content">
                          {getErrorMessage(item.error)}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => moveBy(item.id, -1)} disabled={index === 0}>
                          {t('move_up')}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => moveBy(item.id, 1)} disabled={index === items.length - 1}>
                          {t('move_down')}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>
                          {tc('delete')}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Panel>

        <Panel
          title={t('result_title')}
          actions={(
            <>
              <Button onClick={merge} disabled={!canMerge}>
                {processing ? t('processing') : t('merge_action')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => result && downloadUrl(result.url, result.filename)}
                disabled={!result}
              >
                {tc('download')}
              </Button>
            </>
          )}
          className="min-h-[32rem] overflow-hidden xl:min-h-0"
        >
          {result ? (
            <div className="flex min-h-0 flex-grow flex-col gap-4">
              <div className="rounded border border-border-base bg-surface-raised p-4">
                <h3 className="font-semibold text-content-secondary">{result.filename}</h3>
                <p className="mt-2 text-sm text-content-muted">
                  {t('result_summary', {
                    count: result.pageCount,
                    size: formatFileSize(result.outputSize),
                    duration: result.durationMs,
                  })}
                </p>
              </div>
              <iframe
                title={t('preview_title')}
                src={result.url}
                className="min-h-[26rem] flex-grow rounded border border-border-input bg-surface-raised"
              />
            </div>
          ) : (
            <div className="flex min-h-80 flex-grow flex-col items-center justify-center rounded border border-border-input bg-surface-raised px-6 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                PDF
              </span>
              <h3 className="text-base font-semibold text-content-secondary">{t('empty_result_title')}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-content-muted">{t('empty_result_body')}</p>
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
