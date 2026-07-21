'use client';
import { useLocale, useTranslations } from 'next-intl';
import Link from '@/components/ui/AppLink';
import { sitePageRegistry } from '@/lib/site/registry';

const Footer: React.FC = () => {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="mt-10 border-t border-border-subtle px-4 py-6 text-sm text-content-muted">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
        <p>{t('text')} © {new Date().getFullYear()}</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label={t('text')}>
          <Link href={`/${locale}/blog`} className="transition-colors hover:text-content">
            {t('blog')}
          </Link>
          {sitePageRegistry.map((page) => (
            <Link
              key={page.id}
              href={`/${locale}${page.path}`}
              className="transition-colors hover:text-content"
            >
              {t(page.id)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
