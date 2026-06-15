'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { repairJson } from '@/lib/utils/repair';

const EXAMPLE = `{
  // Comments are removed
  user: '张三',
  active: True,
  roles: ['admin', 'editor',],
}`;

export default function JsonRepairPage() {
  const t = useTranslations('tools.json-repair');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const runRepair = (raw: string) => {
    const result = repairJson(raw);
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
    runRepair(value);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout toolId="json-repair">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel
          title={t('input_title')}
          actions={<>
            <Button variant="secondary" onClick={() => updateInput(EXAMPLE)}>{tc('example')}</Button>
            <Button variant="secondary" onClick={() => updateInput('')}>{tc('clear')}</Button>
          </>}
          className="min-h-64"
        >
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
