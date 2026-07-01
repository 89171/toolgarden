import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getBlogPaths } from '@/lib/blog/articles';
import { toolRegistry } from '@/lib/tools/registry';
import { getLocalizedUrl } from '@/lib/tools/seo';

export const dynamic = 'force-static';

const BUILD_DATE = new Date();

const hubPaths = ['/image', '/pdf', '/file-merge', '/text'] as const;

type Languages = NonNullable<MetadataRoute.Sitemap[number]['alternates']>['languages'];

function languageAlternates(path = ''): Languages {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, getLocalizedUrl(locale, path)])
    ),
    'x-default': getLocalizedUrl(routing.defaultLocale, path),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', ...hubPaths, ...getBlogPaths(), ...toolRegistry.map((tool) => tool.path)];

  return paths.map((path) => ({
    url: getLocalizedUrl(routing.defaultLocale, path),
    lastModified: BUILD_DATE,
    // alternates: {
    //   languages: languageAlternates(path),
    // },
  }));
}
