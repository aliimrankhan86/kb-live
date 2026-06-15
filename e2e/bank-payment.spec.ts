import { test, expect } from '@playwright/test';
import { setTestUser, resetMockDB } from './helpers/auth';
import { dismissCookieBanner } from './helpers/cookies';

test.describe.configure({ mode: 'serial' });

test.describe('Bank onboarding and payment flows', () => {
  test.beforeEach(async ({ page }) => {
    // operatorAdmin: id=op1 (has seeded payment details) + role=admin (accesses /admin/bank-changes)
    // Admin role passes both /operator/* and /admin/* route guards per middleware ROLE_PROTECTED map
    await setTestUser(page, 'operatorAdmin');
    await dismissCookieBanner(page);
  });

  test('operator creates change, admin approves, operator sees cooling', async ({ page }) => {
    // Clear localStorage so seeded data is fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // === PART 1: Operator creates change request ===
    await page.goto('/operator/settings/payment-details');
    await page.waitForLoadState('domcontentloaded');

    // Active state
    await expect(page.getByText('Active payment details')).toBeVisible();
    await expect(page.getByTestId('request-change-btn')).toBeVisible();
    await expect(page.getByTestId('operator-audit-log')).toBeVisible();

    // Submit change
    await page.getByTestId('request-change-btn').click();
    await expect(page.getByTestId('bank-details-form')).toBeVisible();
    await page.getByTestId('account-holder-name-input').fill('Changed Holder Ltd');
    await page.getByTestId('sort-code-input').fill('11-22-33');
    await page.getByTestId('account-number-input').fill('11112222');
    await page.getByTestId('bank-name-input').fill('Changed Bank Name');
    await page.getByTestId('submit-bank-details').click();

    // OTP
    await expect(page.getByTestId('otp-input')).toBeVisible();
    await page.getByTestId('otp-input').fill('1234');
    await page.getByTestId('confirm-otp-btn').click();

    // Pending review state
    await expect(page.getByText('Under review', { exact: true })).toBeVisible();
    await expect(page.getByTestId('cancel-request-btn')).toBeVisible();
    await expect(page.getByTestId('audit-log-view')).toBeVisible();

    // === PART 2: Admin reviews and approves ===
    await page.goto('/admin/bank-changes');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('review-link').first()).toBeVisible();
    await page.getByTestId('review-link').first().click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('bank-change-review-card')).toBeVisible();
    await expect(page.getByTestId('change-request-before-after')).toBeVisible();
    await expect(page.getByTestId('field-changed').first()).toBeVisible();
    await expect(page.getByTestId('change-request-before').first()).toBeVisible();
    await expect(page.getByTestId('change-request-after').first()).toBeVisible();
    await expect(page.getByTestId('audit-log-view')).toBeVisible();

    // Approve
    await page.getByTestId('approve-btn').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/eligible for activation/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirm approve/i }).click();

    // Back to empty queue
    await expect(page).toHaveURL('/admin/bank-changes');
    await expect(page.getByText('No pending bank change requests')).toBeVisible();

    // === PART 3: Operator sees cooling state ===
    await page.goto('/operator/settings/payment-details');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('Approved — cooling period', { exact: true })).toBeVisible();
    await expect(page.getByText(/take effect on/i)).toBeVisible();
    await expect(page.getByText('Active until change takes effect', { exact: true })).toBeVisible();
  });

  test('payment instructions visible after booking intent creation', async ({ page }) => {
    test.setTimeout(60000);
    // Reset server MockDB so bank change state from previous test is cleared
    await resetMockDB(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Create quote request as customer (API requires customer role)
    await setTestUser(page, 'customer');
    await page.goto('/quote');
    await page.getByRole('button', { name: /^Umrah$/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Flexible Dates/i }).click();
    await page.click('text=Next Step');
    // Step 2: city chip → airport chip
    await page.getByRole('button', { name: 'London' }).click();
    await expect(page.getByRole('button', { name: /LHR/i })).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: /LHR/i }).click();
    await page.click('text=Next Step');
    await page.fill('input[type="number"] >> nth=0', '5');
    await page.fill('input[type="number"] >> nth=1', '5');
    await page.getByRole('button', { name: '4 Stars' }).click();
    await page.getByRole('button', { name: 'Medium' }).click();
    await page.click('text=Next Step');
    await page.click('text=Next Step');
    await Promise.all([
      page.waitForURL('**/requests/**'),
      page.click('text=Submit Request'),
    ]);

    const requestUrl = page.url();

    // Operator submits offer — use operator role (leads API requires operator, not admin)
    await setTestUser(page, 'operator');
    await page.goto('/operator/leads');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid^="lead-card-"]').first()).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid^="lead-respond-"]').first().click();
    await expect(page.getByText('Reply to Quote Request')).toBeVisible();
    await page.fill('input[type="number"] >> nth=0', '1500');
    await page.click('text=Send Offer');
    await expect(page.getByText('Reply to Quote Request')).not.toBeVisible();

    // Customer creates booking intent — switch back to customer role
    await setTestUser(page, 'customer');
    await page.goto(requestUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Wait for offers to load
    await expect(page.getByText('£1,500')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Proceed direct' }).first().click();

    // Dialog opens with booking form
    await expect(page.getByTestId('payment-proof-skip-checkbox')).toBeVisible();
    await page.getByTestId('payment-proof-skip-checkbox').check();
    await expect(page.getByTestId('payment-proof-acknowledgement-checkbox')).toBeVisible();
    await page.getByTestId('payment-proof-acknowledgement-checkbox').check();
    await page.getByTestId('booking-intent-submit').click();

    // Reference code issued
    await expect(page.getByTestId('booking-intent-reference-code').first()).toContainText(/^KT-/);

    // Payment instructions visible with required data-testids
    await expect(page.getByTestId('payment-instructions')).toBeVisible();
    await expect(page.getByTestId('bank-account-holder')).toBeVisible();
    await expect(page.getByTestId('bank-sort-code')).toBeVisible();
    await expect(page.getByTestId('bank-account-number')).toBeVisible();
    await expect(page.getByTestId('payment-disclaimer')).toContainText('PilgrimCompare does not collect');

    // No recently-updated warning expected for op1 seeded details
    const warning = page.getByTestId('recently-updated-warning');
    await expect(warning).not.toBeVisible();
  });

  test('admin rejects bank change with required reason', async ({ page }) => {
    // Reset server MockDB so bank change state from previous tests is cleared
    await resetMockDB(page);
    // Create another change request
    await page.goto('/operator/settings/payment-details');
    await page.waitForLoadState('domcontentloaded');

    const requestChangeBtn = page.getByTestId('request-change-btn');
    await expect(requestChangeBtn).toBeVisible();
    await requestChangeBtn.click();

    await page.getByTestId('account-holder-name-input').fill('Reject Test Ltd');
    await page.getByTestId('sort-code-input').fill('44-55-66');
    await page.getByTestId('account-number-input').fill('44445555');
    await page.getByTestId('bank-name-input').fill('Reject Bank');
    await page.getByTestId('submit-bank-details').click();
    await page.getByTestId('otp-input').fill('1234');
    await page.getByTestId('confirm-otp-btn').click();

    // Pending state
    await expect(page.getByText('Under review', { exact: true })).toBeVisible();

    // Admin rejects
    await page.goto('/admin/bank-changes');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('review-link').first().click();
    await page.waitForLoadState('domcontentloaded');

    await page.getByTestId('reject-btn').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Try submit without reason — should stay open or show error
    await page.getByRole('button', { name: /Confirm reject/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill reason and confirm
    await page.getByTestId('review-reason').fill('Insufficient verification documents provided');
    await page.getByRole('button', { name: /Confirm reject/i }).click();

    // Back to queue
    await expect(page).toHaveURL('/admin/bank-changes');

    // Operator sees rejected state
    await page.goto('/operator/settings/payment-details');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Previous change request rejected')).toBeVisible();
  });

  test('operator can cancel pending change request', async ({ page }) => {
    // Reset server MockDB so bank change state from previous tests is cleared
    await resetMockDB(page);
    // Create a change request
    await page.goto('/operator/settings/payment-details');
    await page.waitForLoadState('domcontentloaded');

    const requestChangeBtn = page.getByTestId('request-change-btn');
    await expect(requestChangeBtn).toBeVisible();
    await requestChangeBtn.click();

    await page.getByTestId('account-holder-name-input').fill('Cancel Test Ltd');
    await page.getByTestId('sort-code-input').fill('77-88-99');
    await page.getByTestId('account-number-input').fill('77778888');
    await page.getByTestId('bank-name-input').fill('Cancel Bank');
    await page.getByTestId('submit-bank-details').click();
    await page.getByTestId('otp-input').fill('1234');
    await page.getByTestId('confirm-otp-btn').click();

    // Cancel it
    await expect(page.getByTestId('cancel-request-btn')).toBeVisible();
    await page.getByTestId('cancel-request-btn').click();

    // Back to active state
    await expect(page.getByText('Active payment details')).toBeVisible();
    await expect(page.getByTestId('request-change-btn')).toBeVisible();
  });
});