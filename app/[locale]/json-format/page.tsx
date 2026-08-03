'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { JsonNode } from '@/components/JsonNode';
import { jsonFormatContent } from '@/lib/tools/content/json-format';
import {
  deleteJSONEntryAtPath,
  formatJSON,
  type JSONPathSegment,
  minifyJSON,
  parseJSONValue,
  stringifyJSONValue,
  unicodeDecode,
  unicodeEncode,
  urlDecode,
  urlEncode,
} from '@/lib/utils/json';

type OutputMode = 'tree' | 'jsonText' | 'text';

const EXAMPLE_JSON = {
  name: 'JSON Toolkit', version: '1.0.0',
  features: ['format', 'minify', 'validate'],
  settings: { theme: 'dark', indentSize: 2 },
  isActive: true, lastUpdated: '2026-01-01T00:00:00.000Z',
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
  const [outputMode, setOutputMode] = useState<OutputMode>('tree');
  const autoFormatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAutoFormat = useCallback(() => {
    if (autoFormatTimerRef.current) {
      clearTimeout(autoFormatTimerRef.current);
      autoFormatTimerRef.current = null;
    }
  }, []);

  const applyFormat = useCallback((raw: string) => {
    const r = formatJSON(raw);
    if (!r.ok) { setError(r.message); setOutput(''); }
    else { setOutput(r.output); setOutputMode('tree'); setError(''); setAllExpanded(true); setExpanded({}); }
  }, []);

  const handleFormat = () => {
    cancelAutoFormat();
    applyFormat(input);
  };
  const handleMinify = () => {
    cancelAutoFormat();
    const r = minifyJSON(input);
    if (!r.ok) { setError(r.message); setOutput(''); } else { setOutput(r.output); setOutputMode('jsonText'); setError(''); }
  };
  const handleUrlEncode = () => { cancelAutoFormat(); try { setOutput(urlEncode(input)); setOutputMode('text'); setError(''); } catch { setError(t('url_encode_error')); setOutput(''); } };
  const handleUrlDecode = () => { cancelAutoFormat(); try { setOutput(urlDecode(input)); setOutputMode('text'); setError(''); } catch { setError(t('url_decode_error')); setOutput(''); } };
  const handleUnicodeEncode = () => { cancelAutoFormat(); try { setOutput(unicodeEncode(input)); setOutputMode('text'); setError(''); } catch { setError(t('encode_error')); setOutput(''); } };
  const handleUnicodeDecode = () => { cancelAutoFormat(); try { setOutput(unicodeDecode(input)); setOutputMode('text'); setError(''); } catch { setError(t('decode_error')); setOutput(''); } };
  const handleClear = () => { cancelAutoFormat(); setInput(''); setOutput(''); setError(''); setOutputMode('tree'); setExpanded({}); };
  const handleExample = () => { cancelAutoFormat(); const s = stringifyJSONValue(EXAMPLE_JSON, 2); setInput(s); setOutput(s); setOutputMode('tree'); setError(''); setAllExpanded(true); setExpanded({}); };
  const handleCopy = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = async () => {
    if (!output) return;
    const { saveAs } = await import('file-saver');
    const isJsonOutput = outputMode !== 'text';
    const type = isJsonOutput ? 'application/json' : 'text/plain';
    const filename = isJsonOutput ? 'formatted.json' : 'output.txt';
    saveAs(new Blob([output], { type }), filename);
  };
  const handleDeleteNode = (path: JSONPathSegment[]) => {
    if (!output) return;
    const r = deleteJSONEntryAtPath(output, path);
    if (!r.ok) { setError(r.message); return; }
    setOutput(r.output);
    setOutputMode('tree');
    setInput(r.output);
  };

  useEffect(() => {
    cancelAutoFormat();
    autoFormatTimerRef.current = setTimeout(() => {
      applyFormat(input);
      autoFormatTimerRef.current = null;
    }, 300);
    return cancelAutoFormat;
  }, [input, applyFormat, cancelAutoFormat]);

  const inputActions = (
    <>
      <Button onClick={handleFormat}>{t('format')}</Button>
      <Button onClick={handleMinify}>{t('minify')}</Button>
      <Button onClick={handleUrlEncode}>{t('url_encode')}</Button>
      <Button onClick={handleUrlDecode}>{t('url_decode')}</Button>
      <Button onClick={handleUnicodeEncode}>{t('uni_encode')}</Button>
      <Button onClick={handleUnicodeDecode}>{t('uni_decode')}</Button>
      <Button variant="secondary" onClick={handleClear}>{tc('clear')}</Button>
      <Button variant="secondary" onClick={handleExample}>{tc('example')}</Button>
    </>
  );
  const outputActions = (
    <>
      <Button onClick={handleCopy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>
      <Button onClick={handleDownload} disabled={!output}>{tc('download')}</Button>
      {outputMode === 'tree' && (
        <Button onClick={() => { setAllExpanded(!allExpanded); setExpanded({}); }} disabled={!output}>
          {allExpanded ? t('collapse_all') : t('expand_all')}
        </Button>
      )}
    </>
  );
  const parsedOutput = output && outputMode === 'tree' ? parseJSONValue(output) : null;

  return (
    <ToolLayout toolId="json-format" content={jsonFormatContent}>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} actions={inputActions} className="min-h-64 lg:min-h-0">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel title={t('output_title')} actions={outputActions} className="min-h-64 lg:min-h-0">
          <div className="border border-border-input rounded flex-grow p-3 bg-surface-raised overflow-auto">
            {error ? <div className="flex items-center justify-center h-full text-syntax-null text-sm">{error}</div>
              : parsedOutput?.ok ? (
                <JsonNode
                  data={parsedOutput.parsed}
                  level={0}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onDelete={handleDeleteNode}
                  allExpanded={allExpanded}
                  actionLabels={{ copy: tc('copy'), delete: tc('delete'), download: tc('download') }}
                />
              )
              : output ? <pre className="font-mono text-sm text-content-secondary whitespace-pre-wrap break-words">{output}</pre>
              : <div className="flex items-center justify-center h-full text-content-faint text-sm">{t('empty_output')}</div>}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
