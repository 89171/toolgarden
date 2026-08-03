'use client';
import React, { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { ToolSwitchLinks } from '@/components/ToolSwitchLinks';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import {
  jsonToExcelBuffer,
  previewJsonToExcelTable,
  type ExcelTablePreviewOutcome,
} from '@/lib/utils/excel';
import { stringifyJSONValue } from '@/lib/utils/json';
import { jsonToExcelContent } from '@/lib/tools/content/json-to-excel';

const EXAMPLE = stringifyJSONValue(
  [
    {
      order_id: 'ORD-1001',
      customer: {
        name: 'Acme Operations',
        address: {
          city: 'London',
          country: 'UK',
        },
      },
      items: [
        {
          sku: 'API-EXPORT',
          quantity: 3,
          tags: ['reporting', 'finance'],
        },
      ],
      status: 'paid',
    },
  ],
  2
);

export default function JsonToExcelPage() {
  const locale = useLocale();
  const t = useTranslations('tools.json-to-excel');
  const tc = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ExcelTablePreviewOutcome | null>(null);

  const updateInput = (value: string) => {
    setInput(value);
    const nextPreview = previewJsonToExcelTable(value);
    if (nextPreview.ok) {
      setRowCount(nextPreview.rowCount);
      setPreview(nextPreview);
      setError('');
    } else {
      setRowCount(null);
      setPreview(nextPreview);
      setError(nextPreview.message);
    }
  };

  const loadJsonFile = async (file: File) => {
    setFileName(file.name);
    try {
      const text = await file.text();
      updateInput(text);
    } catch {
      setInput('');
      setRowCount(null);
      setPreview(null);
      setError(t('errors.load_failed'));
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadJsonFile(file);
    }
    event.target.value = '';
  };

  const download = async () => {
    const r = await jsonToExcelBuffer(input);
    if (!r.ok) { setError(r.message); return; }
    setError('');
    setRowCount(Array.isArray(r.parsed) ? r.parsed.length : 0);
    const { saveAs } = await import('file-saver');
    saveAs(new Blob([r.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'export.xlsx');
  };

  return (
    <ToolLayout toolId="json-to-excel" content={jsonToExcelContent}>
      <ToolSwitchLinks
        ariaLabel={t('switcher_label')}
        currentKey="json-to-excel"
        links={[
          {
            key: 'json-to-excel',
            href: `/${locale}/json-to-excel`,
            label: t('name'),
          },
          {
            key: 'excel-to-json',
            href: `/${locale}/excel-to-json`,
            label: t('reverse_link'),
          },
        ]}
      />
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('input_title')} actions={<>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/json"
            className="hidden"
            onChange={onFileChange}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>{t('upload_json')}</Button>
          <Button variant="secondary" onClick={() => updateInput(EXAMPLE)}>{tc('example')}</Button>
          <Button variant="secondary" onClick={() => { setFileName(''); updateInput(''); }}>{tc('clear')}</Button>
        </>} className="min-h-64">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-content-faint">
            <span>{t('input_hint')}</span>
            {fileName ? <span className="truncate text-right text-content-secondary">{fileName}</span> : null}
          </div>
          <textarea value={input} onChange={(e) => updateInput(e.target.value)}
            className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
            placeholder={t('placeholder')} />
        </Panel>
        <Panel
          title={t('preview_title')}
          actions={<Button onClick={download} disabled={!input.trim() || Boolean(error)}>{t('download_excel')}</Button>}
          className="min-h-64"
        >
          <div className="flex flex-grow min-h-0 flex-col gap-3">
            {error ? <p className="text-syntax-null text-sm">{error}</p>
              : preview?.ok
                ? <>
                    <div className="flex items-center justify-between gap-3 text-sm text-content-muted">
                      <p>{t('preview_summary', { count: rowCount ?? preview.rowCount })}</p>
                      {preview.truncated ? <p>{t('preview_truncated', { count: preview.rows.length })}</p> : null}
                    </div>
                    <div className="flex-grow min-h-0 overflow-auto rounded border border-border-input bg-surface-raised">
                      <table className="min-w-max w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-surface">
                          <tr>
                            <th className="border-b border-border-subtle px-3 py-2 text-left font-medium text-content-faint">#</th>
                            {preview.columns.map((column) => (
                              <th key={column} className="border-b border-border-subtle px-3 py-2 text-left font-medium text-content-faint">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.rows.map((row, index) => (
                            <tr key={index} className="odd:bg-surface-raised even:bg-surface-hover/40">
                              <td className="border-b border-border-subtle px-3 py-2 text-content-faint">{index + 1}</td>
                              {preview.columns.map((column) => {
                                const value = row[column];
                                const text = value === undefined || value === null
                                  ? ''
                                  : typeof value === 'string'
                                    ? value
                                    : JSON.stringify(value);

                                return (
                                  <td key={column} className="border-b border-border-subtle px-3 py-2 align-top text-content-secondary">
                                    <span className="block max-w-[280px] truncate" title={text}>
                                      {text}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                : <div className="border border-border-input rounded flex-grow p-4 bg-surface-raised flex items-center justify-center"><div className="text-center text-content-faint"><p aria-hidden="true" className="mx-auto mb-2 inline-flex h-12 w-14 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold">XLS</p><p className="text-sm">{t('idle_desc')}</p></div></div>}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
