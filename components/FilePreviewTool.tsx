'use client';

/* eslint-disable @next/next/no-img-element -- Local Blob URLs are rendered directly for previews. */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { filePreviewContent } from '@/lib/tools/content/file-preview';
import {
  formatPreviewMimeType,
  getFilePreviewKind,
  loadFilePreview,
  type FilePreviewData,
  type PreviewKind,
} from '@/lib/utils/file-preview';
import { extractZipArchive, type ZipExtractedEntry, type ZipExtractionOutcome } from '@/lib/utils/zip';
import { formatFileSize } from '@/lib/utils/image';

interface PreviewTarget {
  blob: File;
  name: string;
  size: number;
  type: string;
  source: 'file' | 'zip';
}

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
      const next: TreeNode = current.children.get(part) ?? {
        name: part,
        path,
        children: new Map<string, TreeNode>(),
      };
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

function createFileFromEntry(entry: ZipExtractedEntry): File {
  return new File([entry.blob], entry.path, { type: entry.blob.type || 'application/octet-stream' });
}

function getKindLabel(t: (key: string) => string, kind: PreviewKind): string {
  return t(`kinds.${kind}`);
}

function TreeRow({
  depth,
  expanded,
  node,
  selectedPath,
  onPreview,
  onToggle,
}: {
  depth: number;
  expanded: Set<string>;
  node: TreeNode;
  selectedPath: string;
  onPreview: (entry: ZipExtractedEntry) => void;
  onToggle: (path: string) => void;
}) {
  const t = useTranslations('tools.file-preview');
  const isDirectory = !node.entry;
  const isExpanded = expanded.has(node.path);
  const children = Array.from(node.children.values()).sort((left, right) => {
    if (Boolean(left.entry) !== Boolean(right.entry)) return left.entry ? 1 : -1;
    return left.name.localeCompare(right.name);
  });

  return (
    <>
      <div
        className={`grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border-subtle px-2 py-1.5 last:border-b-0 ${
          selectedPath === node.path ? 'bg-surface-hover' : ''
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isDirectory ? (
            <button
              type="button"
              onClick={() => onToggle(node.path)}
              className="flex size-6 shrink-0 items-center justify-center rounded border border-border-base bg-surface-hover text-xs text-content-secondary hover:border-border-strong"
              aria-label={isExpanded ? t('collapse_folder') : t('expand_folder')}
            >
              {isExpanded ? '−' : '+'}
            </button>
          ) : (
            <span className="size-6 shrink-0" />
          )}
          <span aria-hidden="true" className="shrink-0 font-mono text-xs text-content-faint">
            {isDirectory ? 'DIR' : 'FILE'}
          </span>
          {node.entry ? (
            <button
              type="button"
              onClick={() => onPreview(node.entry as ZipExtractedEntry)}
              className="min-w-0 truncate text-left text-sm text-content-secondary hover:text-content"
              title={node.path}
            >
              {node.name}
            </button>
          ) : (
            <span className="min-w-0 truncate text-sm text-content-secondary" title={node.path}>
              {node.name}
            </span>
          )}
        </div>
        {node.entry ? (
          <span className="shrink-0 text-xs text-content-muted">{formatFileSize(node.entry.size)}</span>
        ) : (
          <span className="text-xs text-content-muted">{t('folder_items', { count: children.length })}</span>
        )}
      </div>
      {isDirectory && isExpanded
        ? children.map((child) => (
            <TreeRow
              key={child.path}
              depth={depth + 1}
              expanded={expanded}
              node={child}
              selectedPath={selectedPath}
              onPreview={onPreview}
              onToggle={onToggle}
            />
          ))
        : null}
    </>
  );
}

function SpreadsheetTable({
  data,
  sheetIndex,
  onSheetChange,
}: {
  data: Extract<FilePreviewData, { ok: true; kind: 'spreadsheet' }>['spreadsheet'];
  sheetIndex: number;
  onSheetChange: (index: number) => void;
}) {
  const t = useTranslations('tools.file-preview');
  const sheet = data.sheets[sheetIndex] ?? data.sheets[0];
  if (!sheet) return <div className="p-6 text-sm text-content-muted">{t('empty_sheet')}</div>;

  const columnCount = Math.max(...sheet.rows.map((row) => row.length), 0);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap gap-1 border-b border-border-subtle bg-surface px-2 py-2">
        {data.sheets.map((item, index) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onSheetChange(index)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              index === sheetIndex ? 'bg-action text-background' : 'bg-surface-hover text-content-secondary hover:text-content'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="border-b border-border-subtle px-3 py-2 text-xs text-content-muted">
        {t('sheet_meta', {
          shownRows: sheet.rows.length,
          totalRows: sheet.totalRows,
          shownColumns: columnCount,
          totalColumns: sheet.totalColumns,
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <tbody>
            {sheet.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border-subtle last:border-b-0">
                {Array.from({ length: Math.max(columnCount, 1) }, (_, columnIndex) => (
                  <td
                    key={columnIndex}
                    className="max-w-80 whitespace-pre-wrap border-r border-border-subtle px-3 py-2 align-top text-content-secondary last:border-r-0"
                  >
                    {row[columnIndex] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FilePreviewTool() {
  const t = useTranslations('tools.file-preview');
  const locale = useLocale() === 'zh' ? 'zh' : 'en';
  const inputRef = useRef<HTMLInputElement>(null);
  const docxStyleRef = useRef<HTMLDivElement>(null);
  const docxBodyRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [target, setTarget] = useState<PreviewTarget | null>(null);
  const [preview, setPreview] = useState<FilePreviewData | null>(null);
  const [archive, setArchive] = useState<ZipExtractionOutcome | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState('');
  const [sheetIndex, setSheetIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [docxError, setDocxError] = useState('');

  const tree = useMemo(() => (archive?.ok ? createTree(archive.entries) : null), [archive]);
  const objectUrl = useMemo(() => (target ? URL.createObjectURL(target.blob) : null), [target]);

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  useEffect(() => {
    let active = true;
    if (docxStyleRef.current) docxStyleRef.current.innerHTML = '';
    if (docxBodyRef.current) docxBodyRef.current.innerHTML = '';
    setDocxError('');

    if (!target || !preview?.ok || preview.kind !== 'document' || !docxBodyRef.current || !docxStyleRef.current) {
      return () => { active = false; };
    }

    void import('docx-preview')
      .then(({ renderAsync }) => renderAsync(target.blob, docxBodyRef.current as HTMLDivElement, docxStyleRef.current as HTMLDivElement, {
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        useBase64URL: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
      }))
      .catch((error: unknown) => {
        if (active) setDocxError(error instanceof Error ? error.message : t('errors.preview_failed'));
      });

    return () => { active = false; };
  }, [preview, target, t]);

  const loadTarget = useCallback(async (file: File, source: PreviewTarget['source']) => {
    const requestId = ++requestIdRef.current;
    setTarget({ blob: file, name: file.name, size: file.size, type: file.type, source });
    setPreview(null);
    if (source === 'file') {
      setArchive(null);
      setSelectedPath(file.name);
      setExpanded(new Set());
    }
    setSheetIndex(0);
    setIsProcessing(true);

    if (getFilePreviewKind(file) === 'zip') {
      const outcome = await extractZipArchive(file);
      if (requestId !== requestIdRef.current) return;
      setArchive(outcome);
      setExpanded(outcome.ok ? getExpandedDefaults(outcome.entries) : new Set());
      setIsProcessing(false);
      return;
    }

    const outcome = await loadFilePreview(file, locale);
    if (requestId !== requestIdRef.current) return;
    setPreview(outcome);
    setIsProcessing(false);
  }, [locale]);

  const handleFile = useCallback((file: File | undefined) => {
    if (file) void loadTarget(file, 'file');
  }, [loadTarget]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const file = event.clipboardData?.files[0];
      if (!file) return;
      event.preventDefault();
      handleFile(file);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  function previewEntry(entry: ZipExtractedEntry) {
    setSelectedPath(entry.path);
    void loadTarget(createFileFromEntry(entry), 'zip');
  }

  function clearFile() {
    requestIdRef.current += 1;
    setTarget(null);
    setPreview(null);
    setArchive(null);
    setExpanded(new Set());
    setSelectedPath('');
    setDocxError('');
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

  const selectedKind = target ? getFilePreviewKind(target) : null;
  const errorMessage = preview && !preview.ok ? preview.message : archive && !archive.ok ? archive.message : docxError;

  return (
    <ToolLayout toolId="file-preview" content={filePreviewContent}>
      <input
        ref={inputRef}
        id="file-preview-input"
        type="file"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {!target ? (
        <Panel title={t('input_title')} className="mx-auto w-full max-w-4xl">
          <label
            htmlFor="file-preview-input"
            className={`group flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center outline-none transition-colors focus-within:ring-2 focus-within:ring-action/40 sm:p-12 ${
             isDragging
               ? 'border-border-strong bg-surface-hover'
               : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files[0]);
            }}
          >
            <span className="flex size-14 items-center justify-center rounded-xl border border-border-base bg-surface-hover font-mono text-xs font-semibold tracking-[0.18em] text-content-secondary transition-transform group-hover:-translate-y-0.5">
              FILE
            </span>
            <span className="mt-5 text-base font-semibold text-content">{t('drop_title')}</span>
            <span className="mt-2 max-w-xl text-sm leading-relaxed text-content-muted">{t('drop_hint')}</span>
            <span className="mt-5 inline-flex min-h-10 items-center rounded bg-action px-4 py-2 text-sm font-semibold text-background transition-colors group-hover:bg-action-hover">
              {t('choose_file')}
            </span>
          </label>
          <div className="mt-4 flex flex-col gap-1 rounded border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-content-muted sm:flex-row sm:items-center sm:justify-between">
            <span>{t('empty_input')}</span>
            <span className="text-xs text-content-faint">{t('paste_hint')}</span>
          </div>
        </Panel>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 break-all font-medium text-content">{target.name}</span>
                <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-xs font-medium text-content-muted">
                  {getKindLabel(t, selectedKind ?? 'binary')}
                </span>
              </div>
              <div className="mt-1 text-xs text-content-muted">
                {t('file_meta', { size: formatFileSize(target.size), type: formatPreviewMimeType(target) })}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={isProcessing}>
                {t('choose_another')}
              </Button>
              <Button variant="secondary" onClick={clearFile} disabled={isProcessing}>
                {t('clear')}
              </Button>
            </div>
          </div>

          <Panel title={t('output_title')} className="min-h-[32rem] flex-1" actions={target ? (
            <span className="text-xs text-content-muted">{t('local_note')}</span>
          ) : null}>
          {isProcessing ? (
            <div className="flex min-h-64 items-center justify-center rounded border border-border-subtle bg-surface-raised text-sm text-content-muted">
              {t('processing')}
            </div>
          ) : tree && archive?.ok ? (
            <div className="grid min-h-0 flex-1 gap-3">
              <div className="min-h-64 overflow-auto rounded border border-border-subtle bg-surface-raised">
                <div className="border-b border-border-subtle px-3 py-2 text-xs text-content-muted">
                  {t('archive_meta', { count: archive.fileCount, size: formatFileSize(archive.totalSize) })}
                </div>
                {Array.from(tree.children.values()).map((child) => (
                  <TreeRow
                    key={child.path}
                    depth={0}
                    expanded={expanded}
                    node={child}
                    selectedPath={selectedPath}
                    onPreview={previewEntry}
                    onToggle={toggleDirectory}
                  />
                ))}
              </div>
              <div className="min-h-64 min-w-0 rounded border border-border-subtle bg-surface-raised p-3">
                {preview ? (
                  <PreviewContent
                    data={preview}
                    target={target}
                    objectUrl={objectUrl}
                    sheetIndex={sheetIndex}
                    onSheetChange={setSheetIndex}
                    docxStyleRef={docxStyleRef}
                    docxBodyRef={docxBodyRef}
                    t={t}
                  />
                ) : (
                  <div className="flex min-h-56 items-center justify-center text-center text-sm text-content-muted">
                    {t('select_entry')}
                  </div>
                )}
              </div>
            </div>
          ) : preview && target ? (
            <PreviewContent
              data={preview}
              target={target}
              objectUrl={objectUrl}
              sheetIndex={sheetIndex}
              onSheetChange={setSheetIndex}
              docxStyleRef={docxStyleRef}
              docxBodyRef={docxBodyRef}
              t={t}
            />
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
      )}
    </ToolLayout>
  );
}

function PreviewContent({
  data,
  target,
  objectUrl,
  sheetIndex,
  onSheetChange,
  docxStyleRef,
  docxBodyRef,
  t,
}: {
  data: FilePreviewData;
  target: PreviewTarget | null;
  objectUrl: string | null;
  sheetIndex: number;
  onSheetChange: (index: number) => void;
  docxStyleRef: React.RefObject<HTMLDivElement | null>;
  docxBodyRef: React.RefObject<HTMLDivElement | null>;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  if (!data.ok || !target) return null;

  if (data.kind === 'image' && objectUrl) {
    return <img src={objectUrl} alt={target.name} className="mx-auto max-h-[65dvh] max-w-full object-contain" />;
  }
  if (data.kind === 'audio' && objectUrl) {
    return <audio controls className="w-full" src={objectUrl}>{t('media_unsupported')}</audio>;
  }
  if (data.kind === 'video' && objectUrl) {
    return <video controls className="max-h-[65dvh] w-full" src={objectUrl}>{t('media_unsupported')}</video>;
  }
  if (data.kind === 'pdf' && objectUrl) {
    return <iframe title={t('pdf_title', { name: target.name })} className="h-[65dvh] min-h-96 w-full rounded border border-border-subtle" src={objectUrl} />;
  }
  if (data.kind === 'text') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 text-xs text-content-muted">
          {t('text_meta', { characters: data.text.totalCharacters })}
          {data.text.truncated ? ` · ${t('text_truncated')}` : ''}
        </div>
        <pre className="min-h-64 flex-1 overflow-auto whitespace-pre-wrap break-words rounded border border-border-subtle bg-surface p-4 font-mono text-xs leading-relaxed text-content-secondary">
          {data.text.text}
        </pre>
      </div>
    );
  }
  if (data.kind === 'markdown') {
    return (
      <article
        className="file-preview-markdown min-h-64 overflow-auto rounded border border-border-subtle bg-surface p-5 text-sm leading-7 text-content-secondary [&_a]:text-content [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:border-b [&_h2]:border-border-subtle [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:mx-auto [&_img]:max-w-full [&_li]:ml-5 [&_li]:list-disc [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-surface-hover [&_pre]:p-3 [&_table]:my-4 [&_table]:w-full [&_td]:border [&_td]:border-border-base [&_td]:p-2 [&_th]:border [&_th]:border-border-base [&_th]:bg-surface-hover [&_th]:p-2"
        dangerouslySetInnerHTML={{ __html: data.markdown.fragment }}
      />
    );
  }
  if (data.kind === 'spreadsheet') {
    return <SpreadsheetTable data={data.spreadsheet} sheetIndex={sheetIndex} onSheetChange={onSheetChange} />;
  }
  if (data.kind === 'document') {
    return (
      <div className="min-h-64 overflow-auto rounded border border-border-subtle bg-surface-raised p-3">
        <div ref={docxStyleRef} />
        <div ref={docxBodyRef} />
        <div className="mt-3 text-center text-xs text-content-muted">{t('document_note')}</div>
      </div>
    );
  }
  if (data.kind === 'zip') {
    return <div className="flex min-h-56 items-center justify-center text-sm text-content-muted">{t('select_entry')}</div>;
  }

  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
      <div className="font-medium text-content">{t('binary_title')}</div>
      <div className="text-sm text-content-muted">{t('binary_body')}</div>
      {objectUrl ? (
        <a
          href={objectUrl}
          download={target.name}
          className="inline-flex min-h-9 items-center justify-center rounded border border-border-base bg-surface-hover px-3 py-1.5 text-sm font-medium text-content-secondary hover:border-border-strong"
        >
          {t('download_file')}
        </a>
      ) : null}
    </div>
  );
}
