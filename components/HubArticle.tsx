import React from 'react';
import type { HubArticleContent } from '@/lib/tools/types';

export interface HubArticleLabels {
  overview: string;
  choosing: string;
  comparison: string;
  notes: string;
}

/**
 * Hub 页正文。
 *
 * 布局家族刻意与工具页的 ToolArticle 不同（这里用真表格 + 定义栅格 + 散文段落，
 * 工具页用编号步骤 + 代码面板 + 竖线列表），避免全站所有长文读起来是同一个模板。
 */
export function HubArticleBody({
  content,
  labels,
}: {
  content: HubArticleContent;
  labels: HubArticleLabels;
}) {
  return (
    <div className="mt-12 flex w-full max-w-[1080px] flex-col gap-10 border-t border-border-subtle pt-8">
      <section aria-labelledby="hub-overview-title">
        <h2 id="hub-overview-title" className="text-xl font-bold text-content sm:text-2xl">
          {labels.overview}
        </h2>
        <div className="mt-4 flex flex-col gap-4 text-base leading-8 text-content-secondary">
          {content.lead.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="hub-choosing-title">
        <h2 id="hub-choosing-title" className="text-xl font-bold text-content sm:text-2xl">
          {labels.choosing}
        </h2>
        <dl className="mt-4 grid gap-x-10 gap-y-5 lg:grid-cols-2">
          {content.choosing.map((entry) => (
            <div key={entry.title} className="min-w-0">
              <dt className="font-semibold leading-7 text-content">{entry.title}</dt>
              <dd className="mt-1 text-sm leading-7 text-content-muted">{entry.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {content.comparison ? (
        <section aria-labelledby="hub-comparison-title">
          <h2 id="hub-comparison-title" className="text-xl font-bold text-content sm:text-2xl">
            {labels.comparison}
          </h2>
          <p className="mt-3 text-sm leading-7 text-content-muted">
            {content.comparison.caption}
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border-base">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-base bg-surface">
                  {content.comparison.headers.map((header) => (
                    <th key={header} scope="col" className="px-4 py-3 font-semibold text-content">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.comparison.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-border-subtle last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${row[0]}-${cellIndex}`}
                        className={
                          cellIndex === 0
                            ? 'px-4 py-3 font-medium text-content-secondary'
                            : 'px-4 py-3 leading-6 text-content-muted'
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="hub-notes-title">
        <h2 id="hub-notes-title" className="text-xl font-bold text-content sm:text-2xl">
          {labels.notes}
        </h2>
        <div className="mt-4 flex flex-col gap-4 text-sm leading-7 text-content-secondary">
          {content.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
