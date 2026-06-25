/**
 * JSON Toolkit — Service Worker
 *
 * 策略：
 *  /_next/static/   → Cache-First（内容哈希命名，可永久缓存）
 *  /pwa-*.svg       → Cache-First（图标静态资源）
 *  /(zh|en)/...     → Network-First，网络失败时降级到缓存
 *  其余 GET          → Network-First
 *
 * 版本号更新 CACHE_NAME 即可清除旧缓存。
 */

const CACHE_NAME = 'json-toolkit-v2';

// ── 安装：立即激活 ─────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── 激活：清理旧缓存 ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 仅处理同源 GET
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 跳过 Next.js HMR / webpack hot reload
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_next/data/development')
  ) return;

  // ── Cache-First：Next.js 静态资源（内容哈希，永不过期）──────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Cache-First：SVG 图标 / manifest ────────────────────────
  if (
    url.pathname.startsWith('/pwa-') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/favicon.ico'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Network-First：页面 + 其余 ──────────────────────────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 仅缓存成功的 HTML 页面
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() =>
        // 网络失败：降级到缓存，或返回离线工具首页
        caches.match(request).then(
          (cached) => cached ?? caches.match('/en') ?? new Response('Offline', { status: 503 })
        )
      )
  );
});
