'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { getImageTools, getJsonToolGroups, getLocalizedToolPath, getPdfTools, getSubtitleTools } from '@/lib/tools/registry';
import type { ToolMeta } from '@/lib/tools/types';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  compact?: boolean;
}

function ToolGlyph({ icon }: { icon: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-9 shrink-0 items-center justify-center rounded border border-border-subtle bg-surface-raised font-mono text-[0.65rem] font-semibold text-content-faint"
    >
      {icon}
    </span>
  );
}

const Header: React.FC<HeaderProps> = ({ compact = false }) => {
  const t = useTranslations();
  const locale = useLocale();
  const jsonGroups = getJsonToolGroups();
  const imageTools = getImageTools();
  const pdfTools = getPdfTools();
  const subtitleTools = getSubtitleTools();

  const renderToolLink = (tool: ToolMeta) => (
    <Link
      key={tool.id}
      href={getLocalizedToolPath(tool, locale)}
      className="flex min-w-0 items-center gap-2 rounded-md px-2.5 py-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
    >
      <ToolGlyph icon={tool.icon} />
      <span className="truncate text-sm font-medium">{t(`tools.${tool.id}.name`)}</span>
    </Link>
  );

  return (
    <header className={`${compact ? 'mb-4 pb-3' : 'mb-6 pb-4'} flex flex-col gap-3 border-b border-border-subtle lg:flex-row lg:items-start lg:justify-between`}>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/${locale}`}
            aria-label={`${t('nav.brand')}.${t('nav.tld')}`}
            className="inline-flex min-w-0 items-center rounded-2xl border border-border-subtle bg-surface-raised px-3.5 py-2 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-base hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong sm:px-4"
          >
            <span className="truncate whitespace-nowrap text-base font-semibold leading-none text-content sm:text-lg">
              <span>{t('nav.brand')}</span>
              <span className="px-1 text-brand-dot">·</span>
              <span className="text-brand-tld">{t('nav.tld')}</span>
            </span>
          </Link>
          <div className="lg:hidden">
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="relative flex flex-wrap items-center justify-start gap-2 text-sm text-content-muted" aria-label={t('nav.title')}>
          <div className="group">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.json_tools_menu')}</span>
              <span aria-hidden="true" className="text-xs text-content-faint transition-transform group-hover:rotate-180 group-focus-within:rotate-180">v</span>
            </Link>
            <div className="pointer-events-none invisible absolute left-0 top-full z-20 w-[calc(100vw-3rem)] max-w-2xl pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-lg border border-border-base bg-surface p-3 shadow-lg">
                <div className="grid gap-4 sm:grid-cols-2">
                  {jsonGroups.map((group) => (
                    <section key={group.category} aria-labelledby={`header-${group.category}-tools`}>
                      <h2
                        id={`header-${group.category}-tools`}
                        className="mb-2 px-2 text-xs font-semibold uppercase tracking-normal text-content-faint"
                      >
                        {t(`categories.${group.category}`)}
                      </h2>
                      <div className="grid gap-1">
                        {group.tools.map(renderToolLink)}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="group">
            <Link
              href="/image"
              className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.image_toolbar')}</span>
              <span aria-hidden="true" className="text-xs text-content-faint transition-transform group-hover:rotate-180 group-focus-within:rotate-180">v</span>
            </Link>
            <div className="pointer-events-none invisible absolute left-0 top-full z-20 w-[calc(100vw-3rem)] max-w-xl pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-lg border border-border-base bg-surface p-3 shadow-lg">
                <div className="grid gap-1 sm:grid-cols-2">
                  {imageTools.map(renderToolLink)}
                </div>
              </div>
            </div>
          </div>

          <div className="group">
            <Link
              href="/pdf"
              className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.pdf_tools')}</span>
              <span aria-hidden="true" className="text-xs text-content-faint transition-transform group-hover:rotate-180 group-focus-within:rotate-180">v</span>
            </Link>
            <div className="pointer-events-none invisible absolute left-0 top-full z-20 w-[calc(100vw-3rem)] max-w-md pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-lg border border-border-base bg-surface p-3 shadow-lg">
                <div className="grid gap-1">
                  {pdfTools.map(renderToolLink)}
                </div>
              </div>
            </div>
          </div>

          <div className="group">
            <Link
              href="/subtitle-maker"
              className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.subtitle_tools')}</span>
              <span aria-hidden="true" className="text-xs text-content-faint transition-transform group-hover:rotate-180 group-focus-within:rotate-180">v</span>
            </Link>
            <div className="pointer-events-none invisible absolute left-0 top-full z-20 w-[calc(100vw-3rem)] max-w-md pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-lg border border-border-base bg-surface p-3 shadow-lg">
                <div className="grid gap-1">
                  {subtitleTools.map(renderToolLink)}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="hidden lg:block">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
