/**
 * Shared content-rules for PilgrimCompare copy and metadata.
 *
 * Rules sourced from docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md §5, §11, §14.
 * The banned-phrases test (tests/banned-phrases.test.ts) imports this list and
 * fails CI if any phrase appears in metadata string constants or templates.
 */

/**
 * Phrases that must never appear in metadata titles, descriptions, OG copy,
 * Twitter copy, or JSON-LD name/description fields.
 *
 * Each entry is a lowercase substring. The test matches case-insensitively.
 */
export const BANNED_METADATA_PHRASES: string[] = [
  // §5 — banned phrases and required replacements
  'book with pilgrimcompare',
  'book now',
  'guaranteed',
  '100% secure',
  'risk-free',
  'best price guaranteed',
  'best price',
  'cheapest umrah',
  'cheapest hajj',
  'lowest prices',
  'all uk operators',
  'every umrah package',
  'trusted by thousands',
  'visa included',
  'visa guaranteed',
  'refund available',
  'free cancellation',
  'top rated',
  'best operator',
  '#1',
  'official',
  'approved by',
  // §5 — "ATOL protected" as a blanket PilgrimCompare claim
  'atol protected',
  // §11 — hype adjectives
  'unforgettable',
  'seamless',
  'ultimate',
  'unbeatable',
  'amazing',
  // §5 — "partner" to describe operators
  'pilgrimcompare partners',
  // §14 — booking language implying PilgrimCompare concludes bookings
  'book your umrah',
  'book your hajj',
  'confirm your booking',
]

/**
 * Neutral sort disclosure string — used on all package list/search pages
 * as required by DMCC Act 2024 Schedule 20 and §16 of the standards doc.
 *
 * Place near the sort control. Link to a "How we rank" explainer when built.
 */
export const NEUTRAL_SORT_DISCLOSURE =
  'Sorted by relevance and listing quality. No operator pays for ranking.'
