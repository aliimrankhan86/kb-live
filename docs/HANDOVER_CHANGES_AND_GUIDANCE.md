# Handover: Changes Made & Guidance Needed

**Purpose:** Inform ChatGPT (covering requirements in phases) what has been done so far, and capture guidance needed from Gemini Pro (or similar) for Next.js–related issues to improve performance and app structure.

---

## 1. What We Have Done So Far

### 1.1 UX Option A – Search Packages Flow (committed earlier)

- **/umrah** preferences form submits to **/search/packages** with query params: `type`, `season`, `budgetMin`, `budgetMax`, `adults`.
- **/search/packages** filters `Repository.listPackages()` by those params, maps catalogue packages to display model, defers list render until client mount (avoids hydration mismatch).
- **Shortlist:** `localStorage` key `kb_shortlist_packages`, de-duped IDs, count in header, “Shortlist only” filter.
- **Compare:** Uses `handleComparisonSelection` from `lib/comparison.ts` (max 3); Compare(n) button enabled when ≥2 selected; opens Dialog with `ComparisonTable`; `data-testid="comparison-table"`.
- **Seed data:** Two extra Umrah packages (pkg4 £750, pkg5 £950) in 500–1000 budget range; seed version `kb_packages_seed_version` so existing users get new packages on next load.
- **Console/UX fixes:** Logo and PackageCard Next/Image aspect-ratio (`width: auto`, `height: auto`); Header text-logo `priority` for LCP; no hydration mismatch in PackageList.

### 1.2 Process & Docs (committed)

- **Before each commit:** Update `docs/NOW.md` (and `docs/CURSOR_CONTEXT.md` if scope changed) so context is preserved (see `docs/00_AGENT_HANDOVER.md`).
- **Read order for agents:** DOCS_INDEX → AGENTS.md → **docs/NOW.md** → product/architecture/QA docs.
- **QA.md:** New §9 “Search Packages – Option A” checklist (shortlist, compare, modal, console).
- **02_REPO_MAP.md:** Routes and components for `/umrah`, `/search/packages`; “Change /search/packages behaviour” task with exact files.
- **PHASE_3_AUDIT.md:** Entry for “UX Option A: Search packages wiring”.

### 1.3 Dev Reliability & Progressive Enhancement (uncommitted)

- **Scripts in package.json:**
  - `dev:clean` — `rimraf .next && next dev` (cross-platform via rimraf) to avoid stale build/chunk 404s.
  - `dev:turbo` — `rimraf .next && next dev --turbopack` to use Turbopack instead of Webpack when Webpack causes errors.
- **Umrah form progressive enhancement:** The “Search For Amazing Packages” button is now a **native form submit**: `<form action="/search/packages" method="get">` with hidden inputs for `type`, `season`, `budgetMin`, `budgetMax`, `adults`. If JS fails to load (e.g. chunk 404), the button still navigates to search results.
- **README.md:** Troubleshooting for:
  - 404 on `layout.css`, `main-app.js`, `app-pages-internals.js` → use `npm run dev:clean` (and hard refresh).
  - `Invariant: Expected clientReferenceManifest to be defined` → `dev:clean` then `dev:turbo` if needed.
  - `ENOENT: .next/server/pages/_document.js` → project is App Router only; clean `.next` via `dev:clean` or use `dev:turbo`.
  - `missing required error components, refreshing...` → we added error boundaries (see below).
- **docs/00_AGENT_HANDOVER.md:** “Local development (avoid chunk 404s)” — use `npm run dev:clean` after clone/pull or when seeing chunk 404s.

### 1.4 Error Boundaries & 404 Page (uncommitted)

- **app/error.tsx** — Client component; catches route-segment errors; shows message + “Try again” (`reset()`).
- **app/global-error.tsx** — Client component; catches root-level errors; renders its own `<html>`/`<body>`; same UI + “Try again”.
- **app/not-found.tsx** — 404 page with “Go home” link.
- README troubleshooting updated for “missing required error components”.

### 1.5 Font & Lint (uncommitted)

- **next/font:** `preload: false` on Inter (layout) and Exo2 local font (lib/fonts.ts) to avoid “preloaded but not used” console warnings.
- **PackageList.tsx:** Removed unused `openCompareModal` (button uses inline `onClick`).

### 1.6 Context for “Parked” State (uncommitted)

- **docs/NOW.md** and **docs/CURSOR_CONTEXT.md** updated: app was “broken” in dev from user’s perspective; we parked and will fix tomorrow. Build passes; issue likely dev-only (stale `.next`, chunk 404s, Webpack manifest bugs). Next steps in NOW.md: reproduce, fix (e.g. dev:clean / dev:turbo), then commit.

---

## 2. Next.js Issues We Hit (Summary for Guidance)

We ran into several **Next.js 15.5.3 (Webpack)** issues in development:

| Issue | What we did |
|-------|-------------|
| **404 on `main-app.js`, `app-pages-internals.js`, `layout.css`** | Documented: stop server, clear `.next`, run `dev:clean`, hard refresh. Caused “Search For Amazing Packages” to do nothing when JS didn’t load — fixed with native form submit. |
| **`Invariant: Expected clientReferenceManifest to be defined`** | Documented: `dev:clean` then `dev:turbo` as workaround (Turbopack avoids this Webpack path). |
| **`ENOENT: .next/server/pages/_document.js`** | Project is **App Router only** (no `pages/`). Caused by stale/corrupt `.next`. Documented: `dev:clean` or `dev:turbo`. |
| **`missing required error components, refreshing...`** | Added `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`. |
| **Font preload “not used within a few seconds”** | Set `preload: false` on both next/font usages. |

**Current stack:** Next.js 15.5.3, React 19, App Router only, Tailwind v4, TypeScript. No `pages/` directory.

---

## 3. Guidance We Need (for Gemini Pro or Next.js Specialist)

Please use this section when asking **Gemini Pro** (or another model/specialist) for help so they can give targeted advice:

**Context:** We have a Next.js 15.5.3 App Router app (no Pages Router). In **development** we repeatedly saw:

1. **Chunk 404s** — Browser requests `_next/static/chunks/main-app.js` (and similar) that no longer exist after server restart, so the app appears broken (buttons that need JS do nothing).
2. **Webpack manifest / document errors** — `clientReferenceManifest` invariant and ENOENT for `.next/server/pages/_document.js` despite using only App Router.
3. **“Missing required error components”** — We added `error.tsx`, `global-error.tsx`, `not-found.tsx`; we still want to ensure error handling is correct and doesn’t hurt performance.

**What we need guidance on:**

- **Dev stability:** Recommended way to run dev (e.g. always use Turbopack, or a specific Next.js/Webpack config) so chunk 404s and manifest errors don’t keep recurring. Any `next.config` or script practices that prevent stale `.next` issues.
- **Performance & structure:** Recommended App Router patterns (data loading, error boundaries, root layout) for performance and maintainability. Whether our error-boundary approach is correct and if we should add anything (e.g. loading.js, default error handling).
- **Next.js version:** Whether to upgrade to a specific 15.x (or canary) that fixes these Webpack/manifest issues, and any breaking changes to watch for.
- **Production vs dev:** Any settings or checks that ensure production builds stay unaffected by the dev-only issues above.

**Files to reference if needed:**  
`next.config.ts` (currently minimal), `app/layout.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `package.json` (scripts: `dev`, `dev:clean`, `dev:turbo`).

---

## 4. Quick Reference for ChatGPT (Phases)

- **Done:** UX Option A search flow (umrah → search/packages, shortlist, compare, seed, console/UX fixes). Doc process (NOW.md, CURSOR_CONTEXT, QA, REPO_MAP, PHASE_3_AUDIT). Dev scripts and progressive enhancement for Umrah form. Error boundaries and not-found. Font preload and PackageList lint. Parked state documented in NOW + CURSOR_CONTEXT.
- **Uncommitted:** Everything in §§1.3–1.6 (dev:clean/dev:turbo, form enhancement, error components, font preload, lint, NOW/CURSOR_CONTEXT parked state).
- **Next:** Resolve “app broken” in dev (repro, then fix with dev:clean/dev:turbo or config), then commit. Use **§3** when asking Gemini Pro (or similar) for Next.js performance and structure guidance.
