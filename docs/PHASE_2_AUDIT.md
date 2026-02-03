# Phase 2 Audit (Evidence Log)

## Purpose

This file is the evidence log for Phase 2 work. Every completed micro-task must append one entry here.

## Rules (mandatory)

- One entry per micro-task.
- Include commands run and outcomes.
- Mark PASS only if acceptance criteria are met and required checks pass.
- If a task uncovers follow-ups, create new Kanban items and list them under Follow-ups.

---

## Entry Template (copy this section for each task)

### YYYY-MM-DD - <Task title>

**Goal:**  
<one sentence>

**User story (if applicable):**  
As a <user>, I want <capability> so that <benefit>.

**Acceptance criteria:**

- [ ]
- [ ]
- [ ]

**Result:** PASS / FAIL

**Files changed:**

- <file>
- <file>

**Commands run (with results):**

- `npm run test` →
- `npx playwright test e2e/flow.spec.ts` →
- Any other command →

**Manual smoke steps (if applicable):**

- <step>
- <step>

**Notes / Decisions:**

- <note>

**Risks / Tech debt introduced:**

- <risk>

**Follow-ups created:**

- <follow-up>

---

## 2026-02-02 - Micro-task 0: Gates (initial e2e)

**Goal:**  
Run the required initial Playwright flow test before Phase 2 changes.

**Acceptance criteria:**

- [x] `npx playwright test e2e/flow.spec.ts` runs successfully.

**Result:** FAIL

**Files changed:**

- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npx playwright test e2e/flow.spec.ts` → FAIL (webServer could not start, `listen EPERM: operation not permitted 0.0.0.0:3000`)

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Playwright webServer failed to bind to `0.0.0.0:3000` with EPERM.
- Must adjust webServer host and port policy before continuing with Phase 2 e2e gates.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- Investigate Playwright webServer bind policy or port config for this environment.

---

## 2026-02-02 - Micro-task 0b: Fix Playwright webServer bind

**Goal:**  
Allow Playwright webServer to bind to localhost so e2e can run without EPERM.

**Acceptance criteria:**

- [x] `npx playwright test e2e/flow.spec.ts` runs successfully after config change.

**Result:** PASS

**Files changed:**

- `playwright.config.ts`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npx playwright test e2e/flow.spec.ts` → PASS (localhost bind)

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Playwright webServer switched to `127.0.0.1` with port `3001`.
- `baseURL` and `webServer.url` aligned to `http://127.0.0.1:3001`.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-02 - Micro-task 1a: Public Packages Browse (/packages) (initial)

**Goal:**  
Provide a customer-facing packages browse page with filters, states, and stable test hooks.

**User story (if applicable):**  
As a customer, I want to browse Umrah and Hajj packages with basic filters so I can find the right option quickly.

**Acceptance criteria:**

- [x] `/packages` lists published packages with stable test IDs.
- [x] Filters for pilgrimage type, season, and price sort are available.
- [x] Loading, error, and empty states are present and accessible.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `app/packages/page.tsx`
- `components/packages/PackagesBrowse.tsx`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Implemented client-side filters with a loading state during filter updates.
- Test IDs included:
  - `packages-page`
  - `package-card-{id}`
  - `package-link-{slug}`
  - `packages-filter-type`
  - `packages-empty`

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 1b: Public Packages Browse (/packages) (a11y hardening)

**Goal:**  
Improve accessibility feedback during filter transitions.

**User story (if applicable):**  
As a keyboard or assistive tech user, I want clear loading feedback when filters update so I know the list is changing.

**Acceptance criteria:**

- [x] Packages container exposes busy state during filter transitions.
- [x] Tests remain stable and pass.

**Result:** PASS

**Files changed:**

- `components/packages/PackagesBrowse.tsx`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Added `aria-busy` on the packages container while filters update.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 2: Public Package Detail (/packages/[slug])

**Goal:**  
Create a customer-facing package detail page that loads a published package by slug and renders key fields with disclaimers.

**User story (if applicable):**  
As a customer, I want to review package details and inclusions so I can decide whether to request a quote.

**Acceptance criteria:**

- [x] Page loads a published package by slug and shows key fields.
- [x] Not-found and error states are present with `role="alert"`.
- [x] CTA is present and clearly labelled.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `app/packages/[slug]/page.tsx`
- `components/packages/PackageDetail.tsx`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- Open a known package slug and confirm fields render.
- Open an invalid slug and confirm not-found message renders.

**Notes / Decisions:**

- Included stable test IDs:
  - `package-detail-page`
  - `package-title`
  - `package-price`
  - `package-inclusions`
  - `package-cta-request-quote`
  - `package-not-found`

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 3: Public Operator Profile (/operators/[slug])

**Goal:**  
Create a customer-facing operator profile page that shows operator details and published packages.

**User story (if applicable):**  
As a customer, I want to review an operator profile and their published packages so I can choose a trusted provider.

**Acceptance criteria:**

- [x] Operator profile loads by slug and shows key details.
- [x] Operator packages list shows published packages with required test IDs.
- [x] Not-found and empty states exist with `role="alert"`.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `app/operators/[slug]/page.tsx`
- `components/operators/OperatorProfileDetail.tsx`
- `lib/api/repository.ts`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- Open a known operator slug and confirm operator details and packages render.
- Open an invalid operator slug and confirm not-found message renders.

**Notes / Decisions:**

- Added a read-only `getOperatorBySlug` repository method for public access.
- Status label displayed as user-friendly text.
- Test IDs included:
  - `operator-page`
  - `operator-name`
  - `operator-status`
  - `operator-packages`
  - `operator-package-card-{id}`
  - `operator-package-link-{slug}`
  - `operator-empty`

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 4: Quote Prefill from Package Detail

**Goal:**  
Prefill the quote request wizard from package detail via URL params and then clean the URL.

**User story (if applicable):**  
As a customer, I want the quote form prefilled from a package so I can request a quote faster.

**Acceptance criteria:**

- [x] Package CTA routes to `/quote` with prefill parameters.
- [x] Quote wizard reads params, hydrates draft safely, and cleans URL.
- [x] Malformed or missing params do not break the wizard.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `lib/quote-prefill.ts`
- `components/packages/PackageDetail.tsx`
- `app/quote/page.tsx`
- `components/quote/QuoteRequestWizard.tsx`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- Open a package detail page and click Request Quote.
- Confirm quote wizard fields are prefilled.
- Confirm URL returns to `/quote` after hydration.

**Notes / Decisions:**

- Approach: URL query params with immediate cleanup using `window.history.replaceState`.
- Mapping includes type, season, nights, hotel stars, distance preference, inclusions, and budget (safe defaults when missing).

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 5: Mixed Comparison (Offers + Packages)

**Goal:**  
Allow customers to compare selected packages using the existing comparison UI while keeping offer comparison intact.

**User story (if applicable):**  
As a customer, I want to compare packages side by side so I can choose the best option.

**Acceptance criteria:**

- [x] Packages can be selected for comparison with stable test IDs.
- [x] Comparison table supports package rows.
- [x] Missing values display as `Not provided`.
- [x] Offer comparison continues to work.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `components/request/ComparisonTable.tsx`
- `components/packages/PackagesBrowse.tsx`
- `lib/comparison.ts`
- `tests/comparison.test.ts`
- `tests/phase2.test.ts`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- Select packages on `/packages` and open compare when available.
- Confirm offer compare on `/requests/[id]` still works.

**Notes / Decisions:**

- Added package mapping into the comparison model.
- Standardised missing values to `Not provided`.
- Added test IDs:
  - `package-compare-checkbox-{id}`
  - `packages-compare-button`

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 6: SEO Lite (Robots + Sitemap + Metadata)

**Goal:**  
Add minimal SEO foundations with robots rules, static sitemap, and safe metadata for public routes.

**User story (if applicable):**  
As a customer, I want public pages to be indexable and have meaningful metadata for search results.

**Acceptance criteria:**

- [x] `robots.txt` allows public routes and disallows private areas.
- [x] `sitemap.xml` includes only static public routes.
- [x] Metadata exists for public routes and dynamic metadata is safe.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `app/robots.ts`
- `app/sitemap.ts`
- `app/umrah/page.tsx`
- `app/hajj/page.tsx`
- `app/umrah/ramadan/page.tsx`
- `app/packages/[slug]/page.tsx`
- `app/operators/[slug]/page.tsx`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- Open `/robots.txt` and confirm disallow rules for private routes.
- Open `/sitemap.xml` and confirm it lists public routes only.
- Open `/umrah/ramadan` and confirm the page renders.

**Notes / Decisions:**

- Sitemap is static because phase data is localStorage-backed and not suitable for server indexing.
- Added Ramadan landing placeholder copy to support curated route.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## 2026-02-03 - Micro-task 7: Phase 2 Quality Gates (E2E + Close-out)

**Goal:**  
Add minimal E2E coverage for public catalogue flows and record final evidence.

**User story (if applicable):**  
As a QA reviewer, I want deterministic tests that validate the public catalogue pages.

**Acceptance criteria:**

- [x] Public catalogue E2E covers browse, detail, and operator profile.
- [x] Compare assertions do not false-fail when seed data has one package.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- `e2e/catalogue.spec.ts`
- `docs/PHASE_2_AUDIT.md`

**Commands run (with results):**

- `npx playwright test e2e/catalogue.spec.ts` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Compare section runs only when `packageCount >= 2` to keep tests deterministic with a single published seed package.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

## Phase 2 Close-out (Final Gates)

**Date:** 2026-02-03  
**Branch:** main-v2  
**Verdict:** PASS

### Commands run (evidence)

- `npm run test` → PASS (14 tests)
- `npx playwright test e2e/flow.spec.ts` → PASS
- `npx playwright test e2e/catalogue.spec.ts` → PASS
- `npm run build` → PASS

### Build notes (non-blocking warnings)

ESLint/TypeScript warnings exist but did not fail the build:

- Unused vars:
  - `app/operator/packages/page.tsx`
  - `app/operators/[slug]/page.tsx`
  - `app/packages/[slug]/page.tsx`
  - `components/kanban/KanbanBoard.tsx`
  - `components/operator/AnalyticsDashboard.tsx`
  - `components/request/RequestDetail.tsx`

- Hook dependency warning:
  - `components/request/RequestDetail.tsx` (react-hooks/exhaustive-deps)

### Follow-ups (hygiene)

- Fix unused variables and hook dependency warning (no behaviour change expected).
- Consider seeding a second published package for stronger compare E2E coverage, or keep conditional compare.
