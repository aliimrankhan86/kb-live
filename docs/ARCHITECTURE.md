# System Architecture

## Overview

KaabaTrip is a Next.js 15 App Router application. Uses Supabase (London eu-west-2) for Postgres persistence, Auth, and Storage. The Repository pattern abstracts data access and enforces RBAC. MockDB remains for unit tests only; production and development use Prisma + Supabase when `FEATURE_USE_REAL_DB=true`.

## Architecture diagram

```
PUBLIC SIDE                      OPERATOR SIDE
/  /umrah  /search/packages      /operator/dashboard  /packages  /analytics
       |                                |
       v                                v
  lib/api/repository.ts  (RBAC-aware data access)
       |
       +---> lib/api/db/adapter.ts (Prisma + Supabase)
       |           |
       |           v
       |      Supabase Postgres (eu-west-2)
       |           |
       |           +-- Auth (JWT cookies)
       |           +-- Storage (private buckets)
       |           +-- RLS (deny-by-default)
       |
       +---> lib/api/mock-db.ts (unit tests only)
```

**Rule:** UI components never import MockDB directly. Always go through Repository.

## Data model

### Core entities

| Entity              | Purpose                                                                | Key fields                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`              | Customer, Operator, Admin roles                                        | id, email, role                                                                                                                                                               |
| `OperatorProfile`   | Operator company details                                               | id, companyName, slug, verificationStatus                                                                                                                                     |
| `Package`           | Structured travel listing                                              | id, operatorId, title, slug, status, pilgrimageType, price, nights, hotels, inclusions                                                                                        |
| `QuoteRequest`      | Customer demand signal                                                 | id, customerId, type, season, budget, nights, inclusions                                                                                                                      |
| `Offer`             | Operator response to a request                                         | id, requestId, operatorId, price, nights, inclusions                                                                                                                          |
| `BookingIntent`     | Pay-operator-direct signal of interest to proceed                      | id, immutable referenceCode, offerId, customerId, operatorId, status, paymentEvidence metadata, skipProofAcknowledged                                                         |
| `PaymentDetails`    | Operator direct-payment bank details captured in controlled onboarding | id, operatorId, account holder, bank name, sort code, account number, status, phoneVerifiedAt                                                                                 |
| `BankChangeRequest` | Change-control record for bank-detail updates                          | id, operatorId, proposedDetails, status, reviewedByUserId, activationEligibleAt                                                                                               |
| `AuditLogEntry`     | Append-only sensitive action trail                                     | id, action, actor, operatorId, target, createdAt, metadata                                                                                                                    |
| `Complaint`         | Customer issue report tied to a BookingIntent                          | id, bookingIntentId, referenceCode, customerId, operatorId, category, severity, status, description, operatorResponse, adminNotes, adminFlaggedOperator, createdAt, updatedAt |

### Operator eligibility

`OperatorProfile` includes `tier` (`listed`, `verified`, `verified_plus`) and `eligibilityFlags`.
Existing/legacy operators default to `tier='listed'` and `eligibilityFlags.canReceiveBookings=false`.
An operator is bookable only when all of these are true:

- `verificationStatus === 'verified'`
- `tier !== 'listed'`
- `eligibilityFlags.canReceiveBookings === true`
- `eligibilityFlags.bankDetailsActive === true`
- One active `PaymentDetails` record exists

### RBAC matrix

| Resource       | Customer        | Operator                                                            | Public         |
| -------------- | --------------- | ------------------------------------------------------------------- | -------------- |
| Requests       | Own only        | All open + own responses                                            | None           |
| Offers         | On own requests | Own only                                                            | None           |
| BookingIntents | Own only        | Own only, including payment evidence metadata for involved operator | None           |
| Packages       | Read published  | CRUD own                                                            | Read published |
| Complaints     | Own only        | Own only (involved operator)                                        | Full (triage)  |

### Storage keys (localStorage) — test env only

These keys are used exclusively by MockDB during unit tests. Production and development (with `FEATURE_USE_REAL_DB=true`) use Supabase Postgres.

- `kb_requests`, `kb_offers`, `kb_bookings`, `kb_packages`
- `kb_payment_details`, `kb_bank_change_requests`, `kb_audit_log`
- `kb_complaints`
- `kb_packages_seed_version` (migration trigger)
- `kb_shortlist_packages` (user's shortlisted IDs)
- `kb_language` (user's language preference — UI setting only, not business data)

**Production / real DB mode:** All business data stored in Supabase Postgres with Row Level Security. No localStorage used for persistence.

### BookingIntent payment evidence

- `referenceCode` is generated by `Repository.createBookingIntent`, must be unique, and is immutable once issued.
- Payment handoff remains pay-operator-direct only; KaabaTrip stores no customer funds.
- Evidence upload accepts image/PDF metadata plus optional payer name, operator payment reference, and note.
- File bytes can be stored as base64 in `BookingPaymentEvidenceFile.base64Data`. When present, `storageStatus` is `bytes-stored`; otherwise `metadata-only`.
- 90-day retention policy enforced by `pruneExpiredEvidence`: bytes are purged after `retentionExpiresAt` unless `disputeFlag` is true.
- Admin can flag evidence for retention via `Repository.flagEvidenceForRetention` to preserve bytes beyond retention.
- `Repository.getEvidenceBytes` returns full evidence (with bytes) only to the owning customer, involved operator, or admin. Throws if bytes have been purged.
- If payment proof is skipped, `skipProofAcknowledged` is required and `proofSkippedAt` is recorded.
- Repository access filters BookingIntent records by customer, involved operator, or admin.
- `Repository.createBookingIntent` refuses non-bookable operators before issuing a BookingIntent.

### Bank details and change control

- `Repository.createPaymentDetails` captures initial operator payment details only for the owning operator and requires a phone-confirmation stub (`confirmed=true`, `phoneLastFour`).
- Existing active details cannot be edited directly. Operators must use `Repository.createBankChangeRequest`.
- `Repository.approveBankChangeRequest` and `Repository.rejectBankChangeRequest` are admin-only.
- Approved bank changes enter a cooling period before activation. `Repository.isOperatorBookable` and `Repository.getPaymentInstructions` run lazy activation when the cooling period has elapsed.
- `Repository.getPaymentInstructions` is scoped to a BookingIntent and returns bank details only to the owning customer, involved operator, or admin.
- Audit log writes are created for initial capture, change request creation, approval, rejection, cancellation, and lazy activation.
- Complaint records are created by customers, responded to by operators, and triaged by admin. No automated penalties or public shaming.

## i18n layer

```
lib/i18n/
  region.ts          — Detect user region from navigator.language + timezone
  format.ts          — Currency conversion, price formatting, distance formatting
  translations/      — (planned) JSON files for en, fr, ar
  use-translation.ts — (planned) React hook for translated strings
```

**Current state:** Region detection and currency formatting are built and wired into comparison and package display. Translation files and the hook are planned (see `docs/I18N.md`).

**Key design decisions:**

- Detection: `navigator.language` + `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Currency: static GBP-based conversion rates (acceptable for MVP)
- RTL: Arabic layout via `dir="rtl"` on `<html>` + Tailwind `rtl:` variants
- Persistence: language choice stored in `kb_language` localStorage key

## Security enforcement

- Repository methods accept `RequestContext` (simulated session).
- All data filtered by `ctx.role` and `ctx.userId`.
- Write operations validate ownership before persisting.
- Auth middleware implemented: `middleware.ts` enforces role-based access with Supabase JWT validation.
- See `docs/SECURITY.md` for full threat model.

## Persistence stack

| Layer    | Technology                    | Purpose                                         |
| -------- | ----------------------------- | ----------------------------------------------- |
| Database | Supabase Postgres (eu-west-2) | Primary data store, GDPR-aligned                |
| ORM      | Prisma                        | Type-safe queries, migrations, seeding          |
| Auth     | Supabase Auth                 | JWT-based, cookie-only sessions                 |
| Storage  | Supabase Storage              | Private buckets for evidence files, CSV exports |
| Security | PostgreSQL RLS                | Deny-by-default row-level policies              |
| Client   | `@supabase/ssr`               | Next.js App Router cookie handling              |

## Supabase clients

- `lib/supabase/client.ts` — Browser client (`createBrowserClient`)
- `lib/supabase/server.ts` — Server client (`createServerClient`, reads cookies)
- `lib/supabase/middleware.ts` — Session refresh middleware (`updateSession`)
- `middleware.ts` (root) — Applies `updateSession` to all routes

## Migration path (MockDB → Supabase)

1. ✅ P1A: Install Supabase SDK + Prisma, configure env, create client files
2. ✅ P1B: Design Prisma schema matching existing types
3. ✅ P1C: Build DB adapter implementing MockDB interface
4. ✅ P1D: Auth middleware (Supabase Auth + Next.js middleware)
5. ✅ P1E: RLS policies (deny-by-default, role-based)
6. ✅ P1F: Storage buckets (evidence files, operator exports)
7. ✅ P1G: Seed migration (MockDB data → Postgres)
8. ⏳ P1H: Cutover — feature flag `FEATURE_USE_REAL_DB` controls data source; MockDB available for unit tests; production defaults to Prisma + Supabase
