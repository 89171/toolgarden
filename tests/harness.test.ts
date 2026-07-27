import { describe, expect, it } from 'vitest';
import enMessages from '../messages/en.json';
import zhMessages from '../messages/zh.json';
import { blogArticles, getLocalizedBlogTopics } from '../lib/blog/articles';
import { sitePageRegistry } from '../lib/site/registry';
import {
  createToolSeoDescription,
  createToolSeoTitle,
  toJsonLd,
} from '../lib/tools/jsonld';
import { getClientMessages } from '../lib/tools/seo';
import { toolRegistry } from '../lib/tools/registry';
import {
  createSafeFilenameStem,
  extractMarkdownTitle,
  markdownToHtml,
} from '../lib/utils/markdown';
import { jsonToXml, xmlToJson } from '../lib/utils/xml';

describe('registry and localization harness', () => {
  it('keeps tool ids and paths unique', () => {
    expect(new Set(toolRegistry.map((tool) => tool.id)).size).toBe(toolRegistry.length);
    expect(new Set(toolRegistry.map((tool) => tool.path)).size).toBe(toolRegistry.length);
  });

  it('keeps every registered tool in both message catalogs', () => {
    const registeredIds = toolRegistry.map((tool) => tool.id).sort();
    expect(Object.keys(enMessages.tools).sort()).toEqual(registeredIds);
    expect(Object.keys(zhMessages.tools).sort()).toEqual(registeredIds);

    for (const tool of toolRegistry) {
      expect(enMessages.tools[tool.id as keyof typeof enMessages.tools].name).toBeTruthy();
      expect(zhMessages.tools[tool.id as keyof typeof zhMessages.tools].name).toBeTruthy();
    }
  });

  it('keeps site information pages localized and uniquely routed', () => {
    expect(new Set(sitePageRegistry.map((page) => page.path)).size).toBe(sitePageRegistry.length);
    for (const page of sitePageRegistry) {
      expect(enMessages.site_pages[page.id].title).toBeTruthy();
      expect(zhMessages.site_pages[page.id].title).toBeTruthy();
    }
  });

  it('keeps private policy copy server-only while exposing visible tool FAQs', () => {
    const clientMessages = getClientMessages('en') as Record<string, unknown>;
    expect(clientMessages).not.toHaveProperty('site_pages');
    expect(clientMessages).toHaveProperty('tool_faq');
    expect(clientMessages).toHaveProperty('common');
    expect(clientMessages).toHaveProperty('tools');
  });
});

describe('blog topic harness', () => {
  it('keeps every topic pillar and cluster in the complete article registry', () => {
    const slugs = new Set(blogArticles.map((article) => article.slug));
    expect(slugs.size).toBe(blogArticles.length);

    for (const locale of ['en', 'zh'] as const) {
      const topics = getLocalizedBlogTopics(locale);
      for (const topic of topics) {
        expect(slugs.has(topic.pillar.slug)).toBe(true);
        expect(topic.clusters.length).toBe(topic.targetKeywords.length);
        for (const cluster of topic.clusters) expect(slugs.has(cluster.slug)).toBe(true);
      }
    }
  });
});

describe('SEO helpers', () => {
  it('keeps generated tool titles and descriptions concise without literal ellipses', () => {
    for (const [locale, messages, titleLimit, descriptionLimit] of [
      ['en', enMessages, 47, 155],
      ['zh', zhMessages, 30, 90],
    ] as const) {
      for (const tool of toolRegistry) {
        const copy = messages.tools[tool.id as keyof typeof messages.tools];
        const title = createToolSeoTitle(copy.name, copy.description, locale);
        const description = createToolSeoDescription(copy.description, locale);
        expect(title.length).toBeLessThanOrEqual(titleLimit);
        expect(title).not.toContain('...');
        expect(title).not.toMatch(/[\s,.，。;；:：、/|\\–—-]$/u);
        expect(description.length).toBeLessThanOrEqual(descriptionLimit);
        expect(description).toMatch(locale === 'zh' ? /。$/u : /\.$/u);
      }
    }
  });

  it('escapes script-breaking characters in JSON-LD', () => {
    const serialized = toJsonLd({ value: '</script>\u2028next' });
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script>');
    expect(serialized).toContain('\\u2028');
  });
});

describe('conversion compatibility', () => {
  it('converts JSON and XML after the parser security upgrade', () => {
    const xml = jsonToXml('{"id":1,"name":"ToolGarden"}');
    expect(xml.ok).toBe(true);
    if (xml.ok) {
      expect(xml.output).toContain('<id>1</id>');
      expect(xml.output).toContain('<name>ToolGarden</name>');
    }

    const json = xmlToJson('<root id="1"><name>ToolGarden</name></root>');
    expect(json.ok).toBe(true);
    if (json.ok) {
      expect(json.parsed).toEqual({ root: { name: 'ToolGarden', '@_id': 1 } });
    }
  });
});

describe('Markdown conversion', () => {
  it('creates a complete styled HTML document with GFM content', () => {
    const outcome = markdownToHtml(
      '# Release notes\n\n| Item | Status |\n| --- | --- |\n| HTML | Ready |',
      { fallbackTitle: 'Document', lang: 'en' }
    );

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.title).toBe('Release notes');
      expect(outcome.filenameStem).toBe('Release notes');
      expect(outcome.fragment).toContain('<table>');
      expect(outcome.document).toContain('<!doctype html>');
      expect(outcome.document).toContain('<title>Release notes</title>');
    }
  });

  it('escapes raw HTML and removes unsafe link protocols', () => {
    const outcome = markdownToHtml(
      '# Safe\n\n<script>alert(1)</script>\n\n[Open](javascript:alert(1))',
      { fallbackTitle: 'Document', lang: 'en' }
    );

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.fragment).not.toContain('<script>');
      expect(outcome.fragment).not.toContain('href="javascript:');
      expect(outcome.fragment).toContain('&lt;script&gt;');
      expect(outcome.fragment).toContain('>Open<');
    }
  });

  it('derives portable document titles and filenames', () => {
    expect(extractMarkdownTitle('## Section', 'Fallback')).toBe('Fallback');
    expect(extractMarkdownTitle('# **Quarterly** [report](https://example.com)', 'Fallback'))
      .toBe('Quarterly report');
    expect(createSafeFilenameStem('Report: Q3 / West?')).toBe('Report Q3 West');
  });
});
