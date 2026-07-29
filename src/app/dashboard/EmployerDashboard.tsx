"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { BrandMark, LangToggle, MatchRing } from "@/components/ui";
import {
  Icon, type IconName, Avatar, StatCard, StatusPill, Toast, Modal, MobileTabBar, SideNav,
} from "@/components/dashboard/shared";
import {
  fetchCandidateDeck, swipeCandidate, fetchMyJobPostings, fetchEmployerMatches, fetchMyPayments,
  fetchConversations, fetchMessages, sendChatMessage, subscribeToMessages,
  fetchMyEmployerProfile, updateEmployerProfile, fetchMyName, updateMyName,
  type LiveCandidate, type LiveJobPosting, type LiveEmployerMatch, type LivePayment,
  type LiveConversation, type LiveChatMessage,
} from "@/lib/liveData";
import { supabase } from "@/lib/supabaseClient";

const STATUS_STYLE: Record<string, { color: string; label: { fr: string; en: string } }> = {
  pending_payment: { color: "#B3A6FF", label: { fr: "Nouveau", en: "New" } },
  active: { color: "#F5B93F", label: { fr: "Connecté", en: "Connected" } },
  signed: { color: "#7CE0A8", label: { fr: "Contrat signé", en: "Contract signed" } },
  closed: { color: "#9c9cc4", label: { fr: "Fermé", en: "Closed" } },
};

function CandidateCard({ c, index, onConnect, onSuperlike }: { c: LiveCandidate; index: number; onConnect: (c: LiveCandidate) => void; onSuperlike: (c: LiveCandidate) => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  return (
    <div className="glass-panel rounded-[18px] p-5 flex flex-col gap-3.5 relative overflow-hidden ring-1 ring-[#8B7CFF]/30">
      <div className="flex gap-3 items-start">
        <Avatar id={index} name={c.initials} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-white">{c.initials}</span>
            {c.hasResume && (
              <span className="flex items-center gap-1 bg-[#7CE0A8]/15 border border-[#7CE0A8]/40 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-[#7CE0A8]">
                <Icon name="fileText" size={9} /> CV
              </span>
            )}
          </div>
          <div className="text-xs text-white/50">{c.postalFsa} · {c.radiusKm} km</div>
        </div>
        <MatchRing score={c.matchScore} size={44} stroke={4} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {c.interests.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-[3px] text-[11px] text-white/80 font-semibold">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onConnect(c)}
          className="flex-1 py-2.5 rounded-[11px] grad-violet border-none text-white text-xs font-bold cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
        >
          <Icon name="bolt" size={13} /> {isFr ? "Connecter" : "Connect"}
        </button>
        <button
          onClick={() => onSuperlike(c)}
          className="px-3.5 py-2.5 rounded-[11px] bg-[#F5B93F]/10 border border-[#F5B93F]/40 text-[#F5B93F] text-xs font-bold cursor-pointer transition-colors hover:bg-[#F5B93F]/20 flex items-center gap-1"
        >
          <Icon name="star" size={12} /> $5
        </button>
      </div>
    </div>
  );
}

function AppUpsellModal({
  title,
  body,
  onClose,
}: {
  title: string | null;
  body: string;
  onClose: () => void;
}) {
  if (!title) return null;
  return (
    <Modal onClose={onClose} maxWidth={400} ariaLabel={title}>
      <h3 className="font-display text-xl font-extrabold text-white mb-3">{title}</h3>
      <p className="text-[13px] text-white/65 leading-relaxed mb-6">{body}</p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer"
      >
        OK
      </button>
    </Modal>
  );
}

export default function EmployerDashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"candidates" | "jobs" | "messages" | "pricing" | "billing" | "settings">("candidates");
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<LiveCandidate[]>([]);
  const [jobs, setJobs] = useState<LiveJobPosting[]>([]);
  const [matches, setMatches] = useState<LiveEmployerMatch[]>([]);
  const [payments, setPayments] = useState<LivePayment[]>([]);
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [employerProfile, setEmployerProfile] = useState({ company: "", bizType: "", postal: "", matchesRemaining: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [upsell, setUpsell] = useState<{ title: string; body: string } | null>(null);
  const [thread, setThread] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<LiveChatMessage[]>([]);
  const [composeText, setComposeText] = useState("");
  const [account, setAccount] = useState({ name: "", company: "", bizType: "", postal: "" });
  const [email, setEmail] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const reload = async () => {
    const [c, j, m, pay, emp, name, session] = await Promise.all([
      fetchCandidateDeck(), fetchMyJobPostings(), fetchEmployerMatches(), fetchMyPayments(),
      fetchMyEmployerProfile(), fetchMyName(), supabase.auth.getSession(),
    ]);
    setCandidates(c);
    setJobs(j);
    setMatches(m);
    setPayments(pay);
    setEmail(session.data.session?.user.email ?? "");
    if (emp) {
      setEmployerProfile(emp);
      setAccount({ name, company: emp.company, bizType: emp.bizType, postal: emp.postal });
    } else {
      setAccount((a) => ({ ...a, name }));
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await reload();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (tab !== "messages") return;
    fetchConversations().then(setConversations);
  }, [tab]);

  useEffect(() => {
    if (!thread) return;
    let cancelled = false;
    fetchMessages(thread).then((msgs) => { if (!cancelled) setThreadMessages(msgs); });
    const unsubscribe = subscribeToMessages(thread, (m) => setThreadMessages((prev) => [...prev, m]));
    return () => { cancelled = true; unsubscribe(); };
  }, [thread]);

  const spent = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);
  const connectedCount = useMemo(() => matches.filter((m) => m.status === "active" || m.status === "signed").length, [matches]);

  const handleConnect = async (c: LiveCandidate) => {
    const res = await swipeCandidate(c.id, c.jobId, "right");
    setCandidates((cs) => cs.filter((x) => x.id !== c.id));
    if (res.matched) {
      setUpsell({
        title: isFr ? "Match créé!" : "Match created!",
        body: isFr
          ? "Ce candidat a aussi manifesté son intérêt. Complétez le paiement ($25) dans l'app ShiftUp pour débloquer la messagerie."
          : "This candidate has also shown interest. Complete the $25 payment in the ShiftUp app to unlock messaging.",
      });
    } else {
      showToast(isFr ? "Intérêt envoyé!" : "Interest sent!");
    }
    fetchEmployerMatches().then(setMatches);
  };

  const handleSuperlike = (c: LiveCandidate) => {
    setUpsell({
      title: isFr ? "Super like" : "Super like",
      body: isFr
        ? "Les super likes ($5) sont un achat en argent réel — complétez-le dans l'app ShiftUp, où le paiement Stripe est géré de façon sécurisée."
        : "Super likes ($5) are a real-money purchase — complete it in the ShiftUp app, where the Stripe payment is handled securely.",
    });
  };

  const sendMessage = async () => {
    if (!thread || !composeText.trim()) return;
    const text = composeText.trim();
    setComposeText("");
    const ok = await sendChatMessage(thread, text);
    if (!ok) showToast(isFr ? "Erreur d'envoi." : "Couldn't send.");
  };

  const saveAccount = async () => {
    await Promise.all([
      updateMyName(account.name),
      updateEmployerProfile({ company: account.company, bizType: account.bizType, postal: account.postal }),
    ]);
    showToast(isFr ? "Compte mis à jour!" : "Account updated!");
  };

  const NAV = [
    { id: "candidates", icon: "grid" as IconName, label: isFr ? "Candidats" : "Candidates" },
    { id: "jobs", icon: "briefcase" as IconName, label: isFr ? "Mes offres" : "My posts" },
    { id: "messages", icon: "message" as IconName, label: isFr ? "Messages" : "Messages" },
    { id: "pricing", icon: "tag" as IconName, label: isFr ? "Tarifs" : "Pricing" },
    { id: "billing", icon: "card" as IconName, label: isFr ? "Facturation" : "Billing" },
    { id: "settings", icon: "gear" as IconName, label: isFr ? "Compte" : "Account" },
  ] as const;

  const PRICING_PLANS = [
    { icon: "bolt" as IconName, color: "#8B7CFF", title: { fr: "Par connexion", en: "Per connect" }, price: "$25", sub: { fr: "par candidat contacté", en: "per candidate contacted" }, body: { fr: "Payez seulement quand vous voulez parler à un candidat. Aucun abonnement, aucun frais caché.", en: "Only pay when you want to reach out to a candidate. No subscription, no hidden fees." } },
    { icon: "star" as IconName, color: "#F5B93F", title: { fr: "Super like", en: "Super like" }, price: "$5", sub: { fr: "pour se démarquer", en: "to stand out" }, body: { fr: "Mettez votre offre en priorité dans la file du candidat. Le frais de match ($25) s'applique seulement s'il accepte.", en: "Bumps your offer to the top of the candidate's queue. The $25 match fee only applies if they accept." } },
    { icon: "tag" as IconName, color: "#7CE0A8", title: { fr: "Forfait 10 matchs", en: "10-match bundle" }, price: "$99", sub: { fr: "$9.90 / match — 60% d'économie", en: "$9.90 / match — 60% savings" }, body: { fr: "Le meilleur prix par match pour les entreprises qui recrutent activement chaque mois.", en: "The best per-match rate for businesses hiring regularly every month." } },
  ];

  return (
    <div className="bg-[#0a0810] min-h-screen text-white flex flex-col">
      <Toast message={toast} />
      <AppUpsellModal title={upsell?.title ?? null} body={upsell?.body ?? ""} onClose={() => setUpsell(null)} />

      <header className="glass-pill border-x-0 border-t-0 rounded-none px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="no-underline shrink-0 flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-display font-extrabold grad-text text-lg hidden xs:inline">ShiftUp</span>
          </Link>
          <span className="hidden sm:inline text-[11px] text-white/50 border-l border-white/15 pl-3">
            {isFr ? "Dashboard Employeur" : "Employer Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#8B7CFF]/10 border border-[#8B7CFF]/35 rounded-full px-3.5 py-1.5">
            <span className="text-xs font-extrabold text-[#B3A6FF]">{employerProfile.matchesRemaining}</span>
            <span className="hidden sm:inline text-[11px] text-white/50 font-semibold">
              {isFr ? "matchs restants" : "matches left"}
            </span>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/dashboard"; }}
            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-white/50 hover:text-white flex items-center justify-center cursor-pointer"
            aria-label={isFr ? "Se déconnecter" : "Sign out"}
          >
            <Icon name="logout" size={14} />
          </button>
          <LangToggle compact />
        </div>
      </header>

      <MobileTabBar tabs={NAV} active={tab} onChange={setTab} />

      <div className="flex flex-1">
        <SideNav
          tabs={NAV}
          active={tab}
          onChange={setTab}
          footer={
            <div className="glass-panel rounded-[14px] p-4 mt-4">
              <div className="text-xs font-extrabold text-white mb-2">
                {isFr ? "Recharger des matchs" : "Buy more matches"}
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mb-2.5">
                {isFr ? "Achats gérés dans l'app ShiftUp." : "Purchases are handled in the ShiftUp app."}
              </p>
              <button
                onClick={() => setTab("billing")}
                className="w-full py-2 rounded-[9px] bg-white/[0.05] border border-white/10 text-white/70 text-[11px] font-bold cursor-pointer hover:text-white"
              >
                {isFr ? "Voir la facturation" : "View billing"}
              </button>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-7 overflow-y-auto max-w-[1140px]">
          {loading ? (
            <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Chargement…" : "Loading…"}</p>
          ) : (
            <>
              {tab === "candidates" && (
                <div>
                  <div className="flex gap-4 mb-7 flex-wrap">
                    <StatCard icon="users" label={isFr ? "Candidats" : "Candidates"} value={String(candidates.length)} sub={isFr ? "Correspondant à votre offre active" : "Matching your active job"} color="#5B8CFF" />
                    <StatCard icon="check" label={isFr ? "Connectés" : "Connected"} value={String(connectedCount)} sub={isFr ? "Matchs actifs ou signés" : "Active or signed matches"} color="#7CE0A8" />
                    <StatCard icon="card" label={isFr ? "Dépensé" : "Spent"} value={`$${spent.toFixed(0)}`} sub={isFr ? "Total" : "Total"} color="#F5B93F" />
                  </div>

                  <h2 className="font-display text-lg font-extrabold text-white mb-5">
                    {isFr ? "Candidats recommandés" : "Recommended candidates"}
                  </h2>

                  {candidates.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">
                      {isFr ? "Aucun candidat pour l'instant — assurez-vous d'avoir une offre active." : "No candidates yet — make sure you have an active job posting."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                      {candidates.map((c, i) => (
                        <CandidateCard key={c.id} c={c} index={i} onConnect={handleConnect} onSuperlike={handleSuperlike} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "jobs" && (
                <div>
                  <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <h2 className="font-display text-[22px] font-extrabold text-white">
                      {isFr ? "Mes offres d'emploi" : "My job posts"}
                    </h2>
                    <button
                      onClick={() => showToast(isFr ? "Bientôt disponible!" : "Coming soon!")}
                      className="px-5 py-2.5 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      + {isFr ? "Publier une offre" : "Post a job"}
                    </button>
                  </div>
                  {jobs.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Aucune offre publiée." : "No jobs posted yet."}</p>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {jobs.map((j) => (
                        <div key={j.id} className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-5 flex-wrap">
                          <div className="flex-1 min-w-[160px]">
                            <div className="font-display text-base font-extrabold text-white mb-1">{j.title}</div>
                            <div className="text-xs text-white/50">{j.payLabel} · {new Date(j.createdAt).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}</div>
                          </div>
                          <div className="flex gap-5 items-center">
                            <div className="text-center">
                              <div className="font-display text-[22px] font-extrabold text-[#B3A6FF]">{j.applicantCount}</div>
                              <div className="text-[10px] text-white/50 font-semibold">{isFr ? "candidatures" : "applicants"}</div>
                            </div>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${j.status === "active" ? "bg-[#7CE0A8]/10 text-[#7CE0A8] border-[#7CE0A8]/35" : "bg-[#F5B93F]/10 text-[#F5B93F] border-[#F5B93F]/40"}`}>
                              {j.status === "active" ? (isFr ? "Actif" : "Active") : j.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setTab("candidates")}
                              className="px-3.5 py-2 rounded-[9px] bg-[#8B7CFF]/10 border border-[#8B7CFF]/35 text-[#B3A6FF] text-xs font-bold cursor-pointer hover:bg-[#8B7CFF]/20 transition-colors"
                            >
                              {isFr ? "Voir candidats" : "View candidates"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "messages" && (
                <div>
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                    {isFr ? "Messages" : "Messages"}
                  </h2>
                  {conversations.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">
                      {isFr ? "Aucune conversation pour l'instant." : "No conversations yet."}
                    </p>
                  ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]">
                      <div className="border-b md:border-b-0 md:border-r border-white/10 max-h-[520px] overflow-y-auto">
                        {conversations.map((c, i) => (
                          <button
                            key={c.matchId}
                            onClick={() => setThread(c.matchId)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 border-none text-left cursor-pointer border-b border-white/[0.06] last:border-b-0 ${
                              thread === c.matchId ? "bg-[#8B7CFF]/10" : "bg-transparent hover:bg-white/[0.03]"
                            }`}
                          >
                            <Avatar id={i} name={c.otherName} size={38} />
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] font-bold text-white truncate">{c.otherName}</span>
                              <div className="text-[11px] text-white/50 truncate">{c.last || (isFr ? "Nouveau match, dites bonjour!" : "New match, say hi!")}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-6 flex flex-col min-h-[320px]">
                        {(() => {
                          const active = conversations.find((c) => c.matchId === thread) ?? conversations[0];
                          if (!active) return null;
                          if (thread === null) setThread(active.matchId);
                          return (
                            <>
                              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
                                <Avatar id={0} name={active.otherName} size={40} />
                                <div>
                                  <div className="text-sm font-bold text-white">{active.otherName}</div>
                                  <div className="text-[11px] text-white/50">{active.jobTitle}</div>
                                </div>
                              </div>
                              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[320px]">
                                {threadMessages.length === 0 && (
                                  <p className="text-white/40 text-xs text-center py-4">{isFr ? "Aucun message pour l'instant." : "No messages yet."}</p>
                                )}
                                {threadMessages.map((m) => (
                                  <div
                                    key={m.id}
                                    className={m.mine
                                      ? "self-end max-w-[75%] grad-violet rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] text-white"
                                      : "self-start max-w-[75%] bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] text-white/85"}
                                  >
                                    {m.text}
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <input
                                  className="field flex-1"
                                  placeholder={isFr ? "Écrire un message…" : "Write a message…"}
                                  value={composeText}
                                  onChange={(e) => setComposeText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                                />
                                <button onClick={sendMessage} className="px-4 rounded-[11px] grad-violet border-none text-white font-bold cursor-pointer flex items-center">
                                  <Icon name="arrowRight" size={16} />
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "pricing" && (
                <div>
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-2">
                    {isFr ? "Tarifs" : "Pricing"}
                  </h2>
                  <p className="text-sm text-white/55 mb-7 max-w-[520px]">
                    {isFr
                      ? "Aucun abonnement. Vous payez uniquement pour les candidats que vous contactez — achats effectués dans l'app ShiftUp."
                      : "No subscription. You only pay for the candidates you reach out to — purchases happen in the ShiftUp app."}
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                    {PRICING_PLANS.map((p) => (
                      <div key={p.title.en} className="glass-panel rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-4" style={{ background: `${p.color}22`, color: p.color }}>
                          <Icon name={p.icon} size={19} />
                        </div>
                        <div className="text-sm font-bold text-white/70 mb-1">{p.title[lang]}</div>
                        <div className="font-display text-3xl font-extrabold text-white mb-0.5">{p.price}</div>
                        <div className="text-[11px] font-semibold mb-4" style={{ color: p.color }}>{p.sub[lang]}</div>
                        <p className="text-[12.5px] text-white/55 leading-relaxed">{p.body[lang]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "billing" && (
                <div>
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                    {isFr ? "Facturation" : "Billing"}
                  </h2>
                  <div className="glass-panel rounded-[20px] p-7 mb-6 flex gap-10 flex-wrap">
                    <div>
                      <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                        {isFr ? "Matchs restants" : "Matches remaining"}
                      </div>
                      <div className="font-display text-5xl font-extrabold text-[#B3A6FF] leading-none">{employerProfile.matchesRemaining}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                        {isFr ? "Dépensé au total" : "Total spent"}
                      </div>
                      <div className="font-display text-5xl font-extrabold text-[#F5B93F] leading-none">${spent.toFixed(2)}</div>
                      <div className="text-xs text-white/50 mt-1.5">{payments.length} {isFr ? "transactions" : "transactions"}</div>
                    </div>
                    <div className="flex flex-col justify-center ml-auto">
                      <p className="text-[12px] text-white/50 leading-relaxed max-w-[220px]">
                        {isFr ? "Achetez des matchs ou un forfait dans l'app ShiftUp." : "Buy matches or a bundle in the ShiftUp app."}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-white mb-4">
                    {isFr ? "Historique" : "Transaction history"}
                  </h3>
                  {payments.length === 0 ? (
                    <p className="text-white/50 text-sm py-6 text-center glass-panel rounded-2xl">{isFr ? "Aucune transaction pour l'instant." : "No transactions yet."}</p>
                  ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden">
                      {payments.map((tx, i) => (
                        <div key={tx.id} className={`flex items-center justify-between px-5 py-3.5 ${i < payments.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                          <div className="flex gap-3 items-center">
                            <div
                              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                              style={{
                                background: tx.type === "bundle" ? "#8B7CFF22" : tx.type === "superlike" ? "#F5B93F22" : "#7CE0A822",
                                color: tx.type === "bundle" ? "#B3A6FF" : tx.type === "superlike" ? "#F5B93F" : "#7CE0A8",
                              }}
                            >
                              <Icon name={tx.type === "bundle" ? "tag" : tx.type === "superlike" ? "star" : "bolt"} size={15} />
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-white capitalize">{tx.type}</div>
                              <div className="text-[11px] text-white/50">{new Date(tx.createdAt).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}</div>
                            </div>
                          </div>
                          <div className="font-display text-base font-extrabold text-[#B3A6FF]">${tx.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "settings" && (
                <div className="max-w-[520px]">
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                    {isFr ? "Mon compte" : "My account"}
                  </h2>
                  <div className="mb-4">
                    <label htmlFor="acct-name" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Nom" : "Name"}</label>
                    <input id="acct-name" className="field" value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-email" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Courriel" : "Email"}</label>
                    <input id="acct-email" className="field opacity-60" value={email} readOnly />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-company" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Nom de l'entreprise" : "Business name"}</label>
                    <input id="acct-company" className="field" value={account.company} onChange={(e) => setAccount((a) => ({ ...a, company: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-biztype" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Type d'entreprise" : "Business type"}</label>
                    <input id="acct-biztype" className="field" value={account.bizType} onChange={(e) => setAccount((a) => ({ ...a, bizType: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-postal" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Code postal" : "Postal code"}</label>
                    <input id="acct-postal" className="field" value={account.postal} onChange={(e) => setAccount((a) => ({ ...a, postal: e.target.value }))} />
                  </div>
                  <button
                    onClick={saveAccount}
                    className="mt-2 px-6 py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    {isFr ? "Sauvegarder" : "Save changes"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
