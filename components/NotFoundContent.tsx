'use client';

import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { getLocalizedToolPath, toolRegistry } from '@/lib/tools/registry';
import zhMessages from '@/messages/zh.json';
import enMessages from '@/messages/en.json';

const messages = { zh: zhMessages, en: enMessages } as const;
type Locale = (typeof routing.locales)[number];
type ToolMessageId = keyof typeof zhMessages.tools;

interface NotFoundContentProps {
  locale?: string;
}

function normalizeLocale(locale?: string): Locale {
  return routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
}

export function NotFoundContent({ locale }: NotFoundContentProps) {
  const normalizedLocale = normalizeLocale(locale);
  const m = messages[normalizedLocale];
  const featuredTools = toolRegistry.filter((tool) => tool.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="mx-auto flex w-full max-w-[1100px] flex-grow flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="border-b border-border-subtle pb-8">
          <p className="font-mono text-sm font-semibold text-content-faint">404</p>
          <h1 className="mt-3 text-3xl font-bold text-content sm:text-4xl">
            {m.not_found.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-content-muted sm:text-base">
            {m.not_found.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${normalizedLocale}`}
              className="rounded bg-action px-4 py-2 text-sm text-white transition-colors hover:bg-action-hover"
            >
              {m.not_found.home}
            </Link>
            <Link
              href={`/${normalizedLocale}#tools`}
              className="rounded bg-surface-hover px-4 py-2 text-sm text-content-secondary transition-colors hover:bg-action-muted"
            >
              {m.not_found.browse_tools}
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-normal text-content-faint">
            {m.not_found.suggested}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featuredTools.map((tool) => {
              const localizedTool = m.tools[tool.id as ToolMessageId];

              return (
                <Link
                  key={tool.id}
                  href={getLocalizedToolPath(tool, normalizedLocale)}
                  className="rounded-lg border border-border-base bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-content-faint"
                    >
                      {tool.icon}
                    </span>
                    <span>
                      <span className="block font-semibold text-content">{localizedTool.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-content-muted">
                        {localizedTool.description}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="px-4 pb-6 text-center text-sm text-content-muted">
        {m.footer.text} © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
