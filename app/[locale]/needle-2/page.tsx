'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  completeWithNeedle2,
  parseNeedle2Schema,
  type Needle2Response,
} from '@/lib/utils/needle-2';
import { needle2Content } from '@/lib/tools/content/needle-2';

const DEFAULT_ENDPOINT = process.env.NEXT_PUBLIC_NEEDLE2_ENDPOINT || '/api/needle-2';

const EXAMPLE_INPUT = '订单号 A-1042，客户是李明，总额 328 元，状态已支付，包含机械键盘和 USB-C 线。';
const EXAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "order_id": { "type": "string", "description": "订单号" },
    "customer": { "type": "string", "description": "客户姓名" },
    "total": { "type": "number", "description": "订单总额" },
    "currency": { "type": "string", "enum": ["CNY", "USD", "EUR"] },
    "status": { "type": "string", "enum": ["paid", "pending", "cancelled"] },
    "items": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["order_id", "customer", "total", "status"]
}`;

function formatMetric(value: unknown, suffix: string): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value < 10 ? value.toFixed(2) : Math.round(value)}${suffix ? ` ${suffix}` : ''}`
    : null;
}

export default function Needle2Page() {
  const t = useTranslations('tools.needle-2');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [schema, setSchema] = useState('');
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [response, setResponse] = useState<Needle2Response | null>(null);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const schemaResult = useMemo(() => parseNeedle2Schema(schema), [schema]);
  const schemaState = schema.trim() ? schemaResult.ok : null;
  const firstCall = response?.function_calls?.[0];
  const confidence = formatMetric(response?.confidence, '');
  const decodeSpeed = formatMetric(response?.decode_tps, 'tok/s');
  const peakMemory = formatMetric(response?.peak_ram_mb, 'MB');

  useEffect(() => () => abortRef.current?.abort(), []);

  const resetResult = () => {
    setResponse(null);
    setOutput('');
    setError('');
    setCopied(false);
  };

  const loadExample = () => {
    setInput(EXAMPLE_INPUT);
    setSchema(EXAMPLE_SCHEMA);
    resetResult();
  };

  const clear = () => {
    abortRef.current?.abort();
    setLoading(false);
    setInput('');
    setSchema('');
    resetResult();
  };

  const generate = async () => {
    resetResult();
    if (!input.trim()) {
      setError(t('errors.empty_input'));
      return;
    }
    if (!schemaResult.ok) {
      setError(t('errors.invalid_schema', { detail: schemaResult.message || t('schema_invalid') }));
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const result = await completeWithNeedle2(endpoint, input, schemaResult.schema, controller.signal)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return null;
        return {
          ok: false as const,
          code: undefined,
          message: requestError instanceof Error ? requestError.message : String(requestError),
        };
      });

    if (!result) {
      setLoading(false);
      return;
    }
    if (result.ok) {
      setResponse(result.response);
      setOutput(result.output);
    } else {
      const detail = result.code === 'proxy_missing'
        ? t('errors.proxy_missing')
        : result.message;
      setError(t('errors.request_failed', { detail }));
    }
    setLoading(false);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout toolId="needle-2" content={needle2Content}>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <Panel
            title={t('input_title')}
            actions={
              <>
                <Button variant="secondary" onClick={loadExample}>{t('load_example')}</Button>
                <Button variant="secondary" onClick={clear}>{tc('clear')}</Button>
              </>
            }
            className="min-h-72"
          >
            <textarea
              value={input}
              onChange={(event) => { setInput(event.target.value); resetResult(); }}
              className="min-h-56 w-full flex-grow resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              placeholder={t('input_placeholder')}
              aria-label={t('input_title')}
            />
            <p className="mt-2 text-xs text-content-faint">{input.length} {t('characters')}</p>
          </Panel>

          <Panel title={t('schema_title')} className="min-h-72">
            <textarea
              value={schema}
              onChange={(event) => { setSchema(event.target.value); resetResult(); }}
              className="min-h-56 w-full flex-grow resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              placeholder={t('schema_placeholder')}
              aria-label={t('schema_title')}
              spellCheck={false}
            />
            <div className="mt-2 flex min-h-5 items-center justify-between gap-3 text-xs">
              {schemaState === true ? <span className="text-syntax-string">{t('schema_valid')}</span> : null}
              {schemaState === false ? <span className="text-syntax-null">{t('schema_invalid')}</span> : null}
              <span className="ml-auto text-content-faint">JSON Schema object</span>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border-subtle bg-surface px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-4">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="needle-2-endpoint" className="text-sm font-semibold text-content">{t('endpoint_label')}</label>
            <input
              id="needle-2-endpoint"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              className="min-h-10 w-full rounded border border-border-input bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              spellCheck={false}
            />
            <p className="text-xs leading-5 text-content-muted">{t('endpoint_hint')}</p>
          </div>
          <Button size="md" onClick={generate} disabled={loading || schemaState !== true || !input.trim()}>
            {loading ? t('generating') : t('generate')}
          </Button>
        </div>

        <Panel
          title={t('result_title')}
          actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>}
          className="min-h-72 flex-grow"
        >
          <div className="flex min-h-56 flex-grow flex-col overflow-auto rounded border border-border-input bg-surface-raised p-3">
            {loading ? (
              <div className="flex flex-grow flex-col gap-3" aria-live="polite">
                <div className="h-4 w-2/5 animate-pulse rounded bg-surface-hover" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-surface-hover" />
                <div className="h-4 w-3/5 animate-pulse rounded bg-surface-hover" />
              </div>
            ) : error ? (
              <p className="text-sm leading-6 text-syntax-null">{error}</p>
            ) : response && !firstCall ? (
              <div className="flex flex-grow items-center justify-center text-center text-sm text-content-muted">
                <p>{t('refused')}</p>
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-content-secondary">{output}</pre>
            ) : (
              <p className="flex flex-grow items-center justify-center text-center text-sm text-content-faint">{t('empty_output')}</p>
            )}
          </div>

          {response && (confidence || decodeSpeed || peakMemory || response.reasoning) ? (
            <div className="mt-3 grid gap-3 border-t border-border-subtle pt-3 sm:grid-cols-3">
              {confidence ? <div><p className="text-xs text-content-faint">{t('confidence')}</p><p className="mt-1 font-mono text-sm text-content-secondary">{confidence}</p></div> : null}
              {decodeSpeed ? <div><p className="text-xs text-content-faint">{t('decode_speed')}</p><p className="mt-1 font-mono text-sm text-content-secondary">{decodeSpeed}</p></div> : null}
              {peakMemory ? <div><p className="text-xs text-content-faint">{t('memory')}</p><p className="mt-1 font-mono text-sm text-content-secondary">{peakMemory}</p></div> : null}
            </div>
          ) : null}
          {response?.reasoning ? (
            <details className="mt-3 border-t border-border-subtle pt-3">
              <summary className="cursor-pointer text-sm font-medium text-content-secondary">{t('reasoning')}</summary>
              <p className="mt-2 text-sm leading-6 text-content-muted">{response.reasoning}</p>
            </details>
          ) : null}
        </Panel>

        <p className="text-xs leading-5 text-content-faint">{t('local_note')}</p>
      </div>
    </ToolLayout>
  );
}
