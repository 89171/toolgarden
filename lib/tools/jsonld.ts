import { routing } from '@/i18n/routing';
import { getPillarSlugForToolPath } from '@/lib/blog/topics';
import { stringifyJSONValue } from '@/lib/utils/json';
import { parseOrganicKeywords } from '@/lib/utils/seo';
import { getToolById } from './registry';

const DEFAULT_BASE_URL = 'https://toolgarden.xyz';

export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');

export type Locale = (typeof routing.locales)[number];

const TOOL_TITLE_LIMIT: Record<Locale, number> = {
  zh: 30,
  en: 47,
};

const SEO_DESCRIPTION_LIMIT: Record<Locale, number> = {
  zh: 90,
  en: 155,
};

export function normalizeLocale(locale: string): Locale {
  return routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
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

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[\s,.，。;；:：、/|\\–—-]+$/u, '');
}

function truncatePlainText(value: string, limit: number, locale: Locale): string {
  const normalizedValue = value.replace(/\s+/g, ' ').trim();

  if (normalizedValue.length <= limit) return trimTrailingPunctuation(normalizedValue);

  const truncated = normalizedValue.slice(0, limit);
  const separatorIndex = Math.max(
    truncated.lastIndexOf('，'),
    truncated.lastIndexOf('、'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(';'),
    truncated.lastIndexOf('；'),
    truncated.lastIndexOf('/'),
    truncated.lastIndexOf('|'),
    truncated.lastIndexOf(' ')
  );
  const phrase = separatorIndex >= Math.floor(limit * 0.55)
    ? truncated.slice(0, separatorIndex)
    : truncated;

  const cleanPhrase = trimTrailingPunctuation(phrase);
  if (locale !== 'en') return cleanPhrase;

  return trimTrailingPunctuation(
    cleanPhrase.replace(/\s+(?:a|an|and|for|in|of|on|or|the|to|with)$/iu, '')
  );
}

function truncateSeoPhrase(value: string, locale: Locale, limit: number): string {
  return truncatePlainText(value, limit, locale);
}

export function getToolSeoPhrase(description: string, locale: Locale, limit = TOOL_TITLE_LIMIT[locale]): string {
  const phrase = locale === 'zh'
    ? description
    : description
        .replace(/^Free online\s+/iu, '')
        .replace(/^tool to\s+/iu, '')
        .replace(/^tool for\s+/iu, '');

  return truncateSeoPhrase(phrase, locale, limit);
}

export function createToolSeoTitle(toolName: string, description: string, locale: Locale): string {
  const titleLimit = TOOL_TITLE_LIMIT[locale];
  const normalizedName = truncatePlainText(toolName, titleLimit, locale);
  const phraseBudget = titleLimit - normalizedName.length - 3;

  if (phraseBudget < (locale === 'zh' ? 6 : 12)) return normalizedName;

  const phrase = getToolSeoPhrase(description, locale, phraseBudget);
  return phrase ? `${normalizedName} - ${phrase}` : normalizedName;
}

export function createPageSeoTitle(title: string, locale: Locale): string {
  return truncatePlainText(title, TOOL_TITLE_LIMIT[locale], locale);
}

function appendSeoSentence(description: string, sentence: string, locale: Locale): string {
  const normalizedDescription = description.trim();
  const separator = /[。.!?]$/u.test(normalizedDescription)
    ? (locale === 'zh' ? '' : ' ')
    : (locale === 'zh' ? '。' : '. ');

  return `${normalizedDescription}${separator}${sentence}`;
}

function fitDescriptionWithSuffix(description: string, suffix: string, locale: Locale): string {
  const limit = SEO_DESCRIPTION_LIMIT[locale];
  const fullDescription = appendSeoSentence(description, suffix, locale);
  if (fullDescription.length <= limit) return fullDescription;

  const separator = locale === 'zh' ? '。' : '. ';
  const descriptionBudget = limit - suffix.length - separator.length;
  const conciseDescription = truncatePlainText(description, descriptionBudget, locale);
  return appendSeoSentence(conciseDescription, suffix, locale);
}

function hasLocalProcessingSignal(description: string, locale: Locale): boolean {
  return locale === 'zh'
    ? /浏览器|本地|无需上传|不上传/u.test(description)
    : /browser|locally|local|no upload|not uploaded/i.test(description);
}

function hasPrivacySignal(description: string, locale: Locale): boolean {
  return locale === 'zh'
    ? /隐私|敏感|无需上传|不上传/u.test(description)
    : /privacy|private|sensitive|no upload|not uploaded/i.test(description);
}

export function createPrivacySeoDescription(description: string, locale: Locale): string {
  if (hasPrivacySignal(description, locale)) {
    return truncatePlainText(description, SEO_DESCRIPTION_LIMIT[locale], locale);
  }

  const suffix = locale === 'zh'
    ? (hasLocalProcessingSignal(description, locale) ? '更安心保护隐私。' : '优先在浏览器本地处理，减少上传，更安心保护隐私。')
    : (hasLocalProcessingSignal(description, locale) ? 'Built for privacy-friendly local workflows.' : 'Browser-local workflows reduce uploads and help protect privacy.');

  return fitDescriptionWithSuffix(description, suffix, locale);
}

export function createToolSeoDescription(description: string, locale: Locale): string {
  const hasLocalSignal = locale === 'zh'
    ? /浏览器|本地/u.test(description)
    : /browser|locally|local/i.test(description);
  const suffix = locale === 'zh'
    ? (hasLocalSignal ? '无需上传。' : '浏览器本地处理，无需上传。')
    : (hasLocalSignal ? 'No upload required.' : 'Browser-local with no upload required.');

  return fitDescriptionWithSuffix(description, suffix, locale);
}

export function toJsonLd(data: unknown): string {
  return stringifyJSONValue(data)
    .replace(/</gu, '\\u003c')
    .replace(/\u2028/gu, '\\u2028')
    .replace(/\u2029/gu, '\\u2029');
}

// ── 消息无关的 JSON-LD 构造器（接受 messages 结构作为参数） ─────────

export interface LocalizedTool {
  name: string;
  description: string;
}

export interface JsonLdMessages {
  home: { title: string; breadcrumb: string };
  image_hub?: { breadcrumb: string };
  audio_hub?: { breadcrumb: string };
  pdf_hub?: { breadcrumb: string };
  file_merge_hub?: { breadcrumb: string };
  text_hub?: { breadcrumb: string };
  other_hub?: { breadcrumb: string };
  tools: Record<string, LocalizedTool>;
  organic_keywords?: Record<string, string>;
  tool_faq?: Record<string, { items?: Array<{ question: string; answer: string }> }>;
}

export function buildToolJsonLd(toolId: string, locale: string, messages: JsonLdMessages) {
  const normalizedLocale = normalizeLocale(locale);
  const tool = getToolById(toolId);
  const localizedTool = messages.tools[toolId];
  const organicKeywords = parseOrganicKeywords(messages.organic_keywords?.[toolId]);

  if (!tool || !localizedTool) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: localizedTool.name,
    description: createToolSeoDescription(localizedTool.description, normalizedLocale),
    ...(organicKeywords.length > 0 ? { keywords: organicKeywords.join(', ') } : {}),
    url: getLocalizedUrl(normalizedLocale, tool.path),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: messages.home.title,
      url: getLocalizedUrl(normalizedLocale),
    },
    subjectOf: {
      '@type': 'WebPage',
      url: getLocalizedUrl(
        normalizedLocale,
        `/blog/${getPillarSlugForToolPath(tool.path)}`
      ),
    },
  };
}

export function buildBreadcrumbJsonLd(toolId: string, locale: string, messages: JsonLdMessages) {
  const normalizedLocale = normalizeLocale(locale);
  const tool = getToolById(toolId);
  const localizedTool = messages.tools[toolId];

  if (!tool || !localizedTool) return null;

  const homeListItem = {
    '@type': 'ListItem',
    position: 1,
    name: messages.home.breadcrumb,
    item: getLocalizedUrl(normalizedLocale),
  };

  const hub = (() => {
    if (tool.path.startsWith('/image/')) return { key: 'image_hub' as const, path: '/image' };
    if (tool.path.startsWith('/audio/')) return { key: 'audio_hub' as const, path: '/audio' };
    if (tool.path.startsWith('/pdf/')) return { key: 'pdf_hub' as const, path: '/pdf' };
    if (tool.path.startsWith('/file-merge/')) return { key: 'file_merge_hub' as const, path: '/file-merge' };
    if (tool.path.startsWith('/text/')) return { key: 'text_hub' as const, path: '/text' };
    if (tool.path.startsWith('/other/')) return { key: 'other_hub' as const, path: '/other' };
    return null;
  })();

  if (hub) {
    const hubMessages = messages[hub.key];
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeListItem,
        {
          '@type': 'ListItem',
          position: 2,
          name: hubMessages?.breadcrumb ?? '',
          item: getLocalizedUrl(normalizedLocale, hub.path),
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

export function buildToolFaqJsonLd(toolId: string, messages: JsonLdMessages) {
  const faq = messages.tool_faq?.[toolId];
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
