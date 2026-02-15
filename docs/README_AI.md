# KaabaTrip — Canonical AI onboarding (single source of truth)

**Product vision**  
KaabaTrip is a comparison-first platform for Umrah and Hajj: customers browse packages, shortlist, compare, and request quotes; operators respond with offers. Goal is clarity and confidence for customers and fast onboarding for supply.

**Public flow routes and purpose**  
- **/** — Landing. Hero, HAJJ/UMRAH CTAs, header.  
- **/umrah** — Umrah preferences form. Submit → `/search/packages` with query params (`type`, `season`, `budgetMin`, `budgetMax`, `adults`).  
- **/search/packages** — Search results. Filters by same params; shortlist (localStorage) and compare (2–3 items, modal with comparison table).

**Non-negotiables**  
- Shortlist: key `kb_shortlist_packages`, array of IDs; always de-dupe on load/save.  
- Compare: enabled at 2+ selected; max 3; modal must render `[data-testid="comparison-table"]`.  
- Do not remove features; do not change routes or query param names without updating docs.

**Where key code lives**  
- Routes: `app/page.tsx`, `app/umrah/page.tsx`, `app/search/packages/page.tsx`.  
- Form → search: `components/umrah/UmrahSearchForm.tsx` (params, submit).  
- Search results + shortlist + compare: `components/search/PackageList.tsx`, `PackageCard.tsx`; filter in `app/search/packages/page.tsx` (`filterByParams`).  
- Compare UI: `components/request/ComparisonTable.tsx`.  
- Shortlist/compare logic: `lib/comparison.ts`; storage in PackageList.  
- Full map: `docs/02_REPO_MAP.md`.

**Dev routine**  
- One command: **`npm run dev:clean`** (clears port 3000, removes `.next`, starts dev on 127.0.0.1:3000).  
- Recovery: chunk 404 / blank / manifest issues → `npm run dev:clean`, then hard refresh. See `docs/skills/DEV_ROUTINES.md`.

**Current branch, baseline, status**  
- Branch: **ux-option-a-search-results** (or current feature branch).  
- Baseline tag: **ux_search_ui_before_wiring** (last known-good search results UX).  
- Status: Option A search flow wired; shortlist + compare stable; docs/skills pack in place; mobile UX and stability improvements in scope.

**Next 3 tasks (short)**  
1. Ensure /, /umrah, /search/packages fully responsive at 320px (no horizontal scroll; compare modal usable).  
2. Keep dev stability: prefer `dev:clean`; document in skills; run test gates after changes.  
3. Docs hygiene: update INDEX and README_AI when routes or behaviour change; archive duplicates to `docs/_archive/`.

---

**Token-cheap workflow**  
- Start a session by reading: this file + the 5 files in `docs/skills/` + `git status -sb` and `git log -1 --oneline`.  
- One micro-task at a time; run `npm run test` after each; run Playwright after routing/UI changes; `npm run build` before push.
