/**
 * Freelance / Local Services marketplace pricing engine, ported verbatim from
 * shiftup-app/src/lib/marketplace.ts — the single source of truth for the 30%
 * take rate (15% buyer-side + 15% seller-side) so the web dashboard's numbers
 * never disagree with the mobile app's.
 */

export type ListingCategory = 'photography' | 'modeling' | 'ugc' | 'marketing' | 'influencer' | 'other';
export type ListingType = 'hourly' | 'package';
export type BookingStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'disputed' | 'paid_out' | 'cancelled';

export interface PriceBreakdown {
  subtotal: number;
  buyerFee: number;
  buyerTotal: number;
  sellerFee: number;
  freelancerPayout: number;
  platformTake: number;
}

/** Flat 30% take rate (15% buyer-side + 15% seller-side), no tapering. */
export const BUYER_FEE_RATE = 0.15;
export const SELLER_FEE_RATE = 0.15;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** The one place the 15%/15% math lives. */
export function computeBreakdown(subtotal: number): PriceBreakdown {
  const buyerFee = round2(subtotal * BUYER_FEE_RATE);
  const sellerFee = round2(subtotal * SELLER_FEE_RATE);
  return {
    subtotal: round2(subtotal),
    buyerFee,
    buyerTotal: round2(subtotal + buyerFee),
    sellerFee,
    freelancerPayout: round2(subtotal - sellerFee),
    platformTake: round2(buyerFee + sellerFee),
  };
}

export const CATEGORIES: { id: ListingCategory; fr: string; en: string }[] = [
  { id: 'photography', fr: 'Photographie', en: 'Photography' },
  { id: 'modeling', fr: 'Mannequinat', en: 'Modeling' },
  { id: 'ugc', fr: 'Contenu Pub / UGC', en: 'Ad/UGC Content' },
  { id: 'marketing', fr: 'Marketing freelance', en: 'Freelance Marketing' },
  { id: 'influencer', fr: 'Influenceur TikTok/IG', en: 'TikTok/IG Influencer' },
  { id: 'other', fr: 'Autre', en: 'Other' },
];

export function categoryLabel(id: string, en: boolean): string {
  const c = CATEGORIES.find((c) => c.id === id);
  if (!c) return id;
  return en ? c.en : c.fr;
}
