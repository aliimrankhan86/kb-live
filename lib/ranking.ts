import type { Package } from '@/lib/types';

/**
 * Neutral listing quality score for PilgrimCompare packages.
 *
 * Required by DMCC Act 2024 Schedule 20: default sort order must use only
 * disclosed, non-commercial criteria. No operator pays for ranking.
 *
 * HOW THE SCORE WORKS (plain English):
 *
 *   1. DATA COMPLETENESS (45%)
 *      A listing with more filled-in details — hotel names, airline, exact
 *      distance to Haram, cancellation policy, deposit terms, group type,
 *      highlights, travel dates — is more useful to someone comparing side
 *      by side. Score = fraction of 16 optional fields that are filled in
 *      (0 = nothing filled; 1 = everything filled).
 *
 *   2. PRICE CONFIRMATION RECENCY (35%)
 *      A package updated recently is more likely to have accurate pricing.
 *      Full score (1.0) if updated within the last 7 days; decays linearly
 *      to 0.0 at 90 days. Older than 90 days scores 0.
 *
 *   3. OPERATOR RESPONSE RATE (20%)
 *      How quickly the operator replies to enquiries. Currently neutral 0.5
 *      for all operators — no measured response-rate data exists yet.
 *      When real per-operator data is available, pass it as `responseRate`.
 *
 *   RELEVANCE: packages reach this function only after the user's active
 *   filters have already been applied — every package here has already
 *   passed the user's criteria. Within that filtered set, completeness and
 *   recency proxy relevance: a complete, fresh listing gives the traveller
 *   what they need to make a decision.
 *
 * No commercial, paid, editorial, or isFeatured input affects this score.
 * The score is deterministic given the same package data.
 */

const COMPLETENESS_WEIGHT = 0.45;
const RECENCY_WEIGHT = 0.35;
const RESPONSE_RATE_WEIGHT = 0.20;

const RECENCY_FRESH_DAYS = 7;
const RECENCY_STALE_DAYS = 90;
const MS_PER_DAY = 86_400_000;

type FieldCheck = (p: Package) => boolean;

const OPTIONAL_FIELDS: FieldCheck[] = [
  (p) => p.hotelMakkahStars != null,
  (p) => p.hotelMadinahStars != null,
  (p) => !!p.hotelMakkahName,
  (p) => !!p.hotelMadinahName,
  (p) => p.distanceToHaramMakkahMetres != null,
  (p) => p.distanceToHaramMadinahMetres != null,
  (p) => !!p.airline,
  (p) => !!p.departureAirport,
  (p) => !!p.flightType,
  (p) => p.depositAmount != null,
  (p) => p.paymentPlanAvailable != null,
  (p) => !!p.cancellationPolicy,
  (p) => Array.isArray(p.highlights) && p.highlights.length > 0,
  (p) => !!p.groupType,
  (p) => !!p.seasonLabel,
  (p) => !!p.dateWindow?.start,
];

function completenessScore(pkg: Package): number {
  const filled = OPTIONAL_FIELDS.filter((check) => check(pkg)).length;
  return filled / OPTIONAL_FIELDS.length;
}

function recencyScore(updatedAt: string | undefined): number {
  if (!updatedAt) return 0;
  const ageDays = (Date.now() - new Date(updatedAt).getTime()) / MS_PER_DAY;
  if (ageDays <= RECENCY_FRESH_DAYS) return 1.0;
  if (ageDays >= RECENCY_STALE_DAYS) return 0.0;
  return 1 - (ageDays - RECENCY_FRESH_DAYS) / (RECENCY_STALE_DAYS - RECENCY_FRESH_DAYS);
}

/**
 * Neutral listing quality score for one package. Higher = ranked first.
 * Range 0–1. Safe to call with no response-rate data (defaults to neutral 0.5).
 */
export function scorePackage(pkg: Package, responseRate = 0.5): number {
  return (
    COMPLETENESS_WEIGHT * completenessScore(pkg) +
    RECENCY_WEIGHT * recencyScore(pkg.updatedAt) +
    RESPONSE_RATE_WEIGHT * responseRate
  );
}

/** Return a new array sorted by neutral listing quality score, highest first. */
export function sortByScore(packages: Package[]): Package[] {
  return [...packages].sort((a, b) => scorePackage(b) - scorePackage(a));
}
