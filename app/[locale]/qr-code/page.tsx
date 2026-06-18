'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  formatQrFileSize,
  formatQrPixelLimit,
  QR_CODE_MARGIN,
  QR_CODE_SIZE,
  QR_DECODE_LIMITS,
  QR_ERROR_CORRECTION_LEVELS,
  type DecodedQrCode,
  type QrErrorCorrectionLevel,
  type QrFailureCode,
  type NormalizedQrCodeOptions,
} from '@/lib/utils/qr';
import { decodeQrCodeFile, generateQrCodeDataUrl } from '@/lib/utils/qr-browser';

const EXAMPLE_TEXT = 'https://json-toolkit.dev/zh/qr-code';

interface GeneratedQrCode {
  dataUrl: string;
  filename: string;
  inputBytes: number;
  options: NormalizedQrCodeOptions;
}

export default function QrCodePage() {
  const t = useTranslations('tools.qr-code');
  const tc = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState('');
  const [size, setSize] = useState(QR_CODE_SIZE.default);
  const [margin, setMargin] = useState(QR_CODE_MARGIN.default);
  const [level, setLevel] = useState<QrErrorCorrectionLevel>('M');
  const [generated, setGenerated] = useState<GeneratedQrCode | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [decoded, setDecoded] = useState<DecodedQrCode | null>(null);
  const [decodeError, setDecodeError] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorMessage = (code: QrFailureCode, detail?: string) =>
    t(`errors.${code}`, {
      maxPixels: formatQrPixelLimit(QR_DECODE_LIMITS.maxPixels),
      maxSize: formatQrFileSize(QR_DECODE_LIMITS.maxFileBytes),
      type: detail || t('unknown_file_type'),
    });

  const runGenerate = async (nextText = text) => {
    setGenerating(true);
    const result = await generateQrCodeDataUrl(nextText, {
      size,
      margin,
      errorCorrectionLevel: level,
    });
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
    });
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
    void runGenerate(EXAMPLE_TEXT);
  };

  const clearGenerator = () => {
    setText('');
    setGenerated(null);
    setGenerateError('');
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

  const decodeFile = async (file: File | undefined) => {
    if (!file) return;

    setDecoding(true);
    setDecoded(null);
    setDecodeError('');
    const result = await decodeQrCodeFile(file);
    setDecoding(false);

    if (!result.ok) {
      setDecodeError(errorMessage(result.code, result.detail));
      return;
    }

    setDecoded(result.decoded);
  };

  const copyDecodedText = async () => {
    if (!decoded?.text) return;

    await navigator.clipboard.writeText(decoded.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <ToolLayout toolId="qr-code">
      <div className="flex-grow min-h-0 overflow-auto pr-1">
        <div className="grid min-h-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
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
            className="min-h-[30rem] xl:min-h-0"
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
                        ? 'border-border-strong bg-action text-white'
                        : 'border-border-base bg-surface-raised text-content-muted hover:bg-surface-hover hover:text-content-secondary'
                    }`}
                  >
                    {currentLevel}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <div className="grid min-h-[42rem] gap-6 xl:min-h-0 xl:grid-rows-[minmax(16rem,1fr)_minmax(16rem,1fr)]">
            <Panel
              title={t('preview_title')}
              actions={<Button onClick={downloadQrCode} disabled={!generated}>{tc('download')}</Button>}
              className="min-h-0"
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
                    </dl>
                  </>
                ) : generateError ? (
                  <p className="text-sm text-syntax-null">{generateError}</p>
                ) : (
                  <p className="text-sm text-content-faint">{t('empty_preview')}</p>
                )}
              </div>
            </Panel>

            <Panel
              title={t('decode_title')}
              actions={
                <>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    {t('choose_image')}
                  </Button>
                  <Button onClick={copyDecodedText} disabled={!decoded?.text}>
                    {copied ? tc('copied') : tc('copy')}
                  </Button>
                </>
              }
              className="min-h-0"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
                className="sr-only"
                onChange={(event) => {
                  void decodeFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void decodeFile(event.dataTransfer.files?.[0]);
                }}
                className="flex min-h-28 flex-col items-center justify-center rounded border border-dashed border-border-base bg-surface-raised p-4 text-center transition-colors hover:border-border-strong"
              >
                <p className="text-sm font-medium text-content-secondary">{t('drop_title')}</p>
                <p className="mt-1 text-xs text-content-faint">{t('drop_hint')}</p>
              </div>

              <div className="mt-4 flex-grow overflow-auto rounded border border-border-base bg-surface-raised p-3">
                {decoding ? (
                  <p className="text-sm text-content-muted">{t('decoding')}</p>
                ) : decodeError ? (
                  <p className="text-sm text-syntax-null">{decodeError}</p>
                ) : decoded ? (
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex flex-wrap gap-2 text-xs text-content-muted">
                      <span className="rounded bg-surface-hover px-2 py-1">{decoded.width} x {decoded.height}</span>
                      <span className="rounded bg-surface-hover px-2 py-1">v{decoded.version}</span>
                      <span className="rounded bg-surface-hover px-2 py-1">{formatQrFileSize(decoded.fileSize)}</span>
                    </div>
                    <pre className="min-h-0 flex-grow whitespace-pre-wrap break-words font-mono text-sm text-content-secondary">
                      {decoded.text}
                    </pre>
                  </div>
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-content-faint">
                    {t('empty_decode')}
                  </p>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
