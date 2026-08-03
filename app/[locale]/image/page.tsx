import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getImageTools } from '@/lib/tools/registry';
import {
  createImageHubMetadata,
  createImageToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createImageHubMetadata(locale);
}

export default async function ImageHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const hubToolIds = new Set(getImageTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="image_hub"
      tools={tools}
      itemListJsonLd={createImageToolItemListJsonLd(normalizedLocale)}
    />
  );
}
