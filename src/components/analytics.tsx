"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  GA_MEASUREMENT_ID,
  META_PIXEL_ID,
  onConsentChange,
  readConsent,
  type Consent,
} from "@/lib/tracking";

/**
 * Reads the stored consent and re-renders when it changes, so accepting the
 * banner loads the scripts immediately instead of on the next page view.
 * Starts null on the server and on first paint because localStorage does not
 * exist during SSR, and rendering a different tree on the client than the
 * server would be a hydration mismatch.
 */
function useConsent(): Consent | null {
  const [consent, setConsent] = useState<Consent | null>(null);
  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    return onConsentChange(sync);
  }, []);
  return consent;
}

/**
 * Meta Pixel and Google Analytics 4.
 *
 * Both are `afterInteractive`: they are not needed to render the page and
 * must not compete with it for the main thread, but they do need to run
 * without waiting for idle, or a visitor who converts in the first few
 * seconds is never counted.
 *
 * Neither renders unless its ID is configured AND the visitor has granted
 * consent, so on a build with no keys this component outputs nothing at all.
 */
export function Analytics() {
  const consent = useConsent();
  if (consent !== "granted") return null;

  return (
    <>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            id="ga-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          {/* The pixel's own fallback for visitors running a script blocker.
              Next's Image component is wrong here: this is a 1x1 beacon, not
              an image, and it must not be optimised, lazy-loaded or proxied. */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
