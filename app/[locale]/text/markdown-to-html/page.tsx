'use client';

import { MarkdownConverter } from '@/components/MarkdownConverter';
import { ToolLayout } from '@/components/ToolLayout';
import { textMarkdownToHtmlContent } from '@/lib/tools/content/text-markdown-to-html';

export default function MarkdownToHtmlPage() {
  return (
    <ToolLayout toolId="text-markdown-to-html" content={textMarkdownToHtmlContent}>
      <MarkdownConverter mode="html" />
    </ToolLayout>
  );
}
