/**
 * 联系邮箱。
 *
 * 一个免费邮箱服务商的数字账号作为站点唯一联系方式，对人工审核和用户信任都是减分项，
 * 应换成域名邮箱（例如 contact@toolgarden.xyz）。这里做成环境变量可覆盖，
 * 是因为写死一个还没开通的地址比留着现在这个更糟，收不到信的联系页等于没有联系页。
 * 邮箱开通后设置 NEXT_PUBLIC_CONTACT_EMAIL 即可生效，无需改动代码。
 */
export const SITE_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '891715824@qq.com';

export const sitePageRegistry = [
  { id: 'about', path: '/about' },
  { id: 'privacy', path: '/privacy' },
  { id: 'terms', path: '/terms' },
  { id: 'security', path: '/security' },
  { id: 'contact', path: '/contact' },
] as const;

export type SitePageId = (typeof sitePageRegistry)[number]['id'];

export function getSitePage(id: SitePageId) {
  return sitePageRegistry.find((page) => page.id === id);
}
