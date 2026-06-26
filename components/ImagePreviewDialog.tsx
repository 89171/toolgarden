'use client';

/* eslint-disable @next/next/no-img-element -- Preview dialog renders local blob/data image URLs. */
import { useEffect } from 'react';

interface ImagePreviewDialogProps {
  open: boolean;
  src?: string;
  alt: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
}

export function ImagePreviewDialog({ open, src, alt, title, closeLabel, onClose }: ImagePreviewDialogProps) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-content/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-border-base bg-surface shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
          <h2 className="min-w-0 truncate text-sm font-semibold text-content-secondary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border-base px-3 py-1 text-sm text-content-secondary transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
          >
            {closeLabel}
          </button>
        </div>
        <div className="flex min-h-0 flex-grow items-center justify-center overflow-auto bg-surface-raised p-4">
          <img src={src} alt={alt} className="max-h-[calc(100svh-9rem)] max-w-full object-contain" />
        </div>
      </div>
    </div>
  );
}
