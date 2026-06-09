# Status

> ⚠️ **DEPRECATED — do not trust or update this file.** Canonical live status is now [`/STATUS.md`](../STATUS.md). Content below is historical (old branch `ux-option-a-search-results`).


- **Branch:** ux-option-a-search-results
- **Goal:** Public flow (/, /umrah, /search/packages) responsive and stable on mobile; no feature removal.
- **Done:** 320px support (360px breakpoint), body overflow-x hidden, compare modal max-h 90vh + scrollable body, tap targets ≥44px, cards single column; shortlist/compare unchanged.
- **Verify:** `npm run test`; `npx playwright test e2e/flow.spec.ts`; `npx playwright test e2e/catalogue.spec.ts`; `npm run build`.
