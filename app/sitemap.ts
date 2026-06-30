import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { toolRegistry } from '@/lib/tools/registry';
import { BASE_URL } from '@/lib/tools/seo';

type SitemapEntry = MetadataRoute.Sitemap[number];

export const dynamic = 'force-static';

const hubPaths = ['/image', '/pdf', '/file-merge', '/text'] as const;

function localizedUrl(locale: string, path = '') {
  return `${BASE_URL}/${locale}${path}`;
}

function languageAlternates(path = ''): NonNullable<SitemapEntry['alternates']>['languages'] {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedUrl(locale, path)])
    ),
    'x-default': localizedUrl(routing.defaultLocale, path),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routeEntries: Array<Pick<SitemapEntry, 'changeFrequency' | 'priority'> & { path: string }> = [
    {
      path: '',
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...hubPaths.map((path) => ({
      path,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...toolRegistry.map((tool) => ({
      path: tool.path,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  return routeEntries.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, entry.path),
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: languageAlternates(entry.path),
      },
    }))
  );
}
