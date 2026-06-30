import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { toolRegistry } from '@/lib/tools/registry';
import { BASE_URL } from '@/lib/tools/seo';

export const dynamic = 'force-static';

const BUILD_DATE = new Date();

const hubPaths = ['/image', '/pdf', '/file-merge', '/text'] as const;

function localizedUrl(locale: string, path = '') {
  return `${BASE_URL}/${locale}${path}`;
}

type Languages = NonNullable<MetadataRoute.Sitemap[number]['alternates']>['languages'];

function languageAlternates(path = ''): Languages {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedUrl(locale, path)])
    ),
    'x-default': localizedUrl(routing.defaultLocale, path),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', ...hubPaths, ...toolRegistry.map((tool) => tool.path)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified: BUILD_DATE,
      // alternates: {
      //   languages: languageAlternates(path),
      // },
    }))
  );
}
