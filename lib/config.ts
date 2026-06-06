/**
 * Feature flags for the KaabaTrip application.
 * All flags are environment-driven and read at runtime.
 */

/** Whether to use the real Postgres database (via Prisma) instead of MockDB */
export const FEATURE_USE_REAL_DB =
  process.env.FEATURE_USE_REAL_DB === 'true';

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
 * - All other environments: MockDB unless FEATURE_USE_REAL_DB=true
 *
 * Prisma/Postgres is only activated by explicit opt-in (FEATURE_USE_REAL_DB=true).
 * This prevents the server from crashing in production before the DB is provisioned.
 */
export function getDataSource(): 'prisma' | 'mockdb' {
  if (IS_TEST_ENV) return 'mockdb';
  // E2E tests run in production mode (next build + next start) but must use MockDB
  // because test users only exist in MockDB, not in the real database.
  if (process.env.E2E_TESTING === '1') return 'mockdb';
  return FEATURE_USE_REAL_DB ? 'prisma' : 'mockdb';
}