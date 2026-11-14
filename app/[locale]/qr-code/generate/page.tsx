'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';
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
import { qrCodeGeneratorContent } from '@/lib/tools/content/qr-code-generator';

const EXAMPLE_TEXT = 'https://toolgarden.xyz/zh/qr-code/generate';
/** 输入或设置变化后自动重新生成的防抖间隔（毫秒）。 */
const AUTO_GENERATE_DELAY_MS = 220;

interface GeneratedQrCode {
  dataUrl: string;
  filename: string;
  inputBytes: number;
  options: NormalizedQrCodeOptions;
  logo?: QrCodeLogoInfo;
}

interface QrGenerateFailure {
  code: QrFailureCode;
  detail?: string;
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generateError, setGenerateError] = useState<QrGenerateFailure | null>(null);
  const [generating, setGenerating] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const generateRequestRef = useRef(0);

  const errorMessage = (code: QrFailureCode, detail?: string) =>
    t(`errors.${code}`, {
      maxPixels: formatQrPixelLimit(QR_LOGO_LIMITS.maxPixels),
      maxSize: formatQrFileSize(QR_LOGO_LIMITS.maxFileBytes),
      type: detail || t('unknown_logo_type'),
    });

  // 内容、尺寸、留白、纠错等级或 Logo 任一变化后自动重新生成。
  // 防抖避免逐字输入 / 拖动滑块时重复计算；requestId 保证慢的旧任务不会覆盖新结果。
  useEffect(() => {
    const requestId = generateRequestRef.current + 1;
    generateRequestRef.current = requestId;

    const timer = window.setTimeout(async () => {
      const isStale = () => generateRequestRef.current !== requestId;

      if (!text.trim()) {
        setGenerating(false);
        setGenerated(null);
        setGenerateError(null);
        return;
      }

      setGenerating(true);
      const result = await generateQrCodeDataUrl(text, {
        size,
        margin,
        errorCorrectionLevel: level,
      }, logoFile);
      if (isStale()) return;

      setGenerating(false);
      if (!result.ok) {
        setGenerated(null);
        setGenerateError({ code: result.code, detail: result.detail });
        return;
      }

      setGenerateError(null);
      setGenerated({
        dataUrl: result.dataUrl,
        filename: result.filename,
        inputBytes: result.inputBytes,
        options: result.options,
        logo: result.logo,
      });
    }, AUTO_GENERATE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [level, logoFile, margin, size, text]);

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
  };

  const clearGenerator = () => {
    setText('');
    setLogoFile(null);
    setGenerated(null);
    setGenerateError(null);
    setGenerating(false);
    setPreviewOpen(false);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) setLevel('H');
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
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
    <ToolLayout toolId="qr-code-generator" content={qrCodeGeneratorContent}>
      <QrToolSwitcher current="generate" />
      <div className="flex-grow min-h-0 overflow-auto pr-1">
        <div className="grid min-h-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <Panel
            title={t('generate_title')}
            actions={
              <>
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center self-center text-xs text-content-muted"
                >
                  {generating ? t('generating') : t('auto_generate_hint')}
                </span>
                <Button variant="secondary" onClick={loadExample}>{tc('example')}</Button>
                <Button variant="secondary" onClick={clearGenerator}>{tc('clear')}</Button>
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
              onChange={(event) => setText(event.target.value)}
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
            actions={<Button onClick={downloadQrCode} disabled={!generated || generating}>{tc('download')}</Button>}
            className="min-h-[30rem] lg:min-h-0"
          >
            <div className="flex flex-grow flex-col items-center justify-center gap-4 rounded border border-border-base bg-surface-raised p-4">
              {generated ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    aria-label={tc('preview_open_output')}
                    className="flex w-full cursor-zoom-in appearance-none items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
                  >
                    <Image
                      src={generated.dataUrl}
                      alt={t('preview_alt')}
                      width={generated.options.size}
                      height={generated.options.size}
                      unoptimized
                      className="aspect-square w-full max-w-80 rounded border border-border-subtle bg-surface object-contain p-3"
                    />
                  </button>
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
                <p className="text-sm text-syntax-null">{errorMessage(generateError.code, generateError.detail)}</p>
              ) : (
                <p className="text-sm text-content-faint">{t('empty_preview')}</p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <ImagePreviewDialog
        open={previewOpen && Boolean(generated)}
        src={generated?.dataUrl}
        alt={t('preview_alt')}
        title={tc('preview_title')}
        closeLabel={tc('preview_close')}
        onClose={() => setPreviewOpen(false)}
      />
    </ToolLayout>
  );
}
