'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { jsonToXml, xmlToJson } from '@/lib/utils/xml';
import { jsonXmlContent } from '@/lib/tools/content/json-xml';

export default function JsonXmlPage() {
  const t = useTranslations('tools.json-xml');
  const tc = useTranslations('common');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [error, setError] = useState('');
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);

  const convert = (fn: (s: string) => { ok: true; output: string } | { ok: false; message: string }, from: string, setSide: (v: string) => void) => {
    const r = fn(from); if (r.ok) { setSide(r.output); setError(''); } else { setSide(''); setError(r.message); }
  };
  const updateJson = (value: string) => {
    setLeft(value);
    convert(jsonToXml, value, setRight);
  };
  const updateXml = (value: string) => {
    setRight(value);
    convert(xmlToJson, value, setLeft);
  };
  const copy = async (text: string, side: 'left' | 'right') => {
    await navigator.clipboard.writeText(text); setCopiedSide(side); setTimeout(() => setCopiedSide(null), 2000);
  };

  return (
    <ToolLayout toolId="json-xml" content={jsonXmlContent}>
      {error && <p className="mb-3 text-sm text-syntax-null bg-danger-surface border border-border-base rounded px-3 py-2">{error}</p>}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title="JSON" actions={<>
          <Button variant="secondary" onClick={() => updateJson('')}>{tc('clear')}</Button>
          <Button variant="secondary" onClick={() => copy(left, 'left')}>{copiedSide === 'left' ? tc('copied') : tc('copy')}</Button>
        </>} className="min-h-64">
          <textarea value={left} onChange={(e) => updateJson(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('json_placeholder')} />
        </Panel>
        <Panel title="XML" actions={<>
          <Button variant="secondary" onClick={() => updateXml('')}>{tc('clear')}</Button>
          <Button variant="secondary" onClick={() => copy(right, 'right')}>{copiedSide === 'right' ? tc('copied') : tc('copy')}</Button>
        </>} className="min-h-64">
          <textarea value={right} onChange={(e) => updateXml(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('xml_placeholder')} />
        </Panel>
      </div>
    </ToolLayout>
  );
}
