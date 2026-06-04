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

### 3. XSS (Cross-Site Scripting)

- **Threat**: Malicious script in "Notes" field.
- **Mitigation**: React automatically escapes content in JSX. We do not use `dangerouslySetInnerHTML`.

### 4. Rate Limiting (Stub)

- **Plan**: Implement rate limiting on API routes (Next.js middleware or external gateway like Vercel/Cloudflare) to prevent spam quote requests.

## Dependency Hygiene

- Regular `npm audit`.
- No secrets committed to repo (use `.env.local` and `env.example`).
