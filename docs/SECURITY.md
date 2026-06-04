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

- RBAC is enforced at the Data Access Layer (`lib/api/repository.ts`).
- `MockDB` stores all data, but `Repository` filters it based on `RequestContext`.
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
- **Mitigation**: React automatically escapes content in JSX. We do not use `dangerouslySetInnerHTML`.

### 4. Rate Limiting (Stub)

- **Plan**: Implement rate limiting on API routes (Next.js middleware or external gateway like Vercel/Cloudflare) to prevent spam quote requests.
- **Current sensitive-action placeholders**: bank-detail capture, bank-change request creation, admin approval/rejection, and payment-instruction reads must be rate limited before moving from MockDB to real API routes.

## Audit Log Rules

- Audit logs are append-only through repository writes.
- Audit log metadata must not contain full account numbers, full sort codes, evidence bytes, or emailed bank details.
- Log required events: initial payment details capture, bank change requested, approved, rejected, cancelled, and activated.
- Audit log reads are admin-only.

## Dependency Hygiene

- Regular `npm audit`.
- No secrets committed to repo (use `.env.local` and `env.example`).
