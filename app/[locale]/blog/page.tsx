import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLocalizedBlogArticles, getLocalizedBlogTopics } from '@/lib/blog/articles';
import {
  createBlogIndexMetadata,
  createBlogItemListJsonLd,
  createBlogTopicCollectionJsonLd,
  getLocaleMessages,
  getLocalizedPath,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

interface BlogIndexPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogIndexPageProps): Promise<Metadata> {
  const { locale } = await params;
  return createBlogIndexMetadata(locale);
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

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const articles = getLocalizedBlogArticles(normalizedLocale);
  const topics = getLocalizedBlogTopics(normalizedLocale);
  const topicArticleSlugs = new Set(
    topics.flatMap((topic) => [topic.pillar.slug, ...topic.clusters.map((article) => article.slug)])
  );
  const moreArticles = articles.filter((article) => !topicArticleSlugs.has(article.slug));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createBlogItemListJsonLd(normalizedLocale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createBlogTopicCollectionJsonLd(normalizedLocale)) }}
      />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <main className="mx-auto w-full max-w-[1100px]">
          <nav className="mb-4 flex items-center gap-1 text-sm text-content-muted" aria-label="breadcrumb">
            <Link href={`/${normalizedLocale}`} className="transition-colors hover:text-content-secondary">
              {m.home.breadcrumb}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-content-secondary">{m.blog.breadcrumb}</span>
          </nav>

          <header className="border-b border-border-subtle pb-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-normal text-content-faint">
              {m.blog.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-content sm:text-5xl">
              {m.blog.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-content-muted sm:text-lg">
              {m.blog.description}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-content-faint">
              {m.blog.privacy_note}
            </p>
          </header>

          <section className="py-8 sm:py-10" aria-labelledby="blog-topic-guides-title">
            <h2 id="blog-topic-guides-title" className="text-2xl font-bold text-content sm:text-3xl">
              {m.blog.topic_hubs}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-content-muted sm:text-base">
              {m.blog.topic_hubs_description}
            </p>

            <div className="mt-8 flex flex-col gap-10">
              {topics.map((topic) => (
                <section
                  key={topic.id}
                  className="grid grid-cols-1 gap-5 border-t border-border-subtle pt-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10"
                  aria-labelledby={`${topic.id}-title`}
                >
                  <Link
                    href={getLocalizedPath(normalizedLocale, topic.pillar.path)}
                    className="group rounded-lg border border-border-base bg-surface-raised p-5 transition-colors hover:border-border-strong hover:bg-surface-hover sm:p-6"
                  >
                    <span className="text-xs font-semibold text-content-faint">{m.blog.pillar_guide}</span>
                    <h3 id={`${topic.id}-title`} className="mt-3 text-2xl font-bold leading-tight text-content sm:text-3xl">
                      {topic.pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-content-muted sm:text-base">
                      {topic.pillar.excerpt}
                    </p>
                    <span className="mt-5 inline-block text-sm font-semibold text-content-secondary transition-colors group-hover:text-content">
                      {m.blog.read_more}
                    </span>
                  </Link>

                  <div>
                    <h4 className="text-sm font-semibold text-content-secondary">{m.blog.cluster_articles}</h4>
                    <div className="mt-3 flex flex-col gap-2">
                      {topic.clusters.map((article, index) => (
                        <Link
                          key={article.slug}
                          href={getLocalizedPath(normalizedLocale, article.path)}
                          className="group grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-lg border border-border-subtle bg-surface px-4 py-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
                        >
                          <span>
                            <span className="block font-semibold leading-snug text-content">{article.title}</span>
                            <span className="mt-1 block text-xs leading-5 text-content-faint">
                              {m.blog.target_keyword}: {topic.targetKeywords[index]}
                            </span>
                          </span>
                          <span className="self-center text-content-faint transition-colors group-hover:text-content" aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="border-t border-border-subtle py-8 sm:py-10" aria-labelledby="more-articles-title">
            <h2 id="more-articles-title" className="text-2xl font-bold text-content sm:text-3xl">
              {m.blog.more_articles}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-content-muted sm:text-base">
              {m.blog.more_articles_description}
            </p>
            <details className="mt-6 rounded-lg border border-border-base bg-surface">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-content marker:text-content-faint">
                {m.blog.all_articles} ({moreArticles.length})
              </summary>
              <div className="grid grid-cols-1 gap-2 border-t border-border-subtle p-4 md:grid-cols-2">
                {moreArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={getLocalizedPath(normalizedLocale, article.path)}
                    className="rounded border border-border-subtle bg-surface-raised p-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
                  >
                    <span className="block text-xs text-content-faint">
                      {formatDate(article.publishedAt, normalizedLocale)} / {article.readingTime}
                    </span>
                    <span className="mt-2 block font-semibold leading-snug text-content">{article.title}</span>
                    <span className="mt-2 line-clamp-2 block text-sm leading-6 text-content-muted">{article.excerpt}</span>
                  </Link>
                ))}
              </div>
            </details>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
