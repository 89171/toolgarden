import Link from 'next/link';
import type { BlogLocale, LocalizedBlogTopicMembership } from '@/lib/blog/articles';
import { getLocalizedPath } from '@/lib/tools/seo';

interface BlogTopicNavigationProps {
  locale: BlogLocale;
  currentSlug: string;
  membership: LocalizedBlogTopicMembership;
  labels: {
    pillarGuide: string;
    clusterArticles: string;
    backToPillar: string;
    targetKeyword: string;
  };
}

export function BlogTopicNavigation({
  locale,
  currentSlug,
  membership,
  labels,
}: BlogTopicNavigationProps) {
  const isPillar = membership.role === 'pillar';

  return (
    <aside className="my-8 rounded-lg border border-border-base bg-surface p-5 sm:p-6" aria-labelledby="topic-navigation-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-content-faint">{labels.pillarGuide}</p>
          {isPillar ? (
            <h2 id="topic-navigation-title" className="mt-1 text-xl font-bold text-content">
              {membership.pillar.title}
            </h2>
          ) : (
            <Link
              id="topic-navigation-title"
              href={getLocalizedPath(locale, membership.pillar.path)}
              className="mt-1 block text-xl font-bold text-content transition-colors hover:text-content-secondary"
            >
              {membership.pillar.title}
            </Link>
          )}
        </div>
        {!isPillar ? (
          <Link
            href={getLocalizedPath(locale, membership.pillar.path)}
            className="inline-flex shrink-0 items-center justify-center rounded border border-border-strong bg-surface-raised px-3 py-2 text-sm font-semibold text-content transition-colors hover:bg-surface-hover"
          >
            {labels.backToPillar}
          </Link>
        ) : null}
      </div>

      {membership.targetKeyword ? (
        <p className="mt-3 text-sm text-content-faint">
          {labels.targetKeyword}: <span className="font-medium text-content-muted">{membership.targetKeyword}</span>
        </p>
      ) : null}

      <h3 className="mt-6 text-sm font-semibold text-content-secondary">{labels.clusterArticles}</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {membership.clusters.map((article) => {
          const isCurrent = article.slug === currentSlug;
          return (
            <Link
              key={article.slug}
              href={getLocalizedPath(locale, article.path)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`rounded border px-3 py-3 text-sm font-medium transition-colors ${
                isCurrent
                  ? 'border-border-strong bg-surface-hover text-content'
                  : 'border-border-subtle bg-surface-raised text-content-secondary hover:border-border-strong hover:bg-surface-hover hover:text-content'
              }`}
            >
              {article.title}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
