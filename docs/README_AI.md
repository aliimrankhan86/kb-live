# KaabaTrip — AI & Developer Onboarding

**Read this file first. It is the single entry point for any AI agent or developer.**

---

## What is KaabaTrip?

A two-sided marketplace for Umrah/Hajj pilgrimage packages. Travellers search, compare, shortlist, and express booking intent. Operators list packages, respond to leads, and track performance. See `docs/PRODUCT.md` for full product canon.

## Current state

- **Branch:** `ux-option-a`
- **Stack:** Next.js 15.5.3 (App Router), React 19, Tailwind v4, TypeScript strict, Vitest, Playwright
- **Build:** Passes. 17 unit tests green. Console clean.
- **Data:** MockDB (localStorage-backed). No real backend yet.
- **Auth:** None. MockDB.currentUser is simulated. No protected routes.
- **Operator side:** Shells exist for dashboard/packages/analytics. Full build plan in `docs/EXECUTION_QUEUE.md`.

## Localisation

- Currency, distance units, and language adapt to the user's location (detected via `navigator.language` + `Intl.DateTimeFormat().resolvedOptions().timeZone`).
- Supported languages: English (default), French, Arabic. Language switcher in header.
- UK user sees GBP + UK airports + miles. French user sees EUR + km. UAE user sees AED + km.
- Implementation: `lib/i18n/region.ts` (detection), `lib/i18n/format.ts` (formatting + conversion).
- Full spec: `docs/I18N.md`.

## Routes

See `docs/APP_STRUCTURE.md` for full journey maps and wireframes.

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing. Hero CTAs for Hajj/Umrah. | Done |
| `/umrah` | Search preferences form. Submits to `/search/packages`. | Done |
| `/hajj` | Hajj landing. | Done |
| `/umrah/ramadan` | Ramadan landing. | Done |
| `/search/packages` | Results + shortlist + compare. | Done |
| `/packages/[slug]` | Package detail page. | Done |
| `/operators/[slug]` | Operator public profile. | Done |
| `/quote` | 5-step quote wizard. | Done |
| `/requests/[id]` | Request tracker + offers. | Done |
| `/operator/onboarding` | Operator registration form. | TODO |
| `/operator/dashboard` | Operator home with stats. | Partial |
| `/operator/packages` | Package CRUD. | Partial |
| `/operator/leads` | Lead/enquiry management. | TODO |
| `/operator/analytics` | Stats dashboard. | Partial |
| `/operator/profile` | Profile editor. | TODO |

## Key code locations

| What | Where |
|------|-------|
| Routes | `app/page.tsx`, `app/umrah/page.tsx`, `app/search/packages/page.tsx` |
| Search form | `components/umrah/UmrahSearchForm.tsx` |
| Results list | `components/search/PackageList.tsx`, `PackageCard.tsx` |
| Compare table | `components/request/ComparisonTable.tsx` |
| Comparison logic | `lib/comparison.ts` |
| Types (catalogue) | `lib/types.ts` |
| Types (display) | `lib/mock-packages.ts` |
| Data access | `lib/api/repository.ts` (RBAC layer) |
| Mock storage | `lib/api/mock-db.ts` (localStorage) |
| i18n | `lib/i18n/region.ts`, `lib/i18n/format.ts` |
| Shared utilities | `lib/utils.ts` (`cn()`), `lib/get-error-message.ts` |
| UI primitives | `components/ui/Overlay.tsx`, `components/ui/Slider.tsx` |

## Non-negotiables (invariants)

1. **Shortlist:** localStorage key `kb_shortlist_packages`, array of IDs, always de-dupe.
2. **Compare:** `handleComparisonSelection` from `lib/comparison.ts`, max 3, modal renders `[data-testid="comparison-table"]`.
3. **Routes:** Do not rename `/`, `/umrah`, `/search/packages`, `/packages/[slug]`.
4. **Query params:** `type`, `season`, `budgetMin`, `budgetMax`, `adults` — do not rename.
5. **Error boundaries:** Keep `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.
6. **`data-testid` attributes:** These are test contracts. Do not rename without updating E2E tests.
7. **Docs:** Update `docs/NOW.md` before every push. This is mandatory.

## Dev commands

```bash
npm run dev          # Start dev server (kills port 3000, binds 127.0.0.1:3000)
npm run dev:clean    # Clears .next + restart (fixes chunk 404s)
npm run dev:reset    # Clears .next + node_modules/.cache + restart
npm run test         # Vitest unit tests (must pass before push)
npm run build        # Production build (must pass before push)
npm run e2e          # Playwright E2E tests
```

## Doc structure

```
/AGENTS.md                 — What files you can touch + mandatory rules
/QA.md                     — QA checklist (manual + automated)
/docs/
  README_AI.md             — THIS FILE. Read first.
  NOW.md                   — Current session state. Update before every push.
  MASTER_PLAN.md           — Full execution plan with micro-tasks
  PRODUCT.md               — Product vision, users, scope, policies
  ARCHITECTURE.md          — System design, data model, RBAC
  SECURITY.md              — Threat model, RBAC rules
  ACCESSIBILITY.md         — WCAG 2.1 AA checklist
  REPO_MAP.md              — Code navigation guide
  I18N.md                  — Localisation spec (currency, language, location)
  UX_GUIDELINES.md         — Component patterns, card design, comparison UX, trust signals
  SEO.md                   — Structured data, meta tags, URL strategy, sitemap
  OPERATOR_ONBOARDING.md   — Operator registration, package data schema, validation rules
  APP_STRUCTURE.md         — Complete journey map: every screen, both user sides
  EXECUTION_QUEUE.md       — Ordered build tasks. Execute top-to-bottom. THE TODO LIST.
  skills/                  — Reusable playbooks
    DEV_ROUTINES.md        — Dev commands and recovery
    FLOW_PUBLIC_SEARCH.md  — /umrah → /search/packages flow
    SHORTLIST.md           — Shortlist implementation spec
    COMPARE.md             — Compare implementation spec
    TEST_GATES.md          — When to run which tests
  _archive/                — Old docs (do not read unless debugging history)
```

### When to read which doc

| Task | Read these |
|------|-----------|
| **Starting a new session** | `README_AI.md` → `NOW.md` → `EXECUTION_QUEUE.md` (find next task) |
| Building / editing UI components | `UX_GUIDELINES.md`, `ACCESSIBILITY.md` |
| Adding a new route or page | `SEO.md`, `REPO_MAP.md`, `APP_STRUCTURE.md` |
| Working on operator features | `OPERATOR_ONBOARDING.md`, `APP_STRUCTURE.md` §3, `ARCHITECTURE.md` |
| Working on search / compare | `skills/FLOW_PUBLIC_SEARCH.md`, `skills/COMPARE.md`, `UX_GUIDELINES.md` |
| Working on i18n / currency | `I18N.md` |
| Any push | `NOW.md` (must update), `EXECUTION_QUEUE.md` (mark task done), `AGENTS.md` (checklist) |

## Session workflow

1. Read this file + `docs/NOW.md` + `AGENTS.md`.
2. Read `docs/EXECUTION_QUEUE.md` — find the first `[ ]` task.
3. Run `git status -sb` and `git log -1 --oneline`.
4. Execute the task following its spec (files, validation, verify steps).
5. After each task: `npm run test` + `npm run build` must pass.
6. Mark the task `[x]` in `EXECUTION_QUEUE.md` with the date.
7. Update `docs/NOW.md` with what changed.
8. Move to next task. Repeat.
9. **Before push:** `npm run test` + `npm run build` + update `NOW.md`.
