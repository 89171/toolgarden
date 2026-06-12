'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

const Header: React.FC = () => {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <header className="border-b border-border-subtle mb-6 pb-4 flex items-center justify-between">
      <Link href={`/${locale}`} className="font-bold text-lg hover:text-content-muted transition-colors">
        {t('title')}
      </Link>
      <nav className="flex items-center gap-3 text-sm text-content-muted">
        <LanguageSwitcher />
      </nav>
    </header>
  );
};

export default Header;
