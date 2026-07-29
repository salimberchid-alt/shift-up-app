"use client";

// Fictive demo data only — used exclusively by /dashboard/demo. Never wire
// this file to Supabase; the real, data-backed version is FreelancerDashboard.tsx.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { BrandMark, LangToggle } from "@/components/ui";
import {
  Icon, type IconName, Avatar, StatCard, StatusPill, Toast, Modal, MobileTabBar, SideNav, StepTracker, PillGroup,
} from "@/components/dashboard/shared";

const SELLER_FEE_RATE = 0.15;
function feeSplit(subtotal: number) {
  const fee = Math.round(subtotal * SELLER_FEE_RATE);
  return { fee, payout: subtotal - fee };
}

type ListingType = "hourly" | "package";
type ListingStatus = "draft" | "active" | "paused";

interface Listing {
  id: number;
  title: { fr: string; en: string };
  category: { fr: string; en: string };
  type: ListingType;
  price: { fr: string; en: string };
  status: ListingStatus;
  views: number;
}

const INITIAL_LISTINGS: Listing[] = [
  { id: 1, title: { fr: "Séance photo produit", en: "Product photo session" }, category: { fr: "Photographie", en: "Photography" }, type: "hourly", price: { fr: "65$/h", en: "$65/h" }, status: "active", views: 214 },
  { id: 2, title: { fr: "Vidéo promo réseaux sociaux (30s)", en: "Social promo video (30s)" }, category: { fr: "Vidéo", en: "Video" }, type: "package", price: { fr: "320$", en: "$320" }, status: "active", views: 156 },
  { id: 3, title: { fr: "Retouche portrait ×10", en: "Portrait retouching ×10" }, category: { fr: "Retouche photo", en: "Photo editing" }, type: "package", price: { fr: "80$", en: "$80" }, status: "paused", views: 47 },
  { id: 4, title: { fr: "Campagne UGC personnalisée", en: "Custom UGC campaign" }, category: { fr: "UGC", en: "UGC" }, type: "package", price: { fr: "450$", en: "$450" }, status: "draft", views: 0 },
];

const LISTING_TYPE_LABEL: Record<ListingType, { fr: string; en: string }> = {
  hourly: { fr: "Horaire", en: "Hourly" },
  package: { fr: "Forfait", en: "Package" },
};

const LISTING_STATUS_STYLE: Record<ListingStatus, { color: string; label: { fr: string; en: string } }> = {
  draft: { color: "#9c9cc4", label: { fr: "Brouillon", en: "Draft" } },
  active: { color: "#7CE0A8", label: { fr: "Active", en: "Active" } },
  paused: { color: "#F5B93F", label: { fr: "En pause", en: "Paused" } },
};

const CATEGORIES = [
  { id: "photography", label: { fr: "Photographie", en: "Photography" } },
  { id: "modeling", label: { fr: "Mannequinat", en: "Modeling" } },
  { id: "ugc", label: { fr: "UGC", en: "UGC" } },
  { id: "marketing", label: { fr: "Marketing", en: "Marketing" } },
  { id: "influencer", label: { fr: "Influence", en: "Influencer" } },
  { id: "other", label: { fr: "Autre", en: "Other" } },
] as const;

const CANCELLATION_OPTIONS = [
  { id: "24h", label: { fr: "Souple — 24h", en: "Flexible — 24h" } },
  { id: "48h", label: { fr: "Modérée — 48h", en: "Moderate — 48h" } },
  { id: "72h", label: { fr: "Stricte — 72h", en: "Strict — 72h" } },
] as const;

type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "paid_out";
const BOOKING_STATUS_INDEX: Record<BookingStatus, number> = { requested: 0, confirmed: 1, in_progress: 2, completed: 3, paid_out: 4 };
const BOOKING_STEPS = { fr: ["Demandé", "Confirmé", "En cours", "Terminé", "Payé"], en: ["Requested", "Confirmed", "In progress", "Completed", "Paid"] };

interface FreelancerBooking {
  id: number;
  buyerName: string;
  title: { fr: string; en: string };
  subtotal: number;
  status: BookingStatus;
  date: string;
}

const INITIAL_BOOKINGS: FreelancerBooking[] = [
  { id: 1, buyerName: "Alexandre M.", title: { fr: "Séance photo produit", en: "Product photo session" }, subtotal: 145, status: "in_progress", date: "22 juil." },
  { id: 2, buyerName: "Sofia R.", title: { fr: "Vidéo promo réseaux sociaux", en: "Social promo video" }, subtotal: 320, status: "completed", date: "18 juil." },
  { id: 3, buyerName: "Marcus T.", title: { fr: "Retouche portrait ×10", en: "Portrait retouching ×10" }, subtotal: 80, status: "paid_out", date: "10 juil." },
];

function ListingCard({ l, onToggle }: { l: Listing; onToggle: (l: Listing) => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const st = LISTING_STATUS_STYLE[l.status];
  return (
    <div className="glass-panel rounded-[18px] p-5 flex flex-col gap-3.5">
      <div className="flex gap-3 items-start">
        <div className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 bg-[#8B7CFF]/15 text-[#B3A6FF]">
          <Icon name={l.type === "hourly" ? "clock" : l.type === "package" ? "package" : "send"} size={19} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-white">{l.title[lang]}</span>
            <StatusPill label={st.label[lang]} color={st.color} />
          </div>
          <div className="text-xs text-white/50">{l.category[lang]} · {LISTING_TYPE_LABEL[l.type][lang]}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="font-display text-xl font-extrabold text-[#B3A6FF]">{l.price[lang]}</div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs font-semibold">
          <Icon name="eye" size={13} /> {l.views}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onToggle(l)}
          className={`flex-1 py-2 rounded-[9px] border text-xs font-bold cursor-pointer transition-colors ${
            l.status === "active"
              ? "bg-[#F5B93F]/10 border-[#F5B93F]/40 text-[#F5B93F] hover:bg-[#F5B93F]/20"
              : "bg-[#7CE0A8]/10 border-[#7CE0A8]/40 text-[#7CE0A8] hover:bg-[#7CE0A8]/20"
          }`}
        >
          {l.status === "active" ? (isFr ? "Mettre en pause" : "Pause") : isFr ? "Activer" : "Activate"}
        </button>
        <button className="px-3.5 py-2 rounded-[9px] bg-white/[0.04] border border-white/10 text-white/60 text-xs font-bold cursor-pointer hover:text-white transition-colors">
          {isFr ? "Modifier" : "Edit"}
        </button>
      </div>
    </div>
  );
}

function NewListingModal({ onClose, onCreate }: { onClose: () => void; onCreate: (l: Listing) => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("photography");
  const [type, setType] = useState<ListingType>("hourly");
  const [price, setPrice] = useState("");
  const [cancellation, setCancellation] = useState<(typeof CANCELLATION_OPTIONS)[number]["id"]>("48h");

  const canSubmit = title.trim().length > 1 && price.trim().length > 0;

  const submit = () => {
    const cat = CATEGORIES.find((c) => c.id === category)!;
    const priceLabel: { fr: string; en: string } =
      type === "hourly"
        ? { fr: `${price}$/h`, en: `$${price}/h` }
        : { fr: `${price}$`, en: `$${price}` };
    onCreate({
      id: Date.now(),
      title: { fr: title, en: title },
      category: cat.label,
      type,
      price: priceLabel,
      status: "draft",
      views: 0,
    });
  };

  return (
    <Modal onClose={onClose} maxWidth={460} ariaLabel={isFr ? "Nouvelle offre" : "New listing"}>
      <h3 className="font-display text-xl font-extrabold text-white mb-5">{isFr ? "Nouvelle offre" : "New listing"}</h3>

      <label htmlFor="l-title" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
        {isFr ? "Titre" : "Title"}
      </label>
      <input id="l-title" className="field mb-4" placeholder={isFr ? "Titre de votre offre" : "Your listing title"} value={title} onChange={(e) => setTitle(e.target.value)} />

      <div className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
        {isFr ? "Catégorie" : "Category"}
      </div>
      <div className="mb-4">
        <PillGroup
          name={isFr ? "Catégorie" : "Category"}
          columns={2}
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map((c) => ({ id: c.id, label: c.label[lang] }))}
        />
      </div>

      <div className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
        {isFr ? "Type d'offre" : "Listing type"}
      </div>
      <div className="mb-4">
        <PillGroup
          name={isFr ? "Type d'offre" : "Listing type"}
          columns={2}
          value={type}
          onChange={setType}
          options={(["hourly", "package"] as ListingType[]).map((t) => ({ id: t, label: LISTING_TYPE_LABEL[t][lang] }))}
        />
      </div>

      <label htmlFor="l-price" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
        {type === "hourly" ? (isFr ? "Taux horaire ($)" : "Hourly rate ($)") : isFr ? "Prix du forfait ($)" : "Package price ($)"}
      </label>
      <input id="l-price" type="number" min="0" className="field mb-4" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />

      <div className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">
        {isFr ? "Politique d'annulation" : "Cancellation policy"}
      </div>
      <div className="mb-6">
        <PillGroup
          name={isFr ? "Politique d'annulation" : "Cancellation policy"}
          columns={3}
          value={cancellation}
          onChange={setCancellation}
          options={CANCELLATION_OPTIONS.map((c) => ({ id: c.id, label: c.label[lang] }))}
        />
      </div>

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 py-3 rounded-[11px] bg-white/[0.05] border border-white/10 text-white/60 text-[13px] font-bold cursor-pointer hover:text-white transition-colors">
          {isFr ? "Annuler" : "Cancel"}
        </button>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex-[2] py-3 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {isFr ? "Créer l'offre" : "Create listing"}
        </button>
      </div>
    </Modal>
  );
}

export default function DemoFreelancerDashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"listings" | "bookings" | "earnings" | "account">("listings");
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [bookings, setBookings] = useState<FreelancerBooking[]>(INITIAL_BOOKINGS);
  const [showNewListing, setShowNewListing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [payoutConnected, setPayoutConnected] = useState(true);
  const [account, setAccount] = useState({
    name: "Léa Kowalski",
    bio: "Photographe & créatrice de contenu, spécialisée produit et restauration.",
    postal: "H3B 2Y5",
    radius: "50 km",
    portfolio: "6 items",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeListingCount = useMemo(() => listings.filter((l) => l.status === "active").length, [listings]);
  const totalViews = useMemo(() => listings.reduce((s, l) => s + l.views, 0), [listings]);

  const totalPaidOut = useMemo(() => bookings.filter((b) => b.status === "paid_out").reduce((s, b) => s + feeSplit(b.subtotal).payout, 0), [bookings]);
  const pendingPayout = useMemo(() => bookings.filter((b) => b.status === "completed").reduce((s, b) => s + feeSplit(b.subtotal).payout, 0), [bookings]);

  const toggleListing = (l: Listing) => {
    setListings((ls) => ls.map((x) => (x.id === l.id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x)));
  };

  const createListing = (l: Listing) => {
    setListings((ls) => [l, ...ls]);
    setShowNewListing(false);
    showToast(isFr ? "Offre créée en brouillon!" : "Listing created as draft!");
  };

  const advanceBooking = (b: FreelancerBooking) => {
    if (b.status === "in_progress") {
      setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: "completed" } : x)));
      showToast(isFr ? "Réservation marquée terminée." : "Booking marked complete.");
    } else if (b.status === "completed") {
      setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: "paid_out" } : x)));
      showToast(isFr ? "Paiement libéré!" : "Payout released!");
    }
  };

  const NAV = [
    { id: "listings", icon: "grid" as IconName, label: isFr ? "Mes offres" : "Listings" },
    { id: "bookings", icon: "package" as IconName, label: isFr ? "Réservations" : "Bookings" },
    { id: "earnings", icon: "card" as IconName, label: isFr ? "Revenus" : "Earnings" },
    { id: "account", icon: "gear" as IconName, label: isFr ? "Compte" : "Account" },
  ] as const;

  return (
    <div className="bg-[#0a0810] min-h-screen text-white flex flex-col">
      <Toast message={toast} />
      {showNewListing && <NewListingModal onClose={() => setShowNewListing(false)} onCreate={createListing} />}

      <header className="glass-pill border-x-0 border-t-0 rounded-none px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="no-underline shrink-0 flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-display font-extrabold grad-text text-lg hidden xs:inline">ShiftUp</span>
          </Link>
          <span className="hidden sm:inline text-[11px] text-white/50 border-l border-white/15 pl-3">
            {isFr ? "Dashboard Freelance" : "Freelancer Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-3">
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
                <Icon name="plug" size={15} className={payoutConnected ? "text-[#7CE0A8]" : "text-[#F5B93F]"} />
                <span className="text-xs font-extrabold text-white">
                  {payoutConnected ? (isFr ? "Stripe connecté" : "Stripe connected") : isFr ? "Stripe non connecté" : "Stripe not connected"}
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mb-2.5">
                {payoutConnected
                  ? (isFr ? "Vous pouvez recevoir des paiements." : "You're set up to receive payouts.")
                  : (isFr ? "Connectez Stripe pour être payé." : "Connect Stripe to get paid.")}
              </p>
              {!payoutConnected && (
                <button
                  onClick={() => setTab("account")}
                  className="w-full py-2 rounded-[9px] grad-violet border-none text-white text-[11px] font-bold cursor-pointer"
                >
                  {isFr ? "Connecter" : "Connect"}
                </button>
              )}
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-7 overflow-y-auto max-w-[1140px]">
          {tab === "listings" && (
            <div>
              <div className="flex gap-4 mb-7 flex-wrap">
                <StatCard icon="grid" label={isFr ? "Offres actives" : "Active listings"} value={String(activeListingCount)} sub={isFr ? `${listings.length} au total` : `${listings.length} total`} color="#8B7CFF" />
                <StatCard icon="eye" label={isFr ? "Vues totales" : "Total views"} value={String(totalViews)} sub={isFr ? "Toutes les offres" : "Across all listings"} color="#5B8CFF" />
                <StatCard icon="star" label={isFr ? "Note moyenne" : "Avg rating"} value="4.8" sub={isFr ? "32 avis" : "32 reviews"} color="#F5B93F" />
              </div>

              <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <h2 className="font-display text-lg font-extrabold text-white">{isFr ? "Mes offres" : "My listings"}</h2>
                <button
                  onClick={() => setShowNewListing(true)}
                  className="px-5 py-2.5 rounded-[11px] grad-violet border-none text-white text-[13px] font-bold cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  + {isFr ? "Nouvelle offre" : "New listing"}
                </button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {listings.map((l) => (
                  <ListingCard key={l.id} l={l} onToggle={toggleListing} />
                ))}
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div>
              <h2 className="font-display text-[22px] font-extrabold text-white mb-6">{isFr ? "Réservations" : "Bookings"}</h2>
              <div className="flex flex-col gap-4">
                {bookings.map((b) => {
                  const idx = BOOKING_STATUS_INDEX[b.status];
                  const { fee, payout } = feeSplit(b.subtotal);
                  return (
                    <div key={b.id} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-3 flex-wrap justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar id={b.id} name={b.buyerName} size={40} />
                          <div>
                            <div className="font-display text-[15px] font-extrabold text-white">{b.title[lang]}</div>
                            <div className="text-xs text-white/50">{b.buyerName} · {b.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-extrabold text-[#7CE0A8]">${payout}</div>
                          <div className="text-[10px] text-white/40">${b.subtotal} − ${fee} {isFr ? "frais" : "fee"}</div>
                        </div>
                      </div>
                      <div className="px-1">
                        <StepTracker steps={BOOKING_STEPS[lang]} currentIndex={idx} color="#7CE0A8" />
                      </div>
                      {b.status === "in_progress" && (
                        <button
                          onClick={() => advanceBooking(b)}
                          className="self-start px-4 py-2 rounded-[9px] grad-violet border-none text-white text-xs font-bold cursor-pointer"
                        >
                          {isFr ? "Marquer comme terminé" : "Mark complete"}
                        </button>
                      )}
                      {b.status === "completed" && (
                        <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-white/[0.06]">
                          <button
                            onClick={() => advanceBooking(b)}
                            className="px-4 py-2 rounded-[9px] bg-[#7CE0A8]/10 border border-[#7CE0A8]/40 text-[#7CE0A8] text-xs font-bold cursor-pointer hover:bg-[#7CE0A8]/20 transition-colors"
                          >
                            {isFr ? "Libérer le paiement" : "Release payout"}
                          </button>
                          <span className="text-[11px] text-white/40">
                            {isFr ? "Fenêtre de litige de 48h pour l'acheteur" : "48h buyer dispute window"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "earnings" && (
            <div>
              <h2 className="font-display text-[22px] font-extrabold text-white mb-6">{isFr ? "Revenus" : "Earnings"}</h2>
              <div className="glass-panel rounded-[20px] p-7 mb-6 flex gap-10 flex-wrap">
                <div>
                  <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                    {isFr ? "Total payé" : "Total paid out"}
                  </div>
                  <div className="font-display text-5xl font-extrabold text-[#7CE0A8] leading-none">${totalPaidOut}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                    {isFr ? "Paiement en attente" : "Pending payout"}
                  </div>
                  <div className="font-display text-5xl font-extrabold text-[#F5B93F] leading-none">${pendingPayout}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                    {isFr ? "Note" : "Rating"}
                  </div>
                  <div className="font-display text-5xl font-extrabold text-[#B3A6FF] leading-none">4.8</div>
                  <div className="text-xs text-white/50 mt-1.5">32 {isFr ? "avis" : "reviews"}</div>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 mb-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-[#7CE0A8]/15 text-[#7CE0A8]">
                  <Icon name="percent" size={19} />
                </div>
                <div>
                  <div className="font-display text-base font-extrabold text-white mb-1">
                    {isFr ? "Vous gardez 85% de chaque réservation" : "You keep 85% of every booking"}
                  </div>
                  <p className="text-[12.5px] text-white/55 leading-relaxed max-w-[560px]">
                    {isFr
                      ? "ShiftUp prélève 15% de frais côté freelance (et 15% côté acheteur) pour couvrir le paiement sécurisé et le support. Aucun abonnement, aucun frais caché."
                      : "ShiftUp takes a 15% seller-side fee (plus 15% on the buyer side) to cover secure payment and support. No subscription, no hidden fees."}
                  </p>
                </div>
              </div>

              <h3 className="font-display text-base font-extrabold text-white mb-4">{isFr ? "Historique des paiements" : "Payout history"}</h3>
              <div className="glass-panel rounded-2xl overflow-hidden">
                {bookings.map((b, i) => {
                  const { fee, payout } = feeSplit(b.subtotal);
                  return (
                    <div key={b.id} className={`flex items-center justify-between px-5 py-3.5 ${i < bookings.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#7CE0A8]/15 text-[#7CE0A8]">
                          <Icon name="package" size={15} />
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-white">{b.title[lang]} — {b.buyerName}</div>
                          <div className="text-[11px] text-white/50">{b.date} · ${b.subtotal} − ${fee} {isFr ? "frais" : "fee"}</div>
                        </div>
                      </div>
                      <div className="font-display text-base font-extrabold text-[#7CE0A8]">${payout}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "account" && (
            <div className="max-w-[520px]">
              <h2 className="font-display text-[22px] font-extrabold text-white mb-6">{isFr ? "Mon compte" : "My account"}</h2>

              <div className="glass-panel rounded-[16px] p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${payoutConnected ? "bg-[#7CE0A8]/15 text-[#7CE0A8]" : "bg-[#F5B93F]/15 text-[#F5B93F]"}`}>
                    <Icon name="plug" size={19} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{isFr ? "Paiements Stripe" : "Stripe payouts"}</div>
                    <div className="text-[11px] text-white/50">
                      {payoutConnected ? (isFr ? "Connecté — prêt à recevoir des paiements" : "Connected — ready to receive payouts") : (isFr ? "Non connecté" : "Not connected")}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPayoutConnected((v) => !v);
                    showToast(payoutConnected ? (isFr ? "Stripe déconnecté" : "Stripe disconnected") : (isFr ? "Stripe connecté!" : "Stripe connected!"));
                  }}
                  className={`px-4 py-2 rounded-[9px] border text-xs font-bold cursor-pointer transition-colors ${
                    payoutConnected ? "bg-white/[0.04] border-white/10 text-white/60 hover:text-white" : "grad-violet border-none text-white"
                  }`}
                >
                  {payoutConnected ? (isFr ? "Déconnecter" : "Disconnect") : (isFr ? "Connecter avec Stripe" : "Connect with Stripe")}
                </button>
              </div>

              {(
                [
                  ["name", isFr ? "Nom affiché" : "Display name"],
                  ["bio", isFr ? "Bio" : "Bio"],
                  ["postal", isFr ? "Code postal" : "Postal code"],
                  ["radius", isFr ? "Rayon de service" : "Service radius"],
                  ["portfolio", isFr ? "Portfolio" : "Portfolio"],
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
