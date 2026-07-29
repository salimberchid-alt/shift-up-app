/**
 * Real Supabase data layer for the web dashboards, adapted from the
 * production mobile app's src/lib/{live,api,contracts}.ts (shiftup-app/).
 * Same tables, same RLS assumptions, same 15%/15% marketplace math — this is
 * a port, not a reimplementation, so the web dashboard never disagrees with
 * the app about what a real job match, booking, or payout looks like.
 *
 * Every function reads/writes the signed-in user's own Supabase session;
 * there is no demo/fictive fallback here on purpose — this module only runs
 * behind the real RoleGate at /dashboard, after a real login.
 */
import { supabase } from "./supabaseClient";
import { computeBreakdown, type ListingCategory, type ListingType } from "./marketplace";
import { rankJobsForWorker, rankWorkersForJob, type JobPosting, type WorkerProfile as MatchWorkerProfile, type MatchResult, type Slot, type Language } from "./matching";

// ---------------------------------------------------------------
// Postal → coords (small Montréal-area table, mirrors the app's
// ProfileContext.postalToCoords — good enough for relative ranking).
// ---------------------------------------------------------------

const FSA_COORDS: Record<string, { lat: number; lng: number }> = {
  H2X: { lat: 45.512, lng: -73.568 }, H2W: { lat: 45.517, lng: -73.577 },
  H2J: { lat: 45.527, lng: -73.582 }, H2K: { lat: 45.527, lng: -73.552 },
  H2L: { lat: 45.52, lng: -73.559 }, H2T: { lat: 45.523, lng: -73.595 },
  H2V: { lat: 45.52, lng: -73.61 }, H3A: { lat: 45.504, lng: -73.575 },
  H3B: { lat: 45.5, lng: -73.57 }, H3G: { lat: 45.497, lng: -73.578 },
  H3H: { lat: 45.49, lng: -73.588 }, H4C: { lat: 45.477, lng: -73.588 },
  H1V: { lat: 45.55, lng: -73.54 }, H1Y: { lat: 45.547, lng: -73.575 },
  H2S: { lat: 45.534, lng: -73.6 }, H3N: { lat: 45.53, lng: -73.62 },
  H4A: { lat: 45.47, lng: -73.61 },
};
const DEFAULT_LOC = { lat: 45.508, lng: -73.567 };
function postalToCoords(postal: string) {
  const fsa = (postal ?? "").trim().toUpperCase().slice(0, 3);
  return FSA_COORDS[fsa] ?? DEFAULT_LOC;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ---------------------------------------------------------------
// Worker: job feed, swipes, matches, contracts
// ---------------------------------------------------------------

const BIZ_TO_CATEGORY: Record<string, string> = {
  Restaurant: "restaurant", Commerce: "retail", Retail: "retail",
  Entrepôt: "warehouse", Warehouse: "warehouse", Construction: "construction",
  Événements: "events", Events: "events", Bureau: "office", Office: "office",
  Mécanique: "mechanic", Mechanical: "mechanic", Entretien: "cleaning", Maintenance: "cleaning",
};
const SHIFT_SLOTS: Slot[][] = [["morning"], ["afternoon"], ["evening"], ["night"], ["morning", "afternoon", "evening"]];
const SHIFT_LABELS_FR = ["Matin", "Après-midi", "Soir", "Nuit", "Flexible"];

export interface LiveJobFeedItem {
  id: string;
  title: string;
  company: string;
  payLabel: string;
  distLabel: string;
  match: number;
  shift: string;
  category: string;
  urgent: boolean;
  applied: boolean;
}

function jobRowToPosting(row: any): JobPosting & { title: string; company: string; payLabel: string; shiftLabel: string } {
  const category = BIZ_TO_CATEGORY[row.biz_type] ?? "stable";
  const shiftIdx: number[] = Array.isArray(row.shifts) ? row.shifts : [];
  const slots = [...new Set(shiftIdx.flatMap((i) => SHIFT_SLOTS[i] ?? []))] as Slot[];
  const pay = Number(row.pay) || 0;
  const hourly = row.pay_type !== "salary";
  return {
    id: row.id,
    loc: postalToCoords(row.postal ?? ""),
    category,
    minExpYears: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
    slots: slots.length ? slots : ["morning", "afternoon"],
    languages: [],
    pay: hourly ? pay : Math.round((pay / 2080) * 100) / 100,
    urgent: row.urgency === "0",
    title: row.title,
    company: row.company ?? "—",
    payLabel: hourly ? `$${pay}/h` : `$${pay}/an`,
    shiftLabel: shiftIdx.map((i) => SHIFT_LABELS_FR[i]).filter(Boolean).join(" · ") || "Flexible",
  };
}

async function fetchMyWorkerMatchProfile(uid: string): Promise<MatchWorkerProfile> {
  const { data: wp } = await supabase.from("worker_profiles").select("*").eq("user_id", uid).maybeSingle();
  const av = (wp?.availability as any) ?? {};
  const sc = av.screening ?? {};
  const languages: Language[] = sc.lang === "Bilingue FR/EN" ? ["fr", "en"] : sc.lang === "Anglais seulement" ? ["en"] : ["fr"];
  const interests: string[] = wp?.interests ?? [];
  const expYears = sc.custexp === "3+ ans" ? 4 : sc.custexp === "1–3 ans" ? 2 : sc.custexp === "Moins d'1 an" ? 0.5 : 0;
  return {
    loc: postalToCoords(wp?.postal ?? ""),
    maxKm: wp?.radius_km ?? 10,
    commute: "transit",
    interests: interests.length ? interests : ["cafe", "restaurant"],
    experience: expYears > 0 ? interests.slice(0, 3).map((c) => ({ category: c, years: expYears })) : [],
    days: Array.isArray(av.days) && av.days.length ? av.days : [0, 1, 2, 3, 4],
    slots: sc.nights === "Oui" ? ["morning", "afternoon", "evening", "night"] : ["morning", "afternoon", "evening"],
    languages,
    noticeDays: sc.notice === "Immédiatement" ? 0 : sc.notice === "Dans 1 semaine" ? 7 : 14,
  };
}

/** Job feed ranked by real match score, already-swiped jobs excluded. */
export async function fetchJobFeed(): Promise<LiveJobFeedItem[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const [{ data: swiped }, { data: rows, error }, worker] = await Promise.all([
    supabase.from("swipes").select("target_id").eq("swiper_id", uid).eq("target_type", "job"),
    supabase.from("jobs").select("*").eq("status", "active").limit(50),
    fetchMyWorkerMatchProfile(uid),
  ]);
  if (error || !rows) return [];
  const swipedIds = new Set((swiped ?? []).map((s) => s.target_id));
  const postings = rows.map(jobRowToPosting);
  const ranked = rankJobsForWorker(worker, postings);
  return ranked.map(({ job, match }) => ({
    id: String(job.id),
    title: job.title,
    company: job.company,
    payLabel: job.payLabel,
    distLabel: `${match.km} km`,
    match: match.total,
    shift: job.shiftLabel,
    category: job.category,
    urgent: job.urgent,
    applied: swipedIds.has(job.id),
  }));
}

/** Records a right/left swipe on a job. Right creates a match once the employer has also right-swiped this worker. */
export async function applyToJob(jobId: string, employerId: string): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  await supabase.from("swipes").upsert(
    { swiper_id: uid, target_type: "job", target_id: jobId, direction: "right" },
    { onConflict: "swiper_id,target_type,target_id" },
  );
  const { data: recip } = await supabase.from("swipes")
    .select("id").eq("swiper_id", employerId).eq("target_type", "worker").eq("target_id", uid)
    .in("direction", ["right", "super"]).maybeSingle();
  if (recip) {
    await supabase.from("matches").upsert(
      { job_id: jobId, worker_id: uid, employer_id: employerId },
      { onConflict: "job_id,worker_id" },
    );
  }
  return true;
}

export async function passJob(jobId: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from("swipes").upsert(
    { swiper_id: uid, target_type: "job", target_id: jobId, direction: "left" },
    { onConflict: "swiper_id,target_type,target_id" },
  );
}

/** employer_id for a job, needed by applyToJob (jobs.employer_id isn't in the trimmed feed shape above). */
export async function fetchJobEmployerId(jobId: string): Promise<string | null> {
  const { data } = await supabase.from("jobs").select("employer_id").eq("id", jobId).maybeSingle();
  return data?.employer_id ?? null;
}

export interface LiveMatch {
  id: string;
  jobId: string;
  employerId: string;
  company: string;
  title: string;
  pay: string;
  status: "pending_payment" | "active" | "signed" | "closed";
  address: string;
  matchScore: number;
}

export async function fetchMyMatches(): Promise<LiveMatch[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase.from("matches")
    .select("id, job_id, employer_id, status, score, jobs(title, company, pay, pay_type, postal)")
    .eq("worker_id", uid).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((m: any) => ({
    id: m.id,
    jobId: m.job_id,
    employerId: m.employer_id,
    company: m.jobs?.company ?? "—",
    title: m.jobs?.title ?? "—",
    pay: m.jobs ? (m.jobs.pay_type === "salary" ? `$${m.jobs.pay}/an` : `$${m.jobs.pay}/h`) : "—",
    status: m.status,
    address: m.jobs?.postal ?? "—",
    matchScore: m.score ?? 0,
  }));
}

export async function signContract(matchId: string, signature: string): Promise<boolean> {
  const { error } = await supabase.from("contracts").upsert(
    { match_id: matchId, worker_signature: signature, signed_at: new Date().toISOString() },
    { onConflict: "match_id" },
  );
  if (error) return false;
  await supabase.from("matches").update({ status: "signed" }).eq("id", matchId);
  try {
    await supabase.functions.invoke("generate-contract-pdf", { body: { matchId } });
  } catch {
    // PDF generation is best-effort; the signature above is already the legal record.
  }
  return true;
}

// ---------------------------------------------------------------
// Shared: conversations + chat (matches-based, worker ⇄ employer)
// ---------------------------------------------------------------

export interface LiveConversation {
  matchId: string;
  otherId: string;
  otherName: string;
  jobTitle: string;
  last: string;
  time: string;
  status: string;
}

export async function fetchConversations(): Promise<LiveConversation[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data: matches } = await supabase.from("matches")
    .select("id, worker_id, employer_id, status, created_at, jobs(title)")
    .or(`worker_id.eq.${uid},employer_id.eq.${uid}`)
    .order("created_at", { ascending: false });
  if (!matches?.length) return [];

  const otherIds = [...new Set(matches.map((m: any) => (m.worker_id === uid ? m.employer_id : m.worker_id)))];
  const [{ data: profiles }, { data: lastMsgs }] = await Promise.all([
    supabase.from("profiles").select("id, name").in("id", otherIds),
    supabase.from("messages").select("match_id, body, created_at")
      .in("match_id", matches.map((m: any) => m.id)).order("created_at", { ascending: false }).limit(200),
  ]);
  const nameById = new Map((profiles ?? []).map((p: any) => [p.id, p.name]));
  const lastByMatch = new Map<string, { body: string; created_at: string }>();
  for (const m of lastMsgs ?? []) if (!lastByMatch.has(m.match_id)) lastByMatch.set(m.match_id, m);

  return matches.map((m: any) => {
    const otherId = m.worker_id === uid ? m.employer_id : m.worker_id;
    const last = lastByMatch.get(m.id);
    return {
      matchId: m.id,
      otherId,
      otherName: nameById.get(otherId) ?? "—",
      jobTitle: m.jobs?.title ?? "",
      last: last?.body ?? "",
      time: new Date(last?.created_at ?? m.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }),
      status: m.status,
    };
  });
}

export interface LiveChatMessage {
  id: string;
  mine: boolean;
  text: string;
  time: string;
}

export async function fetchMessages(matchId: string): Promise<LiveChatMessage[]> {
  const uid = await currentUserId();
  const { data } = await supabase.from("messages")
    .select("id, sender_id, body, created_at").eq("match_id", matchId).order("created_at", { ascending: true });
  return (data ?? []).map((m: any) => ({
    id: m.id,
    mine: m.sender_id === uid,
    text: m.body,
    time: new Date(m.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }),
  }));
}

export async function sendChatMessage(matchId: string, body: string): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid || !body.trim()) return false;
  const { error } = await supabase.from("messages").insert({ match_id: matchId, sender_id: uid, body: body.trim() });
  return !error;
}

export function subscribeToMessages(matchId: string, onMessage: (m: LiveChatMessage) => void): () => void {
  let uid: string | undefined;
  supabase.auth.getUser().then(({ data }) => { uid = data.user?.id; });
  const channel = supabase
    .channel(`messages-${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload: any) => {
        const r = payload.new;
        onMessage({ id: r.id, mine: r.sender_id === uid, text: r.body, time: new Date(r.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) });
      },
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ---------------------------------------------------------------
// Shared: marketplace bookings (worker/employer as buyer, freelancer as seller)
// ---------------------------------------------------------------

export interface LiveBooking {
  id: string;
  listingTitle: string;
  freelancerName: string;
  buyerName: string;
  freelancerId: string;
  buyerId: string;
  quantity: number;
  unitPrice: number;
  buyerTotal: number;
  freelancerPayout: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

function bookingRowToLive(row: any, extra: { listingTitle?: string; freelancerName?: string; buyerName?: string }): LiveBooking {
  return {
    id: row.id,
    listingTitle: extra.listingTitle ?? "—",
    freelancerName: extra.freelancerName ?? "—",
    buyerName: extra.buyerName ?? "—",
    freelancerId: row.freelancer_id,
    buyerId: row.buyer_id,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    buyerTotal: Number(row.buyer_total),
    freelancerPayout: Number(row.freelancer_payout),
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

/** Every booking where the signed-in user is either the buyer or the freelancer. */
export async function fetchMyBookings(): Promise<LiveBooking[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data } = await supabase.from("bookings").select("*")
    .or(`freelancer_id.eq.${uid},buyer_id.eq.${uid}`).order("created_at", { ascending: false });
  const rows = data ?? [];
  if (!rows.length) return [];

  const listingIds = [...new Set(rows.map((r) => r.listing_id).filter(Boolean))];
  const freelancerIds = [...new Set(rows.map((r) => r.freelancer_id))];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id))];
  const [{ data: listingRows }, { data: freelancerRows }, { data: buyerRows }] = await Promise.all([
    listingIds.length ? supabase.from("listings").select("id, title").in("id", listingIds) : Promise.resolve({ data: [] as any[] }),
    supabase.from("freelancer_profiles").select("user_id, display_name").in("user_id", freelancerIds),
    supabase.from("profiles").select("id, name").in("id", buyerIds),
  ]);
  const listingTitleById = new Map((listingRows ?? []).map((l: any) => [l.id, l.title]));
  const freelancerNameById = new Map((freelancerRows ?? []).map((f: any) => [f.user_id, f.display_name]));
  const buyerNameById = new Map((buyerRows ?? []).map((p: any) => [p.id, p.name]));

  return rows.map((r) => bookingRowToLive(r, {
    listingTitle: r.listing_id ? listingTitleById.get(r.listing_id) : undefined,
    freelancerName: freelancerNameById.get(r.freelancer_id),
    buyerName: buyerNameById.get(r.buyer_id),
  }));
}

export async function markBookingComplete(bookingId: string): Promise<boolean> {
  const completedAt = new Date();
  const autoRelease = new Date(completedAt.getTime() + 48 * 3600 * 1000);
  const { error } = await supabase.from("bookings").update({
    status: "completed", completed_at: completedAt.toISOString(), auto_release_at: autoRelease.toISOString(),
  }).eq("id", bookingId);
  return !error;
}

export async function flagDispute(bookingId: string): Promise<boolean> {
  const { error } = await supabase.from("bookings").update({ status: "disputed" }).eq("id", bookingId);
  return !error;
}

export async function submitReview(bookingId: string, revieweeId: string, rating: number, comment: string): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await supabase.from("reviews").insert({ booking_id: bookingId, reviewer_id: uid, reviewee_id: revieweeId, rating, comment });
  if (error) return false;
  const { data: revs } = await supabase.from("reviews").select("rating").eq("reviewee_id", revieweeId);
  if (revs?.length) {
    const avg = revs.reduce((s: number, r: any) => s + r.rating, 0) / revs.length;
    await supabase.from("freelancer_profiles").update({ rating_avg: avg, rating_count: revs.length }).eq("user_id", revieweeId);
  }
  return true;
}

// ---------------------------------------------------------------
// Freelancer: profile, listings, quotes, earnings
// ---------------------------------------------------------------

export interface LiveFreelancerProfile {
  displayName: string;
  bio: string;
  categories: string[];
  postal: string;
  payoutConnected: boolean;
  idVerificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
}

export async function fetchMyFreelancerProfile(): Promise<LiveFreelancerProfile | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase.from("freelancer_profiles").select("*").eq("user_id", uid).maybeSingle();
  if (!data) return null;
  return {
    displayName: data.display_name ?? "",
    bio: data.bio ?? "",
    categories: data.categories ?? [],
    postal: data.postal ?? "",
    payoutConnected: data.payout_connected ?? false,
    idVerificationStatus: data.id_verification_status ?? "unsubmitted",
    ratingAvg: Number(data.rating_avg ?? 0),
    ratingCount: data.rating_count ?? 0,
  };
}

export interface LiveListing {
  id: string;
  category: string;
  listingType: ListingType;
  title: string;
  description: string;
  rate?: number;
  packagePrice?: number;
  status: string;
}

export async function fetchMyListings(): Promise<LiveListing[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data } = await supabase.from("listings").select("*").eq("freelancer_id", uid).order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({
    id: r.id, category: r.category, listingType: r.listing_type, title: r.title, description: r.description ?? "",
    rate: r.rate ?? undefined, packagePrice: r.package_price ?? undefined, status: r.status,
  }));
}

export interface ListingInput {
  category: ListingCategory;
  listingType: ListingType;
  title: string;
  description: string;
  rate?: number;
  packagePrice?: number;
}

export async function saveListing(input: ListingInput): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await supabase.from("listings").insert({
    freelancer_id: uid,
    category: input.category,
    listing_type: input.listingType,
    title: input.title,
    description: input.description,
    rate: input.rate ?? null,
    package_price: input.packagePrice ?? null,
    status: "active",
  });
  return !error;
}

export interface LiveQuote {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  brief: string;
  price: number | null;
  status: string;
  expiresAt: string;
}

export async function fetchMyQuotes(): Promise<LiveQuote[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data: myListings } = await supabase.from("listings").select("id, title").eq("freelancer_id", uid);
  const listingIds = (myListings ?? []).map((l) => l.id);
  if (!listingIds.length) return [];
  const titleById = new Map((myListings ?? []).map((l) => [l.id, l.title]));
  const { data } = await supabase.from("quotes").select("*").in("listing_id", listingIds).order("requested_at", { ascending: false });
  const rows = data ?? [];
  if (!rows.length) return [];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id))];
  const { data: buyers } = await supabase.from("profiles").select("id, name").in("id", buyerIds);
  const buyerNameById = new Map((buyers ?? []).map((p: any) => [p.id, p.name]));
  return rows.map((r: any) => ({
    id: r.id, listingId: r.listing_id, listingTitle: titleById.get(r.listing_id) ?? "—",
    buyerId: r.buyer_id, buyerName: buyerNameById.get(r.buyer_id) ?? "—",
    brief: r.brief, price: r.price, status: r.status, expiresAt: r.expires_at,
  }));
}

export async function setListingStatus(listingId: string, status: "active" | "paused"): Promise<boolean> {
  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  return !error;
}

export async function updateFreelancerProfile(fields: { displayName?: string; bio?: string; postal?: string; radiusKm?: number }): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await supabase.from("freelancer_profiles").upsert({
    user_id: uid,
    ...(fields.displayName !== undefined ? { display_name: fields.displayName } : {}),
    ...(fields.bio !== undefined ? { bio: fields.bio } : {}),
    ...(fields.postal !== undefined ? { postal: fields.postal } : {}),
    ...(fields.radiusKm !== undefined ? { radius_km: fields.radiusKm } : {}),
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function respondToQuote(quoteId: string, price: number): Promise<boolean> {
  const { error } = await supabase.from("quotes")
    .update({ price, status: "quoted", responded_at: new Date().toISOString() }).eq("id", quoteId);
  return !error;
}

/** Starts (or resumes) real Stripe Express onboarding via the create-connect-account Edge Function. */
export async function requestConnectOnboarding(): Promise<{ onboardingUrl?: string; alreadyConnected?: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("create-connect-account", { body: {} });
  if (error) return { error: error.message };
  return (data as any) ?? { error: "empty response" };
}

/** Re-checks the freelancer's Stripe account against Stripe and syncs freelancer_profiles.payout_connected. */
export async function refreshConnectStatus(): Promise<{ payoutConnected: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("refresh-connect-status", { body: {} });
  if (error) return { payoutConnected: false, error: error.message };
  return (data as any) ?? { payoutConnected: false, error: "empty response" };
}

/** Triggers the real Stripe Transfer of a completed booking's freelancer_payout share. */
export async function requestPayoutRelease(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke("release-booking-payout", { body: { bookingId } });
  if (error) return { ok: false, error: error.message };
  return (data as any) ?? { ok: false, error: "empty response" };
}

export async function fetchEarnings(): Promise<{ total: number; pending: number; bookings: LiveBooking[] }> {
  const uid = await currentUserId();
  if (!uid) return { total: 0, pending: 0, bookings: [] };
  const { data } = await supabase.from("bookings").select("*").eq("freelancer_id", uid).in("status", ["paid_out", "completed"]);
  const rows = data ?? [];
  const total = rows.filter((b) => b.status === "paid_out").reduce((s, b) => s + Number(b.freelancer_payout ?? 0), 0);
  const pending = rows.filter((b) => b.status === "completed").reduce((s, b) => s + Number(b.freelancer_payout ?? 0), 0);
  return { total, pending, bookings: rows.map((r) => bookingRowToLive(r, {})) };
}

// ---------------------------------------------------------------
// Employer: candidates, job postings, applicants, billing
// ---------------------------------------------------------------

export interface LiveCandidate {
  id: string;
  jobId: string;
  initials: string;
  interests: string[];
  postalFsa: string;
  radiusKm: number;
  hasResume: boolean;
  matchScore: number;
}

export async function fetchCandidateDeck(): Promise<LiveCandidate[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const [{ data: myJobs }, { data: swiped }, { data: cards, error }] = await Promise.all([
    supabase.from("jobs").select("*").eq("employer_id", uid).eq("status", "active").order("created_at", { ascending: false }).limit(1),
    supabase.from("swipes").select("target_id").eq("swiper_id", uid).eq("target_type", "worker"),
    supabase.rpc("worker_cards", { p_exclude_uid: uid }).limit(50),
  ]);
  if (error || !cards || !myJobs?.length) return [];
  const swipedIds = new Set((swiped ?? []).map((s) => s.target_id));
  const posting = jobRowToPosting(myJobs[0]);
  const candidates = cards
    .filter((c: any) => c.user_id !== uid && !swipedIds.has(c.user_id))
    .map((row: any, i: number): MatchWorkerProfile & { id: string; hasResume: boolean; postalFsa: string } => {
      const av = row.availability ?? {};
      const sc = av.screening ?? {};
      return {
        id: row.user_id,
        loc: postalToCoords(row.fsa ?? ""),
        maxKm: row.radius_km ?? 10,
        commute: "transit",
        interests: row.interests ?? [],
        experience: [],
        days: Array.isArray(av.days) && av.days.length ? av.days : [0, 1, 2, 3, 4],
        slots: ["morning", "afternoon", "evening"],
        languages: row.lang === "en" ? ["en"] : ["fr"],
        noticeDays: sc.notice === "Immédiatement" ? 0 : 7,
        hasResume: !!row.has_resume,
        postalFsa: row.fsa ?? "",
      };
    });
  return rankWorkersForJob(posting, candidates).map(({ worker, match }) => ({
    id: String(worker.id),
    jobId: String(myJobs[0].id),
    initials: `C${String(worker.id).slice(0, 2).toUpperCase()}`,
    interests: worker.interests,
    postalFsa: (worker as any).postalFsa,
    radiusKm: worker.maxKm,
    hasResume: (worker as any).hasResume,
    matchScore: match.total,
  }));
}

/** Employer right-swipes a worker for one of their active jobs (free); creates the match (pending_payment) if the worker already applied. */
export async function swipeCandidate(workerId: string, jobId: string, direction: "right" | "left"): Promise<{ ok: boolean; matched: boolean }> {
  const uid = await currentUserId();
  if (!uid) return { ok: false, matched: false };
  await supabase.from("swipes").upsert(
    { swiper_id: uid, target_type: "worker", target_id: workerId, direction },
    { onConflict: "swiper_id,target_type,target_id" },
  );
  if (direction === "left") return { ok: true, matched: false };
  const { data: recip } = await supabase.from("swipes")
    .select("target_id").eq("swiper_id", workerId).eq("target_type", "job").eq("target_id", jobId)
    .in("direction", ["right", "super"]).maybeSingle();
  if (recip) {
    const { error } = await supabase.from("matches").upsert(
      { job_id: jobId, worker_id: workerId, employer_id: uid },
      { onConflict: "job_id,worker_id" },
    );
    return { ok: !error, matched: !error };
  }
  return { ok: true, matched: false };
}

export interface LiveJobPosting {
  id: string;
  title: string;
  payLabel: string;
  status: string;
  applicantCount: number;
  createdAt: string;
}

export async function fetchMyJobPostings(): Promise<LiveJobPosting[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data: rows, error } = await supabase.from("jobs").select("*").eq("employer_id", uid).order("created_at", { ascending: false });
  if (error || !rows?.length) return [];
  const jobIds = rows.map((r) => r.id);
  const { data: swipeRows } = await supabase.from("swipes").select("target_id")
    .eq("target_type", "job").in("target_id", jobIds).in("direction", ["right", "super"]);
  const countByJob = new Map<string, number>();
  for (const s of swipeRows ?? []) countByJob.set(s.target_id, (countByJob.get(s.target_id) ?? 0) + 1);
  return rows.map((r) => {
    const posting = jobRowToPosting(r);
    return { id: r.id, title: r.title, payLabel: posting.payLabel, status: r.status, applicantCount: countByJob.get(r.id) ?? 0, createdAt: r.created_at };
  });
}

export interface JobInput {
  title: string;
  bizType: string;
  shifts: number[];
  payType: "hourly" | "salary";
  pay: string;
  urgency: number;
  screeningQs: string[];
}

export async function insertJob(job: JobInput): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { data: emp } = await supabase.from("employer_profiles").select("company, postal").eq("user_id", uid).maybeSingle();
  const { error } = await supabase.from("jobs").insert({
    employer_id: uid,
    title: job.title,
    company: emp?.company ?? null,
    postal: emp?.postal ?? null,
    biz_type: job.bizType || null,
    shifts: job.shifts,
    pay_type: job.payType,
    pay: job.pay ? Number(job.pay) : null,
    urgency: String(job.urgency),
    screening_qs: job.screeningQs.filter(Boolean),
    status: "active",
  });
  return !error;
}

export interface LivePayment {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
}

/** The signed-in employer's own payment history (matches, bundles, monthly, superlikes). */
export async function fetchMyPayments(): Promise<LivePayment[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data } = await supabase.from("payments").select("*").eq("employer_id", uid).order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => ({ id: r.id, type: r.type, amount: Number(r.amount), createdAt: r.created_at }));
}

export interface LiveEmployerMatch {
  id: string;
  workerId: string;
  workerName: string;
  jobTitle: string;
  status: "pending_payment" | "active" | "signed" | "closed";
  createdAt: string;
}

/** The signed-in employer's own matches (across all their jobs), worker name resolved. */
export async function fetchEmployerMatches(): Promise<LiveEmployerMatch[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data } = await supabase.from("matches")
    .select("id, worker_id, status, created_at, jobs(title)")
    .eq("employer_id", uid).order("created_at", { ascending: false });
  const rows = data ?? [];
  if (!rows.length) return [];
  const workerIds = [...new Set(rows.map((r: any) => r.worker_id))];
  const { data: workers } = await supabase.from("profiles").select("id, name").in("id", workerIds);
  const nameById = new Map((workers ?? []).map((w: any) => [w.id, w.name]));
  return rows.map((r: any) => ({
    id: r.id, workerId: r.worker_id, workerName: nameById.get(r.worker_id) ?? "—",
    jobTitle: r.jobs?.title ?? "—", status: r.status, createdAt: r.created_at,
  }));
}

export async function updateEmployerProfile(fields: { company?: string; bizType?: string; postal?: string }): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await supabase.from("employer_profiles").upsert({
    user_id: uid,
    ...(fields.company !== undefined ? { company: fields.company } : {}),
    ...(fields.bizType !== undefined ? { biz_type: fields.bizType } : {}),
    ...(fields.postal !== undefined ? { postal: fields.postal } : {}),
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export interface LiveEmployerProfile {
  company: string;
  bizType: string;
  postal: string;
  size: string;
  plan: string;
  matchesRemaining: number;
}

export async function fetchMyEmployerProfile(): Promise<LiveEmployerProfile | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase.from("employer_profiles").select("*").eq("user_id", uid).maybeSingle();
  if (!data) return null;
  return {
    company: data.company ?? "",
    bizType: data.biz_type ?? "",
    postal: data.postal ?? "",
    size: data.size ?? "",
    plan: data.plan ?? "paygo",
    matchesRemaining: data.matches_remaining ?? 0,
  };
}

// ---------------------------------------------------------------
// Shared: account (profiles row, used by every role's Account tab)
// ---------------------------------------------------------------

export async function fetchMyName(): Promise<string> {
  const uid = await currentUserId();
  if (!uid) return "";
  const { data } = await supabase.from("profiles").select("name").eq("id", uid).maybeSingle();
  const { data: userData } = await supabase.auth.getUser();
  return data?.name || userData.user?.email?.split("@")[0] || "";
}

export async function updateMyName(name: string): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await supabase.from("profiles").update({ name }).eq("id", uid);
  return !error;
}

export async function updateWorkerProfile(fields: { postal?: string; radiusKm?: number }): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { error } = await supabase.from("worker_profiles").upsert({
    user_id: uid,
    ...(fields.postal !== undefined ? { postal: fields.postal } : {}),
    ...(fields.radiusKm !== undefined ? { radius_km: fields.radiusKm } : {}),
    updated_at: new Date().toISOString(),
  });
  return !error;
}
