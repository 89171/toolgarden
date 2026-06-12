import type { NextConfig } from 'next';
import path from 'path';

const nextIntlRequestConfig = './i18n/request.ts';

const nextConfig: NextConfig = {
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
};

export default nextConfig;
