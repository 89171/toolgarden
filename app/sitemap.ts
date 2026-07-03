import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { BLOG_INDEX_PATH, blogArticles } from '@/lib/blog/articles';
import { toolRegistry } from '@/lib/tools/registry';
import { BASE_URL, getLanguageAlternates, getLocalizedUrl } from '@/lib/tools/seo';

export const dynamic = 'force-static';

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const PROJECT_ROOT = process.cwd();

const hubPaths = ['/image', '/pdf', '/file-merge', '/text'] as const;
const blogPaths = [
  BLOG_INDEX_PATH,
  ...blogArticles.map((article) => `${BLOG_INDEX_PATH}/${article.slug}`),
];
const blogArticleByPath = new Map(
  blogArticles.map((article) => [`${BLOG_INDEX_PATH}/${article.slug}`, article])
);
const lastModifiedCache = new Map<string, string | null>();

function normalizeDateString(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;

  return date.toISOString().slice(0, 10);
}

function existingSourcePaths(sourcePaths: string[]): string[] {
  return sourcePaths.filter((sourcePath) => fs.existsSync(path.join(PROJECT_ROOT, sourcePath)));
}

function getGitDate(sourcePaths: string[]): string | null {
  const existingPaths = existingSourcePaths(sourcePaths);
  if (existingPaths.length === 0) return null;

  const cacheKey = existingPaths.join('\0');
  if (lastModifiedCache.has(cacheKey)) return lastModifiedCache.get(cacheKey) ?? null;

  try {
    const dirtyStatus = execFileSync('git', ['status', '--porcelain', '--', ...existingPaths], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (dirtyStatus.length > 0) {
      lastModifiedCache.set(cacheKey, BUILD_DATE);
      return BUILD_DATE;
    }

    const gitDate = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...existingPaths], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const normalizedDate = normalizeDateString(gitDate);
    lastModifiedCache.set(cacheKey, normalizedDate);
    return normalizedDate;
  } catch {
    lastModifiedCache.set(cacheKey, null);
    return null;
  }
}

function getFileModifiedDate(sourcePaths: string[]): string | null {
  const dates = existingSourcePaths(sourcePaths)
    .map((sourcePath) => fs.statSync(path.join(PROJECT_ROOT, sourcePath)).mtime)
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] ? dates[0].toISOString().slice(0, 10) : null;
}

function getSourceLastModified(sourcePaths: string[]): string {
  return getGitDate(sourcePaths) ?? getFileModifiedDate(sourcePaths) ?? BUILD_DATE;
}

function getRouteSourcePaths(routePath: string): string[] {
  if (routePath === '') {
    return ['app/[locale]/page.tsx', 'components/HomePageContent.tsx'];
  }

  if (routePath === BLOG_INDEX_PATH) {
    return [
      'app/[locale]/blog/page.tsx',
      'lib/blog/articles.ts',
      'lib/blog/seo-articles.ts',
      'lib/blog/workflow-seo-articles.ts',
    ];
  }

  return [`app/[locale]${routePath}/page.tsx`];
}

function getLastModified(routePath: string): string {
  const article = blogArticleByPath.get(routePath);
  const articleUpdatedAt = article ? normalizeDateString(article.updatedAt) : null;

  return articleUpdatedAt ?? getSourceLastModified(getRouteSourcePaths(routePath));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', ...hubPaths, ...blogPaths, ...toolRegistry.map((tool) => tool.path)];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: getLocalizedUrl(locale, path),
      lastModified: getLastModified(path),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(getLanguageAlternates(path)).map(([language, localizedPath]) => [
            language,
            `${BASE_URL}${localizedPath}`,
          ])
        ),
      },
    }))
  );
}
