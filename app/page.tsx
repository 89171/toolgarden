import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Analytics } from '@/components/Analytics';
import { FeedbackButton } from '@/components/FeedbackButton';
import { HomePageContent } from '@/components/HomePageContent';
import { PwaRegistration } from '@/components/PwaRegistration';
import { SiteProtection } from '@/components/SiteProtection';
import { routing } from '@/i18n/routing';
import { analyticsConfig } from '@/lib/analytics';
import {
  createLocaleMetadata,
  createSiteJsonLd,
  getLocaleMessages,
  toJsonLd,
} from '@/lib/tools/seo';
import './globals.css';

const defaultLocale = routing.defaultLocale;

export const metadata: Metadata = {
  ...createLocaleMetadata(defaultLocale),
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1f2937' },
    { media: '(prefers-color-scheme: dark)',  color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootHomePage() {
  setRequestLocale(defaultLocale);
  const m = getLocaleMessages(defaultLocale);
  const googleMeasurementId = analyticsConfig.google.measurementId;
  const googleEnabled = analyticsConfig.google.enabled && googleMeasurementId.length > 0;
  const escapedGoogleMeasurementId = googleMeasurementId
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");

  return (
    <html lang={defaultLocale}>
      <head>
        <meta name="baidu-site-verification" content="codeva-zyi03tAgf4" />
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
          dangerouslySetInnerHTML={{ __html: toJsonLd(createSiteJsonLd(defaultLocale)) }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={defaultLocale} messages={m}>
          <HomePageContent locale={defaultLocale} />
          <FeedbackButton />
        </NextIntlClientProvider>
        <Analytics />
        <PwaRegistration />
        <SiteProtection />
      </body>
    </html>
  );
}
