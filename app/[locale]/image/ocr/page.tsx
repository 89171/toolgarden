'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  OCR_RECOGNITION_MODES,
  type OcrErrorCode,
  type OcrLanguage,
  type OcrMode,
  type OcrProgress,
} from '@/lib/utils/ocr';
import { getOcrModeLabelKey, recognizeImageOcr } from '@/lib/utils/ocr-browser';

const OCR_LANGUAGE_OPTIONS: OcrLanguage[] = ['eng', 'chi_sim', 'chi_tra', 'jpn'];

export default function ImageOcrPage() {
  const t = useTranslations('tools.image-ocr');
  const tc = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [language, setLanguage] = useState<OcrLanguage>('eng');
  const [mode, setMode] = useState<OcrMode>('fast');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [status, setStatus] = useState<'idle' | 'recognizing'>('idle');

  const handleFile = (f: File) => {
    setFile(f);
    setResult('');
    setError('');
    setProgress(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  };

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const getErrorMessage = (code: OcrErrorCode, detail?: string) =>
    t(`errors.${code}`, { detail: detail || '' });

  const handleRecognize = async () => {
    if (!file) return;
    setStatus('recognizing');
    setProgress({ stage: 'model', percent: 0 });
    setResult('');
    setError('');

    const outcome = await recognizeImageOcr(file, {
      mode,
      language,
      onProgress: setProgress,
    });

    if (outcome.ok) {
      setResult(outcome.text);
    } else {
      setError(getErrorMessage(outcome.code, outcome.detail));
    }

    setStatus('idle');
    setProgress(null);
  };

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(result).catch(() => {});
    }
  };

  return (
    <ToolLayout toolId="image-ocr">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel title={t('upload_title')} className="min-h-[28rem]">
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
            <img
              src={previewUrl}
              alt={t('preview_alt')}
              className="mt-3 max-h-64 max-w-full self-center rounded border border-border-subtle"
            />
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-content">{t('model_label')}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('model_label')}>
              {OCR_RECOGNITION_MODES.map((option) => {
                const active = mode === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMode(option)}
                    className={`rounded border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
                      active
                        ? 'border-border-strong bg-surface-hover ring-2 ring-action/25'
                        : 'border-border-base bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
                    }`}
                  >
                    <span className="block text-sm font-medium text-content">{t(getOcrModeLabelKey(option))}</span>
                    <span className="mt-1 block text-xs leading-5 text-content-muted">
                      {t(option === 'accurate' ? 'mode_accurate_scene' : 'mode_fast_scene')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-content">{t('settings_title')}</h3>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('language_label')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm text-content"
            >
              {OCR_LANGUAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`language_${option}`)}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={handleRecognize} disabled={!file || status !== 'idle'}>
              {status === 'recognizing' && progress
                ? t('progress_label', { stage: t(`stages.${progress.stage}`), progress: progress.percent })
                : t('recognize')}
            </Button>
            <p className="text-xs leading-5 text-content-muted">
              {mode === 'accurate' ? t('accurate_note') : t('fast_note')}
            </p>
          </div>
        </Panel>

        <Panel
          title={t('result_title')}
          actions={result ? <Button variant="secondary" onClick={copy}>{tc('copy')}</Button> : undefined}
          className="min-h-[28rem]"
        >
          <div className="flex min-h-0 flex-grow flex-col">
            {error ? (
              <p className="rounded border border-border-base bg-surface-raised p-3 text-sm text-syntax-null">
                {error}
              </p>
            ) : result ? (
              <textarea
                value={result}
                onChange={(event) => setResult(event.target.value)}
                className="min-h-64 flex-1 resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              />
            ) : (
              <p className="flex flex-grow items-center justify-center rounded border border-border-base bg-surface-raised p-3 text-sm text-content-faint">
                {t('empty_result')}
              </p>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
