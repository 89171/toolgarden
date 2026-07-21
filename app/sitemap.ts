import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { BLOG_INDEX_PATH, blogArticles } from '@/lib/blog/articles';
import { toolRegistry } from '@/lib/tools/registry';
import { sitePageRegistry } from '@/lib/site/registry';
import { BASE_URL, getLanguageAlternates, getLocalizedUrl } from '@/lib/tools/seo';

export const dynamic = 'force-static';

const hubPaths = ['/json-tools', '/image', '/audio', '/pdf', '/file-merge', '/text', '/other'] as const;
const blogPaths = [
  BLOG_INDEX_PATH,
  ...blogArticles.map((article) => `${BLOG_INDEX_PATH}/${article.slug}`),
];
const blogArticleByPath = new Map(
  blogArticles.map((article) => [`${BLOG_INDEX_PATH}/${article.slug}`, article])
);
const blogIndexUpdatedAt = blogArticles.reduce(
  (latest, article) => article.updatedAt > latest ? article.updatedAt : latest,
  '',
);

function getLastModified(routePath: string): string | undefined {
  const article = blogArticleByPath.get(routePath);
  if (article) return article.updatedAt;
  if (routePath === BLOG_INDEX_PATH) return blogIndexUpdatedAt;
  return undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '',
    ...hubPaths,
    ...sitePageRegistry.map((page) => page.path),
    ...blogPaths,
    ...toolRegistry.map((tool) => tool.path),
  ];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => {
      const lastModified = getLastModified(path);
      return {
        url: getLocalizedUrl(locale, path),
        ...(lastModified ? { lastModified } : {}),
        alternates: {
          languages: Object.fromEntries(
            Object.entries(getLanguageAlternates(path)).map(([language, localizedPath]) => [
              language,
              `${BASE_URL}${localizedPath}`,
            ])
          ),
        },
      };
    })
  );
}
