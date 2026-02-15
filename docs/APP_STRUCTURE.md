# App Structure & User Journeys

Complete map of every screen, route, and user flow in the KaabaTrip application. This is the source of truth for what exists and what needs to be built.

**Legend:** `[DONE]` = built and working, `[PARTIAL]` = shell exists but incomplete, `[TODO]` = not yet started.

---

## 1. Two-sided architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          KaabaTrip                                  │
│                                                                     │
│  PUBLIC SIDE (travellers)          OPERATOR SIDE (travel agents)     │
│  ─────────────────────────        ──────────────────────────────    │
│  /                   [DONE]        /operator/onboarding     [TODO]  │
│  /umrah              [DONE]        /operator/dashboard       [PARTIAL]│
│  /hajj               [DONE]        /operator/packages        [PARTIAL]│
│  /umrah/ramadan      [DONE]        /operator/packages/new    [TODO]  │
│  /search/packages    [DONE]        /operator/leads           [TODO]  │
│  /packages           [DONE]        /operator/analytics       [PARTIAL]│
│  /packages/[slug]    [DONE]        /operator/profile         [TODO]  │
│  /operators/[slug]   [DONE]        /operator/settings        [TODO]  │
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

| Screen | Route file | Component(s) |
|--------|-----------|--------------|
| Landing | `app/page.tsx` | `Header`, `Hero` |
| Umrah search | `app/umrah/page.tsx` | `UmrahSearchForm` |
| Hajj search | `app/hajj/page.tsx` | — (placeholder) |
| Search results | `app/search/packages/page.tsx` | `PackageList`, `PackageCard`, `FilterOverlay`, `ComparisonTable` |
| Package detail | `app/packages/[slug]/page.tsx` | `PackageDetail` |
| Operator profile | `app/operators/[slug]/page.tsx` | `OperatorProfileDetail` |
| Quote wizard | `app/quote/page.tsx` | `QuoteRequestWizard`, Steps 1-5 |
| Request detail | `app/requests/[id]/page.tsx` | `RequestDetail` |

---

## 3. Operator side — Partner journey

### Journey map

```
START (operator visits site)
  │
  ▼
┌──────────────────────────────┐
│  /operator/onboarding  [TODO]│  Registration form
│                              │  Fields: company name, reg #, ATOL, ABTA,
│                              │    contact email, phone, address, serving
│                              │    regions, departure airports, logo
│                              │  CTA: [Submit for Verification]
└──────────┬───────────────────┘
           │ submitted → status: 'pending'
           ▼
┌──────────────────────────────────────┐
│  /operator/onboarding/status  [TODO] │  Verification waiting screen
│                                      │  "We're reviewing your application"
│                                      │  "Create draft packages while you wait"
│                                      │  CTA: [Go to Dashboard]
└──────────┬───────────────────────────┘
           │ (verification approved or navigates)
           ▼
┌──────────────────────────────────────────┐
│  /operator/dashboard  [PARTIAL]          │  HOME for operators
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
│  /operator/packages  [PARTIAL]           │
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
│  /operator/packages/new  [TODO]          │
│  (or overlay on /operator/packages)      │
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
│  /operator/leads  [TODO]                 │
│  (currently: /operator/dashboard shows   │
│   these inline — needs dedicated page)   │
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
│  /operator/profile  [TODO]               │
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

| Screen | Route file | Component(s) | Status |
|--------|-----------|--------------|--------|
| Onboarding form | `app/operator/onboarding/page.tsx` | `OperatorRegistrationForm` | TODO |
| Verification status | `app/operator/onboarding/status/page.tsx` | `VerificationStatus` | TODO |
| Dashboard home | `app/operator/dashboard/page.tsx` | `OperatorDashboard` | PARTIAL — needs layout, stats, activity feed |
| Package list | `app/operator/packages/page.tsx` | `OperatorPackagesList` | PARTIAL — empty props, no real data |
| Package wizard | `app/operator/packages/new/page.tsx` | `PackageWizard` | TODO — currently `PackageForm` is flat |
| Leads/enquiries | `app/operator/leads/page.tsx` | `LeadsList`, `OfferForm` | TODO — currently inline in dashboard |
| Analytics | `app/operator/analytics/page.tsx` | `AnalyticsDashboard` | PARTIAL — 3 basic stat cards |
| Profile | `app/operator/profile/page.tsx` | `OperatorProfileForm` | TODO |

---

## 4. Shared layout for operator pages

Currently each operator page is standalone. They need a shared layout with sidebar navigation.

### Target: `app/operator/layout.tsx`

```
┌─────────────────────────────────────────────────────┐
│ ┌──── Sidebar (240px) ────┐ ┌── Main content ─────┐│
│ │ KaabaTrip Logo          │ │                      ││
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

### Files to create

- `app/operator/layout.tsx` — shared layout wrapping all `/operator/*` routes.
- `components/operator/OperatorSidebar.tsx` — sidebar nav component.
- `components/operator/OperatorMobileNav.tsx` — mobile hamburger + slide-out.

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

## 6. What needs to be built (summary)

### Must-have (MVP for merge to main-v2)

| # | Feature | Route | Est. complexity |
|---|---------|-------|----------------|
| 1 | Operator layout (sidebar) | `app/operator/layout.tsx` | Small |
| 2 | Evolve types (OperatorProfile + Package) | `lib/types.ts` | Small |
| 3 | Update MockDB seed data | `lib/api/mock-db.ts` | Small |
| 4 | Operator registration form | `/operator/onboarding` | Medium |
| 5 | Verification status screen | `/operator/onboarding/status` | Small |
| 6 | Dashboard home (enhanced) | `/operator/dashboard` | Medium |
| 7 | Package list (wired to real data) | `/operator/packages` | Medium |
| 8 | Package creation wizard | `/operator/packages/new` | Large |
| 9 | Leads page | `/operator/leads` | Medium |
| 10 | Operator profile editor | `/operator/profile` | Medium |

### Nice-to-have (post-MVP)

| # | Feature | Route | Est. complexity |
|---|---------|-------|----------------|
| 11 | Enhanced analytics | `/operator/analytics` | Medium |
| 12 | Package cards with operator info | `/search/packages` | Small |
| 13 | SEO structured data (JSON-LD) | All public pages | Medium |
| 14 | Public operator profile enhanced | `/operators/[slug]` | Small |
| 15 | Package completeness scoring | operator dashboard | Small |

See `docs/EXECUTION_QUEUE.md` for the exact build order with specs for each task.
