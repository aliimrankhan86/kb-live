# System Architecture

## Overview

KaabaTrip is a Next.js 15 App Router application. Currently uses a client-side MockDB (localStorage) to simulate backend persistence. The Repository pattern abstracts data access and enforces RBAC. When a real backend is added, only `lib/api/` changes.

## Architecture diagram

```
PUBLIC SIDE                      OPERATOR SIDE
/  /umrah  /search/packages      /operator/dashboard  /packages  /analytics
        |                                |
        v                                v
   lib/api/repository.ts  (RBAC-aware data access)
        |
        v
   lib/api/mock-db.ts  -->  future: API/Postgres
        |
        v
   localStorage (browser)
```

**Rule:** UI components never import MockDB directly. Always go through Repository.

## Data model

### Core entities

| Entity | Purpose | Key fields |
|--------|---------|------------|
| `User` | Customer, Operator, Admin roles | id, email, role |
| `OperatorProfile` | Operator company details | id, companyName, slug, verificationStatus |
| `Package` | Structured travel listing | id, operatorId, title, slug, status, pilgrimageType, price, nights, hotels, inclusions |
| `QuoteRequest` | Customer demand signal | id, customerId, type, season, budget, nights, inclusions |
| `Offer` | Operator response to a request | id, requestId, operatorId, price, nights, inclusions |
| `BookingIntent` | Signal of interest to proceed | id, offerId, customerId, operatorId, status |

### RBAC matrix

| Resource | Customer | Operator | Public |
|----------|----------|----------|--------|
| Requests | Own only | All open + own responses | None |
| Offers | On own requests | Own only | None |
| BookingIntents | Own only | On own offers | None |
| Packages | Read published | CRUD own | Read published |

### Storage keys (localStorage)

- `kb_requests`, `kb_offers`, `kb_bookings`, `kb_packages`
- `kb_packages_seed_version` (migration trigger)
- `kb_shortlist_packages` (user's shortlisted IDs)
- `kb_language` (user's language preference)

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
- No auth middleware yet — planned for operator dashboard.
- See `docs/SECURITY.md` for full threat model.

## Migration path (MockDB → real backend)

1. Replace `lib/api/mock-db.ts` with API client calls.
2. `Repository` interface stays the same.
3. Add auth middleware for operator routes.
4. Move from localStorage to server-side sessions.
5. Replace static exchange rates with API-based rates.
