"use client";

import { useMemo, useState } from "react";
import { LangProvider, useLang } from "@/lib/lang";
import { LangToggle, MatchRing, Wordmark } from "@/components/ui";

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
  emoji: string;
  superliked: boolean;
}

const CANDIDATES: Candidate[] = [
  { id: 1, name: "Alexandre M.", role: { fr: "Barista", en: "Barista" }, match: 96, dist: "0.8 km", avail: { fr: "Matins · Lun–Ven", en: "Mornings · Mon–Fri" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "2 ans", en: "2 yrs" }, status: "new", emoji: "☕", superliked: true },
  { id: 2, name: "Sofia R.", role: { fr: "Serveuse", en: "Server" }, match: 91, dist: "1.2 km", avail: { fr: "Soirs · Week-ends", en: "Evenings · Weekends" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "3 ans", en: "3 yrs" }, status: "new", emoji: "🍽️", superliked: false },
  { id: 3, name: "Marcus T.", role: { fr: "Entrepôt", en: "Warehouse" }, match: 88, dist: "2.1 km", avail: { fr: "Jours · Flexible", en: "Days · Flexible" }, langs: { fr: "Anglais", en: "English" }, exp: { fr: "1 an", en: "1 yr" }, status: "contacted", emoji: "📦", superliked: false },
  { id: 4, name: "Camille B.", role: { fr: "Commerce", en: "Retail" }, match: 82, dist: "0.5 km", avail: { fr: "Après-midi · Fins de sem.", en: "Afternoons · Weekends" }, langs: { fr: "Français", en: "French" }, exp: { fr: "4 ans", en: "4 yrs" }, status: "new", emoji: "🛍️", superliked: false },
  { id: 5, name: "Jordan L.", role: { fr: "Sécurité", en: "Security" }, match: 79, dist: "3.0 km", avail: { fr: "Nuits · Week-ends", en: "Nights · Weekends" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "5 ans", en: "5 yrs" }, status: "interviewed", emoji: "🛡️", superliked: false },
  { id: 6, name: "Priya S.", role: { fr: "Bureau", en: "Office" }, match: 74, dist: "1.8 km", avail: { fr: "Temps plein · Flexible", en: "Full-time · Flexible" }, langs: { fr: "Bilingue", en: "Bilingual" }, exp: { fr: "2 ans", en: "2 yrs" }, status: "new", emoji: "💻", superliked: false },
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

const STATUS_STYLE: Record<CandidateStatus, { color: string; label: { fr: string; en: string } }> = {
  new: { color: "#FF4D6D", label: { fr: "Nouveau", en: "New" } },
  contacted: { color: "#FFD166", label: { fr: "Contacté", en: "Contacted" } },
  interviewed: { color: "#06E5A8", label: { fr: "Rencontré", en: "Interviewed" } },
};

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-card border border-line rounded-2xl px-5 py-5 flex-1 min-w-[140px]">
      <div className="text-[22px] mb-2.5">{icon}</div>
      <div className="font-display text-[28px] font-extrabold mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs font-bold text-cream mb-0.5">{label}</div>
      <div className="text-[11px] text-fog">{sub}</div>
    </div>
  );
}

function CandidateCard({ c, onAction }: { c: Candidate; onAction: (c: Candidate, action: "contact" | "superlike") => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const st = STATUS_STYLE[c.status];
  return (
    <div className={`bg-card border-[1.5px] rounded-[18px] p-5 flex flex-col gap-3.5 relative overflow-hidden ${c.status === "new" ? "border-coral/35" : "border-line"}`}>
      {c.superliked && (
        <div className="absolute top-3 right-3 bg-gold/15 border border-gold/40 rounded-full px-2.5 py-[3px] text-[10px] font-extrabold text-gold">
          ⭐ Super like
        </div>
      )}
      <div className="flex gap-3 items-start">
        <div className="w-[46px] h-[46px] rounded-[14px] grad-coral flex items-center justify-center text-xl shrink-0">
          {c.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-cream">{c.name}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}40` }}
            >
              {st.label[lang]}
            </span>
          </div>
          <div className="text-xs text-fog">{c.role[lang]} · {c.dist}</div>
        </div>
        <MatchRing score={c.match} size={44} stroke={4} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[c.avail[lang], c.langs[lang], `${c.exp[lang]} exp.`].map((tag) => (
          <span key={tag} className="bg-soft border border-line rounded-lg px-2.5 py-[3px] text-[11px] text-cream font-semibold">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAction(c, "contact")}
          className="flex-1 py-2.5 rounded-[11px] grad-coral border-none text-white text-xs font-bold cursor-pointer transition-transform hover:scale-[1.02]"
        >
          ⚡ {isFr ? "Connecter ($25)" : "Connect ($25)"}
        </button>
        <button
          onClick={() => onAction(c, "superlike")}
          className="px-3.5 py-2.5 rounded-[11px] bg-gold/10 border border-gold/40 text-gold text-xs font-bold cursor-pointer transition-colors hover:bg-gold/20"
        >
          ⭐ $5
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
          color: "#FF4D6D",
        }
      : {
          title: "Super like ⭐",
          body: isFr
            ? `Mettre en avant le profil de ${candidate.name} pour $5. Le candidat verra votre intérêt en priorité. Le match ($25) sera facturé s'il accepte.`
            : `Highlight ${candidate.name}'s profile for $5. The candidate sees your interest first. Match fee ($25) charged if they accept.`,
          cta: isFr ? "Envoyer le super like ($5)" : "Send super like ($5)",
          color: "#FFD166",
        };

  return (
    <div
      className="fixed inset-0 bg-black/65 z-[1000] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={cfg.title}
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line rounded-[22px] p-7 max-w-[400px] w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-extrabold text-cream mb-3">{cfg.title}</h3>
        <p className="text-[13px] text-fog leading-relaxed mb-6">{cfg.body}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[11px] bg-soft border border-line text-fog text-[13px] font-bold cursor-pointer hover:text-cream transition-colors"
          >
            {isFr ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="flex-[2] py-3 rounded-[11px] border-none text-ink text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: cfg.color, color: action === "contact" ? "#fff" : "#07070F" }}
          >
            {cfg.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

const BUNDLES = [
  { l: { fr: "1 match", en: "1 match" }, p: "$25", credits: 1, cost: 25 },
  { l: { fr: "10 matchs", en: "10 matches" }, p: "$99", credits: 10, cost: 99 },
];

function Dashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"candidates" | "jobs" | "billing" | "settings">("candidates");
  const [filter, setFilter] = useState<"all" | "new" | "superlike" | "contacted">("all");
  const [modal, setModal] = useState<"contact" | "superlike" | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [credits, setCredits] = useState(6);
  const [transactions, setTransactions] = useState<Tx[]>(INITIAL_TX);
  const [toast, setToast] = useState<string | null>(null);
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
      showToast(isFr ? `✅ Connecté avec ${selected.name}!` : `✅ Connected with ${selected.name}!`);
    } else {
      setTransactions((txs) => [
        { id: Date.now(), desc: `Super like — ${selected.name}`, amount: -5, date: today, type: "superlike" },
        ...txs,
      ]);
      showToast(isFr ? `⭐ Super like envoyé à ${selected.name}!` : `⭐ Super like sent to ${selected.name}!`);
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
    showToast(isFr ? `✅ ${b.credits} match(s) ajouté(s)!` : `✅ ${b.credits} match(es) added!`);
  };

  const NAV = [
    { id: "candidates", icon: "👥", label: isFr ? "Candidats" : "Candidates" },
    { id: "jobs", icon: "📋", label: isFr ? "Mes offres" : "My posts" },
    { id: "billing", icon: "💳", label: isFr ? "Facturation" : "Billing" },
    { id: "settings", icon: "⚙️", label: isFr ? "Compte" : "Account" },
  ] as const;

  const FILTERS = [
    { id: "all", label: isFr ? "Tous" : "All" },
    { id: "new", label: isFr ? "Nouveaux" : "New" },
    { id: "superlike", label: "⭐ Super like" },
    { id: "contacted", label: isFr ? "Contactés" : "Contacted" },
  ] as const;

  return (
    <div className="bg-ink min-h-screen text-cream flex flex-col">
      {toast && (
        <div
          role="status"
          className="fixed top-6 right-6 bg-mint text-ink px-5 py-3 rounded-xl text-[13px] font-bold z-[2000] shadow-xl animate-toast-in"
        >
          {toast}
        </div>
      )}

      <ConfirmModal action={modal} candidate={selected} onClose={() => setModal(null)} onConfirm={handleConfirm} />

      <header className="bg-surface border-b border-line px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <a href="/" className="no-underline shrink-0">
            <Wordmark className="text-lg" />
          </a>
          <span className="hidden sm:inline text-[11px] text-fog border-l border-line pl-4">
            {isFr ? "Dashboard Employeur" : "Employer Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-coral/10 border border-coral/35 rounded-full px-3.5 py-1.5">
            <span className="text-xs font-extrabold text-coral">{credits}</span>
            <span className="hidden sm:inline text-[11px] text-fog font-semibold">
              {isFr ? "matchs restants" : "matches left"}
            </span>
          </div>
          <LangToggle compact />
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex bg-surface border-b border-line overflow-x-auto">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex-1 min-w-fit px-4 py-3 flex items-center justify-center gap-1.5 border-none text-xs font-bold cursor-pointer whitespace-nowrap ${
              tab === n.id ? "bg-coral/10 text-coral" : "bg-transparent text-fog"
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1">
        <aside className="hidden lg:flex w-[220px] bg-surface border-r border-line px-3 py-5 flex-col gap-1 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              aria-current={tab === n.id ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[11px] border-none text-[13px] font-bold cursor-pointer text-left transition-colors ${
                tab === n.id ? "bg-coral/10 text-coral" : "bg-transparent text-fog hover:text-cream"
              }`}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="bg-gradient-to-br from-coral/10 to-mint/5 border border-coral/30 rounded-[14px] p-4 mt-4">
            <div className="text-xs font-extrabold text-cream mb-2.5">
              {isFr ? "Recharger des matchs" : "Buy more matches"}
            </div>
            {BUNDLES.map((b) => (
              <button
                key={b.p}
                onClick={() => buyBundle(b)}
                className="flex justify-between w-full px-2.5 py-2 rounded-[9px] border border-line bg-soft text-cream text-[11px] font-bold cursor-pointer mb-1.5 transition-colors hover:border-coral/50"
              >
                <span>{b.l[lang]}</span>
                <span className="text-coral">{b.p}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-7 overflow-y-auto max-w-[1100px]">
          {tab === "candidates" && (
            <div>
              <div className="flex gap-4 mb-7 flex-wrap">
                <StatCard icon="⚡" label={isFr ? "Nouveaux matchs" : "New matches"} value="6" sub={isFr ? "Aujourd'hui" : "Today"} color="#FF4D6D" />
                <StatCard icon="👥" label={isFr ? "Candidats vus" : "Candidates seen"} value="24" sub={isFr ? "Cette semaine" : "This week"} color="#4EA8DE" />
                <StatCard icon="✅" label={isFr ? "Connectés" : "Connected"} value="4" sub={isFr ? "En attente de réponse" : "Awaiting reply"} color="#06E5A8" />
                <StatCard icon="💰" label={isFr ? "Dépensé" : "Spent"} value={`$${spent}`} sub={isFr ? "Ce mois-ci" : "This month"} color="#FFD166" />
              </div>

              <div className="flex gap-2.5 mb-5 flex-wrap items-center">
                <h2 className="font-display text-lg font-extrabold text-cream mr-2">
                  {isFr ? "Candidats recommandés" : "Recommended candidates"}
                </h2>
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                    className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-xs font-bold cursor-pointer transition-colors ${
                      filter === f.id ? "border-coral bg-coral/10 text-coral" : "border-line bg-soft text-fog hover:text-cream"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <p className="text-fog text-sm py-8 text-center">
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
                <h2 className="font-display text-[22px] font-extrabold text-cream">
                  {isFr ? "Mes offres d'emploi" : "My job posts"}
                </h2>
                <button
                  onClick={() => showToast(isFr ? "🚧 Bientôt disponible!" : "🚧 Coming soon!")}
                  className="px-5 py-2.5 rounded-[11px] grad-coral border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  + {isFr ? "Publier une offre" : "Post a job"}
                </button>
              </div>
              <div className="flex flex-col gap-3.5">
                {JOBS.map((j) => (
                  <div
                    key={j.id}
                    className={`bg-card border rounded-2xl px-5 py-4 flex items-center gap-5 flex-wrap ${j.status === "active" ? "border-mint/35" : "border-line"}`}
                  >
                    <div className="flex-1 min-w-[160px]">
                      <div className="flex gap-2 items-center mb-1 flex-wrap">
                        <span className="font-display text-base font-extrabold text-cream">{j.title[lang]}</span>
                        {j.urgent && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-coral/15 text-coral border border-coral/35">
                            🔥 Urgent
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-fog">{j.posted[lang]}</div>
                    </div>
                    <div className="flex gap-5 items-center">
                      <div className="text-center">
                        <div className="font-display text-[22px] font-extrabold text-coral">{j.matches}</div>
                        <div className="text-[10px] text-fog font-semibold">{isFr ? "matchs" : "matches"}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-[22px] font-extrabold text-sky">{j.views}</div>
                        <div className="text-[10px] text-fog font-semibold">{isFr ? "vues" : "views"}</div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                          j.status === "active" ? "bg-mint/10 text-mint border-mint/35" : "bg-gold/10 text-gold border-gold/40"
                        }`}
                      >
                        {j.status === "active" ? (isFr ? "Actif" : "Active") : isFr ? "En pause" : "Paused"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => showToast(isFr ? "🚧 Bientôt disponible!" : "🚧 Coming soon!")}
                        className="px-3.5 py-2 rounded-[9px] bg-soft border border-line text-fog text-xs font-bold cursor-pointer hover:text-cream transition-colors"
                      >
                        {isFr ? "Modifier" : "Edit"}
                      </button>
                      <button
                        onClick={() => setTab("candidates")}
                        className="px-3.5 py-2 rounded-[9px] bg-coral/10 border border-coral/35 text-coral text-xs font-bold cursor-pointer hover:bg-coral/20 transition-colors"
                      >
                        {isFr ? "Voir candidats" : "View candidates"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div>
              <h2 className="font-display text-[22px] font-extrabold text-cream mb-6">
                {isFr ? "Facturation" : "Billing"}
              </h2>
              <div className="bg-gradient-to-br from-card to-surface border border-line rounded-[20px] p-7 mb-6 flex gap-10 flex-wrap">
                <div>
                  <div className="text-[11px] font-bold text-fog tracking-widest uppercase mb-2">
                    {isFr ? "Matchs restants" : "Matches remaining"}
                  </div>
                  <div className="font-display text-5xl font-extrabold text-coral leading-none">{credits}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-fog tracking-widest uppercase mb-2">
                    {isFr ? "Dépensé ce mois" : "Spent this month"}
                  </div>
                  <div className="font-display text-5xl font-extrabold text-gold leading-none">${spent}</div>
                  <div className="text-xs text-fog mt-1.5">
                    {transactions.length} {isFr ? "transactions" : "transactions"}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-2 ml-auto">
                  {BUNDLES.map((b) => (
                    <button
                      key={b.p}
                      onClick={() => buyBundle(b)}
                      className="flex justify-between gap-5 px-4 py-2.5 rounded-[10px] border-[1.5px] border-line bg-soft text-cream text-xs font-bold cursor-pointer transition-colors hover:border-coral/50"
                    >
                      <span>{b.l[lang]}</span>
                      <span className="text-coral">{b.p}</span>
                    </button>
                  ))}
                </div>
              </div>
              <h3 className="font-display text-base font-extrabold text-cream mb-4">
                {isFr ? "Historique" : "Transaction history"}
              </h3>
              <div className="bg-card border border-line rounded-2xl overflow-hidden">
                {transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between px-5 py-3.5 ${i < transactions.length - 1 ? "border-b border-line" : ""}`}
                  >
                    <div className="flex gap-3 items-center">
                      <div
                        className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-base ${
                          tx.type === "bundle" ? "bg-coral/10" : tx.type === "superlike" ? "bg-gold/10" : "bg-mint/10"
                        }`}
                      >
                        {tx.type === "bundle" ? "📦" : tx.type === "superlike" ? "⭐" : "⚡"}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-cream">{tx.desc}</div>
                        <div className="text-[11px] text-fog">{tx.date}</div>
                      </div>
                    </div>
                    <div className="font-display text-base font-extrabold text-coral">{tx.amount}$</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="max-w-[520px]">
              <h2 className="font-display text-[22px] font-extrabold text-cream mb-6">
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
                  <label htmlFor={`acct-${key}`} className="block text-[11px] font-bold text-fog tracking-wider uppercase mb-1.5">
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
                onClick={() => showToast(isFr ? "✅ Compte mis à jour!" : "✅ Account updated!")}
                className="mt-2 px-6 py-3 rounded-[11px] grad-coral border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02]"
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

export default function Page() {
  return (
    <LangProvider>
      <Dashboard />
    </LangProvider>
  );
}
