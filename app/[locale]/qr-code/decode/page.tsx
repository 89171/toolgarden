'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { QrToolSwitcher } from '@/components/QrToolSwitcher';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  formatQrFileSize,
  formatQrPixelLimit,
  QR_DECODE_LIMITS,
  type DecodedQrCode,
  type QrFailureCode,
} from '@/lib/utils/qr';
import { decodeQrCodeFile } from '@/lib/utils/qr-browser';

export default function QrCodeDecodePage() {
  const t = useTranslations('tools.qr-code-decoder');
  const tc = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const clearResult = () => {
    setDecoded(null);
    setDecodeError('');
    setCopied(false);
  };

  return (
    <ToolLayout toolId="qr-code-decoder">
      <QrToolSwitcher current="decode" />
      <div className="flex-grow min-h-0 overflow-auto pr-1">
        <div className="grid min-h-full grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1fr)]">
          <Panel
            title={t('decode_title')}
            actions={
              <>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  {t('choose_image')}
                </Button>
                <Button variant="secondary" onClick={clearResult} disabled={!decoded && !decodeError}>
                  {tc('clear')}
                </Button>
              </>
            }
            className="min-h-[24rem] lg:min-h-0"
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
              className="flex flex-grow min-h-72 flex-col items-center justify-center rounded border border-dashed border-border-base bg-surface-raised p-6 text-center transition-colors hover:border-border-strong"
            >
              <p className="text-sm font-medium text-content-secondary">{t('drop_title')}</p>
              <p className="mt-2 text-xs text-content-faint">{t('drop_hint')}</p>
            </div>
          </Panel>

          <Panel
            title={t('result_title')}
            actions={
              <Button onClick={copyDecodedText} disabled={!decoded?.text}>
                {copied ? tc('copied') : tc('copy')}
              </Button>
            }
            className="min-h-[24rem] lg:min-h-0"
          >
            <div className="flex-grow overflow-auto rounded border border-border-base bg-surface-raised p-3">
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
    </ToolLayout>
  );
}
