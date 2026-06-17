import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './helpers/cookies';

test('Public catalogue flow: browse, detail, operator, compare', async ({ page }) => {
  await dismissCookieBanner(page);
  await page.goto('/packages');
  await expect(page.locator('[data-testid="packages-page"]')).toBeVisible();
  const packageCards = page.locator('[data-testid^="package-card-"]');
  await expect(packageCards.first()).toBeVisible();
  // The sticky compare bar (and its Compare button) only appears once at least
  // one package is selected — the compare-first flow shared with /search.
  const compareCheckboxes = page.locator('[data-testid^="package-compare-toggle-"]');
  const compareButton = page.locator('[data-testid="search-compare-button"]');
  const packageCount = await packageCards.count();
  if (packageCount >= 1) {
    await compareCheckboxes.nth(0).check();
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeDisabled();
  }
  if (packageCount >= 2) {
    await compareCheckboxes.nth(1).check();
    await expect(compareButton).toBeEnabled();
    await compareButton.click();

    const comparison = page.locator('[data-testid="comparison-table"]');
    await expect(comparison).toBeVisible();
    await page.keyboard.press('Escape');
  }

  const firstPackageLink = page.locator('[data-testid^="package-view-"]').first();
  await Promise.all([
    page.waitForURL('**/packages/**'),
    firstPackageLink.click(),
  ]);
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('[data-testid="package-detail-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="package-cta-request-quote"]')).toBeVisible();
  await expect(page.locator('[data-testid="package-title"]')).toBeVisible();

  await page.waitForLoadState('domcontentloaded');
  await page.goto('/operators/al-hidayah-travel');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('[data-testid="operator-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="operator-name"]')).toBeVisible();
  await expect(page.locator('[data-testid^="operator-package-link-"]').first()).toBeVisible();

  if (packageCount >= 2) {
    await page.goto('/packages');
    await expect(page.locator('[data-testid="packages-page"]')).toBeVisible();
  }
});

test('Self-serve operator onboarding is hidden from the public flow', async ({ page }) => {
  await dismissCookieBanner(page);

  // /partner no longer links the self-serve wizard (concierge model is live).
  await page.goto('/partner');
  await expect(page.locator('[data-testid="partner-cta-contact"]')).toBeVisible();
  await expect(page.locator('a[href="/operator/onboarding"]')).toHaveCount(0);

  // The route itself is gated: an unauthenticated visitor is redirected to home
  // by the middleware role gate, never landing on the registration form.
  await page.goto('/operator/onboarding');
  await page.waitForLoadState('domcontentloaded');
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(page.getByText('Operator Registration')).toHaveCount(0);
});

test('Comparison shows the operator-stated Ziyarat row (desktop + 390px)', async ({ page }) => {
  await dismissCookieBanner(page);
  await page.goto('/packages');
  await expect(page.locator('[data-testid="packages-page"]')).toBeVisible();

  const toggles = page.locator('[data-testid^="package-compare-toggle-"]');
  const count = await toggles.count();
  test.skip(count < 3, 'need at least 3 packages to exercise three Ziyarat states');

  await toggles.nth(0).check();
  await toggles.nth(1).check();
  await toggles.nth(2).check();

  const compareButton = page.locator('[data-testid="search-compare-button"]');
  await expect(compareButton).toBeEnabled();
  await compareButton.click();

  const comparison = page.locator('[data-testid="comparison-table"]');
  await expect(comparison).toBeVisible();

  // Ziyarat sits in the "What's included" group. Every cell must render one of
  // the three valid states — never blank.
  const ziyaratRow = comparison.locator('tr', { has: page.locator('th', { hasText: /^Ziyarat$/ }) });
  await expect(ziyaratRow).toBeVisible();
  const cells = ziyaratRow.locator('td');
  await expect(cells).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await expect(cells.nth(i)).toHaveText(/^(Yes|No|Not provided)$/);
  }

  // Same row renders at 390px (responsive fit-to-width table, no separate layout).
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(ziyaratRow).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await expect(cells.nth(i)).toHaveText(/^(Yes|No|Not provided)$/);
  }
});
