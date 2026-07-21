import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const publicDir = path.join(rootDir, 'public');
const DEFAULT_BASE_URL = 'https://toolgarden.xyz';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
const defaultLocale = 'en';
const localeLabels = {
  en: 'English',
  zh: 'Chinese Simplified',
};
const llmsToolsMarker = 'registry-tools';
const llmsBlogTopicsMarker = 'blog-topic-clusters';
const llmsBlogArticlesMarker = 'blog-articles';
const generatedBlogIndexPath = path.join(scriptDir, '.blog-index.generated.json');

function cleanBuildArtifacts() {
  for (const dir of ['.next', 'out']) {
    fs.rmSync(path.join(rootDir, dir), { recursive: true, force: true });
  }
}

function generateRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    `Host: ${BASE_URL}`,
    '',
  ].join('\n');
}

function generateManifest() {
  return `${JSON.stringify(
    {
      name: 'ToolGarden',
      short_name: 'ToolGarden',
      description: 'Free browser-local tools for JSON, images, PDFs, audio, text, QR codes, subtitles, and documents with no file upload required.',
      start_url: `/${defaultLocale}`,
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
          url: `/${defaultLocale}/json-format`,
          icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
        },
        {
          name: 'JSON Diff',
          short_name: 'Diff',
          description: 'Free online JSON diff for comparing two documents',
          url: `/${defaultLocale}/json-diff`,
          icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
        },
        {
          name: 'JWT Parser',
          short_name: 'JWT',
          description: 'Free online JWT decoder and verifier',
          url: `/${defaultLocale}/jwt`,
          icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
        },
      ],
    },
    null,
    2
  )}\n`;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function getPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function getStringLiteralValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function readObjectStringProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (getPropertyName(property.name) !== propertyName) continue;
    return getStringLiteralValue(property.initializer);
  }

  return null;
}

function readObjectBooleanProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (getPropertyName(property.name) !== propertyName) continue;
    if (property.initializer.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (property.initializer.kind === ts.SyntaxKind.FalseKeyword) return false;
  }

  return false;
}

function getToolRegistryArray(sourceFile) {
  let registryArray = null;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'toolRegistry' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      registryArray = node.initializer;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return registryArray;
}

function readToolRegistry() {
  const registryPath = path.join(rootDir, 'lib/tools/registry.ts');
  const source = fs.readFileSync(registryPath, 'utf8');
  const sourceFile = ts.createSourceFile(registryPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const registryArray = getToolRegistryArray(sourceFile);

  if (!registryArray) {
    throw new Error('Could not find toolRegistry array in lib/tools/registry.ts');
  }

  return registryArray.elements
    .filter(ts.isObjectLiteralExpression)
    .map((tool) => ({
      id: readObjectStringProperty(tool, 'id'),
      name: readObjectStringProperty(tool, 'name'),
      description: readObjectStringProperty(tool, 'description'),
      path: readObjectStringProperty(tool, 'path'),
      icon: readObjectStringProperty(tool, 'icon'),
      category: readObjectStringProperty(tool, 'category'),
      featured: readObjectBooleanProperty(tool, 'featured'),
    }))
    .filter((tool) => tool.id && tool.path && tool.category);
}

function groupToolsByCategory(tools) {
  const groups = new Map();

  for (const tool of tools) {
    if (!groups.has(tool.category)) groups.set(tool.category, []);
    groups.get(tool.category).push(tool);
  }

  return groups;
}

function getLocalizedTool(tool, messages, locale) {
  const localized = messages.tools[tool.id] ?? {};

  return {
    name: localized.name ?? tool.name ?? tool.id,
    description: localized.description ?? tool.description ?? '',
    url: `${BASE_URL}/${locale}${tool.path}`,
  };
}

function renderGeneratedToolIndex(tools, messagesByLocale) {
  const groups = groupToolsByCategory(tools);
  const lines = [
    '## Registry Tool Index',
    '',
    '> Generated from `lib/tools/registry.ts` and `messages/*.json` during `npm run build`.',
    '',
  ];

  for (const [category, categoryTools] of groups) {
    const enLabel = messagesByLocale.en.categories[category] ?? category;
    const zhLabel = messagesByLocale.zh.categories[category] ?? category;
    lines.push(`### ${enLabel} / ${zhLabel}`, '');

    for (const tool of categoryTools) {
      const en = getLocalizedTool(tool, messagesByLocale.en, 'en');
      const zh = getLocalizedTool(tool, messagesByLocale.zh, 'zh');
      lines.push(`- **${en.name} / ${zh.name}** (\`${tool.path}\`): ${en.description}`);
      lines.push(`  - English: ${en.url}`);
      lines.push(`  - Chinese: ${zh.url}`);
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}

function renderGeneratedFullToolReference(tools, messagesByLocale) {
  const groups = groupToolsByCategory(tools);
  const lines = [
    '## Registry Tool Reference',
    '',
    '> Generated from `lib/tools/registry.ts` and `messages/*.json` during `npm run build`. The registry is the source of truth for official tool discovery.',
    '',
  ];

  for (const [category, categoryTools] of groups) {
    const enLabel = messagesByLocale.en.categories[category] ?? category;
    const zhLabel = messagesByLocale.zh.categories[category] ?? category;
    lines.push(`### ${enLabel} / ${zhLabel}`, '');

    for (const tool of categoryTools) {
      const en = getLocalizedTool(tool, messagesByLocale.en, 'en');
      const zh = getLocalizedTool(tool, messagesByLocale.zh, 'zh');
      lines.push(`#### ${en.name} / ${zh.name} (${tool.path})`);
      lines.push(`- ID: \`${tool.id}\``);
      lines.push(`- Category: ${enLabel} / ${zhLabel}`);
      lines.push(`- Icon label: \`${tool.icon ?? ''}\``);
      lines.push(`- Featured: ${tool.featured ? 'yes' : 'no'}`);
      lines.push(`- English description: ${en.description}`);
      lines.push(`- Chinese description: ${zh.description}`);
      lines.push(`- English URL: ${en.url}`);
      lines.push(`- Chinese URL: ${zh.url}`);
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

function renderGeneratedBlogTopicClusters(topics) {
  const lines = [
    '## Pillar and Cluster Content Map',
    '',
    '> Generated from `lib/blog/topics.json` during `npm run build`. Each cluster article links to its pillar, and every pillar links to all of its clusters.',
    '',
  ];

  for (const topic of topics) {
    lines.push(`### ${topic.id}`, '');
    lines.push(`- Pillar: ${BASE_URL}/en/blog/${topic.pillarSlug}`);
    lines.push(`  - Chinese: ${BASE_URL}/zh/blog/${topic.pillarSlug}`);
    lines.push('- Cluster articles:');
    topic.clusterSlugs.forEach((slug, index) => {
      const keyword = topic.targetKeywords[index] ?? '';
      lines.push(`  - ${keyword}: ${BASE_URL}/en/blog/${slug}`);
      lines.push(`    - Chinese: ${BASE_URL}/zh/blog/${slug}`);
    });
    lines.push('');
  }

  return lines.join('\n').trim();
}

function renderGeneratedBlogArticleIndex(articles) {
  const lines = [
    '## Complete Blog Article Index',
    '',
    '> Generated from the complete `blogArticles` registry during `npm run build`.',
    '',
  ];

  for (const article of articles) {
    lines.push(`### ${article.en.title}`);
    lines.push(`- English: ${BASE_URL}/en/blog/${article.slug}`);
    lines.push(`- Chinese: ${BASE_URL}/zh/blog/${article.slug}`);
    lines.push(`- Chinese title: ${article.zh.title}`);
    lines.push(`- Summary: ${article.en.excerpt}`);
    lines.push(`- Published: ${article.publishedAt}; updated: ${article.updatedAt}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}

function replaceGeneratedSection(content, marker, generatedSection, insertBeforeHeading) {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const generatedBlock = `${start}\n${generatedSection}\n${end}`;
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end);

  if (startIndex >= 0 && endIndex > startIndex) {
    return `${content.slice(0, startIndex)}${generatedBlock}${content.slice(endIndex + end.length)}`;
  }

  const insertIndex = content.indexOf(insertBeforeHeading);
  if (insertIndex >= 0) {
    return `${content.slice(0, insertIndex).trimEnd()}\n\n${generatedBlock}\n${content.slice(insertIndex)}`;
  }

  return `${content.trimEnd()}\n\n${generatedBlock}\n`;
}

function generateLlmsFiles() {
  const tools = readToolRegistry();
  const blogTopics = readJson('lib/blog/topics.json');
  const blogArticles = JSON.parse(fs.readFileSync(generatedBlogIndexPath, 'utf8'));
  const messagesByLocale = {
    en: readJson('messages/en.json'),
    zh: readJson('messages/zh.json'),
  };
  const llmsPath = path.join(publicDir, 'llms.txt');
  const llmsFullPath = path.join(publicDir, 'llms-full.txt');
  const llmsFallback = [
    '# ToolGarden — llms.txt',
    '',
    '> A free collection of browser-based tools. Tool inputs are processed locally in the browser and are not uploaded to the server.',
    '',
    '## Languages',
    '',
    ...Object.entries(localeLabels).map(([locale, label]) => `- ${label}: \`/${locale}/...\`${locale === defaultLocale ? ' (default)' : ''}`),
    '',
    '## Optional',
    '',
    '[Optional]: https://toolgarden.xyz/llms-full.txt',
    '',
  ].join('\n');
  const llmsFullFallback = [
    '# ToolGarden — Full Reference for AI Systems',
    '',
    '> Complete technical reference for toolgarden.xyz. ToolGarden emphasizes browser-local, no-upload workflows.',
    '',
    '## Site Structure',
    '',
    `Base URL: ${BASE_URL}`,
    `Supported locales: ${Object.entries(localeLabels).map(([locale, label]) => `${locale} (${label})`).join(', ')}`,
    'URL pattern: /{locale}/{tool-path}',
    '',
  ].join('\n');
  const llmsContent = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf8') : llmsFallback;
  const llmsFullContent = fs.existsSync(llmsFullPath) ? fs.readFileSync(llmsFullPath, 'utf8') : llmsFullFallback;

  const llmsWithTools = replaceGeneratedSection(
    llmsContent,
    llmsToolsMarker,
    renderGeneratedToolIndex(tools, messagesByLocale),
    '\n## Available Tools'
  );
  const llmsFullWithTools = replaceGeneratedSection(
    llmsFullContent,
    llmsToolsMarker,
    renderGeneratedFullToolReference(tools, messagesByLocale),
    '\n## Blog Reference'
  );

  const llmsWithBlogTopics = replaceGeneratedSection(
    llmsWithTools,
    llmsBlogTopicsMarker,
    renderGeneratedBlogTopicClusters(blogTopics),
    '\n## Available Tools'
  );
  const llmsFullWithBlogTopics = replaceGeneratedSection(
    llmsFullWithTools,
    llmsBlogTopicsMarker,
    renderGeneratedBlogTopicClusters(blogTopics),
    '\n## Blog Reference'
  );

  fs.writeFileSync(
    llmsPath,
    `${replaceGeneratedSection(llmsWithBlogTopics, llmsBlogArticlesMarker, renderGeneratedBlogArticleIndex(blogArticles), '\n## Available Tools').trimEnd()}\n`
  );
  fs.writeFileSync(
    llmsFullPath,
    `${replaceGeneratedSection(llmsFullWithBlogTopics, llmsBlogArticlesMarker, renderGeneratedBlogArticleIndex(blogArticles), '\n## Blog Reference').trimEnd()}\n`
  );

  fs.rmSync(generatedBlogIndexPath, { force: true });
}

cleanBuildArtifacts();
fs.mkdirSync(publicDir, { recursive: true });
fs.rmSync(path.join(publicDir, 'sitemap.xml'), { force: true });
fs.writeFileSync(path.join(publicDir, 'robots.txt'), generateRobots());
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), generateManifest());
generateLlmsFiles();

console.log('Generated static robots, manifest, and llms files in public/. Sitemap is generated by app/sitemap.ts.');
