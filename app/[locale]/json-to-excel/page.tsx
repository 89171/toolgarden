'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { jsonToExcelBuffer } from '@/lib/utils/excel';
import { stringifyJSONValue } from '@/lib/utils/json';

const EXAMPLE = stringifyJSONValue([{ name: '张三', age: 28, city: '北京', salary: 15000 }, { name: '李四', age: 32, city: '上海', salary: 20000 }], 2);

export default function JsonToExcelPage() {
  const t = useTranslations('tools.json-to-excel');
  const tc = useTranslations('common');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [rowCount, setRowCount] = useState<number | null>(null);

  const download = async () => {
    const r = await jsonToExcelBuffer(input);
    if (!r.ok) { setError(r.message); return; }
    setError('');
    setRowCount(Array.isArray(r.parsed) ? r.parsed.length : 0);
    const { saveAs } = await import('file-saver');
    saveAs(new Blob([r.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'export.xlsx');
  };

  return (
    <ToolLayout toolId="json-to-excel">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} actions={<>
          <Button onClick={download}>{t('download_excel')}</Button>
          <Button variant="secondary" onClick={() => { setInput(EXAMPLE); setError(''); setRowCount(null); }}>{tc('example')}</Button>
          <Button variant="secondary" onClick={() => { setInput(''); setError(''); setRowCount(null); }}>{tc('clear')}</Button>
        </>} className="min-h-64">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel title={t('preview_title')} className="min-h-64">
          <div className="border border-border-input rounded flex-grow p-4 bg-surface-raised flex items-center justify-center">
            {error ? <p className="text-syntax-null text-sm">{error}</p>
              : rowCount !== null
                ? <div className="text-center"><p aria-hidden="true" className="mx-auto mb-2 inline-flex h-12 w-14 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">XLS</p><p className="text-content font-semibold">{t('success_title')}</p><p className="text-content-muted text-sm mt-1">{t('success_desc', { count: rowCount })}</p></div>
                : <div className="text-center text-content-faint"><p aria-hidden="true" className="mx-auto mb-2 inline-flex h-12 w-14 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold">XLS</p><p className="text-sm">{t('idle_desc')}</p></div>}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
