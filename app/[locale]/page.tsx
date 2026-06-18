import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToolDirectory } from '@/components/ToolDirectory';
import type { ToolCardData } from '@/components/ToolDirectory';
import { getJsonToolGroups, getJsonTools } from '@/lib/tools/registry';
import {
  createFaqJsonLd,
  createToolItemListJsonLd,
  getLocaleMessages,
  getLocalizedToolCards,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const localizedTools = getLocalizedToolCards(normalizedLocale);
  const jsonToolIds = new Set(getJsonTools().map((tool) => tool.id));
  const tools = localizedTools.filter((tool) => jsonToolIds.has(tool.id));
  const toolById = new Map(localizedTools.map((tool) => [tool.id, tool]));
  const groups = getJsonToolGroups().map((group) => ({
    category: group.category,
    label: m.categories[group.category],
    tools: group.tools
      .map((tool) => toolById.get(tool.id))
      .filter((tool): tool is ToolCardData => Boolean(tool)),
  }));

  const faqItems = [
    ['privacy_q', 'privacy_a'],
    ['formats_q', 'formats_a'],
    ['free_q', 'free_a'],
    ['loose_q', 'loose_a'],
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createToolItemListJsonLd(normalizedLocale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createFaqJsonLd(normalizedLocale)) }}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-grow flex-col px-6 py-12">
        <Header />

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-content">
            {m.home.title}
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-lg leading-relaxed text-content-muted">
            {m.home.subtitle}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-content-faint">
            {m.home.privacy_note}
          </p>
        </header>

        <ToolDirectory
          allToolsTitle={m.home.all_tools}
          featuredTitle={m.home.featured}
          groups={groups}
          noResultsLabel={m.home.no_results}
          searchPlaceholder={m.home.search_placeholder}
          searchResultsTitle={m.home.search_results}
          tools={tools}
        />

        <section className="mt-14">
          <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
            {m.home.faq_title}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqItems.map(([questionKey, answerKey]) => (
              <article key={questionKey} className="rounded-lg border border-border-base bg-surface p-5">
                <h3 className="font-semibold text-content">{m.home.faq[questionKey]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">
                  {m.home.faq[answerKey]}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
