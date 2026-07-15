'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  formatFontCodePointLabel,
  formatFontFileSize,
  getFontSubsetAcceptValue,
  getSupportedFontInputLabel,
  getUniqueSubsetCharacters,
  subsetFontFile,
  type FontSubsetFailure,
  type FontSubsetFormat,
  type FontSubsetSuccess,
} from '@/lib/utils/font-subset';

type FontSubsetOutputState = FontSubsetSuccess & {
  url: string;
  fontFamily: string;
};

const OUTPUT_FORMATS: FontSubsetFormat[] = ['woff', 'ttf'];
const SAMPLE_TEXT = 'ToolGarden 字体子集工具 你好，世界 0123456789 ABC';

function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 0);
}

function getFontMimeType(format: FontSubsetFormat): string {
  return format === 'woff' ? 'font/woff' : 'font/ttf';
}

function formatSavedRatio(value: number): string {
  return `${Math.max(-999, Math.min(100, value * 100)).toFixed(1)}%`;
}

function formatCharacterList(characters: string[], limit = 24): string {
  const visible = characters.slice(0, limit).map(formatFontCodePointLabel);
  const suffix = characters.length > limit ? ` +${characters.length - limit}` : '';
  return `${visible.join(' / ')}${suffix}`;
}

export function FontSubsetTool() {
  const t = useTranslations('font_subset');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputUrlRef = useRef<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [characters, setCharacters] = useState('');
  const [outputFormat, setOutputFormat] = useState<FontSubsetFormat>('woff');
  const [keepHinting, setKeepHinting] = useState(false);
  const [keepKerning, setKeepKerning] = useState(false);
  const [output, setOutput] = useState<FontSubsetOutputState | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const accept = getFontSubsetAcceptValue();
  const supportedFormats = getSupportedFontInputLabel();
  const uniqueCharacters = useMemo(() => getUniqueSubsetCharacters(characters), [characters]);
  const previewText = useMemo(() => uniqueCharacters.join('').slice(0, 180), [uniqueCharacters]);

  const clearOutput = useCallback(() => {
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
    setOutput((current) => (current ? null : current));
  }, []);

  useEffect(() => () => {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
  }, []);

  const getErrorMessage = useCallback((failure: FontSubsetFailure): string => {
    switch (failure.code) {
      case 'empty_file':
        return t('errors.empty_file');
      case 'unsupported_input':
        return t('errors.unsupported_input', { type: failure.detail || supportedFormats });
      case 'file_too_large':
        return t('errors.file_too_large', { maxSize: failure.maxSize ?? '' });
      case 'empty_chars':
        return t('errors.empty_chars');
      case 'parse_failed':
        return t('errors.parse_failed');
      case 'no_glyphs':
        return t('errors.no_glyphs');
      case 'render_failed':
      default:
        return t('errors.render_failed');
    }
  }, [supportedFormats, t]);

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const selected = Array.from(fileList)[0];
    if (!selected) return;

    clearOutput();
    setError('');
    setFile(selected);
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFiles(event.target.files);
  }, [handleFiles]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) handleFiles(event.dataTransfer.files);
  }, [handleFiles]);

  const handleGenerate = useCallback(async () => {
    if (!file) {
      setError(t('errors.no_file'));
      return;
    }

    setIsProcessing(true);
    setError('');
    clearOutput();

    const result = await subsetFontFile(file, {
      outputFormat,
      characters,
      keepHinting,
      keepKerning,
    });

    if (!result.ok) {
      setError(getErrorMessage(result));
      setIsProcessing(false);
      return;
    }

    const blob = new Blob([result.output], { type: getFontMimeType(result.outputFormat) });
    const url = URL.createObjectURL(blob);
    outputUrlRef.current = url;
    setOutput({
      ...result,
      url,
      fontFamily: `font-subset-preview-${Date.now()}`,
    });
    setIsProcessing(false);
  }, [characters, clearOutput, file, getErrorMessage, keepHinting, keepKerning, outputFormat, t]);

  const handleClear = useCallback(() => {
    clearOutput();
    setError('');
    setFile(null);
    setCharacters('');
    setKeepHinting(false);
    setKeepKerning(false);
    setOutputFormat('woff');
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput]);

  const handleDownload = useCallback(() => {
    if (output) downloadUrl(output.url, output.filename);
  }, [output]);

  return (
    <ToolLayout toolId="font-subset">
      {output ? (
        <style>
          {`@font-face{font-family:${JSON.stringify(output.fontFamily)};src:url(${JSON.stringify(output.url)}) format("${output.outputFormat === 'woff' ? 'woff' : 'truetype'}");font-display:block;}`}
        </style>
      ) : null}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Panel
          title={t('input_title')}
          actions={
            <Button variant="secondary" onClick={handleClear} disabled={isProcessing}>
              {t('clear')}
            </Button>
          }
          className="lg:min-h-0"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={clsx(
                'flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-base bg-surface-raised p-5 text-center transition-colors hover:border-border-strong hover:bg-surface-hover',
                isDragging && 'border-border-strong bg-surface-hover'
              )}
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleInputChange}
              />
              <p className="text-base font-semibold text-content">{file ? file.name : t('drop_title')}</p>
              <p className="mt-2 text-sm text-content-muted">
                {file ? `${formatFontFileSize(file.size)} · ${file.type || supportedFormats}` : t('drop_hint', { formats: supportedFormats })}
              </p>
              <Button type="button" variant="secondary" className="mt-4">
                {t('drop_action')}
              </Button>
            </div>

            <label className="flex min-h-0 flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-content-secondary">{t('characters_label')}</span>
              <textarea
                value={characters}
                onChange={(event) => {
                  clearOutput();
                  setCharacters(event.target.value);
                }}
                spellCheck={false}
                className="min-h-56 flex-1 resize-none rounded-lg border border-border-input bg-background p-3 font-mono text-sm leading-relaxed text-content outline-none transition-colors placeholder:text-content-faint focus:border-border-strong"
                placeholder={t('characters_placeholder')}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-raised p-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{t('unique_count')}</p>
                <p className="mt-1 font-mono text-sm text-content-secondary">
                  {t('unique_count_value', { count: uniqueCharacters.length })}
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => {
                clearOutput();
                setCharacters(SAMPLE_TEXT);
              }}>
                {t('load_sample')}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title={t('output_title')}
          actions={
            <>
              <Button variant="secondary" onClick={handleDownload} disabled={!output || isProcessing}>
                {t('download')}
              </Button>
              <Button onClick={handleGenerate} disabled={isProcessing}>
                {isProcessing ? t('processing') : t('generate')}
              </Button>
            </>
          }
          className="lg:min-h-0"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <fieldset className="rounded-lg border border-border-subtle bg-surface-raised p-3">
                <legend className="px-1 text-sm font-medium text-content-secondary">{t('output_format')}</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {OUTPUT_FORMATS.map((format) => (
                    <label
                      key={format}
                      className={clsx(
                        'flex cursor-pointer items-center justify-center rounded border px-3 py-2 text-sm font-medium uppercase transition-colors',
                        outputFormat === format
                          ? 'border-border-strong bg-action-muted text-content'
                          : 'border-border-base bg-background text-content-secondary hover:bg-surface-hover'
                      )}
                    >
                      <input
                        type="radio"
                        name="font-output-format"
                        value={format}
                        checked={outputFormat === format}
                        onChange={() => {
                          clearOutput();
                          setOutputFormat(format);
                        }}
                        className="sr-only"
                      />
                      {format}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-lg border border-border-subtle bg-surface-raised p-3">
                <legend className="px-1 text-sm font-medium text-content-secondary">{t('font_tables')}</legend>
                <div className="mt-2 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm text-content-secondary">
                    <input
                      type="checkbox"
                      checked={keepHinting}
                      onChange={(event) => {
                        clearOutput();
                        setKeepHinting(event.target.checked);
                      }}
                      className="h-4 w-4 accent-action"
                    />
                    {t('keep_hinting')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-content-secondary">
                    <input
                      type="checkbox"
                      checked={keepKerning}
                      onChange={(event) => {
                        clearOutput();
                        setKeepKerning(event.target.checked);
                      }}
                      className="h-4 w-4 accent-action"
                    />
                    {t('keep_kerning')}
                  </label>
                </div>
              </fieldset>
            </div>

            {error ? (
              <div className="rounded-lg border border-danger-surface bg-danger-surface p-3 text-sm text-danger-content">
                {error}
              </div>
            ) : null}

            {output ? (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-border-subtle bg-background p-3">
                    <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{t('original_size')}</p>
                    <p className="mt-1 font-mono text-content">{formatFontFileSize(output.inputSize)}</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-background p-3">
                    <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{t('output_size')}</p>
                    <p className="mt-1 font-mono text-content">{formatFontFileSize(output.outputSize)}</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-background p-3">
                    <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{t('saved_size')}</p>
                    <p className="mt-1 font-mono text-content">{formatFontFileSize(Math.max(0, output.savedBytes))}</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-background p-3">
                    <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{t('coverage')}</p>
                    <p className="mt-1 font-mono text-content">
                      {output.includedCount}/{output.requestedCount} · {formatSavedRatio(output.savedRatio)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border-subtle bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{t('preview')}</p>
                  <p
                    className="mt-3 break-words text-3xl leading-relaxed text-content"
                    style={{ fontFamily: `${output.fontFamily}, sans-serif` }}
                  >
                    {previewText || t('preview_empty')}
                  </p>
                </div>

                <div className="grid min-h-0 gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-border-subtle bg-background p-3">
                    <p className="text-sm font-medium text-content-secondary">{t('included_title')}</p>
                    <p className="mt-2 break-words font-mono text-xs leading-relaxed text-content-muted">
                      {output.includedCharacters.length ? formatCharacterList(output.includedCharacters) : t('none')}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-background p-3">
                    <p className="text-sm font-medium text-content-secondary">{t('missing_title')}</p>
                    <p className="mt-2 break-words font-mono text-xs leading-relaxed text-content-muted">
                      {output.missingCharacters.length ? formatCharacterList(output.missingCharacters) : t('none')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-80 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-surface-raised p-6 text-center">
                <p className="text-base font-semibold text-content">{t('empty_title')}</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-content-muted">{t('empty_body')}</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
