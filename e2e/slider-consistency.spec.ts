import { test, expect } from '@playwright/test';

test.describe('RangeSlider consistency across app', () => {
  test('Umrah page budget slider uses shared RangeSlider', async ({ page }) => {
    await page.goto('/umrah');

    // Scroll to find the budget slider (it's in the form, step 4)
    const budgetSlider = page.locator('[data-testid="budget-min-slider"]').first();
    await expect(budgetSlider).toBeVisible({ timeout: 5000 });

    // Screenshot the slider area
    await budgetSlider.screenshot({ path: 'test-results/slider-umrah-budget.png' });
  });

  test('Filter overlay sliders all use shared RangeSlider', async ({ page }) => {
    await page.goto('/search/packages?type=umrah');

    // Open filter overlay
    await page.click('[data-testid="filter-button"]');

    const overlay = page.locator('[data-testid="filter-overlay"]');
    await expect(overlay).toBeVisible({ timeout: 5000 });

    // Screenshot Budget slider
    const budgetSlider = overlay.locator('[data-testid="budget-min-slider"]').first();
    await expect(budgetSlider).toBeVisible();
    await budgetSlider.screenshot({ path: 'test-results/slider-filter-budget.png' });

    // Screenshot Distance slider
    const distanceSlider = overlay.locator('[data-testid="distance-min-slider"]').first();
    await expect(distanceSlider).toBeVisible();
    await distanceSlider.screenshot({ path: 'test-results/slider-filter-distance.png' });
  });
});
