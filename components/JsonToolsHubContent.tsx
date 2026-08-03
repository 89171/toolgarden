import Link from '@/components/ui/AppLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToolDirectory } from '@/components/ToolDirectory';
import { HubArticleBody } from '@/components/HubArticle';
import type { ToolCardData } from '@/components/ToolDirectory';
import { getJsonToolGroups, getJsonTools } from '@/lib/tools/registry';
import {
  createFaqJsonLd,
  createJsonToolItemListJsonLd,
  getHubArticleContent,
  getLocaleMessages,
  getLocalizedToolCards,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

interface JsonToolsHubContentProps {
  locale: string;
}

export function JsonToolsHubContent({ locale }: JsonToolsHubContentProps) {
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

  const article = getHubArticleContent('json_hub', normalizedLocale);

  const faqItems = [
    ['privacy_q', 'privacy_a'],
    ['formats_q', 'formats_a'],
    ['free_q', 'free_a'],
    ['loose_q', 'loose_a'],
  ] as const;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createJsonToolItemListJsonLd(normalizedLocale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createFaqJsonLd(normalizedLocale)) }}
      />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <main className="flex w-full flex-col">
        <header className="mb-8">
          <nav className="mb-4 flex items-center gap-1 text-sm text-content-muted" aria-label="breadcrumb">
            <Link href={`/${normalizedLocale}`} className="hover:text-content-secondary">
              {m.home.breadcrumb}
            </Link>
            <span>/</span>
            <span className="font-medium text-content-secondary">{m.json_hub.breadcrumb}</span>
          </nav>
          <h1 className="text-2xl font-bold leading-tight text-content sm:text-3xl">
            {m.json_hub.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-content-muted">
            {m.json_hub.description}
          </p>
          <p className="mt-4 text-sm text-content-faint">
            {m.json_hub.privacy_note}
          </p>
        </header>

        <ToolDirectory
          allToolsTitle={m.json_hub.all_tools}
          featuredTitle={m.json_hub.featured}
          groups={groups}
          noResultsLabel={m.json_hub.no_results}
          searchPlaceholder={m.json_hub.search_placeholder}
          searchResultsTitle={m.json_hub.search_results}
          tools={tools}
        />

        {article ? (
          <HubArticleBody
            content={article}
            labels={{
              overview: m.hub_article.overview,
              choosing: m.hub_article.choosing,
              comparison: m.hub_article.comparison,
              notes: m.hub_article.notes,
            }}
          />
        ) : null}

        <section className="mt-14">
          <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
            {m.json_hub.faq_title}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqItems.map(([questionKey, answerKey]) => (
              <article key={questionKey} className="rounded-lg border border-border-base bg-surface p-5">
                <h3 className="font-semibold text-content">{m.json_hub.faq[questionKey]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">
                  {m.json_hub.faq[answerKey]}
                </p>
              </article>
            ))}
          </div>
        </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
