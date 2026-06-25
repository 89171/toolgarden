const DEFAULT_GOOGLE_MEASUREMENT_ID = 'G-GC4DZ2RC1T';

const googleMeasurementId = (
  process.env.NEXT_PUBLIC_GA_ID ??
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ??
  DEFAULT_GOOGLE_MEASUREMENT_ID
).trim();

export const analyticsConfig = {
  google: {
    enabled: googleMeasurementId.length > 0,
    measurementId: googleMeasurementId,
  },
  baidu: {
    enabled: true,
    src: 'https://hm.baidu.com/hm.js?5be1525f39fce73b1675c77d59171dad',
  },
  clarity: {
    enabled: true,
    projectId: 'xax8e8j9r4',
  },
} as const;
