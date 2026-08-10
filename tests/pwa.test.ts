import { describe, expect, it } from 'vitest';
import {
  PWA_INSTALL_DISMISSAL_MS,
  createPwaInstallDismissedUntil,
  isPwaInstallPromptDismissed,
} from '../lib/utils/pwa';

describe('PWA install prompt dismissal', () => {
  it('stores a dismissal for exactly two weeks', () => {
    const now = Date.UTC(2026, 7, 10);

    expect(createPwaInstallDismissedUntil(now)).toBe(
      now + PWA_INSTALL_DISMISSAL_MS
    );
  });

  it('keeps the prompt hidden until the stored deadline', () => {
    const now = 1_000;

    expect(isPwaInstallPromptDismissed('2000', now)).toBe(true);
    expect(isPwaInstallPromptDismissed('1000', now)).toBe(false);
    expect(isPwaInstallPromptDismissed('999', now)).toBe(false);
  });

  it('ignores missing or invalid stored values', () => {
    expect(isPwaInstallPromptDismissed(null, 1_000)).toBe(false);
    expect(isPwaInstallPromptDismissed('invalid', 1_000)).toBe(false);
  });
});
