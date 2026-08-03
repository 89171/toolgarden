import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getFileMergeTools } from '@/lib/tools/registry';
import {
  createFileMergeHubMetadata,
  createFileMergeToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createFileMergeHubMetadata(locale);
}

export default async function FileMergeHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const hubToolIds = new Set(getFileMergeTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="file_merge_hub"
      tools={tools}
      itemListJsonLd={createFileMergeToolItemListJsonLd(normalizedLocale)}
    />
  );
}
