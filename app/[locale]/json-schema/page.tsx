'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { generateSchema } from '@/lib/utils/schema';
import { stringifyJSONValue } from '@/lib/utils/json';
import { jsonSchemaContent } from '@/lib/tools/content/json-schema';

const EXAMPLE = stringifyJSONValue({
  id: 1, name: '张三', email: 'zhang@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  roles: ['admin', 'user'],
  address: { city: '北京', zip: '100000' },
  isActive: true,
}, 2);

export default function JsonSchemaPage() {
  const t = useTranslations('tools.json-schema');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = useCallback((raw: string) => {
    const r = generateSchema(raw);
    if (r.ok) { setOutput(r.output); setError(''); }
    else { setError(r.message); setOutput(''); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (input.trim()) run(input); }, 400);
    return () => clearTimeout(timer);
  }, [input, run]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout toolId="json-schema" content={jsonSchemaContent}>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel
          title={t('input_title')}
          actions={<>
            <Button variant="secondary" onClick={() => setInput(EXAMPLE)}>{tc('example')}</Button>
            <Button variant="secondary" onClick={() => { setInput(''); setOutput(''); setError(''); }}>{tc('clear')}</Button>
          </>}
          className="min-h-64"
        >
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel title={t('output_title')} actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>} className="min-h-64">
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
    </ToolLayout>
  );
}
