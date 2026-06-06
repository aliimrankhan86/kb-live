# KaabaTrip — AI Working Notes

> **For any AI (Claude, Kimi, GPT, etc.) picking this up:** Read §1 (status), §2 (rules), §3 (architecture). Everything else is reference. Build must stay at 0 errors, tests at 183/183.

---

## §1 — Current Status

**Date:** 2026-06-06 | **Branch:** `dev` | **Build:** ✅ 0 errors, 0 warnings | **Tests:** ✅ 183/183 | **Uncommitted:** ✅ Ready to commit

### 🔄 Active work (highest → lowest priority)

| #   | Task                                                         | Status                                | Files                                                            |
| --- | ------------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------- |
| T8  | 8-step PackageWizard (replace flat PackageForm)              | ✅ COMPLETE — wired, tested, building | `components/operator/wizard/*.tsx` (8 steps + PackageWizard.tsx) |
| T11 | PackageCard shows operator name + verified badge + hotels    | ✅ COMPLETE — public cards enhanced   | `components/search/PackageCard.tsx`, `PackageList.tsx`           |
| T12 | Enhanced operator public profile (ATOL/ABTA/regions/JSON-LD) | ✅ COMPLETE — profile + schema live   | `components/operators/OperatorProfileDetail.tsx`, `app/operators/[slug]/page.tsx` |
| T13 | SEO structured-data helper consolidation                     | ✅ MOSTLY COMPLETE — public SEO pages consolidated; `/requests/[id]` still uses component breadcrumb helper | `lib/seo/json-ld.ts`, public route pages |
| T15 | Unit tests: wizard full integration                          | ✅ COMPLETE (47/47 pass, part of T8)  | `tests/operator-wizard.test.tsx`                                 |
| T16 | E2E: onboarding → packages → dashboard                       | ⚠️ SPEC EXISTS, NOT PASSING           | `e2e/operator.spec.ts`                                           |
| T17 | Final smoke + integration check                              | ⚠️ PUBLIC SMOKE PASSED; operator E2E still blocks full sign-off | —                                                                |

### ✅ Completed in this session (uncommitted on `dev`)

| Task     | What                                                                                            | Files                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| P0 BUG   | `filterByParams` in `'use client'` file crashed `/search/packages` server-side                  | Extracted to `components/search/search-utils.ts` (no `'use client'`)                   |
| P0 BUG   | Signup 500 ISE — corrupted import `mentimport` in `lib/auth/api.ts`                             | Fixed to proper `import`                                                               |
| P0       | All 84 Repository methods made async + callers await-ed                                         | `lib/api/repository.ts` + all consumers                                                |
| P0       | AppError typed errors + `mapErrorToResponse` — no raw `err.message` exposure                    | `lib/errors.ts`                                                                        |
| P0.2     | Upstash Redis rate limiter (in-memory dev fallback)                                             | `lib/rate-limit.ts`                                                                    |
| P0.3–4   | GDPR export + deletion (Art. 20 + Art. 17)                                                      | `app/api/user/export/route.ts`, `app/api/user/delete/route.ts`                         |
| P1.5     | `/search/packages` → Server Component for SEO                                                   | `app/search/packages/page.tsx` + `SearchPackagesClient.tsx`                            |
| P1.6     | JSON-LD: TravelAgency, Product+Offer, ItemList, BreadcrumbList, Organization, WebSite           | `lib/seo/json-ld.ts`, layout, package detail, search                                   |
| SEO/AEO  | Beyond SEO remediation: homepage/Umrah/search/package/operator metadata, FAQ/WebPage graphs, entity/reputation-safe copy | `app/page.tsx`, `app/umrah/page.tsx`, `app/search/packages/page.tsx`, `app/packages/[slug]/page.tsx`, `app/operators/[slug]/page.tsx`, `lib/seo/json-ld.ts` |
| P1.7–8   | Tests: auth API + interest API + UI components                                                  | `tests/auth-api.test.ts`, `tests/interest-api.test.ts`, `tests/ui-components.test.tsx` |
| P1.9     | ATOL/ABTA admin verification endpoint                                                           | `app/api/admin/verify-operator/route.ts`                                               |
| P2.10–15 | OG locale, dead code removal, og:image, sort URL persistence, breadcrumbs, RBAC AppError        | Multiple files                                                                         |
| AUDIT    | 14+ ESLint warnings cleared                                                                     | `eslint.config.mjs` + multiple files                                                   |
| SECURITY | CSP headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS | `next.config.ts`                                                                       |
| AUTH     | Auth endpoints return minimal data only (`{user: {id, email, role, name}}`)                     | `app/api/auth/sign-in/route.ts`, `sign-up/route.ts`                                    |
| RBAC     | `requireOperatorOwnerOrAdmin` helper; admin role never in public schemas                        | `lib/api/repository.ts`, `lib/validation.ts`                                           |

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
- No `eval()`, `__non_webpack_require__`, or webpack globals. Dynamic server-only modules: `await import(/* webpackIgnore: true */ 'path')`.
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

| File                                | What                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `middleware.ts`                     | Auth guard. Public prefixes, operator/admin RBAC.                            |
| `lib/validation.ts`                 | All Zod schemas: `signUpSchema`, `signInSchema`, `interestSchema`            |
| `lib/errors.ts`                     | `AppError`, `ErrorCode`, `mapErrorToResponse`                                |
| `lib/rate-limit.ts`                 | Upstash Redis sliding window (5 req / 15 min). In-memory fallback for dev.   |
| `lib/supabase/service-role.ts`      | Admin Supabase client for account deletion                                   |
| `lib/seo/json-ld.ts`                | Shared Product, TravelAgency, ItemList, BreadcrumbList, Organization, WebSite, WebPage, FAQPage, and graph helpers |
| `components/search/search-utils.ts` | `filterByParams`, `toSearchDisplay` — server+client safe (no `'use client'`) |
| `components/ui/Breadcrumb.tsx`      | `<Breadcrumb items>` + `buildBreadcrumbJsonLd()`                             |

### Route map

| Route                        | Type           | Notes                                               |
| ---------------------------- | -------------- | --------------------------------------------------- |
| `/`                          | Server         | Landing                                             |
| `/umrah`                     | Server         | 4-step search form (client component inside)        |
| `/hajj`                      | Client         | Hajj interest capture                               |
| `/search/packages`           | Server         | SSR packages + `<SearchPackagesClient>` in Suspense |
| `/packages/[slug]`           | Server         | Package detail + JSON-LD                            |
| `/operators/[slug]`          | Server         | Operator profile                                    |
| `/requests/[id]`             | Server         | Request tracker                                     |
| `/settings`                  | Client         | GDPR: download data + delete account                |
| `/operator/*`                | Client         | Dashboard, packages, profile (role-gated)           |
| `/admin/*`                   | Client         | Bank changes, complaints triage (admin-only)        |
| `/api/auth/*`                | Route handlers | sign-up, sign-in, sign-out, me                      |
| `/api/user/export`           | POST           | GDPR Art. 20 data export                            |
| `/api/user/delete`           | DELETE         | GDPR Art. 17 erasure                                |
| `/api/admin/verify-operator` | POST           | ATOL/ABTA admin verification                        |
| `/api/interest`              | POST           | Hajj/Umrah interest capture                         |

---

## §4 — Shared Components

| Component           | Props                                           | Used by                                                         |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `VerifiedBadge`     | `className?`                                    | PackageCard                                                     |
| `InclusionChip`     | `chip: { label, included }`                     | PackageCard                                                     |
| `InclusionChipList` | `chips[], className?, data-testid?`             | PackageDetail                                                   |
| `Breadcrumb`        | `items: BreadcrumbItem[], className?`           | packages/[slug], operators/[slug], requests/[id]                |
| `RangeSlider`       | `min, max, value, onChange, aria-label-min/max` | BudgetFilter, DistanceFilter, TimePeriodFilter, UmrahSearchForm |

---

## §5 — Test Coverage

16 test files, 183 tests. All must pass before any commit.

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
npm test            # Unit tests — must stay at 183/183
npx tsc --noEmit    # Type check
```

---

## §7 — Common Pitfalls (Learned the Hard Way)

| Pitfall                                                     | Symptom                                                 | Fix                                               |
| ----------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| Utility function in `'use client'` file, called from server | `"Attempted to call X() from the server"` runtime crash | Extract to `.ts` file without `'use client'`      |
| `params` not awaited in Next.js 15                          | `TypeError: Cannot destructure property 'slug' of...`   | `const { slug } = await params`                   |
| In-memory rate limiter in serverless                        | Zero protection after cold start                        | Use Upstash Redis (see §2.3)                      |
| `eval('require')` for server-only modules                   | Webpack bundles fail / `no-require-imports` lint        | `await import(/* webpackIgnore: true */ '...')`   |
| Admin role in public Zod schema                             | Security: users can self-register as admin              | `VALID_ROLES = ['customer', 'operator']` only     |
| Full session in auth response                               | JWT/tokens exposed to client JS                         | Return only `{ user: { id, email, role, name } }` |
| Missing `await` on Repository call                          | Stale data / silent failure                             | All 84 Repository methods are async               |

---

## §8 — Historical Log (Condensed)

| Date       | What                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-06 | **MAJOR SESSION**: P0-P2 audit remediation. AppError, Upstash rate limiter, GDPR routes, Server Component search, JSON-LD, breadcrumbs, CSP headers, auth hardening, 14 ESLint fixes. Tests: 136→183. |
| 2026-06-06 | Beyond SEO remediation: public metadata, AEO FAQ blocks/schema, entity graph helpers, operator/package schema consolidation, reputation-safe copy, 320px public smoke fixes. Tests: 183/183; build clean. |
| 2026-06-06 | BUG FIX: filterByParams in client file crashed /search/packages. Fixed via search-utils.ts.                                                                                                           |
| 2026-06-06 | Audit remediation: 26 security/quality fixes. Second-pass: 10 more. Rate limiter Upstash, GDPR routes, ATOL/ABTA, breadcrumbs, JSON-LD, sort URL.                                                     |
| 2026-06-06 | Signup Internal Server Error fixed (corrupted import in lib/auth/api.ts).                                                                                                                             |
| 2026-06-05 | Calendar icon date validation, unified RangeSlider, filter overlay consistency, GBP currency, mobile header.                                                                                          |
| 2026-06-05 | .clinerules v1.1, partner page, Hajj dedup, shared UI extraction.                                                                                                                                     |
| 2026-06-04 | Phase 1 persistence: Supabase SSR, Prisma, DB adapter, auth middleware, RLS.                                                                                                                          |
| 2026-06-03 | UK/EU compliance: cookie consent, Privacy Policy, Terms, GDPR.                                                                                                                                        |
| 2026-06-02 | Operator surfaces: registration, dashboard, leads, profile.                                                                                                                                           |
| 2026-06-01 | Auth + booking flow: login/signup, quote wizard, request tracker.                                                                                                                                     |
