/**
 * Feature flags for the PilgrimCompare application.
 * All flags are environment-driven and read at runtime.
 */

/** Whether to use the real Postgres database (via Prisma) instead of MockDB */
export const FEATURE_USE_REAL_DB =
  process.env.FEATURE_USE_REAL_DB === 'true';

/**
 * Whether Featured package slots are active in the list UI.
 *
 * Default FALSE — no operator is featured at launch.
 *
 * When true: up to 2 Featured packages appear ABOVE the neutral-sorted list,
 * in a visually distinct section labelled "Featured" at the slot itself.
 * Featured packages are excluded from the neutral-sorted results count.
 * Featured status does NOT affect the neutral sort score (scorePackage).
 *
 * NEVER read this flag client-side. Evaluate on the server and pass the
 * result as a `featuredSlotsEnabled: boolean` prop to list components.
 *
 * Set to true only when at least one operator has isFeatured=true in the DB
 * and the phase-2 Featured placement terms have been agreed and disclosed.
 */
export const FEATURE_FEATURED_SLOTS =
  process.env.FEATURE_FEATURED_SLOTS === 'true';

/**
 * Whether the booking-intent / bank-details / payment-evidence flow is live in
 * the pilgrim journey.
 *
 * Default FALSE — PARKED (see PARKED_FEATURES.md entry 1). When off, a pilgrim
 * cannot reach the "Proceed direct" booking screen, the payment-evidence upload,
 * the operator bank details, or the booking confirmation screen. The code is
 * intact and reversible — never delete it.
 *
 * NEVER read this flag client-side. Evaluate on the server (via
 * isBookingFlowEnabled) and pass the result down as a boolean prop.
 *
 * Re-enable only on explicit founder instruction.
 */
export const FEATURE_BOOKING_FLOW =
  process.env.FEATURE_BOOKING_FLOW === 'true';

/**
 * Whether the multi-step RFQ (request-for-quote) engine is live in the pilgrim
 * journey.
 *
 * Default FALSE — PARKED (see PARKED_FEATURES.md entry 2). When off, the
 * `/quote` wizard route 404s, the package page hides its "Request quote" CTA,
 * the quote-request API rejects writes, and the `/quote` entry links are hidden.
 * The code is intact and reversible — never delete it.
 *
 * NEVER read this flag client-side. Evaluate on the server (via
 * isRfqQuoteEnabled) and pass the result down as a boolean prop.
 *
 * Re-enable only on explicit founder instruction.
 */
export const FEATURE_RFQ_QUOTE =
  process.env.FEATURE_RFQ_QUOTE === 'true';

/** Server-side accessor for the booking-intent/payment flow flag. */
export function isBookingFlowEnabled(): boolean {
  return FEATURE_BOOKING_FLOW;
}

/** Server-side accessor for the multi-step RFQ quote engine flag. */
export function isRfqQuoteEnabled(): boolean {
  return FEATURE_RFQ_QUOTE;
}

/** Whether we're running in test mode (Vitest) */
export const IS_TEST_ENV = process.env.NODE_ENV === 'test';

/** Whether we're running in development */
export const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/** Whether we're running in production */
export const IS_PROD_ENV = process.env.NODE_ENV === 'production';

/**
 * Get the active data source for repository operations.
 * - Tests: always MockDB (fast, deterministic, no DB needed)
 * - E2E: always MockDB (prod build + MockDB seed users)
 * - All other environments: requires FEATURE_USE_REAL_DB=true — throws otherwise
 */
export function getDataSource(): 'prisma' | 'mockdb' {
  if (IS_TEST_ENV) return 'mockdb';
  // E2E tests run in production mode (next build + next start) but must use MockDB
  // because test users only exist in MockDB, not in the real database.
  if (process.env.E2E_TESTING === '1') return 'mockdb';
  if (!FEATURE_USE_REAL_DB) {
    throw new Error(
      'FEATURE_USE_REAL_DB is not set to true. The app will not start without a real database connection. ' +
      'Set this variable in your Vercel environment variables or .env.local file.'
    );
  }
  return 'prisma';
}