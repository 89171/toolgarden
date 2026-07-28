'use client';
import React from 'react';
import Link from '@/components/ui/AppLink';
import { useTranslations, useLocale } from 'next-intl';
import { getRelatedTools, getToolById } from '@/lib/tools/registry';
import { getPillarSlugForToolPath } from '@/lib/blog/topics';
import {
  buildBreadcrumbJsonLd,
  buildToolFaqJsonLd,
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

interface ToolFaqItem {
  question: string;
  answer: string;
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
  const isTextTool = Boolean(tool?.path.startsWith('/text/'));
  const isOtherTool = Boolean(tool?.path.startsWith('/other/'));
  const homeLabel = t('home.breadcrumb');
  const imageHubLabel = t('image_hub.breadcrumb');
  const audioHubLabel = t('audio_hub.breadcrumb');
  const pdfHubLabel = t('pdf_hub.breadcrumb');
  const fileMergeHubLabel = t('file_merge_hub.breadcrumb');
  const textHubLabel = t('text_hub.breadcrumb');
  const otherHubLabel = t('other_hub.breadcrumb');
  const faqKey = `tool_faq.${toolId}.items`;
  const rawFaqItems = tool && t.has(faqKey) ? t.raw(faqKey) : [];
  const faqItems = Array.isArray(rawFaqItems)
    ? rawFaqItems.filter(
        (item): item is ToolFaqItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.question === 'string' &&
          typeof item.answer === 'string'
      )
    : [];
  const jsonLdMessages: JsonLdMessages = {
    home: { title: t('home.title'), breadcrumb: homeLabel },
    image_hub: { breadcrumb: imageHubLabel },
    audio_hub: { breadcrumb: audioHubLabel },
    pdf_hub: { breadcrumb: pdfHubLabel },
    file_merge_hub: { breadcrumb: fileMergeHubLabel },
    text_hub: { breadcrumb: textHubLabel },
    other_hub: { breadcrumb: otherHubLabel },
    tools: { [toolId]: { name: toolName, description: toolDesc } },
    organic_keywords: tool ? { [toolId]: t(`organic_keywords.${toolId}`) } : {},
    tool_faq: faqItems.length > 0 ? { [toolId]: { items: faqItems } } : {},
  };
  const toolJsonLd = tool ? buildToolJsonLd(toolId, locale, jsonLdMessages) : null;
  const breadcrumbJsonLd = tool ? buildBreadcrumbJsonLd(toolId, locale, jsonLdMessages) : null;
  const faqJsonLd = tool ? buildToolFaqJsonLd(toolId, jsonLdMessages) : null;
  const relatedGuideSlug = tool ? getPillarSlugForToolPath(tool.path) : null;
  const relatedTools = tool ? getRelatedTools(tool.id) : [];
  const faqTitleId = `${toolId}-faq-title`;
  const relatedToolsTitleId = `${toolId}-related-tools-title`;

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
          {tool && isTextTool && (
            <>
              <span className="shrink-0">/</span>
              <Link href={`/${locale}/text`} className="shrink-0 font-medium text-content-secondary hover:text-content">
                {textHubLabel}
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
          {tool && !isImageTool && !isAudioTool && !isPdfTool && !isFileMergeTool && !isTextTool && !isOtherTool && (
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

        <main className="flex flex-1 flex-col lg:min-h-0">
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
          {faqItems.length > 0 ? (
            <section className="mt-8 border-t border-border-subtle pt-6" aria-labelledby={faqTitleId}>
              <h2 id={faqTitleId} className="text-xl font-bold text-content">
                {t('blog.faq_title')}
              </h2>
              <dl className="mt-4 grid gap-3 lg:grid-cols-2">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-lg border border-border-base bg-surface px-4 py-4">
                    <dt className="font-semibold leading-6 text-content">{item.question}</dt>
                    <dd className="mt-2 text-sm leading-6 text-content-muted">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          {relatedTools.length > 0 ? (
            <section className="mt-8 border-t border-border-subtle pt-6" aria-labelledby={relatedToolsTitleId}>
              <h2 id={relatedToolsTitleId} className="text-xl font-bold text-content">
                {t('blog.related_tools')}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map((related) => (
                  <li key={related.id}>
                    <Link
                      href={`/${locale}${related.path}`}
                      className="flex h-full items-start gap-2 rounded-lg border border-border-base bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-hover"
                    >
                      <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-xs text-content-faint">
                        {related.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-content">{t(`tools.${related.id}.name`)}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-content-muted line-clamp-2">
                          {t(`tools.${related.id}.description`)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
        <Footer />
      </div>
      </div>
    </>
  );
};
