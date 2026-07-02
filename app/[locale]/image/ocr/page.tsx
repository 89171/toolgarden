'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';

type Language = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn';

export default function ImageOcrPage() {
  const t = useTranslations('tools.image-ocr');
  const tc = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [language, setLanguage] = useState<Language>('eng');
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'recognizing'>('idle');

  const handleFile = (f: File) => {
    setFile(f);
    setResult('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleRecognize = async () => {
    if (!file) return;
    setStatus('loading');
    setProgress(0);
    setResult('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(language, undefined, {
        logger: (m: { status?: string; progress?: number }) => {
          if (m.status === 'recognizing text') setStatus('recognizing');
          if (typeof m.progress === 'number') setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      setResult(data.text || '');
      await worker.terminate();
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
    }
    setStatus('idle');
    setProgress(0);
  };

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(result).catch(() => {});
    }
  };

  return (
    <ToolLayout toolId="image-ocr">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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

          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="preview" className="max-h-64 max-w-full self-center rounded border border-border-subtle" />
          )}

          <h2 className="mt-2 text-lg font-semibold text-content">{t('settings_title')}</h2>
          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('language_label')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
            >
              <option value="eng">{t('language_eng')}</option>
              <option value="chi_sim">{t('language_chi_sim')}</option>
              <option value="chi_tra">{t('language_chi_tra')}</option>
              <option value="jpn">{t('language_jpn')}</option>
            </select>
          </div>

          <Button onClick={handleRecognize} disabled={!file || status !== 'idle'}>
            {status === 'loading'
              ? t('loading_model')
              : status === 'recognizing'
                ? t('recognizing', { progress })
                : t('recognize')}
          </Button>
        </section>

        <section className="flex min-h-64 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
            {result && <Button variant="secondary" onClick={copy}>{tc('copy')}</Button>}
          </div>
          {result ? (
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="min-h-64 flex-1 resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
            />
          ) : (
            <p className="text-sm text-content-faint">{t('empty_result')}</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
