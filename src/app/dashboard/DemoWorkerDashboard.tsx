"use client";

// Fictive demo data only — used exclusively by /dashboard/demo. Never wire
// this file to Supabase; the real, data-backed version is WorkerDashboard.tsx.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { BrandMark, LangToggle, MatchRing } from "@/components/ui";
import {
  Icon, type IconName, Avatar, StatCard, StatusPill, Toast, Modal, MobileTabBar, SideNav, StepTracker,
} from "@/components/dashboard/shared";

type JobFeedStatus = "new" | "applied";

interface JobFeedItem {
  id: number;
  title: { fr: string; en: string };
  company: string;
  pay: string;
  dist: string;
  match: number;
  shift: { fr: string; en: string };
  category: { fr: string; en: string };
  urgent: boolean;
  status: JobFeedStatus;
}

const INITIAL_FEED: JobFeedItem[] = [
  { id: 1, title: { fr: "Barista", en: "Barista" }, company: "Café Noir", pay: "$18/h", dist: "0.8 km", match: 96, shift: { fr: "Matins · Lun–Ven", en: "Mornings · Mon–Fri" }, category: { fr: "Restauration", en: "Food service" }, urgent: true, status: "new" },
  { id: 2, title: { fr: "Serveur·se", en: "Server" }, company: "Bistro Lumière", pay: "$16/h + pourboires", dist: "1.2 km", match: 91, shift: { fr: "Soirs · Week-ends", en: "Evenings · Weekends" }, category: { fr: "Restauration", en: "Food service" }, urgent: false, status: "new" },
  { id: 3, title: { fr: "Commis d'entrepôt", en: "Warehouse clerk" }, company: "Entrepôt Delta", pay: "$21/h", dist: "2.1 km", match: 88, shift: { fr: "Jours · Flexible", en: "Days · Flexible" }, category: { fr: "Entrepôt", en: "Warehouse" }, urgent: true, status: "applied" },
  { id: 4, title: { fr: "Associé commerce", en: "Retail associate" }, company: "Boutique Lumière", pay: "$17.50/h", dist: "0.5 km", match: 82, shift: { fr: "Après-midi · Fins de sem.", en: "Afternoons · Weekends" }, category: { fr: "Commerce", en: "Retail" }, urgent: false, status: "new" },
  { id: 5, title: { fr: "Agent de sécurité", en: "Security guard" }, company: "SécurPlus", pay: "$19/h", dist: "3.0 km", match: 79, shift: { fr: "Nuits · Week-ends", en: "Nights · Weekends" }, category: { fr: "Sécurité", en: "Security" }, urgent: false, status: "new" },
  { id: 6, title: { fr: "Adjoint bureau", en: "Office assistant" }, company: "Groupe Priya", pay: "$22/h", dist: "1.8 km", match: 74, shift: { fr: "Temps plein · Flexible", en: "Full-time · Flexible" }, category: { fr: "Bureau", en: "Office" }, urgent: false, status: "new" },
];

type MatchStatus = "pending" | "active" | "signed" | "closed";

interface JobMatch {
  id: number;
  company: string;
  title: { fr: string; en: string };
  match: number;
  status: MatchStatus;
  pay: string;
  date: string;
  shift: { fr: string; en: string };
  address: string;
}

const INITIAL_MATCHES: JobMatch[] = [
  { id: 1, company: "Café Noir", title: { fr: "Barista", en: "Barista" }, match: 96, status: "signed", pay: "$18/h", date: "29 juillet", shift: { fr: "Matins · Lun–Ven", en: "Mornings · Mon–Fri" }, address: "450 Rue Sainte-Catherine O, Montréal" },
  { id: 2, company: "Entrepôt Delta", title: { fr: "Commis d'entrepôt", en: "Warehouse clerk" }, match: 88, status: "active", pay: "$21/h", date: "2 août", shift: { fr: "Jours · Flexible", en: "Days · Flexible" }, address: "1200 Boul. Industriel, Laval" },
  { id: 3, company: "Boutique Lumière", title: { fr: "Associé commerce", en: "Retail associate" }, match: 82, status: "pending", pay: "$17.50/h", date: "—", shift: { fr: "Après-midi · Fins de sem.", en: "Afternoons · Weekends" }, address: "—" },
  { id: 4, company: "SécurPlus", title: { fr: "Agent de sécurité", en: "Security guard" }, match: 79, status: "closed", pay: "$19/h", date: "—", shift: { fr: "Nuits · Week-ends", en: "Nights · Weekends" }, address: "—" },
];

const MATCH_STATUS_STYLE: Record<MatchStatus, { color: string; label: { fr: string; en: string } }> = {
  pending: { color: "#F5B93F", label: { fr: "En attente employeur", en: "Awaiting employer" } },
  active: { color: "#B3A6FF", label: { fr: "Actif", en: "Active" } },
  signed: { color: "#7CE0A8", label: { fr: "Contrat signé", en: "Contract signed" } },
  closed: { color: "#9c9cc4", label: { fr: "Fermé", en: "Closed" } },
};

type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "paid_out";

interface WorkerBooking {
  id: number;
  freelancerName: string;
  category: { fr: string; en: string };
  title: { fr: string; en: string };
  amount: number;
  status: BookingStatus;
  date: string;
  reviewed: boolean;
}

const BOOKING_STATUS_INDEX: Record<BookingStatus, number> = { requested: 0, confirmed: 1, in_progress: 2, completed: 3, paid_out: 4 };
const BOOKING_STEPS = { fr: ["Demandé", "Confirmé", "En cours", "Terminé", "Payé"], en: ["Requested", "Confirmed", "In progress", "Completed", "Paid"] };

const INITIAL_BOOKINGS: WorkerBooking[] = [
  { id: 1, freelancerName: "Léa K.", category: { fr: "Photographie", en: "Photography" }, title: { fr: "Séance photo produit", en: "Product photo session" }, amount: 145, status: "in_progress", date: "22 juil.", reviewed: false },
  { id: 2, freelancerName: "Max D.", category: { fr: "Vidéo", en: "Video" }, title: { fr: "Vidéo promo réseaux sociaux", en: "Social media promo video" }, amount: 320, status: "completed", date: "18 juil.", reviewed: false },
  { id: 3, freelancerName: "Nadia F.", category: { fr: "Retouche photo", en: "Photo editing" }, title: { fr: "Retouche portrait ×10", en: "Portrait retouching ×10" }, amount: 80, status: "paid_out", date: "10 juil.", reviewed: true },
];

function JobCard({
  job,
  onApply,
  onPass,
}: {
  job: JobFeedItem;
  onApply: (j: JobFeedItem) => void;
  onPass: (j: JobFeedItem) => void;
}) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  return (
    <div className={`glass-panel rounded-[18px] p-5 flex flex-col gap-3.5 relative overflow-hidden ${job.status === "new" ? "ring-1 ring-[#8B7CFF]/30" : ""}`}>
      <div className="flex gap-3 items-start">
        <Avatar id={job.id} name={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-white">{job.title[lang]}</span>
            {job.urgent && (
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F08A3C]/15 text-[#F5B93F] border border-[#F08A3C]/35">
                <Icon name="fire" size={9} /> {isFr ? "Urgent" : "Urgent"}
              </span>
            )}
          </div>
          <div className="text-xs text-white/50">{job.company} · {job.dist}</div>
        </div>
        <MatchRing score={job.match} size={44} stroke={4} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[job.pay, job.shift[lang], job.category[lang]].map((tag) => (
          <span key={tag} className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-[3px] text-[11px] text-white/80 font-semibold">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {job.status === "applied" ? (
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
  match: JobMatch | null;
  onClose: () => void;
  onSign: () => void;
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
          [isFr ? "Poste" : "Role", match.title[lang]],
          [isFr ? "Salaire" : "Pay", match.pay],
          [isFr ? "Date de début" : "Start date", match.date],
          [isFr ? "Quart" : "Shift", match.shift[lang]],
          [isFr ? "Adresse" : "Address", match.address],
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
              onClick={onSign}
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

export default function DemoWorkerDashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"jobs" | "matches" | "bookings" | "messages" | "account">("jobs");
  const [filter, setFilter] = useState<"all" | "new" | "high" | "applied">("all");
  const [feed, setFeed] = useState<JobFeedItem[]>(INITIAL_FEED);
  const [matches, setMatches] = useState<JobMatch[]>(INITIAL_MATCHES);
  const [bookings, setBookings] = useState<WorkerBooking[]>(INITIAL_BOOKINGS);
  const [signTarget, setSignTarget] = useState<JobMatch | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [thread, setThread] = useState<number | null>(null);
  const [account, setAccount] = useState({
    name: "Alexandre Martin",
    email: "alex.martin@example.com",
    phone: "+1 514 555-0199",
    postal: "H2X 1Y3",
    radius: "10 km",
    availability: "Matins · Lun–Ven",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredFeed = useMemo(
    () =>
      feed.filter((j) =>
        filter === "new" ? j.status === "new" : filter === "high" ? j.match >= 85 : filter === "applied" ? j.status === "applied" : true,
      ),
    [feed, filter],
  );

  const avgMatch = useMemo(() => (feed.length ? Math.round(feed.reduce((s, j) => s + j.match, 0) / feed.length) : 0), [feed]);
  const appliedCount = useMemo(() => feed.filter((j) => j.status === "applied").length, [feed]);
  const activeMatchCount = useMemo(() => matches.filter((m) => m.status === "active" || m.status === "signed").length, [matches]);

  const threads = useMemo(
    () =>
      matches
        .filter((m) => m.status === "active" || m.status === "signed")
        .map((m) => ({
          match: m,
          preview: isFr ? "Merci d'avoir postulé! Peux-tu commencer lundi matin?" : "Thanks for applying! Can you start Monday morning?",
          time: isFr ? "Il y a 3h" : "3h ago",
          unread: m.status === "active",
        })),
    [matches, isFr],
  );

  const applyToJob = (job: JobFeedItem) => {
    setFeed((f) => f.map((j) => (j.id === job.id ? { ...j, status: "applied" } : j)));
    showToast(isFr ? `Candidature envoyée à ${job.company}!` : `Application sent to ${job.company}!`);
  };

  const passJob = (job: JobFeedItem) => {
    setFeed((f) => f.filter((j) => j.id !== job.id));
  };

  const confirmSign = () => {
    if (!signTarget) return;
    setMatches((ms) => ms.map((m) => (m.id === signTarget.id ? { ...m, status: "signed" } : m)));
    showToast(isFr ? "Contrat signé!" : "Contract signed!");
    setSignTarget(null);
  };

  const markReviewed = (id: number) => {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, reviewed: true } : b)));
    showToast(isFr ? "Merci pour votre avis!" : "Thanks for your review!");
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
          {tab === "jobs" && (
            <div>
              <div className="flex gap-4 mb-7 flex-wrap">
                <StatCard icon="bolt" label={isFr ? "Nouvelles offres" : "New jobs"} value={String(feed.filter((j) => j.status === "new").length)} sub={isFr ? "Aujourd'hui" : "Today"} color="#8B7CFF" />
                <StatCard icon="eye" label={isFr ? "Offres vues" : "Jobs viewed"} value="24" sub={isFr ? "Cette semaine" : "This week"} color="#5B8CFF" />
                <StatCard icon="send" label={isFr ? "Candidatures" : "Applications"} value={String(appliedCount)} sub={isFr ? "Envoyées" : "Sent"} color="#7CE0A8" />
                <StatCard icon="star" label={isFr ? "Match moyen" : "Avg match"} value={`${avgMatch}%`} sub={isFr ? "Sur vos offres" : "Across your jobs"} color="#F5B93F" />
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
                  {isFr ? "Aucune offre avec ce filtre." : "No jobs match this filter."}
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                  {filteredFeed.map((j) => (
                    <JobCard key={j.id} job={j} onApply={applyToJob} onPass={passJob} />
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
              <div className="flex flex-col gap-3.5">
                {matches.map((m) => {
                  const st = MATCH_STATUS_STYLE[m.status];
                  return (
                    <div key={m.id} className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap">
                      <Avatar id={m.id} name={m.company} />
                      <div className="flex-1 min-w-[180px]">
                        <div className="flex gap-2 items-center mb-1 flex-wrap">
                          <span className="font-display text-base font-extrabold text-white">{m.title[lang]}</span>
                          <StatusPill label={st.label[lang]} color={st.color} />
                        </div>
                        <div className="text-xs text-white/50">{m.company} · {m.pay}</div>
                      </div>
                      <MatchRing score={m.match} size={40} stroke={4} />
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
                            onClick={() => {
                              setTab("messages");
                              setThread(m.id);
                            }}
                            className="px-3.5 py-2 rounded-[9px] bg-[#8B7CFF]/10 border border-[#8B7CFF]/35 text-[#B3A6FF] text-xs font-bold cursor-pointer hover:bg-[#8B7CFF]/20 transition-colors"
                          >
                            {isFr ? "Message" : "Message"}
                          </button>
                        )}
                        {m.status === "pending" && (
                          <span className="text-[11px] text-white/40 italic px-1">
                            {isFr ? "L'employeur doit débloquer votre profil" : "Employer needs to unlock your profile"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              <div className="flex flex-col gap-4">
                {bookings.map((b) => {
                  const idx = BOOKING_STATUS_INDEX[b.status];
                  return (
                    <div key={b.id} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-3 flex-wrap justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar id={b.id} name={b.freelancerName} size={40} />
                          <div>
                            <div className="font-display text-[15px] font-extrabold text-white">{b.title[lang]}</div>
                            <div className="text-xs text-white/50">{b.freelancerName} · {b.category[lang]} · {b.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-extrabold text-[#B3A6FF]">${b.amount}</div>
                          <div className="text-[10px] text-white/40">{isFr ? "dont 15% frais" : "incl. 15% fee"}</div>
                        </div>
                      </div>
                      <div className="px-1">
                        <StepTracker steps={BOOKING_STEPS[lang]} currentIndex={idx} />
                      </div>
                      {(b.status === "completed" || b.status === "paid_out") && (
                        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/[0.06]">
                          {b.reviewed ? (
                            <span className="text-[12px] text-[#7CE0A8] font-bold flex items-center gap-1.5">
                              <Icon name="check" size={13} /> {isFr ? "Avis laissé" : "Review left"}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => markReviewed(b.id)}
                                  aria-label={`${star} star`}
                                  className="bg-transparent border-none cursor-pointer p-0.5 text-[#F5B93F]/40 hover:text-[#F5B93F] transition-colors"
                                >
                                  <Icon name="star" size={16} />
                                </button>
                              ))}
                            </div>
                          )}
                          {b.status === "completed" && (
                            <button
                              onClick={() => showToast(isFr ? "Bientôt disponible!" : "Coming soon!")}
                              className="text-[11px] text-white/40 hover:text-white/70 font-semibold cursor-pointer bg-transparent border-none underline decoration-dotted"
                            >
                              {isFr ? "Signaler un problème (fenêtre 48h)" : "Report an issue (48h window)"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "messages" && (
            <div>
              <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                {isFr ? "Messages" : "Messages"}
              </h2>
              {threads.length === 0 ? (
                <p className="text-white/50 text-sm py-8 text-center">
                  {isFr ? "Aucune conversation pour l'instant." : "No conversations yet."}
                </p>
              ) : (
                <div className="glass-panel rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]">
                  <div className="border-b md:border-b-0 md:border-r border-white/10 max-h-[520px] overflow-y-auto">
                    {threads.map((t) => (
                      <button
                        key={t.match.id}
                        onClick={() => setThread(t.match.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 border-none text-left cursor-pointer border-b border-white/[0.06] last:border-b-0 ${
                          thread === t.match.id ? "bg-[#8B7CFF]/10" : "bg-transparent hover:bg-white/[0.03]"
                        }`}
                      >
                        <Avatar id={t.match.id} name={t.match.company} size={38} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-bold text-white truncate">{t.match.company}</span>
                            {t.unread && <span className="w-2 h-2 rounded-full bg-[#8B7CFF] shrink-0" />}
                          </div>
                          <div className="text-[11px] text-white/50 truncate">{t.preview}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-6 flex flex-col min-h-[320px]">
                    {(() => {
                      const active = threads.find((t) => t.match.id === thread) ?? threads[0];
                      if (!active) return null;
                      return (
                        <>
                          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
                            <Avatar id={active.match.id} name={active.match.company} size={40} />
                            <div>
                              <div className="text-sm font-bold text-white">{active.match.company}</div>
                              <div className="text-[11px] text-white/50">{active.match.title[lang]}</div>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-3">
                            <div className="self-start max-w-[75%] bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] text-white/85">
                              {active.preview}
                            </div>
                            <div className="self-end max-w-[75%] grad-violet rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] text-white">
                              {isFr ? "Oui, disponible dès lundi 8h!" : "Yes, available starting Monday 8am!"}
                            </div>
                            <div className="text-[10px] text-white/35 text-center mt-1">{active.time}</div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <input
                              className="field flex-1"
                              placeholder={isFr ? "Écrire un message…" : "Write a message…"}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") showToast(isFr ? "Bientôt disponible!" : "Coming soon!");
                              }}
                            />
                            <button
                              onClick={() => showToast(isFr ? "Bientôt disponible!" : "Coming soon!")}
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
              {(
                [
                  ["name", isFr ? "Nom complet" : "Full name"],
                  ["email", isFr ? "Courriel" : "Email"],
                  ["phone", isFr ? "Téléphone" : "Phone"],
                  ["postal", isFr ? "Code postal" : "Postal code"],
                  ["radius", isFr ? "Rayon de déplacement" : "Commute radius"],
                  ["availability", isFr ? "Disponibilités" : "Availability"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="mb-4">
                  <label htmlFor={`acct-${key}`} className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
                    {label}
                  </label>
                  <input
                    id={`acct-${key}`}
                    className="field"
                    value={account[key]}
                    onChange={(e) => setAccount((a) => ({ ...a, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <button
                onClick={() => showToast(isFr ? "Compte mis à jour!" : "Account updated!")}
                className="mt-2 px-6 py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02]"
              >
                {isFr ? "Sauvegarder" : "Save changes"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
