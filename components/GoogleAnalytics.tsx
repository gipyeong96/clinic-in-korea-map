'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MEASUREMENT_ID = 'G-0TP3EDEP3R';
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !pathname || lastPath.current === pathname) return;
    const analytics = window as AnalyticsWindow;
    if (!analytics.gtag) return;
    const pageLocation = window.location.origin + pathname;
    let referrer = '';
    try {
      const url = new URL(document.referrer);
      referrer = url.origin;
    } catch {}
    analytics.gtag('set', {
      page_location: pageLocation,
      page_referrer: referrer,
      page_title: 'Korea Clinic Map',
    });
    analytics.gtag('event', 'page_view', {
      send_to: MEASUREMENT_ID,
      page_location: pageLocation,
      page_referrer: referrer,
      page_title: 'Korea Clinic Map',
    });
    lastPath.current = pathname;
  }, [pathname, ready]);

  return (
    <Script
      id="clinic-map-google-analytics"
      src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
      strategy="afterInteractive"
      onReady={() => {
        if (window.location.hostname !== 'map.clinicinkorea.com') return;
        const analytics = window as AnalyticsWindow;
        analytics.dataLayer = analytics.dataLayer || [];
        analytics.gtag = analytics.gtag || function () {
          analytics.dataLayer!.push(arguments);
        };
        analytics.gtag('js', new Date());
        analytics.gtag('config', MEASUREMENT_ID, {
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          page_location: window.location.origin + window.location.pathname,
          page_referrer: '',
          page_title: 'Korea Clinic Map',
        });
        setReady(true);
      }}
    />
  );
}
