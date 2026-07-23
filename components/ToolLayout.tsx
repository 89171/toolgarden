'use client';
import React from 'react';
import Link from '@/components/ui/AppLink';
import { useTranslations, useLocale } from 'next-intl';
import { getToolById } from '@/lib/tools/registry';
import { getPillarSlugForToolPath } from '@/lib/blog/topics';
import {
  buildBreadcrumbJsonLd,
  buildToolJsonLd,
  toJsonLd,
  type JsonLdMessages,
} from '@/lib/tools/jsonld';
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
  const isAudioTool = Boolean(tool?.path.startsWith('/audio/'));
  const isPdfTool = Boolean(tool?.path.startsWith('/pdf/'));
  const isFileMergeTool = Boolean(tool?.path.startsWith('/file-merge/'));
  const isOtherTool = Boolean(tool?.path.startsWith('/other/'));
  const homeLabel = t('home.breadcrumb');
  const imageHubLabel = t('image_hub.breadcrumb');
  const audioHubLabel = t('audio_hub.breadcrumb');
  const pdfHubLabel = t('pdf_hub.breadcrumb');
  const fileMergeHubLabel = t('file_merge_hub.breadcrumb');
  const otherHubLabel = t('other_hub.breadcrumb');
  const jsonLdMessages: JsonLdMessages = {
    home: { title: t('home.title'), breadcrumb: homeLabel },
    image_hub: { breadcrumb: imageHubLabel },
    audio_hub: { breadcrumb: audioHubLabel },
    pdf_hub: { breadcrumb: pdfHubLabel },
    file_merge_hub: { breadcrumb: fileMergeHubLabel },
    text_hub: { breadcrumb: t('text_hub.breadcrumb') },
    other_hub: { breadcrumb: otherHubLabel },
    tools: { [toolId]: { name: toolName, description: toolDesc } },
    organic_keywords: tool ? { [toolId]: t(`organic_keywords.${toolId}`) } : {},
  };
  const toolJsonLd = tool ? buildToolJsonLd(toolId, locale, jsonLdMessages) : null;
  const breadcrumbJsonLd = tool ? buildBreadcrumbJsonLd(toolId, locale, jsonLdMessages) : null;
  const relatedGuideSlug = tool ? getPillarSlugForToolPath(tool.path) : null;

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
      <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
        <div className="flex w-full flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4 lg:min-h-0 lg:px-6 xl:px-8 2xl:px-10">
        <Header compact />
        {/* 面包屑 */}
        <nav className="mb-3 flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1 text-sm text-content-muted sm:mb-4" aria-label="breadcrumb">
          <Link href={`/${locale}`} className="shrink-0 transition-colors hover:text-content-secondary">
            {homeLabel}
          </Link>
          {tool && isImageTool && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/${locale}/image`} className="shrink-0 font-medium text-content-secondary hover:text-content">
                {imageHubLabel}
              </Link>
              <span className="shrink-0">/</span>
              <span className="font-medium text-content-secondary">{toolName}</span>
            </>
          )}
          {tool && isPdfTool && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/${locale}/pdf`} className="shrink-0 font-medium text-content-secondary hover:text-content">
                {pdfHubLabel}
              </Link>
              <span className="shrink-0">/</span>
              <span className="font-medium text-content-secondary">{toolName}</span>
            </>
          )}
          {tool && isAudioTool && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/${locale}/audio`} className="shrink-0 font-medium text-content-secondary hover:text-content">
                {audioHubLabel}
              </Link>
              <span className="shrink-0">/</span>
              <span className="font-medium text-content-secondary">{toolName}</span>
            </>
          )}
          {tool && isFileMergeTool && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/${locale}/file-merge`} className="shrink-0 font-medium text-content-secondary hover:text-content">
                {fileMergeHubLabel}
              </Link>
              <span className="shrink-0">/</span>
              <span className="font-medium text-content-secondary">{toolName}</span>
            </>
          )}
          {tool && isOtherTool && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/${locale}/other`} className="shrink-0 font-medium text-content-secondary hover:text-content">
                {otherHubLabel}
              </Link>
              <span className="shrink-0">/</span>
              <span className="font-medium text-content-secondary">{toolName}</span>
            </>
          )}
          {tool && !isImageTool && !isAudioTool && !isPdfTool && !isFileMergeTool && !isOtherTool && (
            <>
              <span className="shrink-0">/</span>
              <span className="shrink-0 rounded bg-surface-hover px-1 py-0.5 text-xs text-content-faint">
                {catLabel}
              </span>
              <span className="shrink-0">/</span>
              <span className="font-medium text-content-secondary">{toolName}</span>
            </>
          )}
        </nav>

        {/* 工具标题 */}
        {tool && (
          <div className="mb-4 flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-2">
            <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-content sm:text-2xl">
              <span aria-hidden="true" className="shrink-0 font-mono text-content-faint">{tool.icon}</span>
              <span className="min-w-0 break-words">{toolName}</span>
            </h1>
            {toolDesc ? (
              <p className="min-w-0 text-sm leading-relaxed text-content-muted">{toolDesc}</p>
            ) : null}
          </div>
        )}

        <div data-clarity-mask="true" className="flex flex-1 flex-col lg:min-h-0">{children}</div>
        {relatedGuideSlug ? (
          <aside className="mt-6 flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-content-faint">{t('blog.related_guide')}</p>
              <p className="mt-1 text-sm leading-6 text-content-secondary">{t('blog.privacy_note')}</p>
            </div>
            <Link
              href={`/${locale}/blog/${relatedGuideSlug}`}
              className="inline-flex shrink-0 items-center justify-center rounded border border-border-strong bg-surface-raised px-3 py-2 text-sm font-semibold text-content transition-colors hover:bg-surface-hover"
            >
              {t('blog.related_guide_action')}
            </Link>
          </aside>
        ) : null}
        <Footer />
      </div>
      </div>
    </>
  );
};
