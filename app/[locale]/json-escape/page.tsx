'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { escapeJson, unescapeJson } from '@/lib/utils/escape';
import { jsonEscapeContent } from '@/lib/tools/content/json-escape';

type EscapeMode = 'escape' | 'unescape';

export default function JsonEscapePage() {
  const t = useTranslations('tools.json-escape');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<EscapeMode>('escape');

  const run = (raw: string, nextMode = mode) => {
    const r = nextMode === 'escape' ? escapeJson(raw) : unescapeJson(raw);
    if (r.ok) { setOutput(r.output); setError(''); } else { setError(r.message); setOutput(''); }
  };
  const updateInput = (value: string) => {
    setInput(value);
    run(value);
  };
  const selectMode = (nextMode: EscapeMode) => {
    setMode(nextMode);
    run(input, nextMode);
  };
  const copy = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <ToolLayout toolId="json-escape" content={jsonEscapeContent}>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} actions={<>
          <Button variant={mode === 'escape' ? 'primary' : 'secondary'} onClick={() => selectMode('escape')}>{t('escape')}</Button>
          <Button variant={mode === 'unescape' ? 'primary' : 'secondary'} onClick={() => selectMode('unescape')}>{t('unescape')}</Button>
          <Button variant="secondary" onClick={() => updateInput('')}>{tc('clear')}</Button>
        </>} className="min-h-64">
          <textarea value={input} onChange={(e) => updateInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel title={t('output_title')} actions={<Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>} className="min-h-64">
          <div className="border border-border-input rounded flex-grow p-3 bg-surface-raised overflow-auto">
            {error ? <p className="text-syntax-null text-sm">{error}</p>
              : output ? <pre className="font-mono text-sm text-content-secondary whitespace-pre-wrap break-all">{output}</pre>
              : <p className="text-content-faint text-sm flex items-center justify-center h-full">{tc('empty')}</p>}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
