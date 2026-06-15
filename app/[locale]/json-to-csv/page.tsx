'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { jsonToCsv } from '@/lib/utils/csv';
import { stringifyJSONValue } from '@/lib/utils/json';

const EXAMPLE = stringifyJSONValue([{ name: '张三', age: 28, city: '北京' }, { name: '李四', age: 32, city: '上海' }], 2);

export default function JsonToCsvPage() {
  const t = useTranslations('tools.json-to-csv');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = (raw: string) => {
    const r = jsonToCsv(raw);
    if (r.ok) { setOutput(r.output); setError(''); } else { setError(r.message); setOutput(''); }
  };
  const updateInput = (value: string) => {
    setInput(value);
    run(value);
  };
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = async () => {
    const { saveAs } = await import('file-saver');
    saveAs(new Blob([output], { type: 'text/csv;charset=utf-8' }), 'export.csv');
  };

  return (
    <ToolLayout toolId="json-to-csv">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} actions={<>
          <Button variant="secondary" onClick={() => updateInput(EXAMPLE)}>{tc('example')}</Button>
          <Button variant="secondary" onClick={() => updateInput('')}>{tc('clear')}</Button>
        </>} className="min-h-64">
          <textarea value={input} onChange={(e) => updateInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel title={t('output_title')} actions={<>
          <Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>
          <Button onClick={download} disabled={!output}>{t('download_csv')}</Button>
        </>} className="min-h-64">
          <div className="border border-border-input rounded flex-grow p-3 bg-surface-raised overflow-auto">
            {error ? <p className="text-syntax-null text-sm">{error}</p>
              : output ? <pre className="font-mono text-sm text-content-secondary whitespace-pre-wrap">{output}</pre>
              : <p className="text-content-faint text-sm flex items-center justify-center h-full">{t('empty_output')}</p>}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
