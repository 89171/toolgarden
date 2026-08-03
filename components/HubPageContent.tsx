import Link from '@/components/ui/AppLink';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import HubFaqSection from '@/components/HubFaqSection';
import { HubArticleBody } from '@/components/HubArticle';
import type { ToolCardData } from '@/components/ToolDirectory';
import {
  createHubFaqJsonLd,
  getHubArticleContent,
  getHubFaqItems,
  getLocaleMessages,
  normalizeLocale,
  toJsonLd,
  type HubFaqKey,
} from '@/lib/tools/seo';

interface HubPageContentProps {
  locale: string;
  /** messages 中的 hub 节点键，如 'image_hub'。 */
  hubKey: HubFaqKey;
  tools: ToolCardData[];
  /** 该 hub 的 ItemList 结构化数据。 */
  itemListJsonLd: unknown;
}

/**
 * 六个 hub 页（图片 / 音频 / PDF / 文件合并 / 文本 / 其他）共用的骨架。
 *
 * 之前每个 hub 都是同一份 95 行代码换名字，且整页没有 <main>、除工具卡片外没有任何正文，
 * 抓取下来是纯链接网格。这里统一补上语义 <main> 与分类正文，
 * 正文来自 messages.hub_content，同一份内容驱动页面显示。
 */
export function HubPageContent({ locale, hubKey, tools, itemListJsonLd }: HubPageContentProps) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const hub = (m as unknown as Record<string, {
    title: string;
    description: string;
    all_tools: string;
    breadcrumb: string;
    privacy_note: string;
  }>)[hubKey];
  const article = getHubArticleContent(hubKey, normalizedLocale);
  const faqItems = getHubFaqItems(hubKey, normalizedLocale);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createHubFaqJsonLd(hubKey, normalizedLocale)) }}
      />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <main className="flex w-full flex-col">
          <header className="mb-8">
            <nav className="mb-4 flex items-center gap-1 text-sm text-content-muted" aria-label="breadcrumb">
              <Link href={`/${normalizedLocale}`} className="hover:text-content-secondary">
                {m.home.breadcrumb}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-content-secondary">{hub.breadcrumb}</span>
            </nav>
            <h1 className="text-2xl font-bold leading-tight text-content sm:text-3xl">{hub.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-content-muted">
              {hub.description}
            </p>
            <p className="mt-4 text-sm text-content-faint">{hub.privacy_note}</p>
          </header>

          <section aria-labelledby="hub-all-tools-title">
            <h2
              id="hub-all-tools-title"
              className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint"
            >
              {hub.all_tools}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {tools.map((tool) => (
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

          <HubFaqSection items={faqItems} title={m.blog.faq_title} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
