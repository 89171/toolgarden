'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { canvasToBlob, loadImageFromFile } from '@/lib/utils/image-transform';

type ExifRow = { key: string; value: string };

function formatValue(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((v) => formatValue(v)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function ImageExifPage() {
  const t = useTranslations('tools.image-exif');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ExifRow[]>([]);
  const [hasGps, setHasGps] = useState(false);
  const [reading, setReading] = useState(false);
  const [stripping, setStripping] = useState(false);
  const [empty, setEmpty] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f);
    setReading(true);
    setRows([]);
    setEmpty(false);
    setHasGps(false);
    try {
      const exifr = (await import('exifr')).default;
      const data = await exifr.parse(f, { gps: true, translateValues: true, translateKeys: true, reviveValues: true });
      if (!data) {
        setEmpty(true);
      } else {
        const list: ExifRow[] = Object.entries(data).map(([k, v]) => ({
          key: k,
          value: formatValue(v),
        }));
        setRows(list);
        setHasGps(Boolean(data.latitude || data.longitude));
        if (list.length === 0) setEmpty(true);
      }
    } catch {
      setEmpty(true);
    }
    setReading(false);
  };

  const handleStrip = async () => {
    if (!file) return;
    setStripping(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const isJpg = /\.jpe?g$/i.test(file.name);
      const type = isJpg ? 'image/jpeg' : 'image/png';
      const blob = await canvasToBlob(canvas, type, 0.95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const base = file.name.replace(/\.[^.]+$/, '') || 'image';
      a.href = url;
      a.download = `${base}-noexif.${isJpg ? 'jpg' : 'png'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
    setStripping(false);
  };

  return (
    <ToolLayout toolId="image-exif">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('upload_title')}</h2>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised p-6 text-center hover:border-border-strong">
            <span className="text-sm text-content-secondary">{t('drop_title')}</span>
            <span className="text-xs text-content-faint">{t('drop_hint')}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>

          {hasGps && (
            <p className="rounded border border-danger-border bg-danger-surface p-3 text-xs text-danger-content">
              ⚠ {t('gps_warning')}
            </p>
          )}

          {file && (
            <Button onClick={handleStrip} disabled={stripping}>
              {stripping ? t('stripping') : t('strip_and_download')}
            </Button>
          )}
        </section>

        <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('exif_title')}</h2>
          {reading ? (
            <p className="text-sm text-content-muted">{t('reading')}</p>
          ) : !file ? (
            <p className="text-sm text-content-faint">{t('empty_state')}</p>
          ) : empty || rows.length === 0 ? (
            <p className="text-sm text-content-faint">{t('no_exif')}</p>
          ) : (
            <div className="overflow-auto rounded border border-border-subtle bg-surface-raised">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface-raised">
                  <tr className="border-b border-border-subtle text-content-faint">
                    <th className="px-3 py-2">{t('field')}</th>
                    <th className="px-3 py-2">{t('value')}</th>
                  </tr>
                </thead>
                <tbody className="text-content-secondary">
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-border-subtle">
                      <td className="px-3 py-2 font-mono text-xs">{row.key}</td>
                      <td className="px-3 py-2 font-mono text-xs break-all">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
