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
 * - Production: always real DB
 * - Tests: always MockDB (fast, deterministic, no DB needed)
 * - Development: controlled by FEATURE_USE_REAL_DB flag
 */
export function getDataSource(): 'prisma' | 'mockdb' {
  if (IS_TEST_ENV) return 'mockdb';
  if (IS_PROD_ENV) return 'prisma';
  return FEATURE_USE_REAL_DB ? 'prisma' : 'mockdb';
}