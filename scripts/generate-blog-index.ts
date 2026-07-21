import fs from 'node:fs';
import path from 'node:path';
import { blogArticles } from '../lib/blog/articles';

const outputPath = path.join(process.cwd(), 'scripts', '.blog-index.generated.json');
const index = blogArticles.map((article) => ({
  slug: article.slug,
  publishedAt: article.publishedAt,
  updatedAt: article.updatedAt,
  en: {
    title: article.translations.en.title,
    excerpt: article.translations.en.excerpt,
  },
  zh: {
    title: article.translations.zh.title,
    excerpt: article.translations.zh.excerpt,
  },
}));

fs.writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Generated ${index.length} blog article records for static metadata.`);
