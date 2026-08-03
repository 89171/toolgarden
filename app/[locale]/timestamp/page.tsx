'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import {
  formatDate,
  parseTimestamp,
  type TimestampUnit,
} from '@/lib/utils/timestamp';
import { timestampContent } from '@/lib/tools/content/timestamp';

type Unit = TimestampUnit | 'auto';

export default function TimestampPage() {
  const t = useTranslations('tools.timestamp');
  const tc = useTranslations('common');
  const [now, setNow] = useState(() => Date.now());
  const [input, setInput] = useState('');
  const [unit, setUnit] = useState<Unit>('auto');
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local');
  const [batch, setBatch] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const result = useMemo(() => parseTimestamp(input, unit), [input, unit]);
  const batchLines = useMemo(() => {
    return batch
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ raw: line, outcome: parseTimestamp(line, unit) }));
  }, [batch, unit]);

  return (
    <ToolLayout toolId="timestamp" content={timestampContent}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4 rounded-lg border border-border-base bg-surface p-4 shadow">
          <div>
            <h2 className="text-lg font-semibold text-content">{t('current_title')}</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatBlock label={t('current_second')} value={Math.floor(now / 1000).toString()} onCopy={() => copyText(Math.floor(now / 1000).toString())} copyLabel={tc('copy')} />
              <StatBlock label={t('current_millisecond')} value={now.toString()} onCopy={() => copyText(now.toString())} copyLabel={tc('copy')} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-content">{t('convert_title')}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="text-sm text-content-muted">{t('unit_label')}</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="rounded border border-border-input bg-surface-raised px-2 py-1 text-sm"
              >
                <option value="auto">auto</option>
                <option value="seconds">{t('unit_seconds')}</option>
                <option value="milliseconds">{t('unit_milliseconds')}</option>
                <option value="microseconds">{t('unit_microseconds')}</option>
              </select>
              <label className="ml-3 text-sm text-content-muted">{t('timezone_label')}</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value as 'local' | 'utc')}
                className="rounded border border-border-input bg-surface-raised px-2 py-1 text-sm"
              >
                <option value="local">{t('timezone_local')}</option>
                <option value="utc">{t('timezone_utc')}</option>
              </select>
              <Button variant="secondary" onClick={() => setInput(now.toString())}>
                {t('use_now')}
              </Button>
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="1700000000 / 2024-01-15T12:00:00Z"
              className="mt-3 w-full rounded border border-border-input bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{tc('result')}</h2>
          {result.ok ? (
            <div className="grid gap-2 text-sm">
              <ResultRow label={t('unit_seconds')} value={result.seconds.toString()} />
              <ResultRow label={t('unit_milliseconds')} value={result.milliseconds.toString()} />
              <ResultRow label={t('unit_microseconds')} value={result.microseconds.toString()} />
              <ResultRow label={t('date_label')} value={formatDate(result.date, timezone)} />
              <ResultRow label={t('iso_label')} value={result.iso} />
              <ResultRow label={t('rfc_label')} value={result.utc} />
              <ResultRow label={t('relative_label')} value={result.relative} />
            </div>
          ) : (
            <p className="text-sm text-content-faint">
              {input ? t('invalid_input') : t('empty_output')}
            </p>
          )}
        </section>
      </div>

      <section className="mt-4 flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
        <h2 className="text-lg font-semibold text-content">{t('batch_title')}</h2>
        <textarea
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          placeholder={t('batch_placeholder')}
          className="min-h-32 w-full resize-y rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
        />
        {batchLines.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-content-faint">
                  <th className="py-2 pr-3">Input</th>
                  <th className="py-2 pr-3">{t('unit_milliseconds')}</th>
                  <th className="py-2 pr-3">{t('date_label')}</th>
                </tr>
              </thead>
              <tbody className="text-content-secondary">
                {batchLines.map((line, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="py-2 pr-3 font-mono">{line.raw}</td>
                    <td className="py-2 pr-3 font-mono">{line.outcome.ok ? line.outcome.milliseconds : '—'}</td>
                    <td className="py-2 pr-3 font-mono">{line.outcome.ok ? formatDate(line.outcome.date, timezone) : t('invalid_input')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ToolLayout>
  );
}

function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(value).catch(() => {});
  }
}

function StatBlock({ label, value, onCopy, copyLabel }: { label: string; value: string; onCopy: () => void; copyLabel: string }) {
  return (
    <div className="rounded border border-border-subtle bg-surface-raised p-3">
      <p className="text-xs uppercase tracking-normal text-content-faint">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-lg text-content">{value}</p>
        <button
          type="button"
          onClick={onCopy}
          className="rounded border border-border-subtle bg-surface px-2 py-1 text-xs text-content-muted hover:border-border-strong hover:text-content"
        >
          {copyLabel}
        </button>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border-subtle py-2 last:border-b-0">
      <span className="text-xs uppercase tracking-normal text-content-faint">{label}</span>
      <span className="text-right font-mono text-content-secondary">{value}</span>
    </div>
  );
}
