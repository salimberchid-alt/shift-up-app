"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang";
import { supabase } from "@/lib/supabaseClient";
import { FadeIn } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "loading" | "success" | "error" | "invalid";

export function WaitlistSection() {
  const { t } = useLang();
  const w = t.waitlist;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        data: { role },
        emailRedirectTo: "https://www.shift-up.app/",
      },
    });
    setStatus(error ? "error" : "success");
  };

  return (
    <section id="waitlist" className="px-6 py-24">
      <div className="max-w-[560px] mx-auto text-center">
        <FadeIn>
          <div className="text-5xl mb-5">⚡</div>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-bold text-white tracking-tight leading-tight mb-4">
            {w.title}
          </h2>
          <p className="text-[15px] text-white/68 leading-relaxed mb-7">{w.sub}</p>

          {status === "success" ? (
            <div className="bg-[--color-leaf]/10 border border-[--color-leaf]/35 rounded-2xl p-7 text-center mb-5">
              <div className="text-4xl mb-2.5">🎉</div>
              <div className="font-bold text-[--color-leaf] text-base mb-1.5">{w.success}</div>
              <div className="text-xs text-white/68">{w.tag}</div>
            </div>
          ) : (
            <>
              <div className="flex gap-2.5 justify-center mb-5 flex-wrap">
                {(
                  [
                    ["worker", w.roleWorker],
                    ["employer", w.roleEmployer],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setRole(val)}
                    aria-pressed={role === val}
                    className={`px-4 py-2.5 rounded-[11px] border-[1.5px] text-[13px] font-bold cursor-pointer transition-colors ${
                      role === val
                        ? "bg-[--color-violet]/10 border-[--color-violet] text-[--color-violet-text]"
                        : "bg-white/[0.05] border-white/[0.12] text-white/68 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form
                className="flex gap-2.5 max-w-[420px] mx-auto mb-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <label htmlFor="waitlist-email" className="sr-only">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  autoComplete="email"
                  placeholder={w.placeholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "invalid" || status === "error") setStatus("idle");
                  }}
                  className="field flex-1"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-5 py-3 rounded-[11px] grad-violet border-none text-white text-sm font-bold cursor-pointer whitespace-nowrap transition-opacity disabled:opacity-60 hover:opacity-90"
                >
                  {status === "loading" ? w.sending : w.cta}
                </button>
              </form>

              {status === "invalid" && (
                <p role="alert" className="text-xs text-[--color-amber2] font-semibold mb-3">
                  {w.invalidEmail}
                </p>
              )}
              {status === "error" && (
                <p role="alert" className="text-xs text-[--color-violet-text] font-semibold mb-3 max-w-[420px] mx-auto">
                  {w.error}
                </p>
              )}

              <div className="text-[11px] text-white/50 mb-5">{w.tag}</div>
              <div className="border-t border-white/[0.08] pt-5">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[--color-teal2]/10 border-[1.5px] border-[--color-teal2]/35 text-[--color-teal2] text-[13px] font-bold no-underline transition-colors hover:bg-[--color-teal2]/20"
                >
                  🏢 {w.dashboard}
                </a>
              </div>
            </>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
