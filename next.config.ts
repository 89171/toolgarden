import type { NextConfig } from 'next';
import path from 'path';
import securityHeaders from './lib/security/static-headers.json';

const nextIntlRequestConfig = './i18n/request.ts';
const sharedSecurityHeaders = securityHeaders as Array<{ key: string; value: string }>;

const nextConfig: NextConfig = {
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
  turbopack: {
    resolveAlias: {
      'next-intl/config': nextIntlRequestConfig,
    },
  },
  webpack(config) {
    config.resolve.alias['next-intl/config'] = path.resolve(
      config.context,
      nextIntlRequestConfig,
    );

    return config;
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  output: "export",
};

export default nextConfig;
