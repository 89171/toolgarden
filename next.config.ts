import type { NextConfig } from 'next';
import path from 'path';
import securityHeaders from './lib/security/static-headers.json';

const nextIntlRequestConfig = './i18n/request.ts';
/**
 * PaddleOCR.js bundles its own ORT 1.24.3 into dist/assets/worker-entry-*.js and
 * loads it at runtime as `new URL('ort.bundle.min.mjs', import.meta.url)`. That
 * bare filename is not resolvable, so it is aliased to a vendored 1.24.3 build
 * matching the WASM served from public/models/paddleocr/onnxruntime-web/.
 *
 * 不要为裸 specifier `onnxruntime-web`加同样的别名。那条别名是全局的，会把
 * `@imgly/background-removal` 的 CPU 分支（`await import('onnxruntime-web')`）
 * 也换成 1.24.3；而 imgly 的 WASM 来自它自己的 CDN（background-removal-data），
 * 版本更旧，于是 session 创建时报 `_OrtGetInputOutputMetadata is not a function`，
 * 图片去背景整个工具不可用。裸 specifier 必须解析到 package.json 里装的版本。
 */
const paddleOcrOrtExternal = './lib/vendor/onnxruntime-web/ort.wasm.min.mjs';
const emptyModule = './lib/shims/empty-module.ts';
const sharedSecurityHeaders = securityHeaders as Array<{ key: string; value: string }>;

/**
 * Dev headers minus the CSP.
 *
 * The shared policy uses `'strict-dynamic'`, which disables host-based
 * allowlisting — `'self'` stops applying and only nonce/hash-tagged scripts
 * load. A static export cannot mint per-request nonces, so under that policy
 * every first-party bundle (including Turbopack's HMR client) is blocked and
 * no client component ever hydrates, which makes the dev server useless for
 * testing interactive tools. Production is unaffected: it serves headers from
 * out/_headers, not from here.
 */
const developmentHeaders = sharedSecurityHeaders.filter(
  (header) => header.key !== 'Content-Security-Policy',
);

// Static exports cannot apply Next.js response headers. Production headers are
// emitted as out/_headers by scripts/harden-static-export.mjs instead, while
// the development server receives the same policy minus the CSP (see above).
const developmentHeaderConfig = process.env.NODE_ENV === 'production'
  ? {}
  : {
  // Service Worker 需要能控制所有路径（包括 /zh/, /en/ 等）
      async headers() {
        return [
          {
            source: '/:path*',
            headers: developmentHeaders,
          },
          {
            source: '/sw.js',
            headers: [
              ...developmentHeaders,
              { key: 'Service-Worker-Allowed', value: '/' },
              { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
            ],
          },
          {
            source: '/manifest.webmanifest',
            headers: [
              ...developmentHeaders,
              { key: 'Cache-Control', value: 'public, max-age=86400' },
            ],
          },
        ];
      },
    };

const nextConfig: NextConfig = {
  ...developmentHeaderConfig,
  turbopack: {
    resolveAlias: {
      'next-intl/config': nextIntlRequestConfig,
      fs: emptyModule,
      'ort.bundle.min.mjs': paddleOcrOrtExternal,
    },
  },
  webpack(config) {
    config.resolve.conditionNames = [
      'onnxruntime-web-use-extern-wasm',
      ...(config.resolve.conditionNames || []),
    ];
    config.resolve.alias['next-intl/config'] = path.resolve(
      config.context,
      nextIntlRequestConfig,
    );
    config.resolve.alias['ort.bundle.min.mjs'] = path.resolve(
      config.context,
      paddleOcrOrtExternal,
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // 生产仍生成纯静态站点；开发模式保留 Next 的正常 404 行为和中间件支持，
  // 避免无 locale 路径被静态导出的参数检查提前变成 500。
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
};

export default nextConfig;
