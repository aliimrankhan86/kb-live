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

## 2026-06-04 - P2-PKG-CSV

**Goal:** Add CSV import and export for operator packages to speed up bulk onboarding.

**Acceptance criteria:**

- [x] `Repository.exportPackagesAsCsv` exports all operator packages as CSV with full field coverage
- [x] `Repository.importPackagesFromCsv` validates each row against Package type before saving
- [x] Invalid rows reported with row number and reason — not silently skipped
- [x] RBAC: both methods require operator role; customer blocked
- [x] CSV parsing handles quoted fields with commas and escaped quotes
- [x] `PackageCsvExport` component triggers browser download of `.csv` file
- [x] `PackageCsvImport` component shows success count and per-row error report
- [x] Both components wired into `OperatorPackagesList` action bar
- [x] 10 unit tests covering export, import, validation, RBAC, edge cases
- [x] All 75 unit tests pass; build passes with zero errors

**Result:** PASS

**Files changed:**

- `lib/api/repository.ts`
- `components/operator/PackageCsvExport.tsx` (new)
- `components/operator/PackageCsvImport.tsx` (new)
- `components/operator/OperatorPackagesList.tsx`
- `tests/package-csv.test.ts` (new)

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (75/75)
- `npm run build` → PASS

**Notes / Decisions:**

- Export uses RFC 4180-style CSV escaping (double quotes around fields containing commas/quotes/newlines; double-double-quote for literal quotes).
- Import parser handles quoted fields with embedded commas and escaped quotes.
- Required columns enforced: title, pricePerPerson, currency, totalNights, pilgrimageType.
- Status defaults to 'draft' unless explicitly 'published'.
- Invalid rows are collected and returned; valid rows are saved as they are validated.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - P1-SEO-CORRIDORS

**Goal:** Create SEO corridor pages for high-intent search terms Budget Umrah from London, Birmingham, and Manchester.

**Acceptance criteria:**

- [x] Three static pages created with unique h1, meta title, and meta description per city
- [x] Each page links to /search/packages with pre-filled query params (type=umrah, departureCity=...)
- [x] Pages included in sitemap.ts
- [x] No scraped or fabricated operator data — content uses product-owned copy only
- [x] No claims of "best price" or "guaranteed availability"
- [x] Statically prerendered at build time
- [x] tsc --noEmit passes
- [x] npm run build passes
- [x] npm test passes (65/65, no regressions)

**Result:** PASS

**Files changed:**

- `app/umrah/london/page.tsx` (new)
- `app/umrah/birmingham/page.tsx` (new)
- `app/umrah/manchester/page.tsx` (new)
- `components/marketing/CityCorridor.tsx` (new)
- `app/sitemap.ts`
- `docs/SEO.md`

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm run build` → PASS (all 3 pages statically prerendered)
- `npm test` → PASS (65/65)

**Notes / Decisions:**

- Shared `CityCorridor` component for consistent layout and easy future city additions.
- Each page exports `Metadata` with city-specific title and description.
- CTA links to `/search/packages` with pre-filled `type=umrah&departureCity={city}` query params.
- Content uses product-owned copy only — no scraped operator data, no fabricated prices.
- Pay-operator-direct disclosure included in copy.
- No "best price" or "guaranteed availability" language.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - P1-EVIDENCE-BYTES

**Goal:** Implement actual file byte storage for payment evidence uploads with RBAC enforcement and a defined retention policy.

**Acceptance criteria:**

- [x] `BookingPaymentEvidenceFile` supports optional `base64Data` field
- [x] `BookingPaymentEvidence` has `storageStatus` (metadata-only | bytes-stored), `disputeFlag`, `retentionExpiresAt`
- [x] `Repository.preparePaymentEvidence` auto-detects bytes presence and sets `storageStatus` + 90-day `retentionExpiresAt`
- [x] `Repository.getEvidenceBytes` returns full evidence with bytes only to customer/operator/admin; throws if purged
- [x] `Repository.flagEvidenceForRetention` requires admin; sets `disputeFlag` to preserve bytes
- [x] `pruneExpiredEvidence` strips `base64Data` after `retentionExpiresAt` unless `disputeFlag` is true
- [x] `getBookingIntents` auto-prunes expired evidence on every read
- [x] RBAC enforced: unrelated operator blocked
- [x] 10 unit tests covering all scenarios
- [x] No regressions in existing tests (65/65 pass) or E2E (6/6 chromium)

**Result:** PASS

**Files changed:**

- `lib/types.ts`
- `lib/api/repository.ts`
- `tests/evidence-bytes.test.ts` (new)

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (65/65)
- `npm run build` → PASS
- `npx playwright test e2e/flow.spec.ts e2e/catalogue.spec.ts e2e/bank-payment.spec.ts --project=chromium` → PASS (6/6)

**Notes / Decisions:**

- 90-day retention is a constant (`EVIDENCE_RETENTION_MS`) that can be adjusted.
- `getBookingIntents` now auto-prunes on every read — this is a "lazy cleanup" pattern suitable for MockDB. A real backend would use a scheduled job.
- Evidence bytes are never emailed; `getEvidenceBytes` is in-app only.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - P0-HYGIENE-ARTEFACTS

**Goal:** Remove duplicate docs directories and ensure .next build artefacts are gitignored.

**Acceptance criteria:**

- [x] docs/\_archive 2/ removed from repo
- [x] docs/skills 2/ removed from repo
- [x] .gitignore includes .next/ entry
- [x] git status clean after removal
- [x] npm run build passes after cleanup

**Result:** PASS

**Files changed:**

- `docs/_archive 2/` (removed)
- `docs/skills 2/` (removed)
- `.gitignore` (verified .next/ present)

**Commands run (with results):**

- `git status` → clean
- `npm run build` → PASS

**Notes / Decisions:**

- Duplicate directories were already removed in a prior session; this is a formal close-out with audit evidence.
- .gitignore already contained .next/ entry.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - P0-COMPLAINTS-FLOW

**Goal:**  
Implement complaints flow end-to-end: customer submits complaint tied to BookingIntent → routed to operator → admin triage. No refund promises.

**Acceptance criteria:**

- [x] Complaint type added to lib/types.ts with category, severity, status enums
- [x] Repository.createComplaint enforces customer-only + valid category/severity + 10-char description min
- [x] Repository.getComplaints/getComplaintById RBAC: customer sees own, operator sees own, admin sees all
- [x] Repository.updateComplaintStatus RBAC: operator can set operator_responding/resolved/cannot_resolve; admin can set admin_triage/resolved/closed
- [x] Repository.updateComplaintOperatorResponse requires operator owner, min 5 chars, auto-sets operator_responding
- [x] Repository.updateComplaintAdminNotes requires admin, supports internal flag (no public shaming)
- [x] Customer ComplaintForm integrated into RequestDetail below PaymentInstructions for existing BookingIntents
- [x] Operator ComplaintsInbox on /operator/dashboard with respond + status change
- [x] Admin ComplaintsTriage on /admin/complaints with severity/status filters, internal notes, flag operator
- [x] Required UX copy blocks present: pay-operator-direct, contract with operator, KaabaTrip logs/routes only
- [x] 21 unit tests covering all Repository RBAC rules
- [x] No regressions in existing tests (55/55 pass) or E2E (6/6 chromium)

**Result:** PASS

**Files changed:**

- `lib/types.ts`
- `lib/api/mock-db.ts`
- `lib/api/repository.ts`
- `components/request/ComplaintForm.tsx` (new)
- `components/request/RequestDetail.tsx`
- `components/operator/ComplaintsInbox.tsx` (new)
- `components/admin/ComplaintsTriage.tsx` (new)
- `app/operator/dashboard/page.tsx`
- `app/admin/complaints/page.tsx` (new)
- `tests/complaints.test.ts` (new)

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (55/55)
- `npm run build` → PASS
- `npx playwright test e2e/flow.spec.ts e2e/catalogue.spec.ts e2e/bank-payment.spec.ts --project=chromium` → PASS (6/6)

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Seed complaint added for op1 to populate operator inbox and admin triage on first load
- ComplaintForm uses closed/open state pattern (not a dialog) to keep UI simple
- All new components reuse existing Select, Textarea, Button, Badge, Checkbox UI primitives
- Admin flag is internal only; no automated penalties or public shaming in MVP

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - MT-7: Bank and Payment E2E Tests (`MT7-E2E-BANK-TESTS`)

**Goal:** Add Playwright E2E coverage for operator bank onboarding, payment instructions gating, admin bank change review, and eligibility gating flows.

**Acceptance criteria:**

- [x] e2e/bank-payment.spec.ts created with 4 serial tests
- [x] Test 1: operator submits bank change → admin approves → operator sees cooling period state
- [x] Test 2: BookingIntent creation → payment instructions visible with all required data-testids
- [x] Test 3: admin rejects with required reason (min 10 chars enforced)
- [x] Test 4: operator cancels pending change request
- [x] All tests pass on chromium
- [x] No regressions on e2e/flow.spec.ts and e2e/catalogue.spec.ts
- [x] All 18 Playwright tests pass across chromium/firefox/webkit

**Result:** PASS

**Files changed:**

- `e2e/bank-payment.spec.ts` (new)

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (34/34)
- `npm run build` → PASS
- `npx playwright test e2e/bank-payment.spec.ts --project=chromium` → PASS (4/4)
- `npx playwright test e2e/flow.spec.ts e2e/catalogue.spec.ts e2e/bank-payment.spec.ts` → PASS (18/18 across all browsers)

**Notes / Decisions:**

- Tests run in serial mode to avoid localStorage state collisions.
- Each test clears localStorage at start for deterministic seeded data.
- Used getByTestId and getByRole with exact match for disambiguation.
- Timeout increased to 60s for payment instructions test due to quote wizard navigation.

**Risks / Tech debt introduced:**

- None.

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

### 2026-02-03 - Phase 2 Hygiene: ESLint Warnings Cleanup

**Goal:**  
Resolve build-time ESLint warnings without changing behavior.

**Acceptance criteria:**

- [x] Only lint warning files updated.
- [x] No behavior changes introduced.
- [x] Build and test gates pass.

**Result:** PASS

**Files changed:**

- app/operator/packages/page.tsx
- app/operators/[slug]/page.tsx
- app/packages/[slug]/page.tsx
- components/kanban/KanbanBoard.tsx
- components/operator/AnalyticsDashboard.tsx
- components/request/RequestDetail.tsx
- docs/PHASE_2_AUDIT.md

**Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS
- `npx playwright test e2e/catalogue.spec.ts` → PASS
- `npm run build` → PASS

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Removed unused variables and the unnecessary hook dependency flagged by ESLint.

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

### Build notes

- No ESLint/TypeScript warnings after hygiene pass.

### Follow-ups (hygiene)

- Consider seeding a second published package for stronger compare E2E coverage, or keep conditional compare.

---

## 2026-06-04 - BookingIntent Reference + Payment Evidence Flow (`c8c1774`)

**Goal:** Add immutable BookingIntent reference codes, pay-operator-direct payment evidence metadata, and mandatory skip-proof acknowledgement.

**Acceptance criteria:**

- [x] BookingIntent created with unique immutable `referenceCode`.
- [x] Evidence upload accepts image/PDF metadata and optional text fields.
- [x] Skip proof requires explicit acknowledgement before continuing.
- [x] BookingIntent/evidence visibility is restricted to customer, involved operator, and admin through Repository RBAC.
- [x] Stable `data-testid` hooks added for reference code, upload control, skip checkbox, and submit.

**Result:** PASS

**Files changed:**

- `components/request/RequestDetail.tsx`
- `lib/types.ts`
- `lib/api/repository.ts`
- `lib/api/mock-db.ts`
- `e2e/flow.spec.ts`
- `docs/NOW.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`

**Commands run (with results):**

- `npm run test` -> PASS
- `npm run build` -> PASS
- `npx playwright test e2e/flow.spec.ts` -> PASS (3 browsers)
- `npx playwright test e2e/catalogue.spec.ts` -> PASS (3 browsers)

**Notes / Decisions:**

- MVP remains pay-operator-direct only. KaabaTrip stores no customer funds.
- Payment evidence storage is metadata-only in MockDB; no file bytes are stored.
- Operator 48h payment confirmation remains a product requirement but is not yet enforced in UI/repository.

**Risks / Tech debt introduced:**

- Evidence review surfaces for operator/admin are still needed.
- Bank-detail change-control and eligibility gating are still needed before higher-intent routing.

---

## 2026-06-04 - MT-1/MT-2: Verified bank details foundation + booking eligibility gating (a8eee55)

**Goal:** Add the foundation for controlled operator bank-details capture, bank-change review, audit logging, and booking eligibility gating while keeping the MVP pay-operator-direct posture.

**Acceptance criteria:**

- [x] `OperatorProfile` supports tier and eligibility flags, with legacy/default operators treated as listed and unable to receive bookings.
- [x] MockDB includes `kb_payment_details`, `kb_bank_change_requests`, and `kb_audit_log` storage keys.
- [x] One verified mock operator is seeded with active payment details without breaking existing seed/version migration.
- [x] Repository methods enforce RBAC for payment-details capture, bank-change requests, admin review, payment instructions, audit-log reads, and booking eligibility.
- [x] BookingIntent creation is blocked for non-bookable operators.
- [x] Unit tests cover bank-details change control and the operator bookability matrix.

**Result:** PASS

**Files changed:**

- `lib/types.ts`
- `lib/api/mock-db.ts`
- `lib/api/repository.ts`
- `tests/bank-details.test.ts`
- `tests/operator-eligibility.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/NOW.md`
- `QA.md`

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
  - Initial run hit pre-existing duplicate generated `.next/types/* 2.ts` and `.next/types/* 3.ts` files. These files were not touched. After `npm run build` regenerated Next types, `npx tsc --noEmit` passed.
- `npm run test` → PASS (27 tests)
- `npm run build` → PASS

**Notes / Decisions:**

- No public routes changed; this is repository/data-model foundation work only.
- MVP remains pay-operator-direct only. KaabaTrip does not collect, hold, or transfer customer funds.
- No guarantees language was added.
- Payment instructions remain in-app only and are scoped through BookingIntent RBAC.

**Follow-ups created:**

- Next recommended micro-task: operator onboarding UI plus admin review gate for bank-detail changes.

---

## 2026-06-04 - MT-5: Customer Payment Instructions (`MT5-CUSTOMER-PAYMENT-INSTR`)

**Goal:** Build PaymentInstructions component gated by BookingIntent ownership + Verified operator eligibility, shown in-app only.

**Acceptance criteria:**

- [x] Repository.getPaymentInstructions gate enforced — Listed operator returns holding message not bank details
- [x] Customer without matching BookingIntent gets holding message not bank details
- [x] Verified operator with matching BookingIntent shows full bank details with reference code and pay-operator-direct disclosure
- [x] Recently-updated warning banner shown when flag is true
- [x] Pay-operator-direct disclosure text matches required copy exactly
- [x] data-testid attributes present
- [x] tests/payment-instructions.test.tsx passes (5/5)

**Result:** PASS

**Files changed:**

- `components/request/PaymentInstructions.tsx`
- `app/requests/[id]/page.tsx`
- `tests/payment-instructions.test.tsx`
- `vitest.config.ts`

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (32/32)
- `npm run build` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS (3 browsers)
- `npx playwright test e2e/catalogue.spec.ts` → PASS (3 browsers)

**Notes / Decisions:**

- Component is client-side only (`'use client'`) to prevent server-side leakage.
- Disclosure text matches required copy verbatim.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - MT-6: Eligibility Gating (`MT6-ELIGIBILITY-GATING`)

**Goal:** Wire "Book now" / proceed-to-BookingIntent CTAs to Repository.isOperatorBookable so Listed or suspended operators cannot initiate bookings.

**Acceptance criteria:**

- [x] RequestDetail offer card uses BookableButton that calls Repository.isOperatorBookable
- [x] Non-bookable operators show disabled button with aria-disabled=true
- [x] Verified badge shown only for tier=verified
- [x] Repository.createBookingIntent enforces gate server-side regardless of UI state
- [x] tests/operator-eligibility.test.ts passes (5/5)

**Result:** PASS

**Files changed:**

- `components/request/RequestDetail.tsx`
- `tests/operator-eligibility.test.ts`

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (32/32)
- `npm run build` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS (3 browsers)
- `npx playwright test e2e/catalogue.spec.ts` → PASS (3 browsers)

**Notes / Decisions:**

- Server-side gate remains the enforcement layer; UI gating is defence-in-depth.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.

---

## 2026-06-04 - MT-8: Cooling Period + Operator Audit Log (`MT8-COOLING-AUDIT-LOG`)

**Goal:** Surface cooling period lazy-activation and render operator-facing audit log for bank detail events.

**Acceptance criteria:**

- [x] Repository.getPaymentDetails triggers lazy-activation when coolingEndsAt <= now and status=approved
- [x] AuditLogView component renders entries reverse-chronologically
- [x] Operator settings page shows last 5 own bank audit entries
- [x] Admin detail page shows full audit log for the operator under review
- [x] Repository.getOperatorAuditLog RBAC-gated to operator owner or admin
- [x] tsc, tests, build pass

**Result:** PASS

**Files changed:**

- `lib/api/repository.ts`
- `app/operator/settings/payment-details/page.tsx`
- `app/admin/bank-changes/[id]/page.tsx`
- `tests/bank-details.test.ts`

**Commands run (with results):**

- `npx tsc --noEmit` → PASS
- `npm test` → PASS (34/34)
- `npm run build` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS (3 browsers)
- `npx playwright test e2e/catalogue.spec.ts` → PASS (3 browsers)

**Notes / Decisions:**

- Added `requireOperatorOwnerOrAdmin` RBAC helper for shared access patterns.
- AuditLogView accepts `maxEntries` prop for operator-scoped limiting.

**Risks / Tech debt introduced:**

- None.

**Follow-ups created:**

- None.
