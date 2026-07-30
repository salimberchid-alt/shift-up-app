"use client";

import { useCallback, useEffect, useState } from "react";
import { LangProvider, useLang } from "@/lib/lang";
import { BrandMark } from "@/components/ui";
import { Icon } from "@/components/dashboard/shared";
import { supabase } from "@/lib/supabaseClient";
import { fetchMyRoleProfiles } from "@/lib/liveData";
import EmployerDashboard from "./EmployerDashboard";
import WorkerDashboard from "./WorkerDashboard";
import FreelancerDashboard from "./FreelancerDashboard";

type Role = "employer" | "worker" | "freelancer";
type GateStatus =
  | "checking"
  | "need-login"
  | "reset-password"
  | "mfa-enroll"
  | "mfa-verify"
  | "unauthorized"
  | "redirecting"
  | "ok"
  | "choose-personal"
  | "no-personal";

// Moderator/admin staff already have a working, independently-hardened
// role-routed surface at /admin/*.html (plain HTML+JS, not this React app).
// Redirect them there instead of re-porting that UI — see HANDOFF_dashboard_routing.md.
const STAFF_REDIRECT: Record<string, string> = {
  moderator: "/admin/moderator.html",
  admin: "/admin/index.html",
};

const DASHBOARD_URL = "https://www.shift-up.app/dashboard";

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [personalChoices, setPersonalChoices] = useState<Role[]>([]);
  const [backHref, setBackHref] = useState<string | null>(null);

  // Forgot-password (lightweight, reuses this same page as the recovery
  // landing spot instead of a dedicated route).
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // TOTP 2FA — enrollment (first login) and challenge (returning login).
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [totpQr, setTotpQr] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setStatus("need-login");
      return;
    }

    // TOTP gate: signInWithPassword alone only gets the session to aal1.
    // If the account has a verified TOTP factor, Supabase reports
    // nextLevel "aal2" until a challenge is completed — that's our signal
    // to block dashboard content behind a 6-digit code. If there's no
    // factor at all yet, currentLevel/nextLevel both stay "aal1" and we
    // route the user into enrollment instead.
    const { data: aal, error: aalErr } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!aalErr && aal && aal.currentLevel !== "aal2") {
      if (aal.nextLevel === "aal2") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const factor = factors?.totp?.[0];
        if (factor) {
          setMfaFactorId(factor.id);
          setStatus("mfa-verify");
          return;
        }
      }
      setStatus("mfa-enroll");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).maybeSingle();

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
      // public login door — only the private admin login does.
      setStatus("unauthorized");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // supabase-js emits an "INITIAL_SESSION" event as soon as a listener is
    // registered (with the session restored from storage, or null), so we
    // don't need a separate direct call to check() on mount — every case
    // (initial load, sign-in, sign-out, token refresh) flows through here.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      // Landed here via the "reset password" email link — Supabase already
      // exchanged the recovery token for a session, we just need the
      // "set a new password" form, not the normal gate logic.
      if (event === "PASSWORD_RECOVERY") {
        setStatus("reset-password");
        return;
      }
      check();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [check]);

  // Kick off TOTP enrollment as soon as we land in that state.
  useEffect(() => {
    if (status !== "mfa-enroll" || totpQr) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (cancelled) return;
      if (err) {
        setError(isFr ? "Impossible de démarrer la configuration 2FA." : "Couldn't start 2FA setup.");
        return;
      }
      // qr_code is a raw SVG string; per Supabase's docs this is rendered
      // directly as an <img> src by prefixing the data: URI — no QR-code
      // library needed.
      setTotpQr(`data:image/svg+xml;utf-8,${encodeURIComponent(data.totp.qr_code)}`);
      setTotpSecret(data.totp.secret);
      setMfaFactorId(data.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, totpQr, isFr]);

  const signIn = async () => {
    setError(null);
    if (!email.trim() || !password) return;
    // Replaces the old signInWithOtp magic-link flow: that was pulled after
    // repeated logins tripped Supabase's free-tier email rate limit
    // (429 / over_email_send_rate_limit). Password + TOTP 2FA below doesn't
    // send an email per login, so the rate limit no longer applies here.
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError(isFr ? "Courriel ou mot de passe incorrect." : "Incorrect email or password.");
      return;
    }
    // onAuthStateChange fires SIGNED_IN, which re-runs check() above.
  };

  const sendResetLink = async () => {
    setError(null);
    if (!email.trim()) {
      setError(isFr ? "Entrez votre courriel ci-dessus d'abord." : "Enter your email above first.");
      return;
    }
    setForgotStatus("sending");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: DASHBOARD_URL });
    if (err) {
      setForgotStatus("idle");
      setError(isFr ? "Impossible d'envoyer le lien. Réessayez plus tard." : "Couldn't send the link. Try again later.");
      return;
    }
    setForgotStatus("sent");
  };

  const submitNewPassword = async () => {
    setError(null);
    if (newPassword.length < 8) {
      setError(isFr ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError(isFr ? "Les mots de passe ne correspondent pas." : "Passwords don't match.");
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      setError(isFr ? "Impossible de mettre à jour le mot de passe." : "Couldn't update the password.");
      return;
    }
    setNewPassword("");
    setNewPasswordConfirm("");
    check();
  };

  const verifyMfaCode = async () => {
    if (!mfaFactorId || mfaCode.trim().length !== 6) return;
    setMfaBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode.trim() });
    setMfaBusy(false);
    if (err) {
      setError(isFr ? "Code invalide. Réessayez." : "Invalid code. Try again.");
      setMfaCode("");
      return;
    }
    setMfaCode("");
    setTotpQr(null);
    setTotpSecret(null);
    check();
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
              {isFr ? "Connectez-vous avec votre courriel et mot de passe ShiftUp." : "Sign in with your ShiftUp email and password."}
            </p>
            <input
              type="email"
              autoComplete="email"
              className="field mb-3"
              placeholder={isFr ? "ton@courriel.com" : "you@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
            />
            <input
              type="password"
              autoComplete="current-password"
              className="field mb-3"
              placeholder={isFr ? "Mot de passe" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
            />
            <button onClick={signIn} className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2">
              <Icon name="lock" size={14} /> {isFr ? "Se connecter" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={sendResetLink}
              disabled={forgotStatus === "sending"}
              className="mt-3 bg-transparent border-none text-[11px] text-white/40 hover:text-white/70 underline cursor-pointer disabled:opacity-60"
            >
              {isFr ? "Mot de passe oublié?" : "Forgot password?"}
            </button>
            {forgotStatus === "sent" && (
              <p className="text-[11.5px] text-[#7CE0A8] mt-2">
                {isFr ? `Si ce compte existe, un lien a été envoyé à ${email}.` : `If that account exists, a link was sent to ${email}.`}
              </p>
            )}
            {error && <p className="text-[12px] text-[#FF4D6D] mt-3">{error}</p>}
          </>
        )}

        {status === "reset-password" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Nouveau mot de passe" : "Set a new password"}</h1>
            <p className="text-[12.5px] text-white/55 mb-6">
              {isFr ? "Choisissez un nouveau mot de passe pour votre compte." : "Choose a new password for your account."}
            </p>
            <input
              type="password"
              autoComplete="new-password"
              className="field mb-3"
              placeholder={isFr ? "Nouveau mot de passe" : "New password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              autoComplete="new-password"
              className="field mb-3"
              placeholder={isFr ? "Confirmez le mot de passe" : "Confirm password"}
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNewPassword()}
            />
            <button onClick={submitNewPassword} className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2">
              <Icon name="lock" size={14} /> {isFr ? "Mettre à jour" : "Update password"}
            </button>
            {error && <p className="text-[12px] text-[#FF4D6D] mt-3">{error}</p>}
          </>
        )}

        {status === "mfa-enroll" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Activer la 2FA" : "Set up 2FA"}</h1>
            <p className="text-[12.5px] text-white/55 mb-4">
              {isFr
                ? "Scannez ce code avec Google Authenticator, Authy ou une app similaire, puis entrez le code à 6 chiffres."
                : "Scan this code with Google Authenticator, Authy, or a similar app, then enter the 6-digit code."}
            </p>
            {totpQr ? (
              <>
                <div className="flex justify-center mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={totpQr} alt="TOTP QR code" width={176} height={176} className="rounded-lg bg-white p-2" />
                </div>
                {totpSecret && (
                  <p className="text-[10.5px] text-white/40 mb-4 break-all">
                    {isFr ? "Ou entrez ce code manuellement : " : "Or enter this code manually: "}
                    <span className="font-mono text-white/70">{totpSecret}</span>
                  </p>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="field mb-3 text-center tracking-[0.3em]"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && verifyMfaCode()}
                />
                <button
                  onClick={verifyMfaCode}
                  disabled={mfaBusy || mfaCode.length !== 6}
                  className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Icon name="shieldCheck" size={14} /> {isFr ? "Confirmer" : "Confirm"}
                </button>
              </>
            ) : (
              <p className="text-sm text-white/50">{isFr ? "Chargement…" : "Loading…"}</p>
            )}
            {error && <p className="text-[12px] text-[#FF4D6D] mt-3">{error}</p>}
          </>
        )}

        {status === "mfa-verify" && (
          <>
            <h1 className="font-display text-lg font-extrabold text-white mb-1.5">{isFr ? "Vérification en 2 étapes" : "Two-factor verification"}</h1>
            <p className="text-[12.5px] text-white/55 mb-5">
              {isFr ? "Entrez le code à 6 chiffres de votre app d'authentification." : "Enter the 6-digit code from your authenticator app."}
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="field mb-3 text-center tracking-[0.3em]"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verifyMfaCode()}
              autoFocus
            />
            <button
              onClick={verifyMfaCode}
              disabled={mfaBusy || mfaCode.length !== 6}
              className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Icon name="shieldCheck" size={14} /> {isFr ? "Vérifier" : "Verify"}
            </button>
            {error && <p className="text-[12px] text-[#FF4D6D] mt-3">{error}</p>}
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
