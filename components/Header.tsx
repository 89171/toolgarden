'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  getAudioTools,
  getFileMergeTools,
  getImageTools,
  getInfoCodecTools,
  getJsonToolGroups,
  getLocalizedToolPath,
  getOtherTools,
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

interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  priority: 'core' | 'secondary';
  panel?: ReactNode;
}

const navLinkClassName = 'flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong';
const menuButtonClassName = 'inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong';
const drawerLinkClassName = 'flex min-h-11 items-center justify-between rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong';

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

function MenuDropdownPanel({
  align = 'left',
  children,
}: {
  align?: 'left' | 'right';
  children: ReactNode;
}) {
  return (
    <div
      className={[
        'absolute top-full z-20 hidden w-max max-w-[calc(100vw-3rem)] pt-2 lg:group-hover:block lg:group-focus-within:block',
        align === 'right' ? 'right-0' : 'left-0',
      ].join(' ')}
    >
      <div className="rounded-lg border border-border-base bg-surface p-3 shadow-lg">
        {children}
      </div>
    </div>
  );
}

function Header({ compact = false }: HeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleDesktopItemCount, setVisibleDesktopItemCount] = useState(4);
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const desktopMeasureItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const desktopMoreMeasureRef = useRef<HTMLButtonElement | null>(null);
  const jsonGroups = getJsonToolGroups();
  const imageTools = getImageTools();
  const audioTools = getAudioTools();
  const pdfTools = getPdfTools();
  const fileMergeTools = getFileMergeTools();
  const infoCodecTools = getInfoCodecTools();
  const qrCodeTools = getQrCodeTools();
  const subtitleTools = getSubtitleTools();
  const textTools = getTextTools();
  const otherTools = getOtherTools();
  const infoCodecMenuPath = infoCodecTools[0] ? getLocalizedToolPath(infoCodecTools[0], locale) : `/${locale}/info-codec`;
  const qrCodeMenuPath = qrCodeTools[0] ? getLocalizedToolPath(qrCodeTools[0], locale) : `/${locale}/qr-code/generate`;

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

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

  const jsonToolsPanel = (
    <MenuDropdownPanel>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {jsonGroups.map((group, groupIndex) => (
          <section key={group.category} className="contents">
            <h2
              className={`col-span-2 mb-1 px-2 text-xs font-semibold uppercase tracking-normal text-content-faint${groupIndex > 0 ? ' mt-3' : ''}`}
            >
              {t(`categories.${group.category}`)}
            </h2>
            {group.tools.map(renderToolLink)}
          </section>
        ))}
      </div>
    </MenuDropdownPanel>
  );

  const createToolsPanel = (tools: ToolMeta[], columns: 'one' | 'two' = 'one') => (
    <MenuDropdownPanel>
      <div className={columns === 'two' ? 'grid gap-1 sm:grid-cols-2' : 'grid gap-1'}>
        {tools.map(renderToolLink)}
      </div>
    </MenuDropdownPanel>
  );

  const navItems: HeaderMenuItem[] = [
    {
      id: 'json',
      label: t('nav.json_tools_menu'),
      href: `/${locale}/json-tools`,
      priority: 'core',
      panel: jsonToolsPanel,
    },
    {
      id: 'image',
      label: t('nav.image_toolbar'),
      href: `/${locale}/image`,
      priority: 'core',
      panel: createToolsPanel(imageTools, 'two'),
    },
    {
      id: 'audio',
      label: t('nav.audio_tools'),
      href: `/${locale}/audio`,
      priority: 'core',
      panel: createToolsPanel(audioTools, 'two'),
    },
    {
      id: 'pdf',
      label: t('nav.pdf_tools'),
      href: `/${locale}/pdf`,
      priority: 'core',
      panel: createToolsPanel(pdfTools),
    },
    {
      id: 'text',
      label: t('nav.text_tools'),
      href: `/${locale}/text`,
      priority: 'secondary',
      panel: createToolsPanel(textTools),
    },
    {
      id: 'file-merge',
      label: t('nav.file_merge_tools'),
      href: `/${locale}/file-merge`,
      priority: 'secondary',
      panel: createToolsPanel(fileMergeTools),
    },
    {
      id: 'info-codec',
      label: t('nav.info_codec_tools'),
      href: infoCodecMenuPath,
      priority: 'secondary',
      panel: createToolsPanel(infoCodecTools),
    },
    {
      id: 'qr',
      label: t('nav.qr_tools'),
      href: qrCodeMenuPath,
      priority: 'secondary',
      panel: createToolsPanel(qrCodeTools),
    },
    {
      id: 'subtitle',
      label: t('nav.subtitle_tools'),
      href: `/${locale}/subtitle-maker`,
      priority: 'secondary',
      panel: createToolsPanel(subtitleTools),
    },
    {
      id: 'other',
      label: t('nav.other_tools'),
      href: `/${locale}/other`,
      priority: 'secondary',
      panel: createToolsPanel(otherTools),
    },
    {
      id: 'blog',
      label: t('nav.blog'),
      href: `/${locale}/blog`,
      priority: 'secondary',
    },
  ];

  const navLayoutKey = JSON.stringify(navItems.map(({ id, label }) => ({ id, label })));
  const visibleDesktopItems = navItems.slice(0, visibleDesktopItemCount);
  const overflowDesktopItems = navItems.slice(visibleDesktopItemCount);

  useEffect(() => {
    const nav = desktopNavRef.current;
    if (!nav) return;

    const measureItems = JSON.parse(navLayoutKey) as Array<{ id: string; label: string }>;
    const gap = 8;

    const calculateVisibleItems = () => {
      const availableWidth = nav.getBoundingClientRect().width;
      const moreWidth = desktopMoreMeasureRef.current?.getBoundingClientRect().width ?? 0;
      const itemWidths = measureItems.map((item) => (
        desktopMeasureItemRefs.current[item.id]?.getBoundingClientRect().width ?? 0
      ));

      if (availableWidth <= 0 || moreWidth <= 0 || itemWidths.some((width) => width <= 0)) return;

      let nextVisibleCount = 0;
      for (let count = measureItems.length; count >= 0; count -= 1) {
        const hasOverflow = count < measureItems.length;
        const visibleWidth = itemWidths
          .slice(0, count)
          .reduce((total, width) => total + width, 0);
        const visibleGaps = count > 1 ? (count - 1) * gap : 0;
        const moreSlotWidth = hasOverflow ? moreWidth + (count > 0 ? gap : 0) : 0;

        if (visibleWidth + visibleGaps + moreSlotWidth <= availableWidth) {
          nextVisibleCount = count;
          break;
        }
      }

      setVisibleDesktopItemCount((current) => (
        current === nextVisibleCount ? current : nextVisibleCount
      ));
    };

    const frame = window.requestAnimationFrame(calculateVisibleItems);
    const observer = new ResizeObserver(calculateVisibleItems);
    observer.observe(nav);
    window.addEventListener('resize', calculateVisibleItems);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, [navLayoutKey]);

  const renderDesktopMenuItem = (item: HeaderMenuItem) => {
    if (item.panel) {
      return (
        <div key={item.id} className="group relative shrink-0">
          <Link href={item.href} className={navLinkClassName}>
            <span>{item.label}</span>
            <MenuDropdownCaret />
          </Link>
          {item.panel}
        </div>
      );
    }

    return (
      <Link key={item.id} href={item.href} className={navLinkClassName}>
        <span>{item.label}</span>
      </Link>
    );
  };

  const renderMoreMenuLink = (item: HeaderMenuItem) => (
    <Link
      key={item.id}
      href={item.href}
      className="flex h-9 items-center rounded-md px-3 text-sm font-medium text-content-muted transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
    >
      <span className="whitespace-nowrap">{item.label}</span>
    </Link>
  );

  const renderMeasuredDesktopMenuItem = (item: HeaderMenuItem) => (
    <div
      key={item.id}
      ref={(node) => {
        desktopMeasureItemRefs.current[item.id] = node;
      }}
      className="shrink-0"
    >
      <div className={navLinkClassName}>
        <span>{item.label}</span>
        {item.panel ? <MenuDropdownCaret /> : null}
      </div>
    </div>
  );

  return (
    <header className={`${compact ? 'mb-3 pb-3 sm:mb-4' : 'mb-5 pb-4 sm:mb-6'} min-w-0 border-b border-border-subtle`}>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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

          <nav ref={desktopNavRef} className="relative hidden min-w-0 flex-1 items-center gap-2 text-sm text-content-muted lg:flex" aria-label={t('nav.title')}>
            <div className="flex min-w-0 items-center gap-2">
              {visibleDesktopItems.map(renderDesktopMenuItem)}
              {overflowDesktopItems.length > 0 && (
                <div className="group relative shrink-0">
                  <button type="button" className={menuButtonClassName} aria-haspopup="true">
                    <span>{t('nav.more')}</span>
                    <MenuDropdownCaret />
                  </button>
                  <MenuDropdownPanel align="right">
                    <div className="grid min-w-48 gap-1">
                      {overflowDesktopItems.map(renderMoreMenuLink)}
                    </div>
                  </MenuDropdownPanel>
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 opacity-0" aria-hidden="true">
              {navItems.map(renderMeasuredDesktopMenuItem)}
              <button ref={desktopMoreMeasureRef} type="button" className={menuButtonClassName} tabIndex={-1}>
                <span>{t('nav.more')}</span>
                <MenuDropdownCaret />
              </button>
            </div>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            className={`${menuButtonClassName} lg:hidden`}
            aria-controls="mobile-site-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? t('nav.close_menu') : t('nav.menu')}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t('nav.title')}>
          <button
            type="button"
            className="absolute inset-0 bg-background/80"
            aria-label={t('nav.close_menu')}
            onClick={closeMobileMenu}
          />
          <div className="absolute inset-x-3 top-3 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-lg border border-border-base bg-surface p-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Link
                href={`/${locale}`}
                onClick={closeMobileMenu}
                aria-label={`${t('nav.brand')}.${t('nav.tld')}`}
                className="inline-flex min-w-0 items-center rounded-2xl border border-brand-border bg-brand-bg px-3.5 py-2 text-brand-fg shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
              >
                <span className="truncate whitespace-nowrap text-base font-semibold leading-none">
                  <span>{t('nav.brand')}</span>
                  <span className="px-1 text-brand-dot">·</span>
                  <span className="text-brand-tld">{t('nav.tld')}</span>
                </span>
              </Link>
              <button type="button" className={menuButtonClassName} onClick={closeMobileMenu}>
                {t('nav.close_menu')}
              </button>
            </div>
            <nav id="mobile-site-menu" className="grid gap-2 overflow-y-auto pr-1" aria-label={t('nav.title')}>
              {navItems.map((item) => (
                <Link key={item.id} href={item.href} className={drawerLinkClassName} onClick={closeMobileMenu}>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
