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

## Shipped

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
- Added BookingIntent eligibility gating so non-bookable operators cannot receive high-intent bookings.
- Added unit tests for bank details/change-control and operator eligibility matrix.
- Updated architecture, security, and QA docs for the new data model, RBAC, audit, and admin-review placeholders.

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
