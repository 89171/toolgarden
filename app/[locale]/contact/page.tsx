import type { Metadata } from 'next';
import { SiteInfoPage } from '@/components/SiteInfoPage';
import { createSitePageMetadata } from '@/lib/tools/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createSitePageMetadata('contact', locale);
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <SiteInfoPage locale={locale} pageId="contact" />;
}
