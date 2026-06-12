'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { analyzeJson, JsonStats } from '@/lib/utils/stats';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border-base p-4">
      <p className="text-content-muted text-xs mb-1">{label}</p>
      <p className="text-content font-bold text-2xl">{value}</p>
      {sub && <p className="text-content-faint text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function JsonStatsPage() {
  const t = useTranslations('tools.json-stats');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<JsonStats | null>(null);
  const [error, setError] = useState('');

  const run = useCallback((raw: string) => {
    const r = analyzeJson(raw);
    if (r.ok) { setStats(r.stats); setError(''); }
    else { if (raw.trim()) setError(r.message); setStats(null); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => run(input), 400);
    return () => clearTimeout(timer);
  }, [input, run]);

  const typeEntries = stats
    ? Object.entries(stats.typeCounts).filter(([k]) => k !== 'object')
    : [];

  return (
    <ToolLayout toolId="json-stats">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel
          title={t('input_title')}
          actions={<Button variant="secondary" onClick={() => { setInput(''); setStats(null); setError(''); }}>{tc('clear')}</Button>}
          className="min-h-64"
        >
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <div className="flex flex-col gap-4 overflow-auto">
          {error && <p className="text-syntax-null text-sm bg-danger-surface border border-border-base rounded px-3 py-2">{error}</p>}
          {stats ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label={t('raw_size')} value={formatBytes(stats.rawBytes)}
                  sub={t('size_compressed', { size: formatBytes(stats.minifiedBytes), pct: Math.round((1 - stats.minifiedBytes / stats.rawBytes) * 100) })} />
                <StatCard label={t('max_depth')} value={stats.maxDepth} />
                <StatCard label={t('total_keys')} value={stats.totalKeys} />
                <StatCard label={t('object_array')} value={`${stats.objectCount} / ${stats.arrayCount}`} />
              </div>
              {typeEntries.length > 0 && (
                <div className="bg-surface rounded-lg border border-border-base p-4">
                  <p className="text-content-muted text-xs mb-3">{t('type_distribution')}</p>
                  <div className="flex flex-col gap-2">
                    {typeEntries.map(([type, count]) => {
                      const total = typeEntries.reduce((s, [, c]) => s + c, 0);
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-content-secondary">{type}</span>
                            <span className="text-content-muted">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-border-base rounded-full">
                            <div className="h-1.5 bg-action rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {stats.longestString.length > 0 && (
                <div className="bg-surface rounded-lg border border-border-base p-4">
                  <p className="text-content-muted text-xs mb-1">{t('longest_string')} ({stats.longestString.length})</p>
                  <p className="font-mono text-sm text-content-secondary truncate">&quot;{stats.longestString.value}&quot;</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-grow border border-border-base rounded bg-surface flex items-center justify-center text-content-faint text-sm">
              {t('empty_output')}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
