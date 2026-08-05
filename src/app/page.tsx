"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LangProvider, useLang } from "@/lib/lang";
import { BrandMark, FadeIn, LangToggle, PopIn } from "@/components/ui";
import { WaitlistSection } from "@/components/waitlist";
import type { Feature } from "@/lib/content";

const ACCENT_VAR: Record<Feature["accent"], string> = {
  "violet-text": "var(--color-violet-text)",
  leaf: "var(--color-leaf)",
  teal2: "var(--color-teal2)",
};

function Nav() {
  const { t } = useLang();
  return (
    <div className="fixed top-4 sm:top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-pill pointer-events-auto flex items-center gap-3 sm:gap-6 rounded-full pl-3 pr-2 sm:pl-4 sm:pr-2.5 py-2">
        <a href="/" aria-label="ShiftUp" className="flex items-center gap-2 no-underline shrink-0">
          <BrandMark size={28} />
          <span className="hidden sm:inline font-display font-bold text-[15px] tracking-[-0.2px] text-white">ShiftUp</span>
        </a>
        <div className="hidden md:flex items-center gap-5">
          <a href="#emplois" className="no-underline text-white/70 font-semibold text-[13px] hover:text-white transition-colors">
            {t.nav.emplois}
          </a>
          <a href="#talents" className="no-underline text-white/70 font-semibold text-[13px] hover:text-white transition-colors">
            {t.nav.talents}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle compact />
          <a
            href="#waitlist"
            className="px-4 py-2 rounded-full grad-violet text-white text-[13px] font-bold no-underline whitespace-nowrap transition-opacity hover:opacity-90"
          >
            {t.nav.cta}
          </a>
        </div>
      </nav>
    </div>
  );
}

function useActiveFeature(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const idsKey = ids.join(",");

  useEffect(() => {
    const els = idsKey.split(",").map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [idsKey]);

  return active;
}

function PhoneImage({ src, alt, onRatio }: { src: string; alt: string; onRatio: (r: number) => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [src]);

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      // Matches the widest rendered frame. Undersizing this was making Next
      // serve a 384w file into a frame that is now larger, which is a good
      // part of why the app UI in the shot read as mush.
      sizes="(min-width: 640px) 340px, 290px"
      className="object-contain"
      style={{ opacity: shown ? 1 : 0, transition: "opacity 0.5s ease" }}
      priority
      onLoad={(e) => {
        const t = e.currentTarget;
        if (t.naturalWidth && t.naturalHeight) onRatio(t.naturalWidth / t.naturalHeight);
      }}
    />
  );
}

function PhoneMockup({
  img,
  alt,
  badge,
  glow,
}: {
  img: string;
  alt: string;
  badge?: { label: string; color: string } | null;
  /** Accent of the feature currently in view; tints the halo behind the device. */
  glow?: string;
}) {
  // Real device aspect ratio (~0.462) as a sane default until the actual
  // image loads and reports its own — the two screenshots in rotation
  // don't share one ratio, so the frame has to follow whichever is shown
  // instead of forcing a fixed box (which left dead letterbox gaps).
  const [ratio, setRatio] = useState(0.462);

  return (
    <div className="relative">
      {/* Halo behind the device. The mockup sits on a near-black section, so
          without something behind it the phone reads as a hole in the page
          rather than an object on it. Tinted by the feature in view, which
          also makes the sticky column visibly respond to scrolling. */}
      <div
        aria-hidden
        className="absolute -inset-10 rounded-[80px] pointer-events-none transition-colors duration-700"
        style={{
          // color-mix, not an appended alpha hex: `glow` arrives as a CSS
          // custom-property reference (var(--color-leaf)), and "var(...)22"
          // is not a colour.
          background: `radial-gradient(closest-side, color-mix(in srgb, ${glow ?? "var(--color-violet)"} 22%, transparent), transparent 78%)`,
          filter: "blur(6px)",
        }}
      />
      {/* On desktop the device is sized by HEIGHT, not width: the column is
          sticky, so a phone taller than the viewport gets its top silently
          clipped and the badge ends up floating away from a frame nobody can
          see. Height comes from the viewport with a cap, and width follows
          from aspect-ratio, so it fits any laptop. Mobile keeps width-based
          sizing since nothing is sticky there. */}
      <div
        className="glass-bezel relative w-[290px] sm:w-[340px] lg:w-auto lg:h-[min(700px,calc(100vh-15rem))] rounded-[54px] p-[11px]"
        style={{
          aspectRatio: String(ratio),
          transition: "aspect-ratio 0.45s ease",
          animation: "floatSlow 7s ease-in-out infinite",
        }}
      >
        {/* Side buttons. They sit on the bezel, never over the screen, so the
            frame reads as a device without covering a pixel of the app. The
            previous version was a plain rounded rectangle, which at this size
            looked like a dark slab rather than a phone. */}
        <span aria-hidden className="absolute -left-[2.5px] top-[22%] h-8 w-[3px] rounded-l-full bg-white/25" />
        <span aria-hidden className="absolute -left-[2.5px] top-[32%] h-12 w-[3px] rounded-l-full bg-white/20" />
        <span aria-hidden className="absolute -right-[2.5px] top-[27%] h-16 w-[3px] rounded-r-full bg-white/25" />

        <div className="relative w-full h-full rounded-[44px] overflow-hidden bg-[#16131f]">
          <PhoneImage src={img} alt={alt} onRatio={setRatio} />
          {/* Screen glass: a single diagonal sheen. Kept under 8% so it never
              fights the UI underneath, which is the whole point of the shot. */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none rounded-[44px]"
            style={{
              background: "linear-gradient(122deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 38%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
            }}
          />
        </div>
        {/* The positioning and the glass surface have to be on separate
            elements. `.glass-pill` in globals.css sets position:relative as
            plain CSS, which outranks Tailwind's `absolute` utility, so
            "glass-pill absolute" silently produced a relatively positioned
            box: the badge laid out in flow under the phone, stretched to the
            bezel's full content width, sitting on top of the caption. */}
        {badge && (
          <PopIn key={badge.label} className="absolute -right-3 sm:-right-7 top-9 z-10">
            <span className="glass-pill block px-3.5 py-2 rounded-full whitespace-nowrap">
              <span className="text-[11.5px] font-bold tracking-[0.3px]" style={{ color: badge.color }}>
                {badge.label}
              </span>
            </span>
          </PopIn>
        )}
      </div>
    </div>
  );
}

function FeatureCopy({ feature, isActive }: { feature: Feature; isActive: boolean }) {
  const accentVar = ACCENT_VAR[feature.accent];
  return (
    // The trailing padding is a balance, not a cleanup. Cutting it to zero
    // removed the black void under the last feature but also shortened the
    // sticky track next to it, so the phone released early and scrolled off
    // half-clipped while its copy was still on screen. 10vh keeps the device
    // anchored to the end of the copy without leaving a hole.
    <div id={feature.id} className="lg:min-h-[38vh] flex flex-col justify-center py-10 lg:py-0 lg:pb-[15vh] lg:last:pb-[20vh]">
      <FadeIn className="text-center lg:text-left">
        <div
          className="font-bold text-[13px] tracking-[0.8px] uppercase mb-3.5 transition-opacity duration-300"
          style={{ color: accentVar, opacity: isActive ? 1 : 0.6 }}
        >
          {feature.eyebrow}
        </div>
        <h2 className="font-display font-bold text-[clamp(24px,3.5vw,32px)] leading-[1.2] text-white mb-4">{feature.title}</h2>
        <p className="text-[15.5px] leading-relaxed text-white/68 mb-3.5">{feature.body}</p>
        {"body2" in feature && feature.body2 && <p className="text-[15.5px] leading-relaxed text-white/68">{feature.body2}</p>}
        {"cta" in feature && feature.cta && (
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3.5 rounded-[14px] grad-amber no-underline text-[#231506] font-bold text-[14.5px] shadow-[0_10px_22px_-6px_rgba(240,150,60,0.5)]"
          >
            {feature.cta}
          </a>
        )}
      </FadeIn>
    </div>
  );
}

function ShowcaseSection() {
  const { t } = useLang();
  const ids = t.features.map((f) => f.id);
  const active = useActiveFeature(ids);
  const activeFeature = t.features.find((f) => f.id === active) ?? null;
  const img = activeFeature ? activeFeature.img : t.features[0].img;
  const badge = activeFeature ? { label: activeFeature.eyebrow, color: ACCENT_VAR[activeFeature.accent] } : null;

  return (
    <section className="relative max-w-[1280px] mx-auto px-6 sm:px-12 pt-28 sm:pt-36 pb-10 sm:pb-14">
      <div
        aria-hidden
        className="absolute w-[400px] h-[400px] sm:w-[520px] sm:h-[520px] rounded-full -top-10 sm:-top-16 -left-24 sm:-left-36 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,92,255,0.28), transparent 72%)" }}
      />
      <div
        aria-hidden
        className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full top-[55%] -right-16 sm:-right-24 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(70,180,220,0.22), transparent 72%)" }}
      />

      <div className="relative lg:flex gap-14 xl:gap-20">
        <div className="flex-1 max-w-[560px] mx-auto lg:mx-0">
          {/* Was pb-[26vh]. On a 900px viewport that is 234px of nothing
              between the stats and the first feature, which on desktop left
              the left column empty while the phone floated alone on the
              right. The scroll-spy still has room to switch at 15vh. */}
          <FadeIn className="text-center lg:text-left pb-14 sm:pb-16 lg:pb-[15vh]">
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-[#8B7CFF]/[0.14] border border-[#8B7CFF]/30 text-[--color-violet-text] text-[12.5px] font-bold tracking-[0.3px] mb-5">
              {t.hero.eyebrow}
            </div>
            <h1 className="font-display font-bold text-[clamp(34px,5.5vw,52px)] leading-[1.06] tracking-[-1.5px] text-white mb-5 whitespace-pre-line">
              {t.hero.headline}
            </h1>
            <p className="text-[17px] leading-relaxed text-white/68 mb-8 max-w-[460px] mx-auto lg:mx-0">{t.hero.sub}</p>
            <div className="flex gap-3.5 flex-wrap justify-center lg:justify-start">
              <a
                href="#waitlist"
                className="px-6 py-3.5 rounded-[14px] no-underline text-white font-bold text-[15px] shadow-[0_12px_24px_-6px_rgba(0,0,0,0.5)]"
                style={{ background: "linear-gradient(135deg,#3a3a4a,#16161e 70%)" }}
              >
                {t.hero.cta1}
              </a>
              <a href="#waitlist" className="glass-pill px-6 py-3.5 rounded-[14px] text-white font-bold text-[15px] no-underline">
                {t.hero.cta2}
              </a>
            </div>
            <div className="flex gap-7 mt-11 justify-center lg:justify-start">
              <div>
                <div className="font-bold text-xl text-[--color-leaf]">{t.hero.stat1.label}</div>
                <div className="text-[12.5px] text-white/55 mt-0.5">{t.hero.stat1.sub}</div>
              </div>
              <div>
                <div className="font-bold text-xl text-[--color-violet-text]">{t.hero.stat2.label}</div>
                <div className="text-[12.5px] text-white/55 mt-0.5">{t.hero.stat2.sub}</div>
              </div>
              <div>
                <div className="font-bold text-xl text-[#7CC9FF]">{t.hero.stat3.label}</div>
                <div className="text-[12.5px] text-white/55 mt-0.5">{t.hero.stat3.sub}</div>
              </div>
            </div>
          </FadeIn>

          <div className="lg:hidden flex justify-center mb-14">
            <PhoneMockup img={t.features[0].img} alt={t.demo.label} badge={null} />
          </div>

          {t.features.map((feature) => (
            <FeatureCopy key={feature.id} feature={feature} isActive={active === feature.id} />
          ))}
        </div>

        <div className="hidden lg:block w-[340px] xl:w-[360px] shrink-0">
          <div className="sticky top-20 flex flex-col items-center gap-4">
            {/* Was faint 12px text at 45% opacity, effectively invisible on
                black. "A real screenshot, not a mockup" is a trust claim and
                worth reading. */}
            <div className="glass-pill px-3.5 py-1.5 rounded-full text-[10.5px] font-bold text-white/75 tracking-[1.2px] uppercase">
              📱 {t.demo.label}
            </div>
            <PhoneMockup
              img={img}
              alt={activeFeature?.alt ?? t.demo.label}
              badge={badge}
              glow={activeFeature ? ACCENT_VAR[activeFeature.accent] : undefined}
            />
            <div className="text-[11.5px] text-white/50 mt-2 text-center">{t.demo.sub}</div>
            <div className="glass-pill flex items-center gap-2 px-3 py-2.5 rounded-full">
              {t.features.map((f) => (
                <span
                  key={f.id}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: active === f.id ? 18 : 8,
                    background: active === f.id ? ACCENT_VAR[f.accent] : "rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  const { t } = useLang();
  return (
    <section className="max-w-[1280px] mx-auto px-6 sm:px-12 mb-24 sm:mb-[100px]">
      <FadeIn>
        <div className="glass-panel relative overflow-hidden rounded-[32px] px-6 sm:px-12 py-14 sm:py-16 text-center">
          <h2 className="font-display font-bold text-[clamp(24px,3.5vw,30px)] text-white mb-3.5">{t.ctaBanner.title}</h2>
          <p className="text-[15.5px] text-white/68 mb-7">{t.ctaBanner.sub}</p>
          <a
            href="#waitlist"
            className="inline-block px-8 py-4 rounded-[14px] grad-violet no-underline text-white font-bold text-[15.5px] shadow-[0_14px_28px_-8px_rgba(90,80,220,0.5)]"
          >
            {t.ctaBanner.cta}
          </a>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-white/[0.08] px-6 sm:px-12 py-9">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-2 text-center">
        <div className="text-[12.5px] font-semibold text-white/40">{t.footer.tagline}</div>
        <div className="flex items-center gap-4 flex-wrap justify-center mt-1">
          <a href="#waitlist" className="text-xs text-white/40 no-underline font-semibold hover:text-white/70 transition-colors">
            {t.footer.contact}
          </a>
          <a href="/privacy" className="text-xs text-white/40 no-underline font-semibold hover:text-white/70 transition-colors">
            {t.footer.privacy}
          </a>
          <a href="/terms" className="text-xs text-white/40 no-underline font-semibold hover:text-white/70 transition-colors">
            {t.footer.terms}
          </a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="bg-[#0a0810] text-white min-h-screen overflow-x-clip">
      <style>{`@keyframes floatSlow { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }`}</style>
      <Nav />
      <ShowcaseSection />
      <CTABanner />
      <WaitlistSection />
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <LangProvider>
      <Landing />
    </LangProvider>
  );
}
