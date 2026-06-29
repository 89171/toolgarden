import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import zhMessages from '@/messages/zh.json';
import enMessages from '@/messages/en.json';
import { stringifyJSONValue } from '@/lib/utils/json';
import {
  getFileMergeTools,
  getImageTools,
  getLocalizedToolPath,
  getPdfTools,
  getTextTools,
  getToolById,
  toolRegistry,
} from './registry';

const DEFAULT_BASE_URL = 'https://toolgarden.xyz';

export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
export const REPOSITORY_URL = 'https://github.com/89171/json-toolkit';
const EXPOSE_SOURCE_METADATA = process.env.NEXT_PUBLIC_EXPOSE_SOURCE === 'true';

const messages = { zh: zhMessages, en: enMessages } as const;

export type Locale = (typeof routing.locales)[number];
type ToolMessageId = keyof typeof zhMessages.tools;
type ToolFaqMessageId = keyof typeof zhMessages.tool_faq;

const TOOL_TITLE_PHRASE_LIMIT: Record<Locale, number> = {
  zh: 34,
  en: 62,
};

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[\s,.，。;；:：、]+$/u, '');
}

function truncateSeoPhrase(value: string, locale: Locale): string {
  const limit = TOOL_TITLE_PHRASE_LIMIT[locale];
  const normalizedValue = value.replace(/\s+/g, ' ').trim();

  if (normalizedValue.length <= limit) return trimTrailingPunctuation(normalizedValue);

  const truncated = normalizedValue.slice(0, limit);
  const separatorIndex = Math.max(
    truncated.lastIndexOf('，'),
    truncated.lastIndexOf('、'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(';'),
    truncated.lastIndexOf('；')
  );
  const phrase = separatorIndex >= Math.floor(limit * 0.55)
    ? truncated.slice(0, separatorIndex)
    : truncated;

  return `${trimTrailingPunctuation(phrase)}...`;
}

function getToolSeoPhrase(description: string, locale: Locale): string {
  const phrase = locale === 'zh'
    ? description.replace(/^免费在线/u, '')
    : description
        .replace(/^Free online\s+/iu, '')
        .replace(/^tool to\s+/iu, '')
        .replace(/^tool for\s+/iu, '');

  return truncateSeoPhrase(phrase, locale);
}

function createToolSeoTitle(toolName: string, description: string, locale: Locale): string {
  const phrase = getToolSeoPhrase(description, locale);
  return `${toolName} - ${phrase}`;
}

function createToolSeoDescription(description: string, locale: Locale): string {
  const hasLocalSignal = locale === 'zh'
    ? /浏览器|本地/u.test(description)
    : /browser|locally|local/i.test(description);
  const suffix = locale === 'zh'
    ? (hasLocalSignal ? '无需上传，无需登录。' : '所有处理在浏览器本地完成，无需上传，无需登录。')
    : (hasLocalSignal ? 'No upload or sign-in required.' : 'Runs locally in your browser with no upload or sign-in required.');
  const separator = /[。.!?]$/u.test(description)
    ? (locale === 'zh' ? '' : ' ')
    : (locale === 'zh' ? '。' : '. ');

  return `${description}${separator}${suffix}`;
}

export function normalizeLocale(locale: string): Locale {
  return routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
}

export function getLocaleMessages(locale: string) {
  return messages[normalizeLocale(locale)];
}

export function getLocalizedUrl(locale: string, path = ''): string {
  return `${BASE_URL}/${normalizeLocale(locale)}${path}`;
}

export function getLocalizedPath(locale: string, path = ''): string {
  return `/${normalizeLocale(locale)}${path}`;
}

export function getLanguageAlternates(path = ''): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, getLocalizedPath(locale, path)])
    ),
    'x-default': getLocalizedPath(routing.defaultLocale, path),
  };
}

export function createLocaleMetadata(locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    title: {
      default: m.home.meta_title,
      template: `%s | ${m.home.title}`,
    },
    description: m.home.subtitle,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: getLocalizedPath(normalizedLocale),
      languages: getLanguageAlternates(),
    },
    openGraph: {
      title: m.home.meta_title,
      description: m.home.subtitle,
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

  return {
    title: m.image_hub.meta_title,
    description: m.image_hub.description,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.image_hub.title} | ${m.home.title}`,
      description: m.image_hub.description,
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

  return {
    title: m.pdf_hub.meta_title,
    description: m.pdf_hub.description,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.pdf_hub.title} | ${m.home.title}`,
      description: m.pdf_hub.description,
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

  return {
    title: m.file_merge_hub.meta_title,
    description: m.file_merge_hub.description,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.file_merge_hub.title} | ${m.home.title}`,
      description: m.file_merge_hub.description,
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

  return {
    title: m.text_hub.meta_title,
    description: m.text_hub.description,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${m.text_hub.title} | ${m.home.title}`,
      description: m.text_hub.description,
      type: 'website',
      locale: normalizedLocale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: m.home.title,
      url: getLocalizedPath(normalizedLocale, path),
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
    description: m.home.subtitle,
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
        description: localizedTool.description,
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
    description: m.image_hub.description,
    itemListElement: getImageTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: localizedTool.description,
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
    description: m.pdf_hub.description,
    itemListElement: getPdfTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: localizedTool.description,
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
    description: m.file_merge_hub.description,
    itemListElement: getFileMergeTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: localizedTool.description,
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
    description: m.text_hub.description,
    itemListElement: getTextTools().map((tool, index) => {
      const localizedTool = m.tools[tool.id as ToolMessageId];
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getLocalizedUrl(normalizedLocale, tool.path),
        name: localizedTool.name,
        description: localizedTool.description,
      };
    }),
  };
}

export function createFaqJsonLd(locale: string) {
  const m = getLocaleMessages(locale);
  const faq = m.home.faq;

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
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const faq = toolId in m.tool_faq ? m.tool_faq[toolId as ToolFaqMessageId] : null;

  if (!faq?.items?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createToolJsonLd(toolId: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const tool = getToolById(toolId);
  const localizedTool = m.tools[toolId as ToolMessageId];

  if (!tool || !localizedTool) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: localizedTool.name,
    description: localizedTool.description,
    url: getLocalizedUrl(normalizedLocale, tool.path),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: m.home.title,
      url: getLocalizedUrl(normalizedLocale),
    },
  };
}

export function createBreadcrumbJsonLd(toolId: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const tool = getToolById(toolId);
  const localizedTool = m.tools[toolId as ToolMessageId];

  if (!tool || !localizedTool) return null;

  const homeListItem = {
    '@type': 'ListItem',
    position: 1,
    name: m.home.breadcrumb,
    item: getLocalizedUrl(normalizedLocale),
  };

  if (tool.path.startsWith('/image/')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeListItem,
        {
          '@type': 'ListItem',
          position: 2,
          name: m.image_hub.breadcrumb,
          item: getLocalizedUrl(normalizedLocale, '/image'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: localizedTool.name,
          item: getLocalizedUrl(normalizedLocale, tool.path),
        },
      ],
    };
  }

  if (tool.path.startsWith('/pdf/')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeListItem,
        {
          '@type': 'ListItem',
          position: 2,
          name: m.pdf_hub.breadcrumb,
          item: getLocalizedUrl(normalizedLocale, '/pdf'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: localizedTool.name,
          item: getLocalizedUrl(normalizedLocale, tool.path),
        },
      ],
    };
  }

  if (tool.path.startsWith('/file-merge/')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeListItem,
        {
          '@type': 'ListItem',
          position: 2,
          name: m.file_merge_hub.breadcrumb,
          item: getLocalizedUrl(normalizedLocale, '/file-merge'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: localizedTool.name,
          item: getLocalizedUrl(normalizedLocale, tool.path),
        },
      ],
    };
  }

  if (tool.path.startsWith('/text/')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeListItem,
        {
          '@type': 'ListItem',
          position: 2,
          name: m.text_hub.breadcrumb,
          item: getLocalizedUrl(normalizedLocale, '/text'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: localizedTool.name,
          item: getLocalizedUrl(normalizedLocale, tool.path),
        },
      ],
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      homeListItem,
      {
        '@type': 'ListItem',
        position: 2,
        name: localizedTool.name,
        item: getLocalizedUrl(normalizedLocale, tool.path),
      },
    ],
  };
}

export function toJsonLd(data: unknown): string {
  return stringifyJSONValue(data);
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
