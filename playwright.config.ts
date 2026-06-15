import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    // Run `npx playwright test --headed` to see the browser window
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run build && npx next start -H 127.0.0.1 -p 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // E2E_TESTING is set during BOTH npm run build AND next start.
    // next.config.ts forwards it into the Edge Runtime so middleware can read it.
    // FEATURE_BOOKING_FLOW / FEATURE_RFQ_QUOTE are PARKED (default OFF in the live
    // pilgrim journey) but forced ON here so the existing end-to-end specs still
    // exercise the parked code and prove it is intact and reversible.
    // See PARKED_FEATURES.md. Flag-OFF behaviour is covered by tests/feature-flags.test.tsx.
    env: { E2E_TESTING: '1', FEATURE_BOOKING_FLOW: 'true', FEATURE_RFQ_QUOTE: 'true' },
  },
})
