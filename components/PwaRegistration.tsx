'use client';
import { useEffect } from 'react';

/**
 * 注册 Service Worker。
 * 放在 app/[locale]/layout.tsx 里，仅在客户端执行。
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
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
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
