'use client';

import { MarkdownConverter } from '@/components/MarkdownConverter';
import { ToolLayout } from '@/components/ToolLayout';

export default function MarkdownToHtmlPage() {
  return (
    <ToolLayout toolId="text-markdown-to-html">
      <MarkdownConverter mode="html" />
    </ToolLayout>
  );
}
