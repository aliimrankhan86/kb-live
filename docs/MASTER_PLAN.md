# KaabaTrip — Master Architecture & Execution Plan

**Author:** Opus Architect session, 2026-02-04
**Branch:** `main-v2-UI` (commit `d9386b1`)
**Status:** Planning only. No code changes in this deliverable.

---

## A) Business Framing

### Problem statement

Umrah/Hajj travellers cannot easily compare packages across operators. Data is inconsistent (different formats, unclear inclusions, varying price structures). They lose track of options between sessions. Operators have no standard way to present their packages online or track interest.

### Target user personas

**Traveller (primary buyer)**
- UK-based Muslim family planning Umrah or Hajj
- Browses on mobile (60%+ expected traffic)
- Wants: clear pricing, hotel proximity to Haram, transparent inclusions, ability to save and compare 2-3 options side-by-side
- Pain: packages presented as PDFs/WhatsApp messages with different formats; hard to remember what was good; mobile experience broken on most agent sites

**Operator/Travel Agent (supply side)**
- Small-to-medium Umrah/Hajj operator, 1-20 staff
- Has packages in brochure/spreadsheet format
- Wants: simple way to list packages, see who's interested, respond to leads
- Pain: no standard submission format; no visibility into what converts; manual follow-up

### Why shortlist/compare matter

These are the core differentiator. Without comparison, KaabaTrip is just another listing site. The shortlist persists across sessions (localStorage), ensuring users don't lose their research. Compare (2-3 items, structured table) is the moment of clarity that drives booking intent.

### What "good" looks like for this milestone

**Catalogue Lite + Booking Intent (current milestone):**
1. Traveller submits preferences → sees matching packages → shortlists → compares → expresses booking intent
2. Operator can list packages with standard fields → packages appear in search → operator sees leads
3. No payment. Success = qualified lead captured with package context attached.

### Vision milestones

| Milestone | Scope | Metric |
|-----------|-------|--------|
| **Now: Catalogue Lite** | Public search + shortlist + compare + booking intent capture | Lead form submitted with package context |
| **Next: Operator MVP** | Onboarding + package CRUD + lead inbox + basic analytics | Operators self-serve package listing |
| **Then: Marketplace V1** | Auth, promoted listings, multi-currency, operator verification | Revenue from promoted placement |
| **Later: Payments** | Booking deposits, operator payouts, refund policy | Transactions processed |

---

## B) Technical Framing

### Current stack

- **Framework:** Next.js 15.5.3 (App Router only, no `pages/`)
- **React:** 19.1.0
- **Styling:** Tailwind CSS v4 + CSS Modules
- **State:** Zustand (store exists for kanban), React useState, localStorage for persistence
- **Data:** MockDB (localStorage-backed, no real backend)
- **Testing:** Vitest (17 unit tests), Playwright (3 E2E specs)
- **Types:** TypeScript strict mode

### Pages in scope (current milestone)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing, Hero CTAs | Working, responsive |
| `/umrah` | Search preferences form | Working, responsive |
| `/search/packages` | Results + shortlist + compare | Working, responsive |
| `/packages/[slug]` | Package detail | Exists, basic |
| `/operator/dashboard` | Quote request inbox | Exists, basic |
| `/operator/packages` | Package CRUD | Shell only (empty props) |
| `/operator/analytics` | Stats dashboard | Exists, basic |

### Non-negotiables (invariants)

1. **Shortlist:** localStorage key `kb_shortlist_packages`, array of string IDs, always de-dupe
2. **Compare:** `handleComparisonSelection` from `lib/comparison.ts`, max 3, modal must render `[data-testid="comparison-table"]`
3. **Routes:** Do not rename `/`, `/umrah`, `/search/packages`, `/packages/[slug]`
4. **Query params:** `type`, `season`, `budgetMin`, `budgetMax`, `adults` — do not rename
5. **Error boundaries:** Keep `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`
6. **E2E selectors:** All `data-testid` attributes are contracts — do not rename without updating tests

### Architecture issues found (prioritised)

**Critical (fix before new features):**
1. **Dual `Package` type:** `lib/types.ts` exports `Package` (catalogue shape) and `lib/mock-packages.ts` exports `Package` (display shape). Search page imports both with aliases. This causes confusion and will cause bugs as more code references "Package".
2. **No auth layer:** `MockDB.currentUser` is global mutable state. `PackageForm` hardcodes `userId: 'op1'`. Any operator route is fully open.
3. **Operator packages page is empty shell:** passes `packages={[]}` and no-op handlers.

**High (fix in parallel with features):**
4. **FilterOverlay stores state but doesn't filter:** `handleFilterApply` saves to `appliedFilters` state but never applies to the displayed list.
5. **Sort button is a no-op:** `onSort?.()` with no implementation.
6. **MockDB imported directly in UI components:** `PackageList.tsx` and `ComparisonTable.tsx` call `MockDB.getOperators()` directly. Should go through Repository.

**Medium (fix during cleanup passes):**
7. **`mounted` state anti-pattern:** `search/packages/page.tsx` defers rendering until `useEffect` fires, causing flash of empty content.
8. **No `React.memo` on PackageCard:** Re-renders entire list when any state changes.
9. **`handleOfferSelection` and `handleComparisonSelection` are identical functions** in `lib/comparison.ts`.

### Stability risks + prevention

| Risk | Cause | Prevention |
|------|-------|------------|
| Chunk 404s in dev | Stale `.next` after HMR failures | Use `npm run dev:clean` when it happens; already scripted |
| Blank screen after pull | Browser cached old chunks | Hard refresh (Cmd+Shift+R) after `dev:clean` |
| Build failures from type collision | Two `Package` types | Rename mock-packages `Package` to `SearchPackageDisplay` (micro-task below) |
| State lost on refresh | localStorage-only persistence | Known limitation of MockDB; acceptable for MVP |
| Operator data visible to all | No auth middleware | Must add before any real operator data exists |

### Architecture direction for two-sided marketplace

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
│                                                          │
│  PUBLIC SIDE                    OPERATOR SIDE             │
│  ┌──────────────────┐          ┌──────────────────┐      │
│  │ /                │          │ /operator/*       │      │
│  │ /umrah           │          │   /dashboard      │      │
│  │ /search/packages │          │   /packages       │      │
│  │ /packages/[slug] │          │   /analytics      │      │
│  │ /quote           │          │   /onboarding     │      │
│  └────────┬─────────┘          └────────┬─────────┘      │
│           │                             │                 │
│           ▼                             ▼                 │
│  ┌─────────────────────────────────────────────┐         │
│  │            lib/api/repository.ts             │         │
│  │     (RBAC-aware data access layer)           │         │
│  └──────────────────┬──────────────────────────┘         │
│                     │                                     │
│                     ▼                                     │
│  ┌─────────────────────────────────────────────┐         │
│  │    lib/api/mock-db.ts  →  future: API/DB    │         │
│  └─────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- UI components never import `MockDB` directly. Always go through `Repository`.
- Repository enforces RBAC via `RequestContext`.
- When we replace MockDB with a real API, only `lib/api/` changes. Everything else stays the same.
- Public routes use `Repository.listPackages()` (no auth needed).
- Operator routes require a `RequestContext` with `role: 'operator'`.

---

## C) Execution Plan — Public Flow (8 micro-tasks)

Each task is independently committable. Run `npm run test` after each. Run `npm run build` after completing all.

### C1. Rename `Package` type collision

**Goal:** Eliminate the confusing dual `Package` type that will cause bugs.

**Files:**
- `lib/mock-packages.ts` — Rename `export interface Package` to `export interface SearchPackageDisplay`
- `components/search/PackageCard.tsx` — Update import
- `components/search/PackageList.tsx` — Remove redundant `SearchPackageDisplay` re-export, use imported one
- `app/search/packages/page.tsx` — Update import alias

**Verification:**
```bash
npm run test
npm run build
```

**Rollback:** Revert the 4 files. Pure rename, no behaviour change.

---

### C2. Route operators through Repository (remove direct MockDB imports from UI)

**Goal:** UI components should not import MockDB. This is the single most important architectural fix before adding features.

**Files:**
- `lib/api/repository.ts` — Add `getOperators(): OperatorProfile[]` and `getOperatorById(id: string): OperatorProfile | undefined` as public-read methods
- `components/search/PackageList.tsx` — Replace `MockDB.getOperators()` with `Repository.getOperators()`; remove MockDB import
- `components/request/ComparisonTable.tsx` — Replace `MockDB.getOperators()` with `Repository.getOperators()`; remove MockDB import
- `components/operator/OperatorDashboard.tsx` — Replace `MockDB` calls with Repository calls (needs operator context)

**Verification:**
```bash
npm run test
# Manual: open /search/packages — compare modal still shows operator names
# Manual: open /operator/dashboard — still lists requests
```

**Rollback:** Revert 4 files. Behaviour unchanged — only import path changed.

---

### C3. Wire filter overlay to actually filter displayed packages

**Goal:** The FilterOverlay already captures user selections (budget range, hotel rating, distance, flight type, time period) and stores them in `appliedFilters` state. Currently this state is never used to filter the displayed list.

**Files:**
- `components/search/PackageList.tsx` — Apply `appliedFilters` to `listPackages` computation (filter by budget, hotel stars, distance band matching the FilterState shape)
- `components/search/FilterOverlay.tsx` — Verify `onApply` callback sends correct shape (read-only, likely already correct)

**Verification:**
```bash
npm run test
# Manual: /search/packages → open filter → set budget range → apply → list should shrink
# Manual: reset filter → list restores
```

**Rollback:** Revert PackageList.tsx. Filter UI still opens/closes, just doesn't affect list.

---

### C4. Wire sort button

**Goal:** Sort button currently does nothing. Add sort by price (low→high, high→low) and sort by hotel rating.

**Files:**
- `components/search/PackageList.tsx` — Add `sortMode` state (`'price-asc' | 'price-desc' | 'rating-desc' | null`), cycle on sort button click, apply to `listPackages`

**Verification:**
```bash
npm run test
# Manual: /search/packages → click Sort → packages reorder by price
```

**Rollback:** Revert PackageList.tsx. Sort button returns to no-op.

---

### C5. Add booking intent capture to package detail

**Goal:** On `/packages/[slug]`, the "Request Quote" CTA should capture a booking intent (name, email, phone, notes) and store it via Repository.

**Files:**
- `app/packages/[slug]/page.tsx` — Add booking intent form (or modal)
- `components/packages/PackageDetail.tsx` — Wire CTA to open form
- `lib/api/repository.ts` — Ensure `createBookingIntent` works for package-based intents (currently only offer-based)
- `lib/types.ts` — Add optional `packageId` to `BookingIntent`

**Verification:**
```bash
npm run test
npm run build
# Manual: /packages/[any-slug] → click CTA → fill form → submit → verify in localStorage
```

**Rollback:** Revert 4 files. CTA remains visible but non-functional (current state).

---

### C6. Add E2E test for search flow (shortlist + compare)

**Goal:** The search flow (`/umrah` → `/search/packages`) has no E2E coverage. The existing E2E tests cover `/packages` (catalogue) and `/quote` (quote flow), but not the main user path.

**Files:**
- `e2e/search-flow.spec.ts` (new file)

**Test steps:**
1. Go to `/umrah`
2. Fill form (type umrah, flexible dates, budget 500-2000)
3. Submit → lands on `/search/packages?type=umrah&...`
4. Verify packages are displayed
5. Toggle shortlist on 2 packages → verify count updates
6. Toggle compare on 2 packages → verify Compare(2) button enables
7. Click Compare → verify `[data-testid="comparison-table"]` visible
8. Close modal

**Verification:**
```bash
npx playwright test e2e/search-flow.spec.ts
```

**Rollback:** Delete the file. No existing code changed.

---

### C7. Extract `useShortlist` hook

**Goal:** Shortlist logic (read from localStorage, de-dupe, persist, toggle) is inline in PackageList.tsx (~30 lines). Extract to a reusable hook.

**Files:**
- `lib/hooks/use-shortlist.ts` (new file) — `useShortlist()` returns `{ shortlistedIds, toggle, isShortlisted, count, loaded }`
- `components/search/PackageList.tsx` — Replace inline shortlist logic with hook

**Verification:**
```bash
npm run test
# Manual: /search/packages → shortlist still works, persists on refresh
```

**Rollback:** Revert PackageList.tsx, delete hook file.

---

### C8. Add `React.memo` to PackageCard + memoize callbacks

**Goal:** Prevent unnecessary re-renders. Every state change in PackageList (compare toggle, shortlist toggle, filter change) re-renders all cards.

**Files:**
- `components/search/PackageCard.tsx` — Wrap export in `React.memo`
- `components/search/PackageList.tsx` — Wrap `onToggleShortlist` and `onToggleCompare` in `useCallback`

**Verification:**
```bash
npm run test
npm run build
# Manual: /search/packages — should feel snappier with many packages
```

**Rollback:** Revert 2 files. Pure performance, no behaviour change.

---

## D) Operator/Agent Dashboard Plan

### D1. MVP feature set

| Feature | Priority | Route | Status |
|---------|----------|-------|--------|
| **Package CRUD** | P0 | `/operator/packages` | Shell exists, needs wiring |
| **Lead inbox** | P0 | `/operator/dashboard` | Quote requests display, needs booking intents |
| **Operator profile** | P1 | `/operator/onboarding` | Does not exist yet |
| **Basic analytics** | P2 | `/operator/analytics` | Component exists, needs data |

### D2. Package data model (canonical schema)

This is the `Package` interface from `lib/types.ts` — already well-designed. Here it is with field-level documentation:

```typescript
interface Package {
  // === Identity ===
  id: string;                    // UUID, auto-generated
  operatorId: string;            // Links to OperatorProfile.id (enforced by Repository)
  title: string;                 // REQUIRED. Human-readable name. Min 5 chars, max 120.
  slug: string;                  // Auto-generated from title + random suffix. URL-safe.
  status: 'draft' | 'published'; // Only 'published' packages appear in search.

  // === Classification ===
  pilgrimageType: 'umrah' | 'hajj';  // REQUIRED. Enum.
  seasonLabel?: string;               // Optional. Free text ("Ramadan", "Flexible", "School Holidays").
  dateWindow?: {                      // Optional. When this package is available.
    start: string;                    // ISO date (YYYY-MM-DD)
    end: string;                      // ISO date (YYYY-MM-DD)
  };

  // === Pricing ===
  priceType: 'exact' | 'from';  // REQUIRED. "From £750" vs "£750 exactly".
  pricePerPerson: number;        // REQUIRED. Positive integer. In smallest major unit (not pence).
  currency: string;              // REQUIRED. ISO 4217 code. Default "GBP". Allowed: GBP, USD, EUR.

  // === Stay ===
  totalNights: number;           // REQUIRED. Positive integer. Auto-calculated from Makkah + Madinah.
  nightsMakkah: number;          // REQUIRED. >= 0.
  nightsMadinah: number;         // REQUIRED. >= 0.

  // === Hotels ===
  hotelMakkahStars?: 3 | 4 | 5;     // Optional. Enum.
  hotelMadinahStars?: 3 | 4 | 5;    // Optional. Enum.
  distanceBandMakkah: 'near' | 'medium' | 'far' | 'unknown';  // REQUIRED.
  distanceBandMadinah: 'near' | 'medium' | 'far' | 'unknown'; // REQUIRED.

  // === Room ===
  roomOccupancyOptions: {        // REQUIRED. At least one must be true.
    single: boolean;
    double: boolean;
    triple: boolean;
    quad: boolean;
  };

  // === Inclusions ===
  inclusions: {                  // REQUIRED. All fields explicit boolean.
    visa: boolean;
    flights: boolean;
    transfers: boolean;
    meals: boolean;
  };

  // === Metadata ===
  notes?: string;                // Optional. Plain text only, no HTML. Max 500 chars.
  images?: string[];             // Optional. Array of image URLs. Max 5. Future scope.
}
```

### D3. Validation rules

| Field | Rule | Error message |
|-------|------|---------------|
| `title` | 5-120 chars, no HTML | "Title must be 5-120 characters" |
| `pricePerPerson` | > 0, integer | "Price must be a positive number" |
| `currency` | one of GBP, USD, EUR | "Currency must be GBP, USD, or EUR" |
| `totalNights` | == nightsMakkah + nightsMadinah | "Total nights must equal Makkah + Madinah nights" |
| `nightsMakkah` | >= 0 | "Makkah nights must be 0 or more" |
| `nightsMadinah` | >= 0 | "Madinah nights must be 0 or more" |
| `roomOccupancyOptions` | at least one true | "Select at least one room type" |
| `notes` | max 500 chars, stripped HTML | "Notes must be 500 characters or less" |
| `dateWindow.start` | valid ISO date, >= today | "Start date must be today or later" |
| `dateWindow.end` | valid ISO date, > start | "End date must be after start date" |
| `seasonLabel` | max 50 chars | "Season label must be 50 characters or less" |

### D4. Data flow: operator → storage → traveller pages

```
Operator fills PackageForm
    │
    ▼
Repository.createPackage(ctx, data)
    │
    ├─ Validates required fields
    ├─ Enforces operatorId = ctx.userId (RBAC)
    ├─ Generates slug
    │
    ▼
MockDB.savePackage(pkg)  →  localStorage (now)
                          →  API/Postgres (future)
    │
    ▼
Repository.listPackages()  (status === 'published' only)
    │
    ▼
/search/packages/page.tsx
    │
    ├─ filterByParams() — URL query param filtering
    ├─ toSearchDisplay() — maps Package → display shape
    │
    ▼
PackageList → PackageCard (rendered for traveller)
```

### D5. Schema versioning strategy

**Current approach (MVP):** `PACKAGES_SEED_VERSION` in MockDB. When we change seed data shape, bump the version; old localStorage data gets replaced.

**Future approach (when real DB exists):**
1. **Additive changes only.** New optional fields never break old records.
2. **If a field becomes required:** Write a migration that sets a default for existing records.
3. **If a field is removed:** Stop reading it in code first, then remove from type after 1 release cycle.
4. **Version stamp on records:** Add `schemaVersion: number` to Package type. Repository applies transformations for old versions at read time.
5. **API versioning:** When we have a real API, prefix routes with `/api/v1/`. New versions get `/api/v2/`. Old versions stay until deprecated.

### D6. Operator onboarding flow (future, planned now)

**Route:** `/operator/onboarding` (new)

**Steps:**
1. Company name, contact email, phone (required)
2. Short description, logo upload (optional)
3. Accept terms (required)
4. Status set to `verificationStatus: 'pending'`
5. Admin reviews and sets `'verified'`

**OperatorProfile additions needed:**
```typescript
interface OperatorProfile {
  // ... existing fields ...
  description?: string;         // Max 500 chars
  website?: string;             // URL, validated
  atol?: string;                // ATOL number (UK regulatory)
  createdAt: string;            // ISO date
  updatedAt: string;            // ISO date
}
```

---

## E) Docs Plan (Memory Strategy)

### Source of truth hierarchy

| Doc | Purpose | When to read | When to update |
|-----|---------|-------------|----------------|
| `docs/README_AI.md` | **Primary AI entry point.** Product, routes, code map, dev routine, status. | Every session start | Any route/code/status change |
| `docs/NOW.md` | **Session state.** What changed, what works, what's next. | Every session start | Every commit |
| `docs/CURSOR_CONTEXT.md` | **Cursor-specific rules.** Invariants, file map, debug checklists, response format. | Cursor sessions | Architecture/scope changes |
| `AGENTS.md` | **Allowed files.** What an agent can touch per scope. | Before any edit | When scope changes |
| `docs/skills/*` | **Reusable playbooks.** Dev routines, flow specs, test gates. | When doing that task | When process changes |
| `docs/DOCS_INDEX.md` | **Master index.** All docs with purpose, owner, update triggers. | When unsure which doc | When docs are added/archived |
| `docs/00_AGENT_HANDOVER.md` | **Operating rules.** Read order, DoD, commit protocol. | First session only | When workflow changes |
| `docs/HANDOVER_CHANGES_AND_GUIDANCE.md` | **Change log.** Short history + known issues. | When debugging | After each milestone |
| `docs/00_PRODUCT_CANON.md` | **Product truth.** Vision, users, scope, policies. | When making product decisions | Scope changes |

### What each doc contains (1-2 lines)

- **README_AI.md** — Product vision, public flow routes, non-negotiables, code locations, dev routine, current status + next 3 tasks.
- **NOW.md** — Branch name, current goal, what works (verified), what changed this session, next 3 tasks, verification commands.
- **CURSOR_CONTEXT.md** — How we work rules, product invariants, architecture notes, file map, debug checklists, response format, session end checklist.
- **AGENTS.md** — Hard rules, allowed files per scope (Operator Packages UI, Public Flow UI, Config/Docs), checks before handoff.
- **skills/DEV_ROUTINES.md** — npm scripts, port-kill, when to use dev vs dev:clean vs dev:reset.
- **skills/FLOW_PUBLIC_SEARCH.md** — /umrah form params, /search/packages filter logic, success criteria.
- **skills/SHORTLIST.md** — localStorage key, de-dupe rules, toggle behaviour, expected states.
- **skills/COMPARE.md** — Selection rules, CTA enable/disable, modal expectations, debug checks.
- **skills/TEST_GATES.md** — When to run unit tests, Playwright, build.
- **DOCS_INDEX.md** — Table of all docs with purpose, owner, update triggers.
- **00_AGENT_HANDOVER.md** — Single read order, work style rules, Definition of Done, commit protocol, evidence format.
- **HANDOVER_CHANGES_AND_GUIDANCE.md** — Dated change log (newest first), known issues + fixes, where to look.
- **00_PRODUCT_CANON.md** — Vision, primary users, success criteria, scope boundaries, data policy, geography, onboarding policy.

### How cheaper models should use them

1. **Session start:** Read `README_AI.md` + `NOW.md` + run `git status -sb` and `git log -1 --oneline`. This gives full context in ~300 lines.
2. **Before editing:** Check `AGENTS.md` for allowed files in the relevant scope.
3. **During task:** Reference the relevant `skills/` doc for the specific flow being touched.
4. **Before commit:** Update `NOW.md` per `00_AGENT_HANDOVER.md` rules.
5. **If confused:** Read `CURSOR_CONTEXT.md` for invariants and debug checklists.

---

## F) Hand-off Pack for Cheaper Models

### Sonnet task prompt template

```
You are working in the KaabaTrip repo on branch `main-v2-UI`.

## Context (read these files before doing anything)
1. docs/README_AI.md
2. docs/NOW.md
3. AGENTS.md (check your allowed files for [SCOPE_NAME] scope)

## Task
[TASK_DESCRIPTION — 1-3 sentences, specific]

## Files to touch
- [file1] — [what to change and why]
- [file2] — [what to change and why]

## Constraints
- Do not rename routes or query params
- Do not remove shortlist or compare features
- Do not change data-testid attributes without updating E2E tests
- Keep diffs small (this is 1 micro-task)

## Verification
After changes:
1. `npm run test` — must pass
2. [any manual check — e.g. "open /search/packages, verify filter works"]
3. `npm run build` — must pass (only if last task in batch)

## Before committing
- Update docs/NOW.md with what changed, current state, next step
```

### Definition of done checklist

For any micro-task to be considered Done:

- [ ] Acceptance criteria met (stated in task description)
- [ ] `npm run test` passes (17+ tests, 0 failures)
- [ ] `npm run build` passes (0 type errors, 0 build errors)
- [ ] No new console warnings (check browser devtools)
- [ ] If UI changed: manual smoke on `/`, `/umrah`, `/search/packages` at 320px and 1280px widths
- [ ] If routes/selectors changed: `npx playwright test e2e/flow.spec.ts` and `npx playwright test e2e/catalogue.spec.ts`
- [ ] `data-testid` attributes preserved (or tests updated if changed)
- [ ] `docs/NOW.md` updated with what changed + next step
- [ ] If scope/architecture changed: `AGENTS.md` and `docs/CURSOR_CONTEXT.md` updated

### Minimal context needed

A cheaper model needs only these 3 files to start any task:
1. `docs/README_AI.md` (~40 lines) — what the product is, where code lives, dev routine
2. `docs/NOW.md` (~35 lines) — current branch state, what works, what's next
3. `AGENTS.md` (~50 lines) — what files are allowed to touch

Total: ~125 lines. Well under any context window. No need to repeat business context.

---

## G) Dev Stability Runbook

### Simplest reliable dev start routine

```bash
# Standard start (99% of the time)
npm run dev

# What this does internally:
# 1. Kills any process on port 3000
# 2. Starts Next.js dev on 127.0.0.1:3000 (explicit localhost binding)
```

### What to do when blank screen / chunk 404s happen

```bash
# Step 1: Clean start (fixes 95% of issues)
npm run dev:clean
# What this does: kills port 3000, deletes .next, restarts dev

# Step 2: Hard refresh browser
# macOS: Cmd+Shift+R
# Windows: Ctrl+Shift+R

# Step 3: If still broken, nuclear option
npm run dev:reset
# What this does: kills port 3000, deletes .next AND node_modules/.cache, restarts dev

# Step 4: If STILL broken (rare)
rm -rf .next node_modules
npm install
npm run dev
```

### Practical rules to reduce .next wipes

1. **Never run two dev servers at once.** The `npm run dev` script kills port 3000 before starting, but if you have a second terminal running dev on another port, they can conflict.

2. **Don't Ctrl+C and immediately restart.** Wait 2 seconds for the process to fully terminate. The port-kill in `npm run dev` handles this, but rapid restarts can still cause issues.

3. **After `git pull` or `git checkout`, run `dev:clean` once.** New code may have different chunk hashes; the old `.next` cache will serve stale chunks.

4. **After installing/removing packages, run `dev:clean`.** Package changes can invalidate the build cache.

5. **Don't edit `next.config.ts` while dev is running.** Config changes require a server restart. Stop, edit, then `npm run dev`.

6. **Turbopack alternative.** If Webpack-based dev is consistently problematic, try `npm run dev:turbo` (uses Turbopack instead). Note: Turbopack may have different behaviour for some features.

### Safe package.json scripts (already implemented)

```json
{
  "dev": "kills port 3000 → next dev --hostname 127.0.0.1 --port 3000",
  "dev:clean": "kills port 3000 + rm -rf .next → npm run dev",
  "dev:reset": "kills port 3000 + rm .next + node_modules/.cache → npm run dev",
  "dev:turbo": "rm .next → next dev --turbopack",
  "build": "next build",
  "test": "vitest run",
  "e2e": "playwright test"
}
```

### Preventing chunk 404s architecturally (future)

These are not for now, but worth noting:
- **Service worker cleanup:** If we ever add a service worker (PWA), it must invalidate cache on deploy.
- **Next.js `output: 'standalone'`:** For production deployments, this ensures the correct chunks are always served.
- **Deployment cache headers:** When deploying to Vercel/CloudFlare, ensure `_next/static` has `immutable` cache headers (the hash in filenames handles versioning).

---

## Execution Order Summary

```
PHASE 1: Public Flow Hardening (tasks C1-C4)
  C1  Rename Package type collision
  C2  Route all data through Repository
  C3  Wire filter overlay
  C4  Wire sort button
  → npm run test → npm run build

PHASE 2: Booking Intent + Testing (tasks C5-C6)
  C5  Add booking intent capture to package detail
  C6  Add E2E test for search flow
  → npm run test → npx playwright test → npm run build

PHASE 3: Code Quality (tasks C7-C8)
  C7  Extract useShortlist hook
  C8  Add React.memo + useCallback
  → npm run test → npm run build

PHASE 4: Operator Dashboard (tasks D1-D6, future)
  Wire /operator/packages with real CRUD
  Add booking intent inbox to /operator/dashboard
  Build /operator/onboarding
  Wire /operator/analytics with real data
  → Full test suite after each

Each phase is independently committable.
Each task within a phase is independently committable.
If any task breaks tests, revert it without affecting others.
```

---

## Do Not Break List

These are absolute invariants. Any task that breaks these must be reverted immediately:

1. **`npm run test` must pass** (17+ tests, 0 failures)
2. **`npm run build` must succeed** (0 type errors)
3. **Shortlist persists** across page refresh (`kb_shortlist_packages` in localStorage)
4. **Compare modal opens** when 2+ items selected and Compare button clicked
5. **`[data-testid="comparison-table"]`** is present in the compare modal DOM
6. **No horizontal scrolling** at 320px viewport width on `/`, `/umrah`, `/search/packages`
7. **Routes unchanged**: `/`, `/umrah`, `/search/packages`, `/packages/[slug]`, `/operator/*`
8. **Query params unchanged**: `type`, `season`, `budgetMin`, `budgetMax`, `adults`
9. **Error boundaries intact**: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`
10. **Console clean**: No warnings in browser devtools on page load (excluding React DevTools prompt)

---

*End of plan. No code was changed. This document is the single reference for all execution that follows.*
