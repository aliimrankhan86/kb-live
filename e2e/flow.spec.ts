import { test, expect } from '@playwright/test';
import { setTestUser } from './helpers/auth';

test.beforeEach(async ({ page }) => {
  // Operator auth needed for /operator/dashboard — public routes ignore this cookie
  await setTestUser(page, 'operator');
});

test('End-to-end Quote -> Offer -> Compare Flow', async ({ page }) => {
  // 1. Submit Quote Request
  await page.goto('/quote');
  
  // Step 1: Type/Season
  // Use getByRole('button') to avoid matching the header nav "Umrah" link
  await page.getByRole('button', { name: /^Umrah$/i }).click();
  // Wait for React state update (type → season section re-renders)
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Flexible Dates/i }).click();
  await page.click('text=Next Step');
  
  // Step 2: Location
  await page.fill('input[placeholder="e.g. London, Manchester"]', 'London');
  await page.click('text=Next Step');
  
  // Step 3: Stay
  await page.fill('input[type="number"] >> nth=0', '5'); // Makkah
  await page.fill('input[type="number"] >> nth=1', '5'); // Madinah
  await page.click('text=4 Stars');
  await page.click('text=Medium');
  await page.click('text=Next Step');
  
  // Step 4: Budget/Group
  // Defaults are fine
  await page.click('text=Next Step');
  
  // Step 5: Review
  await Promise.all([
    page.waitForURL('**/requests/**'),
    page.click('text=Submit Request'),
  ]);
  await page.waitForLoadState('domcontentloaded');
  
  // Check redirect
  await expect(page).toHaveURL(/\/requests\/[\w-]+/);
  const requestUrl = page.url();
  const requestId = requestUrl.split('/').pop();
  
  // Verify status Open
  await expect(page.locator('text=open')).toBeVisible();
  
  // 2. Operator Leads — navigate to leads page where reply overlay lives
  await page.goto('/operator/leads');
  await page.waitForLoadState('domcontentloaded');

  // Lead card must be visible (quote request was just created)
  await expect(page.locator('[data-testid^="lead-card-"]').first()).toBeVisible({ timeout: 10000 });

  // Click "View & Respond" button to open reply overlay
  await page.locator('[data-testid^="lead-respond-"]').first().click();

  // Overlay opens
  await expect(page.locator('text=Reply to Quote Request')).toBeVisible();

  // Fill Offer
  await page.fill('input[type="number"] >> nth=0', '1500'); // Price
  // Submit
  await page.click('text=Send Offer');

  // Overlay closes
  await expect(page.locator('text=Reply to Quote Request')).not.toBeVisible();
  
  // 3. Customer View
  await page.goto(requestUrl);
  await page.waitForLoadState('domcontentloaded');
  
  // Verify Offer
  await expect(page.locator('text=£1,500')).toBeVisible();
  await expect(page.locator('text=Al-Hidayah Travel')).toBeVisible(); // Mock operator
  
  // 4. Comparison
  // Create second offer to enable comparison
  await page.goto('/operator/leads');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('[data-testid^="lead-respond-"]').first().click();
  await expect(page.locator('text=Reply to Quote Request')).toBeVisible();
  await page.fill('input[type="number"] >> nth=0', '2000');
  await page.click('text=Send Offer');
  await expect(page.locator('text=Reply to Quote Request')).not.toBeVisible();
  
  // Back to customer
  await page.goto(requestUrl);
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for 2 offers to be visible
  await expect(page.locator('[data-testid="offer-card"]')).toHaveCount(2);
  
  // Select both offers using stable selectors
  const checkboxes = page.locator('[data-testid="offer-compare-checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  
  // Click Compare button
  await page.click('text=Compare (2)');
  
  // Verify Table
  await expect(page.locator('text=Compare Offers')).toBeVisible();
  const comparisonTable = page.locator('[data-testid="comparison-table"]');
  const priceCell = comparisonTable.locator('tbody tr').first().locator('td').nth(1);
  await expect(priceCell).toBeVisible();
  await expect(priceCell).not.toHaveText('');
  await expect(priceCell).toContainText(/[£$€]|AED|USD|GBP|EUR|CAD/);

  // 5. Payment handoff requires evidence or explicit skip acknowledgement.
  await page.keyboard.press('Escape');
  await expect(page.locator('text=Compare Offers')).not.toBeVisible();

  await page.getByRole('button', { name: 'Proceed direct' }).first().click();
  await expect(page.getByText('Pay operator direct')).toBeVisible();
  await expect(page.getByTestId('payment-evidence-upload')).toHaveAttribute('accept', /image\/\*,application\/pdf/);

  await page.getByTestId('booking-intent-submit').click();
  await expect(page.getByRole('alert')).toContainText('Upload payment evidence or choose Skip proof');

  await page.getByTestId('payment-proof-skip-checkbox').check();
  await page.getByTestId('booking-intent-submit').click();
  await expect(page.getByRole('alert')).toContainText('Confirm the skip-proof acknowledgement');

  await page.getByTestId('payment-proof-acknowledgement-checkbox').check();
  await page.getByTestId('booking-intent-submit').click();
  await expect(page.getByTestId('booking-intent-reference-code').first()).toContainText(/^KT-/);
});
