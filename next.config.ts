import type { NextConfig } from 'next';
import path from 'path';
import securityHeaders from './lib/security/static-headers.json';

const nextIntlRequestConfig = './i18n/request.ts';
const onnxRuntimeWasmEntry = 'onnxruntime-web/wasm';
const sharedSecurityHeaders = securityHeaders as Array<{ key: string; value: string }>;

// Static exports cannot apply Next.js response headers. Production headers are
// emitted as out/_headers by scripts/harden-static-export.mjs instead, while
// the development server still receives the same policy here.
const developmentHeaderConfig = process.env.NODE_ENV === 'production'
  ? {}
  : {
  // Service Worker 需要能控制所有路径（包括 /zh/, /en/ 等）
      async headers() {
        return [
          {
            source: '/:path*',
            headers: sharedSecurityHeaders,
          },
          {
            source: '/sw.js',
            headers: [
              ...sharedSecurityHeaders,
              { key: 'Service-Worker-Allowed', value: '/' },
              { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
            ],
          },
          {
            source: '/manifest.webmanifest',
            headers: [
              ...sharedSecurityHeaders,
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
      'onnxruntime-web/webgpu': onnxRuntimeWasmEntry,
    },
  },
  webpack(config) {
    config.resolve.alias['next-intl/config'] = path.resolve(
      config.context,
      nextIntlRequestConfig,
    );
    config.resolve.alias['onnxruntime-web/webgpu$'] = onnxRuntimeWasmEntry;

    return config;
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  output: "export",
};

export default nextConfig;
