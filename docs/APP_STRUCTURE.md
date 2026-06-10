# App Structure & User Journeys

Complete map of every screen, route, and user flow in the PilgrimCompare application. This is the source of truth for what exists and what needs to be built.

**Legend:** `[DONE]` = built and working, `[PARTIAL]` = shell exists but incomplete, `[TODO]` = not yet started.

---

## 1. Two-sided architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PilgrimCompare                                  │
│                                                                     │
│  PUBLIC SIDE (travellers)          OPERATOR SIDE (travel agents)     │
│  ─────────────────────────        ──────────────────────────────    │
│  /                   [DONE]        /operator/onboarding      [DONE]  │
│  /umrah              [DONE]        /operator/dashboard       [DONE]  │
│  /hajj               [DONE]        /operator/packages        [DONE]  │
│  /umrah/ramadan      [DONE]        package wizard in-page    [PARTIAL]│
│  /search/packages    [DONE]        /operator/leads           [DONE]  │
│  /packages           [DONE]        /operator/analytics       [PARTIAL]│
│  /packages/[slug]    [DONE]        /operator/profile         [DONE]  │
│  /operators/[slug]   [DONE]        /operator/settings        [DONE]  │
│  /quote              [DONE]                                          │
│  /requests/[id]      [DONE]                                          │
│  /showcase           [DONE]                                          │
│                                                                     │
│  SHARED                                                             │
│  ──────                                                             │
│  /api/health         [DONE]                                          │
│  /sitemap.xml        [DONE]                                          │
│  /robots.txt         [DONE]                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Public side — Traveller journey

### Journey map

```
START
  │
  ▼
┌──────────────┐
│  / (Landing) │  Hero: "Compare Hajj & Umrah Packages"
│              │  CTAs: [Find Umrah] [Find Hajj]
└──────┬───────┘
       │ user clicks CTA
       ▼
┌──────────────────┐
│  /umrah or /hajj │  Search preferences form
│                  │  Fields: dates, budget, stars, departure city
│                  │  CTA: [Find Packages]
└──────┬───────────┘
       │ form submits (GET with query params)
       ▼
┌──────────────────────────┐
│  /search/packages        │  Results list with PackageCards
│                          │  Filters: budget, stars, distance, inclusions
│                          │  Sort: price, rating, distance
│                          │  Actions per card: [Shortlist] [Compare] [View]
│                          │  Sticky bar: "N shortlisted · Compare (M)"
└──────┬───────┬───────────┘
       │       │
       │       │ user selects 2-3 for comparison
       │       ▼
       │  ┌──────────────────┐
       │  │  Compare Modal   │  Side-by-side table (max 3 packages)
       │  │                  │  Rows: price, operator, hotels, inclusions
       │  │                  │  CTA: [Express Interest] per package
       │  └──────┬───────────┘
       │         │
       │ user clicks "View"
       ▼
┌──────────────────────┐
│  /packages/[slug]    │  Full package detail
│                      │  Sections: trip, hotels, inclusions, operator info
│                      │  CTA: [Request Quote] → prefills /quote
└──────┬───────────────┘
       │ user clicks operator name
       ▼
┌──────────────────────┐
│  /operators/[slug]   │  Operator profile (public)
│                      │  Company info, verified badge, all packages
└──────────────────────┘
       │ user clicks "Request Quote"
       ▼
┌──────────────────────┐
│  /quote              │  5-step wizard (QuoteRequestWizard)
│                      │  Step 1: Type + Season
│                      │  Step 2: Location + Dates
│                      │  Step 3: Stay details (nights, stars, distance)
│                      │  Step 4: Group + Budget
│                      │  Step 5: Review + Submit
└──────┬───────────────┘
       │ submitted
       ▼
┌──────────────────────┐
│  /requests/[id]      │  Request tracker
│                      │  Shows request status + incoming offers
│                      │  Offers show operator name, price, details
│                      │  CTA: [Express Interest] per offer
└──────────────────────┘
```

### Key files per screen (public)

| Screen           | Route file                      | Component(s)                                                     |
| ---------------- | ------------------------------- | ---------------------------------------------------------------- |
| Landing          | `app/page.tsx`                  | `Header`, `Hero`                                                 |
| Umrah search     | `app/umrah/page.tsx`            | `UmrahSearchForm`                                                |
| Hajj search      | `app/hajj/page.tsx`             | — (placeholder)                                                  |
| Search results   | `app/search/packages/page.tsx`  | `PackageList`, `PackageCard`, `FilterOverlay`, `ComparisonTable` |
| Package detail   | `app/packages/[slug]/page.tsx`  | `PackageDetail`                                                  |
| Operator profile | `app/operators/[slug]/page.tsx` | `OperatorProfileDetail`                                          |
| Quote wizard     | `app/quote/page.tsx`            | `QuoteRequestWizard`, Steps 1-5                                  |
| Request detail   | `app/requests/[id]/page.tsx`    | `RequestDetail`                                                  |

---

## 3. Operator side — Partner journey

### Journey map

```
START (operator visits site)
  │
  ▼
┌──────────────────────────────┐
│  /operator/onboarding  [DONE]│  Registration form
│                              │  Fields: company name, reg #, ATOL, ABTA,
│                              │    contact email, phone, address, serving
│                              │    regions, departure airports, logo
│                              │  CTA: [Submit for Verification]
└──────────┬───────────────────┘
            │ submitted → status: 'pending'
            ▼
┌──────────────────────────────────────┐
│  /operator/onboarding/status  [DONE] │  Verification waiting screen
│                                      │  "We're reviewing your application"
│                                      │  "Create draft packages while you wait"
│                                      │  CTA: [Go to Dashboard]
└──────────┬───────────────────────────┘
            │ (verification approved or navigates)
            ▼
┌──────────────────────────────────────────┐
│  /operator/dashboard  [DONE]             │  HOME for operators
│                                          │
│  ┌─ Sidebar ─────────────────────────┐   │
│  │ Logo                              │   │
│  │ [Dashboard] ← active             │   │
│  │ [My Packages]                     │   │
│  │ [Leads / Enquiries]              │   │
│  │ [Analytics]                       │   │
│  │ [Profile & Settings]             │   │
│  └───────────────────────────────────┘   │
│                                          │
│  Main content:                           │
│  ┌─ Overview cards ──────────────────┐   │
│  │ Published packages: 5             │   │
│  │ Active leads: 3                   │   │
│  │ Offers sent: 12                   │   │
│  │ Booking intents: 4               │   │
│  └───────────────────────────────────┘   │
│  ┌─ Recent activity ────────────────┐    │
│  │ New lead from London, 10-night   │    │
│  │ Offer accepted by customer       │    │
│  │ New review posted                │    │
│  └───────────────────────────────────┘   │
│  ┌─ Quick actions ──────────────────┐    │
│  │ [Create Package] [View Leads]    │    │
│  └───────────────────────────────────┘   │
│  ┌─ Completeness nudge ─────────────┐   │
│  │ "Your profile is 60% complete"   │   │
│  │ "Add ATOL number to build trust" │   │
│  │ [Complete Profile →]             │   │
│  └───────────────────────────────────┘   │
└──────────────────────────────────────────┘
           │
           │ operator clicks [My Packages]
           ▼
┌──────────────────────────────────────────┐
│  /operator/packages  [DONE]              │
│                                          │
│  Table: title, type, season, price,      │
│    nights, status, completeness, actions │
│  CTA: [Create Package]                   │
│  Per-row: [Edit] [Duplicate] [Unpublish] │
│    [Delete]                              │
│  Filter: all | published | draft         │
│  Sort: newest, price, title              │
└──────────┬───────────────────────────────┘
           │ operator clicks [Create Package]
           ▼
┌──────────────────────────────────────────┐
│  Package wizard on /operator/packages    │
│  [PARTIAL: implemented, E2E failing]     │
│                                          │
│  Multi-step wizard:                      │
│  Step 1: Basic info (title, type, dates) │
│  Step 2: Pricing (price, deposit, plan)  │
│  Step 3: Hotels (Makkah + Madinah)       │
│  Step 4: Flights (if included)           │
│  Step 5: Inclusions + room options       │
│  Step 6: Policies (cancellation, etc.)   │
│  Step 7: Marketing (notes, highlights)   │
│  Step 8: Review → [Save Draft] or        │
│           [Publish] (if verified)        │
│                                          │
│  See OPERATOR_ONBOARDING.md §3 for       │
│  every field + validation.               │
└──────────────────────────────────────────┘
           │
           │ operator clicks [Leads / Enquiries]
           ▼
┌──────────────────────────────────────────┐
│  /operator/leads  [DONE]                 │
│                                          │
│                                          │
│  List of incoming quote requests:        │
│  - Type, season, dates, budget range     │
│  - Status: new | viewed | responded      │
│  - [View & Respond] opens modal/page     │
│                                          │
│  Response form (OfferForm — enhanced):   │
│  - Pre-filled from request preferences   │
│  - Operator adds: price, hotel names,    │
│    airline, departure airport, notes     │
│  - [Send Offer]                          │
└──────────────────────────────────────────┘
           │
           │ operator clicks [Analytics]
           ▼
┌──────────────────────────────────────────┐
│  /operator/analytics  [PARTIAL]          │
│                                          │
│  Stats cards (currently: 3 basic cards)  │
│  Enhanced:                               │
│  - Package views (per package)           │
│  - Shortlist additions (per package)     │
│  - Enquiries received (total + trend)    │
│  - Offers sent (total + acceptance rate) │
│  - Booking intents (total)               │
│  - Completeness score                    │
│                                          │
│  Charts: enquiries over time, conversion │
│  Top packages table: views, shortlists   │
└──────────────────────────────────────────┘
           │
           │ operator clicks [Profile & Settings]
           ▼
┌──────────────────────────────────────────┐
│  /operator/profile  [DONE]               │
│                                          │
│  Edit company details:                   │
│  - Company name, trading name            │
│  - Registration #, ATOL, ABTA            │
│  - Contact email, phone, address         │
│  - Logo upload, primary colour           │
│  - Serving regions, departure airports   │
│  - Website URL                           │
│  CTA: [Save Changes]                     │
│                                          │
│  Verification status display:            │
│  - "Verified ✓" or "Pending" or          │
│    "Rejected — resubmit"                 │
│                                          │
│  Completeness score with guidance:       │
│  - "Add ATOL to increase trust"          │
│  - "Upload logo for brand visibility"    │
└──────────────────────────────────────────┘
```

### Key files per screen (operator)

| Screen              | Route file                                | Component(s)               | Status                                 |
| ------------------- | ----------------------------------------- | -------------------------- | -------------------------------------- |
| Onboarding form     | `app/operator/onboarding/page.tsx`        | `OperatorRegistrationForm` | DONE                                   |
| Verification status | `app/operator/onboarding/status/page.tsx` | `VerificationStatus`       | DONE                                   |
| Dashboard home      | `app/operator/dashboard/page.tsx`         | `OperatorDashboard`        | DONE                                   |
| Package list        | `app/operator/packages/page.tsx`          | `OperatorPackagesList`     | DONE                                   |
| Package wizard      | `app/operator/packages/page.tsx`          | `PackageWizard`            | PARTIAL — implemented in-page; operator E2E failing |
| Leads/enquiries     | `app/operator/leads/page.tsx`             | `LeadsList`, `OfferForm`   | DONE                                   |
| Analytics           | `app/operator/analytics/page.tsx`         | `AnalyticsDashboard`       | PARTIAL — 3 basic stat cards           |
| Profile             | `app/operator/profile/page.tsx`           | `OperatorProfileForm`      | DONE                                   |

---

## 4. Shared layout for operator pages

Operator pages use the shared `app/operator/layout.tsx` wrapper with sidebar navigation.

### Target: `app/operator/layout.tsx`

```
┌─────────────────────────────────────────────────────┐
│ ┌──── Sidebar (240px) ────┐ ┌── Main content ─────┐│
│ │ PilgrimCompare Logo          │ │                      ││
│ │                         │ │  Page-specific       ││
│ │ Dashboard          [●]  │ │  content renders     ││
│ │ My Packages        [ ]  │ │  here via {children} ││
│ │ Leads              [ ]  │ │                      ││
│ │ Analytics          [ ]  │ │                      ││
│ │ Profile            [ ]  │ │                      ││
│ │                         │ │                      ││
│ │ ─────────────────────── │ │                      ││
│ │ Company: Al-Hidayah     │ │                      ││
│ │ Status: Verified ✓      │ │                      ││
│ └─────────────────────────┘ └──────────────────────┘│
│                                                     │
│ Mobile: hamburger menu → slide-out sidebar          │
└─────────────────────────────────────────────────────┘
```

### Current files

- `app/operator/layout.tsx` — shared layout wrapping all `/operator/*` routes.
- `components/operator/OperatorSidebar.tsx` — sidebar nav component.
- Mobile navigation is handled inside the sidebar/layout implementation; there is no separate `OperatorMobileNav.tsx` file.

---

## 5. Data flow

```
                        ┌─────────────┐
                        │  localStorage│
                        │  (MockDB)   │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │   MockDB    │  Raw read/write
                        │  (mock-db)  │  No auth checks
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │ Repository  │  RBAC enforcement
                        │             │  Validates ctx.role + ctx.userId
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
      ┌───────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
      │ Page (Server) │ │ Component   │ │ API Route    │
      │ or Client     │ │ (Client)    │ │ (if needed)  │
      └───────────────┘ └─────────────┘ └──────────────┘
```

### Rule: All data access goes through Repository

Components must **never** call `MockDB` directly (except `MockDB.setCurrentUser` for simulation). All reads and writes go through `Repository` with a `RequestContext`.

---

## 6. Current remaining work (summary)

| #   | Feature                                  | Area                          | Current state |
| --- | ---------------------------------------- | ----------------------------- | ------------- |
| 1   | Operator package E2E                     | `/operator/packages`          | Failing: route redirects to `/` in Chromium test run |
| 2   | Playwright browser setup                 | local E2E                     | Firefox/WebKit binaries missing locally |
| 3   | Package wizard persistence wiring        | `/operator/packages`          | Wizard is implemented in-page; newly-created packages are held in page state |
| 4   | SEO structured-data helper consolidation | public pages                  | JSON-LD renders, but helper usage is inconsistent |
| 5   | Validation utility functions             | `lib/validation.ts`           | Zod schemas exist; queue-requested utility validators are missing |
| 6   | Enhanced analytics                       | `/operator/analytics`         | Partial: basic stat cards only |

See `docs/EXECUTION_QUEUE.md` for the exact build order with specs for each task.
