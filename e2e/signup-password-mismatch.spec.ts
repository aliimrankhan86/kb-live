import { test, expect } from '@playwright/test';

test.describe('Signup page password mismatch', () => {
  test('shows red alert banner when passwords do not match', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible();

    // Fill form with mismatched passwords
    const nameInput = page.locator('[data-testid="signup-name"]');
    const emailInput = page.locator('[data-testid="signup-email"]');
    const passwordInput = page.locator('[data-testid="signup-password"]');
    const confirmPasswordInput = page.locator('[data-testid="signup-confirm-password"]');

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('TestPass123!');
    await confirmPasswordInput.fill('Different456!');
    await page.locator('[data-testid="signup-terms-checkbox"]').check();

    await expect(nameInput).toHaveValue('Test User');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('TestPass123!');
    await expect(confirmPasswordInput).toHaveValue('Different456!');

    // Submit
    const submitButton = page.locator('[data-testid="signup-submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

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
