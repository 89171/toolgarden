'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from '@/components/ui/AppLink';
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
  /**
   * 下拉面板按需构造。
   *
   * 早先的实现把全部 87 个工具链接直接渲染进每个页面的 HTML，仅靠 CSS hover 控制可见性。
   * 那意味着 300+ 个 URL 共享同一段上千字符的导航样板，正文占比被压得比样板还低。
   * 现在改成首次 hover / focus 时才挂载面板：人的交互体验不变（挂载发生在同一个事件里，
   * 面板即时出现），但初始 HTML 只保留 hub 级入口，完整工具清单由各 hub 页承载。
   */
  renderPanel?: () => ReactNode;
}

const navLinkClassName = 'flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border-subtle bg-surface-raised px-3 py-2 font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong';
const menuButtonClassName = 'inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong';
const drawerLinkClassName = 'flex min-h-11 items-center justify-between rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-base hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong';
const githubUrl = 'https://github.com/89171/toolgarden';

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
      <Image src="/down-arrow.svg" alt="" width={12} height={12} className="h-3 w-3" />
    </span>
  );
}

function GitHubLink() {
  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="GitHub"
      title="GitHub"
      className="inline-flex min-h-10 w-10 shrink-0 items-center justify-center rounded border border-border-base text-content-muted transition-colors hover:border-border-strong hover:text-content-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2.15c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.04c.98 0 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.19c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    </a>
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

/**
 * hover 触发的下拉容器。面板内容在首次 hover / focus / touch 后才挂载，
 * 挂载后保持常驻，所以第二次悬停没有额外开销。
 */
function HoverDropdown({
  trigger,
  renderPanel,
  className = 'group relative shrink-0',
}: {
  trigger: ReactNode;
  renderPanel: () => ReactNode;
  className?: string;
}) {
  const [panelMounted, setPanelMounted] = useState(false);
  const mountPanel = () => setPanelMounted(true);

  return (
    <div
      className={className}
      onMouseEnter={mountPanel}
      onFocus={mountPanel}
      onTouchStart={mountPanel}
    >
      {trigger}
      {panelMounted ? renderPanel() : null}
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

  const renderJsonToolsPanel = () => (
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

  const createToolsPanel = (tools: ToolMeta[], columns: 'one' | 'two' = 'one') => {
    const renderToolsPanel = () => (
      <MenuDropdownPanel>
        <div className={columns === 'two' ? 'grid gap-1 sm:grid-cols-2' : 'grid gap-1'}>
          {tools.map(renderToolLink)}
        </div>
      </MenuDropdownPanel>
    );

    return renderToolsPanel;
  };

  const navItems: HeaderMenuItem[] = [
    {
      id: 'json',
      label: t('nav.json_tools_menu'),
      href: `/${locale}/json-tools`,
      priority: 'core',
      renderPanel: renderJsonToolsPanel,
    },
    {
      id: 'image',
      label: t('nav.image_toolbar'),
      href: `/${locale}/image`,
      priority: 'core',
      renderPanel: createToolsPanel(imageTools, 'two'),
    },
    {
      id: 'audio',
      label: t('nav.audio_tools'),
      href: `/${locale}/audio`,
      priority: 'core',
      renderPanel: createToolsPanel(audioTools, 'two'),
    },
    {
      id: 'pdf',
      label: t('nav.pdf_tools'),
      href: `/${locale}/pdf`,
      priority: 'core',
      renderPanel: createToolsPanel(pdfTools),
    },
    {
      id: 'text',
      label: t('nav.text_tools'),
      href: `/${locale}/text`,
      priority: 'secondary',
      renderPanel: createToolsPanel(textTools),
    },
    {
      id: 'file-merge',
      label: t('nav.file_merge_tools'),
      href: `/${locale}/file-merge`,
      priority: 'secondary',
      renderPanel: createToolsPanel(fileMergeTools),
    },
    {
      id: 'info-codec',
      label: t('nav.info_codec_tools'),
      href: infoCodecMenuPath,
      priority: 'secondary',
      renderPanel: createToolsPanel(infoCodecTools),
    },
    {
      id: 'qr',
      label: t('nav.qr_tools'),
      href: qrCodeMenuPath,
      priority: 'secondary',
      renderPanel: createToolsPanel(qrCodeTools),
    },
    {
      id: 'subtitle',
      label: t('nav.subtitle_tools'),
      href: `/${locale}/subtitle-maker`,
      priority: 'secondary',
      renderPanel: createToolsPanel(subtitleTools),
    },
    {
      id: 'other',
      label: t('nav.other_tools'),
      href: `/${locale}/other`,
      priority: 'secondary',
      renderPanel: createToolsPanel(otherTools),
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
    if (item.renderPanel) {
      return (
        <HoverDropdown
          key={item.id}
          renderPanel={item.renderPanel}
          trigger={(
            <Link href={item.href} className={navLinkClassName}>
              <span>{item.label}</span>
              <MenuDropdownCaret />
            </Link>
          )}
        />
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
        {item.renderPanel ? <MenuDropdownCaret /> : null}
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
              <span className="px-1 text-brand-dot">.</span>
              <span className="text-brand-tld">{t('nav.tld')}</span>
            </span>
          </Link>

          <nav ref={desktopNavRef} className="relative hidden min-w-0 flex-1 items-center gap-2 text-sm text-content-muted lg:flex" aria-label={t('nav.title')}>
            <div className="flex min-w-0 items-center gap-2">
              {visibleDesktopItems.map(renderDesktopMenuItem)}
              {overflowDesktopItems.length > 0 && (
                <HoverDropdown
                  trigger={(
                    <button type="button" className={menuButtonClassName} aria-haspopup="true">
                      <span>{t('nav.more')}</span>
                      <MenuDropdownCaret />
                    </button>
                  )}
                  renderPanel={() => (
                    <MenuDropdownPanel align="right">
                      <div className="grid min-w-48 gap-1">
                        {overflowDesktopItems.map(renderMoreMenuLink)}
                      </div>
                    </MenuDropdownPanel>
                  )}
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden opacity-0" aria-hidden="true">
              <div className="flex w-max items-center gap-2">
                {navItems.map(renderMeasuredDesktopMenuItem)}
                <button ref={desktopMoreMeasureRef} type="button" className={menuButtonClassName} tabIndex={-1}>
                  <span>{t('nav.more')}</span>
                  <MenuDropdownCaret />
                </button>
              </div>
            </div>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <GitHubLink />
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
                  <span className="px-1 text-brand-dot">.</span>
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
