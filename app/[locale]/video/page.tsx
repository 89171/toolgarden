import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getVideoTools } from '@/lib/tools/registry';
import {
  createVideoHubMetadata,
  createVideoToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createVideoHubMetadata(locale);
}

export default async function VideoHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const hubToolIds = new Set(getVideoTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="video_hub"
      tools={tools}
      itemListJsonLd={createVideoToolItemListJsonLd(normalizedLocale)}
    />
  );
}
