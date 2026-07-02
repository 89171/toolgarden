'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { downloadPagesAsZip, renderPdfPages, type RenderedPage } from '@/lib/utils/pdf-render';

export default function PdfToImagePage() {
  const t = useTranslations('tools.pdf-to-image');
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState(2);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setPages([]);
    setProgress({ current: 0, total: 0 });
    try {
      const rendered = await renderPdfPages(file, {
        format,
        scale,
        onProgress: (current, total) => setProgress({ current, total }),
      });
      setPages(rendered);
    } catch {
      /* ignore */
    }
    setProgress(null);
  };

  const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'pdf';
  const ext = format === 'jpeg' ? 'jpg' : 'png';

  return (
    <ToolLayout toolId="pdf-to-image">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('format_label')}</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('scale_label')}: {scale}x</label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <Button onClick={handleConvert} disabled={!file || progress !== null}>
            {progress ? t('converting', { current: progress.current, total: progress.total || '?' }) : t('convert')}
          </Button>
          {pages.length > 0 && (
            <Button variant="secondary" onClick={() => downloadPagesAsZip(pages, baseName, ext)}>
              {t('download_all')}
            </Button>
          )}
        </section>

        <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
          {pages.length === 0 ? (
            <p className="text-sm text-content-faint">{t('empty_state')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 overflow-auto sm:grid-cols-3">
              {pages.map((page) => (
                <div key={page.pageNumber} className="flex flex-col gap-1 rounded border border-border-subtle bg-surface-raised p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.dataUrl} alt={`page ${page.pageNumber}`} className="max-w-full" />
                  <div className="flex items-center justify-between text-xs text-content-muted">
                    <span>{t('page_label', { page: page.pageNumber })}</span>
                    <a
                      href={page.dataUrl}
                      download={`${baseName}-page-${page.pageNumber}.${ext}`}
                      className="text-content-secondary hover:text-content"
                    >
                      {t('download_page')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
