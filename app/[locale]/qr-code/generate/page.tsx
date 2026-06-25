'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { QrToolSwitcher } from '@/components/QrToolSwitcher';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  formatQrFileSize,
  formatQrPixelLimit,
  QR_CODE_MARGIN,
  QR_CODE_SIZE,
  QR_ERROR_CORRECTION_LEVELS,
  QR_LOGO_LIMITS,
  type QrCodeLogoInfo,
  type NormalizedQrCodeOptions,
  type QrErrorCorrectionLevel,
  type QrFailureCode,
} from '@/lib/utils/qr';
import { generateQrCodeDataUrl } from '@/lib/utils/qr-browser';

const EXAMPLE_TEXT = 'https://www.toolgarden.xyz/zh/qr-code/generate';

interface GeneratedQrCode {
  dataUrl: string;
  filename: string;
  inputBytes: number;
  options: NormalizedQrCodeOptions;
  logo?: QrCodeLogoInfo;
}

export default function QrCodeGeneratePage() {
  const t = useTranslations('tools.qr-code-generator');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [size, setSize] = useState(QR_CODE_SIZE.default);
  const [margin, setMargin] = useState(QR_CODE_MARGIN.default);
  const [level, setLevel] = useState<QrErrorCorrectionLevel>('M');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState<GeneratedQrCode | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [generating, setGenerating] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const errorMessage = (code: QrFailureCode, detail?: string) =>
    t(`errors.${code}`, {
      maxPixels: formatQrPixelLimit(QR_LOGO_LIMITS.maxPixels),
      maxSize: formatQrFileSize(QR_LOGO_LIMITS.maxFileBytes),
      type: detail || t('unknown_logo_type'),
    });

  const runGenerate = async (nextText = text, nextLogoFile = logoFile) => {
    setGenerating(true);
    const result = await generateQrCodeDataUrl(nextText, {
      size,
      margin,
      errorCorrectionLevel: level,
    }, nextLogoFile);
    setGenerating(false);

    if (!result.ok) {
      setGenerated(null);
      setGenerateError(errorMessage(result.code, result.detail));
      return;
    }

    setGenerateError('');
    setGenerated({
      dataUrl: result.dataUrl,
      filename: result.filename,
      inputBytes: result.inputBytes,
      options: result.options,
      logo: result.logo,
    });
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
    void runGenerate(EXAMPLE_TEXT);
  };

  const clearGenerator = () => {
    setText('');
    setLogoFile(null);
    setGenerated(null);
    setGenerateError('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    setGenerateError('');

    if (!file) return;

    setLevel('H');
    if (text.trim()) {
      void runGenerate(text, file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setGenerateError('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }

    if (text.trim() && generated?.logo) {
      void runGenerate(text, null);
    }
  };

  const downloadQrCode = () => {
    if (!generated) return;

    const link = document.createElement('a');
    link.href = generated.dataUrl;
    link.download = generated.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <ToolLayout toolId="qr-code-generator">
      <QrToolSwitcher current="generate" />
      <div className="flex-grow min-h-0 overflow-auto pr-1">
        <div className="grid min-h-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <Panel
            title={t('generate_title')}
            actions={
              <>
                <Button variant="secondary" onClick={loadExample}>{tc('example')}</Button>
                <Button variant="secondary" onClick={clearGenerator}>{tc('clear')}</Button>
                <Button onClick={() => void runGenerate()} disabled={generating}>
                  {generating ? t('generating') : t('generate')}
                </Button>
              </>
            }
            className="min-h-[30rem] lg:min-h-0"
          >
            <label htmlFor="qr-text" className="mb-2 text-sm font-medium text-content-secondary">
              {t('text_label')}
            </label>
            <textarea
              id="qr-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setGenerateError('');
              }}
              className="w-full flex-grow min-h-64 resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary outline-none transition-colors placeholder:text-content-faint focus:border-border-strong focus:ring-2 focus:ring-action"
              placeholder={t('text_placeholder')}
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <label htmlFor="qr-size" className="font-medium text-content-secondary">
                    {t('size_label')}
                  </label>
                  <span className="font-mono text-content-muted">{size}px</span>
                </div>
                <input
                  id="qr-size"
                  type="range"
                  min={QR_CODE_SIZE.min}
                  max={QR_CODE_SIZE.max}
                  step={16}
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className="w-full accent-action"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <label htmlFor="qr-margin" className="font-medium text-content-secondary">
                    {t('margin_label')}
                  </label>
                  <span className="font-mono text-content-muted">{margin}</span>
                </div>
                <input
                  id="qr-margin"
                  type="range"
                  min={QR_CODE_MARGIN.min}
                  max={QR_CODE_MARGIN.max}
                  step={1}
                  value={margin}
                  onChange={(event) => setMargin(Number(event.target.value))}
                  className="w-full accent-action"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-content-secondary">{t('level_label')}</p>
              <div className="grid grid-cols-4 gap-2">
                {QR_ERROR_CORRECTION_LEVELS.map((currentLevel) => (
                  <button
                    key={currentLevel}
                    type="button"
                    aria-pressed={level === currentLevel}
                    onClick={() => setLevel(currentLevel)}
                    className={`rounded border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
                      level === currentLevel
                        ? 'border-border-strong bg-action text-background'
                        : 'border-border-base bg-surface-raised text-content-muted hover:bg-surface-hover hover:text-content-secondary'
                    }`}
                  >
                    {currentLevel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded border border-border-base bg-surface-raised p-3">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <label htmlFor="qr-logo" className="text-sm font-medium text-content-secondary">
                    {t('logo_label')}
                  </label>
                  <p className="mt-1 text-xs text-content-muted">
                    {t('logo_hint', { maxSize: formatQrFileSize(QR_LOGO_LIMITS.maxFileBytes) })}
                  </p>
                </div>
                <Button variant="secondary" onClick={removeLogo} disabled={!logoFile}>
                  {t('remove_logo')}
                </Button>
              </div>
              <input
                ref={logoInputRef}
                id="qr-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
                onChange={handleLogoChange}
                className="block w-full text-sm text-content-muted file:mr-3 file:rounded file:border-0 file:bg-surface-hover file:px-3 file:py-2 file:text-content-secondary hover:file:bg-action-muted"
              />
              {logoFile ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-border-subtle bg-surface px-3 py-2 text-xs text-content-muted">
                  <span className="min-w-0 flex-1 truncate font-medium text-content-secondary">{logoFile.name}</span>
                  <span className="font-mono">{formatQrFileSize(logoFile.size)}</span>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel
            title={t('preview_title')}
            actions={<Button onClick={downloadQrCode} disabled={!generated}>{tc('download')}</Button>}
            className="min-h-[30rem] lg:min-h-0"
          >
            <div className="flex flex-grow flex-col items-center justify-center gap-4 rounded border border-border-base bg-surface-raised p-4">
              {generated ? (
                <>
                  <Image
                    src={generated.dataUrl}
                    alt={t('preview_alt')}
                    width={generated.options.size}
                    height={generated.options.size}
                    unoptimized
                    className="aspect-square w-full max-w-80 rounded border border-border-subtle bg-surface object-contain p-3"
                  />
                  <dl className="grid w-full grid-cols-2 gap-2 text-xs text-content-muted">
                    <div className="rounded border border-border-subtle bg-surface px-3 py-2">
                      <dt className="text-content-faint">{t('input_bytes')}</dt>
                      <dd className="font-mono text-content-secondary">{formatQrFileSize(generated.inputBytes)}</dd>
                    </div>
                    <div className="rounded border border-border-subtle bg-surface px-3 py-2">
                      <dt className="text-content-faint">{t('output_size')}</dt>
                      <dd className="font-mono text-content-secondary">{generated.options.size}px</dd>
                    </div>
                    {generated.logo ? (
                      <div className="col-span-2 rounded border border-border-subtle bg-surface px-3 py-2">
                        <dt className="text-content-faint">{t('logo_meta')}</dt>
                        <dd className="truncate font-mono text-content-secondary">
                          {generated.logo.filename} · {formatQrFileSize(generated.logo.fileSize)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </>
              ) : generateError ? (
                <p className="text-sm text-syntax-null">{generateError}</p>
              ) : (
                <p className="text-sm text-content-faint">{t('empty_preview')}</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
