'use client';
import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { excelBufferToJson } from '@/lib/utils/excel';

export default function ExcelToJsonPage() {
  const t = useTranslations('tools.excel-to-json');
  const tc = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const r = await excelBufferToJson(buffer);
      if (r.ok) { setOutput(r.output); setError(''); }
      else { setError(r.message); setOutput(''); }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = async () => {
    const { saveAs } = await import('file-saver');
    saveAs(new Blob([output], { type: 'application/json' }), 'output.json');
  };

  return (
    <ToolLayout toolId="excel-to-json">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Panel title={t('upload_title')} className="min-h-64">
          <div
            className="flex-grow border-2 border-dashed border-border-base rounded flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-border-strong hover:bg-surface-hover transition-all p-6"
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileChange} />
            <span
              aria-hidden="true"
              className="inline-flex h-12 w-14 items-center justify-center rounded border border-border-subtle bg-surface-raised font-mono text-sm font-semibold text-content-faint"
            >
              XLS
            </span>
            {fileName
              ? <p className="text-content font-medium">{fileName}</p>
              : <>
                  <p className="text-content-secondary font-medium">{t('drop_title')}</p>
                  <p className="text-content-faint text-sm">{t('drop_hint')}</p>
                </>
            }
          </div>
        </Panel>
        <Panel
          title={t('output_title')}
          actions={<>
            <Button onClick={copy} disabled={!output}>{copied ? tc('copied') : tc('copy')}</Button>
            <Button onClick={download} disabled={!output}>{tc('download_json')}</Button>
          </>}
          className="min-h-64"
        >
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
