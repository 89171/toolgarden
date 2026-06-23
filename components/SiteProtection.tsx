'use client';

import { useEffect } from 'react';

const interactiveSelector = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'pre',
  'code',
  '[contenteditable="true"]',
  '[role="textbox"]',
  '[data-allow-context-menu="true"]',
].join(',');

const protectedSelector = [
  '[data-protect-context-menu="true"]',
  'canvas',
  'video',
  'svg',
  'img:not([src^="blob:"]):not([src^="data:"])',
].join(',');

function closestElement(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function isEditableOrInteractive(element: Element) {
  return Boolean(element.closest(interactiveSelector));
}

function isProtectedSurface(element: Element) {
  return Boolean(element.closest(protectedSelector));
}

export function SiteProtection() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const element = closestElement(event.target);
      if (!element || isEditableOrInteractive(element)) return;
      if (isProtectedSurface(element)) event.preventDefault();
    };

    const handleDragStart = (event: DragEvent) => {
      const element = closestElement(event.target);
      if (!element || isEditableOrInteractive(element)) return;
      if (isProtectedSurface(element)) event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const element = closestElement(event.target);
      if (element && isEditableOrInteractive(element)) return;

      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 's') {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
