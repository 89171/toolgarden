import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLocalizedBlogArticles } from '@/lib/blog/articles';
import {
  createBlogIndexMetadata,
  createBlogItemListJsonLd,
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

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createBlogItemListJsonLd(normalizedLocale)) }}
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

          <section className="py-8 sm:py-10" aria-labelledby="blog-articles-title">
            <h2 id="blog-articles-title" className="mb-5 text-xs font-semibold uppercase tracking-normal text-content-faint">
              {m.blog.all_articles}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={getLocalizedPath(normalizedLocale, article.path)}
                  className="group flex min-h-72 flex-col rounded-lg border border-border-base bg-surface-raised p-5 transition-colors hover:border-border-strong hover:bg-surface-hover sm:p-6"
                >
                  <span className="text-xs font-medium text-content-faint">
                    {formatDate(article.publishedAt, normalizedLocale)} · {article.readingTime}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold leading-tight text-content">
                    {article.title}
                  </h3>
                  <p className="mt-3 flex-grow text-sm leading-7 text-content-muted sm:text-base">
                    {article.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="rounded border border-border-subtle bg-surface px-2 py-1 text-xs font-medium text-content-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-5 text-sm font-semibold text-content-secondary transition-colors group-hover:text-content">
                    {m.blog.read_more}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
