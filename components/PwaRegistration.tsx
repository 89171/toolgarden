'use client';
import { useEffect } from 'react';

/**
 * 注册 Service Worker。
 * 放在 app/[locale]/layout.tsx 里，仅在客户端执行。
 */
export function PwaRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

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
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
