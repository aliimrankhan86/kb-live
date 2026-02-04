import { test, expect } from '@playwright/test';

test('Public catalogue flow: browse, detail, operator, compare', async ({ page }) => {
  await page.goto('/packages');
  await expect(page.locator('[data-testid="packages-page"]')).toBeVisible();
  const packageCards = page.locator('[data-testid^="package-card-"]');
  await expect(packageCards.first()).toBeVisible();
  const compareButton = page.locator('[data-testid="packages-compare-button"]');
  await expect(compareButton).toBeVisible();
  await expect(compareButton).toBeDisabled();
  const compareCheckboxes = page.locator('[data-testid^="package-compare-checkbox-"]');
  const packageCount = await packageCards.count();
  if (packageCount >= 1) {
    await compareCheckboxes.nth(0).check();
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

  const firstPackageLink = page.locator('[data-testid^="package-link-"]').first();
  await firstPackageLink.click();

  await expect(page.locator('[data-testid="package-detail-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="package-cta-request-quote"]')).toBeVisible();
  await expect(page.locator('[data-testid="package-title"]')).toBeVisible();

  await page.goto('/operators/al-hidayah-travel');
  await expect(page.locator('[data-testid="operator-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="operator-name"]')).toBeVisible();
  await expect(page.locator('[data-testid^="operator-package-link-"]')).toBeVisible();

  if (packageCount >= 2) {
    await page.goto('/packages');
    await expect(page.locator('[data-testid="packages-page"]')).toBeVisible();
  }
});
