import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JSON Toolkit',
    short_name: 'JSON Toolkit',
    description:
      'Format, convert, validate and decode JSON — all in the browser, no uploads.',
    start_url: '/zh',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#1f2937',
    categories: ['developer', 'utilities', 'productivity'],
    icons: [
      {
        src: '/pwa-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'JSON Formatter',
        short_name: 'Format',
        description: 'Format and validate JSON',
        url: '/zh/json-format',
        icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
      },
      {
        name: 'JSON Diff',
        short_name: 'Diff',
        description: 'Compare two JSON documents',
        url: '/zh/json-diff',
        icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
      },
      {
        name: 'JWT Parser',
        short_name: 'JWT',
        description: 'Decode and verify JWT tokens',
        url: '/zh/jwt',
        icons: [{ src: '/pwa-192.svg', sizes: '192x192' }],
      },
    ],
  };
}
