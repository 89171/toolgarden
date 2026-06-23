import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import zhMessages from '@/messages/zh.json';
import enMessages from '@/messages/en.json';
import { stringifyJSONValue } from '@/lib/utils/json';
import { getFileMergeTools, getImageTools, getLocalizedToolPath, getPdfTools, getToolById, toolRegistry } from './registry';

export const BASE_URL = 'https://json-toolkit.dev';
export const REPOSITORY_URL = 'https://github.com/89171/json-toolkit';

const messages = { zh: zhMessages, en: enMessages } as const;

export type Locale = (typeof routing.locales)[number];
type ToolMessageId = keyof typeof zhMessages.tools;
type ToolFaqMessageId = keyof typeof zhMessages.tool_faq;

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

export function createToolMetadata(toolId: ToolMessageId, locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const registryTool = getToolById(toolId);
  const path = registryTool?.path ?? `/${toolId}`;
  const tool = m.tools[toolId];

  return {
    title: tool.name,
    description: tool.description,
    alternates: {
      canonical: getLocalizedPath(normalizedLocale, path),
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      title: `${tool.name} | ${m.home.title}`,
      description: tool.description,
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
    codeRepository: REPOSITORY_URL,
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

  if (tool.path.startsWith('/image/')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: m.home.title,
          item: getLocalizedUrl(normalizedLocale),
        },
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
        {
          '@type': 'ListItem',
          position: 1,
          name: m.home.title,
          item: getLocalizedUrl(normalizedLocale),
        },
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
        {
          '@type': 'ListItem',
          position: 1,
          name: m.home.title,
          item: getLocalizedUrl(normalizedLocale),
        },
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

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: m.home.title,
        item: getLocalizedUrl(normalizedLocale),
      },
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
