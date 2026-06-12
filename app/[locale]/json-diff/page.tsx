'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { computeDiff, DiffLine } from '@/lib/utils/diff';
import { stringifyJSONValue } from '@/lib/utils/json';

const typeStyles: Record<string, string> = {
  added: 'bg-surface border-l-2 border-syntax-string text-content-secondary',
  removed: 'bg-surface border-l-2 border-syntax-null text-content-secondary',
  changed: 'bg-surface border-l-2 border-syntax-number text-content-secondary',
  unchanged: 'text-content-faint',
};
const typeLabel: Record<string, string> = { added: '+', removed: '-', changed: '~', unchanged: '=' };

function DiffRow({ line }: { line: DiffLine }) {
  const cls = typeStyles[line.type];
  return (
    <div className={`flex gap-3 px-2 py-0.5 font-mono text-xs ${cls}`}>
      <span className="w-4 shrink-0 font-bold">{typeLabel[line.type]}</span>
      <span className="text-content-muted shrink-0 max-w-[200px] truncate">{line.path}</span>
      {line.type === 'changed' && <span><span className="line-through text-syntax-null mr-2">{stringifyJSONValue(line.leftValue)}</span><span className="text-syntax-string">{stringifyJSONValue(line.rightValue)}</span></span>}
      {line.type === 'added' && <span className="text-syntax-string">{stringifyJSONValue(line.rightValue)}</span>}
      {line.type === 'removed' && <span className="text-syntax-null">{stringifyJSONValue(line.leftValue)}</span>}
    </div>
  );
}

export default function JsonDiffPage() {
  const t = useTranslations('tools.json-diff');
  const tc = useTranslations('common');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [result, setResult] = useState<ReturnType<typeof computeDiff> | null>(null);
  const [hideUnchanged, setHideUnchanged] = useState(false);

  return (
    <ToolLayout toolId="json-diff">
      <div className="flex-grow flex flex-col gap-4 min-h-0">
        <div className="grid flex-grow grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 min-h-0">
          <Panel title={t('left_title')} actions={<Button variant="secondary" onClick={() => setLeft('')}>{tc('clear')}</Button>} className="h-full min-h-0">
            <textarea value={left} onChange={(e) => setLeft(e.target.value)}
              className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
              placeholder={t('left_placeholder')} />
          </Panel>
          <Panel title={t('right_title')} actions={<Button variant="secondary" onClick={() => setRight('')}>{tc('clear')}</Button>} className="h-full min-h-0">
            <textarea value={right} onChange={(e) => setRight(e.target.value)}
              className="w-full flex-grow p-3 border border-border-input rounded focus:outline-none focus:ring-2 focus:ring-action resize-none font-mono text-sm bg-surface-raised text-content-secondary"
              placeholder={t('right_placeholder')} />
          </Panel>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setResult(computeDiff(left, right))}>{t('compare')}</Button>
          {result?.ok && (
            <>
              <span className="text-xs text-syntax-string">+{result.summary.added} {t('added')}</span>
              <span className="text-xs text-syntax-null">-{result.summary.removed} {t('removed')}</span>
              <span className="text-xs text-syntax-number">~{result.summary.changed} {t('changed')}</span>
              <span className="text-xs text-content-faint">={result.summary.unchanged} {t('unchanged')}</span>
              <label className="ml-auto flex items-center gap-1 text-xs text-content-muted cursor-pointer">
                <input type="checkbox" checked={hideUnchanged} onChange={(e) => setHideUnchanged(e.target.checked)} />
                {t('hide_unchanged')}
              </label>
            </>
          )}
        </div>
        {result && (
          <div className="flex-grow border border-border-input rounded bg-surface-raised overflow-auto p-2 min-h-0">
            {!result.ok ? <p className="text-syntax-null text-sm p-2">{result.message}</p>
              : result.summary.lines.length === 0 ? <p className="text-content-faint text-sm p-2 text-center">{t('identical')}</p>
              : result.summary.lines.filter((l) => !(hideUnchanged && l.type === 'unchanged')).map((line, i) => <DiffRow key={i} line={line} />)}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
