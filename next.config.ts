import type { NextConfig } from 'next';
import path from 'path';

const nextIntlRequestConfig = './i18n/request.ts';

const nextConfig: NextConfig = {
  // Service Worker 需要能控制所有路径（包括 /zh/, /en/ 等）
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
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
  output: "export",
};

export default nextConfig;
