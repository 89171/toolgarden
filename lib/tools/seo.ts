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
import { getBlogConsolidation } from '@/lib/blog/consolidations';
import {
  BASE_URL,
  buildBreadcrumbJsonLd,
  buildToolFaqJsonLd,
  buildToolJsonLd,
  createPrivacySeoDescription,
  createPageSeoTitle,
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
import { SITE_CONTACT_EMAIL, getSitePage, type SitePageId } from '@/lib/site/registry';
import type { HubArticleContent } from './types';
import { formatPrimaryOrganicKeyword, parseOrganicKeywords } from '@/lib/utils/seo';
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

const DEFAULT_OPEN_GRAPH_IMAGE = {
  url: `${BASE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: 'ToolGarden — browser-local privacy-first web tools',
};

export function getLocaleMessages(locale: string) {
  return messages[normalizeLocale(locale)];
}

/**
 * 传给 NextIntlClientProvider 的 messages。
 *
 * 这个对象会被整体序列化进每个页面的 HTML，所以只由服务端组件读取的长文内容
 * （站点信息页、hub 页正文）必须在这里剔除，否则每个页面都要背上全站正文的体积。
 */
export function getClientMessages(locale: string) {
  const {
    site_pages: _sitePages,
    hub_content: _hubContent,
    home_content: _homeContent,
    ...clientMessages
  } = getLocaleMessages(locale);
  void _sitePages;
  void _hubContent;
  void _homeContent;
  return clientMessages;
}

export function createLocaleMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const seoDescription = createPrivacySeoDescription(m.home.subtitle, normalizedLocale);

  return {
    title: {
      default: createPageSeoTitle(m.home.meta_title, normalizedLocale),
      template: `%s | ${m.home.title}`,
    },
    description: seoDescription,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: getLocalizedPath(normalizedLocale),
      languages: getLanguageAlternates(),
    },
    openGraph: {
      title: createPageSeoTitle(m.home.meta_title, normalizedLocale),
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.image_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.image_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.pdf_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.pdf_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.audio_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.audio_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.file_merge_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.file_merge_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.json_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.json_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.text_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.text_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.other_hub.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.other_hub.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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
    title: createPageSeoTitle(m.blog.meta_title, normalizedLocale),
    description: seoDescription,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, BLOG_INDEX_PATH),
      languages: getLanguageAlternates(BLOG_INDEX_PATH),
    },
    openGraph: {
      title: `${m.blog.title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
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

  const consolidatedTargetSlug = getBlogConsolidation(slug);
  const canonicalArticle = consolidatedTargetSlug
    ? getLocalizedBlogArticle(consolidatedTargetSlug, normalizedLocale)
    : article;

  if (!canonicalArticle) return null;

  const seoDescription = createPrivacySeoDescription(canonicalArticle.metaDescription, normalizedLocale);
  const seoTitle = createPageSeoTitle(canonicalArticle.metaTitle, normalizedLocale);
  const topicMembership = getLocalizedBlogTopicForArticle(canonicalArticle.slug, normalizedLocale);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      ...canonicalArticle.tags,
      ...(topicMembership?.targetKeyword ? [topicMembership.targetKeyword] : []),
    ],
    ...(consolidatedTargetSlug ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, canonicalArticle.path),
      languages: getLanguageAlternates(canonicalArticle.path),
    },
    openGraph: {
      title: `${seoTitle} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
      description: seoDescription,
      type: 'article',
      publishedTime: canonicalArticle.publishedAt,
      modifiedTime: canonicalArticle.updatedAt,
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, canonicalArticle.path),
    },
  };
}

export function createToolMetadata(toolId: ToolMessageId, locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const registryTool = getToolById(toolId);
  const path = registryTool?.path ?? `/${toolId}`;
  const tool = m.tools[toolId];
  const organicKeywords = parseOrganicKeywords(m.organic_keywords[toolId]);
  const primaryKeyword = formatPrimaryOrganicKeyword(organicKeywords[0] ?? tool.name);
  const seoTitle = createToolSeoTitle(primaryKeyword, tool.description, normalizedLocale);
  const seoDescription = createToolSeoDescription(tool.description, normalizedLocale);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: organicKeywords,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${seoTitle} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
      description: seoDescription,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
    },
  };
}

export function createSitePageMetadata(pageId: SitePageId, locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const page = m.site_pages[pageId];
  const path = getSitePage(pageId)?.path ?? `/${pageId}`;
  const title = createPageSeoTitle(page.meta_title, normalizedLocale);
  const description = createPrivacySeoDescription(page.meta_description, normalizedLocale);

  return {
    title,
    description,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${title} | ${m.home.title}`,
      images: [DEFAULT_OPEN_GRAPH_IMAGE],
      description,
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

  const organizationId = `${BASE_URL}/#organization`;
  const websiteId = `${BASE_URL}/#website`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: m.home.title,
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/icon.svg`,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: SITE_CONTACT_EMAIL,
          availableLanguage: ['English', 'Chinese'],
        },
        ...(EXPOSE_SOURCE_METADATA ? { sameAs: [REPOSITORY_URL] } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: m.home.title,
        url: BASE_URL,
        publisher: { '@id': organizationId },
        inLanguage: ['en', 'zh-CN'],
      },
      {
        '@type': 'WebApplication',
        '@id': `${getLocalizedUrl(normalizedLocale)}/#application`,
        name: m.home.title,
        description: createPrivacySeoDescription(m.home.subtitle, normalizedLocale),
        url: getLocalizedUrl(normalizedLocale),
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        browserRequirements: 'Requires a modern browser with JavaScript enabled',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
        publisher: { '@id': organizationId },
        isPartOf: { '@id': websiteId },
        ...(EXPOSE_SOURCE_METADATA ? { codeRepository: REPOSITORY_URL } : {}),
      },
    ],
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

export type HubFaqKey =
  | 'json_hub'
  | 'image_hub'
  | 'pdf_hub'
  | 'audio_hub'
  | 'file_merge_hub'
  | 'text_hub'
  | 'other_hub';

/**
 * 从某个 hub 的 messages.faq 中提取问答对。约定：所有以 `_q` 结尾的键是问题，
 * 对应同名 `_a` 键是答案，按出现顺序返回。可见 FAQ 与 FAQPage 结构化数据共用此函数，
 * 确保二者内容一致（Google 要求 FAQPage 内容在页面上可见）。
 */
export function getHubFaqItems(
  hubKey: HubFaqKey,
  locale: string
): Array<{ question: string; answer: string }> {
  const m = getLocaleMessages(locale) as unknown as Record<
    string,
    { faq?: Record<string, string> }
  >;
  const faq = m[hubKey]?.faq ?? {};
  return Object.keys(faq)
    .filter((key) => key.endsWith('_q'))
    .map((questionKey) => ({
      question: faq[questionKey],
      answer: faq[`${questionKey.slice(0, -2)}_a`],
    }))
    .filter((item) => Boolean(item.question) && Boolean(item.answer));
}

/**
 * 取某个 hub 的分类正文（导语 / 选择建议 / 对照表 / 注意事项）。
 * 只有服务端 hub 页会调用，内容不进客户端 bundle。
 */
export function getHubArticleContent(
  hubKey: HubFaqKey,
  locale: string
): HubArticleContent | null {
  const m = getLocaleMessages(locale) as unknown as {
    hub_content?: Record<string, HubArticleContent | undefined>;
  };
  return m.hub_content?.[hubKey] ?? null;
}

/** 首页正文，与 hub 正文同一结构，同样只在服务端读取。 */
export function getHomeArticleContent(locale: string): HubArticleContent | null {
  const m = getLocaleMessages(locale) as unknown as { home_content?: HubArticleContent };
  return m.home_content ?? null;
}

export function createHubFaqJsonLd(hubKey: HubFaqKey, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getHubFaqItems(hubKey, normalizeLocale(locale)).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createFaqJsonLd(locale: string) {
  return createHubFaqJsonLd('json_hub', locale);
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
    image: [DEFAULT_OPEN_GRAPH_IMAGE.url],
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
      '@id': `${BASE_URL}/#organization`,
      name: m.home.title,
      url: getLocalizedUrl(normalizedLocale, '/about'),
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: m.home.title,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.svg`,
      },
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
