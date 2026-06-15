import type { Page } from '@playwright/test';

/**
 * Cookie-consent banner suppression for E2E.
 *
 * The CookieConsent component (components/compliance/CookieConsent.tsx) renders
 * a `position: fixed; bottom: 0; z-40` banner whenever the consent key is absent
 * from localStorage. That banner overlaps the sticky compare bar and bottom-of-
 * viewport CTAs, intermittently intercepting pointer events during clicks
 * ("...subtree intercepts pointer events"). See AI_NOTES.md §Task 1 Outstanding.
 *
 * STORAGE_KEY and shape mirror CookieConsent.tsx exactly — keep in sync if that
 * component's consent contract changes.
 *
 * Uses addInitScript (not a one-off page.evaluate) so the key is re-seeded before
 * page scripts run on EVERY navigation. This survives the `localStorage.clear()`
 * calls in bank-payment.spec.ts, which a one-shot seed would not.
 *
 * Call once per test/beforeEach before the first navigation.
 */
const STORAGE_KEY = 'kb_cookie_consent_v1';

export async function dismissCookieBanner(page: Page): Promise<void> {
  await page.addInitScript(
    ([key]) => {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            essential: true,
            analytics: false,
            timestamp: '2026-01-01T00:00:00.000Z',
          }),
        );
      } catch {
        // localStorage may be unavailable in some contexts — banner stays,
        // but the test simply behaves as it did before this helper existed.
      }
    },
    [STORAGE_KEY] as const,
  );
}
