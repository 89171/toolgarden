import type { Metadata } from 'next';
import { createToolMetadata } from '@/lib/tools/seo';
import '@excalidraw/excalidraw/index.css';
import { ToolMessagesProvider } from '@/components/ToolMessagesProvider';

const TOOL_ID = 'excalidraw-board';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createToolMetadata(TOOL_ID, locale);
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <ToolMessagesProvider locale={locale} toolId={TOOL_ID}>
      {children}
    </ToolMessagesProvider>
  );
}
