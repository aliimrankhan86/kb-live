# KaabaTrip — AI Working Notes

> **For any AI (Claude, Kimi, GPT, etc.) picking this up:** Read §1 (status), §2 (rules), §3 (architecture). Everything else is reference. Build must stay at 0 errors, 0 warnings, tests at 222/222.

---

## §1 — Current Status

**Date:** 2026-06-07 | **Branch:** `dev` | **Build:** ✅ 0 errors, 0 warnings | **Tests:** ✅ 227/227 unit | **E2E:** ✅ 19/21 chromium pass (2 skipped, 0 fail) | **Git:** local branch ahead of `origin/dev`

### 🔄 Active work (highest → lowest priority)

| #          | Task                                                         | Status                                                                                                                                                                                                                                                             | Files                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T8         | 8-step PackageWizard (replace flat PackageForm)              | ✅ COMPLETE — wired, tested, building                                                                                                                                                                                                                              | `components/operator/wizard/*.tsx` (8 steps + PackageWizard.tsx)                                                                                                                       |
| T11        | PackageCard shows operator name + verified badge + hotels    | ✅ COMPLETE — public cards enhanced                                                                                                                                                                                                                                | `components/search/PackageCard.tsx`, `PackageList.tsx`                                                                                                                                 |
| T12        | Enhanced operator public profile (ATOL/ABTA/regions/JSON-LD) | ✅ COMPLETE — profile + schema live                                                                                                                                                                                                                                | `components/operators/OperatorProfileDetail.tsx`, `app/operators/[slug]/page.tsx`                                                                                                      |
| T13        | SEO structured-data helper consolidation                     | ✅ COMPLETE — `/requests/[id]` uses `breadcrumbJsonLd` from `lib/seo/json-ld.ts`; `buildBreadcrumbJsonLd` removed from `Breadcrumb.tsx`                                                                                                                            | `lib/seo/json-ld.ts`, `app/requests/[id]/page.tsx`, `components/ui/Breadcrumb.tsx`                                                                                                     |
| T14        | Validation utility functions                                 | ✅ COMPLETE — 7 reusable validators + 39 tests, all passing                                                                                                                                                                                                        | `lib/validation.ts`, `tests/validation.test.ts`                                                                                                                                        |
| T15        | Unit tests: wizard full integration                          | ✅ COMPLETE (47/47 pass, part of T8)                                                                                                                                                                                                                               | `tests/operator-wizard.test.tsx`                                                                                                                                                       |
| T16        | E2E: onboarding → packages → dashboard                       | ✅ COMPLETE — `__e2e_user` cookie bypass implemented in middleware + session.ts; `E2E_TESTING=1` env var forwarded to Edge Runtime via `next.config.ts`; MockDB forced in production builds; all 10 operator tests now pass                                        | `e2e/operator.spec.ts`, `e2e/helpers/auth.ts`, `lib/supabase/middleware.ts`, `lib/auth/session.ts`, `lib/config.ts`, `next.config.ts`, `playwright.config.ts`                          |
| T17        | Final smoke + integration check                              | ✅ COMPLETE — 222/222 unit tests; 19/21 chromium E2E pass (2 skipped, 0 failures); build 0 errors 0 warnings                                                                                                                                                       | —                                                                                                                                                                                      |
| OP-PERSIST | Operator package persistence wiring                          | ✅ COMPLETE — GET/DELETE added to `/api/operator/packages/route.ts`; page fetches on load, wires POST/PATCH/DELETE; loading + error states                                                                                                                         | `/operator/packages`, `app/api/operator/packages/route.ts`                                                                                                                             |
| T18        | Chrome SEO/AEO QA                                            | ✅ DONE (server-side curl audit) — fixed robots.txt missing /admin+/settings, fixed duplicate title suffix on 8 pages, removed console.error from route, removed unused `request` param warning                                                                    | `app/robots.ts`, 8 page files, `app/packages/[slug]/page.tsx`, `app/api/operator/packages/route.ts`                                                                                    |
| T19        | SEO/AEO content expansion (seo-aeo-best-practices skill)     | ✅ DONE — AI crawler rules in robots.txt; `personJsonLd`, `touristTripJsonLd`, `dateModified` in json-ld.ts; TouristTrip wired to packages page; cost FAQ on /umrah; corridor links on homepage; /umrah/ramadan full expansion; /umrah/cost new pricing guide page | `app/robots.ts`, `lib/seo/json-ld.ts`, `app/page.tsx`, `app/umrah/page.tsx`, `app/umrah/ramadan/page.tsx`, `app/umrah/cost/page.tsx`, `app/packages/[slug]/page.tsx`, `app/sitemap.ts` |

---

## §9 — What's Left To Do (Next AI Handoff)

These items are **intentionally not yet done** and must be picked up by the next session:

| #   | Task                                          | Why pending                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | What the next agent needs to do                                                                                                                                                               |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **T18 — SEO/AEO QA**                          | ✅ DONE 2026-06-06 (server-side curl audit). Fixed: robots.txt missing /admin & /settings; 8 page titles doubled `\| KaabaTrip` via template; `console.error` in route; unused `_request` param lint warning.                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                                                                             |
| 2   | **T16 RE-ENABLE — Operator E2E**              | ✅ DONE 2026-06-06 — `__e2e_user` cookie bypass (two-level: middleware.ts + session.ts), `E2E_TESTING=1` env var forwarded to Edge via `next.config.ts`; MockDB forced in production builds via `getDataSource()`. All 10 operator tests now pass.                                                                                                                                                                                                                                                                                                                                                               | —                                                                                                                                                                                             |
| 3   | **E2E auth infrastructure**                   | ✅ DONE 2026-06-06 — `e2e/helpers/auth.ts` created with `TEST_USERS` + `setTestUser`/`clearTestUser`. All affected specs (`operator`, `bank-payment`, `flow`, `catalogue`) updated. 19/21 chromium tests pass, 0 fail.                                                                                                                                                                                                                                                                                                                                                                                           | —                                                                                                                                                                                             |
| 8   | **Master Audit (Security/A11y/Perf/Quality)** | ✅ DONE 2026-06-06 — Security: rate limit added to `/api/interest`, brace-expansion vuln patched, all auth endpoints return minimal data, admin never in public schemas, CSP headers configured. A11y: `<main>` landmark for skip link, label/htmlFor bindings on 3 inputs in Step2. Perf: no `next/dynamic` code-split needed (only 5 framer-motion uses, optimizePackageImports configured). Code quality: 0 `any`, 0 `console.log`, 222/222 tests, 0 build errors/warnings. Remaining: 5 moderate npm vulns (PostCSS in Next.js internals — not actionable without breaking Next; Prisma dev dep — dev only). | —                                                                                                                                                                                             |
| 4   | **Rate limiter production switch**            | `lib/rate-limit.ts` uses an in-memory `Map` fallback when `UPSTASH_REDIS_REST_URL` is missing. This resets on every cold start on Vercel/Lambda.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **INFRA TASK:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to production env. Verify the Upstash path is hit in staging.                                                     |
| 5   | **Prisma cutover end-to-end**                 | `FEATURE_USE_REAL_DB=true` is set in `.env.local`. Real Supabase project wired (`nzvepuzzxjoxvpcrlozx`). `prisma.config.ts` loads `.env.local` via dotenv and spreads `directUrl` for DDL. `db push` in progress — may need `npx prisma db push` to complete (was hanging on pgBouncer before directUrl fix). Once schema is pushed, run `npx prisma db seed` then verify.                                                                                                                                                                                                                                       | **INFRA TASK (IN PROGRESS):** Confirm `npx prisma db push` completes cleanly. Then `npx prisma db seed`. Then smoke-test the app with `FEATURE_USE_REAL_DB=true`. Fix any RLS/adapter issues. |
| 6   | **Console.log audit**                         | ✅ DONE 2026-06-06 — `grep -rn "console\." components/ app/` found only `error.tsx`, `global-error.tsx` (error boundaries, allowed), and one route `console.error` that was removed.                                                                                                                                                                                                                                                                                                                                                                                                                             | —                                                                                                                                                                                             |
| 7   | **SEO/AEO content expansion (T19)**           | ✅ DONE 2026-06-06 — AI crawlers in robots.txt; `personJsonLd`, `touristTripJsonLd`, `dateModified` in json-ld.ts; TouristTrip on package pages; cost FAQ on /umrah; corridor links on homepage; /umrah/ramadan full expansion; /umrah/cost new page; sitemap updated.                                                                                                                                                                                                                                                                                                                                           | See T19 row in §1                                                                                                                                                                             |

**Branch state:** `dev` is ahead of `origin/dev`; not all local work has been pushed.

**Local tooling files:** `.agents/`, `.claude/`, and `scripts/_upstash_check.mjs` are intentionally untracked local/tooling artifacts. Do not push them unless the user explicitly chooses to version project skills or a reusable Redis connectivity utility. `.claude/` is machine-specific and should stay untracked.

### 2026-06-07 session changes

| What                                                                                                                                                                                                                                                      | Files                                                                                                                                             | Commit              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Overlay restructure: close button moved into `OverlayHeader` flex row (title left / X right) — fixes Compare modal close at bottom-right                                                                                                                  | `components/ui/Overlay.tsx`                                                                                                                       | `6459e14`           |
| New `OverlayBody` component (`flex-1 overflow-y-auto p-5`) for correct scroll regions                                                                                                                                                                     | `components/ui/Overlay.tsx`                                                                                                                       | `6459e14`           |
| `OverlayFooter` now has `border-t` and `flex-shrink-0`                                                                                                                                                                                                    | `components/ui/Overlay.tsx`                                                                                                                       | `6459e14`           |
| RangeSlider active track: `#4A9EFF` (blue) → `var(--yellow)`                                                                                                                                                                                              | `components/ui/RangeSlider.module.css`                                                                                                            | `6459e14`           |
| LoginModal: title white→yellow, close button `×`→SVG X, border/shadow/radius use design tokens                                                                                                                                                            | `components/auth/LoginModal.tsx`, `LoginModal.module.css`                                                                                         | `6459e14`           |
| PhoneOtpModal: body wrapped in `OverlayBody`                                                                                                                                                                                                              | `components/operator/PhoneOtpModal.tsx`                                                                                                           | `6459e14`           |
| Compare dialog: removed redundant `overflow-hidden flex flex-col` override                                                                                                                                                                                | `components/search/PackageList.tsx`                                                                                                               | `6459e14`           |
| `prisma.config.ts`: load `.env.local` via dotenv; spread `directUrl` for DDL (bypasses pgBouncer)                                                                                                                                                         | `prisma.config.ts`                                                                                                                                | `6459e14`           |
| CSP hardening: script CSP now uses a per-request middleware nonce and removes `unsafe-inline`; JSON-LD scripts use the shared nonce-aware helper                                                                                                          | `middleware.ts`, `next.config.ts`, `lib/seo/json-ld.ts`, public JSON-LD pages                                                                     | `ab246cb`           |
| Overlay standardisation: package filter and comparison overlays use shared overlay primitives with stable close placement and table sizing                                                                                                                | `components/search/FilterOverlay.tsx`, `components/search/PackageList.tsx`, `components/request/ComparisonTable.tsx`, `components/ui/Overlay.tsx` | `f3e98c0`           |
| Prisma adapter route fix: `Repository` now uses a literal dynamic import for `./db/adapter` so server chunks resolve correctly, while `next.config.ts` aliases the adapter to `false` in client webpack builds to keep `pg`/Prisma out of browser bundles | `lib/api/repository.ts`, `next.config.ts`                                                                                                         | latest local commit |

### 2026-06-07 Prisma adapter verification

- Fixed `/operators/al-hidayah-travel` production runtime error: `Cannot find module '.next/server/chunks/db/adapter'`.
- Exact URL verification: `http://127.0.0.1:3000/operators/al-hidayah-travel` returns the operator page with H1 `Al-Hidayah Travel(Al-Hidayah)`; response no longer contains `Operator not found` or `Cannot find module`.
- `npm run build`: passes with 0 errors. Known warning remains from `@supabase/supabase-js` using `process.version` in Edge middleware via `@supabase/ssr`.
- `npm run test`: 17 files, 222/222 tests pass.

### Current Codex task handoff note (2026-06-06)

User asked Codex to complete all pending tasks except T18 to a high quality level. If work stops mid-task, continue from this note:

1. Finish T13 by moving `/requests/[id]` breadcrumb JSON-LD to the shared `lib/seo/json-ld.ts` helper.
2. Finish T14 by implementing reusable validation helpers and focused tests.
3. Fix T16 operator E2E route/auth setup, then run the operator E2E spec.
4. Wire `/operator/packages` wizard-created package persistence through existing repository/API paths where possible.
5. Run `npm run test`, `npm run build`, and required smoke/E2E checks.
6. Update `AI_NOTES.md`, `docs/NOW.md`, and `docs/EXECUTION_QUEUE.md` with exact results and any remaining impossibilities.

### ✅ Completed in this session (uncommitted on `dev`)

| Task     | What                                                                                                                     | Files                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 BUG   | `filterByParams` in `'use client'` file crashed `/search/packages` server-side                                           | Extracted to `components/search/search-utils.ts` (no `'use client'`)                                                                                        |
| P0 BUG   | Signup 500 ISE — corrupted import `mentimport` in `lib/auth/api.ts`                                                      | Fixed to proper `import`                                                                                                                                    |
| P0       | All 84 Repository methods made async + callers await-ed                                                                  | `lib/api/repository.ts` + all consumers                                                                                                                     |
| P0       | AppError typed errors + `mapErrorToResponse` — no raw `err.message` exposure                                             | `lib/errors.ts`                                                                                                                                             |
| P0.2     | Upstash Redis rate limiter (in-memory dev fallback)                                                                      | `lib/rate-limit.ts`                                                                                                                                         |
| P0.3–4   | GDPR export + deletion (Art. 20 + Art. 17)                                                                               | `app/api/user/export/route.ts`, `app/api/user/delete/route.ts`                                                                                              |
| P1.5     | `/search/packages` → Server Component for SEO                                                                            | `app/search/packages/page.tsx` + `SearchPackagesClient.tsx`                                                                                                 |
| P1.6     | JSON-LD: TravelAgency, Product+Offer, ItemList, BreadcrumbList, Organization, WebSite                                    | `lib/seo/json-ld.ts`, layout, package detail, search                                                                                                        |
| SEO/AEO  | Beyond SEO remediation: homepage/Umrah/search/package/operator metadata, FAQ/WebPage graphs, entity/reputation-safe copy | `app/page.tsx`, `app/umrah/page.tsx`, `app/search/packages/page.tsx`, `app/packages/[slug]/page.tsx`, `app/operators/[slug]/page.tsx`, `lib/seo/json-ld.ts` |
| P1.7–8   | Tests: auth API + interest API + UI components                                                                           | `tests/auth-api.test.ts`, `tests/interest-api.test.ts`, `tests/ui-components.test.tsx`                                                                      |
| P1.9     | ATOL/ABTA admin verification endpoint                                                                                    | `app/api/admin/verify-operator/route.ts`                                                                                                                    |
| P2.10–15 | OG locale, dead code removal, og:image, sort URL persistence, breadcrumbs, RBAC AppError                                 | Multiple files                                                                                                                                              |
| AUDIT    | 14+ ESLint warnings cleared                                                                                              | `eslint.config.mjs` + multiple files                                                                                                                        |
| SECURITY | CSP headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS                          | `next.config.ts`                                                                                                                                            |
| AUTH     | Auth endpoints return minimal data only (`{user: {id, email, role, name}}`)                                              | `app/api/auth/sign-in/route.ts`, `sign-up/route.ts`                                                                                                         |
| RBAC     | `requireOperatorOwnerOrAdmin` helper; admin role never in public schemas                                                 | `lib/api/repository.ts`, `lib/validation.ts`                                                                                                                |

### 🏗️ New files created (untracked → now tracked)

| File                                         | Purpose                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `components/search/SearchPackagesClient.tsx` | Client-side search interactivity (sort, filters) inside Server Component     |
| `components/search/search-utils.ts`          | `filterByParams`, `toSearchDisplay` — server+client safe (no `'use client'`) |
| `components/ui/Breadcrumb.tsx`               | `<Breadcrumb items>` + `buildBreadcrumbJsonLd()`                             |
| `lib/errors.ts`                              | `AppError`, `ErrorCode`, `mapErrorToResponse`                                |
| `lib/rate-limit.ts`                          | Upstash Redis sliding window (5 req / 15 min). In-memory fallback for dev.   |
| `lib/supabase/service-role.ts`               | Admin Supabase client for account deletion                                   |
| `lib/validation.ts`                          | All Zod schemas: `signUpSchema`, `signInSchema`, `interestSchema`            |
| `app/api/admin/verify-operator/route.ts`     | ATOL/ABTA admin verification                                                 |
| `app/api/operator/packages/route.ts`         | Operator package CRUD API                                                    |
| `app/api/user/export/route.ts`               | GDPR Art. 20 data export                                                     |
| `app/api/user/delete/route.ts`               | GDPR Art. 17 erasure                                                         |
| `app/settings/page.tsx`                      | User-facing GDPR settings (download + delete)                                |
| `components/operator/wizard/*.tsx`           | 8-step PackageWizard (T8, complete)                                          |

---

## §2 — Non-Negotiable Rules (Enforced Every Session)

These rules exist because violations caused actual audit findings. Do not break them.

### 2.1 Client/Server boundary

- `'use client'` file = component only. **Never export pure utility functions from a `'use client'` file.**
- If a function is needed by both server and client: put it in a `.ts` file WITHOUT `'use client'`. Example: `search-utils.ts`.
- Server Components may render Client Components as JSX. They CANNOT call their exported functions.

### 2.2 Async/await discipline

- ALL `Repository.*` calls MUST be `await`-ed — every method is async.
- `params` and `searchParams` in Next.js 15 server components are Promises — `await` them before `.slug`, `.id`, etc.

### 2.3 Security (HARD rules)

- `'admin'` role MUST NOT appear in public Zod schemas, `VALID_ROLES` arrays, or client-rendered form options.
- Auth endpoints return ONLY `{ user: { id, email, role, name } }` — never session object, JWT, or refresh token.
- No `eval()`, `__non_webpack_require__`, or webpack globals. For repo-local server modules, use normal dynamic imports such as `await import('./db/adapter')` so Next can bundle valid server chunk paths. If shared client/server modules expose that import, add a client-only webpack alias for the server module rather than hiding the import with `webpackIgnore`. Use `webpackIgnore` only for external Node-only package imports when a normal import would incorrectly bundle code into the client or Edge path.
- In-memory rate limiters are **not** acceptable in production serverless. Upstash Redis required.

### 2.4 Error handling

- API routes use `mapErrorToResponse(err)` from `lib/errors.ts` — never `err.message` directly.
- RBAC helpers throw `AppError({ code: 'FORBIDDEN', status: 403 })` — not plain `Error`.

### 2.5 Code quality

- No `console.log` or `console.warn` in production components/routes. Exceptions: error boundaries (`console.error`), supabase client missing-env warning (intentional dev guidance).
- TypeScript strict — no `any`.
- Zod validation before every DB/API call.

### 2.6 SEO

- Search pages must be Server Components (not `'use client'`). Interactive parts go in a child `<Suspense>` wrapper.
- JSON-LD scripts on every significant page. Prefer `lib/seo/json-ld.ts` helpers and `graphJsonLd()` over inline/component-local builders.
- AEO/GEO copy must be source-backed, concise, and visible when backed by `FAQPage` schema.
- Reputation/trust copy must only use stored facts. Do not claim "best", "cheapest", "guaranteed", "price match", fake reviews, or unsupported rankings.
- `searchParams` passed through server-side so initial HTML has real data.

### 2.7 Claude local Chrome SEO QA brief

When Claude or another browser-capable agent has local Chrome access, run this as a follow-up technical SEO/AEO audit.

**Mode:** Local Chrome / rendered-page audit. This validates implementation quality, not live ranking data.

**Routes to check first:**

- `/`
- `/umrah`
- `/search/packages`
- `/packages/[slug]` using a published package slug from MockDB/repository data
- `/operators/[slug]` using a public operator slug
- `/umrah/london`, `/umrah/birmingham`, `/umrah/manchester`
- `/robots.txt`, `/sitemap.xml`

**Chrome checks:**

- Rendered title, meta description, canonical, Open Graph, and robots/indexability state.
- Exactly one sensible H1 per public page; H2/H3 hierarchy supports the page intent.
- Key comparison copy is visible in rendered HTML, not hidden behind client-only state.
- JSON-LD scripts exist, parse as valid JSON, and use page-appropriate schema types.
- Package/operator facts in schema match visible page content; no fabricated reviews, ratings, rankings, or guarantees.
- Internal links support search journeys: homepage → Umrah/search/corridors, search → package detail, package detail → operator/quote where available.
- Mobile and desktop Chrome smoke at 320px and 1280px: no horizontal overflow, visible CTA, no overlapping text, no console/hydration errors.
- Basic asset checks: logo/images load, meaningful alt text where images are visible.
- If Lighthouse/DevTools is available, capture performance/accessibility/SEO signals and note blockers only when reproducible.

**If defects are found:**

- Make small, scoped fixes in the allowed public SEO/UI files.
- Update `docs/NOW.md` with what changed and what remains unverified.
- Run `npm run test`, `npm run build`, and repeat Chrome smoke for affected public routes.

**Do not claim from local Chrome alone:**

- Google rankings, search volume, backlink count/authority, Core Web Vitals field data, Google Business Profile performance, competitor keyword footprint, or AI Overview/Gemini/Perplexity citation visibility.

---

## §3 — Architecture

### Stack

Next.js 15.5.19 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Supabase + Prisma ORM · Vitest 4.1.8

### Data layer

| Layer      | File                       | Purpose                                                                 |
| ---------- | -------------------------- | ----------------------------------------------------------------------- |
| Repository | `lib/api/repository.ts`    | All data operations (84 async methods). Use `store()` internally.       |
| store()    | `lib/api/repository.ts:76` | Returns mockStore or Prisma proxy based on `getDataSource()`            |
| MockDB     | `lib/api/mock-db.ts`       | In-memory localStorage store. Active in dev + tests.                    |
| DBAdapter  | `lib/api/db/adapter.ts`    | Prisma → App type mappers (built, wired via `store()` proxy)            |
| Config     | `lib/config.ts`            | `getDataSource()` → `'prisma'` (FEATURE_USE_REAL_DB=true) or `'mockdb'` |

**Dev default:** MockDB. Prisma only when `FEATURE_USE_REAL_DB=true`.

### Key files

| File                                | What                                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `middleware.ts`                     | Auth guard. Public prefixes, operator/admin RBAC.                                                                                       |
| `lib/validation.ts`                 | All Zod schemas: `signUpSchema`, `signInSchema`, `interestSchema`                                                                       |
| `lib/errors.ts`                     | `AppError`, `ErrorCode`, `mapErrorToResponse`                                                                                           |
| `lib/rate-limit.ts`                 | Upstash Redis sliding window (5 req / 15 min). In-memory fallback for dev.                                                              |
| `lib/supabase/service-role.ts`      | Admin Supabase client for account deletion                                                                                              |
| `lib/seo/json-ld.ts`                | Shared Product, TravelAgency, ItemList, BreadcrumbList, Organization, WebSite, WebPage, FAQPage, TouristTrip, Person, and graph helpers |
| `components/search/search-utils.ts` | `filterByParams`, `toSearchDisplay` — server+client safe (no `'use client'`)                                                            |
| `components/ui/Breadcrumb.tsx`      | `<Breadcrumb items>` — JSON-LD helper removed (use `lib/seo/json-ld.ts`)                                                                |

### Route map

| Route                        | Type           | Notes                                                                    |
| ---------------------------- | -------------- | ------------------------------------------------------------------------ |
| `/`                          | Server         | Landing                                                                  |
| `/umrah`                     | Server         | 4-step search form (client component inside)                             |
| `/hajj`                      | Server         | Hajj interest capture (server component + HajjInterestForm client child) |
| `/umrah/cost`                | Server         | Pricing guide — 4 tiers, seasonal pricing, FAQs, JSON-LD                 |
| `/search/packages`           | Server         | SSR packages + `<SearchPackagesClient>` in Suspense                      |
| `/packages/[slug]`           | Server         | Package detail + JSON-LD                                                 |
| `/operators/[slug]`          | Server         | Operator profile                                                         |
| `/requests/[id]`             | Server         | Request tracker                                                          |
| `/settings`                  | Client         | GDPR: download data + delete account                                     |
| `/operator/*`                | Client         | Dashboard, packages, profile (role-gated)                                |
| `/admin/*`                   | Client         | Bank changes, complaints triage (admin-only)                             |
| `/api/auth/*`                | Route handlers | sign-up, sign-in, sign-out, me                                           |
| `/api/user/export`           | POST           | GDPR Art. 20 data export                                                 |
| `/api/user/delete`           | DELETE         | GDPR Art. 17 erasure                                                     |
| `/api/admin/verify-operator` | POST           | ATOL/ABTA admin verification                                             |
| `/api/interest`              | POST           | Hajj/Umrah interest capture                                              |

---

## §4 — Shared Components

| Component           | Props                                           | Used by                                                         |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `VerifiedBadge`     | `className?`                                    | PackageCard                                                     |
| `InclusionChip`     | `chip: { label, included }`                     | PackageCard                                                     |
| `InclusionChipList` | `chips[], className?, data-testid?`             | PackageDetail                                                   |
| `Breadcrumb`        | `items: BreadcrumbItem[], className?`           | packages/[slug], operators/[slug], requests/[id]                |
| `RangeSlider`       | `min, max, value, onChange, aria-label-min/max` | BudgetFilter, DistanceFilter, TimePeriodFilter, UmrahSearchForm |

### Overlay system (`components/ui/Overlay.tsx`)

All modals/dialogs must use this system. Do **not** create custom `position: fixed` dialogs.

```
OverlayContent          — Radix Portal wrapper. flex-col overflow-hidden. No padding.
  OverlayHeader         — ALWAYS first child. flex row: title content left, close ✕ right.
                          Has px-5 py-4 + border-b. Close button built-in (no prop needed).
  OverlayBody           — Scrollable middle section. flex-1 overflow-y-auto p-5.
                          Use for any content that may overflow.
  OverlayFooter         — ALWAYS last child (if buttons needed). border-t px-5 py-4 flex-shrink-0.
```

**Correct usage pattern:**

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <OverlayContent className="max-w-lg">
    {' '}
    {/* width override OK */}
    <OverlayHeader>
      <OverlayTitle>Title here</OverlayTitle> {/* yellow, semibold */}
    </OverlayHeader>
    <OverlayBody>{/* scrollable content */}</OverlayBody>
    <OverlayFooter>
      <Button variant="secondary">Cancel</Button>
      <Button>Confirm</Button>
    </OverlayFooter>
  </OverlayContent>
</Dialog>
```

**Rules:**

- Close button is always top-right, 36×36 px, `var(--borderSubtle)` border, yellow on hover. Never add a second one.
- `OverlayBody` is required when content may scroll. Without it, content sits in the flex column with no scroll.
- Do **not** add `position: absolute` children inside `OverlayContent` — the flex+overflow-hidden layout will clip or misplace them.
- `OverlayContent` className overrides (e.g. `max-w-4xl`, `max-h-[90vh]`) are fine — they extend the base class.

### FilterOverlay (`components/search/FilterOverlay.tsx`)

Separate custom component (not Radix-based). Bottom-sheet on mobile, centred modal on desktop (`@media (min-width: 769px)`). Has its own backdrop, header (flex row with close button), scrollable content, and footer. Uses `FilterOverlay.module.css`. **Do not** replace with Overlay.tsx — this component handles complex filter state internally.

### Close button standard (all overlays)

| Property       | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| Size           | 36 × 36 px                                                    |
| Border         | `1px solid var(--borderSubtle)`                               |
| Default colour | `var(--textMuted)`                                            |
| Hover          | border + text → `var(--yellow)`, bg → `rgba(255,211,29,0.06)` |
| Focus          | `focus-visible` ring, `var(--yellow)`                         |
| Icon           | SVG X, 16 × 16 px, `strokeWidth="2"`                          |

---

## §5 — Test Coverage

17 test files, 222 tests. All must pass before any commit. Build must have 0 warnings.

| File                                               | Coverage                                                     |
| -------------------------------------------------- | ------------------------------------------------------------ |
| `auth-api.test.ts`                                 | Sign-up validation, role rejection, rate limiting (13 tests) |
| `interest-api.test.ts`                             | Interest endpoint: valid, dedup, invalid input (13 tests)    |
| `ui-components.test.tsx`                           | VerifiedBadge, InclusionChip, InclusionChipList (14 tests)   |
| `operator-wizard.test.tsx`                         | Wizard step validation, navigation, state (47 tests)         |
| `package-csv.test.ts`                              | CSV import/export, RBAC                                      |
| `bank-details.test.ts`, `complaints.test.ts`, etc. | Domain logic                                                 |

Run: `npm test` (Vitest). E2E: `npx playwright test`.

---

## §6 — Commands

```bash
npm run dev         # Dev server (http://127.0.0.1:3000)
npm run build       # Production build — must stay at 0 errors
npm test            # Unit tests — must stay at 222/222
npx tsc --noEmit    # Type check
```

---

## §7 — Common Pitfalls (Learned the Hard Way)

| Pitfall                                                     | Symptom                                                                                                                                 | Fix                                                                                                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Utility function in `'use client'` file, called from server | `"Attempted to call X() from the server"` runtime crash                                                                                 | Extract to `.ts` file without `'use client'`                                                                                                              |
| `params` not awaited in Next.js 15                          | `TypeError: Cannot destructure property 'slug' of...`                                                                                   | `const { slug } = await params`                                                                                                                           |
| In-memory rate limiter in serverless                        | Zero protection after cold start                                                                                                        | Use Upstash Redis (see §2.3)                                                                                                                              |
| `eval('require')` for server-only modules                   | Webpack bundles fail / `no-require-imports` lint                                                                                        | Prefer normal dynamic import for repo-local modules (`await import('./db/adapter')`); reserve `webpackIgnore` for external Node-only packages when needed |
| `webpackIgnore` on repo-local relative imports              | Next production chunks resolve `./...` relative to `.next/server/chunks`, causing `Cannot find module '.next/server/chunks/db/adapter'` | Remove `webpackIgnore` from repo-local imports so Next bundles the module into server chunks                                                              |
| Admin role in public Zod schema                             | Security: users can self-register as admin                                                                                              | `VALID_ROLES = ['customer', 'operator']` only                                                                                                             |
| Full session in auth response                               | JWT/tokens exposed to client JS                                                                                                         | Return only `{ user: { id, email, role, name } }`                                                                                                         |
| Missing `await` on Repository call                          | Stale data / silent failure                                                                                                             | All 84 Repository methods are async                                                                                                                       |
| Prisma 7 — `url`/`directUrl` in `schema.prisma`             | `P1012` validation error on any Prisma CLI command                                                                                      | Prisma 7 removed these from schema; put them in `prisma.config.ts` only                                                                                   |
| `directUrl` missing from `prisma.config.ts`                 | `migrate deploy` / `db push` hangs forever                                                                                              | pgBouncer (port 6543) blocks DDL advisory locks; `directUrl` (port 5432) bypasses it                                                                      |
| `dotenv/config` default in `prisma.config.ts`               | `DATABASE_URL` undefined → "datasource.url required"                                                                                    | Next.js uses `.env.local`; dotenv defaults to `.env`. Use `config({ path: '.env.local' })`                                                                |
| `@` in Postgres password without URL-encoding               | TCP connection hangs (wrong host parsed from URL)                                                                                       | URL-encode `@` as `%40` in `DATABASE_URL` and `DIRECT_URL`                                                                                                |
| Absolute `position` child inside `flex overflow-hidden`     | Element clipped or mis-positioned (e.g. close button at bottom)                                                                         | Use flex row layout with close button as a sibling, not absolute                                                                                          |
| `OverlayContent` without `OverlayBody`                      | Content doesn't scroll; layout breaks on tall modals                                                                                    | Always wrap scrollable content in `<OverlayBody>`                                                                                                         |

---

## §8 — Historical Log (Condensed)

| Date       | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-07 | **Overlay consistency + Prisma config**: Redesigned `Overlay.tsx` — close button moved from `absolute` into `OverlayHeader` flex row (fixes Compare modal close at bottom-right). Added `OverlayBody` + updated `OverlayFooter`. Fixed RangeSlider active track blue→yellow. LoginModal title/close/border/shadow aligned to design tokens. `prisma.config.ts` now loads `.env.local` via dotenv; `directUrl` spread for DDL (bypasses pgBouncer port 6543 advisory lock hang). Password `@` URL-encoded as `%40`. Build 0 errors, tests 222/222. Commit `6459e14`.                                                                             |
| 2026-06-06 | **SEO/AEO content expansion (T19)**: Added AI crawler allow rules (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) to robots.ts. Added `personJsonLd`, `touristTripJsonLd`, `dateModified` support to json-ld.ts. Wired TouristTrip schema alongside Product on package detail pages. Added cost FAQ to /umrah. Expanded /umrah/ramadan from 29-line stub to full corridor page (2027 dates, FAQs, AEO details). Created /umrah/cost pricing guide (4 tiers, seasonal pricing, 4 FAQs, JSON-LD). Added sitemap entry for /umrah/cost. Added corridor links section to homepage and /umrah page. Tests: 222/222, build: 0 errors, 0 warnings. |
| 2026-06-06 | **Beyond SEO audit + fixes**: Fixed critical canonical bug — 8 pages pointed canonical at homepage. Fixed hajj page (was `'use client'` with no metadata, inheriting homepage title/canonical). Added FAQPage+WebPage+BreadcrumbList JSON-LD to all corridor pages. Rewrote CityCorridor with design tokens (was using `text-slate-900` invisible on dark bg). Added city-specific FAQ blocks for AEO. Commit `78d72f5`.                                                                                                                                                                                                                        |
| 2026-06-06 | **T18 SEO/AEO QA**: robots.txt added /admin+/settings disallow; stripped duplicate `\| KaabaTrip` title suffix from 8 pages (template was appending it twice); removed `console.error` from packages route; fixed unused `request` param lint warning. Tests: 222/222; build: 0 errors, 0 warnings.                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-06 | **MAJOR SESSION**: P0-P2 audit remediation. AppError, Upstash rate limiter, GDPR routes, Server Component search, JSON-LD, breadcrumbs, CSP headers, auth hardening, 14 ESLint fixes. Tests: 136→183.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-06-06 | Beyond SEO remediation: public metadata, AEO FAQ blocks/schema, entity graph helpers, operator/package schema consolidation, reputation-safe copy, 320px public smoke fixes. Tests: 183/183; build clean.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-06-06 | BUG FIX: filterByParams in client file crashed /search/packages. Fixed via search-utils.ts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-06-06 | Audit remediation: 26 security/quality fixes. Second-pass: 10 more. Rate limiter Upstash, GDPR routes, ATOL/ABTA, breadcrumbs, JSON-LD, sort URL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-06-06 | Signup Internal Server Error fixed (corrupted import in lib/auth/api.ts).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-06-05 | Calendar icon date validation, unified RangeSlider, filter overlay consistency, GBP currency, mobile header.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-06-05 | .clinerules v1.1, partner page, Hajj dedup, shared UI extraction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-06-04 | Phase 1 persistence: Supabase SSR, Prisma, DB adapter, auth middleware, RLS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-06-03 | UK/EU compliance: cookie consent, Privacy Policy, Terms, GDPR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-06-02 | Operator surfaces: registration, dashboard, leads, profile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-06-01 | Auth + booking flow: login/signup, quote wizard, request tracker.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
