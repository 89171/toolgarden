import React from 'react';

interface HubFaqItem {
  question: string;
  answer: string;
}

interface HubFaqSectionProps {
  items: HubFaqItem[];
  title: string;
}

/**
 * Hub 页面可见 FAQ 区块（Server Component）。与 createHubFaqJsonLd 使用同一份
 * getHubFaqItems 数据，确保结构化数据与页面可见内容一致。
 */
export default function HubFaqSection({ items, title }: HubFaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="hub-faq-title">
      <h2
        id="hub-faq-title"
        className="mb-4 border-b border-border-subtle pb-2 text-xs font-semibold uppercase tracking-normal text-content-faint"
      >
        {title}
      </h2>
      <dl className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.question} className="rounded-lg border border-border-base bg-surface px-4 py-4">
            <dt className="font-semibold leading-6 text-content">{item.question}</dt>
            <dd className="mt-2 text-sm leading-6 text-content-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
