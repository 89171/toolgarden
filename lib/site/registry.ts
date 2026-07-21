export const SITE_CONTACT_EMAIL = '891715824@qq.com';

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
