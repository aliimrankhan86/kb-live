# NOW (session state)

**Update this file before every push. This is mandatory.**

## Branch & goal

- **Branch:** `main`
- **Goal:** Implement Verified onboarding MT-1/MT-2: bank details data model, change-control repository methods, and eligibility gating.

## What works (verified)

- Package detail to quote prefill flow is functioning end-to-end with query-based prefill.
- `/quote` and `/requests/[id]` now use the shared header, so logo/navigation are consistent with the rest of the app.
- Quote journey now exposes a clear "Back to previous page" action in wizard and request detail views.
- Header now includes a design-system currency dropdown (`GBP`, `USD`, `EUR`) that updates displayed package rates client-side.
- BookingIntent creation now issues a unique immutable reference code.
- Request detail payment handoff now supports image/PDF evidence metadata, optional text fields, and explicit skip-proof acknowledgement.
- Operator payment details now have MockDB storage keys, seeded active details for one verified operator, bank-change requests, audit logs, and repository-level eligibility checks.
- Cooling period lazy-activation fires on `Repository.getPaymentDetails` and `isOperatorBookableById` when `activationEligibleAt <= now`.
- Operator settings page shows last 5 own bank audit entries via `AuditLogView`.
- Admin bank change detail page shows full operator audit log via `Repository.getOperatorAuditLog`.

## Shipped

- P1-SEO-CORRIDORS shipped. Three city corridor pages: `/umrah/london`, `/umrah/birmingham`, `/umrah/manchester`. See `docs/AI_RUNBOOK.md` COMPLETED section for `DONE-SEO-CORRIDORS`.
- P1-EVIDENCE-BYTES shipped. See `docs/AI_RUNBOOK.md` COMPLETED section for `DONE-EVIDENCE-BYTES`.
- P0-HYGIENE-ARTEFACTS closed out. Duplicate `docs/_archive 2/` and `docs/skills 2/` dirs removed; `.gitignore` verified with `.next/`.
- P0-COMPLAINTS-FLOW shipped. See `docs/AI_RUNBOOK.md` COMPLETED section for `DONE-COMPLAINTS-FLOW`.
- MT-7 bank and payment E2E coverage shipped. See `docs/AI_RUNBOOK.md` COMPLETED section for `DONE-E2E-BANK-TESTS`.
- MT-8 cooling period lazy-activation + operator audit log view shipped. See `docs/AI_RUNBOOK.md` COMPLETED section for `DONE-COOLING-AUDIT-LOG`.
- MT-4 admin bank change review UI shipped. See `docs/AI_RUNBOOK.md` COMPLETED section for `DONE-ADMIN-BANK-REVIEW`.

### `MT5-CUSTOMER-PAYMENT-INSTR` — Customer payment instructions

- Created `components/request/PaymentInstructions.tsx` gated by `Repository.getPaymentInstructions` RBAC.
- Listed operators and unauthorized customers see holding message, not bank details.
- Verified operators with matching BookingIntent show full bank details (accountHolderName, sortCode, accountNumber, bankName, currency) plus reference code and pay-operator-direct disclosure.
- Recently-updated warning banner (`role=alert`, icon `aria-hidden=true`) shown when bank details changed in last 7 days.
- All required `data-testid` attributes present.
- 5 unit tests in `tests/payment-instructions.test.tsx` covering all acceptance criteria.
- Fixed `vitest.config.ts` with `esbuild.jsx: 'automatic'` for React 19 JSX test support.

### `P1-SEO-CORRIDORS` — SEO corridor pages for London, Birmingham, Manchester

- Created shared `CityCorridor` component for consistent city-specific landing pages.
- Three static Next.js pages: `/umrah/london`, `/umrah/birmingham`, `/umrah/manchester`.
- Each page exports unique `Metadata` with city-specific title and description.
- CTA links to `/search/packages` with pre-filled `type=umrah&departureCity={city}` query params.
- Content uses product-owned copy only — no scraped operator data, no fabricated prices.
- Pay-operator-direct disclosure included; no "best price" or "guaranteed availability" language.
- All pages statically prerendered at build time (no client JS on public pages).
- Sitemap updated with all 3 new routes.
- `docs/SEO.md` updated with new route entries in meta tags table.
- All 65 unit tests pass; build passes with zero errors.

### `P1-EVIDENCE-BYTES` — Evidence file bytes storage with RBAC + retention

- Added `base64Data` optional field to `BookingPaymentEvidenceFile` for inline base64 byte storage.
- Added `EvidenceStorageStatus` type (`metadata-only` | `bytes-stored`), `disputeFlag`, and `retentionExpiresAt` to `BookingPaymentEvidence`.
- `Repository.preparePaymentEvidence` auto-detects bytes presence and sets `storageStatus` + 90-day `retentionExpiresAt`.
- `Repository.getEvidenceBytes` returns full evidence with bytes only to owning customer, involved operator, or admin. Throws with clear error if bytes have been purged.
- `Repository.flagEvidenceForRetention` requires admin role; sets `disputeFlag` to preserve bytes beyond retention.
- `pruneExpiredEvidence` helper strips `base64Data` after `retentionExpiresAt` unless `disputeFlag` is true.
- `getBookingIntents` auto-prunes expired evidence on every read (lazy cleanup pattern for MockDB).
- 10 unit tests in `tests/evidence-bytes.test.ts` covering metadata-only, bytes-stored, RBAC, purge, and flag scenarios.
- All 65 unit tests pass; 6/6 Playwright E2E pass (no regressions).

### `P0-COMPLAINTS-FLOW` — Complaints routing: customer → operator → admin triage

- Added `Complaint` type with `category`, `severity`, `status` enums; `referenceCode` autofilled from BookingIntent.
- `Repository.createComplaint` enforces customer-only, valid enums, 10-char description minimum.
- `Repository.getComplaints` / `getComplaintById` RBAC: customer own, operator own, admin all.
- `Repository.updateComplaintStatus` role-gated status transitions (operator: responding/resolved/cannot_resolve; admin: triage/resolved/closed).
- `Repository.updateComplaintOperatorResponse` requires operator owner, min 5 chars, auto-advances status.
- `Repository.updateComplaintAdminNotes` requires admin; supports internal operator flag (no public shaming).
- `ComplaintForm` component in `RequestDetail` below `PaymentInstructions` for existing BookingIntents.
- Required copy blocks: pay-operator-direct disclosure, contract with operator, KaabaTrip logs/routes only (not adjudicator).
- `ComplaintsInbox` on `/operator/dashboard` with respond + status change UI.
- `ComplaintsTriage` on `/admin/complaints` with severity/status filters, internal notes, flag operator.
- 21 unit tests in `tests/complaints.test.ts` covering all RBAC rules.
- All 55 unit tests pass; 6/6 Playwright E2E pass (no regressions).

### `MT6-ELIGIBILITY-GATING` — Wire "Book now" CTA to operator bookability check

- Added `BookableButton` component inside `RequestDetail.tsx` that calls `Repository.isOperatorBookable(offer.operatorId)`.
- Non-bookable operators show disabled button with `aria-disabled="true"` and `title="Verification in progress"`.
- Existing booking intent still shows "Intent recorded" disabled state.
- Verified badge already shown only for `tier=verified` operators; listed operators show no badge.
- Server-side gate in `Repository.createBookingIntent` still enforces regardless of UI state.
- No regressions in `tests/operator-eligibility.test.ts` (5/5 pass).

### `MT4-ADMIN-BANK-REVIEW` — Admin bank change review

- Created `/admin/bank-changes` queue page listing pending `BankChangeRequest` records with operator name, submitted date, status badge, and Review link.
- Created `/admin/bank-changes/[id]` detail page with `BankChangeReviewCard` component.
- Before/after snapshot comparison table with semantic `th[scope=col]` headers showing all bank detail fields.
- Approve action: confirmation dialog displays cooling period end date; calls `Repository.approveBankChangeRequest`; audit log entry written automatically.
- Reject action: `Textarea` with `aria-required=true`, min-10 chars enforced client-side and server-side in `Repository.rejectBankChangeRequest`.
- Approve and reject buttons have distinct `aria-label` values.
- All required `data-testid` attributes present: `approve-btn`, `reject-btn`, `review-reason`, `change-request-before`, `change-request-after`.
- Created reusable `AuditLogView` component rendering entries reverse-chronologically with date, actor, action columns.
- Fixed `components/ui/Table.tsx` `Th` to accept `scope` attribute via `ThHTMLAttributes`.

### `c8c1774` - BookingIntent reference and payment evidence

- BookingIntent creation issues `KT-...` reference codes, with uniqueness and immutability enforced in the MockDB/Repository path.
- Payment evidence is MVP metadata-only for image/PDF selections and optional text; file bytes are not stored.
- Skipping proof requires explicit acknowledgement and records `skipProofAcknowledged` plus `proofSkippedAt`.
- Payment handoff remains pay-operator-direct only: KaabaTrip does not collect, hold, or transfer customer funds.
- Remaining MVP limit: operator 48h payment confirmation and evidence review surfaces are not yet enforced in UI/repository.

## What changed this session

- Added `OperatorProfile` tier and eligibility flags plus bank details, bank change request, audit log, and payment instruction types.
- Added MockDB keys: `kb_payment_details`, `kb_bank_change_requests`, and `kb_audit_log`.
- Seeded `op1` as a verified/bookable operator with active payment details; legacy operators normalise to `tier='listed'` and `canReceiveBookings=false`.
- Added repository methods for initial payment-details capture, bookability checks, bank-change request create/approve/reject/cancel, payment instructions, audit-log reads, and lazy activation after cooling period.
- Added `Repository.getPaymentDetails` with lazy-activation trigger and `Repository.getOperatorAuditLog` with RBAC (operator owner or admin).
- Added `requireOperatorOwnerOrAdmin` helper for shared RBAC patterns.
- Added BookingIntent eligibility gating so non-bookable operators cannot receive high-intent bookings.
- Added unit tests for bank details/change-control and operator eligibility matrix.
- Updated architecture, security, and QA docs for the new data model, RBAC, audit, and admin-review placeholders.
- Operator settings `/operator/settings/payment-details` now renders `AuditLogView` with `maxEntries={5}` showing own bank audit activity.
- Admin detail `/admin/bank-changes/[id]` now uses `Repository.getOperatorAuditLog` for full operator-scoped audit log.

## Current journey (as implemented now)

- User opens `/packages/umrah-2026-7-nights-value` and clicks **Request quote**.
- CTA navigates to `/quote` with serialized prefill query params from the package.
- Quote wizard reads and validates params, then merges them into the persisted quote draft.
- Wizard removes query params from the URL after hydration (`/quote` stays clean).
- On submit, a new request ID is generated, saved in MockDB, and user is redirected to `/requests/{id}`.
- On request detail, a customer can proceed direct only with a bookable operator, uploads payment evidence metadata or explicitly skips proof, and receives an immutable BookingIntent reference code.
- Payment instructions are repository-gated to the BookingIntent owner, involved operator, or admin and remain in-app only.

## Next step

Recommended next micro-task: MT-3+ from the Verified onboarding spec, after review/merge of MT-1/MT-2.

- Add operator/admin UI surfaces for onboarding bank capture and review queue.
- Add real route/API rate limiting when moving repository methods behind API routes.
- Keep public UI unchanged until the next scoped task.

## Commands to verify

```bash
npx tsc --noEmit
npm run test
npx playwright test e2e/flow.spec.ts
npx playwright test e2e/catalogue.spec.ts
npm run build
```

## Last verified

- `npx tsc --noEmit`: pass (0 errors)
- `npm test`: 34/34 pass
- `npm run build`: pass
- `npm test`: 65/65 pass
- `npm run build`: pass
- `npx playwright test e2e/bank-payment.spec.ts`: 4/4 pass (chromium)
- `npx playwright test e2e/flow.spec.ts e2e/catalogue.spec.ts e2e/bank-payment.spec.ts`: 18/18 pass (all browsers)
