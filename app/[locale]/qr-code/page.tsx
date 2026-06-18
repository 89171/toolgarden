import { redirect } from 'next/navigation';

export default async function QrCodeRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/qr-code/generate`);
}
