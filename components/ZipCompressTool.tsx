'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from '@/components/ui/AppLink';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { zipCompressContent } from '@/lib/tools/content/zip-compress';
import { createZipCompression, type ZipCompressionOutcome } from '@/lib/utils/zip';
import { formatFileSize } from '@/lib/utils/image';

interface SelectedZipFile {
  id: string;
  file: File;
  path: string;
}

function getFilePath(file: File): string {
  const fileWithPath = file as File & { webkitRelativePath?: string };
  return fileWithPath.webkitRelativePath || file.name;
}

function createFileId(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

export function ZipCompressTool() {
  const t = useTranslations('tools.zip-compress');
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadUrlRef = useRef('');
  const [files, setFiles] = useState<SelectedZipFile[]>([]);
  const [outputName, setOutputName] = useState('archive.zip');
  const [level, setLevel] = useState(6);
  const [result, setResult] = useState<ZipCompressionOutcome | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalSize = useMemo(
    () => files.reduce((total, item) => total + item.file.size, 0),
    [files]
  );

  useEffect(() => () => {
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
  }, []);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const nextFiles = Array.from(fileList).map((file, index) => ({
      id: createFileId(file, index),
      file,
      path: getFilePath(file),
    }));
    setFiles(nextFiles);
    setResult(null);
  }

  async function handleCompress() {
    setIsProcessing(true);
    const outcome = await createZipCompression(
      files.map((item) => ({ filename: item.path, blob: item.file })),
      { outputName, level: level as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
    );
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    const nextUrl = outcome.ok ? URL.createObjectURL(outcome.blob) : '';
    downloadUrlRef.current = nextUrl;
    setDownloadUrl(nextUrl);
    setResult(outcome);
    setIsProcessing(false);
  }

  function clearFiles() {
    setFiles([]);
    setResult(null);
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    downloadUrlRef.current = '';
    setDownloadUrl('');
    if (inputRef.current) inputRef.current.value = '';
  }

  const errorMessage = result && !result.ok
    ? result.message || t(`errors.${result.code}`)
    : '';

  return (
    <ToolLayout toolId="zip-compress" content={zipCompressContent}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-border-subtle bg-surface p-3 text-sm">
        <span className="text-content-muted">{t('switch_hint')}</span>
        <Link
          href={`/${locale}/zip-extract`}
          className="inline-flex min-h-9 items-center justify-center rounded border border-border-base bg-surface-hover px-3 py-1.5 font-medium text-content-secondary transition-colors hover:border-border-strong"
        >
          {t('switch_to_extract')}
        </Link>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Panel
          title={t('input_title')}
          actions={
            <>
              <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                {t('choose_files')}
              </Button>
              <Button variant="secondary" onClick={clearFiles} disabled={files.length === 0 || isProcessing}>
                {t('clear')}
              </Button>
            </>
          }
        >
          <label
            className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-input bg-surface-raised p-6 text-center transition-colors hover:border-border-strong hover:bg-surface-hover"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <span className="font-medium text-content">{t('drop_title')}</span>
            <span className="mt-2 max-w-xl text-sm leading-relaxed text-content-muted">{t('drop_hint')}</span>
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <label className="flex min-w-0 flex-col gap-1 text-sm text-content-secondary">
              {t('filename_label')}
              <input
                value={outputName}
                onChange={(event) => setOutputName(event.target.value)}
                className="min-h-10 rounded border border-border-input bg-surface-raised px-3 text-content outline-none focus:border-border-strong"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-sm text-content-secondary">
              {t('level_label', { level })}
              <input
                type="range"
                min="0"
                max="9"
                value={level}
                onChange={(event) => setLevel(Number(event.target.value))}
                className="min-h-10 accent-action"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <div className="text-sm text-content-muted">
              {t('summary', { count: files.length, size: formatFileSize(totalSize) })}
            </div>
            <Button onClick={handleCompress} disabled={files.length === 0 || isProcessing}>
              {isProcessing ? t('compressing') : t('compress')}
            </Button>
          </div>
        </Panel>

        <Panel title={t('output_title')}>
          {files.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-auto rounded border border-border-subtle bg-surface-raised">
              {files.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border-subtle px-3 py-2 last:border-b-0">
                  <span className="min-w-0 truncate text-sm text-content-secondary">{item.path}</span>
                  <span className="shrink-0 text-xs text-content-muted">{formatFileSize(item.file.size)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center rounded border border-border-subtle bg-surface-raised p-6 text-center">
              <div className="font-medium text-content">{t('empty_title')}</div>
              <div className="mt-2 text-sm text-content-muted">{t('empty_body')}</div>
            </div>
          )}

          {errorMessage ? (
            <div className="mt-4 rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
              {errorMessage}
            </div>
          ) : null}

          {result?.ok ? (
            <div className="mt-4 rounded border border-border-subtle bg-surface-raised p-4">
              <div className="grid gap-2 text-sm text-content-secondary sm:grid-cols-2">
                <span>{t('result_files', { count: result.fileCount })}</span>
                <span>{t('result_original', { size: formatFileSize(result.originalSize) })}</span>
                <span>{t('result_output', { size: formatFileSize(result.outputSize) })}</span>
                <span>{t('result_duration', { ms: result.durationMs })}</span>
              </div>
              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  download={result.filename.endsWith('.zip') ? result.filename : `${result.filename}.zip`}
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded bg-action px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-action-hover"
                >
                  {t('download_zip')}
                </a>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </div>
    </ToolLayout>
  );
}
