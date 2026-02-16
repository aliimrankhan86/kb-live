# NOW (session state)

**Update this file before every push. This is mandatory.**

## Branch & goal

- **Branch:** `feature/design-system-complete`
- **Goal:** Deliver a comprehensive design system foundation and a full component playground at `/showcase`.

## What works (verified)

- `/showcase` now provides live, interactive examples across typography, form controls, overlays, navigation, data display, and charts.
- Shared primitives are centralized under `components/ui` and exported through `components/ui/index.ts`.
- Public flow remains stable (`/`, `/umrah`, `/search/packages`) and shortlist/compare behavior is unchanged.
- Verification complete: unit tests, flow E2E, catalogue E2E, and production build all pass.

## What changed this session

- Fixed overlay behavior at the design-system layer:
  - `components/ui/Overlay.tsx` close icon is now pinned at top-right for all overlays (not pushed to bottom by content).
- Unified overlay look-and-feel:
  - `components/search/FilterOverlay.tsx` now uses shared `Dialog` + `OverlayContent` primitives instead of custom backdrop/modal mechanics.
- Improved Umrah comparison demo data:
  - added a 6th published Umrah package seed (`pkg6`) in `lib/api/mock-db.ts`
  - bumped seed version to `4` so localStorage refreshes
  - added a `Demo 3-way comparison` action in `components/search/PackageList.tsx` for quick visual validation.
- Improved currency consistency in key UI:
  - `components/search/PackageCard.tsx` now formats price via shared i18n money formatter.
  - `lib/mock-packages.ts` now uses ISO currency code (`GBP`) instead of symbol literals.
  - `components/operator/OfferForm.tsx` budget display now uses shared money formatting.

## What to build next

Continue the execution queue from **Task 4: Operator registration form** in `docs/EXECUTION_QUEUE.md`.

## Commands to verify

```bash
npm run test
npx playwright test e2e/flow.spec.ts
npx playwright test e2e/catalogue.spec.ts
npm run build
```
