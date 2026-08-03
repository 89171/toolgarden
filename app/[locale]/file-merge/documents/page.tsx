import type { Metadata } from 'next';
import { StaticRedirect } from '@/components/StaticRedirect';
import { getLocaleMessages, getLocalizedPath, normalizeLocale } from '@/lib/tools/seo';

const TARGET = '/file-merge/word';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return {
    title: m.redirect_page.title,
    description: m.redirect_page.description,
    // 别名路径不参与索引，canonical 指向真实工具页，避免与它争抢排名
    robots: { index: false, follow: true },
    alternates: { canonical: getLocalizedPath(normalizedLocale, TARGET) },
  };
}

export default async function FileDocumentsMergeRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);

  return (
    <StaticRedirect locale={normalizedLocale} to={TARGET} label={m.nav.file_merge_tools} />
  );
}
