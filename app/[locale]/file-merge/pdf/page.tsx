import { redirect } from 'next/navigation';

export default async function FilePdfMergePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/pdf/merge`);
}
