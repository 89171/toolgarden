'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { decodeGif, downloadFramesAsZip, type DecodedFrame } from '@/lib/utils/gif';
import { loadImageFromFile } from '@/lib/utils/image-transform';

type Mode = 'split' | 'compose';

export default function ImageGifPage() {
  const t = useTranslations('tools.image-gif');
  const [mode, setMode] = useState<Mode>('split');

  return (
    <ToolLayout toolId="image-gif">
      <div className="mb-4 inline-flex overflow-hidden rounded border border-border-input">
        <button
          type="button"
          className={`px-4 py-2 text-sm ${mode === 'split' ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
          onClick={() => setMode('split')}
        >
          {t('mode_split')}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm ${mode === 'compose' ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
          onClick={() => setMode('compose')}
        >
          {t('mode_compose')}
        </button>
      </div>

      {mode === 'split' ? <SplitMode /> : <ComposeMode />}
    </ToolLayout>
  );
}

function SplitMode() {
  const t = useTranslations('tools.image-gif');
  const [frames, setFrames] = useState<DecodedFrame[]>([]);
  const [baseName, setBaseName] = useState('gif');
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    setFrames([]);
    try {
      setBaseName(file.name.replace(/\.[^.]+$/, '') || 'gif');
      const result = await decodeGif(file);
      setFrames(result);
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
        <h2 className="text-lg font-semibold text-content">{t('upload_title')}</h2>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised p-6 text-center hover:border-border-strong">
          <span className="text-sm text-content-secondary">{t('drop_gif')}</span>
          <input
            type="file"
            accept="image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
        {frames.length > 0 && (
          <Button onClick={() => downloadFramesAsZip(frames, baseName)}>{t('download_all')}</Button>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
        <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
        {busy && <p className="text-sm text-content-muted">{t('composing')}</p>}
        {frames.length === 0 && !busy ? (
          <p className="text-sm text-content-faint">{t('empty_split')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 overflow-auto sm:grid-cols-3 md:grid-cols-4">
            {frames.map((frame) => (
              <div key={frame.index} className="flex flex-col items-center gap-1 rounded border border-border-subtle bg-surface-raised p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame.dataUrl} alt={`frame ${frame.index + 1}`} className="max-w-full" />
                <span className="text-xs text-content-faint">#{frame.index + 1} · {frame.delay}ms</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ComposeMode() {
  const t = useTranslations('tools.image-gif');
  const [files, setFiles] = useState<File[]>([]);
  const [delay, setDelay] = useState(200);
  const [repeat, setRepeat] = useState<number>(0);
  const [quality, setQuality] = useState(10);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const compose = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setPreviewUrl('');
    try {
      const first = await loadImageFromFile(files[0]);
      const width = first.naturalWidth;
      const height = first.naturalHeight;
      const GIF = (await import('gif.js')).default;
      const gif = new GIF({
        workers: 2,
        quality,
        width,
        height,
        repeat,
        workerScript: '/gif.worker.js',
      });

      for (const file of files) {
        const img = await loadImageFromFile(file);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0, width, height);
        gif.addFrame(canvas, { delay, copy: true });
      }

      gif.on('finished', (blob: Blob) => {
        setPreviewUrl(URL.createObjectURL(blob));
        setBusy(false);
      });
      gif.render();
    } catch {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
        <h2 className="text-lg font-semibold text-content">{t('upload_title')}</h2>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised p-6 text-center hover:border-border-strong">
          <span className="text-sm text-content-secondary">{t('drop_images')}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              if (list.length > 0) setFiles(list);
            }}
          />
        </label>
        {files.length > 0 && <p className="text-xs text-content-muted">{files.length} files</p>}

        <div>
          <label className="text-xs uppercase tracking-normal text-content-faint">{t('delay_label')}</label>
          <input
            type="number"
            min={20}
            value={delay}
            onChange={(e) => setDelay(Math.max(20, Number(e.target.value) || 20))}
            className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-normal text-content-faint">{t('repeat_label')}</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(Number(e.target.value))}
            className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
          >
            <option value={0}>{t('repeat_forever')}</option>
            <option value={-1}>{t('repeat_once')}</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-normal text-content-faint">{t('quality_label')}: {quality}</label>
          <input
            type="range"
            min={1}
            max={30}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>
        <Button onClick={compose} disabled={files.length === 0 || busy}>
          {busy ? t('composing') : t('compose')}
        </Button>
      </section>

      <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
        <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="composed" className="max-h-96 max-w-full" />
            <a
              href={previewUrl}
              download="composed.gif"
              className="rounded bg-action px-4 py-2 text-sm text-white hover:opacity-90"
            >
              {t('download_gif')}
            </a>
          </div>
        ) : (
          <p className="text-sm text-content-faint">{t('empty_compose')}</p>
        )}
      </section>
    </div>
  );
}
