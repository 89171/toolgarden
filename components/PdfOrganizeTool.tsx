'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import {
  inspectPdfFile,
  organizePdfPages,
  type PdfFileInspectionSuccess,
  type PdfOperationError,
  type PdfOrganizeEntry,
} from '@/lib/utils/pdf-browser';
import { PDF_FILE_ACCEPT_VALUE } from '@/lib/utils/pdf';

interface OrganizeResult {
  url: string;
  filename: string;
  pageCount: number;
  outputSize: number;
  durationMs: number;
}

function createPageEntry(sourcePageIndex: number, seed = Date.now()): PdfOrganizeEntry {
  return {
    id: `${sourcePageIndex}-${seed}-${Math.random().toString(16).slice(2)}`,
    sourcePageIndex,
  };
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

export function PdfOrganizeTool() {
  const tc = useTranslations('common');
  const t = useTranslations('pdf_organize');
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<PdfFileInspectionSuccess | null>(null);
  const [entries, setEntries] = useState<PdfOrganizeEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragEntryId, setDragEntryId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrganizeResult | null>(null);

  useEffect(() => () => {
    if (result?.url) URL.revokeObjectURL(result.url);
  }, [result]);

  const getErrorMessage = useCallback((operationError: PdfOperationError): string => {
    switch (operationError.code) {
      case 'empty_file':
        return t('errors.empty_file');
      case 'unsupported_input':
        return t('errors.unsupported_input');
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: operationError.maxSize ?? '' });
      case 'load_failed':
        return t('errors.load_failed');
      case 'empty_selection':
        return t('errors.empty_selection');
      default:
        return t('errors.general');
    }
  }, [t]);

  const resetResult = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  }, [result]);

  const loadFile = useCallback((selectedFile: File) => {
    resetResult();
    setFile(selectedFile);
    setInspection(null);
    setEntries([]);
    setError('');

    void inspectPdfFile(selectedFile).then((outcome) => {
      if (outcome.ok) {
        setInspection(outcome);
        setEntries(Array.from({ length: outcome.pageCount }, (_, index) => createPageEntry(index)));
      } else {
        setError(getErrorMessage(outcome));
      }
    });
  }, [getErrorMessage, resetResult]);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const selectedFile = Array.from(fileList)[0];
    if (selectedFile) loadFile(selectedFile);
  }, [loadFile]);

  const clear = useCallback(() => {
    resetResult();
    setFile(null);
    setInspection(null);
    setEntries([]);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, [resetResult]);

  const moveBy = useCallback((id: string, delta: number) => {
    resetResult();
    setEntries((current) => {
      const index = current.findIndex((entry) => entry.id === id);
      if (index < 0) return current;
      const nextIndex = Math.max(0, Math.min(current.length - 1, index + delta));
      return index === nextIndex ? current : moveItem(current, index, nextIndex);
    });
  }, [resetResult]);

  const duplicateEntry = useCallback((id: string) => {
    resetResult();
    setEntries((current) => {
      const index = current.findIndex((entry) => entry.id === id);
      if (index < 0) return current;
      const next = [...current];
      next.splice(index + 1, 0, createPageEntry(current[index].sourcePageIndex));
      return next;
    });
  }, [resetResult]);

  const deleteEntry = useCallback((id: string) => {
    resetResult();
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, [resetResult]);

  const restoreOriginal = useCallback(() => {
    resetResult();
    if (!inspection) return;
    setEntries(Array.from({ length: inspection.pageCount }, (_, index) => createPageEntry(index)));
  }, [inspection, resetResult]);

  const organize = useCallback(async () => {
    if (!file || entries.length === 0 || processing) return;

    setProcessing(true);
    setError('');
    resetResult();

    const organized = await organizePdfPages(file, entries);
    setProcessing(false);

    if (!organized.ok) {
      setError(getErrorMessage(organized));
      return;
    }

    setResult({
      url: URL.createObjectURL(organized.blob),
      filename: organized.filename,
      pageCount: organized.pageCount,
      outputSize: organized.outputSize,
      durationMs: organized.durationMs,
    });
  }, [entries, file, getErrorMessage, processing, resetResult]);

  return (
    <ToolLayout toolId="pdf-organize">
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(360px,520px)_1fr] xl:overflow-hidden">
        <Panel
          title={t('settings_title')}
          actions={(
            <>
              <Button variant="secondary" onClick={restoreOriginal} disabled={!inspection}>
                {t('restore_original')}
              </Button>
              <Button variant="secondary" onClick={clear} disabled={!file}>{tc('clear')}</Button>
            </>
          )}
          className="min-h-[34rem] overflow-hidden xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto pr-1">
            <input
              ref={inputRef}
              type="file"
              accept={PDF_FILE_ACCEPT_VALUE}
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
                handleFiles(event.dataTransfer.files);
              }}
              className={`group flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-5 py-6 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-xs font-semibold text-content-muted transition-colors group-hover:border-border-strong group-hover:text-content-secondary">
                PDF
              </span>
              <span className="text-base font-semibold text-content-secondary">{t('drop_title')}</span>
              <span className="max-w-72 text-sm leading-relaxed text-content-muted">{t('drop_hint')}</span>
            </button>

            {file && (
              <div className="rounded border border-border-base bg-surface-raised p-4">
                <h3 className="truncate text-sm font-semibold text-content-secondary">{file.name}</h3>
                <p className="mt-1 text-xs text-content-muted">
                  {formatFileSize(file.size)}
                  {inspection ? ` · ${t('pages_value', { count: inspection.pageCount })}` : ''}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-content-secondary">{t('pages_title')}</span>
                <span className="text-xs text-content-faint">{t('output_pages', { count: entries.length })}</span>
              </div>

              {entries.length === 0 ? (
                <p className="rounded border border-border-subtle bg-surface px-3 py-4 text-sm text-content-muted">
                  {t('empty_pages')}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {entries.map((entry, index) => (
                    <article
                      key={entry.id}
                      draggable
                      onDragStart={() => setDragEntryId(entry.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!dragEntryId || dragEntryId === entry.id) return;
                        resetResult();
                        setEntries((current) => {
                          const fromIndex = current.findIndex((item) => item.id === dragEntryId);
                          const toIndex = current.findIndex((item) => item.id === entry.id);
                          return fromIndex >= 0 && toIndex >= 0 ? moveItem(current, fromIndex, toIndex) : current;
                        });
                        setDragEntryId(null);
                      }}
                      className="rounded border border-border-base bg-surface p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-content-secondary">
                            {t('page_card_title', { output: index + 1 })}
                          </h3>
                          <p className="mt-1 text-xs text-content-muted">
                            {t('source_page', { source: entry.sourcePageIndex + 1 })}
                          </p>
                        </div>
                        <span className="rounded border border-border-subtle bg-surface-raised px-2 py-1 font-mono text-xs text-content-faint">
                          {index + 1}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => moveBy(entry.id, -1)} disabled={index === 0}>
                          {t('move_up')}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => moveBy(entry.id, 1)} disabled={index === entries.length - 1}>
                          {t('move_down')}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => duplicateEntry(entry.id)}>
                          {t('duplicate')}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => deleteEntry(entry.id)}>
                          {tc('delete')}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="rounded border border-border-base bg-danger-surface px-3 py-2 text-sm text-danger-content">
                {error}
              </p>
            )}
          </div>
        </Panel>

        <Panel
          title={t('result_title')}
          actions={(
            <>
              <Button onClick={() => void organize()} disabled={!file || entries.length === 0 || processing}>
                {processing ? t('processing') : t('organize_action')}
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
