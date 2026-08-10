import { createSitemapXml } from '@/lib/site/sitemap';

export const dynamic = 'force-static';

export function GET() {
  return new Response(createSitemapXml(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
