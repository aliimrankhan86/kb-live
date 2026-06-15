# PilgrimCompare — Project Status

> **Single rolling tracker.** Any AI/dev: read this for current state. Update it after work is **done + tested + verified** (see `CLAUDE.md` rule).
> Detailed handover lives in `AI_NOTES.md`. Cold-start brief: `HANDOFF.md`. Business: `BUSINESS.md`.

**Last verified:** 2026-06-15 (Task 1 — park RFQ quote engine + booking/payment flow behind feature flags) · **Branch:** `feature/park-rfq-booking-flows` · **App:** Next.js 15.5 / React 19 / Supabase / Prisma

> **Direction:** `PILGRIMCOMPARE_PROJECT_DIRECTION.md` (repo root) is now the source of truth — read first every session. Parked features tracked in `PARKED_FEATURES.md`.

---

## Health (verified 2026-06-15)

| Check | State |
| --- | --- |
| `npm run test` | ✅ 1,836/1,836 pass (29 files) |
| `npm run build` | ✅ 0 errors |
| `npx tsc --noEmit` | ✅ pass |
| E2E | ⚠️ pre-existing cookie-banner click-intercept flake in `catalogue`/`operator`/`bank-payment` (reproduces on `dev` baseline; varies by run). Parked-flow paths pass. |
| Production deploy | ✅ main — Vercel live 2026-06-13 (light theme + search + pagination) |
| Light theme | ✅ merged to dev + main 2026-06-13 |

---

## ✅ Done (shipped & verified)

**Direction & parked flows**
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
