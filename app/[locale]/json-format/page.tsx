'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { JsonNode } from '@/components/JsonNode';
import {
  deleteTopLevelJSONEntry,
  formatJSON,
  minifyJSON,
  parseJSONValue,
  stringifyJSONValue,
  unicodeDecode,
  unicodeEncode,
  urlDecode,
} from '@/lib/utils/json';

const EXAMPLE_JSON = {
  name: 'JSON Toolkit', version: '1.0.0',
  features: ['format', 'minify', 'validate'],
  settings: { theme: 'dark', indentSize: 2 },
  isActive: true, lastUpdated: new Date().toISOString(),
};

export default function JsonFormatPage() {
  const t = useTranslations('tools.json-format');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(true);

  const applyFormat = useCallback((raw: string) => {
    const r = formatJSON(raw);
    if (!r.ok) { setError(r.message); setOutput(''); }
    else { setOutput(r.output); setError(''); setAllExpanded(true); setExpanded({}); }
  }, []);

  const handleMinify = () => {
    const r = minifyJSON(input);
    if (!r.ok) { setError(r.message); setOutput(''); } else { setOutput(r.output); setError(''); }
  };
  const handleUrlDecode = () => { try { setInput(urlDecode(input)); setError(''); } catch { setError('URL decode failed'); } };
  const handleUnicodeEncode = () => { try { setInput(unicodeEncode(input)); setError(''); } catch { setError('Encode failed'); } };
  const handleUnicodeDecode = () => { try { setInput(unicodeDecode(input)); setError(''); } catch { setError('Decode failed'); } };
  const handleClear = () => { setInput(''); setOutput(''); setError(''); setExpanded({}); };
  const handleExample = () => { const s = stringifyJSONValue(EXAMPLE_JSON, 2); setInput(s); setOutput(s); setError(''); setAllExpanded(true); setExpanded({}); };
  const handleCopy = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = async () => {
    if (!output) return;
    const { saveAs } = await import('file-saver');
    saveAs(new Blob([output], { type: 'application/json' }), 'formatted.json');
  };
  const handleDeleteNode = (keyName?: string) => {
    if (!output) return;
    const r = deleteTopLevelJSONEntry(output, keyName);
    if (!r.ok) { setError(r.message); return; }
    setOutput(r.output);
    setInput(r.output);
  };

  useEffect(() => { const timer = setTimeout(() => applyFormat(input), 300); return () => clearTimeout(timer); }, [input, applyFormat]);

  const inputActions = (
    <>
      <Button onClick={() => applyFormat(input)}>{t('format')}</Button>
      <Button onClick={handleMinify}>{t('minify')}</Button>
      <Button onClick={handleUrlDecode}>{t('url_decode')}</Button>
      <Button onClick={handleUnicodeEncode}>{t('uni_encode')}</Button>
      <Button onClick={handleUnicodeDecode}>{t('uni_decode')}</Button>
      <Button variant="secondary" onClick={handleClear}>{tc('clear')}</Button>
      <Button variant="secondary" onClick={handleExample}>{tc('example')}</Button>
    </>
  );
  const outputActions = (
    <>
      <Button onClick={handleCopy} disabled={!output && !error}>{copied ? tc('copied') : tc('copy')}</Button>
      <Button onClick={handleDownload} disabled={!output}>{tc('download')}</Button>
      <Button onClick={() => { setAllExpanded(!allExpanded); setExpanded({}); }} disabled={!output}>
        {allExpanded ? t('collapse_all') : t('expand_all')}
      </Button>
    </>
  );
  const parsedOutput = output ? parseJSONValue(output) : null;

  return (
    <ToolLayout toolId="json-format">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} actions={inputActions} className="min-h-64 lg:min-h-0">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel title={t('output_title')} actions={outputActions} className="min-h-64 lg:min-h-0">
          <div className="border border-border-input rounded flex-grow p-3 bg-surface-raised overflow-auto">
            {error ? <div className="flex items-center justify-center h-full text-syntax-null text-sm">{error}</div>
              : parsedOutput?.ok ? <JsonNode data={parsedOutput.parsed} level={0} expanded={expanded} setExpanded={setExpanded} onDelete={handleDeleteNode} allExpanded={allExpanded} />
              : <div className="flex items-center justify-center h-full text-content-faint text-sm">{t('empty_output')}</div>}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
