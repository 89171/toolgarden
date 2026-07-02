'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { generateUuids, type UuidVersion } from '@/lib/utils/uuid';

export default function UuidPage() {
  const t = useTranslations('tools.uuid');
  const tc = useTranslations('common');
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleGenerate = () => {
    setResults(generateUuids({ version, count, uppercase, removeHyphens }));
  };

  const copyAll = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(results.join('\n')).catch(() => {});
    }
  };

  return (
    <ToolLayout toolId="uuid">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="flex flex-col gap-4 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('settings_title')}</h2>

          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('version_label')}</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as UuidVersion)}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
            >
              <option value="v1">{t('version_v1')}</option>
              <option value="v4">{t('version_v4')}</option>
              <option value="v7">{t('version_v7')}</option>
              <option value="nanoid">{t('version_nanoid')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('count_label')}</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 text-sm"
            />
          </div>

          {version !== 'nanoid' && (
            <>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('case_label')}</label>
                <div className="mt-1 inline-flex overflow-hidden rounded border border-border-input">
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm ${!uppercase ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
                    onClick={() => setUppercase(false)}
                  >
                    {t('case_lower')}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm ${uppercase ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
                    onClick={() => setUppercase(true)}
                  >
                    {t('case_upper')}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-normal text-content-faint">{t('hyphen_label')}</label>
                <div className="mt-1 inline-flex overflow-hidden rounded border border-border-input">
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm ${!removeHyphens ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
                    onClick={() => setRemoveHyphens(false)}
                  >
                    {t('hyphen_with')}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm ${removeHyphens ? 'bg-action text-white' : 'bg-surface-raised text-content-secondary'}`}
                    onClick={() => setRemoveHyphens(true)}
                  >
                    {t('hyphen_without')}
                  </button>
                </div>
              </div>
            </>
          )}

          <Button onClick={handleGenerate}>{t('generate')}</Button>
        </section>

        <section className="flex min-h-72 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
            {results.length > 0 && (
              <Button variant="secondary" onClick={copyAll}>{tc('copy')}</Button>
            )}
          </div>
          {results.length > 0 ? (
            <ul className="flex flex-col gap-1 overflow-auto rounded border border-border-subtle bg-surface-raised p-3 font-mono text-sm text-content-secondary">
              {results.map((value, i) => (
                <li key={i} className="select-all">{value}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-content-faint">{t('empty_result')}</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
