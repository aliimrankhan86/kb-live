# System Architecture

## Overview

KaabaTrip is a Next.js application using a client-side "MockDB" pattern to simulate backend persistence via `localStorage`.

## Data Model (Phase 2)

### Core Entities

- **User**: Customer, Operator, Admin roles.
- **OperatorProfile**: Details for verified operators.
- **QuoteRequest**: Customer demand signal (Umrah/Hajj, dates, budget).
- **Offer**: Operator response to a request.
- **BookingIntent**: Signal of interest to proceed with an offer.
- **Package** (New in Phase 2): Structured travel package listing.

### Package Entity

A `Package` represents a pre-defined offer that customers can browse.

- **Status**: `draft` (visible only to owner) vs `published` (visible to all).
- **Slug**: URL-friendly identifier derived from title.
- **Pricing**: `exact` or `from` price type.
- **Structure**: Mirrors `Offer` structure for easy comparison (nights, hotels, inclusions).

## Data Access Layer (`lib/api/repository.ts`)

We use a Repository pattern to abstract data access and enforce security rules.

### RBAC Matrix

| Resource           | Customer Access        | Operator Access                   | Public Access  |
| :----------------- | :--------------------- | :-------------------------------- | :------------- |
| **Requests**       | Own requests only      | All open requests + own responses | None           |
| **Offers**         | Offers on own requests | Own offers only                   | None           |
| **BookingIntents** | Own intents            | Intents on own offers             | None           |
| **Packages**       | Read Published         | CRUD Own Packages                 | Read Published |

### Security Enforcement

- The `Repository` methods accept a `RequestContext` (simulated session).
- All data returned is filtered based on the `ctx.role` and `ctx.userId`.
- Write operations validate ownership before persisting to `MockDB`.

## Storage Strategy

- **MockDB**: A singleton wrapper around `localStorage`.
- **Keys**: `kb_requests`, `kb_offers`, `kb_bookings`, `kb_packages`.
- **Migration**: To move to a real backend (Supabase/Postgres), replace `lib/api/repository.ts` implementation to call API endpoints instead of `MockDB`.
