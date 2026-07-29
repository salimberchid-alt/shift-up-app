/**
 * ShiftUp matching engine (ported verbatim from shiftup-app/src/lib/matching.ts,
 * the same pure scoring code the production mobile app uses — kept identical so
 * the web dashboard never disagrees with the app about a match score).
 *
 * Scores a worker↔job pair from 0–100 using six weighted components:
 *
 *   distance      22%: haversine km vs the worker's max radius, adjusted by commute mode
 *   category      22%: job category vs worker interests (with related-category credit)
 *   availability  22%: overlap of days and time slots the job needs vs worker's schedule
 *   experience    18%: years in the job's category (related experience counts half)
 *   language      8%:  job's required languages vs worker's languages
 *   pay           8%:  offered wage vs the worker's minimum
 *
 * An urgency synergy bonus (up to +4) applies when an urgent job meets a worker
 * who can start immediately. The same pairwise score serves both directions:
 * ranking jobs for a worker and ranking workers for a job.
 */

export type Slot = 'morning' | 'afternoon' | 'evening' | 'night';
export type Language = 'fr' | 'en';
export type Commute = 'car' | 'transit' | 'active' | 'both';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Experience {
  /** Category id from INTERESTS (e.g. 'cafe', 'warehouse') */
  category: string;
  years: number;
}

export interface WorkerProfile {
  id?: number | string;
  loc: GeoPoint;
  /** Max commute distance chosen by the worker, in km */
  maxKm: number;
  commute: Commute;
  /** Category ids the worker wants to work in */
  interests: string[];
  experience: Experience[];
  /** 0 = Monday … 6 = Sunday */
  days: number[];
  slots: Slot[];
  languages: Language[];
  /** Minimum hourly wage; undefined = flexible */
  minPay?: number;
  /** Days before the worker can start (0 = immediately) */
  noticeDays: number;
  hasResume?: boolean;
}

export interface JobPosting {
  id: number | string;
  loc: GeoPoint;
  category: string;
  /** Minimum years of relevant experience; 0 = none required */
  minExpYears: number;
  days: number[];
  slots: Slot[];
  /** Languages the job requires (empty = any) */
  languages: Language[];
  /** Hourly wage in dollars */
  pay: number;
  urgent: boolean;
}

export interface MatchBreakdown {
  distance: number;
  category: number;
  availability: number;
  experience: number;
  language: number;
  pay: number;
}

export interface MatchResult {
  total: number;
  km: number;
  breakdown: MatchBreakdown;
  /** Short FR strings explaining the strongest factors, for UI chips */
  reasons: string[];
}

const WEIGHTS: Record<keyof MatchBreakdown, number> = {
  distance: 0.22,
  category: 0.22,
  availability: 0.22,
  experience: 0.18,
  language: 0.08,
  pay: 0.08,
};

/** Categories close enough that experience/interest transfers between them. */
const RELATED: Record<string, string[]> = {
  cafe: ['restaurant'],
  restaurant: ['cafe', 'events'],
  events: ['restaurant'],
  warehouse: ['manual', 'driving'],
  manual: ['warehouse', 'construction', 'cleaning'],
  construction: ['manual', 'outdoor'],
  outdoor: ['construction', 'cleaning'],
  cleaning: ['manual', 'outdoor'],
  driving: ['warehouse'],
  mechanic: ['manual'],
  retail: ['office', 'cafe'],
  office: ['retail'],
  security: [],
  stable: [],
};

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function scoreDistance(km: number, maxKm: number, commute: Commute): number {
  const factor = commute === 'active' ? 1.35 : commute === 'transit' ? 1.1 : 0.85;
  const effective = (km * factor) / Math.max(maxKm, 1);
  const s = 100 * Math.exp(-1.05 * effective);
  return Math.round(Math.max(10, Math.min(100, s)));
}

function isRelated(a: string, b: string): boolean {
  return (RELATED[a] ?? []).includes(b) || (RELATED[b] ?? []).includes(a);
}

function scoreCategory(jobCategory: string, interests: string[]): number {
  if (interests.includes(jobCategory)) return 100;
  if (interests.some((i) => isRelated(i, jobCategory))) return 70;
  return 25;
}

function scoreAvailability(job: JobPosting, worker: WorkerProfile): number {
  const dayNeeds = job.days.length || 1;
  const daysCovered = job.days.filter((d) => worker.days.includes(d)).length / dayNeeds;
  const slotNeeds = job.slots.length || 1;
  const slotsCovered = job.slots.filter((s) => worker.slots.includes(s)).length / slotNeeds;
  return Math.round(100 * (daysCovered * 0.6 + slotsCovered * 0.4));
}

function scoreExperience(job: JobPosting, worker: WorkerProfile): number {
  let years = 0;
  for (const exp of worker.experience) {
    if (exp.category === job.category) years += exp.years;
    else if (isRelated(exp.category, job.category)) years += exp.years * 0.5;
  }
  if (job.minExpYears <= 0) {
    return years > 0 ? 100 : 80;
  }
  const ratio = years / job.minExpYears;
  if (ratio >= 1.5) return 100;
  if (ratio >= 1) return 88;
  if (ratio >= 0.5) return 60;
  if (years > 0) return 40;
  return 20;
}

function scoreLanguage(job: JobPosting, worker: WorkerProfile): number {
  if (job.languages.length === 0) return 100;
  const covered = job.languages.filter((l) => worker.languages.includes(l)).length;
  if (covered === job.languages.length) return 100;
  if (covered > 0) return 55;
  return 15;
}

function scorePay(job: JobPosting, worker: WorkerProfile): number {
  if (worker.minPay === undefined) return 85;
  if (job.pay >= worker.minPay) {
    const above = (job.pay - worker.minPay) / worker.minPay;
    return Math.round(Math.min(100, 88 + above * 60));
  }
  const below = (worker.minPay - job.pay) / worker.minPay;
  return Math.round(Math.max(10, 88 - below * 220));
}

export function matchWorkerToJob(worker: WorkerProfile, job: JobPosting): MatchResult {
  const km = haversineKm(worker.loc, job.loc);
  const breakdown: MatchBreakdown = {
    distance: scoreDistance(km, worker.maxKm, worker.commute),
    category: scoreCategory(job.category, worker.interests),
    availability: scoreAvailability(job, worker),
    experience: scoreExperience(job, worker),
    language: scoreLanguage(job, worker),
    pay: scorePay(job, worker),
  };

  let total = 0;
  for (const k of Object.keys(WEIGHTS) as (keyof MatchBreakdown)[]) {
    total += breakdown[k] * WEIGHTS[k];
  }
  if (job.urgent && worker.noticeDays === 0) total += 4;

  const rounded = Math.round(Math.max(0, Math.min(100, total)));
  return { total: rounded, km: Math.round(km * 10) / 10, breakdown, reasons: buildReasons(breakdown, km) };
}

function buildReasons(b: MatchBreakdown, km: number): string[] {
  const out: string[] = [];
  if (b.distance >= 80) out.push(`À ${km.toFixed(1)} km`);
  if (b.category >= 100) out.push('Domaine préféré');
  else if (b.category >= 70) out.push('Domaine connexe');
  if (b.availability >= 85) out.push('Horaire compatible');
  if (b.experience >= 88) out.push('Expérience solide');
  if (b.pay >= 95) out.push('Salaire au-dessus du minimum');
  if (b.language >= 100) out.push('Langues OK');
  return out.slice(0, 3);
}

export function rankJobsForWorker<T extends JobPosting>(
  worker: WorkerProfile,
  jobs: T[],
): { job: T; match: MatchResult }[] {
  return jobs
    .map((job) => ({ job, match: matchWorkerToJob(worker, job) }))
    .sort((a, b) => b.match.total - a.match.total);
}

export function rankWorkersForJob<T extends WorkerProfile & { id: number | string }>(
  job: JobPosting,
  workers: T[],
): { worker: T; match: MatchResult }[] {
  return workers
    .map((worker) => ({ worker, match: matchWorkerToJob(worker, job) }))
    .sort((a, b) => b.match.total - a.match.total);
}
