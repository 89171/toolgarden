'use client';
import React, { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { CRON_TEMPLATES, parseCron } from '@/lib/utils/cron';
import { formatDate } from '@/lib/utils/timestamp';
import { cronContent } from '@/lib/tools/content/cron';

export default function CronPage() {
  const t = useTranslations('tools.cron');
  const locale = useLocale();
  const [expression, setExpression] = useState('*/5 * * * *');
  const [count, setCount] = useState(6);
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local');

  const result = useMemo(
    () => parseCron(expression, locale === 'zh' ? 'zh_CN' : 'en', count, timezone),
    [expression, locale, count, timezone]
  );

  return (
    <ToolLayout toolId="cron" content={cronContent}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('expression_title')}</h2>
          <input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder={t('expression_placeholder')}
            className="w-full rounded border border-border-input bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-content-muted">{t('next_count_label')}</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              className="w-20 rounded border border-border-input bg-surface-raised px-2 py-1 text-sm"
            />
            <label className="text-sm text-content-muted">{t('timezone_label')}</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value as 'local' | 'utc')}
              className="rounded border border-border-input bg-surface-raised px-2 py-1 text-sm"
            >
              <option value="local">{t('timezone_local')}</option>
              <option value="utc">{t('timezone_utc')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('templates_label')}</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CRON_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.value}
                  type="button"
                  onClick={() => setExpression(tpl.value)}
                  className="rounded border border-border-input bg-surface-raised px-2.5 py-1 text-xs text-content-secondary hover:border-border-strong hover:text-content"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <h2 className="mt-2 text-lg font-semibold text-content">{t('description_title')}</h2>
          {result.ok ? (
            <p className="rounded border border-border-subtle bg-surface-raised p-3 text-sm text-content-secondary">
              {result.description}
            </p>
          ) : (
            <p className="text-sm text-danger-content">
              {expression ? t('invalid_expression') : t('empty_expression')}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('next_runs_title')}</h2>
          {result.ok && result.nextRuns.length > 0 ? (
            <ul className="flex flex-col gap-1 rounded border border-border-subtle bg-surface-raised p-3 font-mono text-sm text-content-secondary">
              {result.nextRuns.map((run, i) => (
                <li key={i} className="flex justify-between border-b border-border-subtle py-1 last:border-b-0">
                  <span className="text-content-faint">#{i + 1}</span>
                  <span>{formatDate(run, timezone)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-content-faint">—</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
