# NOW (session state)

> Canonical project status is [`/STATUS.md`](../STATUS.md). This file is the **per-session scratchpad** (detailed change log per push). Keep both in sync: summary → `STATUS.md`, detail → here.

**Update this file before every push. This is mandatory.**

## Branch & goal

- **Branch:** `dev` (clean — Q1–Q6 + Prompts 5 + 6 all merged)
- **Goal:** Prompts 5 + 6 complete — transactional email suite and cron job suite live. Next: Gate 3 operator onboarding. Run DB migration SQL (§23) in Supabase before deploying.
- **Current source-of-truth note:** Prompt 6 verified 2026-06-12. Full detail in `AI_NOTES.md` §23.
- **Canonical handover:** `AI_NOTES.md` is the single source of truth for verified status, implementation posture, and pending areas.

## What works (verified)

- **Tests**: `npm run test` passes (24 files, 1,818/1,818 tests) — verified 2026-06-12.
- **Build**: `npm run build` passes with 0 errors — verified 2026-06-12.
- **TypeScript**: `npx tsc --noEmit` passes — verified 2026-06-12.
- **Architecture decision**: Supabase + Prisma + Upstash Redis is the correct target/production architecture. MockDB is not the production architecture, but production-facing MockDB imports remain and are now documented as launch blockers in `AI_NOTES.md` §0.

## Changes made in this session (2026-06-12 — Prompts 5 + 6: Email + Cron Suite)

| Task | What | Files |
| ---- | ---- | ----- |
| Schema | `source_operator_id`, `nudge_sent_at` → `quote_requests`; `outcome_followup_sent_at` → `booking_intents` | `prisma/schema.prisma` |
| Adapter | `mapQuoteRequest` + `saveRequest` persist `sourceOperatorId` | `lib/api/db/adapter.ts` |
| Email fix | Greeting `"Assalamualaikum"` → `"Salaam"` | `emails/EnquiryConfirmation.tsx` |
| New templates | Operator nudge + outcome followup | `emails/OperatorNudge.tsx`, `emails/OutcomeFollowup.tsx` |
| New send fns | `sendOperatorNudge`, `sendOutcomeFollowup` | `lib/email/send.tsx` |
| Cron auth | `verifyCronSecret` — `Authorization: Bearer {CRON_SECRET}` | `lib/cron-auth.ts` |
| Cron 1 | Nudge operator 48 h after unanswered enquiry — daily 08:00 UTC | `app/api/cron/nudge-operators/route.ts` |
| Cron 2 | Outcome followup 10–14 days after booking intent — daily 09:00 UTC | `app/api/cron/outcome-followup/route.ts` |
| Cron 3 | Expire packages with past `dateWindow.end` — daily 02:00 UTC | `app/api/cron/expire-packages/route.ts` |
| Outcomes | One-tap outcome endpoint; writes `BookingOutcome` (never deleted) | `app/api/outcomes/[intentId]/route.ts` |
| vercel.json | 3 new cron schedules registered | `vercel.json` |
| Tests | 8 new tests: `verifyCronSecret` + 401 guard per cron route | `tests/cron-auth.test.ts` |

**⚠️ DB migration required before deploy** — run in Supabase SQL editor:
```sql
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS source_operator_id TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS nudge_sent_at TIMESTAMPTZ;
ALTER TABLE booking_intents ADD COLUMN IF NOT EXISTS outcome_followup_sent_at TIMESTAMPTZ;
```

**Verification:** `npx tsc --noEmit` pass · `npm run test` 1,818/1,818 (24 files) · `npm run build` 0 errors.

---

## Changes made in this session (2026-06-12 — Q6 Ranking Transparency + Featured Infrastructure)

| Task | What | Files |
| ---- | ---- | ----- |
| TASK1 neutral sort | `lib/ranking.ts`: `scorePackage` (45% completeness + 35% recency + 20% response rate) + `sortByScore`. `Repository.listPackages` calls `sortByScore` server-side. | `lib/ranking.ts`, `lib/api/repository.ts` |
| TASK2 disclosure | `NEUTRAL_SORT_DISCLOSURE` near every sort control, linked to `/how-we-rank`. `'relevance'` sort option added to PackageList preserving server order. | `components/search/PackageList.tsx`, `components/packages/PackagesBrowse.tsx` |
| TASK3 /how-we-rank | Full DMCC Act 2024 §20 disclosure page: 4 criteria cards, Featured rules (max 2, labelled), §7 verification verbatim. Indexed, sitemap, footer link. | `app/how-we-rank/page.tsx`, `app/sitemap.ts`, `components/layout/Footer.tsx` |
| TASK4 Featured infra | DB column `is_featured`, `isFeatured` in type/adapter. `FEATURE_FEATURED_SLOTS` flag (server-only). `FeaturedBadge` component. PackageList: featured section above neutral, capped at 2, flag-gated. | `prisma/schema.prisma`, `lib/types.ts`, `lib/api/db/adapter.ts`, `lib/config.ts`, `.env.example`, `components/search/FeaturedBadge.tsx`, `components/search/PackageList.tsx`, `app/search/packages/page.tsx` |
| TASK5 tests | 11 ranking tests, 10 featured-slot tests, /how-we-rank metadata + star-char guard in banned-phrases. PostCSS config fixed for Vite/Vitest. | `tests/ranking.test.ts`, `tests/featured-slots.test.tsx`, `tests/banned-phrases.test.ts`, `postcss.config.mjs` |

**Verification:** `npx tsc --noEmit` pass · `npm run test` 1,810/1,810 (23 files) · `npm run build` 0 errors.

## Changes made in this session (2026-06-12 — Q5 SEO Pass)

| Task | What | Files |
| ---- | ---- | ----- |
| Base metadata | Removed banned phrases from default description | `lib/seo.ts` |
| Root layout JSON-LD | Organization + WebSite via helper; removed wrong inline TravelAgency schema | `app/layout.tsx` |
| Homepage JSON-LD | Removed duplicate org/site schemas (now in layout); fixed FAQ copy | `app/page.tsx` |
| Packages list | Title, canonical, OG+Twitter, WebPage JSON-LD | `app/packages/page.tsx` |
| Package detail | Title pattern, Twitter card with image | `app/packages/[slug]/page.tsx` |
| Operator profile | Twitter card | `app/operators/[slug]/page.tsx` |
| Search results | Dynamic Twitter card with count+type | `app/search/packages/page.tsx` |
| Corridor pages (3) | `generateMetadata()` async; dynamic noindex on zero supply; title/JSON-LD de-banned | `app/umrah/london/page.tsx`, `app/umrah/birmingham/page.tsx`, `app/umrah/manchester/page.tsx` |
| Auth/Quote/Showcase | `robots: { index: false }` on all utility pages | `app/login/page.tsx`, `app/signup/page.tsx`, `app/quote/page.tsx`, `app/showcase/page.tsx` |
| How-it-works | OG+Twitter, WebPage+FAQ JSON-LD wired into JSX | `app/how-it-works/page.tsx` |
| Terms/Privacy | OG+Twitter added | `app/terms/page.tsx`, `app/privacy/page.tsx` |
| Partner page | Twitter card; banned copy removed; WebPage JSON-LD | `app/partner/page.tsx` |
| Sitemap | Corridor pages conditional on live supply; added /how-it-works, /partner | `app/sitemap.ts` |
| Robots | Added /showcase to disallow | `app/robots.ts` |
| Content rules | `BANNED_METADATA_PHRASES` + `NEUTRAL_SORT_DISCLOSURE` exports | `lib/content-rules.ts` (new) |
| Banned-phrase CI | 1,425 assertions; fails CI if banned phrase in any metadata constant | `tests/banned-phrases.test.ts` (new) |

**Verification:** `npx tsc --noEmit` pass · `npm run test` 1,425/1,425 (21 files) · `npm run build` 0 errors.

## Changes made in this session (2026-06-12 — Q4 Mobile Polish)

| Task | What | Files |
| ---- | ---- | ----- |
| GROUP1 Home/Umrah tap targets | Corridor + FAQ nav links `inline-flex min-h-[44px]` | `app/page.tsx`, `app/umrah/page.tsx` |
| GROUP2 Search UI tap targets | savedChip/filterChip/clearFilters 44px; CompareBar chipRemove hit area expanded to 44px | `components/search/packages.module.css`, `components/search/CompareBar.module.css` |
| GROUP3 ComparisonTable overflow | `overflow-x:auto` wrapper; `min-w-[320px]` table | `components/request/ComparisonTable.tsx` |
| GROUP4 Quote steps a11y | Step4 room inputs: id/htmlFor/min-h-44/inputMode; Step5 label→textarea linked; data-sharing disclosure added | `components/quote/steps/Step4GroupBudget.tsx`, `components/quote/steps/Step5Review.tsx` |
| GROUP6 Confirmation clipboard | New `ReferenceCodeDisplay` client component; confirmation page uses it | `components/request/ReferenceCodeDisplay.tsx`, `app/requests/[id]/confirmation/page.tsx` |
| GROUP7 Auth tap targets | Login/signup tab buttons + forgot-password/back links `min-h-[44px]` | `components/auth/LoginForm.tsx`, `components/auth/SignUpForm.tsx` |
| GROUP8 CookieConsent | Accurate copy (no analytics cookies); removed analytics table row; 'Accept all' → 'Accept'; all buttons min-h-[44px]; table `overflow-x:auto` | `components/compliance/CookieConsent.tsx` |

**Verification:** `npx tsc --noEmit` pass · `npm run test` 238/238 · `npm run build` 0 errors.

## Changes made in this session (2026-06-12 — Q3 IA/Nav Pass)

| Task | What | Files |
| ---- | ---- | ----- |
| STEP1 Primary nav | Replaced `Umrah / Hajj / Get a Quote` with `Packages / Compare / How it works`. Compare → `/search/packages`. For Partners → For Operators. New path icons. | `components/layout/Header.tsx` |
| STEP2 Footer | Added `cities` prop; verbatim "what we do" paragraph; dynamic "Departing from" city links in Platform section. | `components/layout/Footer.tsx` |
| STEP3 Layout wiring | Root layout async; fetches `Repository.getDistinctDepartureCities()` with try/catch; passes to Footer. | `app/layout.tsx` |
| STEP4 Breadcrumbs | Breadcrumb added to Ramadan, Cost guide pages. CityCorridor gets optional `breadcrumbItems` prop + breadcrumb before h1; duplicate `<Header />` removed. Corridor pages (London, Birmingham, Manchester) pass breadcrumb items. | `app/umrah/ramadan/page.tsx`, `app/umrah/cost/page.tsx`, `components/marketing/CityCorridor.tsx`, `app/umrah/london/page.tsx`, `app/umrah/birmingham/page.tsx`, `app/umrah/manchester/page.tsx` |
| STEP5 Confirmation breadcrumb | Breadcrumb at top of booking confirmation page. | `app/requests/[id]/confirmation/page.tsx` |
| STEP6 Sidebar back links | OperatorSidebar: "Back to PilgrimCompare" link. AdminSidebar: new component with active highlighting + back link. Admin layout wired to AdminSidebar. | `components/operator/OperatorSidebar.tsx`, `components/admin/AdminSidebar.tsx`, `app/admin/layout.tsx` |
| FIX Unused var | Pre-existing lint warning in ComparisonTable removed. | `components/request/ComparisonTable.tsx` |

**Verification:** `npx tsc --noEmit` pass · `npm run test` 238/238 · `npm run build` 0 errors · desktop nav/footer confirmed in preview · mobile drawer confirmed at 390px · breadcrumbs visible on corridor + confirmation pages.

## Changes made in this session (2026-06-12 — Q2 Legal Pages)

| Task | What | Files |
| ---- | ---- | ----- |
| STEP1 lib/legal.ts | Created single source of truth for entity details. `LEGAL_ENTITY_BLOCK` exports companyName, companyNumber, vatNumber, tradingName, registeredCountry, contactEmail, registeredOffice (empty pending virtual office — see AI_NOTES.md §14). | `lib/legal.ts` |
| STEP2 Legal entity guard test | New Vitest test blocks PR merge if companyName, companyNumber, or contactEmail is ever accidentally cleared. | `tests/legal.test.ts` |
| STEP3 /terms rewrite | Full rewrite of existing page (had wrong company name "PilgrimCompare Limited", fake reg number "[Registration in progress]", wrong ATOL claims, no LEGAL REVIEW tags, hydration bug from `new Date()`). Now: correct entity from LEGAL_ENTITY_BLOCK, all 11 §10.1 elements, verbatim §1/§4/§7 copy, TOC anchor nav, static LAST_UPDATED constant, 12× `{/* LEGAL REVIEW */}` tags on liability section. | `app/terms/page.tsx` |
| STEP4 /privacy rewrite | Full rewrite (had wrong controller name, missing mandatory verbatim operator data-sharing disclosure, wrong Supabase region "London" → "EU West / Ireland", wrong cookie statement saying "optional analytics cookies" — Plausible is cookieless). Now: correct controller from LEGAL_ENTITY_BLOCK, mandatory verbatim disclosure in highlighted block, Plausible cookieless statement, strictly-necessary-only cookie table. | `app/privacy/page.tsx` |
| STEP5 /how-it-works | New page. 5-step model per §10.5, §7 verification statement verbatim, all three §4 standard copy lines, mobile-first existing tokens. | `app/how-it-works/page.tsx` |
| STEP6 Footer wiring | Import LEGAL_ENTITY_BLOCK (entity block no longer hardcoded). Added `/how-it-works` link to Legal section. Removed stale `/terms#cookies` link (cookie info now in Privacy Policy). | `components/layout/Footer.tsx` |

**Verification:** `npx tsc --noEmit` pass · `npm run test` 238/238 · `npm run build` 0 errors · all three pages verified at 390px in preview · footer Legal links confirmed: How it works / Terms of Use / Privacy Policy · entity block reads from lib/legal.ts · 0 console errors.

**LEGAL REVIEW tag count:** 12 in `app/terms/page.tsx` — all in liability section (§8). Run `grep -n "LEGAL REVIEW" app/terms/page.tsx` to list for solicitor review.

## Changes made in this session (2026-06-12 — Q1 Brand & Legal Cleanup)

| Task | What | Files |
| ---- | ---- | ----- |
| STEP1 KaabaTrip eradication | Replaced all KaabaTrip brand references across code, docs, tests, config. Zero hits remain outside `docs/_archive/` (historical record, left intentionally) and `docs/PILGRIMCOMPARE_QUALITY_PROMPTS.md` (intentional search-term references). | `public/site.webmanifest`, `scripts/check-upstash.mjs`, `next.config.ts`, `tests/auth-components.test.tsx`, `CLAUDE.md`, `AI_NOTES.md`, `STATUS.md`, `docs/NOW.md`, multiple docs/, `.clinerules`, `components/auth/LOGIN_MODAL_IMPLEMENTATION.md` |
| STEP2 Banned-phrase audit | Fixed 11 violations: ATOL blanket claims → "ATOL Numbers Checked" / "status checked before listing"; Partner → Operator across full auth flow (LoginForm, SignUpForm, pages, metadata, test assertions). | `components/marketing/Hero.tsx`, `components/umrah/UmrahSearchForm.tsx`, `app/hajj/page.tsx`, `app/umrah/ramadan/page.tsx`, `components/auth/LoginForm.tsx`, `components/auth/SignUpForm.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `tests/auth-components.test.tsx` |
| STEP3 Dynamic departure cities | Replaced all hardcoded city lists with `Repository.getDistinctDepartureCities()`. New method in `lib/api/repository.ts` + `lib/api/db/adapter.ts`. All four marketing pages now async; corridor pages show empty state if no live packages. Quote wizard receives cities from server. | `lib/api/repository.ts`, `lib/api/db/adapter.ts`, `app/page.tsx`, `app/umrah/page.tsx`, `app/umrah/cost/page.tsx`, `app/umrah/ramadan/page.tsx`, `app/umrah/london/page.tsx`, `app/umrah/birmingham/page.tsx`, `app/umrah/manchester/page.tsx`, `components/quote/QuoteRequestWizard.tsx`, `components/quote/steps/Step2LocationDates.tsx`, `app/quote/page.tsx` |

**Verification:** `npx tsc --noEmit` pass · `npm run test` 235/235 · `npm run build` 0 errors.

---

## Changes made in this session (2026-06-09 — Master Architecture/Security Audit)

| Task | What | Files |
| ---- | ---- | ----- |
| ARCH-DECISION | Resolved the architecture conflict: trust Supabase/Prisma/Redis as the target and production architecture; MockDB is test/dev simulation only. | `AI_NOTES.md`, `docs/README_AI.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/NOW.md` |
| PRELAUNCH-AUDIT | Added a launch-readiness audit with P0 blockers: trusted auth role source, production MockDB cutover, hardcoded `cust1` removal, production fail-fast, RLS/grants audit, and deployed real-DB smoke. | `AI_NOTES.md` |
| DOC-DRIFT-FIX | Corrected stale dev-auth wording. Dev personas are local dev/E2E only; Vercel preview and production must use real Supabase Auth. | `AI_NOTES.md`, `docs/README_AI.md`, `docs/NOW.md` |

**Verification so far:**

- `npm run lint`: pass, with Next.js deprecation notice for `next lint`.
- `npx prisma validate`: pass.
- `npx tsc --noEmit`: pass.
- `npm run test`: pass, 18 files, 239/239 tests.
- `npm run build`: pass, 0 build errors.
- Secret scan by tracked filenames/patterns: no tracked `.env`, `.pem`, service-role, Upstash token, or `DATABASE_URL=` matches found.

## Changes made in this session (2026-06-08 — Dev Account Login Fix)

| Task | What | Files |
| ---- | ---- | ----- |
| AUTH-PREVIEW-DEV-FALLBACK | Fixed documented dev account login outside local `NODE_ENV=development`. Dev personas work under `npm run dev` (`NODE_ENV=development`) and `E2E_TESTING=1` only. Production keeps the fallback disabled by default. | `lib/auth/dev-users.ts`, `app/api/auth/sign-in/route.ts`, `next.config.ts` |
| AUTH-COOKIE-SCOPE | Aligned all `__dev_user` readers with the same dev-auth gate so sign-in, middleware, server sessions, `/api/auth/me`, `/dev/login`, and sign-out work together. | `lib/auth/session.ts`, `lib/supabase/middleware.ts`, `app/dev/login/page.tsx`, `app/api/auth/sign-out/route.ts` |
| AUTH-PASSWORD-PASTE | Dev account password comparison trims accidental leading/trailing whitespace only for documented dev accounts. Real Supabase Auth passwords are unchanged. | `app/api/auth/sign-in/route.ts` |
| AUTH-DOCS | Updated handover/status docs so they no longer say the documented `/login` dev account fallback is local-development only. | `AI_NOTES.md`, `docs/README_AI.md`, `docs/NOW.md`, `STATUS.md`, `PROJECT_BRIEF.md` |

**Verification:**

- `npm run test -- tests/auth-api.test.ts tests/auth-components.test.tsx`: 2 files, 38/38 pass
- `npm run test`: 18 files, 238/238 pass
- `npx tsc --noEmit`: pass
- `npm run build`: passes with 0 errors; known Supabase Edge warning remains, plus webpack cache-size warnings
- `git diff --check`: pass
- Local API smoke: `POST /api/auth/sign-in` with `customer@example.com` + `PilgrimCompare!2026` returns 200 and sets `__dev_user`
- Local Playwright smoke: `/login?type=customer` with `customer@example.com` + `PilgrimCompare!2026` redirects to `/` and `/api/auth/me` returns `role=customer`
- Local Playwright smoke: `/login?type=partner` with `operator@example.com` + `PilgrimCompare!2026` redirects to `/operator/dashboard` and `/api/auth/me` returns `role=operator`

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
| AUTH-DEV-SIGNIN | Normal `/login` accepts documented dev persona credentials when dev auth is enabled, verifies `PilgrimCompare!2026`, sets `__dev_user`, and returns the same safe `{ user }` shape as real auth. Real Supabase sign-in failures now return a safe 401 instead of a masked 500. | `app/api/auth/sign-in/route.ts`, `lib/auth/dev-users.ts`, `lib/auth/api.ts`, `lib/errors.ts` |
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
- Manual Playwright auth smoke: `/login?type=customer` with `customer@example.com` + `PilgrimCompare!2026` redirects to `/` and shows customer navigation; `/login?type=partner` with `operator@example.com` + `PilgrimCompare!2026` redirects to `/operator/dashboard`
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
- **Trusted auth role source** ⏳ PENDING. Current session/middleware code reads Supabase `user_metadata.role`; production authorization must move to `app_metadata` or the server-side `users` table.
- **Production MockDB cutover** ⏳ PENDING. Direct MockDB imports remain in production-facing UI/API paths and must be removed or isolated before public launch.
- **Hardcoded customer identity** ⏳ PENDING. `cust1` is still used in quote/request/booking paths; require login or implement a real anonymous lead model.
- **Production fail-fast** ⏳ PENDING. Production must not silently run MockDB if `FEATURE_USE_REAL_DB` is missing.
- **RLS/grants audit** ⏳ PENDING. Run Supabase advisors and tighten broad/incomplete RLS policies before relying on exposed Data API tables.
- **Domain launch** ⏳ PENDING. After purchase, update `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, Supabase auth redirect URLs, canonical URLs, robots, sitemap, JSON-LD base URLs, and hardcoded `pilgrimcompare.com` assumptions.
- **Plausible analytics** ⏳ PENDING. Wire after domain is live and cookie consent is confirmed.
- **Payment evidence storage/RLS** ⏳ PENDING. Re-verify operator/admin read access for payment evidence files and resolve the product/architecture policy conflict on metadata-only versus byte storage.
- **Admin reconciliation** ⏳ PENDING. `/admin/reconciliation` exists; business/export completeness still needs explicit verification.
- **Local Chrome SEO/AEO QA** ⏳ PENDING. Server-side SEO/AEO work was completed earlier, but a rendered local Chrome audit remains useful.
- **Test coverage** ⏳ PENDING. Tests pass, but critical auth/session/API/adapter/evidence paths need deeper coverage.

## Local tooling note

- `.agents/` and `.claude/` are intentionally untracked local/tooling artifacts. Do not push them by default.
- `npm run check:upstash` runs the tracked `scripts/check-upstash.mjs` diagnostic. It verifies Upstash env presence, Redis `PING`, and one rate-limit probe without printing Redis URLs, tokens, token lengths, or other secret-derived values.
