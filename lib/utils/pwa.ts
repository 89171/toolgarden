export const PWA_INSTALL_DISMISSAL_MS = 14 * 24 * 60 * 60 * 1000;

export function createPwaInstallDismissedUntil(now = Date.now()) {
  return now + PWA_INSTALL_DISMISSAL_MS;
}

export function isPwaInstallPromptDismissed(
  storedDismissedUntil: string | null,
  now = Date.now()
) {
  if (storedDismissedUntil === null) return false;

  const dismissedUntil = Number(storedDismissedUntil);
  return Number.isFinite(dismissedUntil) && dismissedUntil > now;
}
