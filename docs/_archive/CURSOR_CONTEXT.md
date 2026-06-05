# CURSOR_CONTEXT (KaabaTrip)

## Purpose of this file

This is the single source of truth Cursor must read at the start of every session, before proposing changes.

## How we work (mandatory)

1. Always read:
   - docs/README_AI.md (canonical onboarding)
   - docs/NOW.md (current state)
   - docs/skills/* (dev routines, flows, test gates)
2. Summarise what you read in 6 bullets.
3. Propose a plan:
   - smallest possible change set
   - list exact files
   - list exact commands to run
4. Do not refactor without approval. Do not redesign UI. Only wire functionality unless asked otherwise.

## Product invariants (do not change)

- Shortlist
  - localStorage key: kb_shortlist_packages
  - must de-dupe IDs
  - must persist across refresh
- Compare
  - use lib/comparison.ts handleComparisonSelection (max 3)
  - compare CTA disabled until 2 selected
  - comparison opens modal with ComparisonTable
  - modal must contain: [data-testid="comparison-table"]
- Tests
  - Keep existing /packages E2E stable
  - Add/adjust tests only when necessary and keep selectors stable

## Current architecture notes (relevant to this work)

- /search/packages uses query params: type, season, budgetMin, budgetMax, adults.
- Repository.listPackages() returns published catalogue packages; app/search/packages/page.tsx filters by params and maps catalogue Package -> display model (toSearchDisplay).
- List is deferred until client mount (useEffect setMounted(true)) to avoid hydration mismatch.
- ComparisonTable uses mapOfferToComparison or mapPackageToComparison; comparison rows show operator name as header (or "Travel agent (name TBC)" fallback).
- MockDB seed: 5 packages (pkg1–pkg5); pkg4 and pkg5 are Umrah in 500–1000 range. Seed version PACKAGES_SEED_VERSION=2.
- Shared `cn()` utility in `lib/utils.ts`; shared `getErrorMessage` in `lib/get-error-message.ts`.

## File map (key flows)

- **Landing:** app/page.tsx → Header (server component), Hero (server component). Hero: components/marketing/hero.module.css. Header: components/layout/header.module.css.
- **Umrah:** app/umrah/page.tsx → UmrahSearchForm. components/umrah/umrah-search-form.module.css.
- **Search packages:** app/search/packages/page.tsx → PackageList, PackageCard. components/search/packages.module.css, PackageList.tsx (shortlist, compare, modal).

## Current state

- Branch: **main-v2-UI**. Build passes, 17 tests green, console clean (no duplicate viewport, no Radix warnings).
- /, /umrah, /search/packages responsive (breakpoints 640/768/1024; 44px tap targets; compare modal scrolls). Shortlist + compare unchanged; test IDs preserved.
- Config hardened: reactStrictMode, forceConsistentCasingInFileNames, color-scheme: dark. Dead deps removed.

## Required response format after changes (A–E)

When you change UX, routes, or docs, report: **A)** What changed **B)** Files changed **C)** Why **D)** Commands run + results **E)** Next steps + risks (short).

## Debug checklist for "Compare button does nothing"

When top-right Compare does not open the modal:

1. Check selected compare IDs state — is selectedPackages actually updating?
2. Check button disabled logic — is disabled derived from selectedPackages.length?
3. Check click handler — is onClick attached and firing?
4. Check modal render — showComparison boolean, Overlay/Dialog mounted, ComparisonTable receives rows, data-testid="comparison-table" present.

## Definition of done for any wiring task

- On /search/packages:
  - Shortlist toggle updates UI and persists
  - Compare selection updates top-right Compare(n)
  - Clicking Compare(n) opens modal with comparison table
  - Closing modal works
- Tests pass:
  - npm run test
  - npm run build

## Before each commit (see docs/README_AI.md)

- Update docs/NOW.md: what this commit changes, current state, next step.

## Session end checklist

- Ensure docs/NOW.md is up to date (what changed, next step)
- Run `npm run test` and `npm run build` — both must pass
