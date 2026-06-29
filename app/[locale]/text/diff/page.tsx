'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { compareText, countTextStats, InlineTextDiffPart, TextDiffRow, TextDiffType } from '@/lib/utils/text';

const leftCellStyles: Record<TextDiffType, string> = {
  added: 'bg-surface text-content-faint',
  removed: 'border-l-2 border-syntax-null bg-danger-surface text-danger-content',
  changed: 'border-l-2 border-syntax-number bg-surface-hover text-content-secondary',
  unchanged: 'bg-surface-raised text-content-muted',
};

const rightCellStyles: Record<TextDiffType, string> = {
  added: 'border-l-2 border-syntax-string bg-surface-hover text-syntax-string',
  removed: 'bg-surface text-content-faint',
  changed: 'border-l-2 border-syntax-number bg-surface-hover text-content-secondary',
  unchanged: 'bg-surface-raised text-content-muted',
};

const markerStyles: Record<TextDiffType, string> = {
  added: 'text-syntax-string',
  removed: 'text-syntax-null',
  changed: 'text-syntax-number',
  unchanged: 'text-content-faint',
};

function InlineParts({ parts }: { parts: InlineTextDiffPart[] }) {
  if (parts.length === 0) return <span className="text-content-faint"> </span>;

  return (
    <>
      {parts.map((part, index) => (
        <span
          key={`${part.type}-${index}`}
          className={
            part.type === 'added'
              ? 'rounded bg-surface-raised text-syntax-string'
              : part.type === 'removed'
                ? 'rounded bg-danger-surface text-danger-content'
                : undefined
          }
        >
          {part.value}
        </span>
      ))}
    </>
  );
}

function DiffCell({
  side,
  row,
}: {
  side: 'left' | 'right';
  row: TextDiffRow;
}) {
  const isLeft = side === 'left';
  const lineNumber = isLeft ? row.leftLineNumber : row.rightLineNumber;
  const parts = isLeft ? row.leftParts : row.rightParts;
  const text = isLeft ? row.leftText : row.rightText;
  const isBlank = text.length === 0 && ((isLeft && row.type === 'added') || (!isLeft && row.type === 'removed'));
  const marker = isLeft
    ? row.type === 'removed' ? '-' : row.type === 'changed' ? '~' : ' '
    : row.type === 'added' ? '+' : row.type === 'changed' ? '~' : ' ';
  const cellStyle = isLeft ? leftCellStyles[row.type] : rightCellStyles[row.type];

  return (
    <div className={`min-h-9 border-b border-border-subtle px-3 py-2 font-mono text-xs ${cellStyle}`}>
      <div className="grid grid-cols-[1.25rem_3rem_minmax(0,1fr)] gap-2">
        <span className={`font-bold ${markerStyles[row.type]}`}>{marker}</span>
        <span className="select-none text-right text-content-faint">{lineNumber ?? ''}</span>
        <span className={`whitespace-pre-wrap break-words ${isBlank ? 'text-content-faint' : ''}`}>
          {isBlank ? '' : <InlineParts parts={parts} />}
        </span>
      </div>
    </div>
  );
}

function DiffRows({ rows, emptyMessage }: { rows: TextDiffRow[]; emptyMessage: string }) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center p-6 text-center text-sm text-content-faint">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid min-w-[48rem] grid-cols-2">
      <div>
        {rows.map((row, index) => (
          <DiffCell key={`left-${index}`} side="left" row={row} />
        ))}
      </div>
      <div className="border-l border-border-base">
        {rows.map((row, index) => (
          <DiffCell key={`right-${index}`} side="right" row={row} />
        ))}
      </div>
    </div>
  );
}

function TextPane({
  title,
  value,
  placeholder,
  lineCount,
  clearLabel,
  onChange,
  onClear,
}: {
  title: string;
  value: string;
  placeholder: string;
  lineCount: number;
  clearLabel: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const t = useTranslations('tools.text-diff');

  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-border-base bg-surface p-4 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-content">{title}</h2>
          <p className="mt-1 text-xs text-content-faint">{t('line_count', { count: lineCount })}</p>
        </div>
        <Button variant="secondary" onClick={onClear} disabled={!value}>
          {clearLabel}
        </Button>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 h-56 resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-sm leading-6 text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
      />
    </section>
  );
}

export default function TextDiffPage() {
  const t = useTranslations('tools.text-diff');
  const tc = useTranslations('common');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [hideUnchanged, setHideUnchanged] = useState(false);
  const leftStats = useMemo(() => countTextStats(left), [left]);
  const rightStats = useMemo(() => countTextStats(right), [right]);
  const result = useMemo(
    () => (!left && !right ? null : compareText(left, right)),
    [left, right]
  );
  const visibleRows = useMemo(
    () => (result?.ok ? result.summary.rows.filter((row) => !(hideUnchanged && row.type === 'unchanged')) : []),
    [hideUnchanged, result]
  );

  return (
    <ToolLayout toolId="text-diff">
      <div className="flex min-h-0 flex-grow flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextPane
            title={t('left_title')}
            value={left}
            placeholder={t('left_placeholder')}
            lineCount={leftStats.lines}
            clearLabel={tc('clear')}
            onChange={setLeft}
            onClear={() => setLeft('')}
          />
          <TextPane
            title={t('right_title')}
            value={right}
            placeholder={t('right_placeholder')}
            lineCount={rightStats.lines}
            clearLabel={tc('clear')}
            onChange={setRight}
            onClear={() => setRight('')}
          />
        </div>

        {result?.ok ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-base bg-surface p-3">
            <span className="text-xs text-syntax-string">+{result.summary.added} {t('added')}</span>
            <span className="text-xs text-syntax-null">-{result.summary.removed} {t('removed')}</span>
            <span className="text-xs text-syntax-number">~{result.summary.changed} {t('changed')}</span>
            <span className="text-xs text-content-faint">={result.summary.unchanged} {t('unchanged')}</span>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-content-muted">
              <input
                type="checkbox"
                checked={hideUnchanged}
                onChange={(event) => setHideUnchanged(event.target.checked)}
              />
              {t('hide_unchanged')}
            </label>
          </div>
        ) : null}

        {result && !result.ok ? (
          <p className="rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">{result.message}</p>
        ) : null}

        <section className="min-h-0 flex-grow overflow-hidden rounded-lg border border-border-input bg-surface-raised shadow">
          <div className="grid border-b border-border-base bg-surface text-xs font-semibold uppercase tracking-normal text-content-faint lg:grid-cols-2">
            <div className="px-3 py-2">{t('left_result')}</div>
            <div className="border-t border-border-base px-3 py-2 lg:border-l lg:border-t-0">{t('right_result')}</div>
          </div>
          <div className="min-h-0 overflow-auto">
            <DiffRows rows={visibleRows} emptyMessage={result?.ok ? t('identical') : t('empty_result')} />
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
