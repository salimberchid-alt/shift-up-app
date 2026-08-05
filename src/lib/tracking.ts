"use client";

/**
 * Conversion tracking for Meta and Google.
 *
 * Why this exists: shift-up.app had no ad-platform tracking at all, only
 * Vercel Analytics, which reports traffic to us and nothing to anybody else.
 * Meta and Google both optimise a campaign by learning which impressions led
 * to a conversion, so without a conversion signal fed back to them, every
 * dollar is spent on clicks chosen at random. This wires the two signals they
 * need.
 *
 * Three deliberate constraints:
 *
 * 1. Dormant until keyed. Nothing loads unless NEXT_PUBLIC_META_PIXEL_ID or
 *    NEXT_PUBLIC_GA_MEASUREMENT_ID is set at build time, matching how the
 *    Expo app treats POSTHOG_KEY. Shipping this does not start tracking
 *    anybody.
 *
 * 2. Consent-gated. Quebec's Law 25 s.8.1 requires technology that profiles a
 *    person to be off by default, so the scripts mount only after an explicit
 *    grant and the server route refuses anything without one. This is not
 *    optional politeness: the audience is Montreal.
 *
 * 3. Every browser event carries an eventId that is also sent to the
 *    Conversions API, so Meta can deduplicate the pair. Without it, a
 *    conversion sent both ways counts twice and the reported cost per lead is
 *    half the real one, which is worse than not measuring at all.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export type Consent = "granted" | "denied";

const CONSENT_KEY = "shiftup-consent";
/** Fired on the same tab that changed the value; `storage` only reaches other tabs. */
const CONSENT_EVENT = "shiftup-consent-change";

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function writeConsent(consent: Consent): void {
  window.localStorage.setItem(CONSENT_KEY, consent);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Subscribe to consent changes. Returns an unsubscribe function. */
export function onConsentChange(fn: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(CONSENT_EVENT, fn);
    window.removeEventListener("storage", fn);
  };
}

/**
 * The conversions this site can actually produce today. Kept to events with a
 * real call site: a declared event nobody fires is indistinguishable in a
 * dashboard from a step nobody reaches. Add the store-badge click here once
 * the app is live and the badges replace the #waitlist anchors.
 */
export type ConversionEvent = "waitlist_lead";

/** Our name -> the platforms' names. Meta only optimises against its own standard events. */
const EVENT_MAP: Record<ConversionEvent, { meta: string; ga: string }> = {
  waitlist_lead: { meta: "Lead", ga: "generate_lead" },
};

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Fires one conversion to the Meta pixel, GA4, and the Conversions API.
 *
 * `email` is sent to our own route, never to the browser SDKs, because the
 * route hashes it before it reaches Meta. Doing the hash server-side keeps a
 * crypto dependency out of the bundle and keeps the plaintext address on
 * infrastructure we control.
 */
export function trackConversion(event: ConversionEvent, opts?: { email?: string; params?: Params }): void {
  if (typeof window === "undefined" || readConsent() !== "granted") return;

  const names = EVENT_MAP[event];
  const eventId = newEventId();
  const params = opts?.params ?? {};

  window.fbq?.("track", names.meta, params, { eventID: eventId });
  window.gtag?.("event", names.ga, params);

  // Server-side half of the pair. Deliberately not awaited: a blocked or
  // failed ad-network call must never hold up the form the user is filling.
  // keepalive so it still goes out if the page navigates immediately after.
  void fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      eventId,
      eventSourceUrl: window.location.href,
      email: opts?.email,
      params,
    }),
  }).catch(() => {
    // Nothing to do and nothing to tell the user: the pixel above already
    // reported this conversion, the server call is the redundancy.
  });
}
