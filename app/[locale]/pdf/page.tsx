import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getPdfTools } from '@/lib/tools/registry';
import {
  createPdfHubMetadata,
  createPdfToolItemListJsonLd,
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
  return createPdfHubMetadata(locale);
}

export default async function PdfHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const pdfToolIds = new Set(getPdfTools().map((tool) => tool.id));
  const pdfTools = getLocalizedToolCards(normalizedLocale).filter((tool) => pdfToolIds.has(tool.id));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createPdfToolItemListJsonLd(normalizedLocale)) }}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-grow flex-col px-6 py-12">
        <Header />

        <header className="mb-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-content-muted" aria-label="breadcrumb">
            <Link href={`/${normalizedLocale}`} className="hover:text-content-secondary">
              {m.nav.title}
            </Link>
            <span>/</span>
            <span className="font-medium text-content-secondary">{m.pdf_hub.breadcrumb}</span>
          </nav>
          <h1 className="text-3xl font-bold text-content">{m.pdf_hub.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-content-muted">
            {m.pdf_hub.description}
          </p>
          <p className="mt-2 text-sm text-content-faint">{m.pdf_hub.privacy_note}</p>
        </header>

        <section>
          <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
            {m.pdf_hub.all_tools}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pdfTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.localizedPath}
                aria-label={`${tool.name}: ${tool.description}`}
                className="group flex min-h-36 flex-col gap-3 rounded-lg border border-border-base bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-hover hover:shadow-sm"
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
      </div>
      <Footer />
    </div>
  );
}
