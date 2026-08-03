'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface RootNotFoundLocaleSwitchProps {
  zh: ReactNode;
  en: ReactNode;
  titles: Record<'zh' | 'en', string>;
}

/**
 * 静态导出只有一份根 404.html，请求路径要到浏览器里才能确定。
 * 两份正文仍由服务端组件生成，这里只负责按 URL 的 locale 选择展示，
 * 不把完整 messages 和 registry 打进客户端 bundle。
 */
export function RootNotFoundLocaleSwitch({
  zh,
  en,
  titles,
}: RootNotFoundLocaleSwitchProps) {
  const pathname = usePathname();
  const locale = pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = titles[locale];
  }, [locale, titles]);

  return locale === 'zh' ? zh : en;
}
