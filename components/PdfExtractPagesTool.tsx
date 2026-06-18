'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatFileSize } from '@/lib/utils/image';
import {
  extractPdfPages,
  inspectPdfFile,
  type PdfFileInspectionSuccess,
  type PdfOperationError,
} from '@/lib/utils/pdf-browser';
import { parsePdfPageSelection, PDF_FILE_ACCEPT_VALUE } from '@/lib/utils/pdf';

interface ExtractResult {
  url: string;
  filename: string;
  pageCount: number;
  outputSize: number;
  durationMs: number;
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

export function PdfExtractPagesTool() {
  const tc = useTranslations('common');
  const t = useTranslations('pdf_extract');
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<PdfFileInspectionSuccess | null>(null);
  const [selectionInput, setSelectionInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ExtractResult | null>(null);

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
    setSelectionInput('');

    void inspectPdfFile(selectedFile).then((outcome) => {
      if (outcome.ok) {
        setInspection(outcome);
        setSelectionInput(outcome.pageCount > 2 ? `1,3-${outcome.pageCount}` : '1');
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
    setSelectionInput('');
    setError('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [result]);

  const extract = useCallback(async () => {
    if (!file || !inspection || processing) return;

    const selection = parsePdfPageSelection(selectionInput, inspection.pageCount);
    if (!selection.ok) {
      setError(selection.message);
      return;
    }

    setProcessing(true);
    setError('');
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);

    const extracted = await extractPdfPages(file, selection.pages);
    setProcessing(false);

    if (!extracted.ok) {
      setError(getErrorMessage(extracted));
      return;
    }

    setResult({
      url: URL.createObjectURL(extracted.blob),
      filename: extracted.filename,
      pageCount: extracted.pageCount,
      outputSize: extracted.outputSize,
      durationMs: extracted.durationMs,
    });
  }, [file, getErrorMessage, inspection, processing, result, selectionInput]);

  return (
    <ToolLayout toolId="pdf-extract-pages">
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
              <label htmlFor="pdf-extract-pages" className="text-sm font-semibold text-content-secondary">
                {t('selection_label')}
              </label>
              <input
                id="pdf-extract-pages"
                value={selectionInput}
                onChange={(event) => setSelectionInput(event.target.value)}
                className="mt-3 w-full rounded border border-border-input bg-surface px-3 py-2 font-mono text-sm text-content-secondary outline-none transition-colors placeholder:text-content-faint focus:border-border-strong focus:ring-2 focus:ring-action"
                placeholder={t('selection_placeholder')}
                disabled={!inspection}
              />
              <p className="mt-2 text-xs leading-relaxed text-content-faint">{t('selection_hint')}</p>
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
              <Button onClick={() => void extract()} disabled={!inspection || processing}>
                {processing ? t('processing') : t('extract_action')}
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
