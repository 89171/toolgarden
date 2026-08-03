'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { REGEX_TEMPLATES, runRegex } from '@/lib/utils/regex';
import { regexContent } from '@/lib/tools/content/regex';

const FLAG_KEYS = ['g', 'i', 'm', 's', 'u', 'y'] as const;
type FlagKey = (typeof FLAG_KEYS)[number];

export default function RegexPage() {
  const t = useTranslations('tools.regex');
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [text, setText] = useState('联系我们: hello@example.com, sales@toolgarden.xyz');
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>({ g: true, i: false, m: false, s: false, u: false, y: false });

  const flagString = FLAG_KEYS.filter((f) => flags[f]).join('');
  const outcome = useMemo(() => runRegex(pattern, flagString, text), [pattern, flagString, text]);

  return (
    <ToolLayout toolId="regex" content={regexContent}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('pattern_title')}</h2>
          <div className="flex items-center gap-2 rounded border border-border-input bg-surface-raised px-3 py-2">
            <span className="font-mono text-content-faint">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={t('pattern_placeholder')}
              className="flex-1 bg-transparent font-mono text-sm text-content focus:outline-none"
            />
            <span className="font-mono text-content-faint">/{flagString}</span>
          </div>

          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('flags_label')}</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FLAG_KEYS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlags((prev) => ({ ...prev, [f]: !prev[f] }))}
                  className={`rounded border px-2.5 py-1 text-xs ${
                    flags[f]
                      ? 'border-action bg-action text-white'
                      : 'border-border-input bg-surface-raised text-content-secondary'
                  }`}
                  title={t(`flag_${f}`)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('templates_label')}</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {REGEX_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    setPattern(tpl.pattern);
                    setFlags({ g: tpl.flags.includes('g'), i: tpl.flags.includes('i'), m: tpl.flags.includes('m'), s: tpl.flags.includes('s'), u: tpl.flags.includes('u'), y: tpl.flags.includes('y') });
                  }}
                  className="rounded border border-border-input bg-surface-raised px-2.5 py-1 text-xs text-content-secondary hover:border-border-strong hover:text-content"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <h2 className="mt-2 text-lg font-semibold text-content">{t('test_text_title')}</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('text_placeholder')}
            className="min-h-40 w-full resize-y rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
          />

          {outcome.ok && (
            <div className="rounded border border-border-subtle bg-surface-raised p-3 font-mono text-sm leading-6 text-content-secondary">
              {outcome.segments.length === 0 ? (
                <span className="text-content-faint">{t('no_matches')}</span>
              ) : (
                outcome.segments.map((seg, i) =>
                  seg.matched ? (
                    <mark key={i} className="rounded bg-action/25 px-0.5 text-content">
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )
              )}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
          {!pattern ? (
            <p className="text-sm text-content-faint">{t('empty_pattern')}</p>
          ) : !outcome.ok ? (
            <p className="text-sm text-danger-content">{t('invalid_pattern')}: {outcome.message}</p>
          ) : outcome.matches.length === 0 ? (
            <p className="text-sm text-content-faint">{t('no_matches')}</p>
          ) : (
            <>
              <p className="text-sm text-content-muted">{t('matches_count', { count: outcome.matches.length })}</p>
              <ul className="flex flex-col gap-2 overflow-auto">
                {outcome.matches.map((m, i) => (
                  <li key={i} className="rounded border border-border-subtle bg-surface-raised p-2">
                    <div className="flex justify-between text-xs text-content-faint">
                      <span>#{i + 1}</span>
                      <span>{t('index')}: {m.index}</span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-content break-all">{m.match}</p>
                    {m.groups.length > 0 && (
                      <div className="mt-1 text-xs text-content-muted">
                        {t('groups')}: {m.groups.map((g, gi) => `[${gi + 1}]=${g}`).join(', ')}
                      </div>
                    )}
                    {Object.keys(m.namedGroups).length > 0 && (
                      <div className="mt-1 text-xs text-content-muted">
                        {Object.entries(m.namedGroups).map(([k, v]) => `${k}=${v}`).join(', ')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}
