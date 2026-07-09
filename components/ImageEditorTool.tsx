'use client';

import dynamic from 'next/dynamic';
import { ToolLayout } from '@/components/ToolLayout';

const ImageEditorToolImpl = dynamic(
  () => import('@/components/ImageEditorToolImpl').then((m) => m.ImageEditorToolImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-content-muted">
        …
      </div>
    ),
  },
);

export function ImageEditorTool() {
  return (
    <ToolLayout toolId="image-editor">
      <ImageEditorToolImpl />
    </ToolLayout>
  );
}
