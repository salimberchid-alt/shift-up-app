"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang";

export function matchColor(score: number) {
  return score >= 85 ? "#06E5A8" : score >= 70 ? "#FFD166" : score >= 55 ? "#4EA8DE" : "#FF4D6D";
}

export function MatchRing({
  score,
  size = 44,
  stroke = 4,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const col = matchColor(score);
  return (
    <svg
      width={size}
      height={size}
      className="shrink-0 -rotate-90"
      role="img"
      aria-label={`${score}% match`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#232340" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fill: col,
          fontSize: size * 0.21,
          fontWeight: 800,
          transform: "rotate(90deg)",
          transformOrigin: "center",
        }}
      >
        {score}%
      </text>
    </svg>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export function PopIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
    >
      {children}
    </div>
  );
}

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="grad-violet-teal rounded-[10px] flex items-end justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(90,80,220,0.5)]"
      style={{ width: size, height: size, gap: size * 0.07, paddingBottom: size * 0.16 }}
    >
      <div className="rounded-[1px] bg-white/65" style={{ width: size * 0.11, height: size * 0.42 * 0.58 }} />
      <div className="rounded-[1px] bg-white/88" style={{ width: size * 0.11, height: size * 0.75 * 0.58 }} />
      <div className="rounded-[1px] bg-white" style={{ width: size * 0.11, height: size * 1.0 * 0.58 }} />
    </div>
  );
}

export function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <Link href="/" aria-label="ShiftUp - Home" className="flex items-center gap-2 no-underline">
      <BrandMark size={28} />
      <span className={`font-display font-extrabold grad-text ${className}`}>ShiftUp</span>
    </Link>
  );
}

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex bg-soft rounded-lg ${compact ? "p-0.5 gap-0.5" : "p-[3px] gap-[2px]"}`}
      role="group"
      aria-label="Language"
    >
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md border-none font-extrabold cursor-pointer transition-colors ${
            compact ? "px-2 py-[3px] text-[10px]" : "px-3 py-1 text-[11px]"
          } ${lang === l ? "bg-coral text-white" : "bg-transparent text-fog hover:text-cream"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
