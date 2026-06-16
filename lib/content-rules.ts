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

/**
 * Verification statement — the approved §7 wording, verbatim.
 *
 * Single source of truth so the statement reads identically everywhere the
 * "Verified" badge links or expands to it (§7 requires consistency). Reference
 * this constant; never paraphrase or summarise it.
 */
export const VERIFICATION_STATEMENT =
  "Before any operator is listed, we check: (1) their ATOL number against the CAA's public register, (2) their company status at Companies House, (3) that they have a real, verifiable UK trading address. Verification confirms these checks at the time of listing. It is not a guarantee of service quality, financial protection for your specific booking, or future conduct."

/**
 * One-line model description (§1 / §12). States what the service is and is not.
 * Used as the homepage hero supporting line.
 */
export const MODEL_DESCRIPTION =
  'Compare Umrah and Hajj packages from verified UK operators, then enquire directly. We are a comparison and enquiry service, not a travel agent, and we never take payment.'

/**
 * §4 standard copy line carried on the homepage trust block.
 * Verbatim — do not paraphrase.
 */
export const PAYMENT_STANDARD_LINE =
  'You pay the operator directly. PilgrimCompare does not receive or hold your payment.'

/**
 * §4 standard copy lines 2 and 3. Verbatim — do not paraphrase.
 * Shown with PAYMENT_STANDARD_LINE on the enquiry confirmation screen.
 */
export const CONTRACT_STANDARD_LINE =
  'Your travel contract, cancellations and refunds are with the operator named on this page.'

export const REFERENCE_CODE_STANDARD_LINE =
  'Your PilgrimCompare reference code is a tracking code, not a payment receipt.'

/**
 * The three canonical payment-posture lines, in order. Single source for the
 * enquiry confirmation screen. Verbatim — do not paraphrase or reorder.
 */
export const PAYMENT_POSTURE_LINES = [
  PAYMENT_STANDARD_LINE,
  CONTRACT_STANDARD_LINE,
  REFERENCE_CODE_STANDARD_LINE,
] as const

/**
 * Homepage FAQ — defined once and fed to BOTH the FAQPage JSON-LD and the
 * visible on-page FAQ section, so the structured data is never orphaned.
 */
export const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: 'What does PilgrimCompare compare?',
    answer:
      'PilgrimCompare compares Hajj and Umrah packages by price, departure route, hotel details, inclusions, nights split, and visible operator trust signals such as verification status, ATOL number, and ABTA details where provided.',
  },
  {
    question: 'Does PilgrimCompare take payment for packages?',
    answer:
      'No. PilgrimCompare is a comparison and enquiry service. You pay the operator directly. PilgrimCompare does not receive or hold your payment.',
  },
]
