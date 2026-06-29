'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { getToolById } from '@/lib/tools/registry';
import {
  createBreadcrumbJsonLd,
  createToolFaqJsonLd,
  createToolJsonLd,
  toJsonLd,
} from '@/lib/tools/seo';
import Footer from './Footer';
import Header from './Header';

interface ToolLayoutProps {
  toolId: string;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ toolId, children }) => {
  const t = useTranslations();
  const locale = useLocale();
  const tool = getToolById(toolId);

  const toolName  = tool ? t(`tools.${toolId}.name`)        : toolId;
  const toolDesc  = tool ? t(`tools.${toolId}.description`) : '';
  const catLabel  = tool ? t(`categories.${tool.category}`) : '';
  const isImageTool = Boolean(tool?.path.startsWith('/image/'));
  const isPdfTool = Boolean(tool?.path.startsWith('/pdf/'));
  const isFileMergeTool = Boolean(tool?.path.startsWith('/file-merge/'));
  const homeLabel = t('home.breadcrumb');
  const imageHubLabel = t('image_hub.breadcrumb');
  const pdfHubLabel = t('pdf_hub.breadcrumb');
  const fileMergeHubLabel = t('file_merge_hub.breadcrumb');
  const toolJsonLd = tool ? createToolJsonLd(toolId, locale) : null;
  const breadcrumbJsonLd = tool ? createBreadcrumbJsonLd(toolId, locale) : null;
  const faqJsonLd = tool ? createToolFaqJsonLd(toolId, locale) : null;

  return (
    <>
      {toolJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(toolJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }}
        />
      )}
      <div className="h-screen bg-background text-foreground flex flex-col">
        <div className="flex-grow flex w-full flex-col px-3 py-4 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 min-h-0">
        <Header compact />
        {/* 面包屑 */}
        <nav className="text-sm text-content-muted mb-4 flex items-center gap-1" aria-label="breadcrumb">
          <Link href={`/${locale}`} className="hover:text-content-secondary transition-colors">
            {homeLabel}
          </Link>
          {tool && isImageTool && (
            <>
              <span>/</span>
              <Link href={`/${locale}/image`} className="text-content-secondary font-medium hover:text-content">
                {imageHubLabel}
              </Link>
              <span>/</span>
              <span className="text-content-secondary font-medium">{toolName}</span>
            </>
          )}
          {tool && isPdfTool && (
            <>
              <span>/</span>
              <Link href={`/${locale}/pdf`} className="text-content-secondary font-medium hover:text-content">
                {pdfHubLabel}
              </Link>
              <span>/</span>
              <span className="text-content-secondary font-medium">{toolName}</span>
            </>
          )}
          {tool && isFileMergeTool && (
            <>
              <span>/</span>
              <Link href={`/${locale}/file-merge`} className="text-content-secondary font-medium hover:text-content">
                {fileMergeHubLabel}
              </Link>
              <span>/</span>
              <span className="text-content-secondary font-medium">{toolName}</span>
            </>
          )}
          {tool && !isImageTool && !isPdfTool && !isFileMergeTool && (
            <>
              <span>/</span>
              <span className="text-content-faint text-xs px-1 py-0.5 bg-surface-hover rounded">
                {catLabel}
              </span>
              <span>/</span>
              <span className="text-content-secondary font-medium">{toolName}</span>
            </>
          )}
        </nav>

        {/* 工具标题 */}
        {tool && (
          <div className="mb-4 flex flex-wrap items-end gap-x-2 gap-y-1">
            <h1 className="text-2xl font-bold flex shrink-0 items-center gap-2">
              <span aria-hidden="true" className="font-mono text-content-faint">{tool.icon}</span>
              {toolName}
            </h1>
            {toolDesc ? (
              <p className="min-w-0 text-sm text-content-muted">{toolDesc}</p>
            ) : null}
          </div>
        )}

        <div className="flex-grow flex flex-col min-h-0">{children}</div>
        <Footer />
      </div>
      </div>
    </>
  );
};
