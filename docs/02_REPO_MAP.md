# Repo Map (KaabaTrip)

## Purpose

This document is the fast navigation guide to the codebase:

- where key features live
- which files to touch for common changes
- what not to break (shared components and patterns)

If a feature is added or refactored, update this map.

---

## Tech Stack Snapshot

- Next.js App Router (app/)
- React components (components/)
- Domain + repository + storage mock (lib/)
- Unit tests (tests/)
- E2E tests (e2e/)
- Documentation (docs/)

---

## Top-level layout

### app/ (Routes, pages, SEO endpoints)

App Router pages and route files.

Key routes:

- `app/`
  - `page.tsx` Home
- `app/packages/`
  - `page.tsx` Public package browse
- `app/packages/[slug]/`
  - `page.tsx` Public package detail + metadata
- `app/operators/[slug]/`
  - `page.tsx` Public operator profile + metadata
- `app/quote/`
  - `page.tsx` Quote wizard entry (wrapped for search params usage)
- `app/requests/[id]/`
  - `page.tsx` Request detail (customer view of offers, compare)
- `app/operator/dashboard/`
  - `page.tsx` Operator dashboard
- `app/operator/packages/`
  - `page.tsx` Operator packages CRUD
- `app/operator/analytics/`
  - `page.tsx` Operator analytics

SEO-lite endpoints:

- `app/robots.ts` serves `/robots.txt`
- `app/sitemap.ts` serves `/sitemap.xml`
- `app/umrah/page.tsx` curated landing
- `app/hajj/page.tsx` curated landing
- `app/umrah/ramadan/page.tsx` curated landing

---

## components/ (UI, feature components)

Feature UI lives here. Reuse existing patterns (Overlay, forms, tables).

Key feature folders/files:

- `components/packages/`
  - `PackagesBrowse.tsx` Browse UI, filters, compare selection UI + test IDs
  - `PackageDetail.tsx` Detail layout + CTA to prefilled quote
- `components/operators/`
  - `OperatorProfileDetail.tsx` Operator profile UI + packages list
- `components/quote/`
  - `QuoteRequestWizard.tsx` Main wizard, now hydrates from URL params then cleans URL
- `components/request/`
  - `RequestDetail.tsx` Customer request view, offer selection, compare
  - `ComparisonTable.tsx` Comparison UI (supports offers + packages)
- `components/kanban/`
  - `KanbanBoard.tsx` Delivery workflow board

Shared UI patterns (important):

- Overlay / dialog components (wherever currently defined in your repo)
- Form controls and consistent labels/test ids

---

## lib/ (Domain, repository, utilities)

This is the “backend” of the prototype: types, storage, repository pattern, mapping helpers.

Key files:

- `lib/types.ts`
  - Domain types (Package, Offer, Request, Operator, etc.)
- `lib/api/mock-db.ts`
  - LocalStorage-backed “database”
  - Seed data and persistence keys
- `lib/api/repository.ts`
  - The only supported access layer for reads/writes
  - Enforces RBAC for operator actions
  - Contains public read helpers (eg getOperatorBySlug)
- `lib/comparison.ts`
  - Comparison mapping and missing-value normalisation (“Not provided”)
  - Offer + package mapping support
- `lib/quote-prefill.ts`
  - Build `/quote?...` URLs from a Package
  - Parse query params back into a partial quote draft safely

---

## tests/ (Unit tests)

Vitest unit tests and small integration tests.

Key files:

- `tests/comparison.test.ts` Comparison mapping expectations
- `tests/phase2.test.ts` Phase 2 coverage (mapping + helper behaviours)
- `tests/hero.spec.tsx` UI smoke/hero related tests (if present)

Run:

- `npm run test`

---

## e2e/ (Playwright E2E)

End-to-end user flows.

Key files:

- `e2e/flow.spec.ts` Core MVP flow gate (quote -> request -> offer -> compare)
- `e2e/catalogue.spec.ts` Public catalogue flow (browse -> detail -> operator, compare conditional)

Run:

- `npx playwright test e2e/flow.spec.ts`
- `npx playwright test e2e/catalogue.spec.ts`

Playwright config:

- `playwright.config.ts` (webServer host/port adjustments, baseURL)

---

## docs/ (Operating system for the repo)

Authoritative docs:

- `docs/DOCS_INDEX.md` The canonical map of what to update and when
- `docs/ARCHITECTURE.md` System design and boundaries
- `docs/SECURITY.md` Security posture and RBAC
- `docs/ACCESSIBILITY.md` A11y rules and checklist
- `QA.md` (repo root) canonical QA test matrix/checklists

Phase docs:

- `docs/PHASE_1_1_PLAN.md` Phase 1 stabilisation gates and close-out
- `docs/PHASE_2_PLAN.md` Phase 2 scope and checklist
- `docs/PHASE_2_AUDIT.md` Evidence log (append-only, one entry per micro-task)

Pointer docs:

- `docs/05_SECURITY.md` pointer to `docs/SECURITY.md`
- `docs/06_ACCESSIBILITY.md` pointer to `docs/ACCESSIBILITY.md`
- `docs/07_QA.md` pointer to `QA.md` (repo root)

---

## Common tasks: where to change what

### Add a new public landing page

- Create: `app/<route>/page.tsx`
- Add metadata in the page file
- If it should appear in sitemap: update `app/sitemap.ts`
- Log in `docs/PHASE_2_AUDIT.md` (or Phase 3 audit later)

### Change package fields shown on browse/detail

- Browse: `components/packages/PackagesBrowse.tsx`
- Detail: `components/packages/PackageDetail.tsx`
- If data fields change: update `lib/types.ts` (ask/plan first) and repository mappings

### Adjust quote prefill behaviour

- Mapping logic: `lib/quote-prefill.ts`
- Wizard hydration: `components/quote/QuoteRequestWizard.tsx`
- CTA source: `components/packages/PackageDetail.tsx`

### Update comparison rows/fields

- Mapping: `lib/comparison.ts`
- UI table: `components/request/ComparisonTable.tsx`
- Update unit tests: `tests/comparison.test.ts`, `tests/phase2.test.ts`

### Fix failing E2E tests

- Spec: `e2e/*.spec.ts`
- Server config: `playwright.config.ts`
- If it’s data-dependent: prefer conditional assertions or stable seeded data

---

## Guardrails

- Public pages must not rely on localStorage-only state at render time.
- Repository is the access layer; avoid direct MockDB usage from UI.
- Keep test IDs stable once introduced.
- Update docs when behaviour changes (DOCS_INDEX rule).
