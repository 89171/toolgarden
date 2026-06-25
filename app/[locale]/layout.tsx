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
import { analyticsConfig } from '@/lib/analytics';
import { Analytics } from '@/components/Analytics';
import { FeedbackButton } from '@/components/FeedbackButton';
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
  const googleMeasurementId = analyticsConfig.google.measurementId;
  const googleEnabled = analyticsConfig.google.enabled && googleMeasurementId.length > 0;
  const escapedGoogleMeasurementId = googleMeasurementId
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");

  return (
    <html lang={normalizedLocale}>
      <head>
        {googleEnabled ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleMeasurementId)}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${escapedGoogleMeasurementId}');
`,
              }}
            />
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(createSiteJsonLd(normalizedLocale)) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={normalizedLocale} messages={m}>
          {children}
          <FeedbackButton />
        </NextIntlClientProvider>
        <Analytics />
        <PwaRegistration />
        <SiteProtection />
      </body>
    </html>
  );
}
