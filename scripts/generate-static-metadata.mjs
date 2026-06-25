import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const publicDir = path.join(rootDir, 'public');
const BASE_URL = 'https://www.toolgarden.xyz';
const locales = ['zh', 'en'];
const defaultLocale = 'zh';
const hubPaths = ['/image', '/pdf', '/file-merge'];

function cleanBuildArtifacts() {
  for (const dir of ['.next', 'out']) {
    fs.rmSync(path.join(rootDir, dir), { recursive: true, force: true });
  }
}

function readToolPaths() {
  const registryPath = path.join(rootDir, 'lib/tools/registry.ts');
  const registrySource = fs.readFileSync(registryPath, 'utf8');
  const paths = [...registrySource.matchAll(/path:\s*'([^']+)'/g)].map((match) => match[1]);

  if (paths.length === 0) {
    throw new Error(`No tool paths found in ${registryPath}`);
  }

  return paths;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function alternatesFor(routePath = '') {
  return [
    ...locales.map((locale) => ({
      hreflang: locale,
      href: `${BASE_URL}/${locale}${routePath}`,
    })),
    {
      hreflang: 'x-default',
      href: `${BASE_URL}/${defaultLocale}${routePath}`,
    },
  ];
}

function sitemapUrl({ routePath = '', changeFrequency, priority }) {
  const loc = `${BASE_URL}/${defaultLocale}${routePath}`;
  const alternateLinks = alternatesFor(routePath)
    .map((alternate) =>
      `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`
    )
    .join('\n');

  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority}</priority>`,
    alternateLinks,
    '  </url>',
  ].join('\n');
}

function generateSitemap() {
  const urls = [
    sitemapUrl({
      routePath: '',
      changeFrequency: 'weekly',
      priority: '1.0',
    }),
    ...hubPaths.map((routePath) =>
      sitemapUrl({
        routePath,
        changeFrequency: 'weekly',
        priority: '0.9',
      })
    ),
    ...readToolPaths().map((routePath) =>
      sitemapUrl({
        routePath,
        changeFrequency: 'monthly',
        priority: '0.8',
      })
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls.join('\n'),
    '</urlset>',
    '',
  ].join('\n');
}

function generateRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /_next/',
    '',
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    `Host: ${BASE_URL}`,
    '',
  ].join('\n');
}

function generateManifest() {
  return `${JSON.stringify(
    {
      name: 'JSON Toolkit',
      short_name: 'JSON Toolkit',
      description: 'Free online JSON tools to format, convert, validate and decode JSON in the browser, no uploads.',
      start_url: '/zh',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: '#ffffff',
      theme_color: '#1f2937',
      categories: ['developer', 'utilities', 'productivity'],
      icons: [
        {
          src: '/pwa-192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/pwa-512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
      shortcuts: [
        {
          name: 'JSON Formatter',
          short_name: 'Format',
          description: 'Free online JSON formatter and validator',
          url: '/zh/json-format',
          icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
        },
        {
          name: 'JSON Diff',
          short_name: 'Diff',
          description: 'Free online JSON diff for comparing two documents',
          url: '/zh/json-diff',
          icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
        },
        {
          name: 'JWT Parser',
          short_name: 'JWT',
          description: 'Free online JWT decoder and verifier',
          url: '/zh/jwt',
          icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
        },
      ],
    },
    null,
    2
  )}\n`;
}

cleanBuildArtifacts();
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemap());
fs.writeFileSync(path.join(publicDir, 'robots.txt'), generateRobots());
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), generateManifest());

console.log('Generated static metadata files in public/.');
