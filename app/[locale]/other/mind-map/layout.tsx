import type { Metadata } from 'next';
import { createToolMetadata } from '@/lib/tools/seo';
import 'mind-elixir/style.css';

const TOOL_ID = 'mind-map';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createToolMetadata(TOOL_ID, locale);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
