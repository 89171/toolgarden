import type { Metadata } from 'next';
import Link from '@/components/ui/AppLink';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import HubFaqSection from '@/components/HubFaqSection';
import { getOtherTools } from '@/lib/tools/registry';
import {
  createHubFaqJsonLd,
  getHubFaqItems,
  createOtherHubMetadata,
  createOtherToolItemListJsonLd,
  getLocaleMessages,
  getLocalizedToolCards,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createOtherHubMetadata(locale);
}

export default async function OtherHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const otherToolIds = new Set(getOtherTools().map((tool) => tool.id));
  const otherTools = getLocalizedToolCards(normalizedLocale).filter((tool) => otherToolIds.has(tool.id));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createOtherToolItemListJsonLd(normalizedLocale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createHubFaqJsonLd('other_hub', normalizedLocale)) }}
      />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <header className="mb-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-content-muted" aria-label="breadcrumb">
            <Link href={`/${normalizedLocale}`} className="hover:text-content-secondary">
              {m.home.breadcrumb}
            </Link>
            <span>/</span>
            <span className="font-medium text-content-secondary">{m.other_hub.breadcrumb}</span>
          </nav>
          <h1 className="text-2xl font-bold leading-tight text-content sm:text-3xl">{m.other_hub.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-content-muted">
            {m.other_hub.description}
          </p>
          <p className="mt-2 text-sm text-content-faint">{m.other_hub.privacy_note}</p>
        </header>

        <section>
          <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
            {m.other_hub.all_tools}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {otherTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.localizedPath}
                aria-label={`${tool.name}: ${tool.description}`}
                className="group flex min-h-32 flex-col gap-3 rounded-lg border border-border-base bg-background p-4 transition-all hover:border-border-strong hover:bg-surface-hover hover:shadow-sm sm:min-h-36 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-11 items-center justify-center rounded border border-border-subtle bg-surface-raised font-mono text-xs font-semibold text-content-faint transition-colors group-hover:text-content-secondary"
                >
                  {tool.icon}
                </span>
                <span className="font-semibold text-content">{tool.name}</span>
                <span className="text-sm leading-relaxed text-content-muted">{tool.description}</span>
              </Link>
            ))}
          </div>
        </section>
        <HubFaqSection items={getHubFaqItems('other_hub', normalizedLocale)} title={m.blog.faq_title} />
      </div>
      <Footer />
    </div>
  );
}
