'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from '@/components/ui/AppLink';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border-base bg-surface p-6 sm:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-normal text-content-faint">Error</p>
        <h1 className="mt-3 text-2xl font-bold text-content sm:text-3xl">{t('title')}</h1>
        <p className="mt-3 text-sm leading-7 text-content-muted sm:text-base">{t('description')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded bg-action px-4 py-2 text-sm font-medium text-brand-fg transition-colors hover:bg-action-hover"
          >
            {t('retry')}
          </button>
          <Link
            href={`/${locale}`}
            className="rounded border border-border-subtle bg-surface-raised px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-strong hover:bg-surface-hover"
          >
            {t('home')}
          </Link>
        </div>
      </section>
    </main>
  );
}
