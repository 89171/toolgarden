'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ToolCategory } from '@/lib/tools/types';

export interface ToolCardData {
  id: string;
  name: string;
  description: string;
  path: string;
  localizedPath: string;
  icon: string;
  category: ToolCategory;
  categoryLabel: string;
  featured?: boolean;
}

interface ToolGroupData {
  category: ToolCategory;
  label: string;
  tools: ToolCardData[];
}

interface ToolDirectoryProps {
  allToolsTitle: string;
  featuredTitle: string;
  groups: ToolGroupData[];
  noResultsLabel: string;
  searchPlaceholder: string;
  searchResultsTitle: string;
  tools: ToolCardData[];
}

function ToolCard({ tool }: { tool: ToolCardData }) {
  return (
    <Link
      href={tool.localizedPath}
      aria-label={`${tool.name}: ${tool.description}`}
      className="group flex min-h-36 flex-col gap-3 rounded-lg border border-border-base p-5 transition-all hover:border-border-strong hover:bg-surface-hover hover:shadow-sm"
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

export function ToolDirectory({
  allToolsTitle,
  featuredTitle,
  groups,
  noResultsLabel,
  searchPlaceholder,
  searchResultsTitle,
  tools,
}: ToolDirectoryProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredTools = useMemo(() => {
    if (!normalizedQuery) return tools;

    return tools.filter((tool) => {
      const haystack = [
        tool.name,
        tool.description,
        tool.categoryLabel,
        tool.id,
      ].join(' ').toLocaleLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, tools]);

  const featuredTools = tools.filter((tool) => tool.featured);
  const isSearching = normalizedQuery.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto w-full max-w-2xl">
        <label htmlFor="tool-search" className="sr-only">
          {searchPlaceholder}
        </label>
        <input
          id="tool-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-lg border border-border-input bg-surface-raised px-4 py-3 text-sm text-content-secondary outline-none transition-colors placeholder:text-content-faint focus:border-border-strong focus:ring-2 focus:ring-action"
          placeholder={searchPlaceholder}
          type="search"
        />
      </div>

      {isSearching ? (
        <section>
          <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
            {searchResultsTitle}
          </h2>
          {filteredTools.length > 0 ? (
            <ToolGrid tools={filteredTools} />
          ) : (
            <p className="rounded-lg border border-border-base bg-surface p-5 text-sm text-content-muted">
              {noResultsLabel}
            </p>
          )}
        </section>
      ) : (
        <>
          {featuredTools.length > 0 && (
            <section>
              <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
                {featuredTitle}
              </h2>
              <ToolGrid tools={featuredTools} />
            </section>
          )}

          <section>
            <h2 className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint">
              {allToolsTitle}
            </h2>
            <div className="flex flex-col gap-10">
              {groups.map((group) => (
                <section key={group.category}>
                  <h3 className="mb-4 text-sm font-semibold text-content-secondary">
                    {group.label}
                  </h3>
                  <ToolGrid tools={group.tools} />
                </section>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
