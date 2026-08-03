'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { shouldLoadGoogleAdSense } from '@/lib/ads/policy';

const GOOGLE_ADSENSE_CLIENT_ID = 'ca-pub-2234306257256278';
const GOOGLE_ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`;

export function GoogleAdSense() {
  const pathname = usePathname();
  const isEligible = shouldLoadGoogleAdSense(pathname);

  useEffect(() => {
    if (!isEligible) return;
    if (document.querySelector(`script[src="${GOOGLE_ADSENSE_SRC}"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = GOOGLE_ADSENSE_SRC;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [isEligible]);

  return null;
}
