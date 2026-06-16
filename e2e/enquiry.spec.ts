import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './helpers/cookies';

// Task 2 — canonical pilgrim enquiry journey: browse → package → Enquire →
// short form → confirmation with reference code + payment posture. Anonymous.
test('Pilgrim enquiry journey: package → enquire → confirmation', async ({ page }) => {
  await dismissCookieBanner(page);

  await page.goto('/packages');
  const firstPackageLink = page.locator('[data-testid^="package-view-"]').first();
  await expect(firstPackageLink).toBeVisible();
  await Promise.all([page.waitForURL('**/packages/**'), firstPackageLink.click()]);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('[data-testid="package-detail-page"]')).toBeVisible();

  // Enquire entry point (always live).
  const enquireCta = page.locator('[data-testid="package-cta-enquire"]');
  await expect(enquireCta).toBeVisible();
  await Promise.all([page.waitForURL('**/enquire'), enquireCta.click()]);
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('[data-testid="enquiry-form-page"]')).toBeVisible();
  // The form shows the package read-only and never re-asks it.
  await expect(page.locator('[data-testid="enquiry-package-summary"]')).toBeVisible();

  await page.locator('[data-testid="enquiry-name"]').fill('Aisha Khan');

  // Task 3 UX fix: name filled, no contact yet → hint shows; gone once a contact added.
  await expect(page.locator('[data-testid="enquiry-contact-hint"]')).toBeVisible();
  await expect(page.locator('[data-testid="enquiry-contact-hint"]')).toContainText('Add an email or phone to send.');
  await page.locator('[data-testid="enquiry-email"]').fill('aisha@example.com');
  await expect(page.locator('[data-testid="enquiry-contact-hint"]')).toHaveCount(0);

  // Task 3: marketing opt-in unticked by default; submit succeeds WITHOUT ticking it.
  await expect(page.locator('[data-testid="enquiry-marketing-consent"]')).not.toBeChecked();
  await page.locator('[data-testid="enquiry-submit"]').click();

  // Confirmation: reference code + payment-posture copy.
  await expect(page.locator('[data-testid="enquiry-confirmation"]')).toBeVisible();
  await expect(page.locator('[data-testid="enquiry-reference-code"]')).toContainText(/KT-/);
  await expect(page.locator('[data-testid="enquiry-payment-posture"]')).toContainText(
    'You pay the operator directly. PilgrimCompare does not receive or hold your payment.'
  );
  await expect(page.locator('[data-testid="enquiry-payment-posture"]')).toContainText(
    'a tracking code, not a payment receipt'
  );
});

// Task 3: the enquiry also submits WITH the marketing opt-in ticked.
test('Pilgrim enquiry journey: submits with marketing opt-in ticked', async ({ page }) => {
  await dismissCookieBanner(page);

  await page.goto('/packages');
  const firstPackageLink = page.locator('[data-testid^="package-view-"]').first();
  await expect(firstPackageLink).toBeVisible();
  await Promise.all([page.waitForURL('**/packages/**'), firstPackageLink.click()]);
  await page.waitForLoadState('domcontentloaded');

  const enquireCta = page.locator('[data-testid="package-cta-enquire"]');
  await expect(enquireCta).toBeVisible();
  await Promise.all([page.waitForURL('**/enquire'), enquireCta.click()]);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('[data-testid="enquiry-form-page"]')).toBeVisible();

  await page.locator('[data-testid="enquiry-name"]').fill('Yusuf Ali');
  await page.locator('[data-testid="enquiry-email"]').fill('yusuf@example.com');

  const optIn = page.locator('[data-testid="enquiry-marketing-consent"]');
  await expect(optIn).not.toBeChecked();
  await optIn.check();
  await expect(optIn).toBeChecked();

  await page.locator('[data-testid="enquiry-submit"]').click();
  await expect(page.locator('[data-testid="enquiry-confirmation"]')).toBeVisible();
  await expect(page.locator('[data-testid="enquiry-reference-code"]')).toContainText(/KT-/);
});
