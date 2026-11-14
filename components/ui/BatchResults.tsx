'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { createZipArchive } from '@/lib/utils/zip';
import { toZipEntries, type BatchOutput } from '@/lib/utils/batch';

interface BatchResultsProps {
  items: BatchOutput[];
  zipFilename: string;
  failedCount?: number;
  formatSize: (size: number) => string;
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 0);
}

/** 批量结果列表：逐个下载 + 一次打包 ZIP，供所有支持批量的工具复用。 */
export function BatchResults({ items, zipFilename, failedCount = 0, formatSize }: BatchResultsProps) {
  const t = useTranslations('common.batch');
  const [zipping, setZipping] = useState(false);

  const downloadAll = async () => {
    if (items.length === 0 || zipping) return;
    setZipping(true);
    try {
      const blob = await createZipArchive(toZipEntries(items));
      const url = URL.createObjectURL(blob);
      triggerDownload(url, zipFilename);
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } finally {
      setZipping(false);
    }
  };

  if (items.length === 0 && failedCount === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-base bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-content">{t('title')}</span>
        <span className="text-xs text-content-muted">
          {t('count', { done: items.length, total: items.length + failedCount })}
        </span>
      </div>
      {failedCount > 0 && (
        <p role="alert" className="text-xs text-danger-content">{t('failed', { count: failedCount })}</p>
      )}
      {items.length > 0 && (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded border border-border-subtle bg-surface-raised px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm text-content">{item.filename}</div>
                <div className="text-xs text-content-muted">{formatSize(item.size)}</div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => triggerDownload(item.url, item.filename)}
              >
                {t('download')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {items.length > 1 && (
        <Button type="button" onClick={() => void downloadAll()} disabled={zipping}>
          {zipping ? t('zipping') : t('download_zip', { count: items.length })}
        </Button>
      )}
    </div>
  );
}
