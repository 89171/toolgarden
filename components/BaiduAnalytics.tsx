'use client';

import { useEffect } from 'react';

const BAIDU_ANALYTICS_SRC = 'https://hm.baidu.com/hm.js?9e0cbce65058e42d6f5c7eef84806a46';

export function BaiduAnalytics() {
  useEffect(() => {
    const analyticsWindow = window as Window & { _hmt?: unknown[] };
    analyticsWindow._hmt = analyticsWindow._hmt ?? [];

    if (document.querySelector(`script[src="${BAIDU_ANALYTICS_SRC}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = BAIDU_ANALYTICS_SRC;
    document.head.appendChild(script);
  }, []);

  return null;
}
