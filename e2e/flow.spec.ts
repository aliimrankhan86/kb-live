import { test, expect } from '@playwright/test';

test('End-to-end Quote -> Offer -> Compare Flow', async ({ page }) => {
  // 1. Submit Quote Request
  await page.goto('/quote');
  
  // Step 1: Type/Season
  await page.click('text=Umrah');
  await page.click('text=Flexible Dates');
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
  
  // 2. Operator Dashboard
  await page.goto('/operator/dashboard');
  await page.waitForLoadState('domcontentloaded');
  
  // Find request (it might take a moment to poll, but initial load should have it)
  // Dashboard shows Type, Season, Departure City
  await expect(page.locator('text=London')).toBeVisible({ timeout: 10000 });
  
  await page.click('text=London');
  
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
  await expect(page.locator('text=1500')).toBeVisible();
  await expect(page.locator('text=Al-Hidayah Travel')).toBeVisible(); // Mock operator
  
  // 4. Comparison
  // Create second offer to enable comparison
  await page.goto('/operator/dashboard');
  await page.waitForLoadState('domcontentloaded');
  await page.click('text=London');
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
});
