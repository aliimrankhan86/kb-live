import { defineConfig, devices } from '@playwright/test'

// Real-DB browser suite: local Supabase stack + seeded LOCAL TEST DATA.
// Run `npm run e2e:local-db` (prepares the stack, then runs). Never point
// .env.local at anything but 127.0.0.1: the seed and specs refuse otherwise.
export default defineConfig({
  testDir: '.',
  workers: 1, // specs share seeded rows and the sign-in rate limit (5 / 15 min / IP)
  retries: 0,
  reporter: [['line']],
  outputDir: '../../test-results/local-db/artifacts',
  use: { baseURL: 'http://127.0.0.1:3100', headless: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // A normal production build (no E2E_TESTING bypass) against the real local DB.
    command: 'npm run build && npx next start -H 127.0.0.1 -p 3100',
    cwd: '../..',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 300_000,
    // Test-only value so the specs can call the cron routes. Not a real secret.
    env: { CRON_SECRET: 'local-db-test-only' },
  },
})
