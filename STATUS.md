# PilgrimCompare — Project Status

> **Single rolling tracker.** Any AI/dev: read this for current state. Update it after work is **done + tested + verified** (see `CLAUDE.md` rule).
> Detailed handover lives in `AI_NOTES.md`. Cold-start brief: `HANDOFF.md`. Business: `BUSINESS.md`.

**Last verified:** 2026-06-10 (wordmark rebrand + PR #34 dev→main merged) · **Branch:** `dev` · **App:** Next.js 15.5 / React 19 / Supabase / Prisma

---

## Health (verified 2026-06-10)

| Check | State |
| --- | --- |
| `npm run test` | ✅ 232/232 pass (18 files) |
| `npm run build` | ✅ 0 errors (known Supabase Edge + webpack cache warnings only) |
| `npx tsc --noEmit` | ✅ pass |
| E2E `e2e/operator.spec.ts` | ✅ 30/30 pass (chromium + firefox + webkit) |
| Lint | ✅ clean |

---

## ✅ Done (shipped & verified)

**Traveller flow**
- Package discovery: browse, sort, filter (budget, dates, hotel stars, Haram distance, flight type)
- Umrah 4-step search form (date picker, traveller stepper, star select, budget slider)
- Airport-level routing: LHR, LGW, BHX, MAN (departure + return), backend filters by airport code
- Shortlist / compare up to 3 packages
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
- Rebrand + domain wiring (2026-06-10): brand `KaabaTrip` → `PilgrimCompare`; domain `pilgrimcompare.co.uk` wired in all page metadata, JSON-LD, robots, sitemap; `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk` set in Vercel ✅; Cloudflare `.com` → `.co.uk` 301 redirect rule active ✅; `www.pilgrimcompare.com` CNAME (proxied) added → redirects to `pilgrimcompare.co.uk` ✅
- **WordmarkLogo component (2026-06-10):** `components/graphics/WordmarkLogo.tsx` — inline SVG text wordmark, Nunito ExtraBold 800, `currentColor` fill (theme-flexible). Used in `Header` (desktop + mobile drawer) and `Footer`. Nunito loaded via `next/font/google` in `app/layout.tsx` (`--font-nunito`). Merged to `main` via PR #34.
- `/settings` page: profile (editable name, email, avatar, role badge), security (password reset email), notification toggles (offer updates / booking updates / marketing), data export + account deletion (GDPR Art 20/17)
- Mobile nav overhaul: icons, user card with avatar, "Get a Quote" as yellow CTA, active state left-border accent, danger-styled log out

---

## ⏳ Pending (blocked / not done)

| Item | Status | Blocker |
| --- | --- | --- |
| Sync `main` → `dev` merge commit | PR needed (0 files changed, structural only) | Create PR `base:dev ← compare:main` on GitHub |
| Q1 quality pass | Not started | `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` committed (founder task) |

---

## ▶️ Next actions (do in order)

1. Merge PR `main → dev` to bring `dev` in sync with `main` (1 commit, 0 files changed — the PR #34 merge commit).
2. Start Q1 — PilgrimCompare language sweep + banned-phrase audit + dynamic departure cities. See `docs/PILGRIMCOMPARE_QUALITY_PROMPTS.md` → Q1.

---

## Update protocol

When you finish a unit of work **and** it passes `npm run test` + `npm run build`:
1. Move the item from **Pending/Next** → **Done**.
2. Update the **Health** date if you re-ran checks.
3. If product state shifted, sync `HANDOFF.md` (one-screen brief) and `AI_NOTES.md`.
4. Keep this file ≤ 2 screens. Push detail into `docs/`.
