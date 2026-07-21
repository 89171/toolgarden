import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from '@/components/ui/AppLink';
import { SITE_CONTACT_EMAIL, getSitePage, type SitePageId } from '@/lib/site/registry';
import {
  getLocaleMessages,
  getLocalizedUrl,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

interface SiteInfoPageProps {
  locale: string;
  pageId: SitePageId;
}

export function SiteInfoPage({ locale, pageId }: SiteInfoPageProps) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const page = getSitePage(pageId);
  const content = m.site_pages[pageId];
  const path = page?.path ?? `/${pageId}`;
  const pageUrl = getLocalizedUrl(normalizedLocale, path);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': pageId === 'about' ? 'AboutPage' : pageId === 'contact' ? 'ContactPage' : 'WebPage',
    name: content.title,
    description: content.meta_description,
    url: pageUrl,
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: m.home.title,
      url: getLocalizedUrl(normalizedLocale),
    },
    dateModified: m.site_pages.updated_at,
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <main className="mx-auto w-full max-w-[900px]">
          <nav className="mb-5 flex items-center gap-1 text-sm text-content-muted" aria-label="breadcrumb">
            <Link href={`/${normalizedLocale}`} className="transition-colors hover:text-content-secondary">
              {m.home.breadcrumb}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-content-secondary">{content.title}</span>
          </nav>

          <article>
            <header className="border-b border-border-subtle pb-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-normal text-content-faint">
                {m.site_pages.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-content sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-content-muted sm:text-lg">
                {content.intro}
              </p>
              <p className="mt-4 text-sm text-content-faint">
                {m.site_pages.updated_label}: {m.site_pages.updated_at}
              </p>
            </header>

            <div className="py-8 sm:py-10">
              {content.sections.map((section) => (
                <section key={section.title} className="border-b border-border-subtle py-7 first:pt-0 last:border-0">
                  <h2 className="text-xl font-bold text-content sm:text-2xl">{section.title}</h2>
                  <div className="mt-4 space-y-4 text-base leading-8 text-content-secondary">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  {'items' in section && section.items?.length ? (
                    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-content-muted marker:text-content-faint">
                      {section.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : null}
                  {'links' in section && section.links?.length ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {section.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          rel="noreferrer"
                          target="_blank"
                          className="rounded border border-border-subtle bg-surface px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-content"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}

              {pageId === 'contact' ? (
                <aside className="mt-8 rounded-lg border border-border-base bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-normal text-content-faint">
                    {m.site_pages.contact.email_label}
                  </p>
                  <a
                    href={`mailto:${SITE_CONTACT_EMAIL}`}
                    className="mt-2 block break-all font-mono text-base font-semibold text-content-secondary underline-offset-4 hover:text-content hover:underline"
                  >
                    {SITE_CONTACT_EMAIL}
                  </a>
                </aside>
              ) : null}
            </div>
          </article>
        </main>
      </div>
      <Footer />
    </div>
  );
}
