import { MetadataRoute } from 'next';
import { toolRegistry } from '@/lib/tools/registry';
import { BASE_URL } from '@/lib/tools/seo';
import { routing } from '@/i18n/routing';

const locales = routing.locales;

function alternatesFor(path = '') {
  return {
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, `${BASE_URL}/${locale}${path}`])),
      'x-default': `${BASE_URL}/${routing.defaultLocale}${path}`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 首页
  const homeUrls = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
      alternates: alternatesFor(),
    }));

  // 工具页
  const toolUrls = toolRegistry.flatMap((tool) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${tool.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: alternatesFor(tool.path),
    }))
  );

  return [...homeUrls, ...toolUrls];
}
