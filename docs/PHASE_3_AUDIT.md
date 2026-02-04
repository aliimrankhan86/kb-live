# PHASE_3_AUDIT

## Phase 3A: Shortlist + Compare UX (2026-02-04)
- Scope: Implement shortlist persistence + filter on `/packages`, make compare CTA always visible, replace compare cap alert with inline message.
- Files touched: components/packages/PackagesBrowse.tsx, e2e/catalogue.spec.ts, tests/packages-browse.test.tsx
- Commands:
  - npm run test → PASS (16 tests)
  - npx playwright test e2e/catalogue.spec.ts → PASS (Chromium, Firefox, WebKit)
- Result: PASS

### Phase 3A follow-up: Shortlist uniqueness guard (2026-02-04)
- Scope: Ensure shortlist persistence de-duplicates IDs when loading/saving and during toggles.
- Files touched: components/packages/PackagesBrowse.tsx, tests/packages-browse.test.tsx
- Commands:
  - npm run test → PASS (17 tests)
  - npx playwright test e2e/catalogue.spec.ts → PASS (Chromium, Firefox, WebKit)
- Result: PASS

### Phase 3A: Seed second published package for compare demo (2026-02-04)
- Reason: Compare requires at least 2 published packages on `/packages`.
- Files touched: lib/api/mock-db.ts
- Commands:
  - npm run test → PASS (17 tests)
  - npx playwright test e2e/flow.spec.ts → FAIL (webkit navigation interrupted at /operator/dashboard)
  - npx playwright test e2e/catalogue.spec.ts → FAIL (strict mode: 2 operator package links; webkit navigation interrupted)
- Result: FAIL (tests)

### Phase 3A: Fix Playwright after adding second seed package (2026-02-04)
- Scope: Stabilize navigation waits and strict-mode locators for multiple package links.
- Files touched: e2e/flow.spec.ts, e2e/catalogue.spec.ts
- Commands:
  - npx playwright test e2e/flow.spec.ts → PASS (Chromium, Firefox, WebKit)
  - npx playwright test e2e/catalogue.spec.ts → PASS (Chromium, Firefox, WebKit)
- Result: PASS
