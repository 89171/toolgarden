'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { PDF_FILE_ACCEPT_VALUE } from '@/lib/utils/pdf';
import {
  convertPdfToWord,
  type PdfToWordError,
  type PdfToWordProgress,
} from '@/lib/utils/pdf-to-word';
import { formatFileSize } from '@/lib/utils/image';
import type { OcrLanguage } from '@/lib/utils/ocr';
import { pdfToWordContent } from '@/lib/tools/content/pdf-to-word';

type ConversionStatus = 'idle' | 'converting' | 'done' | 'error';
const OCR_LANGUAGE_OPTIONS: OcrLanguage[] = ['eng', 'chi_sim', 'chi_tra', 'jpn'];

interface WordResult {
  blob: Blob;
  url: string;
  filename: string;
  pageCount: number;
  paragraphCount: number;
  imageCount: number;
  nativePageCount: number;
  ocrPageCount: number;
  visualPageCount: number;
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

export function PdfToWordConverter() {
  const locale = useLocale();
  const tc = useTranslations('common');
  const t = useTranslations('pdf_to_word');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [error, setError] = useState<PdfToWordError | null>(null);
  const [result, setResult] = useState<WordResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>(
    locale.startsWith('zh') ? 'chi_sim' : 'eng'
  );
  const [progress, setProgress] = useState<PdfToWordProgress | null>(null);

  useEffect(() => () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, []);

  const clear = useCallback(() => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setFile(null);
    setStatus('idle');
    setError(null);
    setResult(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const getErrorMessage = useCallback((conversionError: PdfToWordError): string => {
    switch (conversionError.code) {
      case 'empty_file':
        return t('errors.empty_file');
      case 'unsupported_input':
        return t('errors.unsupported_input');
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: conversionError.maxSize ?? '' });
      case 'empty_text':
        return t('errors.empty_text');
      case 'render_failed':
        return t('errors.render_failed');
      case 'load_failed':
      default:
        return t('errors.load_failed');
    }
  }, [t]);

  const convertFile = useCallback(async (selectedFile: File) => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setFile(selectedFile);
    setStatus('converting');
    setError(null);
    setResult(null);
    setProgress({ stage: 'loading', percent: 0 });

    const outcome = await convertPdfToWord(selectedFile, {
      ocrLanguage,
      onProgress: setProgress,
    });

    if (outcome.ok) {
      const url = URL.createObjectURL(outcome.blob);
      resultUrlRef.current = url;
      setResult({
        blob: outcome.blob,
        url,
        filename: outcome.filename,
        pageCount: outcome.pageCount,
        paragraphCount: outcome.paragraphCount,
        imageCount: outcome.imageCount,
        nativePageCount: outcome.nativePageCount,
        ocrPageCount: outcome.ocrPageCount,
        visualPageCount: outcome.visualPageCount,
        outputSize: outcome.outputSize,
        durationMs: outcome.durationMs,
      });
      setStatus('done');
      setProgress(null);
    } else {
      setError(outcome);
      setStatus('error');
      setProgress(null);
    }
  }, [ocrLanguage]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const selectedFile = Array.from(fileList)[0];
    if (!selectedFile) return;
    void convertFile(selectedFile);
  }, [convertFile]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    downloadUrl(result.url, result.filename);
  }, [result]);

  const canDownload = status === 'done' && Boolean(result);

  return (
    <ToolLayout toolId="pdf-to-word" content={pdfToWordContent}>
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,440px)_1fr] xl:overflow-hidden">
        <Panel
          title={t('settings_title')}
          actions={<Button variant="secondary" onClick={clear} disabled={status === 'idle'}>{tc('clear')}</Button>}
          className="h-[min(34rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-auto pr-1 sm:gap-5">
            <input
              ref={inputRef}
              type="file"
              accept={PDF_FILE_ACCEPT_VALUE}
              className="hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
              }}
            />

            <div className="rounded-lg border border-border-base bg-surface-raised p-3 sm:p-4">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {t('input_format')}
              </span>
              <span className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-muted">
                PDF
              </span>
            </div>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3 sm:p-4">
              <label
                htmlFor="pdf-to-word-ocr-language"
                className="block text-xs font-semibold uppercase tracking-normal text-content-faint"
              >
                {t('ocr_language_label')}
              </label>
              <select
                id="pdf-to-word-ocr-language"
                value={ocrLanguage}
                disabled={status === 'converting'}
                onChange={(event) => setOcrLanguage(event.target.value as OcrLanguage)}
                className="mt-2 w-full rounded border border-border-input bg-surface px-3 py-2 text-sm text-content disabled:cursor-not-allowed disabled:opacity-60"
              >
                {OCR_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`ocr_language_${option}`)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-content-muted">
                {t('ocr_language_hint')}
              </p>
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
                DOC
              </span>
              <span className="text-base font-semibold text-content">{t('drop_title')}</span>
              <span className="max-w-sm text-sm leading-relaxed text-content-muted">{t('drop_hint')}</span>
              <span className="rounded bg-action px-3 py-1.5 text-sm font-medium text-white transition-colors group-hover:bg-action-hover">
                {t('drop_action')}
              </span>
            </button>

            {file ? (
              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <span className="block text-xs font-semibold uppercase tracking-normal text-content-faint">
                  {t('selected_file')}
                </span>
                <span className="mt-2 block truncate text-sm font-medium text-content-secondary">{file.name}</span>
                <span className="mt-1 block text-xs text-content-muted">{formatFileSize(file.size)}</span>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel
          title={t('result_title')}
          actions={<Button onClick={downloadResult} disabled={!canDownload}>{tc('download')}</Button>}
          className="min-h-[28rem] overflow-hidden xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col overflow-hidden rounded-lg border border-border-base bg-surface-raised">
            {status === 'idle' ? (
              <div className="flex flex-grow flex-col items-center justify-center p-8 text-center">
                <span className="font-mono text-sm font-semibold text-content-faint">DOCX</span>
                <h3 className="mt-3 text-lg font-semibold text-content">{t('empty_title')}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-content-muted">{t('empty_body')}</p>
              </div>
            ) : null}

            {status === 'converting' ? (
              <div className="flex flex-grow flex-col items-center justify-center p-8 text-center">
                <span className="font-mono text-sm font-semibold text-content-faint">...</span>
                <h3 className="mt-3 text-lg font-semibold text-content">{t('status_converting')}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                  {progress
                    ? t('progress_label', {
                        stage: t(`stages.${progress.stage}`),
                        progress: progress.percent,
                      })
                    : t('converting_body')}
                </p>
              </div>
            ) : null}

            {status === 'error' && error ? (
              <div className="flex flex-grow flex-col items-center justify-center p-8 text-center">
                <span className="font-mono text-sm font-semibold text-danger-content">ERR</span>
                <h3 className="mt-3 text-lg font-semibold text-content">{t('status_error')}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-content-muted">{getErrorMessage(error)}</p>
              </div>
            ) : null}

            {status === 'done' && result ? (
              <div className="flex flex-grow flex-col p-5">
                <div className="rounded-lg border border-border-base bg-surface p-4">
                  <span className="block text-xs font-semibold uppercase tracking-normal text-content-faint">
                    {t('ready_label')}
                  </span>
                  <h3 className="mt-2 break-all text-lg font-semibold text-content">{result.filename}</h3>
                  <p className="mt-2 text-sm text-content-muted">
                    {t('result_summary', {
                      pages: result.pageCount,
                      paragraphs: result.paragraphCount,
                      images: result.imageCount,
                      size: formatFileSize(result.outputSize),
                      duration: result.durationMs,
                    })}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-content-faint">
                    {t('routing_summary', {
                      native: result.nativePageCount,
                      ocr: result.ocrPageCount,
                      visual: result.visualPageCount,
                    })}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{t('summary_pages')}</span>
                    <span className="mt-1 block font-semibold text-content">{result.pageCount}</span>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{t('summary_paragraphs')}</span>
                    <span className="mt-1 block font-semibold text-content">{result.paragraphCount}</span>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{t('summary_images')}</span>
                    <span className="mt-1 block font-semibold text-content">{result.imageCount}</span>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <span className="block text-xs text-content-faint">{t('summary_size')}</span>
                    <span className="mt-1 block font-semibold text-content">{formatFileSize(result.outputSize)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
