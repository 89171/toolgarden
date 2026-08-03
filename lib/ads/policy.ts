import { isConsolidatedBlogSlug } from '@/lib/blog/consolidations';

const AD_FREE_SITE_PATHS = new Set([
  '/about',
  '/contact',
  '/privacy',
  '/security',
  '/terms',
]);

/**
 * 广告加载资格只描述页面类型，不读取正文或工具注册表，避免把全站内容带进客户端。
 */
export function shouldLoadGoogleAdSense(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const pathWithoutLocale = `/${segments.slice(1).join('/')}`;

  if (AD_FREE_SITE_PATHS.has(pathWithoutLocale)) return false;

  const blogMatch = pathWithoutLocale.match(/^\/blog\/([^/]+)$/);
  if (blogMatch && isConsolidatedBlogSlug(blogMatch[1])) return false;

  return true;
}
