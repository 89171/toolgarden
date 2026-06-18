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
  const homeLabel = t('nav.title');
  const imageHubLabel = t('image_hub.breadcrumb');
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
        <div className="flex-grow flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 min-h-0">
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
          {tool && !isImageTool && (
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
          <div className="mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span aria-hidden="true" className="font-mono text-content-faint">{tool.icon}</span>
              {toolName}
            </h1>
            <p className="text-content-muted text-sm mt-1">{toolDesc}</p>
          </div>
        )}

        <div className="flex-grow flex flex-col min-h-0">{children}</div>
        <Footer />
      </div>
      </div>
    </>
  );
};
