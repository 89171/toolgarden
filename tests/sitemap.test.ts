import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { BASE_URL } from '../lib/tools/seo';
import {
  getSitemapEntries,
  serializeSitemap,
} from '../lib/site/sitemap';

describe('sitemap', () => {
  it('includes the canonical root URL and a lastmod for every URL', () => {
    const entries = getSitemapEntries();
    const urls = entries.map((entry) => entry.url);

    expect(urls[0]).toBe(`${BASE_URL}/`);
    expect(new Set(urls).size).toBe(urls.length);
    expect(entries.every((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.lastModified))).toBe(true);
  });

  it('serializes core sitemap fields before XHTML alternates', () => {
    const xml = serializeSitemap([
      {
        url: `${BASE_URL}/en/blog/example`,
        lastModified: '2026-08-10',
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/blog/example`,
            zh: `${BASE_URL}/zh/blog/example`,
          },
        },
      },
    ]);
    const loc = xml.indexOf('<loc>');
    const lastmod = xml.indexOf('<lastmod>');
    const changefreq = xml.indexOf('<changefreq>');
    const priority = xml.indexOf('<priority>');
    const alternate = xml.indexOf('<xhtml:link');

    expect(loc).toBeLessThan(lastmod);
    expect(lastmod).toBeLessThan(changefreq);
    expect(changefreq).toBeLessThan(priority);
    expect(priority).toBeLessThan(alternate);
    expect(() => new XMLParser().parse(xml)).not.toThrow();
  });

  it('keeps consolidated blog aliases out of the sitemap', () => {
    const urls = getSitemapEntries().map((entry) => entry.url);

    expect(urls).not.toContain(
      `${BASE_URL}/en/blog/word-count-character-byte-difference`
    );
    expect(urls).toContain(
      `${BASE_URL}/en/blog/chinese-english-word-count-character-byte`
    );
  });
});
