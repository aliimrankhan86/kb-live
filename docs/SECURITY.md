# Security Baseline & Threat Model

## Overview

This document outlines the security architecture and assumptions for the KaabaTrip MVP (Phase 1.1).

## Role-Based Access Control (RBAC)

| Role         | Access                                                                        | Restrictions                                           |
| :----------- | :---------------------------------------------------------------------------- | :----------------------------------------------------- |
| **Customer** | Own Profile, Own Requests, Offers for Own Requests, Own Booking Intents       | Cannot see other customers' data or unrelated offers.  |
| **Operator** | Own Profile, All Open Requests (Marketplace), Own Offers, Own Booking Intents | Cannot see other operators' offers or booking intents. |
| **Admin**    | Full Access                                                                   | (Future scope)                                         |

**Enforcement**:

- RBAC is enforced at the Data Access Layer (`lib/api/repository.ts`) and at the database layer via PostgreSQL Row Level Security (RLS).
- `MockDB` stores all data in test environments; production uses Supabase Postgres with RLS policies.
- `Repository` filters data based on `RequestContext`; RLS provides a second line of defence.
- BookingIntent payment evidence is returned only through the BookingIntent RBAC path: owning customer, involved operator, or admin.
- Payment instructions are returned only through `Repository.getPaymentInstructions(ctx, bookingIntentId)`, scoped to the owning customer, involved operator, or admin.
- Operators can create their own initial payment details and their own bank change requests only. They cannot approve, reject, or review bank changes.
- Admin-only review methods are `approveBankChangeRequest`, `rejectBankChangeRequest`, and `getAuditLog`.
- Bank details are never emailed. Repository responses mark payment instructions as `delivery: 'in_app_only'`.
- Evidence uploads remain metadata-only; bank-change requests must not store evidence bytes.
- Complaint access is scoped to the owning customer, the involved operator, or admin only. No cross-tenant leakage.
- Operator status changes on complaints are restricted to `operator_responding`, `resolved`, and `cannot_resolve`.
- Admin status changes on complaints are restricted to `admin_triage`, `resolved`, and `closed`.
- Admin notes and operator flag on complaints are internal-only; no public shaming or automated penalties.

## Row Level Security (RLS) Policies

All tables have `ENABLE ROW LEVEL SECURITY` with deny-by-default. Policies are defined in `supabase/migrations/001_enable_rls.sql`.

| Table                    | Read Policy                        | Write Policy                 | Notes                                       |
| :----------------------- | :--------------------------------- | :--------------------------- | :------------------------------------------ |
| **users**                | Own record only                    | Own record only              | auth.uid() = id                             |
| **operator_profiles**    | Public read                        | Own profile update           | Published data readable by all              |
| **payment_details**      | Own operator only                  | —                            | No direct insert via app (seeded/onboarded) |
| **bank_change_requests** | Own operator only                  | Own operator only            | Insert + update scoped to operator_id       |
| **audit_log_entries**    | Own operator only                  | System insert                | Insert via Repository only                  |
| **quote_requests**       | Own customer only                  | Own customer only            | Customer scoped by customer_id              |
| **offers**               | All (public)                       | —                            | Insert via operator API route (future)      |
| **booking_intents**      | Customer OR operator               | Own customer insert          | Both parties can update                     |
| **packages**             | Published (public) OR own operator | Own operator CRUD            | Drafts hidden from public                   |
| **complaints**           | Customer OR operator               | Customer insert, both update | Scoped by customer_id / operator_id         |

**Admin bypass**: Service role key bypasses all RLS (for admin dashboard and audit operations).

**Policy file**: `supabase/migrations/001_enable_rls.sql`

## Input Validation

- **Client-side**: HTML5 validation (required, type="number").
- **Server-side (Simulated)**: `Repository` checks types before saving.
- **Sanitisation**: Free-text fields (notes) are rendered as plain text (React default escapes HTML) to prevent XSS.

## Threats & Mitigations

### 1. Data Leakage (Cross-Tenant Access)

- **Threat**: Operator A sees Operator B's offers.
- **Mitigation**: `Repository.getOffersForRequest` filters by `operatorId` if the caller is an operator.

### 2. Insecure Direct Object References (IDOR)

- **Threat**: User accesses `/requests/[id]` for a request they don't own.
- **Mitigation**: `Repository.getRequestById` verifies `customerId` matches `ctx.userId`.

### 2a. Payment Evidence Leakage

- **Threat**: Evidence metadata is visible to an unrelated customer or operator.
- **Mitigation**: `Repository.getBookingIntents` filters by `customerId` for customers and `operatorId` for operators. `Repository.createBookingIntent` verifies the selected offer belongs to a request owned by the customer and that the operator matches the offer before saving evidence metadata.

### 2c. Complaint Leakage

- **Threat**: A customer or operator sees complaints they are not party to.
- **Mitigation**: `Repository.getComplaints` filters by role (customer own, operator own, admin all). `Repository.getComplaintById` enforces `requireComplaintAccess` before returning the record.

### 2b. Bank Detail Leakage or Unauthorized Changes

- **Threat**: A user views bank details without being part of a BookingIntent, or an operator changes payout details without review.
- **Mitigation**: Payment instructions require BookingIntent-scoped RBAC. Active bank details are immutable through the repository; changes require `BankChangeRequest`, admin review, cooling period, lazy activation, and audit logging.

### 3. XSS (Cross-Site Scripting)

- **Threat**: Malicious script in "Notes" field.
- **Mitigation**: React automatically escapes content in JSX. JSON-LD scripts are the only allowed `dangerouslySetInnerHTML` usage; they serialize trusted schema objects with `JSON.stringify` and receive the request CSP nonce.

## Supabase Auth & Session Security

- **Session strategy**: JWT stored in httpOnly cookies via `@supabase/ssr`. No tokens in `localStorage`.
- **Authorization role source**: Production authorization must not trust Supabase `user_metadata` / `raw_user_meta_data` because it is user-editable. Use `app_metadata` set via service-role/admin flows, or load role from the server-side `users` table by authenticated `user.id`.
- **Middleware**: `middleware.ts` refreshes expired JWTs on every request. Session cookies are automatically rotated.
- **Anon key**: Public (client-side) — used for auth and public data reads. Cannot bypass RLS.
- **Service role key**: Server-only, never exposed to client. Used for admin operations and seeding.
- **Environment variables**:
  - `NEXT_PUBLIC_SUPABASE_URL` — public, safe for client
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, safe for client
  - `SUPABASE_SERVICE_ROLE_KEY` — server-only, injected at build/runtime, never in client bundle
  - `DATABASE_URL` — server-only, Prisma connection string with PgBouncer
  - `DIRECT_URL` — server-only, direct Postgres connection for migrations
- **RLS**: Deny-by-default. Every table has `ENABLE ROW LEVEL SECURITY`. Anonymous users have zero access unless explicitly granted.
- **Storage buckets**: `evidence-files` and `operator-exports` are private. No public URLs. Signed URLs are time-limited and RBAC-checked before generation.

**2026-06-09 audit blocker:** current session/middleware code still reads `user_metadata.role`. Move this to the trusted role source above before production.

### Security Headers

Production deployments enforce static headers via `next.config.ts` and the nonce-based `Content-Security-Policy` via `middleware.ts`:

| Header                      | Value                                                                                                                                                                                                                                 | Purpose                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `X-Frame-Options`           | `DENY`                                                                                                                                                                                                                                | Prevent clickjacking            |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                                                                                             | Prevent MIME sniffing           |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                                                                                     | Limit referrer leakage          |
| `Permissions-Policy`        | `geolocation=(), camera=(), microphone=(), payment=()`                                                                                                                                                                                | Disable unused browser features |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains`                                                                                                                                                                                                 | Enforce HTTPS                   |
| `Content-Security-Policy`   | `default-src 'self'; script-src 'self' 'nonce-{per-request-nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | Mitigate XSS/injection          |

Development CSP adds `unsafe-eval` to `script-src` for Next.js development tooling only. Production CSP does not include `unsafe-inline` or `unsafe-eval` in `script-src`.

### 4. Rate Limiting (Stub)

- **Plan**: Implement rate limiting on API routes (Next.js middleware or external gateway like Vercel/Cloudflare) to prevent spam quote requests.
- **Current sensitive-action placeholders**: bank-detail capture, bank-change request creation, admin approval/rejection, and payment-instruction reads must be rate limited before moving from MockDB to real API routes.

## Audit Log Rules

- Audit logs are append-only through repository writes.
- Audit log metadata must not contain full account numbers, full sort codes, evidence bytes, or emailed bank details.
- Log required events: initial payment details capture, bank change requested, approved, rejected, cancelled, and activated.
- Audit log reads are admin-only.
- Evidence bytes access is restricted to the owning customer, involved operator, and admin via `Repository.getEvidenceBytes`. Throws if bytes have been purged.
- Evidence retention: 90 days default. Admin can flag for retention via `Repository.flagEvidenceForRetention` to preserve bytes beyond retention period.
- Evidence bytes are never emailed. Only metadata may appear in notifications; full bytes require in-app access.

## Dependency Hygiene

- Regular `npm audit`.
- No secrets committed to repo (use `.env.local` and `env.example`).
