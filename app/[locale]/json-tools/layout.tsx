import type { Metadata } from 'next';
import { createJsonToolsHubMetadata } from '@/lib/tools/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createJsonToolsHubMetadata(locale);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
