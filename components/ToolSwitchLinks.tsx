'use client';

import Link from '@/components/ui/AppLink';

interface ToolSwitchLink {
  key: string;
  href: string;
  label: string;
}

interface ToolSwitchLinksProps {
  ariaLabel: string;
  currentKey: string;
  links: ToolSwitchLink[];
}

export function ToolSwitchLinks({ ariaLabel, currentKey, links }: ToolSwitchLinksProps) {
  return (
    <nav aria-label={ariaLabel} className="mb-4 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = link.key === currentKey;

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
