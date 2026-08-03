import type { Metadata } from 'next';
import { HubPageContent } from '@/components/HubPageContent';
import { getPdfTools } from '@/lib/tools/registry';
import {
  createPdfHubMetadata,
  createPdfToolItemListJsonLd,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createPdfHubMetadata(locale);
}

export default async function PdfHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const hubToolIds = new Set(getPdfTools().map((tool) => tool.id));
  const tools = getLocalizedToolCards(normalizedLocale).filter((tool) => hubToolIds.has(tool.id));

  return (
    <HubPageContent
      locale={normalizedLocale}
      hubKey="pdf_hub"
      tools={tools}
      itemListJsonLd={createPdfToolItemListJsonLd(normalizedLocale)}
    />
  );
}
