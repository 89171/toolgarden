'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { computeDiff, DiffLine, DiffType } from '@/lib/utils/diff';
import { stringifyJSONValue } from '@/lib/utils/json';

const leftCellStyles: Record<DiffType, string> = {
  added: 'bg-surface text-content-faint',
  removed: 'bg-danger-surface text-danger-content border-l-2 border-syntax-null',
  changed: 'bg-surface-hover text-content-secondary border-l-2 border-syntax-number',
  unchanged: 'bg-surface-raised text-content-muted',
};

const rightCellStyles: Record<DiffType, string> = {
  added: 'bg-surface-hover text-syntax-string border-l-2 border-syntax-string',
  removed: 'bg-surface text-content-faint',
  changed: 'bg-surface-hover text-content-secondary border-l-2 border-syntax-number',
  unchanged: 'bg-surface-raised text-content-muted',
};

const leftMarker: Record<DiffType, string> = {
  added: '',
  removed: '-',
  changed: '~',
  unchanged: ' ',
};

const rightMarker: Record<DiffType, string> = {
  added: '+',
  removed: '',
  changed: '~',
  unchanged: ' ',
};

function DiffValue({ value }: { value: unknown }) {
  if (value === undefined) return <span className="text-content-faint"> </span>;
  return <span>{stringifyJSONValue(value)}</span>;
}

function DiffCell({
  marker,
  path,
  value,
  type,
  side,
}: {
  marker: string;
  path: string;
  value: unknown;
  type: DiffType;
  side: 'left' | 'right';
}) {
  const isBlank = (side === 'left' && type === 'added') || (side === 'right' && type === 'removed');
  const styles = side === 'left' ? leftCellStyles[type] : rightCellStyles[type];
  const sideBorder = side === 'right' ? 'lg:border-l lg:border-border-base' : '';

  return (
    <div className={`min-h-10 border-b border-border-subtle px-3 py-2 font-mono text-xs ${styles} ${sideBorder}`}>
      <div className="grid grid-cols-[1.25rem_minmax(7rem,14rem)_minmax(0,1fr)] gap-2">
        <span className="font-bold text-content-muted">{marker}</span>
        <span className="truncate text-content-faint" title={path || '$'}>{path || '$'}</span>
        <span className={isBlank ? 'text-content-faint' : 'break-words'}>
          {isBlank ? '' : <DiffValue value={value} />}
        </span>
      </div>
    </div>
  );
}

function SideBySideDiffRow({ line }: { line: DiffLine }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <DiffCell
        marker={leftMarker[line.type]}
        path={line.path}
        value={line.leftValue}
        type={line.type}
        side="left"
      />
      <DiffCell
        marker={rightMarker[line.type]}
        path={line.path}
        value={line.rightValue}
        type={line.type}
        side="right"
      />
    </div>
  );
}

function EditorPane({
  title,
  value,
  placeholder,
  clearLabel,
  onChange,
  onClear,
  side,
}: {
  title: string;
  value: string;
  placeholder: string;
  clearLabel: string;
  onChange: (value: string) => void;
  onClear: () => void;
  side: 'left' | 'right';
}) {
  const sideBorder = side === 'right' ? 'lg:border-l lg:border-border-base' : '';

  return (
    <div className={`border-b border-border-base bg-surface p-4 ${sideBorder}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-content">{title}</h2>
        <Button variant="secondary" onClick={onClear}>{clearLabel}</Button>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-44 w-full resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
        placeholder={placeholder}
      />
    </div>
  );
}

export default function JsonDiffPage() {
  const t = useTranslations('tools.json-diff');
  const tc = useTranslations('common');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [hideUnchanged, setHideUnchanged] = useState(false);
  const result = useMemo(
    () => (!left.trim() && !right.trim() ? null : computeDiff(left, right)),
    [left, right]
  );
  const visibleLines = useMemo(
    () => (result?.ok ? result.summary.lines.filter((line) => !(hideUnchanged && line.type === 'unchanged')) : []),
    [hideUnchanged, result]
  );

  return (
    <ToolLayout toolId="json-diff">
      <div className="flex-grow flex flex-col gap-4 min-h-0">
        {result?.ok && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-syntax-string">+{result.summary.added} {t('added')}</span>
            <span className="text-xs text-syntax-null">-{result.summary.removed} {t('removed')}</span>
            <span className="text-xs text-syntax-number">~{result.summary.changed} {t('changed')}</span>
            <span className="text-xs text-content-faint">={result.summary.unchanged} {t('unchanged')}</span>
            <label className="ml-auto flex items-center gap-1 text-xs text-content-muted cursor-pointer">
              <input type="checkbox" checked={hideUnchanged} onChange={(event) => setHideUnchanged(event.target.checked)} />
              {t('hide_unchanged')}
            </label>
          </div>
        )}
        <div className="flex-grow overflow-auto rounded-lg border border-border-input bg-surface-raised shadow min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <EditorPane
              title={t('left_title')}
              value={left}
              placeholder={t('left_placeholder')}
              clearLabel={tc('clear')}
              onChange={setLeft}
              onClear={() => setLeft('')}
              side="left"
            />
            <EditorPane
              title={t('right_title')}
              value={right}
              placeholder={t('right_placeholder')}
              clearLabel={tc('clear')}
              onChange={setRight}
              onClear={() => setRight('')}
              side="right"
            />
          </div>
          {result && !result.ok && <p className="p-3 text-sm text-syntax-null">{result.message}</p>}
          {result?.ok && result.summary.lines.length === 0 && <p className="p-3 text-center text-sm text-content-faint">{t('identical')}</p>}
          {result?.ok && result.summary.lines.length > 0 && visibleLines.length === 0 && <p className="p-3 text-center text-sm text-content-faint">{t('identical')}</p>}
          {visibleLines.map((line, index) => <SideBySideDiffRow key={`${line.path}-${index}`} line={line} />)}
        </div>
      </div>
    </ToolLayout>
  );
}
