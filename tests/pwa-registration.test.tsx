// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaRegistration } from '../components/PwaRegistration';
import enMessages from '../messages/en.json';
import { PWA_INSTALL_DISMISSAL_MS } from '../lib/utils/pwa';

interface InstallPromptEvent extends Event {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: 'accepted'; platform: string }>;
}

function createInstallPromptEvent() {
  const event = new Event('beforeinstallprompt', { cancelable: true });

  return Object.assign(event, {
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
  }) as InstallPromptEvent;
}

describe('PwaRegistration', () => {
  let container: HTMLDivElement;
  let root: Root | undefined;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-10T00:00:00Z'));
    const storage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });

    container = document.createElement('div');
    document.body.appendChild(container);
    const mountedRoot = createRoot(container);
    root = mountedRoot;

    await act(async () => {
      mountedRoot.render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <PwaRegistration />
        </NextIntlClientProvider>
      );
    });
  });

  afterEach(async () => {
    if (root) await act(async () => root?.unmount());
    container?.remove();
    root = undefined;
    vi.useRealTimers();
  });

  it('defers installation until the user clicks Install', async () => {
    const event = createInstallPromptEvent();

    expect(container.textContent).not.toContain('Install this app');

    await act(async () => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(container.textContent).toContain('Install this app for offline access');
    expect(event.prompt).not.toHaveBeenCalled();
    expect(container.querySelector('aside')?.className).toContain('fixed');
    expect(container.querySelector('aside')?.className).toContain('left-1/2');
    expect(container.querySelector('aside')?.className).toContain('sm:bottom-6');

    const installButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Install'
    );
    expect(installButton).toBeDefined();

    await act(async () => {
      installButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(event.prompt).toHaveBeenCalledOnce();
    expect(container.textContent).not.toContain('Install this app');
  });

  it('keeps the prompt hidden for two weeks after the close button is clicked', async () => {
    await act(async () => {
      window.dispatchEvent(createInstallPromptEvent());
    });

    const closeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Dismiss install prompt"]'
    );
    expect(closeButton).not.toBeNull();
    expect(closeButton?.textContent?.trim()).toBe('X');
    expect(closeButton?.classList.contains('bg-transparent')).toBe(true);
    expect(closeButton?.classList.contains('border')).toBe(false);
    expect(closeButton?.classList.contains('bg-surface')).toBe(false);

    await act(async () => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const dismissedUntil = Number(
      window.localStorage.getItem('toolgarden:pwa-install-dismissed-until')
    );
    expect(dismissedUntil).toBe(Date.now() + PWA_INSTALL_DISMISSAL_MS);

    await act(async () => {
      window.dispatchEvent(createInstallPromptEvent());
    });
    expect(container.textContent).not.toContain('Install this app');

    vi.advanceTimersByTime(PWA_INSTALL_DISMISSAL_MS + 1);

    await act(async () => {
      window.dispatchEvent(createInstallPromptEvent());
    });
    expect(container.textContent).toContain('Install this app for offline access');
  });
});
