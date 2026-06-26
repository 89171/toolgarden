'use client';

/* eslint-disable @next/next/no-img-element -- Image previews use local blob URLs and data URLs. */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
import { ToolLayout } from '@/components/ToolLayout';
import { ToolSwitchLinks } from '@/components/ToolSwitchLinks';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  base64ToImage,
  imageFileToBase64,
  type Base64ToImageSuccess,
  type ImageBase64Error,
  type ImageToBase64Success,
} from '@/lib/utils/image-base64';
import { formatFileSize, getImageAcceptValue, getSupportedImageInputLabel } from '@/lib/utils/image';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
}

function getTextFilename(filename: string) {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}.base64.txt`;
}

function isImageClipboardFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(?:jpe?g|png|webp|gif|bmp|svg|avif)$/i.test(file.name);
}

function Base64ToolSwitcher({ current }: { current: 'to-base64' | 'to-image' }) {
  const locale = useLocale();
  const t = useTranslations('image_base64');

  return (
    <ToolSwitchLinks
      ariaLabel={t('switcher_label')}
      currentKey={current}
      links={[
        {
          key: 'to-base64',
          href: `/${locale}/image/to-base64`,
          label: t('to_base64_link'),
        },
        {
          key: 'to-image',
          href: `/${locale}/image/base64-to-image`,
          label: t('to_image_link'),
        },
      ]}
    />
  );
}

export function ImageToBase64Tool() {
  const tc = useTranslations('common');
  const t = useTranslations('image_base64');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ImageToBase64Success | null>(null);
  const [error, setError] = useState<ImageBase64Error | null>(null);
  const [copied, setCopied] = useState<'dataUrl' | 'raw' | null>(null);
  const accept = getImageAcceptValue();

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  const getErrorMessage = useCallback((nextError: ImageBase64Error): string => {
    switch (nextError.code) {
      case 'empty_file':
        return t('errors.empty_file');
      case 'unsupported_input':
        return t('errors.unsupported_input', { type: nextError.detail ?? t('unknown_type') });
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: nextError.maxSize ?? '' });
      case 'read_failed':
        return t('errors.read_failed');
      default:
        return t('errors.general');
    }
  }, [t]);

  const clear = useCallback(() => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setResult(null);
    setError(null);
    setCopied(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [sourceUrl]);

  const handleFile = useCallback(async (file: File) => {
    const nextUrl = URL.createObjectURL(file);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(nextUrl);
    setResult(null);
    setError(null);
    setCopied(null);

    const outcome = await imageFileToBase64(file);
    if (outcome.ok) {
      setResult(outcome);
    } else {
      setError(outcome);
    }
  }, [sourceUrl]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = Array.from(files).find(isImageClipboardFile);
    if (file) void handleFile(file);
  }, [handleFile]);

  const copyText = useCallback(async (text: string, kind: 'dataUrl' | 'raw') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter(isImageClipboardFile);
      if (files.length === 0) return;
      event.preventDefault();
      void handleFile(files[0]);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  return (
    <ToolLayout toolId="image-to-base64">
      <Base64ToolSwitcher current="to-base64" />
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,440px)_1fr] xl:overflow-hidden">
        <Panel
          title={t('to_settings_title')}
          actions={<Button variant="secondary" onClick={clear} disabled={!sourceUrl && !result}>{tc('clear')}</Button>}
          className="h-[min(34rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-contain pr-1 sm:gap-5">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
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
              aria-label={t('choose_image')}
              className={`group flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors sm:min-h-64 sm:p-6 ${
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="text-base font-semibold text-content sm:text-lg">{t('image_drop_title')}</span>
              <span className="max-w-80 text-xs leading-relaxed text-content-muted sm:text-sm">
                {t('image_drop_hint', { formats: getSupportedImageInputLabel() })}
              </span>
              <span className="rounded bg-action px-3 py-1.5 text-sm font-medium text-background transition-colors group-hover:bg-action-hover sm:px-4 sm:py-2">
                {t('choose_image')}
              </span>
            </button>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3 sm:p-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {t('input_formats')}
              </span>
              <p className="text-sm leading-relaxed text-content-muted">
                {getSupportedImageInputLabel()}
              </p>
            </div>

            <p className="border-t border-border-subtle pt-3 text-xs leading-relaxed text-content-faint">
              {t('local_note')}
            </p>

            {result && (
              <div className="grid grid-cols-1 gap-3 border-t border-border-subtle pt-3 text-sm text-content-muted sm:grid-cols-2">
                <div>
                  <span className="block text-xs text-content-faint">{t('mime_type')}</span>
                  <span className="font-mono text-content-secondary">{result.mimeType}</span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{t('source_size')}</span>
                  <span className="text-content-secondary">{formatFileSize(result.size)}</span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{t('dimensions')}</span>
                  <span className="text-content-secondary">
                    {result.width && result.height ? `${result.width} x ${result.height}` : '--'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{t('base64_length')}</span>
                  <span className="text-content-secondary">{result.base64.length}</span>
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title={t('to_results_title')}
          actions={(
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => result && void copyText(result.dataUrl, 'dataUrl')}
                disabled={!result}
              >
                {copied === 'dataUrl' ? tc('copied') : t('copy_data_url')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => result && void copyText(result.base64, 'raw')}
                disabled={!result}
              >
                {copied === 'raw' ? tc('copied') : t('copy_raw_base64')}
              </Button>
              <Button onClick={() => result && downloadText(result.dataUrl, getTextFilename(result.filename))} disabled={!result}>
                {t('download_txt')}
              </Button>
            </div>
          )}
          className="min-h-[28rem] xl:min-h-0"
        >
          {error ? (
            <p className="rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
              {getErrorMessage(error)}
            </p>
          ) : result ? (
            <div className="flex min-h-0 flex-grow flex-col gap-4">
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded border border-border-base bg-surface-raised">
                  {sourceUrl && <img src={sourceUrl} alt={result.filename} className="h-full w-full object-contain" />}
                </div>
                <div className="min-w-0 rounded border border-border-input bg-surface-raised p-3">
                  <p className="mb-2 text-xs font-medium text-content-faint">{t('data_url_label')}</p>
                  <textarea
                    value={result.dataUrl}
                    readOnly
                    spellCheck={false}
                    className="h-72 w-full resize-none overflow-auto rounded border border-border-input bg-surface p-3 font-mono text-xs leading-relaxed text-content-secondary outline-none sm:h-96"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="grid w-full max-w-md grid-cols-2 gap-3">
                <div className="aspect-[4/3] rounded border border-border-subtle bg-surface" />
                <div className="aspect-[4/3] rounded border border-border-base bg-surface-hover" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-content">{t('to_empty_title')}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                  {t('to_empty_body')}
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}

export function Base64ToImageTool() {
  const tc = useTranslations('common');
  const t = useTranslations('image_base64');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Base64ToImageSuccess | null>(null);
  const [error, setError] = useState<ImageBase64Error | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isOutputPreviewOpen, setIsOutputPreviewOpen] = useState(false);

  useEffect(() => () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }, [outputUrl]);

  const getErrorMessage = useCallback((nextError: ImageBase64Error): string => {
    switch (nextError.code) {
      case 'empty_input':
        return t('errors.empty_input');
      case 'invalid_base64':
        return t('errors.invalid_base64');
      case 'unsupported_input':
        return t('errors.unsupported_input', { type: nextError.detail ?? t('unknown_type') });
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: nextError.maxSize ?? '' });
      default:
        return t('errors.general');
    }
  }, [t]);

  const clear = useCallback(() => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setResult(null);
    setError(null);
    setIsOutputPreviewOpen(false);
    setInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [outputUrl]);

  const decodeInput = useCallback(async (value: string) => {
    const outcome = await base64ToImage(value);
    if (outcome.ok) {
      const nextUrl = URL.createObjectURL(outcome.blob);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(nextUrl);
      setResult(outcome);
      setError(null);
      setIsOutputPreviewOpen(false);
    } else {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
      setResult(null);
      setError(outcome);
      setIsOutputPreviewOpen(false);
    }
  }, [outputUrl]);

  const loadTextFile = useCallback(async (file: File) => {
    const text = await file.text();
    setInput(text);
    await decodeInput(text);
  }, [decodeInput]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (!text.trim()) return;
      setInput(text);
      void decodeInput(text);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [decodeInput]);

  return (
    <ToolLayout toolId="base64-to-image">
      <Base64ToolSwitcher current="to-image" />
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(340px,520px)_1fr] xl:overflow-hidden">
        <Panel
          title={t('from_settings_title')}
          actions={<Button variant="secondary" onClick={clear} disabled={!input && !result}>{tc('clear')}</Button>}
          className="h-[min(38rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-contain pr-1 sm:gap-5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.base64,text/plain"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void loadTextFile(file);
              }}
            />

            <div
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
                const file = event.dataTransfer.files[0];
                if (file) void loadTextFile(file);
              }}
              className={`rounded-lg border border-dashed p-3 transition-colors sm:p-4 ${
                dragging
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="base64-image-input" className="text-sm font-medium text-content-secondary">
                  {t('base64_input_label')}
                </label>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  {t('choose_text_file')}
                </Button>
              </div>
              <textarea
                id="base64-image-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onPaste={(event) => {
                  const text = event.clipboardData.getData('text/plain');
                  if (!text.trim()) return;
                  window.setTimeout(() => void decodeInput(text), 0);
                }}
                spellCheck={false}
                placeholder={t('base64_placeholder')}
                className="h-80 w-full resize-none overflow-auto rounded border border-border-input bg-surface p-3 font-mono text-xs leading-relaxed text-content-secondary outline-none focus:border-border-strong"
              />
              <p className="mt-2 text-xs leading-relaxed text-content-faint">
                {t('base64_drop_hint')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" size="md" onClick={() => void decodeInput(input)} disabled={!input.trim()}>
                {t('decode_action')}
              </Button>
              <Button variant="secondary" size="md" onClick={clear} disabled={!input && !result}>
                {tc('clear')}
              </Button>
            </div>

            <p className="border-t border-border-subtle pt-3 text-xs leading-relaxed text-content-faint">
              {t('local_note')}
            </p>
          </div>
        </Panel>

        <Panel
          title={t('from_results_title')}
          actions={(
            <Button onClick={() => result && downloadBlob(result.blob, result.filename)} disabled={!result}>
              {t('download_image')}
            </Button>
          )}
          className="min-h-[28rem] xl:min-h-0"
        >
          {error ? (
            <p className="rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
              {getErrorMessage(error)}
            </p>
          ) : result && outputUrl ? (
            <div className="flex min-h-0 flex-grow flex-col gap-4">
              <div className="flex min-h-80 items-center justify-center overflow-hidden rounded border border-border-base bg-surface-raised p-3">
                <button
                  type="button"
                  aria-label={t('preview_open_output')}
                  onClick={() => setIsOutputPreviewOpen(true)}
                  className="flex h-full w-full cursor-zoom-in items-center justify-center transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                >
                  <img src={outputUrl} alt={result.filename} className="max-h-[26rem] max-w-full object-contain" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-border-subtle pt-3 text-sm text-content-muted sm:grid-cols-4">
                <div>
                  <span className="block text-xs text-content-faint">{t('mime_type')}</span>
                  <span className="font-mono text-content-secondary">{result.mimeType}</span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{t('output_size')}</span>
                  <span className="text-content-secondary">{formatFileSize(result.size)}</span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{t('dimensions')}</span>
                  <span className="text-content-secondary">
                    {result.width && result.height ? `${result.width} x ${result.height}` : '--'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-content-faint">{t('base64_length')}</span>
                  <span className="text-content-secondary">{result.base64.length}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="aspect-[4/3] w-full max-w-md rounded border border-border-base bg-surface-hover" />
              <div>
                <h2 className="text-lg font-semibold text-content">{t('from_empty_title')}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
                  {t('from_empty_body')}
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>
      <ImagePreviewDialog
        open={Boolean(isOutputPreviewOpen && outputUrl && result)}
        src={outputUrl ?? undefined}
        alt={result?.filename ?? t('from_results_title')}
        title={t('preview_title')}
        closeLabel={t('preview_close')}
        onClose={() => setIsOutputPreviewOpen(false)}
      />
    </ToolLayout>
  );
}
