import Link from '@/components/ui/AppLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLocaleMessages, normalizeLocale } from '@/lib/tools/seo';

interface StaticRedirectProps {
  locale: string;
  /** 目标路径，不含 locale 前缀，如 '/qr-code/generate'。 */
  to: string;
  /** 目标页面的显示名，用于可见链接文案。 */
  label: string;
}

/**
 * 静态导出下可用的路由跳转页。
 *
 * 这些路径原先调用 next/navigation 的 redirect()。但 `output: 'export'` 无法产生真正的
 * 3xx 响应，构建出来的是 `<html id="__next_error__">` 错误页外壳——用户点进来看到空白页。
 *
 * 这里换成 meta refresh + 可见链接：浏览器立即跳转，禁用脚本或跳转失败时用户仍有可点的出口，
 * 爬虫也能顺着链接走到目标页。同时声明 canonical 指向目标并 noindex，避免这些别名路径
 * 与真实工具页争抢索引。
 */
export function StaticRedirect({ locale, to, label }: StaticRedirectProps) {
  const normalizedLocale = normalizeLocale(locale);
  const m = getLocaleMessages(normalizedLocale);
  const target = `/${normalizedLocale}${to}`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      {/* React 会把 meta 提升到 <head>；0 秒刷新在静态托管下等效于跳转 */}
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <div className="flex w-full flex-grow flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-10 xl:px-14 2xl:px-20">
        <Header compact />
        <main className="mx-auto flex w-full max-w-[640px] flex-grow flex-col justify-center py-16">
          <p className="text-sm text-content-faint">{m.home.breadcrumb}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-content sm:text-3xl">
            {m.redirect_page.title}
          </h1>
          <p className="mt-3 text-base leading-8 text-content-muted">
            {m.redirect_page.description}
          </p>
          <Link
            href={target}
            className="mt-6 inline-flex w-fit items-center rounded-md border border-border-strong bg-surface-raised px-4 py-2.5 text-sm font-semibold text-content transition-colors hover:bg-surface-hover"
          >
            {m.redirect_page.action.replace('{target}', label)}
          </Link>
        </main>
      </div>
      <Footer />
    </div>
  );
}
