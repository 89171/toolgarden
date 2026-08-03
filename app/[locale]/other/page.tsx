import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getOtherTools } from '@/lib/tools/registry';
import {
  createOtherHubMetadata,
  createOtherToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
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
  const hubToolIds = new Set(getOtherTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="other_hub"
      tools={tools}
      itemListJsonLd={createOtherToolItemListJsonLd(normalizedLocale)}
    />
  );
}
