'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import {
  createPwaInstallDismissedUntil,
  isPwaInstallPromptDismissed,
} from '@/lib/utils/pwa';

const PWA_INSTALL_DISMISSAL_KEY = 'toolgarden:pwa-install-dismissed-until';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

function isRunningAsInstalledApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

function hasActiveInstallDismissal() {
  try {
    return isPwaInstallPromptDismissed(
      window.localStorage.getItem(PWA_INSTALL_DISMISSAL_KEY)
    );
  } catch {
    return false;
  }
}

/**
 * 注册 Service Worker，并在浏览器确认可安装后提供自定义安装入口。
 * 放在页面的 NextIntlClientProvider 里，仅在客户端执行。
 *
 * 只在生产环境注册。开发环境注册会造成很难察觉的故障：
 * sw.js 对 /_next/static/ 用 Cache-First，而它的新鲜度完全依赖 CACHE_NAME 上的
 * 构建指纹——那个指纹是 scripts/harden-static-export.mjs 在生产构建时写入的，
 * 开发环境下 CACHE_NAME 恒为常量。同时 Turbopack 在 dev 下的资源 URL 跨重建保持稳定
 * （例如 CSS 始终是 app_globals_<id>.css）。三者叠加的结果是：
 * 开发时第一次抓到的 CSS / JS 会被永久钉在缓存里，之后改样式在这个浏览器上完全不生效，
 * 而没注册过 SW 的另一个浏览器却是正常的——很容易被误判成浏览器兼容性问题。
 *
 * 已经在开发环境注册过的浏览器需要手动清理一次：
 * DevTools → Application → Service Workers → Unregister，并清空 Cache Storage。
 */
export function PwaRegistration() {
  const t = useTranslations('pwa_install');
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (isRunningAsInstalledApp() || hasActiveInstallDismissal()) return;

      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return () => {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // 新版本可用时，可以在这里提示用户刷新
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.info('[PWA] New version available. Refresh to update.');
            }
          });
        });
      } catch (err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      }
    };

    // 页面加载完成后再注册，不阻塞首次渲染
    const shouldWaitForLoad = document.readyState !== 'complete';

    if (shouldWaitForLoad) {
      window.addEventListener('load', register, { once: true });
    } else {
      void register();
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);

      if (shouldWaitForLoad) {
        window.removeEventListener('load', register);
      }
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    const promptEvent = installPrompt;
    setInstallPrompt(null);

    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (error) {
      console.warn('[PWA] Install prompt failed:', error);
    }
  }

  function dismissInstallPrompt() {
    try {
      window.localStorage.setItem(
        PWA_INSTALL_DISMISSAL_KEY,
        String(createPwaInstallDismissedUntil())
      );
    } catch {
      // Storage may be unavailable in private or restricted browsing contexts.
    }

    setInstallPrompt(null);
  }

  if (!installPrompt) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 items-center gap-2 rounded-lg border border-border-base bg-surface-raised p-2.5 shadow-xl sm:bottom-6 sm:w-auto sm:min-w-md sm:gap-3"
    >
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-content-secondary">
        {t('message')}
      </p>
      <Button type="button" size="sm" onClick={installApp}>
        {t('install')}
      </Button>
      <button
        type="button"
        aria-label={t('close')}
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-content transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
        onClick={dismissInstallPrompt}
      >
        <span aria-hidden="true" className="text-base font-semibold leading-none">
          X
        </span>
      </button>
    </aside>
  );
}
