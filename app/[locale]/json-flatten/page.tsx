'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { flattenJson, unflattenJson } from '@/lib/utils/flatten';
import { stringifyJSONValue } from '@/lib/utils/json';

const EXAMPLE = stringifyJSONValue({
  user: {
    name: '张三',
    roles: ['admin', 'editor'],
    profile: { city: '北京' },
  },
}, 2);

type FlattenMode = 'flatten' | 'unflatten';

export default function JsonFlattenPage() {
  const t = useTranslations('tools.json-flatten');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState('.');
  const [mode, setMode] = useState<FlattenMode>('flatten');
  const [copied, setCopied] = useState(false);

  const run = (raw: string, nextMode = mode, nextDelimiter = delimiter) => {
    const result = nextMode === 'flatten'
      ? flattenJson(raw, nextDelimiter)
      : unflattenJson(raw, nextDelimiter);

    if (result.ok) {
      setOutput(result.output);
      setError('');
    } else {
      setOutput('');
      setError(result.message);
    }
  };

  const updateInput = (value: string) => {
    setInput(value);
    run(value);
  };

  const updateDelimiter = (value: string) => {
    setDelimiter(value);
    run(input, mode, value);
  };

  const selectMode = (nextMode: FlattenMode) => {
    setMode(nextMode);
    run(input, nextMode);
  };

  const loadExample = () => {
    setMode('flatten');
    setInput(EXAMPLE);
    run(EXAMPLE, 'flatten');
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout toolId="json-flatten">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel
          title={t('input_title')}
          actions={<>
            <Button variant={mode === 'flatten' ? 'primary' : 'secondary'} onClick={() => selectMode('flatten')}>{t('flatten')}</Button>
            <Button variant={mode === 'unflatten' ? 'primary' : 'secondary'} onClick={() => selectMode('unflatten')}>{t('unflatten')}</Button>
            <Button variant="secondary" onClick={loadExample}>{tc('example')}</Button>
            <Button variant="secondary" onClick={() => updateInput('')}>{tc('clear')}</Button>
          </>}
          className="min-h-64"
        >
          <label className="mb-2 flex items-center gap-2 text-xs text-content-muted">
            {t('delimiter')}
            <input
              value={delimiter}
              onChange={(event) => updateDelimiter(event.target.value)}
              className="w-16 rounded border border-border-input bg-surface-raised px-2 py-1 font-mono text-content-secondary outline-none focus:ring-2 focus:ring-action"
            />
          </label>
          <textarea
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')}
          />
        </Panel>
        <Panel title={t('output_title')} actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>} className="min-h-64">
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
