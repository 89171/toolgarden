'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import type { ToolContent } from '@/lib/tools/content';
import { formatFileSize } from '@/lib/utils/image';
import {
  getFileMergeAcceptValue,
  getFileMergeModeIcon,
  mergeExcelFiles,
  mergeFilesByType,
  mergeImageFiles,
  type ExcelMergeOutcome,
  type ExcelMergeStrategy,
  type FileMergeItem,
  type FileMergeMode,
  type FileTypeMergeOutcome,
  type ImageMergeOutcome,
  type ImageMergeOutput,
  type ImageMergeTransform,
} from '@/lib/utils/file-merge';

interface ModeMeta {
  label: string;
  description: string;
}

interface FileMergeToolProps {
  mode: FileMergeMode;
  content?: ToolContent;
}

const TOOL_ID_BY_MODE: Record<FileMergeMode, string> = {
  word: 'word-merge',
  ppt: 'ppt-merge',
  text: 'txt-merge',
  markdown: 'markdown-merge',
  csv: 'csv-merge',
  rtf: 'rtf-merge',
  excel: 'excel-merge',
  images: 'image-merge',
};

function createItemId(file: File, index: number): string {
  return `${file.name}-${file.size}-${file.lastModified}-${index}-${Date.now()}`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

type FileMergeResult = FileTypeMergeOutcome | ExcelMergeOutcome | ImageMergeOutcome;
type ImageFlipKey = 'flipHorizontal' | 'flipVertical';

const DEFAULT_IMAGE_TRANSFORM: ImageMergeTransform = {
  flipHorizontal: false,
  flipVertical: false,
  rotateTurns: 0,
};

type IconProps = { className?: string };

const IconFlipHorizontal: React.FC<IconProps> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
    <path d="M10 3v14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M3.5 5.5 8 10l-4.5 4.5v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M16.5 5.5 12 10l4.5 4.5v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const IconFlipVertical: React.FC<IconProps> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
    <path d="M3 10h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M5.5 3.5 10 8l4.5-4.5h-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M5.5 16.5 10 12l4.5 4.5h-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const IconRotateLeft: React.FC<IconProps> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
    <path d="M6.5 5.5H3.5V2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.8 5.5A6 6 0 1 1 3.2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M10 7.5v4l3 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconRotateRight: React.FC<IconProps> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none">
    <path d="M13.5 5.5h3V2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.2 5.5A6 6 0 1 0 16.8 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M10 7.5v4l-3 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function isExcelMergeOutcome(result: FileMergeResult | null): result is ExcelMergeOutcome & { ok: true } {
  return Boolean(result && result.ok && 'sheetCount' in result);
}

function isImageMergeOutcome(result: FileMergeResult | null): result is ImageMergeOutcome & { ok: true } {
  return Boolean(result && result.ok && 'imageCount' in result);
}

function isFileTypeMergeOutcome(result: FileMergeResult | null): result is FileTypeMergeOutcome & { ok: true } {
  return Boolean(result && result.ok && 'sourceCount' in result && 'format' in result);
}

export function FileMergeTool({ mode, content }: FileMergeToolProps) {
  const tc = useTranslations('common');
  const t = useTranslations('file_merge');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageMergeRequestRef = useRef(0);
  const [currentFiles, setCurrentFiles] = useState<FileMergeItem[]>([]);
  const [currentResult, setCurrentResult] = useState<FileMergeResult | null>(null);
  const [currentError, setCurrentError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [excelStrategy, setExcelStrategy] = useState<ExcelMergeStrategy>('single-sheet');
  const [activeExcelSheet, setActiveExcelSheet] = useState('');
  const [imageOutput, setImageOutput] = useState<ImageMergeOutput>('pdf');
  const [previewUrl, setPreviewUrl] = useState('');

  const accept = useMemo(() => getFileMergeAcceptValue(mode), [mode]);

  const modeMeta: Record<FileMergeMode, ModeMeta> = {
    word: {
      label: t('modes.word'),
      description: t('mode_descriptions.word'),
    },
    ppt: {
      label: t('modes.ppt'),
      description: t('mode_descriptions.ppt'),
    },
    text: {
      label: t('modes.text'),
      description: t('mode_descriptions.text'),
    },
    markdown: {
      label: t('modes.markdown'),
      description: t('mode_descriptions.markdown'),
    },
    csv: {
      label: t('modes.csv'),
      description: t('mode_descriptions.csv'),
    },
    rtf: {
      label: t('modes.rtf'),
      description: t('mode_descriptions.rtf'),
    },
    excel: {
      label: t('modes.excel'),
      description: t('mode_descriptions.excel'),
    },
    images: {
      label: t('modes.images'),
      description: t('mode_descriptions.images'),
    },
  };

  useEffect(() => {
    if (!currentResult?.ok) {
      setPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(currentResult.blob);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [currentResult]);

  useEffect(() => {
    if (!isExcelMergeOutcome(currentResult)) {
      setActiveExcelSheet('');
      return;
    }

    setActiveExcelSheet((current) => (
      currentResult.previewSheets.some((sheet) => sheet.name === current)
        ? current
        : currentResult.previewSheets[0]?.name ?? ''
    ));
  }, [currentResult]);

  const getErrorMessage = useCallback((code: string): string => {
    switch (code) {
      case 'empty_selection':
        return t('errors.empty_selection');
      case 'unsupported_input':
        return t('errors.unsupported_input');
      case 'legacy_office':
        return t('errors.legacy_office');
      case 'file_too_large':
        return t('errors.file_too_large');
      case 'load_failed':
        return t('errors.load_failed');
      case 'empty_document':
        return t('errors.empty_document');
      case 'render_failed':
        return t('errors.render_failed');
      case 'mobi_unsupported':
        return t('errors.mobi_unsupported');
      case 'empty_excel':
        return t('errors.empty_excel');
      case 'invalid_excel':
        return t('errors.invalid_excel');
      case 'invalid_word':
        return t('errors.invalid_word');
      case 'invalid_ppt':
        return t('errors.invalid_ppt');
      case 'canvas_context':
        return t('errors.canvas_context');
      case 'image_load_failed':
        return t('errors.image_load_failed');
      default:
        return t('errors.general');
    }
  }, [t]);

  useEffect(() => {
    if (mode !== 'images') return undefined;

    const requestId = imageMergeRequestRef.current + 1;
    imageMergeRequestRef.current = requestId;

    if (currentFiles.length === 0) {
      setIsProcessing(false);
      setCurrentResult(null);
      setCurrentError('');
      return undefined;
    }

    setIsProcessing(true);
    setCurrentError('');
    setCurrentResult(null);

    mergeImageFiles(
      currentFiles.map((item) => ({
        file: item.file,
        transform: item.imageTransform,
      })),
      imageOutput
    ).then((result) => {
      if (imageMergeRequestRef.current !== requestId) return;

      setIsProcessing(false);
      if (result.ok) {
        setCurrentResult(result);
        setCurrentError('');
        return;
      }

      setCurrentError(getErrorMessage(result.code));
    }).catch(() => {
      if (imageMergeRequestRef.current !== requestId) return;
      setIsProcessing(false);
      setCurrentError(getErrorMessage('general'));
    });

    return () => {
      if (imageMergeRequestRef.current === requestId) {
        imageMergeRequestRef.current += 1;
      }
    };
  }, [currentFiles, getErrorMessage, imageOutput, mode]);

  const updateFiles = (updater: (items: FileMergeItem[]) => FileMergeItem[]) => {
    setCurrentFiles((current) => updater(current));
  };

  const updateResult = (nextResult: FileMergeResult | null) => {
    setCurrentResult(nextResult);
  };

  const updateError = (nextError: string) => {
    setCurrentError(nextError);
  };

  const addFiles = (fileList: FileList | File[]) => {
    const selectedFiles = Array.from(fileList);
    if (selectedFiles.length === 0) return;

    updateResult(null);
    updateError('');
    updateFiles((current) => [
      ...current,
      ...selectedFiles.map((file, index) => ({
        id: createItemId(file, index),
        file,
        imageTransform: mode === 'images' ? DEFAULT_IMAGE_TRANSFORM : undefined,
      })),
    ]);
  };

  const clearFiles = () => {
    updateFiles(() => []);
    updateResult(null);
    updateError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeItem = (id: string) => {
    updateFiles((current) => current.filter((item) => item.id !== id));
    updateResult(null);
    updateError('');
  };

  const moveBy = (id: string, delta: number) => {
    updateFiles((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const nextIndex = Math.max(0, Math.min(current.length - 1, index + delta));
      if (nextIndex === index) return current;
      return moveItem(current, index, nextIndex);
    });
    updateResult(null);
    updateError('');
  };

  const toggleImageFlip = (id: string, key: ImageFlipKey) => {
    updateFiles((current) => current.map((item) => {
      if (item.id !== id) return item;

      const currentTransform = item.imageTransform ?? DEFAULT_IMAGE_TRANSFORM;
      return {
        ...item,
        imageTransform: {
          ...currentTransform,
          [key]: !currentTransform[key],
        },
      };
    }));
    updateResult(null);
    updateError('');
  };

  const rotateImage = (id: string, delta: -1 | 1) => {
    updateFiles((current) => current.map((item) => {
      if (item.id !== id) return item;

      const currentTransform = item.imageTransform ?? DEFAULT_IMAGE_TRANSFORM;
      return {
        ...item,
        imageTransform: {
          ...currentTransform,
          rotateTurns: (((currentTransform.rotateTurns ?? 0) + delta) % 4 + 4) % 4,
        },
      };
    }));
    updateResult(null);
    updateError('');
  };

  const merge = async () => {
    if (currentFiles.length === 0 || isProcessing) return;

    setIsProcessing(true);
    updateError('');
    updateResult(null);

    const sourceFiles = currentFiles.map((item) => item.file);
    const result =
      mode === 'excel'
        ? await mergeExcelFiles(sourceFiles, excelStrategy)
        : mode === 'images'
          ? await mergeImageFiles(
            currentFiles.map((item) => ({
              file: item.file,
              transform: item.imageTransform,
            })),
            imageOutput
          )
          : await mergeFilesByType(sourceFiles, mode);

    setIsProcessing(false);

    if (result.ok) {
      updateResult(result);
      updateError('');
      return;
    }

    updateError(getErrorMessage(result.code));
  };

  const download = async () => {
    if (!currentResult?.ok) return;
    const { saveAs } = await import('file-saver');
    saveAs(currentResult.blob, currentResult.filename);
  };

  const renderFileList = () => {
    if (currentFiles.length === 0) {
      return (
        <p className="rounded border border-border-base bg-surface px-3 py-4 text-sm text-content-muted">
          {t('empty_list')}
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {currentFiles.map((item, index) => {
          const imageTransform = item.imageTransform ?? DEFAULT_IMAGE_TRANSFORM;
          const rotationDegrees = ((imageTransform.rotateTurns ?? 0) % 4) * 90;

          return (
            <article key={item.id} className="rounded border border-border-base bg-surface p-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-content-secondary">
                    {index + 1}. {item.file.name}
                  </h3>
                  <p className="mt-1 text-xs text-content-muted">{formatFileSize(item.file.size)}</p>
                </div>
                <span className="rounded border border-border-subtle bg-surface-raised px-2 py-1 text-xs text-content-muted">
                  {index + 1}
                </span>
              </div>

              {mode === 'images' ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded border border-border-subtle bg-surface-raised p-2">
                  <span className="text-xs font-medium text-content-muted">
                    {t('image_transform_title')}
                    {rotationDegrees > 0 ? (
                      <span className="ml-2 font-mono text-content-faint">{rotationDegrees}°</span>
                    ) : null}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 w-9 px-0"
                      onClick={() => rotateImage(item.id, -1)}
                      aria-label={t('rotate_left')}
                      title={t('rotate_left')}
                    >
                      <IconRotateLeft className="h-4 w-4" />
                      <span className="sr-only">{t('rotate_left')}</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 w-9 px-0"
                      onClick={() => rotateImage(item.id, 1)}
                      aria-label={t('rotate_right')}
                      title={t('rotate_right')}
                    >
                      <IconRotateRight className="h-4 w-4" />
                      <span className="sr-only">{t('rotate_right')}</span>
                    </Button>
                    <Button
                      variant={imageTransform.flipHorizontal ? 'primary' : 'secondary'}
                      size="sm"
                      className="h-9 w-9 px-0"
                      onClick={() => toggleImageFlip(item.id, 'flipHorizontal')}
                      aria-label={t('flip_horizontal')}
                      aria-pressed={imageTransform.flipHorizontal}
                      title={t('flip_horizontal')}
                    >
                      <IconFlipHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t('flip_horizontal')}</span>
                    </Button>
                    <Button
                      variant={imageTransform.flipVertical ? 'primary' : 'secondary'}
                      size="sm"
                      className="h-9 w-9 px-0"
                      onClick={() => toggleImageFlip(item.id, 'flipVertical')}
                      aria-label={t('flip_vertical')}
                      aria-pressed={imageTransform.flipVertical}
                      title={t('flip_vertical')}
                    >
                      <IconFlipVertical className="h-4 w-4" />
                      <span className="sr-only">{t('flip_vertical')}</span>
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => moveBy(item.id, -1)} disabled={index === 0}>
                  {t('move_up')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => moveBy(item.id, 1)} disabled={index === currentFiles.length - 1}>
                  {t('move_down')}
                </Button>
                <Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>
                  {tc('delete')}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderOptions = () => {
    if (mode === 'excel') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-normal text-content-faint">
            {t('excel_strategy_title')}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant={excelStrategy === 'single-sheet' ? 'primary' : 'secondary'}
              onClick={() => setExcelStrategy('single-sheet')}
            >
              {t('excel_strategy_single')}
            </Button>
            <Button
              variant={excelStrategy === 'multi-sheet' ? 'primary' : 'secondary'}
              onClick={() => setExcelStrategy('multi-sheet')}
            >
              {t('excel_strategy_multi')}
            </Button>
          </div>
        </div>
      );
    }

    if (mode === 'images') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-normal text-content-faint">
            {t('image_output_title')}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant={imageOutput === 'pdf' ? 'primary' : 'secondary'}
              onClick={() => setImageOutput('pdf')}
            >
              {t('image_output_pdf')}
            </Button>
            <Button
              variant={imageOutput === 'long-image' ? 'primary' : 'secondary'}
              onClick={() => setImageOutput('long-image')}
            >
              {t('image_output_long')}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderResult = () => {
    if (currentError) {
      return <p className="text-sm text-syntax-null">{currentError}</p>;
    }

    if (!currentResult?.ok) {
      const idleDescription = isProcessing
        ? t('merging')
        : mode === 'images'
          ? t('auto_idle_desc')
          : t('idle_desc', { mode: modeMeta[mode].label });

      return (
        <div className="flex h-full items-center justify-center text-center text-content-faint">
          <div>
            <p
              aria-hidden="true"
              className="mx-auto mb-2 inline-flex h-12 w-14 items-center justify-center rounded border border-border-subtle bg-surface font-mono text-sm font-semibold"
            >
              MERGE
            </p>
            <p className="text-sm">{idleDescription}</p>
          </div>
        </div>
      );
    }

    if (isFileTypeMergeOutcome(currentResult)) {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-content-muted">
            <span>{t('file_result', { count: currentResult.sourceCount, format: currentResult.format.toUpperCase() })}</span>
            {typeof currentResult.itemCount === 'number' ? (
              <span>{t('item_result', { count: currentResult.itemCount })}</span>
            ) : null}
            <span>{t('size_result', { size: formatFileSize(currentResult.outputSize) })}</span>
            <span>{t('duration_result', { duration: currentResult.durationMs })}</span>
          </div>
          {currentResult.previewText ? (
            <pre className="min-h-[28rem] flex-grow overflow-auto rounded border border-border-input bg-surface-raised p-4 text-sm leading-relaxed text-content-secondary">
              {currentResult.previewText}
            </pre>
          ) : (
            <div className="rounded border border-border-input bg-surface-raised p-4 text-sm text-content-muted">
              {t('file_preview_note')}
            </div>
          )}
        </div>
      );
    }

    if (isExcelMergeOutcome(currentResult)) {
      const activeSheet = currentResult.previewSheets.find((sheet) => sheet.name === activeExcelSheet)
        ?? currentResult.previewSheets[0];
      const hasSheetTabs = currentResult.previewSheets.length > 1;
      const hasPreviewRows = Boolean(activeSheet && activeSheet.columns.length > 0 && activeSheet.rows.length > 0);

      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-content-muted">
            <span>{t('excel_result', { sheets: currentResult.sheetCount, rows: currentResult.rowCount })}</span>
            <span>{t('size_result', { size: formatFileSize(currentResult.outputSize) })}</span>
            <span>{t('duration_result', { duration: currentResult.durationMs })}</span>
          </div>

          {hasSheetTabs ? (
            <div
              role="tablist"
              aria-label={t('excel_sheet_tabs_label')}
              className="flex gap-2 overflow-x-auto border-b border-border-subtle pb-2"
            >
              {currentResult.previewSheets.map((sheet) => {
                const isActive = sheet.name === activeSheet?.name;
                return (
                  <button
                    key={sheet.name}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveExcelSheet(sheet.name)}
                    className={`max-w-56 shrink-0 truncate rounded border px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-action bg-action text-background'
                        : 'border-border-base bg-surface text-content-muted hover:border-border-strong hover:bg-surface-hover hover:text-content-secondary'
                    }`}
                  >
                    {sheet.name}
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeSheet ? (
            <div className="flex min-h-0 flex-grow flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-content-muted">
                <span className="font-medium text-content-secondary">{activeSheet.name}</span>
                <span>
                  {t('excel_preview_meta', {
                    shownRows: activeSheet.rows.length,
                    totalRows: activeSheet.rowCount,
                    shownColumns: activeSheet.columns.length,
                    totalColumns: activeSheet.columnCount,
                  })}
                </span>
              </div>

              {activeSheet.truncatedRows || activeSheet.truncatedColumns ? (
                <p className="text-xs text-content-faint">{t('excel_preview_truncated')}</p>
              ) : null}

              {hasPreviewRows ? (
                <div className="min-h-[28rem] flex-grow overflow-auto rounded border border-border-input bg-surface-raised">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead className="sticky top-0 z-10 bg-surface">
                      <tr>
                        <th className="sticky left-0 z-20 border-b border-r border-border-subtle bg-surface px-3 py-2 text-left font-mono text-xs font-semibold text-content-faint">
                          #
                        </th>
                        {activeSheet.columns.map((column) => (
                          <th
                            key={column}
                            className="border-b border-r border-border-subtle px-3 py-2 text-left text-xs font-semibold text-content-secondary"
                          >
                            <span className="block max-w-64 truncate">{column}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeSheet.rows.map((row, rowIndex) => (
                        <tr key={`${activeSheet.name}-${rowIndex}`} className="odd:bg-surface-raised even:bg-surface">
                          <th className="sticky left-0 border-b border-r border-border-subtle bg-inherit px-3 py-2 text-left font-mono text-xs font-medium text-content-faint">
                            {rowIndex + 1}
                          </th>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={`${activeSheet.name}-${rowIndex}-${activeSheet.columns[cellIndex]}`}
                              className="max-w-72 border-b border-r border-border-subtle px-3 py-2 align-top text-content-secondary"
                            >
                              <span className="block max-h-24 overflow-hidden whitespace-pre-wrap break-words">
                                {cell || ''}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-[18rem] flex-grow items-center justify-center rounded border border-border-input bg-surface-raised p-4 text-center text-sm text-content-muted">
                  {t('excel_preview_empty')}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded border border-border-input bg-surface-raised p-4 text-sm text-content-muted">
              {t('excel_preview_note')}
            </div>
          )}
        </div>
      );
    }

    if (isImageMergeOutcome(currentResult)) {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-content-muted">
            <span>{t('image_result', { count: currentResult.imageCount, format: currentResult.format.toUpperCase() })}</span>
            {'width' in currentResult ? (
              <span>{t('image_dimensions', { width: currentResult.width, height: currentResult.height })}</span>
            ) : null}
            <span>{t('size_result', { size: formatFileSize(currentResult.outputSize) })}</span>
            <span>{t('duration_result', { duration: currentResult.durationMs })}</span>
          </div>
          {previewUrl ? (
            <div className="min-h-[28rem] flex-grow overflow-auto rounded border border-border-input bg-surface-raised p-3">
              {currentResult.format === 'png' ? (
                <Image
                  src={previewUrl}
                  alt={t('preview_title')}
                  width={currentResult.width}
                  height={currentResult.height}
                  unoptimized
                  className="h-auto w-full rounded"
                />
              ) : (
                <iframe title={t('preview_title')} src={previewUrl} className="h-full min-h-[28rem] w-full rounded" />
              )}
            </div>
          ) : null}
        </div>
      );
    }

    return null;
  };

  return (
    <ToolLayout toolId={TOOL_ID_BY_MODE[mode]} content={content}>
      <div className="grid flex-grow grid-cols-1 gap-6 min-h-0 xl:grid-cols-[minmax(360px,460px)_1fr]">
        <Panel
          title={t('input_title')}
          actions={(
            <Button variant="secondary" onClick={clearFiles} disabled={currentFiles.length === 0}>
              {tc('clear')}
            </Button>
          )}
          className="min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto pr-1">
            <div className="rounded border border-border-base bg-surface-raised p-3 text-sm text-content-muted">
              {modeMeta[mode].description}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
                event.target.value = '';
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border-input bg-surface-raised px-5 py-8 text-center transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-muted">
                {getFileMergeModeIcon(mode)}
              </span>
              <span className="text-base font-semibold text-content-secondary">{t('upload_title')}</span>
              <span className="max-w-80 text-sm leading-relaxed text-content-muted">
                {t('upload_hint', { accept })}
              </span>
              <span className="rounded bg-action px-4 py-2 text-sm font-medium text-background">
                {t('upload_button')}
              </span>
            </button>

            {renderOptions()}

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-content-secondary">{t('file_list_title')}</span>
                <span className="text-xs text-content-faint">{t('file_count', { count: currentFiles.length })}</span>
              </div>
              {renderFileList()}
            </div>

            {mode !== 'images' ? (
              <Button onClick={merge} disabled={currentFiles.length === 0 || isProcessing}>
                {isProcessing ? t('merging') : t('merge_action')}
              </Button>
            ) : null}
          </div>
        </Panel>

        <Panel
          title={t('output_title')}
          actions={(
            <Button onClick={download} disabled={!currentResult?.ok}>
              {tc('download')}
            </Button>
          )}
          className="min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-3">
            {renderResult()}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
