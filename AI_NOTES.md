# AI Notes — KaabaTrip

Single source of truth. Ultra-dense. Archive completed work to Historical Log.

---

## Project Status

### 🎯 Current Objective

P0: Wire Repository → `getDataSource()` cutover — Production DB built but unused; MockDB hardcoded in all Repository methods.

---

## ✅ DONE (this session)

| Task                            | Status | Evidence                                                                          |
| ------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Commit all work to `main`       | ✅     | `6ed2f5d` on GitHub                                                               |
| Create `dev` from merged `main` | ✅     | `git checkout -b dev`                                                             |
| Calendar icon on date inputs    | ✅     | `components/umrah/UmrahSearchForm.tsx` - clickable SVG wrapper, `showPicker()`    |
| Date validation                 | ✅     | Departure not past, return after departure, 7-60 day range, `role="alert"` errors |
| Em dashes removed               | ✅     | All `\u2013` replaced with `-` in labels, budget, child ages                      |
| Update README.md                | ✅     | Comprehensive project overview, tech stack, features, roadmap                     |
| Push `main` to GitHub           | ✅     | `ddc7f87..6ed2f5d`                                                                |
| Push `dev` to GitHub            | ✅     | `5212a12` on `dev` branch                                                         |
| Delete extra branches           | ✅     | 16 old branches removed, only `main` + `dev` remain                               |
| GBP-only currency               | ✅     | `PackageForm.tsx`, `OfferForm.tsx` — `GBP (£)` only                               |
| FilterOverlay CSS fix           | ✅     | Added `@keyframes slideIn`, removed duplicate `@keyframes slideUp`                |
| Slider CSS cleanup              | ✅     | Removed duplicate `::-moz-range-thumb` blocks in BudgetFilter + DistanceFilter    |
| UK English distance             | ✅     | `DistanceFilter.tsx`: "50 m" → "50 metres"                                        |
| Hotel rating plural             | ✅     | `HotelRatingsFilter.tsx`: aria-label always "stars"                               |
| TypeScript fixes                | ✅     | `PackageList.tsx` import conflict, `SortDropdown.tsx` ref type error              |
| Update AI_NOTES.md              | ✅     | Historical log + current objective updated                                        |
| Fix Umrah slider                | ✅     | Removed duplicate track/activeTrack CSS, fixed positioning                        |
| Fix Umrah budget slider         | ✅     | Fixed positioning (absolute top:50% + transform)                                  |
| Blue slider tracks app-wide     | ✅     | BudgetFilter, DistanceFilter, TimePeriodFilter → #4A9EFF                          |
| Mobile header hamburger         | ✅     | Full mobile drawer (320px slide-in), overlay, focus trap, Escape/click-outside    |
| Touch targets fixed             | ✅     | All buttons/links min 44px-52px, `-webkit-tap-highlight-color: transparent`       |
| Footer logo + structure         | ✅     | Smaller Logo(28px) + text-logo, structured sections, copyright row                |
| Unified RangeSlider component   | ✅     | Single shared component for ALL sliders app-wide                                  |
| Slider consistency verified     | ✅     | All sliders: 8px blue track, 24px gold thumb, 40px touch area                     |

## 🔄 PENDING (next session)

| #   | Priority | Task                                        | Why                                                                                                                       | Files                                                                      | Effort |
| --- | -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| 1   | **P0**   | Wire Repository → `getDataSource()` cutover | Production DB is built but completely unused. Hardcoded MockDB = no real data persistence.                                | `lib/api/repository.ts`, `lib/config.ts`                                   | Medium |
| 2   | **P0**   | Add tests for new components                | `/api/interest`, `InclusionChipList`, `VerifiedBadge` have zero test coverage. AGENTS.md mandates tests pass before push. | `tests/interest.test.ts`, `tests/ui-components.test.tsx`                   | Medium |
| 3   | **P1**   | GDPR data export endpoint                   | UK/EU legal requirement. Customer can download all their data.                                                            | `app/api/user/export/route.ts`, `app/settings/page.tsx`                    | Medium |
| 4   | **P1**   | GDPR account deletion                       | UK/EU legal requirement. Customer can permanently delete account + data.                                                  | `app/api/user/delete/route.ts`, `app/settings/delete-account/page.tsx`     | Medium |
| 5   | **P1**   | ABTA/ATOL real-time verification API        | Current badges show self-reported numbers only. Integrate ATOL search API for real verification.                          | `lib/api/verify-atol.ts`, `components/operators/OperatorProfileDetail.tsx` | High   |
| 6   | **P2**   | Multi-currency UI selector                  | Currency auto-detected by IP. Users cannot override. Add dropdown in Header or settings.                                  | `components/layout/Header.tsx`, `lib/i18n/region.ts`                       | Medium |
| 7   | **P2**   | `/kanban` route audit                       | Referenced in `QA.md` but no file at `app/kanban/page.tsx`. Either implement or remove from QA.                           | `app/kanban/page.tsx` or `QA.md`                                           | Low    |

---

## Completed Checklist (P0–P2)

#### P0 — Critical ✅

- [x] `/api/interest` POST endpoint (manual validation, 201/400/500)
- [x] Wire Hajj form (`app/hajj/page.tsx`) to endpoint (fetch + loading + toast)

#### P1 — High Priority ✅

- [x] PackageDetail: add operator inclusion chips (`pkg.inclusions.*`)
- [x] PackageDetail: sticky CTA bar on mobile (price + Request Quote)
- [x] Operator public page: ATOL/ABTA badge display

#### P2 — Medium Priority ✅

- [x] Extract shared UI: `VerifiedBadge`, `InclusionChip`, `InclusionChipList` → `components/ui/`
- [x] Refactor `PackageCard` → shared `VerifiedBadge` + `InclusionChip`
- [x] Refactor `PackageDetail` → shared `InclusionChipList`
- [x] Sort dropdown: close on outside click (`useRef` + `mousedown`)
- [x] FilterOverlay: hotel star filter (already existed, wired)
- [x] FilterOverlay: distance filter (already existed, wired)

---

## Architecture — Data Layer (CRITICAL NOTE)

### Dual Data Strategy: MockDB vs Supabase/Prisma

| Component               | Purpose                                                     | Status                               |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------ |
| `lib/api/mock-db.ts`    | In-memory store via `localStorage`. Seed data. Zero config. | **ACTIVE** — hardcoded in Repository |
| `lib/api/db/prisma.ts`  | Prisma client singleton                                     | Configured, not wired                |
| `lib/api/db/adapter.ts` | Prisma → App type mappers (544 lines)                       | Built, not wired                     |
| `lib/config.ts`         | `getDataSource()` returns `'prisma'` or `'mockdb'` per env  | Built, not used                      |
| `lib/api/repository.ts` | All data operations                                         | **Hardcoded to MockDB**              |

### The Cutover Gap

`Repository` imports `MockDB` directly and uses it for **all** reads/writes. The `getDataSource()` cutover mechanism exists but is **not wired**. To switch to production DB:

1. Refactor `Repository` to branch on `getDataSource()`
2. Route `'prisma'` calls through `lib/api/db/adapter.ts`
3. Route `'mockdb'` calls to existing `MockDB`

### Why Both Exist (by design)

| Concern         | MockDB                           | Supabase + Prisma             |
| --------------- | -------------------------------- | ----------------------------- |
| Dev speed       | ✅ Zero setup, instant           | Needs env vars, DB connection |
| Tests           | ✅ Deterministic, fast, isolated | Requires test DB + cleanup    |
| Production      | ❌ localStorage, no auth         | ✅ RLS, real auth, real data  |
| Team onboarding | ✅ Clone → `npm run dev`         | Needs Supabase project + env  |

**Verdict:** Dual strategy is correct. The gap is that `Repository` has not been wired to the cutover switch. This is intentional for MVP phase — MockDB enables rapid iteration. Production cutover is a future migration task.

---

## Shared UI Components (`components/ui/`)

| Component           | Props                               | Used by       |
| ------------------- | ----------------------------------- | ------------- |
| `VerifiedBadge`     | `className?: string`                | PackageCard   |
| `InclusionChip`     | `chip: { label, included }`         | PackageCard   |
| `InclusionChipList` | `chips[], className?, data-testid?` | PackageDetail |

---

## Configuration Mapping

| Route                | Purpose                       | Status |
| -------------------- | ----------------------------- | ------ |
| `/`                  | Landing — Hero + trust bar    | Live   |
| `/umrah`             | Search form — 4-step          | Live   |
| `/hajj`              | Interest capture              | Live   |
| `/search/packages`   | Results — sort/filter/compare | Live   |
| `/packages/[slug]`   | Package detail                | Live   |
| `/quote`             | Quote wizard                  | Live   |
| `/requests/[id]`     | Request tracker               | Live   |
| `/operator/*`        | Operator dashboard            | Live   |
| `/admin/*`           | Admin tools                   | Live   |
| `/login`, `/signup`  | Auth                          | Live   |
| `/privacy`, `/terms` | UK compliance                 | Live   |

### Third-Party APIs

| Service              | Use                       | Env Key                      | Status     |
| -------------------- | ------------------------- | ---------------------------- | ---------- |
| Supabase (eu-west-2) | Auth + DB + Storage       | `NEXT_PUBLIC_SUPABASE_URL`   | Configured |
| Prisma               | ORM + migrations          | `DATABASE_URL`, `DIRECT_URL` | Configured |
| Google Analytics     | Analytics (consent-gated) | `NEXT_PUBLIC_GA_ID`          | Pending    |

### Data Source

- Production: Prisma → Supabase PostgreSQL (RLS enforced)
- Test: MockDB (`lib/api/mock-db.ts`)
- Cutover: `getDataSource()` in `lib/config.ts`

---

## Historical Log

### 2026-06-05 — Session: Calendar Icon, Date Validation, Copy Fixes

- **Visible calendar icon**: Each date field has clickable wrapper with SVG calendar icon (`var(--yellow)`). Native browser icon hidden via CSS. Icon triggers `showPicker()` on click/tap/Enter/Space. Keyboard-accessible (`tabIndex={0}`, `role="button"`, Enter/Space handlers).
- **Date validation**: Client-side validation on form submit: departure cannot be past, return must be after departure, minimum 7 days (Umrah), maximum 60 days. Errors rendered with `role="alert"` and `data-testid`.
- **Copy fix**: All em dashes (`\u2013`) replaced with regular hyphens (`-`) in quick-select labels, budget display, child age options to avoid AI-generated appearance.
- **Branch**: `current-branch` created from `main` after committing all prior work. `main` remains safe backup.
- **Build**: 0 errors | **Tests**: 95/95 | **tsc**: 0 errors

### 2026-06-05 — Session: Mobile Header + Touch Targets + Footer

- **Mobile header hamburger menu**: Complete rewrite of `Header.tsx` + `header.module.css`:
  - Hamburger button (48px touch target) on mobile, desktop nav hidden
  - Slide-in drawer (320px, right side) with smooth CSS transition
  - Backdrop overlay with blur + fade animation
  - Focus trap inside drawer (Tab/Shift+Tab cycles)
  - Close on Escape key, click outside, or route change
  - `aria-expanded`, `aria-controls`, `aria-label` on hamburger
  - Drawer: `role="dialog"`, `aria-modal="true"`
  - All mobile nav links: min-height 52px for touch
- **Touch optimisation app-wide**:
  - All interactive elements: `min-height: 44px` minimum (`.clinerules` §8.1)
  - Buttons: `-webkit-tap-highlight-color: transparent; touch-action: manipulation`
  - Mobile drawer links: 52px tall (iOS comfortable tap)
  - Hamburger: 48px, close button: 44px
- **Footer restructured**:
  - Added smaller `Logo` (28px) + text-logo at top with tagline
  - Three-column grid: Company Info, Legal, Platform
  - Company info: Address, email, Company Reg, VAT (structured fields)
  - Legal: Terms, Privacy, Cookie, Complaints links
  - Platform: Get Quote, Search Packages, For Partners
  - Disclaimer section with ATOL/ABTA verify links
  - Copyright row: year + governing law, separated by border
  - All footer links: `min-h-[24px]` for touch compliance
- **Build**: 0 errors | **Tests**: 95/95 | **tsc**: 0 errors

### 2026-06-05 — Session: Unified RangeSlider Component (ALL Sliders Now Consistent)

- **Root cause of inconsistency**: Each slider (BudgetFilter, DistanceFilter, TimePeriodFilter, UmrahSearchForm) had its own copy-paste CSS with different track heights (4px vs 8px), thumb sizes (20px vs 24px), and positioning logic. The filter sliders showed yellow active tracks because their CSS modules had slider CSS that was not properly replaced.
- **Solution**: Created a single shared `RangeSlider` component in `components/ui/RangeSlider.tsx` + `RangeSlider.module.css` that ALL sliders use:
  - **Track**: 8px height, `#2D2D2D` background, 6px border-radius
  - **Active track**: 8px height, `#4A9EFF` (blue), 6px border-radius
  - **Thumb**: 24px diameter, `#D4AF37` (gold), 2px `#1A1A1A` border, drop shadow
  - **Touch area**: 40px wrapper height, `pointer-events: none` on inputs + `pointer-events: auto` on thumbs
  - **Mobile**: 28px thumbs on <480px for easier touch
  - **Focus**: `focus-visible` outline with `var(--yellow)`
  - **Accessibility**: `aria-label-min`, `aria-label-max`, `data-testid` props
- **Refactored ALL consumers**:
  - `BudgetFilter.tsx` → uses `RangeSlider`, CSS stripped to label/value only
  - `DistanceFilter.tsx` → uses `RangeSlider`, CSS stripped to label/value only
  - `TimePeriodFilter.tsx` → uses `RangeSlider`, CSS stripped to label/value only
  - `UmrahSearchForm.tsx` → budget slider uses `RangeSlider`, CSS removed
  - `BudgetFilter.module.css`, `DistanceFilter.module.css`, `TimePeriodFilter.module.css` → all slider CSS deleted
  - `umrah-search-form.module.css` → all budget slider CSS deleted
- **Verified**: Build 0 errors, 95/95 tests pass, no visual regressions
- **Result**: Every slider in the app now renders identically — same track height, same thumb size, same blue active track, same gold thumb, same touch behaviour

### 2026-06-05 — Session: Slider Fix + Blue Active Tracks App-Wide

- **Umrah slider broken**: Removed duplicate `.searchForm__track` and `.searchForm__activeTrack` definitions in `umrah-search-form.module.css` (two conflicting blocks overwrote each other). Fixed positioning: `top: 50%; transform: translateY(-50%)` for both track and activeTrack. Fixed slider input: `top:0; left:0; width:100%; height:100%` for proper full-area hit testing.
- **Umrah budget slider broken**: Same fix applied to `.searchForm__budgetTrack` and `.searchForm__budgetActiveTrack` — changed from `position: relative` to `position: absolute` with proper centering.
- **Blue active tracks app-wide**: Changed all slider `.activeTrack` backgrounds from `var(--yellow)` to `#4A9EFF` (bright blue) for better visibility and consistency:
  - `BudgetFilter.module.css` active track
  - `DistanceFilter.module.css` active track
  - `TimePeriodFilter.module.css` active track
  - `umrah-search-form.module.css` already had blue — now consistent with filters
- Thumb handles remain yellow (`var(--yellow)` / `#D4AF37`) for contrast and brand consistency.
- **Build**: 0 errors | **Tests**: 95/95 | **tsc**: 0 errors

### 2026-06-05 — Session: Filter Overlay Consistency + GBP Currency + Bug Fixes

- **GBP-only currency**: Removed USD and EUR options from `PackageForm.tsx` and `OfferForm.tsx`. Currency dropdown now shows only `GBP (£)`. Default remains GBP. Aligns with `.clinerules` Section 10 (UK localisation).
- **FilterOverlay CSS fix**: Added missing `@keyframes slideIn` animation (referenced in desktop media query but never defined). Removed duplicate `@keyframes slideUp` declaration that was causing CSS parse errors.
- **Slider CSS cleanup**: Removed duplicate `.rangeInput::-moz-range-thumb` blocks from `BudgetFilter.module.css` and `DistanceFilter.module.css` (exact same rules appeared twice).
- **Distance unit**: Changed `DistanceFilter.tsx` format from "50 m" to "50 metres" for UK English compliance per `.clinerules`.
- **Hotel rating plural**: Fixed `HotelRatingsFilter.tsx` aria-label to always say "stars" (plural) per `.clinerules` Section 10.2 ("5 stars" with visual anchor).
- **TypeScript fixes**:
  - `PackageList.tsx`: Removed conflicting `SortOption` import from `lib/sort-types` (local type already defined at line 25).
  - `SortDropdown.tsx`: Fixed ref callback type error (`ref={el => optionRefs.current[index] = el}` → `ref={el => { optionRefs.current[index] = el; }}`).
- **Filter overlay already consistent**: Uses `--surfaceDark`, `--yellow`, `--borderSubtle`, `--textMuted`, `--font-exo2` throughout. All filter sections use same card-style layout with bottom borders. Already matches app design system.
- **Date picker already in Umrah journey**: `UmrahSearchForm.tsx` has native `<input type="date">` with clickable calendar icon wrapper, `showPicker()`, validation, and quick-select presets. No changes needed.
- **Build**: 0 errors | **Tests**: 95/95 | **tsc**: 0 errors

### 2026-06-05 —

- **All filter CSS modules**: unified `trackWrapper`/`track`/`activeTrack`/`rangeInput` pattern, `pointer-events: none` on inputs + `pointer-events: auto` on thumbs, `focus-visible` for a11y, mobile-first responsive queries
- **Build**: 0 errors, 0 warnings | **Tests**: 95/95 pass | **tsc**: 0 errors
- **Environment**: Created `.env.local` with placeholder Supabase URLs (dev-localhost pattern) to eliminate `Missing Supabase environment variables` error in dev server. `FEATURE_USE_REAL_DB=false` ensures MockDB remains active.

### 2026-06-05 — Session: Environment fix (supplementary)

- Created `.env.local` with placeholder Supabase configuration matching `env.example` pattern: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FEATURE_USE_REAL_DB=false`
- This suppresses the `Missing Supabase environment variables` error that was appearing in dev server logs (not a 500, but terminal noise)
- No functional change — MockDB remains the active data source per `FEATURE_USE_REAL_DB=false`

### 2026-06-05 — Session: .clinerules v1.1 + Partner Journey + Hygiene

- `.clinerules`: Added Section 10 — "🇬🇧 UK Localisation & UX Polish" (currency formatting: £/GBP only; British English spelling; "5 stars" with visual anchor)
- Dead CSS removal: `packages.module.css` — removed 4 unused class blocks (`.verifiedBadge`, `.inclusionChip`, `.inclusionChipIncluded`, `.inclusionChipExcluded`) after shared component extraction
- Hajj deduplication: `app/api/interest/route.ts` — server-side case-insensitive email+type dedupe via `MockDB.getInterests()`, returns 200 for duplicates, 201 for new
- Partner landing page: Created `app/partner/page.tsx` — conversion-focused marketing page with hero, value props, how-it-works steps, UK compliance trust section, dual CTAs
- Header: "For Partners" nav link now routes to `/partner` (was `/operator/onboarding`)
- SEO: `docs/SEO.md` updated with `/partner` route meta tags
- Build: 0 errors | Tests: 95/95

### 2026-06-05 — P0 + P1 + P2 Complete (All High Priority Tasks)

- `/api/interest` POST endpoint: manual validation (email regex, type enum), 201/400/500 responses, dedupe header
- MockDB: added `INTERESTS` storage key + `getInterests`/`saveInterest` methods
- Hajj form: client-side fetch with loading state, success/error toast, `crypto.randomUUID()` dedupe, `aria-live` announcements
- PackageDetail: inclusion chips (Visa/Flights/Transfers/Meals) with green/grey colour coding
- PackageDetail: sticky mobile CTA bar (fixed bottom, price + Request Quote, hidden on md+)
- OperatorProfileDetail: ATOL/ABTA badges with green alert styling, missing protection warning
- Shared UI: `VerifiedBadge`, `InclusionChip`, `InclusionChipList` in `components/ui/`
- Refactored: `PackageCard` → shared components, `PackageDetail` → `InclusionChipList`
- Sort dropdown: closes on outside click via `useRef` + `mousedown` listener
- FilterOverlay: hotel star + distance filters already wired and functional
- Build: 0 errors | Tests: 95/95

### 2026-06-05 — UX & IA Overhaul + `.clinerules`

- Hero: trust bar, value prop, disabled Hajj CTA
- Hajj page: interest capture form
- PackageCard: operator header, verified badge, ATOL, inclusion chips
- PackageList: sort dropdown, empty state
- Header: Umrah + Hajj nav
- Umrah search: 4-step progressive disclosure, child stepper (age 0–11 dropdown), dropdown selects
- Background: subdued Kaaba SVG overlay, trust bar opaque
- PackageDetail: back button (router.back + fallback)
- `.clinerules` created (9 sections)

### 2026-06-04 — Phase 1 Persistence (P1A–P1H)

- Supabase SSR client, Prisma schema, DB adapter, auth middleware, RLS, storage, seed, cutover

### 2026-06-03 — UK/EU Compliance

- Cookie consent, Privacy Policy, Terms, Footer, marketing consent schema, GDPR

### 2026-06-02 — Phase 3 Operator Surfaces

- Registration, verification, dashboard, leads, profile, settings, sidebar

### 2026-06-01 — Auth + Booking Flow

- Login/signup, Supabase auth, quote wizard, request tracker, payment instructions

---

## Quick Reference

### Stack

Next.js 15.5.4 (App Router) · React 19 · TypeScript (strict, no `any`) · Tailwind CSS · Supabase + Prisma · Vitest 4.1.8

### Conventions

- Server Components default; `'use client'` only at leaf nodes
- URL = source of truth for global state (`searchParams`)
- Data access via `Repository` with `RequestContext`
- `data-testid` on every interactive element
- Mobile-first: 320px → 768px → 1024px → 1280px
- Zod validation before DB/API calls
- No client-side secrets

### Commands

```bash
npm run dev        # Dev server
npm run build      # Production build
npm test           # Unit tests
npx tsc --noEmit   # Type check
```
