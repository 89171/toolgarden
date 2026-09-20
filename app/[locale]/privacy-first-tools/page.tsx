import type { Metadata } from 'next';
import BlogArticlePage from '@/app/[locale]/blog/[slug]/page';
import { createBlogArticleMetadata } from '@/lib/tools/seo';

interface PrivacyFirstToolsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyFirstToolsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return createBlogArticleMetadata('privacy-first-tools', locale) ?? {};
}

export default async function PrivacyFirstToolsPage({ params }: PrivacyFirstToolsPageProps) {
  const { locale } = await params;
  return BlogArticlePage({ params: Promise.resolve({ locale, slug: 'privacy-first-tools' }) });
}
