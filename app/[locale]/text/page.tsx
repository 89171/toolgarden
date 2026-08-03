import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getTextTools } from '@/lib/tools/registry';
import {
  createTextHubMetadata,
  createTextToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createTextHubMetadata(locale);
}

export default async function TextHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const hubToolIds = new Set(getTextTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="text_hub"
      tools={tools}
      itemListJsonLd={createTextToolItemListJsonLd(normalizedLocale)}
    />
  );
}
