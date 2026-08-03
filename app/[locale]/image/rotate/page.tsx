'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { canvasToBlob, drawTransformed, loadImageFromFile } from '@/lib/utils/image-transform';
import { imageRotateContent } from '@/lib/tools/content/image-rotate';

export default function ImageRotatePage() {
  const t = useTranslations('tools.image-rotate');
  const tc = useTranslations('common');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [angle, setAngle] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!image || !previewRef.current) return;
    const canvas = drawTransformed(image, { angle, flipX, flipY });
    if (!canvas) return;
    const dest = previewRef.current;
    const ctx = dest.getContext('2d');
    if (!ctx) return;
    const max = 600;
    const scale = Math.min(1, max / Math.max(canvas.width, canvas.height));
    dest.width = Math.round(canvas.width * scale);
    dest.height = Math.round(canvas.height * scale);
    ctx.clearRect(0, 0, dest.width, dest.height);
    ctx.drawImage(canvas, 0, 0, dest.width, dest.height);
  }, [image, angle, flipX, flipY]);

  const handleFile = async (file: File) => {
    try {
      const img = await loadImageFromFile(file);
      setImage(img);
      setFileName(file.name);
      setAngle(0);
      setFlipX(false);
      setFlipY(false);
    } catch {
      /* ignore */
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    const canvas = drawTransformed(image, { angle, flipX, flipY });
    if (!canvas) return;
    const type = fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/png';
    const blob = await canvasToBlob(canvas, type, 0.95);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const base = fileName.replace(/\.[^.]+$/, '') || 'image';
    a.href = url;
    a.download = `${base}-rotated.${type === 'image/jpeg' ? 'jpg' : 'png'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout toolId="image-rotate" content={imageRotateContent}>
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

          {image && (
            <>
              <h2 className="mt-2 text-lg font-semibold text-content">{t('transform_title')}</h2>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setAngle((a) => a - 90)}>{t('rotate_left')}</Button>
                <Button variant="secondary" onClick={() => setAngle((a) => a + 90)}>{t('rotate_right')}</Button>
                <Button variant="secondary" onClick={() => setAngle((a) => a + 180)}>{t('rotate_180')}</Button>
                <Button variant="secondary" onClick={() => { setAngle(0); setFlipX(false); setFlipY(false); }}>{t('reset')}</Button>
                <Button variant={flipX ? 'primary' : 'secondary'} onClick={() => setFlipX((v) => !v)}>{t('flip_horizontal')}</Button>
                <Button variant={flipY ? 'primary' : 'secondary'} onClick={() => setFlipY((v) => !v)}>{t('flip_vertical')}</Button>
              </div>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('custom_angle')}: {angle}°</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={angle % 360}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
              <Button onClick={handleDownload}>{tc('download')}</Button>
            </>
          )}
        </section>

        <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
          {image ? (
            <div className="flex flex-1 items-center justify-center overflow-auto rounded border border-border-subtle bg-surface-raised p-3">
              <canvas ref={previewRef} className="max-h-full max-w-full" />
            </div>
          ) : (
            <p className="text-sm text-content-faint">{t('empty_state')}</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
