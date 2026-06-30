import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getBlogSlugs } from '@/lib/blog/articles';

interface BlogArticleRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export default async function BlogArticleRedirectPage({ params }: BlogArticleRedirectPageProps) {
  const { slug } = await params;
  redirect(`/${routing.defaultLocale}/blog/${slug}`);
}
