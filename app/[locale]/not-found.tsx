import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { NotFoundContent } from '@/components/NotFoundContent';
import { getLocaleMessages, normalizeLocale } from '@/lib/tools/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale());
  const m = getLocaleMessages(locale);

  return {
    title: m.not_found.title,
    description: m.not_found.description,
    robots: { index: false, follow: true },
  };
}

export default async function LocaleNotFound() {
  const locale = await getLocale();

  return <NotFoundContent locale={locale} />;
}
