import { test, expect } from '@playwright/test';

/**
 * E2E tests for the operator package management flow:
 * - Operator dashboard access
 * - Package creation via wizard (Steps 1–8)
 * - Package appears in list after creation
 *
 * These tests run against the dev server (baseURL: http://127.0.0.1:3001).
 * Auth is mocked via the MockDB dev pattern; tests assume operator session exists.
 */

test.describe('Operator packages page', () => {
  test('loads packages page', async ({ page }) => {
    await page.goto('/operator/packages');
    await page.waitForLoadState('domcontentloaded');
    // Either shows the empty state or a list
    const emptyState = page.getByTestId('operator-packages-empty');
    const list = page.getByTestId('operator-packages-list');
    // One of them must be present
    await expect(list.or(emptyState)).toBeVisible({ timeout: 8000 });
  });

  test('clicking Create package opens wizard', async ({ page }) => {
    await page.goto('/operator/packages');
    await page.waitForLoadState('domcontentloaded');
    // Click any "Create package" button (empty state or header button)
    const createBtn = page.getByRole('button', { name: /create package/i }).first();
    await createBtn.click();
    await expect(page.getByTestId('package-wizard')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('wizard-title')).toBeVisible();
  });
});

test.describe('PackageWizard — step navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/operator/packages');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /create package/i }).first().click();
    await page.getByTestId('package-wizard').waitFor({ state: 'visible' });
  });

  test('Step 1: shows validation error for empty title', async ({ page }) => {
    await page.getByTestId('wizard-next-btn').click();
    await expect(page.getByRole('alert')).toBeVisible();
    // Still on step 1
    await expect(page.getByTestId('wizard-title')).toBeVisible();
  });

  test('Step 1 → 2: advances with valid title', async ({ page }) => {
    await page.getByTestId('wizard-title').fill('Valid Package Title');
    await page.getByTestId('wizard-next-btn').click();
    await expect(page.getByTestId('wizard-price')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Step 2 of 8')).toBeVisible();
  });

  test('Step 2: validates price > 0', async ({ page }) => {
    // Advance to step 2
    await page.getByTestId('wizard-title').fill('Valid Package Title');
    await page.getByTestId('wizard-next-btn').click();
    await page.getByTestId('wizard-price').waitFor({ state: 'visible' });

    // Try to advance with no price
    await page.getByTestId('wizard-next-btn').click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('Step 2 → 3: advances with valid price', async ({ page }) => {
    await page.getByTestId('wizard-title').fill('Valid Package Title');
    await page.getByTestId('wizard-next-btn').click();
    await page.getByTestId('wizard-price').waitFor({ state: 'visible' });

    await page.getByTestId('wizard-price').fill('1499');
    await page.getByTestId('wizard-next-btn').click();
    await expect(page.getByTestId('makkah-nights')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Step 3 of 8')).toBeVisible();
  });

  test('Back button returns to previous step', async ({ page }) => {
    await page.getByTestId('wizard-title').fill('Valid Package Title');
    await page.getByTestId('wizard-next-btn').click();
    await page.getByTestId('wizard-price').waitFor({ state: 'visible' });
    await page.getByTestId('wizard-back-btn').click();
    await expect(page.getByTestId('wizard-title')).toBeVisible({ timeout: 3000 });
  });

  test('Cancel button returns to package list', async ({ page }) => {
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByTestId('operator-packages-list')).toBeVisible({ timeout: 3000 });
  });

  test('Step breadcrumbs are visible', async ({ page }) => {
    await expect(page.getByTestId('wizard-step-nav-0')).toBeVisible();
    await expect(page.getByTestId('wizard-step-nav-7')).toBeVisible();
  });
});

test.describe('PackageWizard — full flow to review', () => {
  test('walks through all 8 steps to review screen', async ({ page }) => {
    await page.goto('/operator/packages');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /create package/i }).first().click();
    await page.getByTestId('package-wizard').waitFor({ state: 'visible' });

    // Step 1 — Basics
    await page.getByTestId('wizard-title').fill('Premium Umrah Package Ramadan 2027');
    await page.getByTestId('wizard-next-btn').click();

    // Step 2 — Pricing
    await page.getByTestId('wizard-price').waitFor({ state: 'visible' });
    await page.getByTestId('wizard-price').fill('1499');
    await page.getByTestId('wizard-next-btn').click();

    // Step 3 — Hotels
    await page.getByTestId('makkah-nights').waitFor({ state: 'visible' });
    await page.getByTestId('makkah-nights').fill('7');
    await page.getByTestId('madinah-nights').fill('4');
    await page.getByTestId('wizard-next-btn').click();

    // Step 4 — Flights (optional, skip)
    await page.getByTestId('wizard-flights-toggle').waitFor({ state: 'visible' });
    await page.getByTestId('wizard-next-btn').click();

    // Step 5 — Inclusions (defaults have rooms selected)
    await page.getByTestId('wizard-inclusion-visa').waitFor({ state: 'visible' });
    await page.getByTestId('wizard-next-btn').click();

    // Step 6 — Policies (optional for draft)
    await page.getByTestId('wizard-cancellation-policy').waitFor({ state: 'visible' });
    await page.getByTestId('wizard-next-btn').click();

    // Step 7 — Marketing (optional)
    await page.getByTestId('wizard-highlight-0').waitFor({ state: 'visible' });
    await page.getByTestId('wizard-next-btn').click();

    // Step 8 — Review
    await page.getByTestId('wizard-draft-btn').waitFor({ state: 'visible' });
    await expect(page.locator('text=Step 8 of 8')).toBeVisible();
    await expect(page.getByTestId('wizard-draft-btn')).toBeEnabled();
    // Publish button disabled — no cancellation policy yet
    await expect(page.getByTestId('wizard-publish-btn')).toBeDisabled();
  });
});
