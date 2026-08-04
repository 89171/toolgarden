import { NextIntlClientProvider } from 'next-intl';
import { getToolClientMessages, normalizeLocale } from '@/lib/tools/seo';

interface ToolMessagesProviderProps {
  locale: string;
  toolId: string;
  children: React.ReactNode;
}

/**
 * 工具页专用的消息作用域。
 *
 * 服务端组件：在这里（而不是客户端）取出「当前工具 + 全站通用命名空间」的
 * messages 子集，再渲染一层嵌套的 NextIntlClientProvider。这样只有这一个工具的
 * tool_faq / organic_keywords 会被序列化进该路由的 HTML，其它 86 个工具的份额
 * 不会被拉进来。放在各工具 layout.tsx 里包裹 children 即可，用法见任意
 * `app/[locale]/<tool>/layout.tsx`。
 */
export function ToolMessagesProvider({ locale, toolId, children }: ToolMessagesProviderProps) {
  const normalizedLocale = normalizeLocale(locale);
  const messages = getToolClientMessages(normalizedLocale, toolId);

  return (
    <NextIntlClientProvider locale={normalizedLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
