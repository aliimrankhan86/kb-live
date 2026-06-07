import { test, expect } from '@playwright/test';

test.describe('Signup page password mismatch', () => {
  test('shows red alert banner when passwords do not match', async ({ page }) => {
    await page.goto('/signup');

    // Fill form with mismatched passwords
    await page.fill('[data-testid="signup-name"]', 'Test User');
    await page.fill('[data-testid="signup-email"]', 'test@example.com');
    await page.fill('[data-testid="signup-password"]', 'password123');
    await page.fill('[data-testid="signup-confirm-password"]', 'different456');
    await page.check('[data-testid="signup-terms-checkbox"]');

    // Submit
    await page.click('[data-testid="signup-submit"]');

    // Wait for and verify the error banner
    const banner = page.locator('[data-testid="signup-password-mismatch"]');
    await expect(banner).toBeVisible({ timeout: 3000 });
    await expect(banner).toHaveText('Passwords do not match. Please re-enter your password.');
    await expect(banner).toHaveAttribute('role', 'alert');

    // Verify no API call was made (server error banner absent)
    await expect(page.locator('[data-testid="signup-error"]')).not.toBeVisible();

    // Verify role="alert" in DOM
    const role = await banner.getAttribute('role');
    expect(role).toBe('alert');
  });
});