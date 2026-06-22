'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { analyticsConfig } from '@/lib/analytics';

export function Analytics() {
  useEffect(() => {
    if (!analyticsConfig.baidu.enabled || typeof window === 'undefined') return;

    const analyticsWindow = window as Window & { _hmt?: unknown[] };
    analyticsWindow._hmt = analyticsWindow._hmt ?? [];

    if (document.querySelector(`script[src="${analyticsConfig.baidu.src}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = analyticsConfig.baidu.src;
    document.head.appendChild(script);
  }, []);

  if (!analyticsConfig.clarity.enabled) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${analyticsConfig.clarity.projectId}");
      `}
    </Script>
  );
}
