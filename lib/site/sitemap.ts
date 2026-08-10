import { routing } from '@/i18n/routing';
import { BLOG_INDEX_PATH, blogArticles } from '@/lib/blog/articles';
import { isConsolidatedBlogSlug } from '@/lib/blog/consolidations';
import { toolRegistry } from '@/lib/tools/registry';
import { BASE_URL, getLanguageAlternates, getLocalizedUrl } from '@/lib/tools/seo';
import routeLastModified from './sitemap-lastmod.generated.json';
import { hubPaths, sitePageRegistry } from './registry';

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { languages: Record<string, string> };
}

const currentBlogArticles = blogArticles.filter(
  (article) => !isConsolidatedBlogSlug(article.slug)
);
const blogPaths = [
  BLOG_INDEX_PATH,
  ...currentBlogArticles.map((article) => `${BLOG_INDEX_PATH}/${article.slug}`),
];
const blogArticleByPath = new Map(
  currentBlogArticles.map((article) => [`${BLOG_INDEX_PATH}/${article.slug}`, article])
);
const blogIndexUpdatedAt = currentBlogArticles.reduce(
  (latest, article) => article.updatedAt > latest ? article.updatedAt : latest,
  ''
);
const nonBlogLastModified = routeLastModified as Record<string, string>;

function getLastModified(routePath: string): string {
  const article = blogArticleByPath.get(routePath);
  if (article) return article.updatedAt;
  if (routePath === BLOG_INDEX_PATH) return blogIndexUpdatedAt;

  const lastModified = nonBlogLastModified[routePath];
  if (!lastModified) {
    throw new Error(`Missing generated sitemap lastmod for ${routePath || '/'}`);
  }
  return lastModified;
}

function getAbsoluteLanguageAlternates(path = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(getLanguageAlternates(path)).map(([language, localizedPath]) => [
      language,
      `${BASE_URL}${localizedPath}`,
    ])
  );
}

export function getSitemapEntries(): SitemapEntry[] {
  const paths = [
    '',
    ...hubPaths,
    ...sitePageRegistry.map((page) => page.path),
    ...blogPaths,
    ...toolRegistry.map((tool) => tool.path),
  ];

  const rootEntry: SitemapEntry = {
    url: `${BASE_URL}/`,
    lastModified: getLastModified(''),
    alternates: { languages: getAbsoluteLanguageAlternates() },
  };

  const localizedEntries = routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: getLocalizedUrl(locale, path),
      lastModified: getLastModified(path),
      alternates: { languages: getAbsoluteLanguageAlternates(path) },
    }))
  );

  return [rootEntry, ...localizedEntries];
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * 按 Sitemap 核心协议顺序输出，再追加 XHTML 扩展：
 * loc → lastmod → changefreq → priority → xhtml:link。
 */
export function serializeSitemap(entries: SitemapEntry[]): string {
  const hasAlternates = entries.some(
    (entry) => Object.keys(entry.alternates?.languages ?? {}).length > 0
  );
  const namespace = hasAlternates
    ? ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    : ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset${namespace}>`,
  ];

  for (const entry of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.url)}</loc>`);
    lines.push(`    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`);
    if (entry.changeFrequency) {
      lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
    }
    if (typeof entry.priority === 'number') {
      lines.push(`    <priority>${entry.priority}</priority>`);
    }
    for (const [language, href] of Object.entries(entry.alternates?.languages ?? {})) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(href)}" />`
      );
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

export function createSitemapXml(): string {
  return serializeSitemap(getSitemapEntries());
}
