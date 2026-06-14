import { test, expect } from '@playwright/test';
import { setTestUser } from './helpers/auth';

test('End-to-end Quote -> Offer -> Compare Flow', async ({ page }) => {
  // 1. Submit Quote Request as customer
  await setTestUser(page, 'customer');
  await page.goto('/quote');

  // Step 1: Type (Umrah) + Season (Flexible Dates)
  await page.getByRole('button', { name: /^Umrah$/i }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Flexible Dates/i }).click();
  await page.click('text=Next Step');

  // Step 2: Departure city (chips) → airport (chips)
  await page.getByRole('button', { name: 'London' }).click();
  await expect(page.getByRole('button', { name: /LHR/i })).toBeVisible({ timeout: 3000 });
  await page.getByRole('button', { name: /LHR/i }).click();
  await page.click('text=Next Step');

  // Step 3: Duration + Hotel + Distance
  await page.fill('input[type="number"] >> nth=0', '5'); // Makkah
  await page.fill('input[type="number"] >> nth=1', '5'); // Madinah
  await page.getByRole('button', { name: '4 Stars' }).click();
  await page.getByRole('button', { name: 'Medium' }).click();
  await page.click('text=Next Step');

  // Step 4: Budget/Group — defaults are fine
  await page.click('text=Next Step');

  // Step 5: Review & Submit
  await Promise.all([
    page.waitForURL('**/requests/**'),
    page.click('text=Submit Request'),
  ]);
  await page.waitForLoadState('domcontentloaded');

  await expect(page).toHaveURL(/\/requests\/[\w-]+/);
  const requestUrl = page.url();

  // Verify status Open
  await expect(page.locator('text=open')).toBeVisible();

  // 2. Switch to operator — view leads + reply
  await setTestUser(page, 'operator');
  await page.goto('/operator/leads');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('[data-testid^="lead-card-"]').first()).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid^="lead-respond-"]').first().click();
  await expect(page.locator('text=Reply to Quote Request')).toBeVisible();
  await page.fill('input[type="number"] >> nth=0', '1500');
  await page.click('text=Send Offer');
  await expect(page.locator('text=Reply to Quote Request')).not.toBeVisible();

  // 3. Back to customer — verify offer shows
  await setTestUser(page, 'customer');
  await page.goto(requestUrl);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('text=£1,500')).toBeVisible();
  await expect(page.locator('text=Al-Hidayah Travel')).toBeVisible();

  // 4. Create second offer for comparison
  await setTestUser(page, 'operator');
  await page.goto('/operator/leads');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('[data-testid^="lead-respond-"]').first().click();
  await expect(page.locator('text=Reply to Quote Request')).toBeVisible();
  await page.fill('input[type="number"] >> nth=0', '2000');
  await page.click('text=Send Offer');
  await expect(page.locator('text=Reply to Quote Request')).not.toBeVisible();

  // 5. Customer: compare both offers
  await setTestUser(page, 'customer');
  await page.goto(requestUrl);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('[data-testid="offer-card"]')).toHaveCount(2);

  const checkboxes = page.locator('[data-testid="offer-compare-checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.click('text=Compare (2)');
  await expect(page.locator('text=Compare Offers')).toBeVisible();

  // Prices are in the thead — just verify the table rendered with currency
  const comparisonTable = page.locator('[data-testid="comparison-table"]');
  await expect(comparisonTable).toBeVisible();
  await expect(comparisonTable).toContainText(/[£$€]/);

  // 6. Payment handoff
  await page.keyboard.press('Escape');
  await expect(page.locator('text=Compare Offers')).not.toBeVisible();

  await page.getByRole('button', { name: 'Proceed direct' }).first().click();
  await expect(page.getByText('Pay operator direct')).toBeVisible();
  await expect(page.getByTestId('payment-evidence-upload')).toHaveAttribute('accept', /application\/pdf/);

  await page.getByTestId('booking-intent-submit').click();
  await expect(page.getByRole('alert')).toContainText('Upload payment evidence or choose Skip proof');

  await page.getByTestId('payment-proof-skip-checkbox').check();
  await page.getByTestId('booking-intent-submit').click();
  await expect(page.getByRole('alert')).toContainText('Confirm the skip-proof acknowledgement');

  await page.getByTestId('payment-proof-acknowledgement-checkbox').check();
  await page.getByTestId('booking-intent-submit').click();
  await expect(page.getByTestId('booking-intent-reference-code').first()).toContainText(/^KT-/);
});
