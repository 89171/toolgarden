'use client';

import { useEffect, useRef } from 'react';

export const FULLSCREEN_ARIA_KEY_SHORTCUTS = 'Control+Shift+F Meta+Shift+F';

function isFullscreenShortcut(event: KeyboardEvent) {
  return (
    event.code === 'KeyF'
    && event.shiftKey
    && (event.ctrlKey || event.metaKey)
    && !event.altKey
  );
}

export function useFullscreenShortcut(onToggle: () => void, enabled = true) {
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing || !isFullscreenShortcut(event)) return;

      event.preventDefault();
      event.stopPropagation();
      onToggleRef.current();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [enabled]);
}
