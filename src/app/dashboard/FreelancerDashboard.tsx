"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { BrandMark, LangToggle } from "@/components/ui";
import {
  Icon, type IconName, Avatar, StatCard, StatusPill, Toast, Modal, MobileTabBar, SideNav, StepTracker, PillGroup,
} from "@/components/dashboard/shared";
import {
  fetchMyListings, saveListing, setListingStatus, fetchMyBookings,
  markBookingComplete, requestPayoutRelease, fetchEarnings, fetchMyFreelancerProfile, updateFreelancerProfile,
  fetchMyName, updateMyName, requestConnectOnboarding,
  type LiveListing, type LiveBooking,
} from "@/lib/liveData";
import { supabase } from "@/lib/supabaseClient";
import type { ListingCategory, ListingType } from "@/lib/marketplace";

function feeSplit(subtotal: number) {
  const fee = Math.round(subtotal * 0.15 * 100) / 100;
  return { fee, payout: Math.round((subtotal - fee) * 100) / 100 };
}

const LISTING_TYPE_LABEL: Record<ListingType, { fr: string; en: string }> = {
  hourly: { fr: "Horaire", en: "Hourly" },
  package: { fr: "Forfait", en: "Package" },
};

const LISTING_STATUS_STYLE: Record<string, { color: string; label: { fr: string; en: string } }> = {
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

function categoryLabel(id: string, lang: "fr" | "en") {
  return CATEGORIES.find((c) => c.id === id)?.label[lang] ?? id;
}

function priceLabel(l: LiveListing, lang: "fr" | "en") {
  if (l.listingType === "hourly") return `$${l.rate ?? 0}/h`;
  return `$${l.packagePrice ?? 0}`;
}

const BOOKING_STATUS_INDEX: Record<string, number> = { requested: 0, confirmed: 1, in_progress: 2, completed: 3, paid_out: 4 };
const BOOKING_STEPS = { fr: ["Demandé", "Confirmé", "En cours", "Terminé", "Payé"], en: ["Requested", "Confirmed", "In progress", "Completed", "Paid"] };

function ListingCard({ l, onToggle }: { l: LiveListing; onToggle: (l: LiveListing) => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const st = LISTING_STATUS_STYLE[l.status] ?? LISTING_STATUS_STYLE.draft;
  return (
    <div className="glass-panel rounded-[18px] p-5 flex flex-col gap-3.5">
      <div className="flex gap-3 items-start">
        <div className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 bg-[#8B7CFF]/15 text-[#B3A6FF]">
          <Icon name={l.listingType === "hourly" ? "clock" : l.listingType === "package" ? "package" : "send"} size={19} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-display text-base font-extrabold text-white">{l.title}</span>
            <StatusPill label={st.label[lang]} color={st.color} />
          </div>
          <div className="text-xs text-white/50">{categoryLabel(l.category, lang)} · {LISTING_TYPE_LABEL[l.listingType][lang]}</div>
        </div>
      </div>
      <div className="font-display text-xl font-extrabold text-[#B3A6FF]">{priceLabel(l, lang)}</div>
      {l.status !== "draft" && (
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
        </div>
      )}
    </div>
  );
}

function NewListingModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: { category: ListingCategory; listingType: ListingType; title: string; description: string; rate?: number; packagePrice?: number }) => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("photography");
  const [type, setType] = useState<ListingType>("hourly");
  const [price, setPrice] = useState("");

  const canSubmit = title.trim().length > 1 && price.trim().length > 0;

  const submit = () => {
    onCreate({
      category: category as ListingCategory,
      listingType: type,
      title: title.trim(),
      description: "",
      rate: type === "hourly" ? Number(price) : undefined,
      packagePrice: type === "package" ? Number(price) : undefined,
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

      <div className="flex gap-2.5 mt-2">
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

export default function FreelancerDashboard() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const [tab, setTab] = useState<"listings" | "bookings" | "earnings" | "account">("listings");
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0 });
  const [profile, setProfile] = useState({ ratingAvg: 0, ratingCount: 0, payoutConnected: false, idVerificationStatus: "unsubmitted", bio: "", postal: "" });
  const [showNewListing, setShowNewListing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [account, setAccount] = useState({ name: "", bio: "", postal: "" });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const reload = async () => {
    const [l, b, e, p, name] = await Promise.all([
      fetchMyListings(), fetchMyBookings(), fetchEarnings(), fetchMyFreelancerProfile(), fetchMyName(),
    ]);
    setListings(l);
    setBookings(b);
    setEarnings({ total: e.total, pending: e.pending });
    if (p) {
      setProfile({ ratingAvg: p.ratingAvg, ratingCount: p.ratingCount, payoutConnected: p.payoutConnected, idVerificationStatus: p.idVerificationStatus, bio: p.bio, postal: p.postal });
      setAccount({ name, bio: p.bio, postal: p.postal });
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

  const activeListingCount = useMemo(() => listings.filter((l) => l.status === "active").length, [listings]);

  const toggleListing = async (l: LiveListing) => {
    const next = l.status === "active" ? "paused" : "active";
    setListings((ls) => ls.map((x) => (x.id === l.id ? { ...x, status: next } : x)));
    await setListingStatus(l.id, next);
  };

  const createListing = async (input: { category: ListingCategory; listingType: ListingType; title: string; description: string; rate?: number; packagePrice?: number }) => {
    const ok = await saveListing(input);
    setShowNewListing(false);
    if (ok) {
      showToast(isFr ? "Offre créée!" : "Listing created!");
      fetchMyListings().then(setListings);
    } else {
      showToast(isFr ? "Erreur — réessayez." : "Error — please try again.");
    }
  };

  const advanceBooking = async (b: LiveBooking) => {
    if (b.status === "in_progress") {
      const ok = await markBookingComplete(b.id);
      if (ok) {
        showToast(isFr ? "Réservation marquée terminée." : "Booking marked complete.");
        fetchMyBookings().then(setBookings);
      }
    } else if (b.status === "completed") {
      const res = await requestPayoutRelease(b.id);
      if (res.ok) {
        showToast(isFr ? "Paiement libéré!" : "Payout released!");
      } else {
        showToast(res.error || (isFr ? "Erreur de paiement." : "Payout error."));
      }
      fetchMyBookings().then(setBookings);
      fetchEarnings().then((e) => setEarnings({ total: e.total, pending: e.pending }));
    }
  };

  const connectStripe = async () => {
    const res = await requestConnectOnboarding();
    if (res.onboardingUrl) {
      window.location.href = res.onboardingUrl;
    } else if (res.alreadyConnected) {
      showToast(isFr ? "Déjà connecté!" : "Already connected!");
    } else {
      showToast(res.error || (isFr ? "Impossible de démarrer Stripe." : "Couldn't start Stripe onboarding."));
    }
  };

  const saveAccount = async () => {
    await Promise.all([
      updateMyName(account.name),
      updateFreelancerProfile({ displayName: account.name, bio: account.bio, postal: account.postal }),
    ]);
    showToast(isFr ? "Compte mis à jour!" : "Account updated!");
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
                <Icon name="plug" size={15} className={profile.payoutConnected ? "text-[#7CE0A8]" : "text-[#F5B93F]"} />
                <span className="text-xs font-extrabold text-white">
                  {profile.payoutConnected ? (isFr ? "Stripe connecté" : "Stripe connected") : isFr ? "Stripe non connecté" : "Stripe not connected"}
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mb-2.5">
                {profile.payoutConnected
                  ? (isFr ? "Vous pouvez recevoir des paiements." : "You're set up to receive payouts.")
                  : (isFr ? "Connectez Stripe pour être payé." : "Connect Stripe to get paid.")}
              </p>
              {!profile.payoutConnected && (
                <button
                  onClick={connectStripe}
                  className="w-full py-2 rounded-[9px] grad-violet border-none text-white text-[11px] font-bold cursor-pointer"
                >
                  {isFr ? "Connecter" : "Connect"}
                </button>
              )}
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-7 overflow-y-auto max-w-[1140px]">
          {loading ? (
            <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Chargement…" : "Loading…"}</p>
          ) : (
            <>
              {tab === "listings" && (
                <div>
                  <div className="flex gap-4 mb-7 flex-wrap">
                    <StatCard icon="grid" label={isFr ? "Offres actives" : "Active listings"} value={String(activeListingCount)} sub={isFr ? `${listings.length} au total` : `${listings.length} total`} color="#8B7CFF" />
                    <StatCard icon="star" label={isFr ? "Note moyenne" : "Avg rating"} value={profile.ratingCount ? profile.ratingAvg.toFixed(1) : "—"} sub={isFr ? `${profile.ratingCount} avis` : `${profile.ratingCount} reviews`} color="#F5B93F" />
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

                  {listings.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Aucune offre pour l'instant." : "No listings yet."}</p>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                      {listings.map((l) => (
                        <ListingCard key={l.id} l={l} onToggle={toggleListing} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "bookings" && (
                <div>
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">{isFr ? "Réservations" : "Bookings"}</h2>
                  {bookings.length === 0 ? (
                    <p className="text-white/50 text-sm py-8 text-center">{isFr ? "Aucune réservation pour l'instant." : "No bookings yet."}</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {bookings.map((b, i) => {
                        const idx = BOOKING_STATUS_INDEX[b.status] ?? 0;
                        const { fee, payout } = feeSplit(b.unitPrice * b.quantity);
                        return (
                          <div key={b.id} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-3 flex-wrap justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar id={i} name={b.buyerName} size={40} />
                                <div>
                                  <div className="font-display text-[15px] font-extrabold text-white">{b.listingTitle}</div>
                                  <div className="text-xs text-white/50">{b.buyerName} · {new Date(b.createdAt).toLocaleDateString(isFr ? "fr-CA" : "en-CA")}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-display text-lg font-extrabold text-[#7CE0A8]">${payout.toFixed(2)}</div>
                                <div className="text-[10px] text-white/40">${(b.unitPrice * b.quantity).toFixed(2)} − ${fee.toFixed(2)} {isFr ? "frais" : "fee"}</div>
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
                  )}
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
                      <div className="font-display text-5xl font-extrabold text-[#7CE0A8] leading-none">${earnings.total.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                        {isFr ? "Paiement en attente" : "Pending payout"}
                      </div>
                      <div className="font-display text-5xl font-extrabold text-[#F5B93F] leading-none">${earnings.pending.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                        {isFr ? "Note" : "Rating"}
                      </div>
                      <div className="font-display text-5xl font-extrabold text-[#B3A6FF] leading-none">{profile.ratingCount ? profile.ratingAvg.toFixed(1) : "—"}</div>
                      <div className="text-xs text-white/50 mt-1.5">{profile.ratingCount} {isFr ? "avis" : "reviews"}</div>
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
                  {bookings.filter((b) => b.status === "paid_out" || b.status === "completed").length === 0 ? (
                    <p className="text-white/50 text-sm py-6 text-center glass-panel rounded-2xl">{isFr ? "Aucun paiement pour l'instant." : "No payouts yet."}</p>
                  ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden">
                      {bookings.filter((b) => b.status === "paid_out" || b.status === "completed").map((b, i, arr) => {
                        const { fee, payout } = feeSplit(b.unitPrice * b.quantity);
                        return (
                          <div key={b.id} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                            <div className="flex gap-3 items-center">
                              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#7CE0A8]/15 text-[#7CE0A8]">
                                <Icon name="package" size={15} />
                              </div>
                              <div>
                                <div className="text-[13px] font-bold text-white">{b.listingTitle} — {b.buyerName}</div>
                                <div className="text-[11px] text-white/50">{new Date(b.createdAt).toLocaleDateString(isFr ? "fr-CA" : "en-CA")} · ${(b.unitPrice * b.quantity).toFixed(2)} − ${fee.toFixed(2)} {isFr ? "frais" : "fee"}</div>
                              </div>
                            </div>
                            <div className="font-display text-base font-extrabold text-[#7CE0A8]">${payout.toFixed(2)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "account" && (
                <div className="max-w-[520px]">
                  <h2 className="font-display text-[22px] font-extrabold text-white mb-6">{isFr ? "Mon compte" : "My account"}</h2>

                  <div className="glass-panel rounded-[16px] p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${profile.payoutConnected ? "bg-[#7CE0A8]/15 text-[#7CE0A8]" : "bg-[#F5B93F]/15 text-[#F5B93F]"}`}>
                        <Icon name="plug" size={19} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{isFr ? "Paiements Stripe" : "Stripe payouts"}</div>
                        <div className="text-[11px] text-white/50">
                          {profile.payoutConnected ? (isFr ? "Connecté — prêt à recevoir des paiements" : "Connected — ready to receive payouts") : (isFr ? "Non connecté" : "Not connected")}
                        </div>
                      </div>
                    </div>
                    {!profile.payoutConnected && (
                      <button
                        onClick={connectStripe}
                        className="px-4 py-2 rounded-[9px] border-none grad-violet text-white text-xs font-bold cursor-pointer"
                      >
                        {isFr ? "Connecter avec Stripe" : "Connect with Stripe"}
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="acct-name" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Nom affiché" : "Display name"}</label>
                    <input id="acct-name" className="field" value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="acct-bio" className="block text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1.5">{isFr ? "Bio" : "Bio"}</label>
                    <input id="acct-bio" className="field" value={account.bio} onChange={(e) => setAccount((a) => ({ ...a, bio: e.target.value }))} />
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
