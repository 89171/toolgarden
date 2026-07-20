import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogArticleRenderer } from '@/components/BlogArticleRenderer';
import { BlogTopicNavigation } from '@/components/BlogTopicNavigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { routing } from '@/i18n/routing';
import {
  getBlogSlugs,
  getLocalizedBlogArticle,
  getLocalizedBlogTopicForArticle,
  getRelatedBlogArticles,
} from '@/lib/blog/articles';
import {
  createBlogArticleBreadcrumbJsonLd,
  createBlogArticleFaqJsonLd,
  createBlogArticleJsonLd,
  createBlogArticleMetadata,
  createBlogIndexMetadata,
  getLocaleMessages,
  getLocalizedPath,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

interface BlogArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getBlogSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  return createBlogArticleMetadata(slug, locale) ?? createBlogIndexMetadata(locale);
}

function formatDate(date: string, locale: string): string {
  const [year, month, day] = date.split('-').map(Number);
  if (locale === 'zh') return `${year}年${month}月${day}日`;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { locale, slug } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const article = getLocalizedBlogArticle(slug, normalizedLocale);

  if (!article) notFound();

  const m = getLocaleMessages(normalizedLocale);
  const relatedArticles = getRelatedBlogArticles(slug, normalizedLocale);
  const topicMembership = getLocalizedBlogTopicForArticle(slug, normalizedLocale);
  const faqJsonLd = createBlogArticleFaqJsonLd(slug, normalizedLocale);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createBlogArticleJsonLd(slug, normalizedLocale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createBlogArticleBreadcrumbJsonLd(slug, normalizedLocale)) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }}
        />
      )}
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <main className="mx-auto w-full max-w-[980px]">
          <nav className="mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1 text-sm text-content-muted" aria-label="breadcrumb">
            <Link href={`/${normalizedLocale}`} className="shrink-0 transition-colors hover:text-content-secondary">
              {m.home.breadcrumb}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${normalizedLocale}/blog`} className="shrink-0 transition-colors hover:text-content-secondary">
              {m.blog.breadcrumb}
            </Link>
            <span aria-hidden="true">/</span>
            {topicMembership?.role === 'cluster' ? (
              <>
                <Link
                  href={getLocalizedPath(normalizedLocale, topicMembership.pillar.path)}
                  className="shrink-0 transition-colors hover:text-content-secondary"
                >
                  {topicMembership.pillar.title}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            ) : null}
            <span className="shrink-0 font-medium text-content-secondary">{article.title}</span>
          </nav>

          <article>
            <header className="border-b border-border-subtle pb-8">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded border border-border-subtle bg-surface px-2 py-1 text-xs font-medium text-content-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-content sm:text-5xl">
                {article.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-content-muted sm:text-lg">
                {article.excerpt}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-content-faint">
                {m.blog.privacy_note}
              </p>
              <p className="mt-4 text-sm text-content-faint">
                {m.blog.published_label} {formatDate(article.publishedAt, normalizedLocale)} / {article.readingTime}
              </p>
            </header>

            {topicMembership ? (
              <BlogTopicNavigation
                locale={normalizedLocale}
                currentSlug={slug}
                membership={topicMembership}
                labels={{
                  pillarGuide: m.blog.pillar_guide,
                  clusterArticles: m.blog.cluster_articles,
                  backToPillar: m.blog.back_to_pillar,
                  targetKeyword: m.blog.target_keyword,
                }}
              />
            ) : null}

            <div className="py-8 sm:py-10">
              <BlogArticleRenderer blocks={article.blocks} locale={normalizedLocale} />
            </div>

            {article.faq && article.faq.length > 0 && (
              <section className="border-t border-border-subtle py-8" aria-labelledby="faq-title">
                <h2 id="faq-title" className="text-2xl font-bold text-content sm:text-3xl">
                  {m.blog.faq_title}
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  {article.faq.map((item, index) => (
                    <details
                      key={index}
                      className="group rounded-lg border border-border-subtle bg-surface p-4 open:border-border-strong"
                    >
                      <summary className="cursor-pointer list-none text-base font-semibold text-content marker:hidden">
                        <span className="mr-2 text-content-faint">Q.</span>
                        {item.question}
                      </summary>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-content-secondary">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>

          <section className="border-t border-border-subtle py-8" aria-labelledby="related-tools-title">
            <h2 id="related-tools-title" className="text-xs font-semibold uppercase tracking-normal text-content-faint">
              {m.blog.related_tools}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {article.relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={getLocalizedPath(normalizedLocale, tool.href)}
                  className="rounded-lg border border-border-base bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  <span className="block font-semibold text-content">{tool.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-content-muted">{tool.description}</span>
                </Link>
              ))}
            </div>
          </section>

          {relatedArticles.length > 0 && (
            <section className="border-t border-border-subtle py-8" aria-labelledby="related-articles-title">
              <h2
                id="related-articles-title"
                className="text-xs font-semibold uppercase tracking-normal text-content-faint"
              >
                {m.blog.related_articles}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={getLocalizedPath(normalizedLocale, related.path)}
                    className="rounded-lg border border-border-base bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
                  >
                    <span className="block font-semibold text-content">{related.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-content-muted">{related.excerpt}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
