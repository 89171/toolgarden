'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { addPdfWatermark } from '@/lib/utils/pdf-watermark';
import { pdfWatermarkContent } from '@/lib/tools/content/pdf-watermark';

type Layout = 'center' | 'tile' | 'diagonal';

export default function PdfWatermarkPage() {
  const t = useTranslations('tools.pdf-watermark');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(-30);
  const [color, setColor] = useState('#666666');
  const [layout, setLayout] = useState<Layout>('tile');
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [error, setError] = useState(false);
  const resultUrlRef = useRef('');
  const requestIdRef = useRef(0);
  const previousFileRef = useRef<File | null>(null);

  const replaceResultUrl = useCallback((nextUrl: string) => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = nextUrl;
    setResultUrl(nextUrl);
  }, []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError(false);

    if (!file || !text.trim()) {
      previousFileRef.current = file;
      setBusy(false);
      replaceResultUrl('');
      return;
    }

    if (previousFileRef.current !== file) replaceResultUrl('');
    previousFileRef.current = file;
    setBusy(true);

    const timer = window.setTimeout(async () => {
      try {
        const blob = await addPdfWatermark(file, {
          text: text.trim(),
          fontSize,
          opacity,
          rotation,
          color,
          layout,
        });
        if (requestId !== requestIdRef.current) return;
        if (!blob) throw new Error('Watermark generation failed.');
        replaceResultUrl(URL.createObjectURL(blob));
      } catch {
        if (requestId !== requestIdRef.current) return;
        replaceResultUrl('');
        setError(true);
      } finally {
        if (requestId === requestIdRef.current) setBusy(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [color, file, fontSize, layout, opacity, replaceResultUrl, rotation, text]);

  useEffect(() => () => {
    requestIdRef.current += 1;
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, []);

  const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'pdf';

  return (
    <ToolLayout toolId="pdf-watermark" content={pdfWatermarkContent}>
      <div className="grid items-stretch gap-4 lg:min-h-[calc(100dvh-14rem)] lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]">
        <section className="flex min-h-0 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('upload_title')}</h2>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised p-6 text-center hover:border-border-strong">
            <span className="text-sm text-content-secondary">{t('drop_title')}</span>
            <span className="text-xs text-content-faint">{t('drop_hint')}</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file && <p className="text-xs text-content-muted">{file.name}</p>}

          <h2 className="mt-2 text-lg font-semibold text-content">{t('settings_title')}</h2>
          <div>
            <label htmlFor="watermark-text" className="text-sm font-medium text-content-secondary">{t('text_label')}</label>
            <input
              id="watermark-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="watermark-font-size" className="text-sm font-medium text-content-secondary">{t('font_size_label')}</label>
              <input
                id="watermark-font-size"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(8, Number(e.target.value) || 8))}
                className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content"
              />
            </div>
            <div>
              <label htmlFor="watermark-color" className="text-sm font-medium text-content-secondary">{t('color_label')}</label>
              <input
                id="watermark-color"
                type="color"
                value={color.slice(0, 7)}
                onChange={(e) => setColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded border border-border-input bg-surface-raised"
              />
            </div>
          </div>
          <div>
            <label htmlFor="watermark-opacity" className="text-sm font-medium text-content-secondary">{t('opacity_label')}: {opacity.toFixed(2)}</label>
            <input
              id="watermark-opacity"
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label htmlFor="watermark-rotation" className="text-sm font-medium text-content-secondary">{t('rotation_label')}: {rotation}°</label>
            <input
              id="watermark-rotation"
              type="range"
              min={-90}
              max={90}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <span className="text-sm font-medium text-content-secondary">{t('layout_label')}</span>
            <div className="mt-1 inline-flex overflow-hidden rounded border border-border-input">
              {(['center', 'tile', 'diagonal'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLayout(l)}
                  aria-pressed={layout === l}
                  className={`px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${layout === l ? 'bg-action text-background' : 'bg-surface-raised text-content-secondary hover:bg-surface-hover'}`}
                >
                  {t(`layout_${l}`)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[34rem] min-w-0 flex-col rounded-lg border border-border-base bg-surface p-4 shadow">
          <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
            {resultUrl && !busy && (
              <a
                href={resultUrl}
                download={`${baseName}-watermarked.pdf`}
                className="rounded bg-action px-4 py-2 text-sm font-medium text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                {t('download_result')}
              </a>
            )}
          </div>

          <div className="relative flex min-h-[28rem] flex-1 items-center justify-center overflow-hidden rounded border border-border-subtle bg-surface-raised" aria-live="polite">
            {resultUrl ? (
              <iframe src={resultUrl} className="absolute inset-0 h-full w-full border-0" title={t('result_title')} />
            ) : error ? (
              <p className="max-w-sm px-6 text-center text-sm text-content-secondary">{t('preview_error')}</p>
            ) : (
              <p className="max-w-sm px-6 text-center text-sm text-content-faint">
                {busy ? t('processing_preview') : t('empty_state')}
              </p>
            )}
            {busy && resultUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
                <p className="rounded border border-border-subtle bg-surface px-4 py-2 text-sm text-content-secondary shadow">
                  {t('processing_preview')}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
