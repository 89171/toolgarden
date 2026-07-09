import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AllToolsDirectory, type AllToolsSection } from '@/components/AllToolsDirectory';
import type { ToolCardData } from '@/components/ToolDirectory';
import {
  getFileMergeTools,
  getImageTools,
  getInfoCodecTools,
  getJsonTools,
  getPdfTools,
  getQrCodeTools,
  getSubtitleTools,
  getTextTools,
} from '@/lib/tools/registry';
import type { ToolMeta } from '@/lib/tools/types';
import {
  createToolItemListJsonLd,
  getLocaleMessages,
  getLocalizedToolCards,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';

interface HomePageContentProps {
  locale: string;
}

function orderFeaturedFirst(tools: ToolCardData[]): ToolCardData[] {
  const featured: ToolCardData[] = [];
  const rest: ToolCardData[] = [];
  for (const tool of tools) {
    (tool.featured ? featured : rest).push(tool);
  }
  return [...featured, ...rest];
}

export function HomePageContent({ locale }: HomePageContentProps) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const localizedTools = getLocalizedToolCards(normalizedLocale);
  const toolById = new Map(localizedTools.map((tool) => [tool.id, tool]));

  const buildSection = (
    key: string,
    label: string,
    href: string | null,
    metas: ToolMeta[],
  ): AllToolsSection => ({
    key,
    label,
    href,
    tools: orderFeaturedFirst(
      metas
        .map((meta) => toolById.get(meta.id))
        .filter((tool): tool is ToolCardData => Boolean(tool)),
    ),
  });

  const sections: AllToolsSection[] = [
    buildSection('json',       m.nav.json_tools_menu,  `/${normalizedLocale}/json-tools`, getJsonTools()),
    buildSection('image',      m.nav.image_toolbar,    `/${normalizedLocale}/image`,      getImageTools()),
    buildSection('pdf',        m.nav.pdf_tools,        `/${normalizedLocale}/pdf`,        getPdfTools()),
    buildSection('text',       m.nav.text_tools,       `/${normalizedLocale}/text`,       getTextTools()),
    buildSection('file-merge', m.nav.file_merge_tools, `/${normalizedLocale}/file-merge`, getFileMergeTools()),
    buildSection('info-codec', m.nav.info_codec_tools, null,                              getInfoCodecTools()),
    buildSection('qr',         m.nav.qr_tools,         null,                              getQrCodeTools()),
    buildSection('subtitle',   m.nav.subtitle_tools,   null,                              getSubtitleTools()),
  ].filter((section) => section.tools.length > 0);

  const featured = localizedTools.filter((tool) => tool.featured);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(createToolItemListJsonLd(normalizedLocale)) }}
      />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />

        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-bold leading-tight text-content sm:text-4xl">
            {m.home.title}
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-content-muted sm:text-lg">
            {m.home.subtitle}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-content-faint">
            {m.home.privacy_note}
          </p>
        </header>

        <AllToolsDirectory
          sections={sections}
          featured={featured}
          labels={{
            searchPlaceholder: m.home.search_placeholder,
            searchResults: m.home.search_results,
            noResults: m.home.no_results,
            featured: m.home.featured,
            expandMore: m.home.expand_more,
            showLess: m.home.show_less,
            viewAllTemplate: m.home.view_all_in,
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
