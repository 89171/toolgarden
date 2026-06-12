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
      className="text-sm px-2.5 py-1 rounded border border-border-base text-content-muted hover:border-border-strong hover:text-content-secondary transition-colors"
      title={locale === 'zh' ? 'Switch to English' : '切换为中文'}
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </button>
  );
};
