import { JsonToolsHubContent } from '@/components/JsonToolsHubContent';

export default async function JsonToolsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <JsonToolsHubContent locale={locale} />;
}
