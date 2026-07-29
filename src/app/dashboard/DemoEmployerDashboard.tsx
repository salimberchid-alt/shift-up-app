"use client";

// Fictive demo data only — used exclusively by /dashboard/demo. Never wire
// this file to Supabase; the real, data-backed version is EmployerDashboard.tsx.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { BrandMark, LangToggle, MatchRing } from "@/components/ui";
import {
  Icon, type IconName, Avatar, StatCard, StatusPill, Toast, Modal, MobileTabBar, SideNav,
} from "@/components/dashboard/shared";

type CandidateStatus = "new" | "contacted" | "interviewed";

interface Candidate {
  id: number;
  name: string;
  role: { fr: string; en: string };
  match: number;
  dist: string;
  avail: { fr: string; en: string };
  langs: { fr: string; en: string };
  exp: { fr: string; en: string };
  status: CandidateStatus;
  superliked: boolean;
}

const CANDIDATES: Candidate[] = [
  { id: 1, name: "Alexandre M.", role: { fr: "Barista", en: "Barista" }, match: 96, dist: "0.8 km", avail: { fr: "Matins · Lun–Ven", en: "Mornings · Mon–Fri" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "2 ans", en: "2 yrs" }, status: "new", superliked: true },
  { id: 2, name: "Sofia R.", role: { fr: "Serveuse", en: "Server" }, match: 91, dist: "1.2 km", avail: { fr: "Soirs · Week-ends", en: "Evenings · Weekends" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "3 ans", en: "3 yrs" }, status: "new", superliked: false },
  { id: 3, name: "Marcus T.", role: { fr: "Entrepôt", en: "Warehouse" }, match: 88, dist: "2.1 km", avail: { fr: "Jours · Flexible", en: "Days · Flexible" }, langs: { fr: "Anglais", en: "English" }, exp: { fr: "1 an", en: "1 yr" }, status: "contacted", superliked: false },
  { id: 4, name: "Camille B.", role: { fr: "Commerce", en: "Retail" }, match: 82, dist: "0.5 km", avail: { fr: "Après-midi · Fins de sem.", en: "Afternoons · Weekends" }, langs: { fr: "Français", en: "French" }, exp: { fr: "4 ans", en: "4 yrs" }, status: "new", superliked: false },
  { id: 5, name: "Jordan L.", role: { fr: "Sécurité", en: "Security" }, match: 79, dist: "3.0 km", avail: { fr: "Nuits · Week-ends", en: "Nights · Weekends" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "5 ans", en: "5 yrs" }, status: "interviewed", superliked: false },
  { id: 6, name: "Priya S.", role: { fr: "Bureau", en: "Office" }, match: 74, dist: "1.8 km", avail: { fr: "Temps plein · Flexible", en: "Full-time · Flexible" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "2 ans", en: "2 yrs" }, status: "new", superliked: false },
];

const JOBS = [
  { id: 1, title: { fr: "Barista", en: "Barista" }, status: "active", matches: 12, views: 48, posted: { fr: "Il y a 2j", en: "2d ago" }, urgent: true },
  { id: 2, title: { fr: "Commis d'entrepôt", en: "Warehouse clerk" }, status: "active", matches: 7, views: 31, posted: { fr: "Il y a 4j", en: "4d ago" }, urgent: false },
  { id: 3, title: { fr: "Associé commerce", en: "Retail associate" }, status: "paused", matches: 3, views: 19, posted: { fr: "Il y a 1 sem", en: "1w ago" }, urgent: false },
];

interface Tx {
  id: number;
  desc: string;
  amount: number;
  date: string;
  type: "bundle" | "superlike" | "match";
}

const INITIAL_TX: Tx[] = [
  { id: 1, desc: "10 matchs — Forfait", amount: -99, date: "16 juin", type: "bundle" },
  { id: 2, desc: "Super like — Alexandre M.", amount: -5, date: "15 juin", type: "superlike" },
  { id: 3, desc: "1 match — Sofia R.", amount: -25, date: "14 juin", type: "match" },
  { id: 4, desc: "1 match — Marcus T.", amount: -25, date: "12 juin", type: "match" },
];

const MESSAGES = CANDIDATES.filter((c) => c.status !== "new").map((c) => ({
  candidate: c,
  preview: { fr: "Merci pour l'offre, je suis disponible dès lundi.", en: "Thanks for reaching out, I'm available starting Monday." },
  time: { fr: "Il y a 2h", en: "2h ago" },
  unread: c.status === "contacted",
}));

const STATUS_STYLE: Record<CandidateStatus, { color: string; label: { fr: string; en: string } }> = {
  new: { color: "#B3A6FF", label: { fr: "Nouveau", en: "New" } },
  contacted: { color: "#F5B93F", label: { fr: "Contacté", en: "Contacted" } },
  interviewed: { color: "#7CE0A8", label: { fr: "Rencontré", en: "Interviewed" } },
};

function CandidateCard({ c, onAction }: { c: Candidate; onAction: (c: Candidate, action: "contact" | "superlike") => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const st = STATUS_STYLE[c.status];
  return (
    <div className={`glass-panel rounded-[18px] p-5 flex flex-col gap-3.5 relative overflow-hidden ${c.status === "new" ? "ring-1 ring-[#8B7CFF]/30" : ""}`}>
      <div className="flex gap-3 items-start">
        <Avatar id={c.id} name={c.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-white">{c.name}</span>
            <StatusPill label={st.label[lang]} color={st.color} />
            {c.superliked && (
              <span className="flex items-center gap-1 bg-[#F5B93F]/15 border border-[#F5B93F]/40 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-[#F5B93F]">
                <Icon name="star" size={9} /> Super like
              </span>
            )}
          </div>
          <div className="text-xs text-white/50">{c.role[lang]} · {c.dist}</div>
        </div>
        <MatchRing score={c.match} size={44} stroke={4} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[c.avail[lang], c.langs[lang], `${c.exp[lang]} exp.`].map((tag) => (
          <span key={tag} className="bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-[3px] text-[11px] text-white/80 font-semibold">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAction(c, "contact")}
          className="flex-1 py-2.5 rounded-[11px] grad-violet border-none text-white text-xs font-bold cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
        >
          <Icon name="bolt" size={13} /> {isFr ? "Connecter ($25)" : "Connect ($25)"}
        </button>
        <button
          onClick={() => onAction(c, "superlike")}
          className="px-3.5 py-2.5 rounded-[11px] bg-[#F5B93F]/10 border border-[#F5B93F]/40 text-[#F5B93F] text-xs font-bold cursor-pointer transition-colors hover:bg-[#F5B93F]/20 flex items-center gap-1"
        >
          <Icon name="star" size={12} /> $5
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  action,
  candidate,
  onClose,
  onConfirm,
}: {
  action: "contact" | "superlike" | null;
  candidate: Candidate | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  if (!action || !candidate) return null;

  const cfg =
    action === "contact"
      ? {
          title: isFr ? "Connecter avec ce candidat" : "Connect with this candidate",
          body: isFr
            ? `Vous allez utiliser 1 match ($25) pour contacter ${candidate.name}. Une fois connectés, vous pourrez échanger directement.`
            : `You'll use 1 match ($25) to contact ${candidate.name}. Once connected, you can message directly.`,
          cta: isFr ? "Confirmer & payer $25" : "Confirm & pay $25",
          color: "#8B7CFF",
        }
      : {
          title: isFr ? "Super like" : "Super like",
          body: isFr
            ? `Mettre en avant le profil de ${candidate.name} pour $5. Le candidat verra votre intérêt en priorité. Le match ($25) sera facturé s'il accepte.`
            : `Highlight ${candidate.name}'s profile for $5. The candidate sees your interest first. Match fee ($25) charged if they accept.`,
          cta: isFr ? "Envoyer le super like ($5)" : "Send super like ($5)",
          color: "#F5B93F",
        };

  return (
    <Modal onClose={onClose} maxWidth={400} ariaLabel={cfg.title}>
      <h3 className="font-display text-xl font-extrabold text-white mb-3">{cfg.title}</h3>
      <p className="text-[13px] text-white/65 leading-relaxed mb-6">{cfg.body}</p>
      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/60 text-[13px] font-bold cursor-pointer hover:text-white transition-colors"
        >
          {isFr ? "Annuler" : "Cancel"}
        </button>
        <button
          onClick={onConfirm}
          className="flex-[2] py-3 rounded-[11px] border-none text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: cfg.color, color: action === "contact" ? "#fff" : "#231506" }}
        >
          {cfg.cta}
        </button>
      </div>
    </Modal>
  );
}

const BUNDLES = [
  { l: { fr: "1 match", en: "1 match" }, p: "$25", credits: 1, cost: 25 },
  { l: { fr: "10 matchs", en: "10 matches" }, p: "$99", credits: 10, cost: 99 },
];

const PRICING_PLANS = [
  {
    icon: "bolt" as IconName,
    color: "#8B7CFF",
    title: { fr: "Par connexion", en: "Per connect" },
    price: "$25",
    sub: { fr: "par candidat contacté", en: "per candidate contacted" },
    body: { fr: "Payez seulement quand vous voulez parler à un candidat. Aucun abonnement, aucun frais caché.", en: "Only pay when you want to reach out to a candidate. No subscription, no hidden fees." },
  },
  {
    icon: "star" as IconName,
    color: "#F5B93F",
    title: { fr: "Super like", en: "Super like" },
    price: "$5",
    sub: { fr: "pour se démarquer", en: "to stand out" },
    body: { fr: "Mettez votre offre en priorité dans la file du candidat. Le frais de match ($25) s'applique seulement s'il accepte.", en: "Bumps your offer to the top of the candidate's queue. The $25 match fee only applies if they accept." },
  },
  {
    icon: "tag" as IconName,
    color: "#7CE0A8",
    title: { fr: "Forfait 10 matchs", en: "10-match bundle" },
    price: "$99",
    sub: { fr: "$9.90 / match — 60% d'économie", en: "$9.90 / match — 60% savings" },
    body: { fr: "Le meilleur prix par match pour les entreprises qui recrutent activement chaque mois.", en: "The best per-match rate for businesses hiring regularly every month." },
  },
];

export default function DemoEmployerDashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"candidates" | "jobs" | "messages" | "pricing" | "billing" | "settings">("candidates");
  const [filter, setFilter] = useState<"all" | "new" | "superlike" | "contacted">("all");
  const [modal, setModal] = useState<"contact" | "superlike" | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [credits, setCredits] = useState(6);
  const [transactions, setTransactions] = useState<Tx[]>(INITIAL_TX);
  const [toast, setToast] = useState<string | null>(null);
  const [thread, setThread] = useState(MESSAGES[0]?.candidate.id ?? null);
  const [account, setAccount] = useState({
    name: "Café Noir",
    email: "info@cafenoir.ca",
    phone: "+1 514 555-0123",
    type: "Restaurant / Café",
    postal: "H2X 1Y3",
  });

  const spent = useMemo(() => transactions.reduce((s, tx) => s - tx.amount, 0), [transactions]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(
    () =>
      CANDIDATES.filter((c) =>
        filter === "new" ? c.status === "new" : filter === "superlike" ? c.superliked : filter === "contacted" ? c.status !== "new" : true,
      ),
    [filter],
  );

  const handleConfirm = () => {
    if (!selected) return;
    const today = isFr ? "aujourd'hui" : "today";
    if (modal === "contact") {
      setCredits((c) => Math.max(0, c - 1));
      setTransactions((txs) => [
        { id: Date.now(), desc: `1 match — ${selected.name}`, amount: -25, date: today, type: "match" },
        ...txs,
      ]);
      showToast(isFr ? `Connecté avec ${selected.name}!` : `Connected with ${selected.name}!`);
    } else {
      setTransactions((txs) => [
        { id: Date.now(), desc: `Super like — ${selected.name}`, amount: -5, date: today, type: "superlike" },
        ...txs,
      ]);
      showToast(isFr ? `Super like envoyé à ${selected.name}!` : `Super like sent to ${selected.name}!`);
    }
    setModal(null);
  };

  const buyBundle = (b: (typeof BUNDLES)[number]) => {
    setCredits((c) => c + b.credits);
    setTransactions((txs) => [
      {
        id: Date.now(),
        desc: `${b.credits} match${b.credits > 1 ? "s" : ""} — ${isFr ? "Forfait" : "Bundle"}`,
        amount: -b.cost,
        date: isFr ? "aujourd'hui" : "today",
        type: "bundle",
      },
      ...txs,
    ]);
    showToast(isFr ? `${b.credits} match(s) ajouté(s)!` : `${b.credits} match(es) added!`);
  };

  const NAV = [
    { id: "candidates", icon: "grid" as IconName, label: isFr ? "Candidats" : "Candidates" },
    { id: "jobs", icon: "briefcase" as IconName, label: isFr ? "Mes offres" : "My posts" },
    { id: "messages", icon: "message" as IconName, label: isFr ? "Messages" : "Messages" },
    { id: "pricing", icon: "tag" as IconName, label: isFr ? "Tarifs" : "Pricing" },
    { id: "billing", icon: "card" as IconName, label: isFr ? "Facturation" : "Billing" },
    { id: "settings", icon: "gear" as IconName, label: isFr ? "Compte" : "Account" },
  ] as const;

  const FILTERS = [
    { id: "all", label: isFr ? "Tous" : "All" },
    { id: "new", label: isFr ? "Nouveaux" : "New" },
    { id: "superlike", label: isFr ? "Super like" : "Super like" },
    { id: "contacted", label: isFr ? "Contactés" : "Contacted" },
  ] as const;

  return (
    <div className="bg-[#0a0810] min-h-screen text-white flex flex-col">
      <Toast message={toast} />

      <ConfirmModal action={modal} candidate={selected} onClose={() => setModal(null)} onConfirm={handleConfirm} />

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
            <span className="text-xs font-extrabold text-[#B3A6FF]">{credits}</span>
            <span className="hidden sm:inline text-[11px] text-white/50 font-semibold">
              {isFr ? "matchs restants" : "matches left"}
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
              <div className="text-xs font-extrabold text-white mb-2.5">
                {isFr ? "Recharger des matchs" : "Buy more matches"}
              </div>
              {BUNDLES.map((b) => (
                <button
                  key={b.p}
                  onClick={() => buyBundle(b)}
                  className="flex justify-between w-full px-2.5 py-2 rounded-[9px] border border-white/10 bg-white/[0.03] text-white text-[11px] font-bold cursor-pointer mb-1.5 transition-colors hover:border-[#8B7CFF]/50"
                >
                  <span>{b.l[lang]}</span>
                  <span className="text-[#B3A6FF]">{b.p}</span>
                </button>
              ))}
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-7 overflow-y-auto max-w-[1140px]">
          {tab === "candidates" && (
            <div>
              <div className="flex gap-4 mb-7 flex-wrap">
                <StatCard icon="bolt" label={isFr ? "Nouveaux matchs" : "New matches"} value="6" sub={isFr ? "Aujourd'hui" : "Today"} color="#8B7CFF" />
                <StatCard icon="users" label={isFr ? "Candidats vus" : "Candidates seen"} value="24" sub={isFr ? "Cette semaine" : "This week"} color="#5B8CFF" />
                <StatCard icon="check" label={isFr ? "Connectés" : "Connected"} value="4" sub={isFr ? "En attente de réponse" : "Awaiting reply"} color="#7CE0A8" />
                <StatCard icon="card" label={isFr ? "Dépensé" : "Spent"} value={`$${spent}`} sub={isFr ? "Ce mois-ci" : "This month"} color="#F5B93F" />
              </div>

              <div className="flex gap-2.5 mb-5 flex-wrap items-center">
                <h2 className="font-display text-lg font-extrabold text-white mr-2">
                  {isFr ? "Candidats recommandés" : "Recommended candidates"}
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

              {filtered.length === 0 ? (
                <p className="text-white/50 text-sm py-8 text-center">
                  {isFr ? "Aucun candidat avec ce filtre." : "No candidates match this filter."}
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                  {filtered.map((c) => (
                    <CandidateCard
                      key={c.id}
                      c={c}
                      onAction={(cand, action) => {
                        setSelected(cand);
                        setModal(action);
                      }}
                    />
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
              <div className="flex flex-col gap-3.5">
                {JOBS.map((j) => (
                  <div key={j.id} className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-5 flex-wrap">
                    <div className="flex-1 min-w-[160px]">
                      <div className="flex gap-2 items-center mb-1 flex-wrap">
                        <span className="font-display text-base font-extrabold text-white">{j.title[lang]}</span>
                        {j.urgent && (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F08A3C]/15 text-[#F5B93F] border border-[#F08A3C]/35">
                            <Icon name="fire" size={10} /> {isFr ? "Urgent" : "Urgent"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/50">{j.posted[lang]}</div>
                    </div>
                    <div className="flex gap-5 items-center">
                      <div className="text-center">
                        <div className="font-display text-[22px] font-extrabold text-[#B3A6FF]">{j.matches}</div>
                        <div className="text-[10px] text-white/50 font-semibold">{isFr ? "matchs" : "matches"}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-[22px] font-extrabold text-[#6FE0D0]">{j.views}</div>
                        <div className="text-[10px] text-white/50 font-semibold">{isFr ? "vues" : "views"}</div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                          j.status === "active" ? "bg-[#7CE0A8]/10 text-[#7CE0A8] border-[#7CE0A8]/35" : "bg-[#F5B93F]/10 text-[#F5B93F] border-[#F5B93F]/40"
                        }`}
                      >
                        {j.status === "active" ? (isFr ? "Actif" : "Active") : isFr ? "En pause" : "Paused"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => showToast(isFr ? "Bientôt disponible!" : "Coming soon!")}
                        className="px-3.5 py-2 rounded-[9px] bg-white/[0.04] border border-white/10 text-white/60 text-xs font-bold cursor-pointer hover:text-white transition-colors"
                      >
                        {isFr ? "Modifier" : "Edit"}
                      </button>
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
            </div>
          )}

          {tab === "messages" && (
            <div>
              <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                {isFr ? "Messages" : "Messages"}
              </h2>
              {MESSAGES.length === 0 ? (
                <p className="text-white/50 text-sm py-8 text-center">
                  {isFr ? "Aucune conversation pour l'instant." : "No conversations yet."}
                </p>
              ) : (
                <div className="glass-panel rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]">
                  <div className="border-b md:border-b-0 md:border-r border-white/10 max-h-[520px] overflow-y-auto">
                    {MESSAGES.map((m) => (
                      <button
                        key={m.candidate.id}
                        onClick={() => setThread(m.candidate.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 border-none text-left cursor-pointer border-b border-white/[0.06] last:border-b-0 ${
                          thread === m.candidate.id ? "bg-[#8B7CFF]/10" : "bg-transparent hover:bg-white/[0.03]"
                        }`}
                      >
                        <Avatar id={m.candidate.id} name={m.candidate.name} size={38} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-bold text-white truncate">{m.candidate.name}</span>
                            {m.unread && <span className="w-2 h-2 rounded-full bg-[#8B7CFF] shrink-0" />}
                          </div>
                          <div className="text-[11px] text-white/50 truncate">{m.preview[lang]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-6 flex flex-col min-h-[320px]">
                    {(() => {
                      const active = MESSAGES.find((m) => m.candidate.id === thread) ?? MESSAGES[0];
                      if (!active) return null;
                      return (
                        <>
                          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
                            <Avatar id={active.candidate.id} name={active.candidate.name} size={40} />
                            <div>
                              <div className="text-sm font-bold text-white">{active.candidate.name}</div>
                              <div className="text-[11px] text-white/50">{active.candidate.role[lang]}</div>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-3">
                            <div className="self-start max-w-[75%] bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] text-white/85">
                              {active.preview[lang]}
                            </div>
                            <div className="self-end max-w-[75%] grad-violet rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] text-white">
                              {isFr ? "Parfait, on peut se parler lundi matin ?" : "Great, can we chat Monday morning?"}
                            </div>
                            <div className="text-[10px] text-white/35 text-center mt-1">{active.time[lang]}</div>
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

          {tab === "pricing" && (
            <div>
              <h2 className="font-display text-[22px] font-extrabold text-white mb-2">
                {isFr ? "Tarifs" : "Pricing"}
              </h2>
              <p className="text-sm text-white/55 mb-7 max-w-[520px]">
                {isFr
                  ? "Aucun abonnement. Vous payez uniquement pour les candidats que vous contactez."
                  : "No subscription. You only pay for the candidates you reach out to."}
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 mb-8">
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
              <div className="glass-panel rounded-2xl p-6 flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <div className="font-display text-base font-extrabold text-white mb-1">
                    {isFr ? "Besoin de recharger?" : "Need more matches?"}
                  </div>
                  <div className="text-[12.5px] text-white/55">
                    {isFr ? "Achetez un forfait directement depuis la Facturation." : "Buy a bundle directly from Billing."}
                  </div>
                </div>
                <button
                  onClick={() => setTab("billing")}
                  className="px-5 py-2.5 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-1.5"
                >
                  {isFr ? "Aller à la facturation" : "Go to billing"} <Icon name="arrowRight" size={13} />
                </button>
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
                  <div className="font-display text-5xl font-extrabold text-[#B3A6FF] leading-none">{credits}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                    {isFr ? "Dépensé ce mois" : "Spent this month"}
                  </div>
                  <div className="font-display text-5xl font-extrabold text-[#F5B93F] leading-none">${spent}</div>
                  <div className="text-xs text-white/50 mt-1.5">
                    {transactions.length} {isFr ? "transactions" : "transactions"}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2 ml-auto">
                  {BUNDLES.map((b) => (
                    <button
                      key={b.p}
                      onClick={() => buyBundle(b)}
                      className="flex justify-between gap-5 px-4 py-2.5 rounded-[10px] border-[1.5px] border-white/10 bg-white/[0.03] text-white text-xs font-bold cursor-pointer transition-colors hover:border-[#8B7CFF]/50"
                    >
                      <span>{b.l[lang]}</span>
                      <span className="text-[#B3A6FF]">{b.p}</span>
                    </button>
                  ))}
                </div>
              </div>
              <h3 className="font-display text-base font-extrabold text-white mb-4">
                {isFr ? "Historique" : "Transaction history"}
              </h3>
              <div className="glass-panel rounded-2xl overflow-hidden">
                {transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between px-5 py-3.5 ${i < transactions.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                  >
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
                        <div className="text-[13px] font-bold text-white">{tx.desc}</div>
                        <div className="text-[11px] text-white/50">{tx.date}</div>
                      </div>
                    </div>
                    <div className="font-display text-base font-extrabold text-[#B3A6FF]">{tx.amount}$</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="max-w-[520px]">
              <h2 className="font-display text-[22px] font-extrabold text-white mb-6">
                {isFr ? "Mon compte" : "My account"}
              </h2>
              {(
                [
                  ["name", isFr ? "Nom de l'entreprise" : "Business name"],
                  ["email", isFr ? "Courriel" : "Email"],
                  ["phone", isFr ? "Téléphone" : "Phone"],
                  ["type", isFr ? "Type d'entreprise" : "Business type"],
                  ["postal", isFr ? "Code postal" : "Postal code"],
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
