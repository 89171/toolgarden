'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  getFileMergeTools,
  getImageTools,
  getInfoCodecTools,
  getJsonToolGroups,
  getLocalizedToolPath,
  getPdfTools,
  getQrCodeTools,
  getSubtitleTools,
  getTextTools,
} from '@/lib/tools/registry';
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

function MenuDropdownCaret() {
  return (
    <span
      aria-hidden="true"
      className="hidden shrink-0 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180 lg:inline-flex"
    >
      <img src="/down-arrow.svg" alt="" width={12} height={12} className="h-3 w-3" />
    </span>
  );
}

function MenuDropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-0 top-full z-20 hidden w-max max-w-[calc(100vw-3rem)] pt-2 lg:group-hover:block lg:group-focus-within:block">
      <div className="rounded-lg border border-border-base bg-surface p-3 shadow-lg">
        {children}
      </div>
    </div>
  );
}

const Header: React.FC<HeaderProps> = ({ compact = false }) => {
  const t = useTranslations();
  const locale = useLocale();
  const jsonGroups = getJsonToolGroups();
  const imageTools = getImageTools();
  const pdfTools = getPdfTools();
  const fileMergeTools = getFileMergeTools();
  const infoCodecTools = getInfoCodecTools();
  const qrCodeTools = getQrCodeTools();
  const subtitleTools = getSubtitleTools();
  const textTools = getTextTools();
  const infoCodecMenuPath = infoCodecTools[0] ? getLocalizedToolPath(infoCodecTools[0], locale) : `/${locale}/info-codec`;
  const qrCodeMenuPath = qrCodeTools[0] ? getLocalizedToolPath(qrCodeTools[0], locale) : `/${locale}/qr-code/generate`;

  const renderToolLink = (tool: ToolMeta) => (
    <Link
      key={tool.id}
      href={getLocalizedToolPath(tool, locale)}
      className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2.5 text-content-muted transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
    >
      <ToolGlyph icon={tool.icon} />
      <span className="whitespace-nowrap text-sm font-medium">{t(`tools.${tool.id}.name`)}</span>
    </Link>
  );

  return (
    <header className={`${compact ? 'mb-3 pb-3 sm:mb-4' : 'mb-5 pb-4 sm:mb-6'} flex min-w-0 flex-col gap-3 border-b border-border-subtle lg:flex-row lg:items-start lg:justify-between`}>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/${locale}`}
            aria-label={`${t('nav.brand')}.${t('nav.tld')}`}
            className="inline-flex min-w-0 items-center rounded-2xl border border-brand-border bg-brand-bg px-3.5 py-2 shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-brand-bg-hover hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong sm:px-4"
          >
            <span className="truncate whitespace-nowrap text-base font-semibold leading-none text-brand-fg sm:text-lg">
              <span>{t('nav.brand')}</span>
              <span className="px-1 text-brand-dot">·</span>
              <span className="text-brand-tld">{t('nav.tld')}</span>
            </span>
          </Link>
          <div className="lg:hidden">
            <LanguageSwitcher />
          </div>
        </div>

        <nav
          className="relative -mx-1 flex min-w-0 snap-x items-center gap-2 overflow-x-auto px-1 pb-1 text-sm text-content-muted [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
          aria-label={t('nav.title')}
        >
          <div className="group relative shrink-0 snap-start">
            <Link
              href={`/${locale}`}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.json_tools_menu')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {jsonGroups.map((group, groupIndex) => (
                    <section key={group.category} className="contents" aria-labelledby={`header-${group.category}-tools`}>
                      <h2
                        id={`header-${group.category}-tools`}
                        className={`col-span-2 mb-1 px-2 text-xs font-semibold uppercase tracking-normal text-content-faint${groupIndex > 0 ? ' mt-3' : ''}`}
                      >
                        {t(`categories.${group.category}`)}
                      </h2>
                      {group.tools.map(renderToolLink)}
                    </section>
                  ))}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={`/${locale}/image`}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.image_toolbar')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1 sm:grid-cols-2">
                  {imageTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={`/${locale}/text`}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.text_tools')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1">
                  {textTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={`/${locale}/pdf`}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.pdf_tools')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1">
                  {pdfTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={`/${locale}/file-merge`}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.file_merge_tools')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1">
                  {fileMergeTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={infoCodecMenuPath}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.info_codec_tools')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1">
                  {infoCodecTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={qrCodeMenuPath}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.qr_tools')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1">
                  {qrCodeTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <div className="group relative shrink-0 snap-start">
            <Link
              href={`/${locale}/subtitle-maker`}
              className="flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <span>{t('nav.subtitle_tools')}</span>
              <MenuDropdownCaret />
            </Link>
            <MenuDropdownPanel>
                <div className="grid gap-1">
                  {subtitleTools.map(renderToolLink)}
                </div>
            </MenuDropdownPanel>
          </div>

          <Link
            href={`/${locale}/blog`}
            className="flex min-h-10 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
          >
            <span>{t('nav.blog')}</span>
          </Link>
        </nav>
      </div>

      <div className="hidden lg:block">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
