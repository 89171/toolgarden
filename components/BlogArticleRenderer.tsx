import Link from '@/components/ui/AppLink';
import type { BlogBlock, BlogLocale } from '@/lib/blog/articles';

interface BlogArticleRendererProps {
  blocks: BlogBlock[];
  locale: BlogLocale;
}

function getHref(href: string, locale: BlogLocale): string {
  if (/^https?:\/\//u.test(href)) return href;
  return `/${locale}${href}`;
}

export function BlogArticleRenderer({ blocks, locale }: BlogArticleRendererProps) {
  return (
    <div className="text-base leading-8 text-content-secondary sm:text-lg sm:leading-9">
      {blocks.map((block, index) => {
        if (block.type === 'lead') {
          return (
            <p key={index} className="mb-6 text-lg leading-9 text-content-secondary sm:text-xl sm:leading-10">
              {block.text}
            </p>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={index} className="my-5">
              {block.text}
            </p>
          );
        }

        if (block.type === 'heading') {
          if (block.level === 2) {
            return (
              <h2 key={index} className="mt-12 border-t border-border-subtle pt-8 text-2xl font-bold leading-tight text-content sm:text-3xl">
                {block.text}
              </h2>
            );
          }

          return (
            <h3 key={index} className="mt-9 text-xl font-semibold leading-tight text-content sm:text-2xl">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'code') {
          return (
            <pre key={index} className="my-6 overflow-x-auto rounded-lg border border-border-base bg-surface p-4 text-sm leading-7 text-content-secondary">
              <code className="font-mono">{block.code}</code>
            </pre>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={index} className="my-6 border-l-4 border-border-strong pl-4 text-lg font-semibold leading-8 text-content">
              {block.text}
            </blockquote>
          );
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index} className={`${block.ordered ? 'list-decimal' : 'list-disc'} my-5 space-y-2 pl-6 text-content-muted marker:text-content-faint`}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={index} className="my-6 overflow-x-auto rounded-lg border border-border-base">
              <table className="w-full min-w-96 border-collapse bg-surface-raised text-left text-sm">
                <thead className="bg-surface">
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header} className="border-b border-border-base px-4 py-3 font-semibold text-content">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.join('|')} className="border-t border-border-subtle">
                      {row.map((cell) => (
                        <td key={cell} className="px-4 py-3 text-content-muted">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <aside key={index} className="my-8 rounded-lg border border-border-base bg-surface p-5">
            <h3 className="text-base font-semibold text-content">{block.title}</h3>
            <p className="mt-2 text-sm leading-7 text-content-muted sm:text-base">{block.text}</p>
            {block.href && block.linkLabel ? (
              <Link
                href={getHref(block.href, locale)}
                className="mt-4 inline-flex rounded bg-action px-4 py-2 text-sm font-medium text-brand-fg transition-colors hover:bg-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
              >
                {block.linkLabel}
              </Link>
            ) : null}
          </aside>
        );
      })}
    </div>
  );
}
