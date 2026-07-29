"use client";

import { useEffect, useState } from "react";
import { LangProvider, useLang } from "@/lib/lang";
import { BrandMark } from "@/components/ui";
import { Icon } from "@/components/dashboard/shared";
import { supabase } from "@/lib/supabaseClient";
import { fetchMyRoleProfiles } from "@/lib/liveData";
import EmployerDashboard from "./EmployerDashboard";
import WorkerDashboard from "./WorkerDashboard";
import FreelancerDashboard from "./FreelancerDashboard";

type Role = "employer" | "worker" | "freelancer";
type GateStatus = "checking" | "need-login" | "sent" | "unauthorized" | "redirecting" | "ok" | "choose-personal" | "no-personal";

// Moderator/admin staff already have a working, independently-hardened
// role-routed surface at /admin/*.html (plain HTML+JS, not this React app).
// Redirect them there instead of re-porting that UI — see HANDOFF_dashboard_routing.md.
const STAFF_REDIRECT: Record<string, string> = {
  moderator: "/admin/moderator.html",
  admin: "/admin/index.html",
};

function DashboardByRole({ role }: { role: Role }) {
  if (role === "worker") return <WorkerDashboard />;
  if (role === "freelancer") return <FreelancerDashboard />;
  return <EmployerDashboard />;
}

function RoleGate() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [status, setStatus] = useState<GateStatus>("checking");
  const [role, setRole] = useState<Role>("employer");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [personalChoices, setPersonalChoices] = useState<Role[]>([]);
  const [backHref, setBackHref] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setStatus("need-login");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).maybeSingle();
      if (cancelled) return;

      const r = profile?.role as string | undefined;
      const params = new URLSearchParams(window.location.search);
      const back = params.get("back");
      if (back) setBackHref(back);

      // Explicit opt-in only, never a default route: a staff account
      // (admin/moderator/owner) clicked "switch to my dashboard" from
      // inside their staff panel, which set ?as=personal. Show whichever
      // worker/employer/freelancer profile this same account also holds.
      if (params.get("as") === "personal") {
        const profiles = await fetchMyRoleProfiles();
        if (cancelled) return;
        const available = (["worker", "employer", "freelancer"] as const).filter((k) => profiles[k]);
        if (available.length === 1) {
          setRole(available[0]);
          setStatus("ok");
        } else if (available.length > 1) {
          setPersonalChoices(available);
          setStatus("choose-personal");
        } else {
          setStatus("no-personal");
        }
        return;
      }

      if (r && STAFF_REDIRECT[r]) {
        setStatus("redirecting");
        window.location.href = STAFF_REDIRECT[r];
        return;
      }
      if (r === "worker" || r === "freelancer") {
        setRole(r);
        setStatus("ok");
      } else if (r === "employer") {
        setRole("employer");
        setStatus("ok");
      } else {
        // Includes 'owner': the CEO account must never resolve through this
        // public, magic-link-gated door — only the private admin login does.
        setStatus("unauthorized");
      }
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendLink = async () => {
    setError(null);
    if (!email.trim()) return;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: "https://www.shift-up.app/dashboard" },
    });
    if (err) {
      if (err.status === 429 || err.code === "over_email_send_rate_limit") {
        setError(isFr
          ? "Trop de tentatives. Attendez quelques minutes avant de réessayer."
          : "Too many attempts. Wait a few minutes before trying again.");
      } else {
        setError(isFr ? "Ce courriel n'est pas encore enregistré." : "This email isn't registered yet.");
      }
      return;
    }
    setStatus("sent");
  };

  if (status === "ok") {
    return (
      <>
        {backHref && (
          <div className="fixed top-3 right-3 z-[3000]">
            <a href={backHref} className="glass-pill rounded-full px-4 py-2 text-[11px] font-bold text-white/80 hover:text-white no-underline flex items-center gap-1.5">
              ← {isFr ? "Retour au panneau staff" : "Back to staff panel"}
            </a>
          </div>
        )}
        <DashboardByRole role={role} />
      </>
    );
  }

  return (
    <div className="bg-[#0a0810] min-h-screen text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div aria-hidden className="absolute w-[420px] h-[420px] rounded-full -top-32 -left-32 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(123,92,255,0.22), transparent 72%)" }} />
      <div aria-hidden className="absolute w-[380px] h-[380px] rounded-full -bottom-40 -right-40 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(70,180,220,0.18), transparent 72%)" }} />
      <div className="glass-panel rounded-[22px] p-8 max-w-[380px] w-full text-center relative">
        <div className="flex justify-center mb-5"><BrandMark size={48} /></div>

        {status === "checking" && <p className="text-sm text-white/50">{isFr ? "Vérification…" : "Checking…"}</p>}
        {status === "redirecting" && <p className="text-sm text-white/50">{isFr ? "Redirection…" : "Redirecting…"}</p>}

        {status === "need-login" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Mon espace ShiftUp" : "My ShiftUp dashboard"}</h1>
            <p className="text-[12.5px] text-white/55 mb-6">
              {isFr ? "Connectez-vous avec votre courriel ShiftUp." : "Sign in with your ShiftUp email."}
            </p>
            <input
              type="email"
              className="field mb-3"
              placeholder={isFr ? "ton@courriel.com" : "you@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendLink()}
            />
            <button onClick={sendLink} className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2">
              <Icon name="lock" size={14} /> {isFr ? "Recevoir un lien de connexion" : "Send login link"}
            </button>
            {error && <p className="text-[12px] text-[#FF4D6D] mt-3">{error}</p>}
          </>
        )}

        {status === "sent" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Lien envoyé!" : "Link sent!"}</h1>
            <p className="text-[12.5px] text-white/55">
              {isFr ? `Vérifiez votre boîte courriel (${email}) et cliquez sur le lien pour continuer.` : `Check your inbox (${email}) and click the link to continue.`}
            </p>
          </>
        )}

        {status === "choose-personal" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Quel tableau de bord?" : "Which dashboard?"}</h1>
            <p className="text-[12.5px] text-white/55 mb-5">
              {isFr ? "Ce compte a plus d'un profil personnel." : "This account has more than one personal profile."}
            </p>
            <div className="flex flex-col gap-2">
              {personalChoices.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setStatus("ok"); }}
                  className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer"
                >
                  {r === "worker" ? (isFr ? "Travailleur" : "Worker") : r === "employer" ? (isFr ? "Employeur" : "Employer") : isFr ? "Freelance" : "Freelancer"}
                </button>
              ))}
            </div>
          </>
        )}

        {status === "no-personal" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Aucun profil personnel" : "No personal profile"}</h1>
            <p className="text-[12.5px] text-white/55 mb-5">
              {isFr
                ? "Ce compte n'a pas encore de profil travailleur, employeur ou freelance."
                : "This account doesn't have a worker, employer, or freelancer profile yet."}
            </p>
            {backHref && (
              <a href={backHref} className="w-full py-3 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/70 text-[13px] font-bold no-underline flex items-center justify-center gap-2">
                ← {isFr ? "Retour au panneau staff" : "Back to staff panel"}
              </a>
            )}
          </>
        )}

        {status === "unauthorized" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Compte non reconnu" : "Account not recognized"}</h1>
            <p className="text-[12.5px] text-white/55 mb-5">
              {isFr
                ? "Ce compte n'est associé à aucun rôle ShiftUp actif. Contactez un administrateur pour faire modifier votre accès, ou créez un nouveau compte."
                : "This account isn't associated with an active ShiftUp role. Contact an admin to update your access, or create a new account."}
            </p>
            <button
              onClick={async () => { await supabase.auth.signOut(); setStatus("need-login"); }}
              className="w-full py-3 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/70 text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <Icon name="logout" size={14} /> {isFr ? "Se déconnecter" : "Sign out"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <LangProvider>
      <RoleGate />
    </LangProvider>
  );
}
