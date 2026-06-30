'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const next = locale === 'zh' ? 'en' : 'zh';
    // pathname starts with /zh/... or /en/... — swap the prefix
    const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
    router.push(`/${next}${withoutLocale}`);
  };

  const isSupported = routing.locales.includes(locale as (typeof routing.locales)[number]);

  if (!isSupported) return null;

  return (
    <button
      onClick={toggle}
      className="inline-flex min-h-10 items-center justify-center rounded border border-border-base px-3 py-2 text-sm text-content-muted transition-colors hover:border-border-strong hover:text-content-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
      title={locale === 'zh' ? 'Switch to English' : '切换为中文'}
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  );
};
