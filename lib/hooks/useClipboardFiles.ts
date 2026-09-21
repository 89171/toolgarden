'use client';

import { useEffect } from 'react';

interface UseClipboardFilesOptions {
  enabled?: boolean;
  accept?: (file: File) => boolean;
}

function getClipboardFiles(event: ClipboardEvent): File[] {
  const files = Array.from(event.clipboardData?.files ?? []);
  if (files.length > 0) return files;

  return Array.from(event.clipboardData?.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

export function useClipboardFiles(
  onFiles: (files: File[]) => void,
  { enabled = true, accept }: UseClipboardFilesOptions = {}
) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handlePaste = (event: ClipboardEvent) => {
      const pastedFiles = getClipboardFiles(event);
      const acceptedFiles = accept ? pastedFiles.filter(accept) : pastedFiles;
      if (acceptedFiles.length === 0) return;

      event.preventDefault();
      onFiles(acceptedFiles);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [accept, enabled, onFiles]);
}
