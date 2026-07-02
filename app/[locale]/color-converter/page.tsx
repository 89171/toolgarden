'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import {
  cmykString,
  hslString,
  hsvString,
  parseColor,
  rgbString,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from '@/lib/utils/color';

export default function ColorConverterPage() {
  const t = useTranslations('tools.color-converter');
  const tc = useTranslations('common');
  const [input, setInput] = useState('#5a67d8');

  const result = useMemo(() => {
    const outcome = parseColor(input);
    if (!outcome.ok) return { ok: false as const };
    const rgb = outcome.rgb;
    return {
      ok: true as const,
      rgb,
      hex: rgbToHex(rgb),
      rgbStr: rgbString(rgb),
      hslStr: hslString(rgbToHsl(rgb)),
      hsvStr: hsvString(rgbToHsv(rgb)),
      cmykStr: cmykString(rgbToCmyk(rgb)),
      cssValue: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
    };
  }, [input]);

  const copy = (value: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <ToolLayout toolId="color-converter">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('preview_title')}</h2>
          <div
            className="h-40 w-full rounded border border-border-subtle"
            style={{ background: result.ok ? result.cssValue : 'transparent' }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs uppercase tracking-normal text-content-faint">{t('picker_label')}</label>
            <input
              type="color"
              value={result.ok ? result.hex.slice(0, 7) : '#000000'}
              onChange={(e) => setInput(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-border-input bg-surface-raised"
            />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded border border-border-input bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
          />
          {!result.ok && <p className="text-sm text-danger-content">{t('invalid_color')}</p>}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('formats_title')}</h2>
          {result.ok && (
            <div className="grid gap-2">
              <ColorRow label={t('hex_label')} value={result.hex} onCopy={() => copy(result.hex)} copyLabel={tc('copy')} />
              <ColorRow label={t('rgb_label')} value={result.rgbStr} onCopy={() => copy(result.rgbStr)} copyLabel={tc('copy')} />
              <ColorRow label={t('hsl_label')} value={result.hslStr} onCopy={() => copy(result.hslStr)} copyLabel={tc('copy')} />
              <ColorRow label={t('hsv_label')} value={result.hsvStr} onCopy={() => copy(result.hsvStr)} copyLabel={tc('copy')} />
              <ColorRow label={t('cmyk_label')} value={result.cmykStr} onCopy={() => copy(result.cmykStr)} copyLabel={tc('copy')} />
            </div>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}

function ColorRow({ label, value, onCopy, copyLabel }: { label: string; value: string; onCopy: () => void; copyLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-border-subtle bg-surface-raised p-3">
      <span className="w-16 text-xs uppercase tracking-normal text-content-faint">{label}</span>
      <span className="flex-1 font-mono text-sm text-content-secondary">{value}</span>
      <button
        type="button"
        onClick={onCopy}
        className="rounded border border-border-subtle bg-surface px-2 py-1 text-xs text-content-muted hover:border-border-strong hover:text-content"
      >
        {copyLabel}
      </button>
    </div>
  );
}
