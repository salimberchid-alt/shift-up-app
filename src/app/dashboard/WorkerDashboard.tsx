"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { BrandMark, LangToggle, MatchRing } from "@/components/ui";
import {
  Icon, type IconName, Avatar, StatCard, StatusPill, Toast, Modal, MobileTabBar, SideNav, StepTracker,
} from "@/components/dashboard/shared";
import {
  fetchJobFeed, applyToJob as apiApplyToJob, passJob as apiPassJob, fetchJobEmployerId,
  fetchMyMatches, signContract, fetchConversations, fetchMessages, sendChatMessage, subscribeToMessages,
  fetchMyBookings, submitReview, fetchMyName, updateMyName, updateWorkerProfile,
  type LiveJobFeedItem, type LiveMatch, type LiveConversation, type LiveChatMessage, type LiveBooking,
} from "@/lib/liveData";
import { supabase } from "@/lib/supabaseClient";

const MATCH_STATUS_STYLE: Record<LiveMatch["status"], { color: string; label: { fr: string; en: string } }> = {
  pending_payment: { color: "#F5B93F", label: { fr: "En attente employeur", en: "Awaiting employer" } },
  active: { color: "#B3A6FF", label: { fr: "Actif", en: "Active" } },
  signed: { color: "#7CE0A8", label: { fr: "Contrat signé", en: "Contract signed" } },
  closed: { color: "#9c9cc4", label: { fr: "Fermé", en: "Closed" } },
};

const BOOKING_STATUS_INDEX: Record<string, number> = { requested: 0, confirmed: 1, in_progress: 2, completed: 3, paid_out: 4 };
const BOOKING_STEPS = { fr: ["Demandé", "Confirmé", "En cours", "Terminé", "Payé"], en: ["Requested", "Confirmed", "In progress", "Completed", "Paid"] };

function JobCard({
  job,
  index,
  onApply,
  onPass,
}: {
  job: LiveJobFeedItem;
  index: number;
  onApply: (j: LiveJobFeedItem) => void;
  onPass: (j: LiveJobFeedItem) => void;
}) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  return (
    <div className={`glass-panel rounded-[18px] p-5 flex flex-col gap-3.5 relative overflow-hidden ${!job.applied ? "ring-1 ring-[#8B7CFF]/30" : ""}`}>
      <div className="flex gap-3 items-start">
        <Avatar id={index} name={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-white">{job.title}</span>
            {job.urgent && (
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F08A3C]/15 text-[#F5B93F] border border-[#F08A3C]/35">
                <Icon name="fire" size={9} /> {isFr ? "Urgent" : "Urgent"}
              </span>
            )}
          </div>
          <div className="text-xs text-white/50">{job.company} · {job.distLabel}</div>
        </div>
        <MatchRing score={job.match} size={44} stroke={4} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[job.payLabel, job.shift, job.category].map((tag) => (
          <span key={tag} className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-[3px] text-[11px] text-white/80 font-semibold">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {job.applied ? (
          <div className="flex-1 py-2.5 rounded-[11px] bg-[#7CE0A8]/10 border border-[#7CE0A8]/35 text-[#7CE0A8] text-xs font-bold flex items-center justify-center gap-1.5">
            <Icon name="check" size={13} /> {isFr ? "Candidature envoyée" : "Application sent"}
          </div>
        ) : (
          <>
            <button
              onClick={() => onApply(job)}
              className="flex-1 py-2.5 rounded-[11px] grad-violet border-none text-white text-xs font-bold cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              <Icon name="send" size={13} /> {isFr ? "Postuler" : "Apply"}
            </button>
            <button
              onClick={() => onPass(job)}
              className="px-3.5 py-2.5 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/50 text-xs font-bold cursor-pointer transition-colors hover:text-white flex items-center gap-1"
            >
              <Icon name="close" size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SignContractModal({
  match,
  onClose,
  onSign,
}: {
  match: LiveMatch | null;
  onClose: () => void;
  onSign: (name: string) => void;
}) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [checks, setChecks] = useState([false, false, false]);
  const [name, setName] = useState("");

  if (!match) return null;
  const readOnly = match.status === "signed";
  const allChecked = checks.every(Boolean);
  const canSign = allChecked && name.trim().length > 1;

  const TERMS = [
    isFr ? "Je confirme avoir lu et accepté les modalités de ce contrat." : "I confirm I've read and accept this contract's terms.",
    isFr ? "Je confirme être disponible pour ce quart tel que décrit." : "I confirm I'm available for this shift as described.",
    isFr ? "Je comprends que ShiftUp facilite la mise en relation et n'est pas mon employeur." : "I understand ShiftUp facilitates this connection and is not my employer.",
  ];

  return (
    <Modal onClose={onClose} maxWidth={440} ariaLabel={isFr ? "Contrat" : "Contract"}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="fileText" size={20} className="text-[#B3A6FF]" />
        <h3 className="font-display text-lg font-extrabold text-white">
          {readOnly ? (isFr ? "Contrat signé" : "Signed contract") : (isFr ? "Signer le contrat" : "Sign contract")}
        </h3>
      </div>
      <div className="bg-white/[0.04] border border-white/10 rounded-[14px] p-4 mb-5 flex flex-col gap-2">
        {[
          [isFr ? "Entreprise" : "Company", match.company],
          [isFr ? "Poste" : "Role", match.title],
          [isFr ? "Salaire" : "Pay", match.pay],
          [isFr ? "Code postal" : "Postal code", match.address],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-[12.5px]">
            <span className="text-white/50 font-semibold">{k}</span>
            <span className="text-white font-bold text-right">{v}</span>
          </div>
        ))}
      </div>

      {readOnly ? (
        <div className="flex items-center gap-2 text-[#7CE0A8] text-[13px] font-bold">
          <Icon name="check" size={15} /> {isFr ? "Contrat signé et confirmé." : "Contract signed and confirmed."}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5 mb-4">
            {TERMS.map((t, i) => (
              <label key={i} className="flex items-start gap-2.5 text-[12px] text-white/70 leading-snug cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => setChecks((c) => c.map((v, idx) => (idx === i ? !v : v)))}
                  className="mt-0.5 shrink-0 accent-[#8B7CFF]"
                />
                {t}
              </label>
            ))}
          </div>
          <label htmlFor="sign-name" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
            {isFr ? "Tapez votre nom complet pour signer" : "Type your full name to sign"}
          </label>
          <input
            id="sign-name"
            className="field mb-4"
            placeholder={isFr ? "Nom complet" : "Full name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-3 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/60 text-[13px] font-bold cursor-pointer hover:text-white transition-colors">
              {isFr ? "Annuler" : "Cancel"}
            </button>
            <button
              onClick={() => onSign(name.trim())}
              disabled={!canSign}
              className="flex-[2] py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {isFr ? "Signer le contrat" : "Sign contract"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function WorkerDashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"jobs" | "matches" | "bookings" | "messages" | "account">("jobs");
  const [filter, setFilter] = useState<"all" | "new" | "high" | "applied">("all");
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<LiveJobFeedItem[]>([]);
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [signTarget, setSignTarget] = useState<LiveMatch | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [thread, setThread] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<LiveChatMessage[]>([]);
  const [composeText, setComposeText] = useState("");
  const [account, setAccount] = useState({ name: "", postal: "", radius: "10" });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [f, m, b, name] = await Promise.all([fetchJobFeed(), fetchMyMatches(), fetchMyBookings(), fetchMyName()]);
      if (cancelled) return;
      setFeed(f);
      setMatches(m);
      setBookings(b);
      setAccount((a) => ({ ...a, name }));
      setLoading(false);
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

  const filteredFeed = useMemo(
    () =>
      feed.filter((j) =>
        filter === "new" ? !j.applied : filter === "high" ? j.match >= 85 : filter === "applied" ? j.applied : true,
      ),
    [feed, filter],
  );

  const avgMatch = useMemo(() => (feed.length ? Math.round(feed.reduce((s, j) => s + j.match, 0) / feed.length) : 0), [feed]);
  const appliedCount = useMemo(() => feed.filter((j) => j.applied).length, [feed]);
  const activeMatchCount = useMemo(() => matches.filter((m) => m.status === "active" || m.status === "signed").length, [matches]);

  const applyToJob = async (job: LiveJobFeedItem) => {
    setFeed((f) => f.map((j) => (j.id === job.id ? { ...j, applied: true } : j)));
    const employerId = await fetchJobEmployerId(job.id);
    if (employerId) await apiApplyToJob(job.id, employerId);
    showToast(isFr ? `Candidature envoyée à ${job.company}!` : `Application sent to ${job.company}!`);
  };

  const passJob = async (job: LiveJobFeedItem) => {
    setFeed((f) => f.filter((j) => j.id !== job.id));
    await apiPassJob(job.id);
  };

  const confirmSign = async (signature: string) => {
    if (!signTarget) return;
    const ok = await signContract(signTarget.id, signature);
    if (ok) {
      setMatches((ms) => ms.map((m) => (m.id === signTarget.id ? { ...m, status: "signed" } : m)));
      showToast(isFr ? "Contrat signé!" : "Contract signed!");
    } else {
      showToast(isFr ? "Erreur — réessayez." : "Error — please try again.");
    }
    setSignTarget(null);
  };

  const markReviewed = async (booking: LiveBooking, stars: number) => {
    const ok = await submitReview(booking.id, booking.freelancerId, stars, "");
    if (ok) {
      showToast(isFr ? "Merci pour votre avis!" : "Thanks for your review!");
      fetchMyBookings().then(setBookings);
    }
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
      updateWorkerProfile({ postal: account.postal, radiusKm: Number(account.radius) || 10 }),
    ]);
    showToast(isFr ? "Compte mis à jour!" : "Account updated!");
  };

  const NAV = [
    { id: "jobs", icon: "grid" as IconName, label: isFr ? "Offres" : "Jobs" },
    { id: "matches", icon: "bolt" as IconName, label: isFr ? "Mes matchs" : "My matches" },
    { id: "bookings", icon: "package" as IconName, label: isFr ? "Réservations" : "Bookings" },
    { id: "messages", icon: "message" as IconName, label: isFr ? "Messages" : "Messages" },
    { id: "account", icon: "gear" as IconName, label: isFr ? "Compte" : "Account" },
  ] as const;

  const FILTERS = [
    { id: "all", label: isFr ? "Toutes" : "All" },
    { id: "new", label: isFr ? "Nouvelles" : "New" },
    { id: "high", label: isFr ? "Top match" : "Top match" },
    { id: "applied", label: isFr ? "Postulées" : "Applied" },
  ] as const;

  return (
    <div className="bg-[#0a0810] min-h-screen text-white flex flex-col">
      <Toast message={toast} />
      <SignContractModal match={signTarget} onClose={() => setSignTarget(null)} onSign={confirmSign} />

      <header className="glass-pill border-x-0 border-t-0 rounded-none px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="no-underline shrink-0 flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-display font-extrabold grad-text text-lg hidden xs:inline">ShiftUp</span>
          </Link>
          <span className="hidden sm:inline text-[11px] text-white/50 border-l border-white/15 pl-3">
            {isFr ? "Dashboard Travailleur" : "Worker Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#8B7CFF]/10 border border-[#8B7CFF]/35 rounded-full px-3.5 py-1.5">
            <span className="text-xs font-extrabold text-[#B3A6FF]">{activeMatchCount}</span>
            <span className="hidden sm:inline text-[11px] text-white/50 font-semibold">
              {isFr ? "matchs actifs" : "active matches"}
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
              <div className="flex items-center gap-2 mb-2">
                <Icon name="shieldCheck" size={15} className="text-[#7CE0A8]" />
                <span className="text-xs font-extrabold text-white">{isFr ? "Profil complet" : "Profile complete"}</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {isFr ? "Ajoutez votre CV pour améliorer vos matchs." : "Add your resume to improve your matches."}
              </p>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-7 overflow-y-auto max-w-[1140px]">
          {loading ? (
            <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Chargement…" : "Loading…"}</p>
          ) : (
            <>
              {tab === "jobs" && (
                <div>
                  <div className="flex gap-4 mb-7 flex-wrap">
                    <StatCard icon="bolt" label={isFr ? "Offres disponibles" : "Available jobs"} value={String(feed.filter((j) => !j.applied).length)} sub={isFr ? "Non postulées" : "Not applied yet"} color="#8B7CFF" />
                    <StatCard icon="send" label={isFr ? "Candidatures" : "Applications"} value={String(appliedCount)} sub={isFr ? "Envoyées" : "Sent"} color="#7CE0A8" />
                    <StatCard icon="star" label={isFr ? "Match moyen" : "Avg match"} value={feed.length ? `${avgMatch}%` : "—"} sub={isFr ? "Sur vos offres" : "Across your jobs"} color="#F5B93F" />
                  </div>

                  <div className="flex gap-2.5 mb-5 flex-wrap items-center">
                    <h2 className="font-display text-lg font-extrabold text-white mr-2">
                      {isFr ? "Offres recommandées" : "Recommended jobs"}
                    </h2>
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        aria-pressed={filter === f.id}
                        className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-xs font-bold cursor-pointer transition-colors ${
                          filter === f.id ? "border-[#8B7CFF] bg-[#8B7CFF]/10 text-[#B3A6FF]" : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {filteredFeed.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">
                      {feed.length === 0
                        ? (isFr ? "Aucune offre active pour le moment." : "No active jobs right now.")
                        : (isFr ? "Aucune offre avec ce filtre." : "No jobs match this filter.")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                      {filteredFeed.map((j, i) => (
                        <JobCard key={j.id} job={j} index={i} onApply={applyToJob} onPass={passJob} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "matches" && (
                <div>
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                    {isFr ? "Mes matchs" : "My matches"}
                  </h2>
                  {matches.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Aucun match pour l'instant." : "No matches yet."}</p>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {matches.map((m, i) => {
                        const st = MATCH_STATUS_STYLE[m.status];
                        return (
                          <div key={m.id} className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap">
                            <Avatar id={i} name={m.company} />
                            <div className="flex-1 min-w-[180px]">
                              <div className="flex gap-2 items-center mb-1 flex-wrap">
                                <span className="font-display text-base font-extrabold text-white">{m.title}</span>
                                <StatusPill label={st.label[lang]} color={st.color} />
                              </div>
                              <div className="text-xs text-white/50">{m.company} · {m.pay}</div>
                            </div>
                            {m.matchScore > 0 && <MatchRing score={m.matchScore} size={40} stroke={4} />}
                            <div className="flex gap-2">
                              {m.status === "active" && (
                                <button
                                  onClick={() => setSignTarget(m)}
                                  className="px-3.5 py-2 rounded-[9px] grad-violet border-none text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                                >
                                  <Icon name="fileText" size={13} /> {isFr ? "Signer" : "Sign"}
                                </button>
                              )}
                              {m.status === "signed" && (
                                <button
                                  onClick={() => setSignTarget(m)}
                                  className="px-3.5 py-2 rounded-[9px] bg-white/[0.04] border border-white/10 text-white/60 text-xs font-bold cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
                                >
                                  <Icon name="fileText" size={13} /> {isFr ? "Voir le contrat" : "View contract"}
                                </button>
                              )}
                              {(m.status === "active" || m.status === "signed") && (
                                <button
                                  onClick={() => { setTab("messages"); setThread(m.id); }}
                                  className="px-3.5 py-2 rounded-[9px] bg-[#8B7CFF]/10 border border-[#8B7CFF]/35 text-[#B3A6FF] text-xs font-bold cursor-pointer hover:bg-[#8B7CFF]/20 transition-colors"
                                >
                                  {isFr ? "Message" : "Message"}
                                </button>
                              )}
                              {m.status === "pending_payment" && (
                                <span className="text-[11px] text-white/40 italic px-1">
                                  {isFr ? "L'employeur doit débloquer votre profil" : "Employer needs to unlock your profile"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "bookings" && (
                <div>
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-2">
                    {isFr ? "Mes réservations" : "My bookings"}
                  </h2>
                  <p className="text-sm text-white/55 mb-7 max-w-[560px]">
                    {isFr ? "Services que vous avez réservés auprès de freelances sur la place de marché." : "Services you've booked from freelancers on the marketplace."}
                  </p>
                  {bookings.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Aucune réservation pour l'instant." : "No bookings yet."}</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {bookings.map((b, i) => {
                        const idx = BOOKING_STATUS_INDEX[b.status] ?? 0;
                        return (
                          <div key={b.id} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3 flex-wrap justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar id={i} name={b.freelancerName} size={40} />
                                <div>
                                  <div className="font-display text-[15px] font-extrabold text-white">{b.listingTitle}</div>
                                  <div className="text-xs text-white/50">{b.freelancerName} · {new Date(b.createdAt).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-display text-lg font-extrabold text-[#B3A6FF]">${b.buyerTotal.toFixed(2)}</div>
                                <div className="text-[10px] text-white/40">{isFr ? "dont 15% frais" : "incl. 15% fee"}</div>
                              </div>
                            </div>
                            <div className="px-1">
                              <StepTracker steps={BOOKING_STEPS[lang]} currentIndex={idx} />
                            </div>
                            {(b.status === "completed" || b.status === "paid_out") && (
                              <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/[0.06]">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => markReviewed(b, star)}
                                      aria-label={`${star} star`}
                                      className="bg-transparent border-none cursor-pointer p-0.5 text-[#F5B93F]/40 hover:text-[#F5B93F] transition-colors"
                                    >
                                      <Icon name="star" size={16} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[13px] font-bold text-white truncate">{c.otherName}</span>
                              </div>
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
                                <button
                                  onClick={sendMessage}
                                  className="px-4 rounded-[11px] grad-violet border-none text-white font-bold cursor-pointer flex items-center"
                                >
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

              {tab === "account" && (
                <div className="max-w-[520px]">
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                    {isFr ? "Mon compte" : "My account"}
                  </h2>
                  <div className="mb-4">
                    <label htmlFor="acct-name" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
                      {isFr ? "Nom complet" : "Full name"}
                    </label>
                    <input id="acct-name" className="field" value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-postal" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
                      {isFr ? "Code postal" : "Postal code"}
                    </label>
                    <input id="acct-postal" className="field" value={account.postal} onChange={(e) => setAccount((a) => ({ ...a, postal: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-radius" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
                      {isFr ? "Rayon de déplacement (km)" : "Commute radius (km)"}
                    </label>
                    <input id="acct-radius" type="number" min="1" className="field" value={account.radius} onChange={(e) => setAccount((a) => ({ ...a, radius: e.target.value }))} />
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
