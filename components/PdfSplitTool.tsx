'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import {
  inspectPdfFile,
  splitPdfFile,
  type PdfFileInspectionSuccess,
  type PdfOperationError,
  type PdfSplitFile,
} from '@/lib/utils/pdf-browser';
import { parsePdfPageGroups, PDF_FILE_ACCEPT_VALUE, type PdfPageGroup } from '@/lib/utils/pdf';
import { createZipArchive } from '@/lib/utils/zip';

interface SplitResult {
  url: string;
  filename: string;
  files: PdfSplitFile[];
  durationMs: number;
  size: number;
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

function groupsForEveryPage(pageCount: number): PdfPageGroup[] {
  return Array.from({ length: pageCount }, (_, index) => ({
    pages: [index],
    label: String(index + 1),
  }));
}

export function PdfSplitTool() {
  const tc = useTranslations('common');
  const t = useTranslations('pdf_split');
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<PdfFileInspectionSuccess | null>(null);
  const [error, setError] = useState<string>('');
  const [rangeInput, setRangeInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);

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

  const loadFile = useCallback((selectedFile: File) => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setFile(selectedFile);
    setInspection(null);
    setError('');
    setRangeInput('');

    void inspectPdfFile(selectedFile).then((outcome) => {
      if (outcome.ok) {
        setInspection(outcome);
        setRangeInput(outcome.pageCount > 1 ? `1-${Math.min(2, outcome.pageCount)}; ${Math.min(3, outcome.pageCount)}-${outcome.pageCount}` : '1');
      } else {
        setError(getErrorMessage(outcome));
      }
    });
  }, [getErrorMessage, result]);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const selectedFile = Array.from(fileList)[0];
    if (selectedFile) loadFile(selectedFile);
  }, [loadFile]);

  const clear = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setInspection(null);
    setError('');
    setRangeInput('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [result]);

  const runSplit = useCallback(async (mode: 'ranges' | 'every-page') => {
    if (!file || !inspection || processing) return;

    const parsedGroups = mode === 'every-page'
      ? { ok: true as const, groups: groupsForEveryPage(inspection.pageCount) }
      : parsePdfPageGroups(rangeInput, inspection.pageCount);

    if (!parsedGroups.ok) {
      setError(parsedGroups.message);
      return;
    }

    setProcessing(true);
    setError('');
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);

    const split = await splitPdfFile(file, parsedGroups.groups);
    setProcessing(false);

    if (!split.ok) {
      setError(getErrorMessage(split));
      return;
    }

    const zipBlob = await createZipArchive(split.files.map((entry) => ({
      filename: entry.filename,
      blob: entry.blob,
    })));
    const zipUrl = URL.createObjectURL(zipBlob);

    setResult({
      url: zipUrl,
      filename: `${file.name.replace(/\.[^.]+$/, '') || 'document'}-split.zip`,
      files: split.files,
      durationMs: split.durationMs,
      size: zipBlob.size,
    });
  }, [file, getErrorMessage, inspection, processing, rangeInput, result]);

  return (
    <ToolLayout toolId="pdf-split">
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,460px)_1fr] xl:overflow-hidden">
        <Panel
          title={t('settings_title')}
          actions={<Button variant="secondary" onClick={clear} disabled={!file}>{tc('clear')}</Button>}
          className="min-h-[32rem] overflow-hidden xl:min-h-0"
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

            {file && (
              <div className="rounded border border-border-base bg-surface-raised p-4">
                <h3 className="truncate text-sm font-semibold text-content-secondary">{file.name}</h3>
                <p className="mt-1 text-xs text-content-muted">
                  {formatFileSize(file.size)}
                  {inspection ? ` · ${t('pages_value', { count: inspection.pageCount })}` : ''}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border-base bg-surface-raised p-4">
              <label htmlFor="pdf-split-ranges" className="text-sm font-semibold text-content-secondary">
                {t('ranges_label')}
              </label>
              <textarea
                id="pdf-split-ranges"
                value={rangeInput}
                onChange={(event) => setRangeInput(event.target.value)}
                rows={4}
                className="mt-3 w-full resize-none rounded border border-border-input bg-surface px-3 py-2 font-mono text-sm text-content-secondary outline-none transition-colors placeholder:text-content-faint focus:border-border-strong focus:ring-2 focus:ring-action"
                placeholder={t('ranges_placeholder')}
                disabled={!inspection}
              />
              <p className="mt-2 text-xs leading-relaxed text-content-faint">{t('ranges_hint')}</p>
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
              <Button onClick={() => void runSplit('ranges')} disabled={!inspection || processing}>
                {processing ? t('processing') : t('split_ranges')}
              </Button>
              <Button variant="secondary" onClick={() => void runSplit('every-page')} disabled={!inspection || processing}>
                {t('split_every_page')}
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
            <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto">
              <div className="rounded border border-border-base bg-surface-raised p-4">
                <h3 className="font-semibold text-content-secondary">{result.filename}</h3>
                <p className="mt-2 text-sm text-content-muted">
                  {t('result_summary', {
                    count: result.files.length,
                    size: formatFileSize(result.size),
                    duration: result.durationMs,
                  })}
                </p>
              </div>
              <div className="rounded border border-border-input bg-surface-raised">
                {result.files.map((entry, index) => (
                  <div key={entry.filename} className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-content-secondary">{index + 1}. {entry.filename}</p>
                      <p className="mt-1 text-xs text-content-muted">
                        {t('part_summary', { pages: entry.pageCount, range: entry.label })}
                      </p>
                    </div>
                    <span className="shrink-0 rounded border border-border-subtle bg-surface px-2 py-1 text-xs text-content-muted">
                      PDF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 flex-grow flex-col items-center justify-center rounded border border-border-input bg-surface-raised px-6 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                ZIP
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
