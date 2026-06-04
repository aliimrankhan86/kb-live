# CURSOR_CONTEXT (KaabaTrip)

## Purpose of this file

This is the single source of truth Cursor must read at the start of every session, before proposing changes.

## How we work (mandatory)

1. Always read:
   - docs/NOW.md
   - docs/00_PRODUCT_CANON.md
   - docs/02_REPO_MAP.md
   - docs/PHASE_3_AUDIT.md
2. Summarise what you read in 6 bullets.
3. Propose a plan:
   - smallest possible change set
   - list exact files
   - list exact commands to run
4. Do not refactor. Do not redesign UI. Only wire functionality.

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

## Option A UX rules

- Option A UI is the baseline for /search/packages.
- No layout rewrites, no component replacement with /packages browse UI.
- Only wiring changes inside existing Option A components.

## Current architecture notes (relevant to this work)

- /search/packages uses query params: type, season, budgetMin, budgetMax, adults (adults may not filter catalogue yet).
- Repository.listPackages() returns published catalogue packages; app/search/packages/page.tsx filters by params and maps catalogue Package -> display model (toSearchDisplay).
- List is deferred until client mount (useEffect setMounted(true)) to avoid hydration mismatch.
- ComparisonTable uses mapPackageToComparison(pkg, operatorsById[p.operatorId]); PackageList passes cataloguePackages + selectedCompareIds to build comparisonRows.
- MockDB seed: 5 packages (pkg1–pkg5); pkg4 and pkg5 are Umrah in 500–1000 range. Seed version PACKAGES_SEED_VERSION=2; getPackages() reseeds when stored version < 2.

## File map (key flows)

- **Landing:** app/page.tsx → Header, Hero. Hero: components/marketing/hero.module.css. Header: components/layout/header.module.css.
- **Umrah:** app/umrah/page.tsx → UmrahSearchForm. components/umrah/umrah-search-form.module.css.
- **Search packages:** app/search/packages/page.tsx → PackageList, PackageCard. components/search/packages.module.css, PackageList.tsx (shortlist, compare, modal).

## Current state

- /, /umrah, /search/packages are responsive (breakpoints 640/768/1024; 44px tap targets; compare modal scrolls). Shortlist + compare unchanged; test IDs preserved.
- Docs: NOW.md, DOCS_MERGE_CHECKLIST.md, README DoD. On merge, reconcile docs per DOCS_MERGE_CHECKLIST.

## Required response format after changes (A–E)

When you change UX, routes, or docs, report: **A)** What changed **B)** Files changed **C)** Why **D)** Commands run + results **E)** Next steps + risks (short).

## Debug checklist for "Compare button does nothing"

When top-right Compare does not open the modal:

1. Check selected compare IDs state:
   - Is selectedPackages actually updating?
   - Are we only changing labels without updating state?
2. Check button disabled logic:
   - Is disabled derived from selectedPackages.length?
   - Is it reading the wrong state variable?
3. Check click handler:
   - Is onClick attached and firing?
   - Is a CSS layer intercepting clicks?
4. Check modal render:
   - showComparison boolean and render path exists
   - Overlay/Dialog component mounted
   - ComparisonTable receives rows for selected packages
   - data-testid="comparison-table" present

## Definition of done for this wiring task

- On /search/packages:
  - Shortlist toggle updates UI and persists
  - Compare selection updates top-right Compare(n)
  - Clicking Compare(n) opens modal with comparison table
  - Closing modal works
- Tests pass:
  - npm run test
  - npx playwright test e2e/catalogue.spec.ts

## Before each commit (see 00_AGENT_HANDOVER.md)

- Update docs/NOW.md: what this commit changes, current state, next step. Keeps context in memory for better solutions.

## Session end checklist

- Ensure docs/NOW.md is up to date (what changed, next step)
- Append evidence in docs/PHASE_3_AUDIT.md (commands + results)
- Tag stable UI points before risky wiring changes
