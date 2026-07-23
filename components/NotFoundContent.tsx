import Link from '@/components/ui/AppLink';
import {
  getFeaturedTools,
  getLocaleMessages,
  getLocalizedToolCards,
  normalizeLocale,
} from '@/lib/tools/seo';

interface NotFoundContentProps {
  locale: string;
}

export function NotFoundContent({ locale }: NotFoundContentProps) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const featuredIds = new Set(getFeaturedTools().map((tool) => tool.id));
  const featuredTools = getLocalizedToolCards(normalizedLocale)
    .filter((tool) => featuredIds.has(tool.id))
    .slice(0, 4);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
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
              className="rounded bg-action px-4 py-2 text-sm text-brand-fg transition-colors hover:bg-action-hover"
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
              return (
                <Link
                  key={tool.id}
                  href={tool.localizedPath}
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
                      <span className="block font-semibold text-content">{tool.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-content-muted">
                        {tool.description}
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
