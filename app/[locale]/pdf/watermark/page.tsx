'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { addPdfWatermark } from '@/lib/utils/pdf-watermark';

type Layout = 'center' | 'tile' | 'diagonal';

export default function PdfWatermarkPage() {
  const t = useTranslations('tools.pdf-watermark');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [rotation, setRotation] = useState(-30);
  const [color, setColor] = useState('#666666');
  const [layout, setLayout] = useState<Layout>('diagonal');
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');

  const handleGo = async () => {
    if (!file) return;
    setBusy(true);
    setResultUrl('');
    try {
      const blob = await addPdfWatermark(file, { text, fontSize, opacity, rotation, color, layout });
      if (blob) setResultUrl(URL.createObjectURL(blob));
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'pdf';

  return (
    <ToolLayout toolId="pdf-watermark">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
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
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('text_label')}</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-normal text-content-faint">{t('font_size_label')}</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(8, Number(e.target.value) || 8))}
                className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-normal text-content-faint">{t('color_label')}</label>
              <input
                type="color"
                value={color.slice(0, 7)}
                onChange={(e) => setColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded border border-border-input bg-surface-raised"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('opacity_label')}: {opacity.toFixed(2)}</label>
            <input
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
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('rotation_label')}: {rotation}°</label>
            <input
              type="range"
              min={-90}
              max={90}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('layout_label')}</label>
            <div className="mt-1 inline-flex overflow-hidden rounded border border-border-input">
              {(['center', 'tile', 'diagonal'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLayout(l)}
                  className={`px-3 py-1.5 text-sm ${layout === l ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
                >
                  {t(`layout_${l}`)}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGo} disabled={!file || busy}>
            {busy ? t('processing') : t('add_watermark')}
          </Button>
        </section>

        <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
          {resultUrl ? (
            <div className="flex flex-col gap-3">
              <a
                href={resultUrl}
                download={`${baseName}-watermarked.pdf`}
                className="self-start rounded bg-action px-4 py-2 text-sm text-white hover:opacity-90"
              >
                {t('add_watermark')}
              </a>
              <iframe src={resultUrl} className="min-h-96 w-full flex-1 rounded border border-border-subtle" title="preview" />
            </div>
          ) : (
            <p className="text-sm text-content-faint">{t('empty_state')}</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
