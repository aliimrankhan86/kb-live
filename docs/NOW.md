# NOW (session state)

**Update this file before every push. This is mandatory.**

## Branch & goal

- **Branch:** `feature/quote-journey`
- **Goal:** Trace and document the package detail to quote journey, then apply minimal UX consistency fixes without changing routes.

## What works (verified)

- Package detail to quote prefill flow is functioning end-to-end with query-based prefill.
- `/quote` and `/requests/[id]` now use the shared header, so logo/navigation are consistent with the rest of the app.
- Quote journey now exposes a clear "Back to previous page" action in wizard and request detail views.
- Header now includes a design-system currency dropdown (`GBP`, `USD`, `EUR`) that updates displayed package rates client-side.

## What changed this session

- Traced the "Request quote" control source in `components/packages/PackageDetail.tsx` and prefill serializer in `lib/quote-prefill.ts`.
- Confirmed `/quote` hydration behavior in `components/quote/QuoteRequestWizard.tsx`:
  - Parses search params into a draft.
  - Merges prefill into persisted zustand state (`quote-request-storage`).
  - Clears URL params with `window.history.replaceState`.
- Updated "Request quote" CTA to consume design-system button variants.
- Added token aliases for legacy variables (`--primary`, `--panel`, `--border`, `--background`) to keep styles consistent.
- Added shared header to quote pages and a back action in quote/request screens.
- Standardized request summary budget formatting through the i18n money formatter.
- Added persisted display-currency preference (`kb_display_currency`) and shared currency change event handling.
- Standardized symbol display to avoid `GBP750`-style output in visible price cards and quote review budget sections.

## Current journey (as implemented now)

- User opens `/packages/umrah-2026-7-nights-value` and clicks **Request quote**.
- CTA navigates to `/quote` with serialized prefill query params from the package.
- Quote wizard reads and validates params, then merges them into the persisted quote draft.
- Wizard removes query params from the URL after hydration (`/quote` stays clean).
- On submit, a new request ID is generated, saved in MockDB, and user is redirected to `/requests/{id}`.

## What to build next

Create a small `ButtonLink` primitive in `components/ui` and migrate legacy link-style CTAs in public flow so all interactive controls are sourced from the design system.

## Commands to verify

```bash
npm run test
npx playwright test e2e/flow.spec.ts
npm run build
```
