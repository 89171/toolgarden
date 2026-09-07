'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { zipExtractContent } from '@/lib/tools/content/zip-extract';
import { extractZipArchive, type ZipExtractedEntry, type ZipExtractionOutcome } from '@/lib/utils/zip';
import { formatFileSize } from '@/lib/utils/image';

interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  entry?: ZipExtractedEntry;
}

function createTree(entries: ZipExtractedEntry[]): TreeNode {
  const root: TreeNode = { name: '', path: '', children: new Map() };

  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      const existing = current.children.get(part);
      const next: TreeNode = existing ?? { name: part, path, children: new Map() };
      if (index === parts.length - 1) next.entry = entry;
      current.children.set(part, next);
      current = next;
    });
  }

  return root;
}

function getExpandedDefaults(entries: ZipExtractedEntry[]): Set<string> {
  const expanded = new Set<string>();
  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    for (let index = 1; index < parts.length; index += 1) {
      expanded.add(parts.slice(0, index).join('/'));
    }
  }
  return expanded;
}

function TreeRow({
  depth,
  expanded,
  node,
  onDownload,
  onToggle,
}: {
  depth: number;
  expanded: Set<string>;
  node: TreeNode;
  onDownload: (entry: ZipExtractedEntry) => void;
  onToggle: (path: string) => void;
}) {
  const t = useTranslations('tools.zip-extract');
  const isDirectory = !node.entry;
  const isExpanded = expanded.has(node.path);
  const children = Array.from(node.children.values()).sort((left, right) => {
    if (Boolean(left.entry) !== Boolean(right.entry)) return left.entry ? 1 : -1;
    return left.name.localeCompare(right.name);
  });

  return (
    <>
      <div
        className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle px-3 py-2 last:border-b-0"
        style={{ paddingLeft: `${12 + depth * 18}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isDirectory ? (
            <button
              type="button"
              onClick={() => onToggle(node.path)}
              className="flex size-6 shrink-0 items-center justify-center rounded border border-border-base bg-surface-hover text-xs text-content-secondary hover:border-border-strong"
              aria-label={isExpanded ? t('collapse_dir') : t('expand_dir')}
            >
              {isExpanded ? '-' : '+'}
            </button>
          ) : (
            <span className="size-6 shrink-0" />
          )}
          <span className="shrink-0 font-mono text-xs text-content-faint">{isDirectory ? 'DIR' : 'FILE'}</span>
          <span className="min-w-0 truncate text-sm text-content-secondary" title={node.path}>
            {node.name}
          </span>
        </div>
        {node.entry ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs text-content-muted sm:inline">{formatFileSize(node.entry.size)}</span>
            <Button variant="secondary" onClick={() => onDownload(node.entry as ZipExtractedEntry)}>
              {t('download_file')}
            </Button>
          </div>
        ) : (
          <span className="text-xs text-content-muted">{t('file_count', { count: children.length })}</span>
        )}
      </div>
      {isDirectory && isExpanded
        ? children.map((child) => (
            <TreeRow
              key={child.path}
              depth={depth + 1}
              expanded={expanded}
              node={child}
              onDownload={onDownload}
              onToggle={onToggle}
            />
          ))
        : null}
    </>
  );
}

export function ZipExtractTool() {
  const t = useTranslations('tools.zip-extract');
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadUrlsRef = useRef<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ZipExtractionOutcome | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const tree = useMemo(
    () => (result?.ok ? createTree(result.entries) : null),
    [result]
  );

  useEffect(() => () => {
    for (const url of downloadUrlsRef.current) URL.revokeObjectURL(url);
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    const outcome = await extractZipArchive(file);
    setResult(outcome);
    setExpanded(outcome.ok ? getExpandedDefaults(outcome.entries) : new Set());
    setIsProcessing(false);
  }

  function clearFile() {
    setSelectedFile(null);
    setResult(null);
    setExpanded(new Set());
    if (inputRef.current) inputRef.current.value = '';
  }

  function toggleDirectory(path: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function downloadEntry(entry: ZipExtractedEntry) {
    const url = URL.createObjectURL(entry.blob);
    downloadUrlsRef.current.push(url);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = entry.name;
    anchor.click();
  }

  const errorMessage = result && !result.ok
    ? result.message || t(`errors.${result.code}`)
    : '';

  return (
    <ToolLayout toolId="zip-extract" content={zipExtractContent}>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]">
        <Panel
          title={t('input_title')}
          actions={
            <>
              <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                {t('choose_zip')}
              </Button>
              <Button variant="secondary" onClick={clearFile} disabled={!selectedFile || isProcessing}>
                {t('clear')}
              </Button>
            </>
          }
        >
          <label
            className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-input bg-surface-raised p-6 text-center transition-colors hover:border-border-strong hover:bg-surface-hover"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void handleFile(event.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            <span className="font-medium text-content">{t('drop_title')}</span>
            <span className="mt-2 max-w-xl text-sm leading-relaxed text-content-muted">{t('drop_hint')}</span>
          </label>

          <div className="mt-4 rounded border border-border-subtle bg-surface-raised p-4 text-sm text-content-secondary">
            {selectedFile ? (
              <div className="grid gap-2">
                <span className="font-medium text-content">{selectedFile.name}</span>
                <span>{t('selected_size', { size: formatFileSize(selectedFile.size) })}</span>
              </div>
            ) : (
              <span className="text-content-muted">{t('empty_input')}</span>
            )}
          </div>
        </Panel>

        <Panel title={t('output_title')}>
          {isProcessing ? (
            <div className="flex min-h-64 items-center justify-center rounded border border-border-subtle bg-surface-raised text-sm text-content-muted">
              {t('extracting')}
            </div>
          ) : tree && result?.ok ? (
            <>
              <div className="mb-3 grid gap-2 rounded border border-border-subtle bg-surface-raised p-3 text-sm text-content-secondary sm:grid-cols-3">
                <span>{t('result_files', { count: result.fileCount })}</span>
                <span>{t('result_size', { size: formatFileSize(result.totalSize) })}</span>
                <span>{t('result_duration', { ms: result.durationMs })}</span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto rounded border border-border-subtle bg-surface-raised">
                {Array.from(tree.children.values()).map((child) => (
                  <TreeRow
                    key={child.path}
                    depth={0}
                    expanded={expanded}
                    node={child}
                    onDownload={downloadEntry}
                    onToggle={toggleDirectory}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded border border-border-subtle bg-surface-raised p-6 text-center">
              <div className="font-medium text-content">{t('empty_title')}</div>
              <div className="mt-2 text-sm text-content-muted">{t('empty_body')}</div>
            </div>
          )}

          {errorMessage ? (
            <div className="mt-4 rounded border border-border-base bg-danger-surface p-3 text-sm text-danger-content">
              {errorMessage}
            </div>
          ) : null}
        </Panel>
      </div>
    </ToolLayout>
  );
}
