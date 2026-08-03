import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 根首页由 app/page.tsx 明确提供；其它无 locale 前缀的路径必须落到真实 404，
  // 不能被 next-intl 当成 locale 重写到 /[locale]，否则静态导出开发模式会返回 500。
  matcher: ['/zh/:path*', '/en/:path*'],
};
