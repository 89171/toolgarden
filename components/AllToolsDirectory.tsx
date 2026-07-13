'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ToolCardData } from '@/components/ToolDirectory';

export interface AllToolsSection {
  key: string;
  label: string;
  href: string | null;
  tools: ToolCardData[];
}

interface AllToolsDirectoryProps {
  sections: AllToolsSection[];
  featured: ToolCardData[];
  labels: {
    searchPlaceholder: string;
    searchResults: string;
    noResults: string;
    featured: string;
    expandMore: string;
    showLess: string;
    viewAllTemplate: string;
  };
}

const VISIBLE_LIMIT = 8;

function ToolCard({ tool }: { tool: ToolCardData }) {
  return (
    <Link
      href={tool.localizedPath}
      aria-label={`${tool.name}: ${tool.description}`}
      className="group flex min-h-32 flex-col gap-3 rounded-lg border border-border-base bg-background p-4 transition-all hover:border-border-strong hover:bg-surface-hover hover:shadow-sm sm:min-h-36 sm:p-5"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-11 items-center justify-center rounded border border-border-subtle bg-surface-raised font-mono text-xs font-semibold text-content-faint transition-colors group-hover:text-content-secondary"
      >
        {tool.icon}
      </span>
      <span className="font-semibold text-content">{tool.name}</span>
      <span className="text-sm leading-relaxed text-content-muted">{tool.description}</span>
    </Link>
  );
}

function ToolGrid({ tools }: { tools: ToolCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

export function AllToolsDirectory({ sections, featured, labels }: AllToolsDirectoryProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const normalized = query.trim().toLocaleLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return null;
    const seen = new Set<string>();
    const acc: ToolCardData[] = [];
    for (const section of sections) {
      for (const tool of section.tools) {
        if (seen.has(tool.id)) continue;
        const haystack = [tool.name, tool.description, tool.categoryLabel, tool.id]
          .join(' ')
          .toLocaleLowerCase();
        if (haystack.includes(normalized)) {
          seen.add(tool.id);
          acc.push(tool);
        }
      }
    }
    return acc;
  }, [normalized, sections]);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="mx-auto w-full max-w-2xl">
        <label htmlFor="tool-search" className="sr-only">
          {labels.searchPlaceholder}
        </label>
        <input
          id="tool-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-border-input bg-surface-raised px-4 py-3 text-sm text-content-secondary outline-none transition-colors placeholder:text-content-faint focus:border-border-strong focus:ring-2 focus:ring-action"
          placeholder={labels.searchPlaceholder}
          type="search"
        />
      </div>

      {filtered ? (
        <section>
          <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
            {labels.searchResults}
          </h2>
          {filtered.length > 0 ? (
            <ToolGrid tools={filtered} />
          ) : (
            <p className="rounded-lg border border-border-base bg-surface p-5 text-sm text-content-muted">
              {labels.noResults}
            </p>
          )}
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section>
              <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
                {labels.featured}
              </h2>
              <ToolGrid tools={featured} />
            </section>
          )}

          <div className="flex flex-col gap-12">
            {sections.map((section) => {
              const isExpanded = expanded[section.key] ?? false;
              const hasMore = section.tools.length > VISIBLE_LIMIT;
              const visibleTools = isExpanded || !hasMore
                ? section.tools
                : section.tools.slice(0, VISIBLE_LIMIT);

              return (
                <section key={section.key}>
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-border-subtle pb-2">
                    <h2 className="text-sm font-semibold text-content-secondary">
                      {section.label}
                      <span className="ml-2 text-xs font-normal text-content-faint">
                        ({section.tools.length})
                      </span>
                    </h2>
                    {section.href ? (
                      <Link
                        href={section.href}
                        className="text-xs font-medium text-content-muted hover:text-content-secondary"
                      >
                        {labels.viewAllTemplate.replace('{section}', section.label)} →
                      </Link>
                    ) : null}
                  </div>
                  <ToolGrid tools={visibleTools} />
                  {hasMore && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [section.key]: !isExpanded }))
                        }
                        className="rounded-md border border-border-base bg-surface px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:border-border-strong hover:bg-surface-hover"
                      >
                        {isExpanded
                          ? labels.showLess
                          : `${labels.expandMore} (+${section.tools.length - VISIBLE_LIMIT})`}
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
