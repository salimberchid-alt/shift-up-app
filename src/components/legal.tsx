"use client";

import { LangProvider, useLang } from "@/lib/lang";
import { LangToggle, Wordmark } from "./ui";

export interface LegalSection {
  title: string;
  body: string;
}

interface LegalCopy {
  badge: string;
  title: string;
  updated: string;
  sections: LegalSection[];
  questions: string;
  backHome: string;
  crossLinkHref: string;
  crossLinkLabel: string;
}

function LegalBody({ copy }: { copy: Record<"fr" | "en", LegalCopy> }) {
  const { lang } = useLang();
  const c = copy[lang];
  return (
    <div className="bg-ink text-cream min-h-screen">
      <nav className="sticky top-0 z-40 bg-ink/90 backdrop-blur-xl border-b border-line px-6 py-3.5 flex items-center justify-between">
        <a href="/" className="no-underline">
          <Wordmark className="text-lg" />
        </a>
        <LangToggle compact />
      </nav>
      <div className="max-w-[760px] mx-auto px-6 pt-16 pb-20">
        <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/35 rounded-full px-3.5 py-1.5 text-[11px] font-bold text-coral mb-6">
          {c.badge}
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-extrabold text-cream tracking-tight leading-tight mb-3">
          {c.title}
        </h1>
        <p className="text-[13px] text-fog mb-12">{c.updated}</p>

        {c.sections.map((s) => (
          <section key={s.title} className="mb-9">
            <h2 className="font-display text-lg font-extrabold text-cream mb-2.5">{s.title}</h2>
            <p className="text-sm text-fog leading-[1.8]">{s.body}</p>
          </section>
        ))}

        <div className="mt-12 p-6 bg-card border border-line rounded-2xl">
          <div className="text-[13px] font-bold text-cream mb-1.5">{c.questions}</div>
          <a href="mailto:info@slim-ia.ca" className="text-[13px] text-coral no-underline font-semibold hover:underline">
            info@slim-ia.ca
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-line flex gap-4 flex-wrap">
          <a href="/" className="text-xs text-fog no-underline font-semibold hover:text-cream transition-colors">
            ← {c.backHome}
          </a>
          <a href={c.crossLinkHref} className="text-xs text-fog no-underline font-semibold hover:text-cream transition-colors">
            {c.crossLinkLabel} →
          </a>
        </div>
      </div>
    </div>
  );
}

export function LegalPage({ copy }: { copy: Record<"fr" | "en", LegalCopy> }) {
  return (
    <LangProvider>
      <LegalBody copy={copy} />
    </LangProvider>
  );
}
