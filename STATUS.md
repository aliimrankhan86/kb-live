# PilgrimCompare — Project Status

> **Single rolling tracker.** Any AI/dev: read this for current state. Update it after work is **done + tested + verified** (see `CLAUDE.md` rule).
> Detailed handover lives in `AI_NOTES.md`. Cold-start brief: `HANDOFF.md`. Business: `BUSINESS.md`.

**Last verified:** 2026-10-09 (batch 2 one list and room prices, PR PR_REF into `dev`, not merged; batch 1 PR #118 merged into `dev`. Production `main` `a4e7075`) · **Branch:** `fix/batch-2-single-list-room-prices` · **App:** Next.js 15.5 / React 19 / Supabase / Prisma

> **Direction:** `PILGRIMCOMPARE_PROJECT_DIRECTION.md` (repo root) is now the source of truth — read first every session. Parked features tracked in `PARKED_FEATURES.md`.

---

> **2026-10-09 batch 2 (`fix/batch-2-single-list-room-prices`, PR PR_REF into `dev`, not merged):** the `expire-packages` cron skips empty or malformed end dates instead of failing the run (rule unchanged). One package list at `/packages` (UX-08 option B): `/search/packages?...` answers 308 to `/packages?...`, sitemap and every link use `/packages`. Optional quad, triple and double price per person (item 9, closes UX-11): wizard, package page "Prices by room type", compare rows, CSV. **Migration `supabase/migrations-pending/015_package_room_prices.sql` is pending: apply on staging before the preview check and on production before release to `main`** (rollback file alongside). A partial package PATCH no longer resets status and defaults (Zod 4). CSV round trip tested per field; a stated £0 deposit now survives. Open for Ali: cron expiry date (departure or return). Vitest 2,265 · Playwright 69 passed, 6 skipped · real-DB 37 of 37. Report `docs/uat/BATCH2_REPORT.md`, detail `AI_NOTES.md` §B2.
> 🛠️ **Gotcha: Zod 4 fills `.default()` values inside `.partial()`.** `updatePackageSchema.parse({ id, airline })` returns `status: 'draft'` and default bands, inclusions and room types, so a partial update overwrote them. Not a Zod bug (v4 behaviour): a partial-update route must keep only the keys the client sent (`app/api/operator/packages/route.ts` does).

> **2026-10-09 batch 1 reliability and UX (`fix/batch-1-reliability-and-ux`, PR #118, merged into `dev` `0e4ffa8`):** enquiry, quote and booking emails now send inside `after()` (were fire and forget). Packages whose departure has passed leave every public list; their URL shows "This departure has passed". `/packages` no longer scrolls sideways on phones. Compare shows metres and walking time, titles and nights, and neutral marks. Server-rendered operator names with links, themed hotel image fallback, pilgrim-only `/signup`, one search h1, 404 h1, package page Save and Compare, "How we verify operators" notice, 12 px minimum text, 44 px tap targets, two-line hotel names, airport and trip length filters, no en dashes, no doubled page titles. Not done by instruction: UX-08, UX-11, item 9. Cron hardening left for Ali. Vitest 2,169 (76 files) · Playwright 69 passed, 6 skipped · real-DB 32/32. Report `docs/uat/BATCH1_REPORT.md`, detail `AI_NOTES.md` §B1.
> 🛠️ **Gotcha: a `body:has(...)` rule silently vanishes from the built CSS.** Next's CSS step (Lightning CSS) drops `:has()` rules for Next's default browser targets, because the repo has no `browserslist`. Tailwind keeps the rule; the compiled chunk does not. Not a code bug: put the style on an element the page renders (UX-17 uses a `[data-plain-background]` wrapper). Also: Turbopack dev can serve a stale shared component (seen with the footer) on routes compiled earlier; `npm run dev:clean` fixes it.

> **2026-10-07 B0 staging environment (PR #117, `feat/staging-env` into `dev`, CI green, not merged):** every Vercel Preview now uses the fictional Supabase project `pilgrimcompare-staging` (`fkcudutzgltrsoykfvfn`), not production. Outside production: test-site banner, `noindex` header and `robots.txt` `Disallow: /`, email only to `STAGING_EMAIL_TO` with a `[STAGING] to <recipient>` subject. `npm run seed:staging` loads 6 fictional operators and 34 packages and refuses production. Preview env split done by PATCHing only the target of 10 shared records (Production records kept ids and values). Preview checks: banner, listing (29 shown, draft and operators E and F hidden), detail and compare pass. Enquiry email NOT delivered (see `docs/BACKLOG.md`, fire-and-forget sends). Sign-in through the preview form left for Ali. Vitest 2,127 (66 files) · Playwright 69/6/0 · real-DB 25/25. Guide `docs/STAGING.md`, detail `AI_NOTES.md` §B0.
> 🛠️ **Gotcha: in Claude in Chrome a hidden tab never hydrates streamed Suspense boundaries.** React queues the reveal (`<!--$~-->`, `window.$RB`) on `requestAnimationFrame`, which a hidden tab never fires, so client effects (operator names, compare toggles) never run. Not an app bug. Keep one tab, take a screenshot after each navigation, then test.

> **2026-10-07 release (production):** PR #115 (`/partner` founding operators copy, `dev` `e21e955`) and PR #116 (`dev` into `main`) merged. `main` is `a4e7075`. Production deployment `dpl_C6wvCksUXATpod7GaWpNwABsVQFM` READY (built 09:08 UTC). Previous production deployment `dpl_37VRWgywt4AhiwteZyHz9UfwURjs` (`0c80db9`). `/` and `/partner` 200.

> **2026-10-06 release DONE (production):** `main` is `0c80db9` (PR #112). Production deployment `dpl_37VRWgywt4AhiwteZyHz9UfwURjs` READY. Rollback target `dpl_7njTU7yY4NuEBtHznKhJsrEx7VbM` (`1505dcd`). Ships PRs #108, #109, #110 and #111. Production SQL: 013 PRE-DEPLOY (Step A) and 014 POST-DEPLOY (Step B, check 0 rows, query 1 now 34 PASS and 0 FAIL, was 30 FAIL), both run by Claude in Chrome on Ali's instruction, recorded in `supabase/migrations-pending/APPLIED.md`. Smoke: 1, 2, 5, 6, 7, 8 pass. 3 returns 200 with 0 packages, which is data, not a regression (production showed 0 packages on `1505dcd` before the release). 4 and 9 not runnable until a verified operator publishes a package. 10 passed on 7 Oct 2026 (enquiry-retention cron, 03:45 UTC, 2XX). Post-release items in `docs/BACKLOG.md`. Detail `AI_NOTES.md` §REL.

> **2026-10-06 erasure and retention (PR #109, `fix/erasure-retention`, stacked on #108, not merged):** account deletion also deletes Hajj alerts (`interests`); the delete route always answers in JSON; enquiry personal details are removed after 90 days by the daily cron `/api/cron/enquiry-retention`; privacy section 5 says so; pending 014 is `REVOKE ALL`; PRODUCTION_CHECKS adds TRUNCATE, `bank_details_active` and the no-ATOL count; privacy page mismatches M1 to M7 fixed, export complete, `docs/BACKLOG.md` added. Vitest 2,081 · Playwright 69/6/0 · real-DB 25/25. Report and copy for approval: `docs/uat/PR109_REPORT.md`; detail `AI_NOTES.md` §ER.

> **2026-10-06 review follow-up (PR #108, same branch, not merged):** real-DB suite committed (`e2e/local-db`, `npm run e2e:local-db`) and run in CI (`local-db` job); CI now also runs lint + build. Account deletion erases data first, sign-in last (retryable), anonymises enquiries, deletes marketing consents. Verified operators without an ATOL number are no longer listed. Read-only `supabase/migrations-pending/PRODUCTION_CHECKS.sql` + pending 014 for Ali. Vitest 2,056. Detail: `docs/uat/PR108_REVIEW.md` (Resolution), `AI_NOTES.md` §OQ1.
> 🛠️ **Gotcha: `tsc` fails with "Duplicate identifier" in `.next/types/* 2.ts`.** The worktree lives under `~/Documents`, and macOS/iCloud can drop `"name 2.ts"` copies into `.next`. It is not a code bug: `rm -rf .next` and rerun. Also: the real-DB suite's own stack (`supabase start --workdir e2e/local-db`) raises `email_sent` to 100/h, because the CLI default of 2/h fails the reset test on a second run.

> **2026-10-06 QA run (branch `fix/overnight-qa`, PR into dev, not merged; two green gates incl. clean verification):** reported search/tab mismatch fixed (shared query layer); operator portal no longer uses browser MockDB; open redirects closed; JSON-LD/package-page/partner truth fixes. Vitest 2,047 · Playwright 69/6/0 · real-DB 24/24 · tsc ✅ · build ✅. Founder decisions applied (verified-only, three-state inclusions, migration 013 pending, registered office unset). Report: `docs/uat/OVERNIGHT_REPORT.md`; detail `AI_NOTES.md` §OQ1.

## Health (verified 2026-10-09, batch 2)

| Check | State |
| --- | --- |
| `npm run test` | ✅ 2,265 (81 files) pass |
| `npm run build` | ✅ 0 errors |
| `npx tsc --noEmit` | ✅ pass |
| E2E | ✅ cookie-banner click-intercept flake fixed 2026-06-15 (`feature/fix-cookie-banner-e2e-flake`, AI_NOTES §Cookie-banner E2E flake fix). `catalogue`/`operator`/`bank-payment` 45/45 × 3 serial runs (chromium+firefox+webkit). |
| Production deploy | ✅ `main` `a4e7075`, `dpl_C6wvCksUXATpod7GaWpNwABsVQFM`, 2026-10-07 |
| Staging | ✅ Preview uses `pilgrimcompare-staging` (`fkcudutzgltrsoykfvfn`), `docs/STAGING.md` |
| Light theme | ✅ merged to dev + main 2026-06-13 |

---

## ✅ Done (shipped & verified)

**Direction & parked flows**
- **Admin promotion — real account → admin (2026-06-17, see AI_NOTES §Admin promotion):** set `app_metadata.role=admin` on `aliimrankhan86@gmail.com` in production via the service-role Admin API (provider keys preserved, `user_metadata` untouched). Two admins now (real + `admin@test.local`, kept as guard). Authz reads `app_metadata` only; `public.users.role` mirror left as `customer`. Log in fresh to pick up the role (JWT freshness).
- **Production demo-data cleanup (2026-06-17, see AI_NOTES §Production demo-data cleanup):** removed all demo/test data from live Supabase in one reversible FK-safe transaction (backup taken first) — 3 demo operators, 14 packages, 4 test enquiries, 1 payment_details, 2 quote_requests, 202 analytics_events, the 3 `@example.com` operator users, and `wigocor561@afterdo.com` (public + auth). **Preserved:** all gmail accounts, `customer@example.com`, the 3 `*.test.local` local logins, `marketing_consents` (empty). **Admin guard held** — `admin@test.local` (only admin) kept. Verified live: 0 operators/packages/enquiries, `/packages` shows "No packages" empty state, `/partner` concierge CTA, home 200. Rollback: `backups/preclean-…json` + `restore-…sql` (local, gitignored). Open: `*.test.local` still in prod auth (local dev → prod DB) — needs a separate local Supabase to fully close the standing rule.
- **Self-serve operator onboarding hidden (2026-06-17, branch `feature/hide-operator-self-serve` → PR #102, see AI_NOTES §Hide self-serve operator onboarding wizard):** concierge model is live — operators can't self-register. New `FEATURE_OPERATOR_SELF_SERVE` flag (default OFF) + `notFound()` guard on `/operator/onboarding` (also already role-gated by `middleware.ts`); the 3 `/partner` "Apply as an Operator" CTAs → concierge `mailto:operators@pilgrimcompare.co.uk` contact; `auth/confirm` sends operators to the dashboard; `PARKED_FEATURES.md` entry 3 filled in. No code deleted (parked). Playwright `catalogue` gating test green.
- **Ziyarat comparison field (2026-06-17, branch `feature/package-ziyarat-field` → PR #101, see AI_NOTES §Ziyarat):** operator-stated **Ziyarat** added end-to-end — `ziyaratIncluded` (nullable bool) + `ziyaratDetails` (nullable string) on `Package`. Wizard Step 5 Yes/No/Not-specified radio (blank persists `null`, never `false`); package detail + comparison row in "What's included"; CSV export columns; migration `012` applied to live Supabase + columns verified. Missing = **"Not provided"** (never inferred). Mirrors `paymentPlanAvailable`/`cancellationPolicy`. Vitest 1,869/1,869, build 0, tsc clean, Playwright `catalogue` 2/2 (desktop + 390px).
- **Cleanup — analytics copy verify + dev-utility KT-→PC- sample (2026-06-16, branch `chore/cleanup-analytics-copy-pc-sample`, PR → dev open):** verified all analytics mentions in `app/privacy/page.tsx` + `components/compliance/CookieConsent.tsx` already name **Vercel Web Analytics** (zero Plausible refs) with accurate cookieless / no-consent-required claims — no copy change needed. Swapped the hardcoded `KT-9X2P4A` sample in `scripts/test-emails.mjs` (dev email-preview utility, 3 occurrences) → `PC-7F3A9C21` so a future grep doesn't suggest the rename was incomplete; no app/test/E2E impact. `tests/legal.test.ts` confirmed unchanged (checks `companyName`/`companyNumber`/`contactEmail` only — `registeredOffice` deliberately not required). Vitest 1,860/1,860, build 0 errors, tsc pass.
- **Task C — reference prefix `KT-` → `PC-` (2026-06-16, branch `feature/reference-prefix-rename`, PR → dev open, see AI_NOTES §Task C):** renamed the KaabaTrip-era prefix to PilgrimCompare's `PC-` at the single generation source (`REFERENCE_CODE_PREFIX` in `repository.ts`) + cron fallback + seed/mock + all test/E2E assertions (enquiry **and** booking-intent, which share the generator). Format/length after the prefix unchanged; no DB migration (pre-rename `KT-` records stay valid). Vitest 1,860/1,860, enquiry E2E 6/6 ×3 browsers show `PC-`.
- **Task 3 — pilgrim email opt-in + contact-hint UX fix (2026-06-16, merged to `dev` via PR #87, see AI_NOTES §Task 3):** unticked-by-default marketing consent checkbox on the enquiry form (verbatim label; optional — never blocks the enquiry). New dedicated `marketing_consents` table (migration `011`, applied to Supabase, RLS service-role only, `enquiry_reference NOT NULL`, unique `(email, enquiry_reference)`). Consent persisted **only** when ticked AND email present; phone-only → no record; absence of row = no consent. Consent write wrapped — never fails the enquiry. No email sent (double-opt-in-ready store only). Also: contact-hint near Send when name-only ("Add an email or phone to send."). KT- prefix + payment-posture lines untouched.
- **Task 2 — canonical pilgrim enquiry journey (2026-06-15, merged via PR #86, see AI_NOTES §Task 2):** anonymous package→Enquire→short form→KT- reference + confirmation with the three payment-posture lines. New `Enquiry` entity (migration `010`), `POST /api/enquiries` (IP rate-limited), confirmation + operator-alert emails fire-and-forget via existing Resend.
- **Task 1 — parked the broken flows (2026-06-15, branch `feature/park-rfq-booking-flows`, see AI_NOTES §Task 1):** added two server-side feature flags in `lib/config.ts`, both **default OFF**, removing them from the live pilgrim journey without deleting any code. `FEATURE_RFQ_QUOTE` (`isRfqQuoteEnabled`) — `/quote` wizard 404s, package "Request quote" CTA + footer/corridor/umrah `/quote` links hidden, quote-request POST 404s. `FEATURE_BOOKING_FLOW` (`isBookingFlowEnabled`) — "Proceed direct"/booking dialog/payment-evidence/operator bank details hidden, confirmation page + booking-intent POST 404. Created `PILGRIMCOMPARE_PROJECT_DIRECTION.md` + `PARKED_FEATURES.md`. Acceptance verified on a 375px live preview (flags OFF). Playwright forces both flags ON so parked code stays E2E-covered; `tests/feature-flags.test.tsx` covers flag-OFF.

**Traveller flow**
- **`/packages` browse redesign (2026-06-14, branch `fix/packages-ux-csp-light-theme`):** rewritten to reuse the polished `PackageCard` + sticky `CompareBar` + comparison dialog from `/search` (one consistent card language, low cognitive load). Segmented pilgrimage-type control, clean season/sort selects, Saved chip. Verified light + dark, mobile + desktop; compare 2→table flow works. Unit tests preserved; `e2e/catalogue.spec.ts` testids updated to the shared contracts.
- **Cross-cutting polish (same branch):** CSP nonce now applied to the inline theme script in `app/layout.tsx` (fixes `script-src` inline-execution block); light theme re-shows the kaaba SVG as a faint ghost under an ivory wash (readability-safe); FAQ→CTA homepage gap tightened to ~20px (mobile media-query was clobbering `sectionTightTop` padding); mobile sort dropdown on `/search/packages` no longer crops (left-anchored + viewport-clamped ≤768px). **Header IA decision:** no separate "Home" link — the logo already links home (universal convention); a second link adds clutter without discoverability gain.
- Package discovery: browse, sort, filter (budget, dates, hotel stars, Haram distance, flight type)
- Umrah 4-step search form (date picker, traveller stepper, star select, budget slider)
- Airport-level routing: LHR, LGW, BHX, MAN (departure + return), backend filters by airport code
- **Compare-first results (mobile UX overhaul 2026-06-10, see AI_NOTES §15):** price-first cards, sticky compare bar, mobile-native 2-up comparison with "Lowest price" flag, decluttered header. Compare up to 3; Save demoted to a quiet bookmark.
- **Results filter panel now functional** (was decorative): writes the real URL contract (budget £, hotel stars, season, distance band, direct flights); Ramadan/School-holiday presets.
- **Decision-first depth (2026-06-11, PR #41, see AI_NOTES §15):** rich layman-friendly detail page with progressive disclosure (highlights, hotel names, exact distance + walk time, airline/stops, deposit + instalments, cancellation, group type; plain-language "What's included"); grouped collapsible comparison rows (cancellation/deposit/instalments/flights/group type side-by-side, factual per-attribute "Best" flags); visible removable filter chips + count badge. Desktop sticky decision rail + mobile sticky CTA. All from stored facts only.
- **DB-unreachable resilience:** search page fails fast (Pool timeouts) + degrades to a calm "couldn't load / Try again" notice instead of a 150s hang / 500.
- **Supabase keep-alive cron (2026-06-11, PR #45):** `vercel.json` cron hits `GET /api/health` every 3 days at 09:00 UTC — prevents free-tier auto-pause. Health endpoint upgraded to real DB ping (`SELECT 1`), returns 200 healthy / 503 degraded. **Migrate to Supabase Pro when first paying operator onboards.**
- Quote journey (prefilled package details) → BookingIntent records (`KT-…` refs)
- Payment handoff: pay-operator-direct + evidence upload + bank details display

**Operator portal**
- Registration, profile management, leads inbox
- Package CRUD via 8-step wizard (single POST — double-POST bug fixed)
- Package CSV import/export (import shows in empty state)
- Multi-image upload: `imageUrl` migrated → `images[]` across Zod/OG/JSON-LD/components
- Dashboard on **real data** via `Repository.getOffers()` (role-filtered), manual Refresh UI
- BookingOutcome entity + OutcomeForm (operator outcome reporting)
- TierExplanation component (operator status transparency)
- Analytics dashboard wired to real events

**Admin**
- Complaint triage, bank-change review queue, reconciliation CSV export, audit logs

**Auth**
- Supabase auth + `/api/auth/me` shell (customer/operator/admin nav)
- Dev persona login **removed** (2026-06-09) — `lib/auth/dev-users.ts`, `/dev/login`, `__dev_user` cookie all deleted. Auth is Supabase-only.
- `__e2e_user` bypass remains, gated to `E2E_TESTING=1` (Playwright CI only).
- Password show/hide toggle, forgot password

**Dev login strip (2026-06-09)**
- `lib/auth/dev-users.ts` deleted — personas, `DEV_ACCOUNT_PASSWORD`, `isDevAuthEnabled()` gone
- `app/dev/login/page.tsx` deleted — `/dev/login` route gone
- `__dev_user` cookie removed from sign-in, sign-out, middleware, session
- `/dev/*` route guard removed from `middleware.ts`
- All sign-in now goes through Supabase Auth only
- `__e2e_user` bypass kept, gated to `E2E_TESTING=1` (CI only, never deployed)
- 5 dev-auth gate tests removed; suite: 234/234 ✅

**API / security (2026-06-09)**
- All client components migrated off direct MockDB access → proper authenticated API routes
- Hardcoded role contexts (`admin1`, `cust1`) fully removed from client code
- New routes: complaints, admin bank-changes, operator leads/payment-details/bank-changes/audit-log, operators list, quote-requests/[id], booking-intents GET
- Repository: `listPublicOperators`, `getBankChangeRequests(ctx)`, `getBookingOutcomes(ctx)` added

**MockDB P0 close-out (2026-06-10)**
- `FEATURE_USE_REAL_DB` now throws in production if unset — fail-fast, no silent MockDB fallback
- `SearchPackageDisplay` interface moved from `lib/mock-packages.ts` → `components/search/search-utils.ts`
- `AnalyticsDashboard` EmptyChart: MockDB seed button removed from component; `AnalyticsSeedButton` dev-only (dynamic import, production guard)
- `PaymentInstructions`: migrated from client-side Repository/MockDB → new `GET /api/booking-intents/[id]/payment-instructions` route
- `RequestDetail`: all client-side MockDB/Repository calls replaced with API fetches; `BookableButton` now reads `eligibilityFlags` from loaded operator data
- Interests + GDPR export endpoints migrated off MockDB to Supabase Postgres (migration 007 applied)
- Payment-instructions tests rewritten to mock `fetch` (removed stale MockDB setup + deleted `recently-updated-warning` test for removed feature)

**Quality / tests (EXECUTION_QUEUE Phase 5)**
- Validation utility: 7 reusable validators (`lib/validation.ts`) + 39 unit tests (Task 14)
- SEO JSON-LD consolidated: every page imports `@/lib/seo/json-ld`, no inline/local helpers (Task 13)
- E2E operator flow: `e2e/operator.spec.ts` 30/30 cross-browser via `__e2e_user` cookie bypass (Task 16)

**Storage / images**
- Migration `004_package_images_bucket.sql` **applied + verified** on Supabase (2026-06-08): public `package-images` bucket (5MB; jpeg/png/webp) + 4 RLS policies (public read; insert/update/delete only into own `{auth.uid()}/…` prefix). Matches `lib/api/storage.ts` path convention. Re-runnable via `scripts/apply-migration-004.mjs` (idempotent).

**Transactional email suite (2026-06-10)**
- `send.pilgrimcompare.co.uk` sending domain verified on Resend (Cloudflare DNS auto-configured)
- `RESEND_API_KEY` added to Vercel (Production + Preview)
- `lib/email/send.tsx` — Resend wrapper with 4 send functions (fire-and-forget, never throws)
- `emails/EnquiryConfirmation.tsx` — customer enquiry confirmation with similar packages
- `emails/OperatorEnquiryAlert.tsx` — operator alert, reply-to = customer email
- `emails/BookingIntentConfirmation.tsx` — customer booking intent confirmation
- `emails/PaymentEvidenceNotification.tsx` — operator payment evidence notification
- Email 2+3 wired into `POST /api/quote-requests`; Email 4+5 wired into `POST /api/booking-intents`
- All 4 templates tested end-to-end via `scripts/test-emails.mjs` ✅
- Supabase Auth SMTP → Resend (`smtp.resend.com`, port 465, user: `resend`) ✅
- Supabase Auth Email 1 (confirm signup) template → PilgrimCompare branded HTML ✅
- Cloudflare Email Routing: `support/privacy/dpo/complaints@pilgrimcompare.co.uk` → Gmail forwarding, all Active ✅ (upgrade to Google Workspace when onboarding operators)

**Platform**
- UK GDPR (privacy, terms, cookie consent, marketing consent)
- SEO: JSON-LD, dynamic sitemap, city corridor pages (`/umrah/london|birmingham|manchester`)
- A11y: WCAG 2.2 AA, ARIA, keyboard nav, 44px tap targets
- Security: nonce-based CSP (replaced unsafe-inline), RLS migrations, rate limiting (Upstash)
- RLS audit (2026-06-10): all 13 tables RLS-enabled; migration 008 fixed `evidence-files` + `operator-exports` storage buckets `{public}` → `{authenticated}` (critical); migration 009 added `WITH CHECK` to all 7 UPDATE policies (prevents ownership field mutation)
- Rebrand + domain wiring (2026-06-10): brand renamed to `PilgrimCompare`; domain `pilgrimcompare.co.uk` wired in all page metadata, JSON-LD, robots, sitemap; `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk` set in Vercel ✅; Cloudflare `.com` → `.co.uk` 301 redirect rule active ✅; `www.pilgrimcompare.com` CNAME (proxied) added → redirects to `pilgrimcompare.co.uk` ✅
- **WordmarkLogo component (2026-06-10):** `components/graphics/WordmarkLogo.tsx` — inline SVG text wordmark, Nunito ExtraBold 800, `currentColor` fill (theme-flexible). Used in `Header` (desktop + mobile drawer) and `Footer`. Nunito loaded via `next/font/google` in `app/layout.tsx` (`--font-nunito`). Merged to `main` via PR #34.
- `/settings` page: profile (editable name, email, avatar, role badge), security (password reset email), notification toggles (offer updates / booking updates / marketing), data export + account deletion (GDPR Art 20/17)
- Mobile nav overhaul: icons, user card with avatar, "Get a Quote" as yellow CTA, active state left-border accent, danger-styled log out

---

## ⏳ Pending (blocked / not done)

| Item | Status | Blocker |
| --- | --- | --- |
| Q1 quality pass — KaabaTrip eradication | ✅ Done 2026-06-12 | — |
| Q1 quality pass — banned-phrase audit (ATOL blanket claims, Partner→Operator) | ✅ Done 2026-06-12 | — |
| Q1 quality pass — dynamic departure cities | ✅ Done 2026-06-12 | — |
| Q2 — legal pages (`/terms`, `/privacy`, `/how-it-works`) | ✅ Done 2026-06-12 | — |
| Q3 — IA/nav pass | ✅ Done 2026-06-12 | — |
| Q4 — mobile polish 360/390/430px | ✅ Done 2026-06-12 | — |
| Q5 — SEO metadata, JSON-LD, sitemap | ✅ Done 2026-06-12 (PR #51) | — |
| Q6 — ranking transparency, Featured slots | ✅ Done 2026-06-12 (PR #52) | — |
| Prompt 5 — transactional email suite (6 templates) | ✅ Done 2026-06-12 (PR #53) | — |
| Prompt 6 — cron jobs + outcomes endpoint | ✅ Done 2026-06-12 (PR #53) | — |
| Light theme (Madinah) — 7-step implementation | ✅ Done 2026-06-13 (merged to dev + main) | — |
| Search header redesign (world-class) | ✅ Done 2026-06-13 (merged to dev + main) | — |
| Search results pagination (5/page) | ✅ Done 2026-06-13 (merged to dev + main) | — |
| Homepage redesign — audience routing + live compare preview | ✅ Done 2026-06-13 (PR #63 → dev) | — |
| Data integrity — "Not provided" for missing hotel name/stars (cards, JSON-LD, quote prefill) | ✅ Done 2026-06-13 (PR #64 → dev, see AI_NOTES §27) | — |
| Operator form — no silent defaults for skipped stars/distance/group type | ✅ Done 2026-06-13 (PR → dev pending, see AI_NOTES §28) | — |
| Duplicate email signup shows specific error with sign-in link | ✅ Done 2026-06-14 (real fix: empty-identities detection, AI_NOTES §31) | — |
| Email confirm link signs user in (PKCE `code` callback) | ✅ Done 2026-06-14 (AI_NOTES §31) | — |
| Cookie banner no longer covers mobile drawer nav items | ✅ Done 2026-06-14 (z-index stacking-context fix, AI_NOTES §32) | — |
| Signup duplicate-email copy clearer + type-aware sign-in link | ✅ Done 2026-06-14 (UI copy, AI_NOTES §32) | — |
| Light-theme cookie "Accept" button prominent + readable (brand green) | ✅ Done 2026-06-14 (token fix, AI_NOTES §32) | — |
| "Common questions" → closing CTA spacing tightened (both themes) | ✅ Done 2026-06-14 (AI_NOTES §32) | — |
| Inclusions three-state model (included / not / not specified) | ⏳ Not started | Follow-up to §28 |
| Distance vocabulary reconciliation (enum vs wizard vs DB '0-500m') | ⏳ Not started | Separate task (flagged §28) |
| Existing-data cleanup — null out seed default stars/distance/group | ⏳ Not started | Separate task (flagged §28) |
| Plausible analytics wiring | ⏳ Not started | — |
| `app_metadata.role` backfill (pre-2026-06-09 users) | ⏳ Not started | Needs Supabase SQL |
| Registered office address in footer | ⏳ Not started | Awaiting virtual office |
| Prompt 7 — Telegram operator alerts | ⏳ Not started | Prompts 5+6 live |
| Prompt 8 — automation / operator data ingestion | ⏳ Not started | — |
| Google Workspace upgrade | ⏳ Not started | First operator onboard |

---

## ▶️ Next actions (do in order)

1. ~~**Merge light theme:** PR `feature/light-theme` → `dev` → `main`.~~ ✅ Done 2026-06-13.
2. **Operational smoke test:** curl all 3 cron endpoints with `CRON_SECRET` from Vercel env vars.
3. **First real enquiry:** submit test quote → confirm Emails 2+3 arrive via Resend logs.
4. **Onboard first operator** via `/operator/onboarding`.
5. Start Prompt 7 (Telegram alerts) once Prompts 5+6 confirmed working end-to-end.

---

## Update protocol

When you finish a unit of work **and** it passes `npm run test` + `npm run build`:
1. Move the item from **Pending/Next** → **Done**.
2. Update the **Health** date if you re-ran checks.
3. If product state shifted, sync `HANDOFF.md` (one-screen brief) and `AI_NOTES.md`.
4. Keep this file ≤ 2 screens. Push detail into `docs/`.
