'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { queryJsonPath } from '@/lib/utils/jsonpath';
import { stringifyJSONValue } from '@/lib/utils/json';
import { jsonPathContent } from '@/lib/tools/content/json-path';

const EXAMPLE_JSON = stringifyJSONValue({
  store: {
    books: [
      { title: '活着', author: '余华', price: 35 },
      { title: '围城', author: '钱钟书', price: 42 },
      { title: '白夜行', author: '东野圭吾', price: 38 },
    ],
    total: 3,
  },
}, 2);

export default function JsonPathPage() {
  const t = useTranslations('tools.json-path');
  const tc = useTranslations('common');
  const [json, setJson] = useState(EXAMPLE_JSON);
  const [path, setPath] = useState('$.store.books[*].title');
  const [copied, setCopied] = useState(false);

  const EXAMPLE_PATHS = [
    { label: t('all_titles'), path: '$.store.books[*].title' },
    { label: t('price_filter'), path: '$.store.books[?(@.price > 36)]' },
    { label: t('first_book'), path: '$.store.books[0]' },
    { label: t('all_prices'), path: '$..price' },
  ];

  const result = useMemo(() => queryJsonPath(json, path), [json, path]);
  const output = result.ok ? result.output : '';
  const error = result.ok ? '' : result.message;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout toolId="json-path" content={jsonPathContent}>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} className="min-h-64">
          <textarea value={json} onChange={(e) => setJson(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary" />
        </Panel>
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-surface rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold mb-2 text-content-secondary">{t('path_title')}</h2>
            <div className="flex gap-2">
              <input value={path} onChange={(e) => setPath(e.target.value)}
                className="flex-grow p-2 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action font-mono text-sm bg-surface-raised text-content-secondary"
                placeholder={t('placeholder')} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {EXAMPLE_PATHS.map((ex) => (
                <button key={ex.path} onClick={() => setPath(ex.path)}
                  className="text-xs px-2 py-0.5 bg-surface-hover text-content-muted rounded hover:bg-action-muted transition-colors">
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
          <Panel title={t('result_title')} actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>} className="flex-grow min-h-0">
            <div className="border border-border-input rounded flex-grow p-3 bg-surface-raised overflow-auto">
              {error
                ? <p className="text-syntax-null text-sm">{error}</p>
                : output
                  ? <pre className="font-mono text-sm text-content-secondary whitespace-pre-wrap">{output}</pre>
                  : <p className="text-content-faint text-sm flex items-center justify-center h-full">{t('empty_output')}</p>
              }
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
