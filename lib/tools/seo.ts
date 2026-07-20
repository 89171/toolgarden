import type { Metadata } from 'next';
import zhMessages from '@/messages/zh.json';
import enMessages from '@/messages/en.json';
import {
  BLOG_INDEX_PATH,
  getLocalizedBlogArticle,
  getLocalizedBlogArticles,
  getLocalizedBlogTopicForArticle,
  getLocalizedBlogTopics,
} from '@/lib/blog/articles';
import {
  BASE_URL,
  buildBreadcrumbJsonLd,
  buildToolFaqJsonLd,
  buildToolJsonLd,
  createPrivacySeoDescription,
  createToolSeoDescription,
  createToolSeoTitle,
  getLanguageAlternates,
  getLocalizedPath,
  getLocalizedUrl,
  normalizeLocale,
  toJsonLd,
  type JsonLdMessages,
  type Locale,
} from './jsonld';
import {
  getAudioTools,
  getFileMergeTools,
  getImageTools,
  getJsonTools,
  getLocalizedToolPath,
  getOtherTools,
  getPdfTools,
  getTextTools,
  getToolById,
  toolRegistry,
} from './registry';

export {
  BASE_URL,
  getLanguageAlternates,
  getLocalizedPath,
  getLocalizedUrl,
  normalizeLocale,
  toJsonLd,
};
export type { Locale };
export const REPOSITORY_URL = 'https://github.com/89171/json-toolkit';
const EXPOSE_SOURCE_METADATA = process.env.NEXT_PUBLIC_EXPOSE_SOURCE === 'true';

const messages = { zh: zhMessages, en: enMessages } as const;

type ToolMessageId = keyof typeof zhMessages.tools;

export function getLocaleMessages(locale: string) {
  return messages[normalizeLocale(locale)];
}

export function createLocaleMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const seoDescription = createPrivacySeoDescription(m.home.subtitle, normalizedLocale);

  return {
    title: {
      default: m.home.meta_title,
      template: `%s | ${m.home.title}`,
    },
    description: seoDescription,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: getLocalizedPath(normalizedLocale),
      languages: getLanguageAlternates(),
    },
    openGraph: {
      title: m.home.meta_title,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale),
    },
  };
}

export function createImageHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/image';
  const seoDescription = createPrivacySeoDescription(m.image_hub.description, normalizedLocale);

  return {
    title: m.image_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.image_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createPdfHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/pdf';
  const seoDescription = createPrivacySeoDescription(m.pdf_hub.description, normalizedLocale);

  return {
    title: m.pdf_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.pdf_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createAudioHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/audio';
  const seoDescription = createPrivacySeoDescription(m.audio_hub.description, normalizedLocale);

  return {
    title: m.audio_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.audio_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createFileMergeHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/file-merge';
  const seoDescription = createPrivacySeoDescription(m.file_merge_hub.description, normalizedLocale);

  return {
    title: m.file_merge_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.file_merge_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createJsonToolsHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/json-tools';
  const seoDescription = createPrivacySeoDescription(m.json_hub.description, normalizedLocale);

  return {
    title: m.json_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.json_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createTextHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/text';
  const seoDescription = createPrivacySeoDescription(m.text_hub.description, normalizedLocale);

  return {
    title: m.text_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.text_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createOtherHubMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const path = '/other';
  const seoDescription = createPrivacySeoDescription(m.other_hub.description, normalizedLocale);

  return {
    title: m.other_hub.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.other_hub.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createBlogIndexMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const seoDescription = createPrivacySeoDescription(m.blog.description, normalizedLocale);

  return {
    title: m.blog.meta_title,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, BLOG_INDEX_PATH),
      languages: getLanguageAlternates(BLOG_INDEX_PATH),
    },
    openGraph: {
      title: `${m.blog.title} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, BLOG_INDEX_PATH),
    },
  };
}

export function createBlogArticleMetadata(slug: string, locale: string): Metadata | null {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const article = getLocalizedBlogArticle(slug, normalizedLocale);

  if (!article) return null;

  const seoDescription = createPrivacySeoDescription(article.metaDescription, normalizedLocale);
  const topicMembership = getLocalizedBlogTopicForArticle(slug, normalizedLocale);

  return {
    title: article.metaTitle,
    description: seoDescription,
    keywords: [
      ...article.tags,
      ...(topicMembership?.targetKeyword ? [topicMembership.targetKeyword] : []),
    ],
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, article.path),
      languages: getLanguageAlternates(article.path),
    },
    openGraph: {
      title: `${article.metaTitle} | ${m.home.title}`,
      description: seoDescription,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, article.path),
    },
  };
}

export function createToolMetadata(toolId: ToolMessageId, locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const registryTool = getToolById(toolId);
  const path = registryTool?.path ?? `/${toolId}`;
  const tool = m.tools[toolId];
  const seoTitle = createToolSeoTitle(tool.name, tool.description, normalizedLocale);
  const seoDescription = createToolSeoDescription(tool.description, normalizedLocale);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${seoTitle} | ${m.home.title}`,
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createSiteJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: m.home.title,
    description: createPrivacySeoDescription(m.home.subtitle, normalizedLocale),
    url: getLocalizedUrl(normalizedLocale),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    browserRequirements: 'Requires a modern browser with JavaScript enabled',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
    ...(EXPOSE_SOURCE_METADATA ? { codeRepository: REPOSITORY_URL } : {}),
  };
}

export function createToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${m.home.title} tools`,
    itemListElement: toolRegistry.map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createJsonToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.json_hub.title,
    description: createPrivacySeoDescription(m.json_hub.description, normalizedLocale),
    itemListElement: getJsonTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createImageToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.image_hub.title,
    description: createPrivacySeoDescription(m.image_hub.description, normalizedLocale),
    itemListElement: getImageTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createPdfToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.pdf_hub.title,
    description: createPrivacySeoDescription(m.pdf_hub.description, normalizedLocale),
    itemListElement: getPdfTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createAudioToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.audio_hub.title,
    description: createPrivacySeoDescription(m.audio_hub.description, normalizedLocale),
    itemListElement: getAudioTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createFileMergeToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.file_merge_hub.title,
    description: createPrivacySeoDescription(m.file_merge_hub.description, normalizedLocale),
    itemListElement: getFileMergeTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createTextToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.text_hub.title,
    description: createPrivacySeoDescription(m.text_hub.description, normalizedLocale),
    itemListElement: getTextTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createOtherToolItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.other_hub.title,
    description: createPrivacySeoDescription(m.other_hub.description, normalizedLocale),
    itemListElement: getOtherTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: createToolSeoDescription(localizedTool.description, normalizedLocale),
      };
    }),
  };
}

export function createBlogItemListJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const articles = getLocalizedBlogArticles(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: m.blog.title,
    description: createPrivacySeoDescription(m.blog.description, normalizedLocale),
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: getLocalizedUrl(normalizedLocale, article.path),
      name: article.title,
      description: createPrivacySeoDescription(article.excerpt, normalizedLocale),
    })),
  };
}

export function createBlogTopicCollectionJsonLd(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const topics = getLocalizedBlogTopics(normalizedLocale);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: m.blog.topic_hubs,
    description: m.blog.topic_hubs_description,
    url: getLocalizedUrl(normalizedLocale, BLOG_INDEX_PATH),
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: m.home.title,
      url: getLocalizedUrl(normalizedLocale),
    },
    hasPart: topics.map((topic) => ({
      '@type': 'WebPage',
      name: topic.pillar.title,
      url: getLocalizedUrl(normalizedLocale, topic.pillar.path),
      hasPart: topic.clusters.map((article) => ({
        '@type': 'Article',
        name: article.title,
        url: getLocalizedUrl(normalizedLocale, article.path),
      })),
    })),
  };
}

export function createFaqJsonLd(locale: string) {
  const m = getLocaleMessages(locale);
  const faq = m.json_hub.faq;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ['privacy_q', 'privacy_a'],
      ['formats_q', 'formats_a'],
      ['free_q', 'free_a'],
      ['loose_q', 'loose_a'],
    ].map(([questionKey, answerKey]) => ({
      '@type': 'Question',
      name: faq[questionKey as keyof typeof faq],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq[answerKey as keyof typeof faq],
      },
    })),
  };
}

export function createToolFaqJsonLd(toolId: string, locale: string) {
  return buildToolFaqJsonLd(toolId, getLocaleMessages(locale) as JsonLdMessages);
}

export function createToolJsonLd(toolId: string, locale: string) {
  return buildToolJsonLd(toolId, locale, getLocaleMessages(locale) as JsonLdMessages);
}

export function createBlogArticleFaqJsonLd(slug: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const article = getLocalizedBlogArticle(slug, normalizedLocale);

  if (!article?.faq?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createBlogArticleJsonLd(slug: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const article = getLocalizedBlogArticle(slug, normalizedLocale);
  const topicMembership = getLocalizedBlogTopicForArticle(slug, normalizedLocale);

  if (!article) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: createPrivacySeoDescription(article.metaDescription, normalizedLocale),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
    isAccessibleForFree: true,
    keywords: [
      ...article.tags,
      ...(topicMembership?.targetKeyword ? [topicMembership.targetKeyword] : []),
    ],
    ...(topicMembership ? {
      about: {
        '@type': 'DefinedTerm',
        name: topicMembership.targetKeyword ?? topicMembership.pillar.title,
        url: getLocalizedUrl(normalizedLocale, topicMembership.pillar.path),
      },
    } : {}),
    author: {
      '@type': 'Organization',
      name: m.home.title,
      url: getLocalizedUrl(normalizedLocale),
    },
    publisher: {
      '@type': 'Organization',
      name: m.home.title,
      url: getLocalizedUrl(normalizedLocale),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getLocalizedUrl(normalizedLocale, article.path),
    },
    isPartOf: topicMembership?.role === 'cluster'
      ? {
          '@type': 'WebPage',
          name: topicMembership.pillar.title,
          url: getLocalizedUrl(normalizedLocale, topicMembership.pillar.path),
          isPartOf: {
            '@type': 'Blog',
            name: m.blog.title,
            url: getLocalizedUrl(normalizedLocale, BLOG_INDEX_PATH),
          },
        }
      : {
          '@type': 'Blog',
          name: m.blog.title,
          url: getLocalizedUrl(normalizedLocale, BLOG_INDEX_PATH),
        },
    ...(topicMembership?.role === 'pillar' ? {
      hasPart: topicMembership.clusters.map((cluster) => ({
        '@type': 'Article',
        name: cluster.title,
        url: getLocalizedUrl(normalizedLocale, cluster.path),
      })),
    } : {}),
  };
}

export function createBreadcrumbJsonLd(toolId: string, locale: string) {
  return buildBreadcrumbJsonLd(toolId, locale, getLocaleMessages(locale) as JsonLdMessages);
}

export function createBlogArticleBreadcrumbJsonLd(slug: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const article = getLocalizedBlogArticle(slug, normalizedLocale);
  const topicMembership = getLocalizedBlogTopicForArticle(slug, normalizedLocale);

  if (!article) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: m.home.breadcrumb,
        item: getLocalizedUrl(normalizedLocale),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: m.blog.breadcrumb,
        item: getLocalizedUrl(normalizedLocale, BLOG_INDEX_PATH),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: topicMembership?.role === 'cluster' ? topicMembership.pillar.title : article.title,
        item: getLocalizedUrl(
          normalizedLocale,
          topicMembership?.role === 'cluster' ? topicMembership.pillar.path : article.path
        ),
      },
      ...(topicMembership?.role === 'cluster' ? [{
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: getLocalizedUrl(normalizedLocale, article.path),
      }] : []),
    ],
  };
}

export function getFeaturedTools() {
  const featured = toolRegistry.filter((tool) => tool.featured);
  return featured.length > 0 ? featured : toolRegistry.slice(0, 4);
}

export function getLocalizedToolCards(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return toolRegistry.map((tool) => ({
    ...tool,
    name: m.tools[tool.id as ToolMessageId].name,
    description: m.tools[tool.id as ToolMessageId].description,
    categoryLabel: m.categories[tool.category],
    localizedPath: getLocalizedToolPath(tool, normalizedLocale),
  }));
}
