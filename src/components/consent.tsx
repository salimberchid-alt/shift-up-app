"use client";

import { useEffect, useState } from "react";
import {
  GA_MEASUREMENT_ID,
  META_PIXEL_ID,
  readConsent,
  writeConsent,
  type Consent,
} from "@/lib/tracking";

/**
 * Consent banner for the Meta Pixel and Google Analytics.
 *
 * Quebec's Law 25 s.8.1 requires any technology that identifies, locates or
 * profiles a person to be deactivated by default, with the visitor told how
 * to turn it on. An ad pixel is exactly that, so it cannot ship behind a
 * dismiss-only notice: "Refuse" has to be as easy to reach as "Accept", and
 * refusing has to actually prevent the scripts from loading, which is why
 * <Analytics> renders nothing at all until this is granted.
 *
 * Nothing is shown when neither ID is configured. Asking permission to run
 * trackers that do not exist would be a dark pattern in reverse: it trains
 * people to click through a dialog that means nothing.
 */

const LANG_KEY = "shiftup-lang";

const COPY = {
  fr: {
    body: "On aimerait utiliser des témoins de mesure (Meta, Google) pour comprendre quelles annonces amènent de vraies inscriptions. Rien n'est activé sans ton accord.",
    accept: "Accepter",
    refuse: "Refuser",
    policy: "Politique de confidentialité",
  },
  en: {
    body: "We would like to use measurement cookies (Meta, Google) to understand which ads bring real signups. Nothing runs without your agreement.",
    accept: "Accept",
    refuse: "Refuse",
    policy: "Privacy policy",
  },
};

export function ConsentBanner() {
  // Rendering starts empty on both server and client, then fills in from
  // localStorage after mount. Reading storage during render would be a
  // hydration mismatch, and flashing the banner at someone who already
  // answered is its own small betrayal.
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    setConsent(readConsent());
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "fr" || saved === "en") setLang(saved);
    setReady(true);
  }, []);

  const configured = !!META_PIXEL_ID || !!GA_MEASUREMENT_ID;
  if (!configured || !ready || consent !== null) return null;

  const t = COPY[lang];
  const answer = (value: Consent) => {
    writeConsent(value);
    setConsent(value);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.policy}
      className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4 flex justify-center pointer-events-none"
    >
      <div className="glass-panel pointer-events-auto w-full max-w-[720px] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <p className="text-[12.5px] leading-relaxed text-white/75 flex-1 m-0">
          {t.body}{" "}
          <a href="/privacy" className="text-[--color-violet-text] font-semibold no-underline hover:underline">
            {t.policy}
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => answer("denied")}
            className="px-4 py-2.5 rounded-[11px] bg-white/[0.05] border-[1.5px] border-white/[0.12] text-white/70 text-[13px] font-bold cursor-pointer transition-colors hover:text-white"
          >
            {t.refuse}
          </button>
          <button
            type="button"
            onClick={() => answer("granted")}
            className="px-4 py-2.5 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-90"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
