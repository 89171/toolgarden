'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { loadImageFromFile } from '@/lib/utils/image-transform';
import { hslString, rgbString, rgbToHex, rgbToHsl } from '@/lib/utils/color';
import { imageColorPickerContent } from '@/lib/tools/content/image-color-picker';

interface Sample {
  hex: string;
  rgb: string;
  hsl: string;
  x: number;
  y: number;
}

export default function ImageColorPickerPage() {
  const t = useTranslations('tools.image-color-picker');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [current, setCurrent] = useState<Sample | null>(null);
  const [history, setHistory] = useState<Sample[]>([]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const max = 720;
    const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }, [image]);

  const handleFile = async (file: File) => {
    try {
      const img = await loadImageFromFile(file);
      setImage(img);
      setCurrent(null);
      setHistory([]);
    } catch {
      /* ignore */
    }
  };

  const sampleAt = (event: React.MouseEvent<HTMLCanvasElement>): Sample | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * canvas.height);
    try {
      const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
      const rgb = { r, g, b, a: a / 255 };
      return { hex: rgbToHex(rgb), rgb: rgbString(rgb), hsl: hslString(rgbToHsl(rgb)), x, y };
    } catch {
      return null;
    }
  };

  return (
    <ToolLayout toolId="image-color-picker" content={imageColorPickerContent}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{image ? t('picker_title') : t('upload_title')}</h2>
          {!image ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised p-8 text-center hover:border-border-strong">
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
          ) : (
            <>
              <p className="text-xs text-content-faint">{t('hint')}</p>
              <div className="overflow-auto rounded border border-border-subtle bg-surface-raised p-2">
                <canvas
                  ref={canvasRef}
                  onMouseMove={(e) => setCurrent(sampleAt(e))}
                  onClick={(e) => {
                    const s = sampleAt(e);
                    if (s) {
                      setCurrent(s);
                      setHistory((prev) => [s, ...prev].slice(0, 20));
                    }
                  }}
                  className="max-w-full cursor-crosshair"
                />
              </div>
            </>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('current_label')}</h2>
          {current ? (
            <div className="flex flex-col gap-2 rounded border border-border-subtle bg-surface-raised p-3">
              <div className="h-16 w-full rounded" style={{ background: current.hex }} />
              <p className="font-mono text-sm text-content-secondary">{current.hex}</p>
              <p className="font-mono text-xs text-content-muted">{current.rgb}</p>
              <p className="font-mono text-xs text-content-muted">{current.hsl}</p>
            </div>
          ) : (
            <p className="text-sm text-content-faint">{t('empty_state')}</p>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
            {history.length > 0 && (
              <Button variant="secondary" onClick={() => setHistory([])}>{t('clear_history')}</Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-content-faint">{t('empty_history')}</p>
          ) : (
            <ul className="flex flex-col gap-1.5 overflow-auto">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-2 rounded border border-border-subtle bg-surface-raised p-2">
                  <span className="h-8 w-8 shrink-0 rounded" style={{ background: h.hex }} />
                  <span className="font-mono text-sm text-content-secondary">{h.hex}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
