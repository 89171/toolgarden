import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import {
  createLocaleMetadata,
  getLocaleMessages,
  createSiteJsonLd,
  normalizeLocale,
  toJsonLd,
} from '@/lib/tools/seo';
import { Analytics } from '@/components/Analytics';
import { PwaRegistration } from '@/components/PwaRegistration';
import { SiteProtection } from '@/components/SiteProtection';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });

type Locale = (typeof routing.locales)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...createLocaleMetadata(locale),
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'JSON Toolkit',
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1f2937' },
    { media: '(prefers-color-scheme: dark)',  color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) notFound();
  const normalizedLocale = normalizeLocale(locale);
  setRequestLocale(normalizedLocale);
  const m = getLocaleMessages(normalizedLocale);

  return (
    <html lang={normalizedLocale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(createSiteJsonLd(normalizedLocale)) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={normalizedLocale} messages={m}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <PwaRegistration />
        <SiteProtection />
      </body>
    </html>
  );
}
