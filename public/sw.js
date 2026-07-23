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

const CACHE_NAME = 'json-toolkit-v4';
const NO_CACHE_WRITE = Promise.resolve();

/**
 * Clone cacheable responses before returning the original response to the
 * browser. Deferring Response.clone() until after caches.open() resolves can
 * race with the browser consuming the original body.
 */
function fetchWithCacheWrite(request, shouldCache) {
  return fetch(request).then((response) => {
    const responseForCache = shouldCache(response) ? response.clone() : null;
    const cacheWrite = responseForCache
      ? caches.open(CACHE_NAME).then((cache) => cache.put(request, responseForCache))
      : NO_CACHE_WRITE;

    return { response, cacheWrite };
  });
}

function respondAndKeepCacheWriteAlive(event, task, fallback) {
  event.respondWith(
    task
      .then(({ response }) => response)
      .catch(fallback)
  );
  event.waitUntil(
    task
      .then(({ cacheWrite }) => cacheWrite)
      .catch(() => undefined)
  );
}

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
    const task = caches.match(request).then((cached) => {
      if (cached) return { response: cached, cacheWrite: NO_CACHE_WRITE };
      return fetchWithCacheWrite(request, (response) => response.ok);
    });
    respondAndKeepCacheWriteAlive(
      event,
      task,
      () => new Response('Asset unavailable', { status: 503 })
    );
    return;
  }

  // ── Cache-First：按需下载的大型模型、编解码器与 Worker ─────
  if (
    url.pathname.startsWith('/models/') ||
    url.pathname.startsWith('/vendor/') ||
    url.pathname.startsWith('/workers/')
  ) {
    const task = caches.match(request).then((cached) => {
      if (cached) return { response: cached, cacheWrite: NO_CACHE_WRITE };
      return fetchWithCacheWrite(request, (response) => response.ok);
    });
    respondAndKeepCacheWriteAlive(
      event,
      task,
      () => new Response('Tool asset unavailable', { status: 503 })
    );
    return;
  }

  // ── Cache-First：SVG 图标 / manifest ────────────────────────
  if (
    url.pathname.startsWith('/pwa-') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/favicon.ico'
  ) {
    const task = caches.match(request).then((cached) => {
      if (cached) return { response: cached, cacheWrite: NO_CACHE_WRITE };
      return fetchWithCacheWrite(request, (response) => response.ok);
    });
    respondAndKeepCacheWriteAlive(
      event,
      task,
      () => new Response('Asset unavailable', { status: 503 })
    );
    return;
  }

  // ── Network-First：页面 + 其余 ──────────────────────────────
  const task = fetchWithCacheWrite(
    request,
    (response) =>
      response.ok && response.headers.get('content-type')?.includes('text/html') === true
  );
  respondAndKeepCacheWriteAlive(
    event,
    task,
    () =>
      // 网络失败：降级到缓存，或返回离线工具首页
      caches.match(request).then(
        (cached) => cached ?? caches.match('/en') ?? new Response('Offline', { status: 503 })
      )
  );
});
