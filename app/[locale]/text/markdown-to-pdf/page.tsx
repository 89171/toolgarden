'use client';

import { MarkdownConverter } from '@/components/MarkdownConverter';
import { ToolLayout } from '@/components/ToolLayout';
import { textMarkdownToPdfContent } from '@/lib/tools/content/text-markdown-to-pdf';

export default function MarkdownToPdfPage() {
  return (
    <ToolLayout toolId="text-markdown-to-pdf" content={textMarkdownToPdfContent}>
      <MarkdownConverter mode="pdf" />
    </ToolLayout>
  );
}
