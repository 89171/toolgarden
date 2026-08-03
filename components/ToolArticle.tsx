'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import type { ToolContentBody } from '@/lib/tools/content';

interface ToolArticleProps {
  toolId: string;
  body: ToolContentBody;
}

/**
 * 工具页正文。
 *
 * 每个区块用不同的布局家族（散文栏 / 编号步骤 / 双栏代码 / 定义表 / 索引列表 /
 * 提示块 / 术语表），避免 87 个工具页读起来是同一个模板换名词。
 * 只使用 globals.css 注册的语义 token，不出现原始 Tailwind 颜色类。
 */
export const ToolArticle: React.FC<ToolArticleProps> = ({ toolId, body }) => {
  const t = useTranslations('tool_article');
  const headingId = (block: string) => `${toolId}-${block}-title`;

  return (
    <article className="mt-10 flex w-full flex-col gap-10 border-t border-border-subtle pt-8">
      {/* 概述：单栏散文，限制在易读的字符宽度内 */}
      <section aria-labelledby={headingId('overview')}>
        <h2 id={headingId('overview')} className="text-xl font-bold text-content sm:text-2xl">
          {t('overview')}
        </h2>
        <div className="mt-4 flex flex-col gap-4 text-base leading-8 text-content-secondary">
          {body.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* 步骤：编号行，用分隔线而不是卡片承载层级 */}
      <section aria-labelledby={headingId('steps')}>
        <h2 id={headingId('steps')} className="text-xl font-bold text-content sm:text-2xl">
          {t('steps')}
        </h2>
        <ol className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
          {body.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 py-4 sm:gap-6">
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-sm font-semibold tabular-nums text-content-faint"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold leading-7 text-content">{step.title}</h3>
                <p className="mt-1 text-sm leading-7 text-content-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 示例：双栏代码面板，窄屏纵向堆叠 */}
      {body.example ? (
        <section aria-labelledby={headingId('example')}>
          <h2 id={headingId('example')} className="text-xl font-bold text-content sm:text-2xl">
            {t('example')}
          </h2>
          <p className="mt-3 text-sm leading-7 text-content-muted">{body.example.caption}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              { label: body.example.inputLabel, code: body.example.input },
              { label: body.example.outputLabel, code: body.example.output },
            ].map((panel) => (
              <figure key={panel.label} className="min-w-0 overflow-hidden rounded-lg border border-border-base">
                <figcaption className="border-b border-border-subtle bg-surface px-4 py-2 font-mono text-xs font-semibold text-content-faint">
                  {panel.label}
                </figcaption>
                <pre className="overflow-x-auto bg-surface-raised px-4 py-3 text-xs leading-6 text-content-secondary">
                  <code data-language={body.example?.language}>{panel.code}</code>
                </pre>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* 能力对照：定义表，label/value 两栏对齐 */}
      {body.specs?.length ? (
        <section aria-labelledby={headingId('specs')}>
          <h2 id={headingId('specs')} className="text-xl font-bold text-content sm:text-2xl">
            {t('specs')}
          </h2>
          <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
            {body.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex flex-col gap-1 border-b border-border-subtle py-3 sm:flex-row sm:gap-4"
              >
                <dt className="shrink-0 text-sm font-semibold leading-7 text-content sm:w-36">{spec.label}</dt>
                <dd className="min-w-0 text-sm leading-7 text-content-muted">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* 场景：左侧竖线 + 索引，区别于页面下方的相关工具卡片栅格 */}
      <section aria-labelledby={headingId('scenarios')}>
        <h2 id={headingId('scenarios')} className="text-xl font-bold text-content sm:text-2xl">
          {t('scenarios')}
        </h2>
        <ul className="mt-4 flex flex-col gap-5">
          {body.scenarios.map((scenario) => (
            <li key={scenario.title} className="border-l-2 border-border-strong pl-4 sm:pl-5">
              <h3 className="font-semibold leading-7 text-content">{scenario.title}</h3>
              <p className="mt-1 text-sm leading-7 text-content-muted">{scenario.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 注意事项：单个提示块，与其它区块的开放式排版形成对比 */}
      <section aria-labelledby={headingId('notes')}>
        <h2 id={headingId('notes')} className="text-xl font-bold text-content sm:text-2xl">
          {t('notes')}
        </h2>
        <ul className="mt-4 flex flex-col gap-3 rounded-lg border border-border-base bg-surface px-5 py-5">
          {body.notes.map((note) => (
            <li key={note} className="flex gap-3 text-sm leading-7 text-content-secondary">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-content-faint" />
              <span className="min-w-0">{note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 术语表：紧凑的 dl，承载该工具特有的背景知识 */}
      {body.reference?.length ? (
        <section aria-labelledby={headingId('reference')}>
          <h2 id={headingId('reference')} className="text-xl font-bold text-content sm:text-2xl">
            {t('reference')}
          </h2>
          <dl className="mt-4 grid gap-5 lg:grid-cols-2">
            {body.reference.map((entry) => (
              <div key={entry.term} className="min-w-0">
                <dt className="font-mono text-sm font-semibold text-content">{entry.term}</dt>
                <dd className="mt-1 text-sm leading-7 text-content-muted">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </article>
  );
};
