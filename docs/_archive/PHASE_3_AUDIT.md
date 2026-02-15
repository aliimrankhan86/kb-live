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

### Phase 3B-1: Region detection + formatting foundations (2026-02-04)
- Scope: Region detection, currency + distance formatting helpers, wired into packages + comparison; stabilise flow test price assertion.
- Files touched: lib/i18n/region.ts, lib/i18n/format.ts, components/packages/PackagesBrowse.tsx, components/packages/PackageDetail.tsx, lib/comparison.ts, tests/comparison.test.ts, e2e/flow.spec.ts
- Commands:
  - npm run test → PASS (17 tests)
  - npx playwright test e2e/flow.spec.ts → PASS (Chromium, Firefox, WebKit)
- Result: PASS

### UX Option A: Search packages wiring (2026-02-04)
- Scope: Wire /search/packages (Option A UI) with real data, shortlist persistence, compare modal; fix console errors; ensure 2+ packages for compare.
- Flow: /umrah → /search/packages with query params; filter by type/season/budget; shortlist in localStorage (kb_shortlist_packages); compare (max 3) opens Dialog with ComparisonTable.
- Files touched: app/search/packages/page.tsx, components/search/PackageList.tsx, PackageCard.tsx, components/graphics/Logo.tsx, components/layout/Header.tsx, lib/api/mock-db.ts, docs/NOW.md, docs/CURSOR_CONTEXT.md, docs/00_AGENT_HANDOVER.md, QA.md, docs/02_REPO_MAP.md, docs/PHASE_3_AUDIT.md.
- Commands: npm run test, npx playwright test e2e/catalogue.spec.ts (and e2e/flow.spec.ts if touched).
- Result: Wiring complete; seed versioning ensures existing users get new Umrah packages (pkg4, pkg5) in 500–1000 range.
