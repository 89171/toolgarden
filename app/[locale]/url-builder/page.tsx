'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { urlBuilderContent } from '@/lib/tools/content/url-builder';

interface Param {
  key: string;
  value: string;
}

interface Parsed {
  ok: boolean;
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  params: Param[];
}

function parseUrl(input: string): Parsed {
  try {
    const url = new URL(input);
    const params: Param[] = [];
    url.searchParams.forEach((value, key) => params.push({ key, value }));
    return {
      ok: true,
      protocol: url.protocol.replace(':', ''),
      host: url.host,
      pathname: url.pathname,
      hash: url.hash,
      params,
    };
  } catch {
    return { ok: false, protocol: '', host: '', pathname: '', hash: '', params: [] };
  }
}

function buildUrl(protocol: string, host: string, pathname: string, hash: string, params: Param[]): string {
  if (!host) return '';
  try {
    const url = new URL(`${protocol || 'https'}://${host}${pathname || ''}`);
    for (const { key, value } of params) {
      if (key) url.searchParams.append(key, value);
    }
    if (hash) url.hash = hash.startsWith('#') ? hash : `#${hash}`;
    return url.toString();
  } catch {
    return '';
  }
}

const INITIAL_INPUT = 'https://example.com/api/users?page=1&sort=asc#section';
const INITIAL_PARSED = parseUrl(INITIAL_INPUT);

export default function UrlBuilderPage() {
  const t = useTranslations('tools.url-builder');
  const tc = useTranslations('common');
  const [input, setInput] = useState(INITIAL_INPUT);
  const [protocol, setProtocol] = useState(INITIAL_PARSED.protocol || 'https');
  const [host, setHost] = useState(INITIAL_PARSED.host);
  const [pathname, setPathname] = useState(INITIAL_PARSED.pathname);
  const [hash, setHash] = useState(INITIAL_PARSED.hash);
  const [params, setParams] = useState<Param[]>(INITIAL_PARSED.params);

  const importFromInput = () => {
    const parsed = parseUrl(input);
    if (parsed.ok) {
      setProtocol(parsed.protocol);
      setHost(parsed.host);
      setPathname(parsed.pathname);
      setHash(parsed.hash);
      setParams(parsed.params);
    }
  };

  const built = buildUrl(protocol, host, pathname, hash, params);

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(built).catch(() => {});
    }
  };

  return (
    <ToolLayout toolId="url-builder" content={urlBuilderContent}>
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <h2 className="text-lg font-semibold text-content">{t('input_title')}</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('input_placeholder')}
              className="flex-1 rounded border border-border-input bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
            />
            <Button variant="secondary" onClick={importFromInput}>{tc('convert')}</Button>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
            <h2 className="text-lg font-semibold text-content">URL</h2>
            <Field label={t('protocol_label')} value={protocol} onChange={setProtocol} />
            <Field label={t('host_label')} value={host} onChange={setHost} />
            <Field label={t('pathname_label')} value={pathname} onChange={setPathname} />
            <Field label={t('hash_label')} value={hash} onChange={setHash} />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-content">{t('params_title')}</h2>
              <Button variant="secondary" onClick={() => setParams([...params, { key: '', value: '' }])}>
                {t('add_param')}
              </Button>
            </div>
            {params.length === 0 ? (
              <p className="text-sm text-content-faint">{t('empty_params')}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {params.map((p, i) => (
                  <li key={i} className="flex flex-wrap gap-2">
                    <input
                      value={p.key}
                      onChange={(e) => setParams(params.map((it, ii) => (ii === i ? { ...it, key: e.target.value } : it)))}
                      placeholder="key"
                      className="w-32 rounded border border-border-input bg-surface-raised px-2 py-1 font-mono text-sm"
                    />
                    <input
                      value={p.value}
                      onChange={(e) => setParams(params.map((it, ii) => (ii === i ? { ...it, value: e.target.value } : it)))}
                      placeholder="value"
                      className="flex-1 min-w-32 rounded border border-border-input bg-surface-raised px-2 py-1 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setParams(params.filter((_, ii) => ii !== i))}
                      className="rounded border border-border-input bg-surface-raised px-2 py-1 text-xs text-content-muted hover:border-danger-border hover:text-danger-content"
                    >
                      {t('remove_param')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content">{t('result_title')}</h2>
            {built && <Button variant="secondary" onClick={copy}>{tc('copy')}</Button>}
          </div>
          {built ? (
            <div className="break-all rounded border border-border-subtle bg-surface-raised p-3 font-mono text-sm text-content-secondary">
              {built}
            </div>
          ) : (
            <p className="text-sm text-content-faint">{t('invalid_url')}</p>
          )}
        </section>
      </div>
    </ToolLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-normal text-content-faint">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-border-input bg-surface-raised px-3 py-2 font-mono text-sm"
      />
    </div>
  );
}
