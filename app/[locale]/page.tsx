import { HomePageContent } from '@/components/HomePageContent';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <HomePageContent locale={locale} />;
}
