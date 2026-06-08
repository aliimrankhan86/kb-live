# NOW (session state)

> Canonical project status is [`/STATUS.md`](../STATUS.md). This file is the **per-session scratchpad** (detailed change log per push). Keep both in sync: summary → `STATUS.md`, detail → here.

**Update this file before every push. This is mandatory.**

## Branch & goal

- **Branch:** `dev` → target `main` after PR review
- **Goal:** Fix documented dev account login in preview/QA environments and keep auth notes consistent.
- **Current source-of-truth note:** This top section was verified on 2026-06-08.
- **Canonical handover:** `AI_NOTES.md` is now the single source of truth for verified status, implementation posture, and pending areas.

## What works (verified)

- **Tests**: `npm run test` passes (18 files, 238/238 tests) — verified 2026-06-08.
- **Build**: `npm run build` passes with 0 errors — verified 2026-06-08.
- **TypeScript**: covered by `npm run build` validity checks.

## Changes made in this session (2026-06-08 — Dev Account Login Fix)

| Task | What | Files |
| ---- | ---- | ----- |
| AUTH-PREVIEW-DEV-FALLBACK | Fixed documented dev account login outside local `NODE_ENV=development`. `/login` now accepts the reference dev accounts in local development, E2E, Vercel preview deployments, or controlled QA with `KAABATRIP_ENABLE_DEV_AUTH=true`; true production keeps the fallback disabled by default. | `lib/auth/dev-users.ts`, `app/api/auth/sign-in/route.ts`, `next.config.ts` |
| AUTH-COOKIE-SCOPE | Aligned all `__dev_user` readers with the same dev-auth gate so sign-in, middleware, server sessions, `/api/auth/me`, `/dev/login`, and sign-out work together. | `lib/auth/session.ts`, `lib/supabase/middleware.ts`, `app/dev/login/page.tsx`, `app/api/auth/sign-out/route.ts` |
| AUTH-PASSWORD-PASTE | Dev account password comparison trims accidental leading/trailing whitespace only for documented dev accounts. Real Supabase Auth passwords are unchanged. | `app/api/auth/sign-in/route.ts` |
| AUTH-DOCS | Updated handover/status docs so they no longer say the documented `/login` dev account fallback is local-development only. | `AI_NOTES.md`, `docs/README_AI.md`, `docs/NOW.md`, `STATUS.md`, `PROJECT_BRIEF.md` |

**Verification:**

- `npm run test -- tests/auth-api.test.ts tests/auth-components.test.tsx`: 2 files, 38/38 pass
- `npm run test`: 18 files, 238/238 pass
- `npx tsc --noEmit`: pass
- `npm run build`: passes with 0 errors; known Supabase Edge warning remains, plus webpack cache-size warnings
- `git diff --check`: pass
- Local API smoke: `POST /api/auth/sign-in` with `customer@example.com` + `KaabaTrip!2026` returns 200 and sets `__dev_user`
- Local Playwright smoke: `/login?type=customer` with `customer@example.com` + `KaabaTrip!2026` redirects to `/` and `/api/auth/me` returns `role=customer`
- Local Playwright smoke: `/login?type=partner` with `operator@example.com` + `KaabaTrip!2026` redirects to `/operator/dashboard` and `/api/auth/me` returns `role=operator`

## Changes made in this session (2026-06-08 — Header Login + London Airports)

| Task | What | Files |
| ---- | ---- | ----- |
| HEADER-GUEST-LOGIN | Guest header links now render while the auth probe is loading, so Login and For Partners do not disappear if `/api/auth/me` is slow or unavailable. Authenticated nav still replaces them once a user is known. | `components/layout/Header.tsx` |
| UMRAH-AIRPORT-CODES | Replaced generic city-level Umrah route values with airport-level values. London is now represented by London Heathrow (LHR) and London Gatwick (LGW), alongside Birmingham (BHX) and Manchester (MAN), for both departing and returning selections. | `components/umrah/UmrahSearchForm.tsx`, `lib/airports.ts` |
| SEARCH-BACKEND-AIRPORT | Server-side package filtering now validates and filters by submitted airport code, so LHR and LGW produce distinct backend search results. Operator package API validation also uses the shared airport code catalogue. | `components/search/search-utils.ts`, `app/api/operator/packages/route.ts`, `tests/search-utils.test.ts` |
| UMRAH-LOCAL-DATES | Fixed exact-date defaults to use local date formatting instead of UTC `toISOString()`, preventing the UK timezone from defaulting departure to yesterday and blocking submit. | `components/umrah/UmrahSearchForm.tsx` |
| AIRPORT-DOCS | Updated UX guidance to describe airport-level route capture and London Heathrow/Gatwick as separate launch options. | `docs/UX_GUIDELINES.md`, `docs/NOW.md`, `AI_NOTES.md` |

**Verification:**

- `npx tsc --noEmit`: pass
- `npm run test -- tests/search-utils.test.ts tests/auth-components.test.tsx`: 2 files, 22/22 pass
- `npm run test`: 18 files, 238/238 pass after the dev-auth gate coverage was added
- `npm run build`: passes with 0 errors
- `git diff --check`: pass
- Manual Playwright smoke: guest Login and For Partners links visible on `/`; `/umrah` includes LHR, LGW, BHX, and MAN in departure/return airport selects; submit with `departureAirport=LGW` and `returnAirport=LHR` reaches `/search/packages`
- Responsive Playwright smoke: `/`, `/umrah`, `/search/packages?type=umrah&departureAirport=LGW` at 320px and 1280px; no HTTP error text and no horizontal overflow

## Changes made in this session (2026-06-08 — Single Source Handover)

| Task | What | Files |
| ---- | ---- | ----- |
| HANDOVER-SOT | Replaced the conflicting historical AI notes with a dated, status-led handover for Claude/AI agents covering business plan, functional map, implementation architecture, recent verified work, auth/dev personas, verification commands, and pending areas. | `AI_NOTES.md` |
| HANDOVER-DOCS | Pointed the AI entry doc and current session state at `AI_NOTES.md` as the canonical handover, and updated stale status for tests, E2E, auth, operator packages, and analytics. | `docs/README_AI.md`, `docs/NOW.md` |

## Changes made in this session (2026-06-08 — Auth Login Personas)

| Task | What | Files |
| ---- | ---- | ----- |
| AUTH-DEV-SIGNIN | Normal `/login` accepts documented dev persona credentials when dev auth is enabled, verifies `KaabaTrip!2026`, sets `__dev_user`, and returns the same safe `{ user }` shape as real auth. Real Supabase sign-in failures now return a safe 401 instead of a masked 500. | `app/api/auth/sign-in/route.ts`, `lib/auth/dev-users.ts`, `lib/auth/api.ts`, `lib/errors.ts` |
| AUTH-ME-SHELL | Added `/api/auth/me` and switched the public header to it so Supabase sessions, `__dev_user`, and `__e2e_user` render customer/operator/admin navigation consistently. Sign-out clears `__dev_user`. | `app/api/auth/me/route.ts`, `app/api/auth/sign-out/route.ts`, `components/layout/Header.tsx` |
| AUTH-PASSWORD-TOGGLE | Added accessible icon-only show/hide password controls to login and signup password fields. Signup submit remains disabled until the password complexity checklist passes. | `components/auth/PasswordInput.tsx`, `components/auth/LoginForm.tsx`, `components/auth/SignUpForm.tsx`, `docs/UX_GUIDELINES.md` |
| AUTH-DEV-SMOKE | Fixed local Turbopack dev rendering for client components that import `Repository` by adding a browser-only adapter alias, and allowed `images.unsplash.com` for package cards. | `next.config.ts`, `lib/api/db/client-adapter-stub.ts` |
| AUTH-TESTS | Added unit coverage for login role redirects and password visibility toggles. Updated the signup mismatch E2E fixture to use complexity-compliant mismatched passwords. | `tests/auth-components.test.tsx`, `e2e/signup-password-mismatch.spec.ts` |

**Verification:**

- `npx tsc --noEmit`: pass
- `git diff --check`: pass
- `npm run test`: 17 files, 232/232 pass
- `npm run build`: passes with 0 errors; known Supabase Edge warning remains, plus webpack cache-size warnings
- Manual Playwright smoke: `/`, `/umrah`, `/search/packages?type=umrah` at 320px and 1280px; no HTTP errors and no horizontal overflow
- Manual Playwright auth smoke: `/login?type=customer` with `customer@example.com` + `KaabaTrip!2026` redirects to `/` and shows customer navigation; `/login?type=partner` with `operator@example.com` + `KaabaTrip!2026` redirects to `/operator/dashboard`
- `npx playwright test e2e/signup-password-mismatch.spec.ts`: 3 passed
- `npx playwright test`: 57 passed, 6 skipped

## Changes made in this session (2026-06-08 — Umrah Search UX)

| Task | What | Files |
| ---- | ---- | ----- |
| UMRAH-ROUTE | Historical city-level route capture was superseded by the current airport-level contract: LHR, LGW, BHX, and MAN. | `components/umrah/UmrahSearchForm.tsx`, `components/umrah/umrah-search-form.module.css`, `lib/airports.ts` |
| UMRAH-DATES | Reworked travel timing as an explicit either/or choice between exact dates and flexible holiday/religious periods such as Christmas school holidays, Easter school holidays, Ramadan, and summer school holidays. | `components/umrah/UmrahSearchForm.tsx`, `components/umrah/umrah-search-form.module.css` |
| UMRAH-HOTEL-BUDGET | Changed hotel preference to a clearer multi-select model, removed currency-symbol presentation from the search form budget copy, added a compact search summary, and wired comma-separated hotel-star filters into results. | `components/umrah/UmrahSearchForm.tsx`, `components/umrah/umrah-search-form.module.css`, `components/search/search-utils.ts` |
| COOKIE-CONSENT | Made "Essential only" the visually preselected-looking yellow action in the cookie banner while keeping "Accept all" secondary. | `components/compliance/CookieConsent.tsx` |
| UX-DOCS | Documented the route, date, and hotel-preference search patterns. | `docs/UX_GUIDELINES.md` |

**Verification:**

- `npx tsc --noEmit`: pass
- `git diff --check`: pass
- `npm run test`: 17 files, 227/227 pass
- `npm run build`: passes with 0 errors
- Manual Playwright smoke: `/`, `/umrah`, `/search/packages?type=umrah` at 320px and 1280px; no 404s and no horizontal overflow
- Manual Playwright interaction at that time used city-level `LON`; current verified contract supersedes this with airport-level `departureAirport` / `returnAirport` values such as `LGW` and `LHR`.
- Cookie smoke: `Essential only` computed as yellow background, black text, yellow border
- `npx playwright test --project=chromium`: 19 passed, 2 skipped
- `npx playwright test`: 56 passed, 6 skipped, 1 unrelated WebKit failure in `e2e/signup-password-mismatch.spec.ts` where the signup full-name required field remained empty and blocked the password mismatch assertion

## Changes made in this session (2026-06-08 — Operator Analytics Events)

| Task | What | Files |
| ---- | ---- | ----- |
| ANALYTICS-SCHEMA | Added `AnalyticsEventType` enum and `AnalyticsEvent` Prisma model with operator/package relations, event metadata, and occurrence timestamp. Pushed schema to Supabase and enabled RLS on `analytics_events`. | `prisma/schema.prisma` |
| ANALYTICS-REPO | Added `Repository.trackEvent`, `getAnalyticsSummary`, `getAnalyticsTrend`, `createQuoteRequest`, and `updateBookingIntentStatus`. Added nonblocking event hooks for offer sent, booking started, and future confirmed/closed status transitions. | `lib/api/repository.ts`, `lib/api/mock-db.ts`, `lib/api/db/adapter.ts`, `lib/types.ts` |
| ANALYTICS-TRACKING | Tracks package views on published package detail pages and quote requests through a new server-side quote request API. Quote prefill carries non-PII package/operator attribution. | `app/packages/[slug]/page.tsx`, `app/api/quote-requests/route.ts`, `components/quote/QuoteRequestWizard.tsx`, `lib/quote-prefill.ts` |
| ANALYTICS-ACTIONS | Routed offer creation and booking intent creation through server APIs so `offer_sent` and `booking_started` are captured server-side when the real DB is enabled, while preserving the current MockDB UI mirror. | `app/api/operator/offers/route.ts`, `app/api/booking-intents/route.ts`, `components/operator/OfferForm.tsx`, `components/request/RequestDetail.tsx` |
| ANALYTICS-DASHBOARD | Rebuilt operator analytics to use real event summaries/trends with 7/30/90 day ranges, summary cards, conversion funnel, and existing chart primitives. | `app/operator/analytics/page.tsx`, `components/operator/AnalyticsDashboard.tsx` |

**Verification:**

- `npx prisma db push`: database in sync
- `npx prisma validate`: schema valid
- `npx prisma generate`: Prisma client generated
- `ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;`: executed successfully
- Read-only Prisma verification: `analyticsEventCount` query succeeded; RLS flag returned `true`
- `npx tsc --noEmit`: pass
- `npm run test`: 17 files, 227/227 pass
- `npm run build`: passes with 0 errors
- `npx playwright test --project=chromium`: 19 passed, 2 skipped
- `npx playwright install firefox webkit`: installed missing browser binaries
- `npx playwright test`: 57 passed, 6 skipped
- Final `npx prisma db push`: database already in sync

## Changes made in this session (2026-06-07 — Auth UX + Umrah Airport)

| Task              | What                                                                                                                                                                                                                              | Files                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| AUTH-LOGIN-TABS   | LoginForm: added Traveller/Partner tab switcher with distinct headings, subtitles, and signup links per role. Default tab is Traveller.                                                                                           | `components/auth/LoginForm.tsx`                 |
| AUTH-FORGOT-PWD   | LoginForm: added "Forgot your password?" link that reveals a password reset view with email input, submit button, success confirmation, and back-to-sign-in link. Gracefully handles missing `/api/auth/reset-password` endpoint. | `components/auth/LoginForm.tsx`                 |
| AUTH-SIGNUP-TABS  | SignUpForm: reads `?type=` query param to default tab (customer/partner). Dynamic heading and subtitle per role. Login link passes correct `?type=` param back.                                                                   | `components/auth/SignUpForm.tsx`                |
| AUTH-HEADER       | Login and Signup pages now include `<Header />` so users can navigate away via top menu (Umrah, Hajj, Get a Quote, For Partners).                                                                                                 | `app/login/page.tsx`, `app/signup/page.tsx`     |
| UMRAH-AIRPORT     | UmrahSearchForm: added Step 1 "Where will you fly from?" with UK airport dropdown (LHR, LGW, STN, BHX, MAN, GLA, EDI, BRS). Default: London Heathrow. Includes city hint and hidden form input. All subsequent steps renumbered.  | `components/umrah/UmrahSearchForm.tsx`          |
| UMRAH-AIRPORT-CSS | Added `.searchForm__airportField`, `.searchForm__airportSelect`, `.searchForm__airportHint` styles matching existing date input and child select patterns.                                                                        | `components/umrah/umrah-search-form.module.css` |
| TESTS             | Updated auth-components tests: 16 tests covering tab switching, forgot password flow, role-specific links, and existing error/signup scenarios.                                                                                   | `tests/auth-components.test.tsx`                |

**Verification:**

- `npm run test`: 227/227 pass (up from 222 — 5 new tests added)
- `npm run build`: passes with 0 errors, 0 warnings
- `npx tsc --noEmit`: pass (0 errors)

## Previous session history

See `AI_NOTES.md` §8 for full historical log. Key prior work:

- 2026-06-07: Overlay consistency refresh + Prisma adapter route fix
- 2026-06-06: SEO/AEO content expansion (T19), beyond SEO audit/remediation
- 2026-06-06: P0-P2 audit remediation (security, GDPR, error handling, ESLint)

---

## Pending / not verified

- **Production env validation** ⏳ PENDING. Confirm production has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, and verify the Redis rate-limit path outside local/dev fallback.
- **Deployed Prisma/Supabase cutover** ⏳ PENDING. Local real-DB paths exist with `FEATURE_USE_REAL_DB=true`; deployed environment needs explicit smoke against Supabase data, auth redirects, and RLS.
- **Domain launch** ⏳ PENDING. After purchase, update `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, Supabase auth redirect URLs, canonical URLs, robots, sitemap, JSON-LD base URLs, and hardcoded `kaabatrip.com` assumptions.
- **Plausible analytics** ⏳ PENDING. Wire after domain is live and cookie consent is confirmed.
- **Payment evidence storage/RLS** ⏳ PENDING. Re-verify operator/admin read access for payment evidence files and resolve the product/architecture policy conflict on metadata-only versus byte storage.
- **Admin reconciliation** ⏳ PENDING. `/admin/reconciliation` exists; business/export completeness still needs explicit verification.
- **Local Chrome SEO/AEO QA** ⏳ PENDING. Server-side SEO/AEO work was completed earlier, but a rendered local Chrome audit remains useful.
- **Test coverage** ⏳ PENDING. Tests pass, but critical auth/session/API/adapter/evidence paths need deeper coverage.

## Local tooling note

- `.agents/`, `.claude/`, and `scripts/_upstash_check.mjs` are intentionally untracked local/tooling artifacts. Do not push them by default.
