'use client';

import dynamic from 'next/dynamic';
import { ToolLayout } from '@/components/ToolLayout';
import { pdfEditContent } from '@/lib/tools/content/pdf-edit';

const PdfEditorToolImpl = dynamic(
  () => import('@/components/PdfEditorToolImpl').then((m) => m.PdfEditorToolImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-content-muted">
        …
      </div>
    ),
  },
);

export function PdfEditorTool() {
  return (
    <ToolLayout toolId="pdf-edit" content={pdfEditContent}>
      <PdfEditorToolImpl />
    </ToolLayout>
  );
}
