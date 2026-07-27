'use client';

import { MarkdownConverter } from '@/components/MarkdownConverter';
import { ToolLayout } from '@/components/ToolLayout';

export default function MarkdownToPdfPage() {
  return (
    <ToolLayout toolId="text-markdown-to-pdf">
      <MarkdownConverter mode="pdf" />
    </ToolLayout>
  );
}
