# NOW (Cursor session anchor)

**Last updated:** Parked end of session. Read this first so any AI (or human) knows where things stand.

## Status: Parked

- **App is broken** from the user’s perspective; we’re pausing and will **figure out the problem tomorrow**.
- Build passes (`npm run build`). With a clean `.next`, dev server starts and home returns 200. So the issue is likely **dev-only**: stale `.next`, chunk 404s (main-app.js, app-pages-internals.js), `clientReferenceManifest` invariant, `_document.js` ENOENT, or “missing required error components”.

## Current working branch

- Branch: ux-option-a or ux-option-a-search-results (confirm with `git branch`).
- Goal: Option A search wiring is done; need to fix “app broken” in dev.

## What was done this session (not yet committed)

- **Dev reliability:** `dev:clean` (rimraf .next && next dev), `dev:turbo` (Turbopack), README + 00_AGENT_HANDOVER troubleshooting for chunk 404s, clientReferenceManifest, _document.js ENOENT.
- **Progressive enhancement:** Umrah form is a real `<form action="/search/packages" method="get">` with hidden inputs so “Search For Amazing Packages” works even when JS chunks 404.
- **Error boundaries:** Added `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` to fix “missing required error components, refreshing…”.
- **Lint:** Removed unused `openCompareModal` from PackageList.tsx.

## User journey (when app works)

- /umrah → Search For Amazing Packages → /search/packages with params; shortlist + compare (2–3) with modal.

## Non-negotiables (must not break)

- Option A look and feel; shortlist key kb_shortlist_packages; Compare handleComparisonSelection max 3; /packages flow and E2E stable.

## Next steps (tomorrow)

1. **Reproduce “app broken”:** Run `npm run dev` (or dev:clean / dev:turbo), open app, note exact behaviour (blank screen, error message, console errors).
2. **Fix root cause:** Likely clean `.next` + correct dev command + hard refresh; or switch to Turbopack if Webpack keeps failing.
3. **Then:** Commit session work if everything is stable; optional E2E for /search/packages, a11y on compare modal.

## Allowed edit scope (search/packages work)

- app/search/packages/page.tsx
- components/search/PackageList.tsx, PackageCard.tsx, packages.module.css
- components/ui/Overlay.tsx (only if modal issues)
- lib/api/mock-db.ts, lib/api/repository.ts, lib/types.ts, lib/comparison.ts

## Required checks before any commit

- npm run test
- npx playwright test e2e/catalogue.spec.ts (and e2e/flow.spec.ts if shared compare/quote touched)
