/**
 * 已合并博客的唯一映射。
 *
 * 旧 slug 仍参与静态路由生成，避免外部链接直接变成 404；页面本身会使用
 * noindex、指向主文章的 canonical，并且不加载广告。索引、sitemap、推荐与主题
 * 集群只使用目标文章。
 */
export const blogConsolidations = {
  'convert-json-to-typescript-interface': 'json-to-typescript-interface-guide',
  'how-to-use-text-diff-tool': 'text-diff-algorithm-add-delete-change',
  'word-count-character-byte-difference': 'chinese-english-word-count-character-byte',
  'how-to-generate-qr-code-url-wifi-contact': 'qr-code-subtitle-tools-guide',
} as const;

export type ConsolidatedBlogSlug = keyof typeof blogConsolidations;

export function getBlogConsolidation(slug: string): string | null {
  return blogConsolidations[slug as ConsolidatedBlogSlug] ?? null;
}

export function isConsolidatedBlogSlug(slug: string): boolean {
  return getBlogConsolidation(slug) !== null;
}
