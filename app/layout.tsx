import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/tools/jsonld';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
};

// 根布局：仅作为 [locale]/layout.tsx 的透传容器。
// Next.js App Router 要求根 layout 必须存在，但实际的 <html>/<body>
// 由 app/[locale]/layout.tsx 提供（每个 locale 单独设置 lang 属性）。
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
