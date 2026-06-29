'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { countTextStats } from '@/lib/utils/text';

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-lg border border-border-base bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-content-faint">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-content">{value.toLocaleString()}</p>
    </article>
  );
}

export default function TextWordCountPage() {
  const t = useTranslations('tools.text-word-count');
  const tc = useTranslations('common');
  const [text, setText] = useState('');
  const stats = useMemo(() => countTextStats(text), [text]);

  const statItems = [
    { label: t('characters'), value: stats.characters },
    { label: t('characters_no_spaces'), value: stats.charactersNoSpaces },
    { label: t('words'), value: stats.words },
    { label: t('cjk_characters'), value: stats.cjkCharacters },
    { label: t('lines'), value: stats.lines },
    { label: t('paragraphs'), value: stats.paragraphs },
    { label: t('sentences'), value: stats.sentences },
    { label: t('bytes'), value: stats.bytes },
    { label: t('reading_minutes'), value: stats.readingMinutes },
  ];

  return (
    <ToolLayout toolId="text-word-count">
      <div className="grid min-h-0 flex-grow gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section className="flex min-h-0 flex-col rounded-lg border border-border-base bg-surface p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-content">{t('input_title')}</h2>
            <Button variant="secondary" onClick={() => setText('')} disabled={!text}>
              {tc('clear')}
            </Button>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('placeholder')}
            className="mt-3 min-h-96 flex-grow resize-none rounded border border-border-input bg-surface-raised p-3 text-sm leading-6 text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
          />
        </section>

        <section className="flex min-h-0 flex-col rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {statItems.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
