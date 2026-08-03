import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { blogArticles, getLocalizedBlogArticles } from '@/lib/blog/articles';
import { blogConsolidations, isConsolidatedBlogSlug } from '@/lib/blog/consolidations';
import { blogTopics } from '@/lib/blog/topics';
import { toolRegistry } from '@/lib/tools/registry';
import type { ToolContent, ToolContentBody } from '@/lib/tools/content';

const CONTENT_DIRECTORY = path.resolve('lib/tools/content');
const SUPPORT_MODULES = new Set(['define.ts', 'index.ts', 'types.ts']);
const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function auditToolBody(toolId: string, locale: 'zh' | 'en', body: ToolContentBody) {
  const prefix = `${toolId}:${locale}`;

  if (body.overview.length < 2) fail(`${prefix} needs at least two overview paragraphs`);
  if (body.steps.length < 3) fail(`${prefix} needs at least three concrete steps`);
  if (body.scenarios.length < 3) fail(`${prefix} needs at least three distinct scenarios`);
  if (body.notes.length < 3) fail(`${prefix} needs at least three boundary notes`);
  if ((body.specs?.length ?? 0) < 6) fail(`${prefix} needs at least six implementation-specific facts`);
  if ((body.reference?.length ?? 0) < 2) fail(`${prefix} needs at least two defined terms`);
  if ((body.faq?.length ?? 0) < 2) fail(`${prefix} needs at least two tool-specific questions`);

  const longSections = [
    ...body.overview,
    ...body.steps.map((step) => `${step.title} ${step.detail}`),
    ...body.scenarios.map((scenario) => `${scenario.title} ${scenario.detail}`),
    ...body.notes,
  ];
  if (new Set(longSections).size !== longSections.length) {
    fail(`${prefix} repeats an entire content section`);
  }
}

async function auditTools() {
  const files = fs.readdirSync(CONTENT_DIRECTORY)
    .filter((file) => file.endsWith('.ts') && !SUPPORT_MODULES.has(file))
    .sort();
  const fileIds = files.map((file) => file.slice(0, -3));
  const registryIds = toolRegistry.map((tool) => tool.id).sort();

  for (const id of registryIds) {
    if (!fileIds.includes(id)) fail(`registered tool ${id} has no content module`);
  }
  for (const id of fileIds) {
    if (!registryIds.includes(id)) fail(`content module ${id} is not registered`);
  }

  for (const file of files) {
    const toolId = file.slice(0, -3);
    const contentModule = await import(pathToFileURL(path.join(CONTENT_DIRECTORY, file)).href);
    const content = Object.values(contentModule).find(
      (value): value is ToolContent => Boolean(
        value
        && typeof value === 'object'
        && 'zh' in value
        && 'en' in value
      )
    );

    if (!content) {
      fail(`${toolId} does not export bilingual tool content`);
      continue;
    }

    auditToolBody(toolId, 'zh', content.zh);
    auditToolBody(toolId, 'en', content.en);
  }

  return files.length;
}

function getBlogBodyText(slug: string, locale: 'zh' | 'en'): string {
  const article = blogArticles.find((candidate) => candidate.slug === slug);
  if (!article) return '';

  return article.translations[locale].blocks.flatMap((block) => {
    if ('text' in block) return [block.text];
    if ('items' in block) return block.items;
    if ('headers' in block) return [...block.headers, ...block.rows.flat()];
    return [];
  }).join(' ');
}

function countEnglishWords(text: string): number {
  return text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g)?.length ?? 0;
}

function auditBlog() {
  const slugs = blogArticles.map((article) => article.slug);
  const indexableArticles = getLocalizedBlogArticles('en');

  if (new Set(slugs).size !== slugs.length) fail('blog slugs must be unique');

  for (const [source, target] of Object.entries(blogConsolidations)) {
    if (!slugs.includes(source)) fail(`consolidated source ${source} does not exist`);
    if (!slugs.includes(target)) fail(`consolidated target ${target} does not exist`);
    if (isConsolidatedBlogSlug(target)) fail(`consolidated target ${target} cannot point to another source`);
  }

  for (const topic of blogTopics) {
    for (const slug of [topic.pillarSlug, ...topic.clusterSlugs]) {
      if (isConsolidatedBlogSlug(slug)) fail(`topic ${topic.id} includes consolidated article ${slug}`);
    }
    if (topic.clusterSlugs.length !== topic.targetKeywords.length) {
      fail(`topic ${topic.id} must pair every cluster with one target keyword`);
    }
  }

  for (const article of indexableArticles) {
    const source = blogArticles.find((candidate) => candidate.slug === article.slug);
    if (!source) continue;

    for (const locale of ['zh', 'en'] as const) {
      const translation = source.translations[locale];
      const body = getBlogBodyText(article.slug, locale);
      const headings = translation.blocks.filter((block) => block.type === 'heading').length;

      // 这是站内编辑下限，不是 Google 公布的字数规则。目的是阻止短模板重新进入索引。
      if (locale === 'zh' && body.replace(/\s/g, '').length < 600) {
        fail(`${article.slug}:zh is below the 600-character editorial floor`);
      }
      if (locale === 'en' && countEnglishWords(body) < 300) {
        fail(`${article.slug}:en is below the 300-word editorial floor`);
      }
      if (headings < 3) fail(`${article.slug}:${locale} needs at least three substantive sections`);
      if ((translation.faq?.length ?? 0) < 2) fail(`${article.slug}:${locale} needs at least two FAQs`);
    }
  }

  return indexableArticles.length;
}

async function main() {
  const toolCount = await auditTools();
  const blogCount = auditBlog();

  if (errors.length > 0) {
    console.error(`Publisher content audit failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Publisher content audit passed: ${toolCount} tools, ${blogCount} indexable articles, ${Object.keys(blogConsolidations).length} consolidations.`);
}

void main();
