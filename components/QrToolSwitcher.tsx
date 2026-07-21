'use client';

import Link from '@/components/ui/AppLink';
import { useLocale, useTranslations } from 'next-intl';

interface QrToolSwitcherProps {
  current: 'generate' | 'decode';
}

export function QrToolSwitcher({ current }: QrToolSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations('qr_code');

  const links = [
    {
      key: 'generate' as const,
      href: `/${locale}/qr-code/generate`,
      label: t('generate_link'),
    },
    {
      key: 'decode' as const,
      href: `/${locale}/qr-code/decode`,
      label: t('decode_link'),
    },
  ];

  return (
    <nav aria-label={t('switcher_label')} className="mb-4 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = current === link.key;

        return (
          <Link
            key={link.key}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
              active
                ? 'border-border-strong bg-action text-background'
                : 'border-border-base bg-surface-raised text-content-secondary hover:bg-surface-hover hover:text-content'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
