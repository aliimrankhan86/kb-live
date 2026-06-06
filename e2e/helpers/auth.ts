import type { Page } from '@playwright/test';

/**
 * Test users that mirror MockDB seed data.
 * IDs match the seeded operators/customers in lib/api/mock-db.ts.
 *
 * The __e2e_user cookie is read by:
 *  - lib/supabase/middleware.ts  (route guard bypass)
 *  - lib/auth/session.ts         (server API/RSC auth bypass)
 *
 * Only active when NODE_ENV !== 'production'.
 */
export const TEST_USERS = {
  /** Operator with seeded packages and payment details (id: op1) */
  operator: {
    id: 'op1',
    email: 'operator@example.com',
    role: 'operator',
    name: 'Ahmed Operator',
  },
  /**
   * Same data as op1 but with admin role — used for tests that need access
   * to both /operator/* routes (via op1's profile) and /admin/* routes.
   * Admin role satisfies both route guards per middleware ROLE_PROTECTED map.
   */
  operatorAdmin: {
    id: 'op1',
    email: 'operator@example.com',
    role: 'admin',
    name: 'Ahmed Operator',
  },
  /** Customer (id: cust1) */
  customer: {
    id: 'cust1',
    email: 'customer@example.com',
    role: 'customer',
    name: 'Ali Client',
  },
} as const;

export type TestUserRole = keyof typeof TEST_USERS;

/**
 * Inject __e2e_user cookie into the browser context.
 * Call before navigating to any protected route.
 */
export async function setTestUser(page: Page, role: TestUserRole): Promise<void> {
  await page.context().addCookies([
    {
      name: '__e2e_user',
      value: JSON.stringify(TEST_USERS[role]),
      domain: '127.0.0.1',
      path: '/',
      sameSite: 'Lax',
      httpOnly: false,
      secure: false,
    },
  ]);
}

/** Remove __e2e_user cookie — reverts to unauthenticated state. */
export async function clearTestUser(page: Page): Promise<void> {
  await page.context().clearCookies({ name: '__e2e_user' });
}
