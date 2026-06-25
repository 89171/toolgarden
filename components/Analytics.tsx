'use client';

import { Fragment, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { analyticsConfig } from '@/lib/analytics';

export function Analytics() {
  const pathname = usePathname();
  const isFirstPageView = useRef(true);
  const googleMeasurementId = analyticsConfig.google.measurementId;
  const googleEnabled = analyticsConfig.google.enabled && googleMeasurementId.length > 0;

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

  useEffect(() => {
    if (!googleEnabled || typeof window === 'undefined') return;

    if (isFirstPageView.current) {
      isFirstPageView.current = false;
      return;
    }

    const analyticsWindow = window as Window & {
      gtag?: (...args: unknown[]) => void;
    };

    analyticsWindow.gtag?.('config', googleMeasurementId, {
      page_path: `${pathname}${window.location.search}`,
    });
  }, [googleEnabled, googleMeasurementId, pathname]);

  return (
    <Fragment>
      {googleEnabled ? (
        <Fragment>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleMeasurementId)}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(googleMeasurementId)});
            `}
          </Script>
        </Fragment>
      ) : null}

      {analyticsConfig.clarity.enabled ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${analyticsConfig.clarity.projectId}");
          `}
        </Script>
      ) : null}
    </Fragment>
  );
}
