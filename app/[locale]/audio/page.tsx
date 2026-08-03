import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getAudioTools } from '@/lib/tools/registry';
import {
  createAudioHubMetadata,
  createAudioToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createAudioHubMetadata(locale);
}

export default async function AudioHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const hubToolIds = new Set(getAudioTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="audio_hub"
      tools={tools}
      itemListJsonLd={createAudioToolItemListJsonLd(normalizedLocale)}
    />
  );
}
