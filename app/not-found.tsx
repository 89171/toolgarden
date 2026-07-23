import { Analytics } from '@/components/Analytics';
import { NotFoundContent } from '@/components/NotFoundContent';
import { SiteProtection } from '@/components/SiteProtection';
import { routing } from '@/i18n/routing';
import { getLocaleMessages } from '@/lib/tools/seo';
import './globals.css';

export default function RootNotFound() {
  const locale = routing.defaultLocale;
  const m = getLocaleMessages(locale);

  return (
    <html lang={locale}>
      <head>
        <title>{`${m.not_found.title} | ${m.home.title}`}</title>
        <meta name="description" content={m.not_found.description} />
        <meta name="robots" content="noindex,follow" />
      </head>
      <body className="antialiased">
        <NotFoundContent locale={locale} />
        <Analytics locale={locale} />
        <SiteProtection />
      </body>
    </html>
  );
}
