# KaabaTrip AI Handover - Single Source of Truth

**Last verified:** 2026-06-09
**Last architecture/security audit:** 2026-06-09
**Branch:** `dev`
**Audience:** Claude, Codex, Kimi, and any AI/developer taking over the project.

This file is the current handover source of truth. If another document conflicts with a verified statement here, treat that other document as stale and update it before changing implementation. Historical notes were intentionally overwritten to remove contradictory pending/completed status.

---

## 0. Architecture Decision & Master Audit - 2026-06-09

### Decision

KaabaTrip's correct target and production architecture is **Supabase + Prisma + Upstash Redis**, not a client-side MockDB MVP.

Evidence checked:

- `package.json` includes `@prisma/client`, `@prisma/adapter-pg`, `pg`, `@supabase/supabase-js`, `@supabase/ssr`, `@upstash/redis`, and `@upstash/ratelimit`.
- `prisma/schema.prisma`, `prisma.config.ts`, and Supabase migrations exist.
- `lib/api/db/prisma.ts` creates a Prisma 7 client with the `pg` adapter and `DATABASE_URL`.
- `lib/api/db/adapter.ts` maps app models to Prisma models.
- `lib/config.ts` selects Prisma only when `FEATURE_USE_REAL_DB=true`; tests and E2E intentionally use MockDB.
- `.env.local` has the expected env names present for Supabase, Prisma, service role, feature flag, and Upstash. Values were not printed.
- `npx prisma validate` passed on 2026-06-09.
- `npm run test` passed on 2026-06-09: 18 files, 239/239 tests.
- `npm run build` passed on 2026-06-09.

Practical conclusion:

- Trust the Supabase/Prisma/Redis architecture.
- MockDB is allowed for unit tests and controlled E2E/dev simulation only.
- The repo is **not yet cleanly cut over for launch** because production-facing components and API routes still import/use MockDB directly.

### Production audit verdict

Current launch score from local evidence: **62/100 - risky, internal beta only**.

Do not make the site public until the P0 blockers below are fixed and re-verified with `FEATURE_USE_REAL_DB=true` against Supabase.

### 2026-06-09 security remediation pass (applied)

A pre-launch CRITICAL/HIGH security pass fixed and verified the following. Tests
remained 239/239 green; `npx tsc --noEmit` and `npm run build` clean.

1. **Trusted role source (P0 #1) — FIXED.** Authorization role now reads from
   `app_metadata.role` (service-role-only) in `getSessionUser()`, supabase
   middleware, `apiGetUser`, and the sign-in DTO; defaults to least-privilege
   `customer`. `apiSignUp` writes the role to `app_metadata` via the service role
   and no longer stores role in user-editable `user_metadata`. Closes the
   self-escalation vector (a user could previously `auth.updateUser({ data:
   { role:'admin' } })`).
   - ⚠️ Backfill: any pre-existing Supabase auth users created before this change
     have role only in `user_metadata` and will default to `customer`. Set their
     `app_metadata.role` via the service role (admin API) before launch.

2. **RLS actually enabled on the live DB (P0 #5) — FIXED.** Introspection found
   11 of 12 public tables had NO row-level security: the public anon key could
   read `users`, `payment_details`, `bank_change_requests`, `booking_intents`,
   `offers`, `complaints` via the Supabase Data API (confirmed HTTP 200 + rows
   for PII + bank details). Root cause: `001_enable_rls.sql` never applied because
   it compared `auth.uid()` (uuid) to `text` columns. Rewrote `001` with
   `auth.uid()::text`, tightened `offers` (was `USING(true)`), dropped the
   permissive `audit_log` insert, added `005` (analytics_events + booking_outcomes)
   and `006` (payment-evidence operator/admin read). Applied via
   `scripts/apply-rls-migrations.mjs`; verified anon now gets 0 rows on sensitive
   tables, public catalogue still readable. App unaffected (all table access is
   Prisma/direct connection, which bypasses RLS).

3. **Rate limiting (P1) — extended.** `POST /api/quote-requests` now rate-limited;
   limiter identifiers namespaced per endpoint (auth / interest / quote) so they
   no longer share one IP bucket.

Remaining from this pass (not blocking, see notes): `style-src 'unsafe-inline'` in
CSP (impractical to remove with Next 15 + Tailwind; script-src is nonce-based);
final CSP `frame-ancestors` / CORS origins (gated on domain purchase).

4. **Anonymous quote hardcode `cust1` (P0 #3) — FIXED (2026-06-09).** Product
   decision: require login before quote submission. `POST /api/quote-requests` now
   returns `401` if no authenticated customer session exists. `customerId` is
   always the real `user.id`; the `'cust1'` fallback is gone. Tests: 239/239 green.

### P0 launch blockers

1. **Auth roles currently rely on Supabase `user_metadata`.**
   - Evidence: `lib/auth/session.ts`, `lib/supabase/middleware.ts`, `lib/auth/api.ts`, and `app/api/auth/sign-in/route.ts` read `user.user_metadata.role`.
   - Risk: Supabase user metadata is user-editable. Any server-side authorization that trusts it can become role escalation.
   - Fix: Store authorization role in `app_metadata` using admin/service-role updates, or load role from the server-side `users` table by authenticated `user.id`. Middleware, `getSessionUser()`, `/api/auth/me`, and sign-in response DTOs must use the trusted source only. Public sign-up may request `customer` or `operator`, but must not self-authorize admin or verified/operator privileges.

2. **MockDB still leaks into production-facing paths.**
   - Evidence from `rg`: direct MockDB imports remain in `components/request/RequestDetail.tsx`, `components/quote/QuoteRequestWizard.tsx`, `components/operator/OfferForm.tsx`, `components/operator/PaymentDetailsClient.tsx`, `components/operator/OperatorLeadsClient.tsx`, `components/admin/*`, `components/search/PackageList.tsx`, `components/packages/PackagesBrowse.tsx`, `components/request/PaymentInstructions.tsx`, `components/request/ComplaintForm.tsx`, `components/request/ComparisonTable.tsx`, `app/admin/bank-changes/*`, `app/api/user/export/route.ts`, and `app/api/interest/route.ts`.
   - Risk: real Supabase data and client-side local/test data can diverge; GDPR export can omit real data; users can see simulated state after failed server writes.
   - Fix: Remove MockDB imports from all production UI/API paths. Use server routes/Server Components plus `Repository` with server-derived `RequestContext`. Keep MockDB only under tests, fixtures, and explicit dev-only tooling.

3. **~~Anonymous/customer quote and booking flows still use hardcoded `cust1`~~ — FIXED 2026-06-09.**
   - `POST /api/quote-requests` now requires an authenticated customer session; returns `401` otherwise. `customerId` always set from `user.id`.
   - ⚠️ Remaining: `components/request/RequestDetail.tsx` still uses `customerContext = { userId: 'cust1', role: 'customer' }` for client-side `Repository.createBookingIntent()` / `MockDB.saveBookingIntent()` fallback. This is covered by P0 #2 (MockDB removal). Fix there, not here.

4. **Real DB cutover is opt-in and not yet proven in deployment.**
   - Evidence: `getDataSource()` returns MockDB unless `FEATURE_USE_REAL_DB=true`; E2E always forces MockDB. Docs say production should be Supabase, but the code can silently run MockDB if the flag is missing.
   - Risk: a deployed production environment can appear functional while writing to non-persistent MockDB/localStorage simulation.
   - Fix: For Vercel production, fail fast unless `FEATURE_USE_REAL_DB=true`, Supabase env, `DATABASE_URL`, `DIRECT_URL`, and Upstash env are present. Keep MockDB fallback only for `NODE_ENV=test`, local dev without the flag, and explicit E2E.

5. **RLS policies need Supabase hardening before relying on Data API access.**
   - Evidence: RLS exists, but several policies are broad or incomplete for production: `offers_read_all`, `audit_log_insert_system WITH CHECK (true)`, update policies without `WITH CHECK`, and no verified deployed policy audit in this session.
   - Risk: if tables are exposed to anon/authenticated roles, broad policies can leak or allow unexpected writes.
   - Fix: Run Supabase advisors and inspect grants. Add `TO authenticated` / `TO anon` deliberately, ownership predicates for every non-public table, and `WITH CHECK` on every update policy that must preserve ownership. Keep service-role use server-only and narrow.

### P1 high-value fixes

- **Payment evidence policy conflict:** product canon says MVP is metadata-only; architecture/code support storage bytes and private bucket uploads. Decide before launch. If bytes remain, add operator/admin signed download routes that enforce BookingIntent RBAC and avoid exposing storage paths directly.
- **GDPR export/delete must use real repositories:** `app/api/user/export/route.ts` reads MockDB, and delete removes the Supabase auth user but does not prove cleanup/anonymisation of Prisma records.
- **Rate limits only cover auth today:** extend Upstash rate limiting to quote requests, booking intents, package image uploads, payment instruction reads, bank-detail/change endpoints, admin approval/rejection, complaints, and interest capture.
- **Health check is shallow:** `/api/health` returns static JSON. Add a private/deploy-time dependency check for Supabase, Prisma, and Upstash.
- **CI branch mismatch:** `.github/workflows/ci.yml` runs on `main` and `develop`, while docs say active branch is `dev`. Add `dev` or rename branch policy before relying on CI gates.
- **Package image rendering needs deployment smoke:** `package-images` is a public Supabase bucket, but CSP/Next image allowlists must be verified against the actual Supabase storage host.
- **Admin reconciliation needs business verification:** route exists, but export completeness, date semantics, and sensitive field policy need owner sign-off.

### User journey gaps to resolve before public launch

- Decide whether quote requests are allowed before login. If yes, design guest lead capture, email verification, and account-claim flow. If no, route users to login before creating persistent QuoteRequest records.
- Verify real Supabase sign-up, email confirmation, sign-in, forgot-password, reset-password, and sign-out on deployed Vercel.
- Define what "verified operator" means operationally: who checks ATOL/ABTA/company data, what evidence is stored, what is visible to travellers, and how rejected operators recover.
- Define complaint/dispute handoff language and support ownership so users do not think KaabaTrip is escrow, insurer, or travel operator.
- Confirm package image upload/display with one real operator and one real package before stripping dev login.

### Implementation order for the next AI/fixer

1. Replace role source with trusted `app_metadata` or DB role lookup.
2. Remove production MockDB imports and hardcoded `cust1` paths.
3. Make production fail fast if `FEATURE_USE_REAL_DB=true` and required envs are not set.
4. Harden RLS/grants and run Supabase advisors.
5. Rework quote/booking guest journey.
6. Expand rate limits and real GDPR export/delete.
7. Run `npm run test`, `npm run build`, `npx playwright test`, and deployed Supabase smoke.

---

## 1. Product Truth

KaabaTrip is a UK-first, comparison-first marketplace for Umrah and Hajj.

The product supports two modes:

- **Catalogue listings:** operators publish structured package pages that are searchable, comparable, and SEO friendly.
- **Quote-first offers:** travellers submit preferences, operators respond with comparable offers, and travellers express booking intent.

Primary users:

- **Travellers / customers:** browse, search, shortlist, compare up to 3 packages/offers, request quotes, and create BookingIntent records.
- **Travel operators / partners:** onboard, manage packages, respond to leads, track booking intents, update profile/payment details, and review analytics.
- **Admins:** review operator/bank changes, complaints, reconciliation data, and sensitive audit flows.

Business and legal posture:

- KaabaTrip is a marketplace and enquiry system at this stage.
- Operators are the source of truth for package content, availability, pricing, fulfilment, and payment records.
- KaabaTrip does **not** collect, hold, transfer, escrow, or invoice customer funds.
- BookingIntent is an intent/reference record, not a payment confirmation or final booking.
- Customer payment handoff is **pay-operator-direct**.
- Never invent operator trust claims. Use stored facts only: verification status, ATOL/ABTA numbers when present, company metadata, regions, and profile completeness.
- If data is missing, show "Not provided" or an equivalent explicit absence. Do not guess.
- MVP public pricing is UK-first and GBP-only. Multi-currency is future scope.

Canonical product file: `docs/00_PRODUCT_CANON.md`.

---

## 2. Non-Negotiable Project Rules

Read these before work:

1. `AGENTS.md`
2. `docs/README_AI.md`
3. `docs/NOW.md`
4. This `AI_NOTES.md`

Additional docs by task:

- UI edits: `docs/UX_GUIDELINES.md`
- Public route/SEO changes: `docs/SEO.md`
- Operator work: `docs/OPERATOR_ONBOARDING.md`
- Architecture/security changes: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`

Before every push:

- Update `docs/NOW.md`.
- Run `npm run test`.
- Run `npm run build`.
- If UI/routing changed, manually smoke `/`, `/umrah`, `/search/packages` at 320px and 1280px.
- If routes or `data-testid` contracts changed, run Playwright.

Coding invariants:

- Keep diffs focused.
- Do not revert unrelated user changes.
- UI components must not import MockDB directly. Use `Repository`.
- All `Repository.*` calls are async and must be awaited.
- Next.js 15 `params` and `searchParams` are promises in Server Components.
- Public schemas/forms must not expose an `admin` role.
- Auth APIs must only return safe user shape: `{ user: { id, email, role, name } }`.
- API errors should use `AppError` / `mapErrorToResponse`, not raw `err.message`.
- No production `console.log` / `console.warn`.
- Use Zod validation before API/DB writes.

---

## 3. Verified Current State

Verified on 2026-06-09 unless noted:

- `npm run test`: **passes**, 18 files, **239/239 tests**.
- `npm run build`: **passes**, 0 build errors.
- `git diff --check`: **passes**.
- `npm run lint`: **passes**, with a Next.js deprecation notice for `next lint`.
- `npx prisma validate`: **passes**.
- `npx tsc --noEmit`: **passes**.
- `npx playwright test`: **57 passed, 6 skipped, 0 failed** on 2026-06-08.
- `npx playwright test e2e/signup-password-mismatch.spec.ts`: **3 passed** on 2026-06-08.
- Manual Playwright smoke on 2026-06-08:
  - `/`, `/umrah`, `/search/packages?type=umrah&departureAirport=LGW`
  - 320px and 1280px
  - no HTTP errors and no horizontal overflow observed.
- Manual header/airport smoke:
  - guest `Login` and `For Partners` links visible on `/`.
  - `/umrah` departure/return selects include London Heathrow (LHR), London Gatwick (LGW), Birmingham (BHX), and Manchester (MAN).
  - form submit with Gatwick departure and Heathrow return lands on `/search/packages?...departureAirport=LGW&returnAirport=LHR`.
- Manual auth smoke:
  - customer login with `customer@example.com` / `KaabaTrip!2026` redirects to `/` and shows customer navigation.
  - partner login with `operator@example.com` / `KaabaTrip!2026` redirects to `/operator/dashboard`.

Known non-failing warnings:

- Supabase Edge warning from `@supabase/supabase-js` / `@supabase/ssr` referencing `process.version`.
- Webpack cache-size warnings during build.
- One Unsplash image URL was observed returning upstream 404 during E2E, but tests passed and the app remained functional.

Stack:

- Next.js 15.5.19 App Router
- React 19
- TypeScript strict
- Tailwind v4
- Vitest 4.1.8
- Playwright
- Prisma + Supabase Postgres/Auth/Storage
- Upstash Redis available for rate limiting when env vars are present

Current data posture:

- `FEATURE_USE_REAL_DB=true` is used for real Prisma/Supabase paths.
- MockDB remains for unit tests and E2E-style impersonation flows.
- Repository layer is the abstraction boundary for business data and RBAC.
- Supabase project is in EU West / Ireland per existing architecture notes.
- 2026-06-09 audit caveat: production-facing UI/API paths still contain direct MockDB imports. Treat this as cutover debt and do not ship public production until Section 0 P0 items are fixed.

---

## 4. Auth and Dev Persona Handover

Password complexity rule:

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

Enforced in:

- `lib/validation.ts`
- `app/api/auth/sign-up/route.ts`
- `components/auth/SignUpForm.tsx`
- unit tests

Dev account reference:

| Persona | Email | Password | Expected view |
| --- | --- | --- | --- |
| Customer | `customer@example.com` | `KaabaTrip!2026` | Traveller/customer nav and public customer flows |
| Operator verified | `operator@example.com` | `KaabaTrip!2026` | Partner dashboard and operator flows |
| Operator new | `operator2@example.com` | `KaabaTrip!2026` | Partner/onboarding status style flows |
| Admin | `admin@example.com` | `KaabaTrip!2026` | Admin complaint/review flows |

Important auth behavior:

- `/dev/login` uses cookie impersonation through `__dev_user`; it bypasses Supabase Auth and does not check a password.
- E2E helpers use `__e2e_user`; they also bypass Supabase Auth.
- Normal `/login` has a dev-auth credential fallback for the dev accounts above. It is enabled on **localhost (`NODE_ENV=development`) and automated E2E (`E2E_TESTING=1`) only** — never on any deployed environment (preview or production). It validates `KaabaTrip!2026`, sets `__dev_user`, and returns the same safe user shape as real auth.
- Non-dev credentials still use Supabase Auth.
- Real password validation should be tested through `/signup` and `/login` with real Supabase-created credentials.
- `/api/auth/me` powers the header session state so Supabase sessions, `__dev_user`, and `__e2e_user` render correct navigation.
- Sign-out clears `__dev_user`.
- Login and signup password fields now have accessible eye-icon show/hide controls.

Key files:

- `lib/auth/dev-users.ts`
- `app/api/auth/sign-in/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/sign-out/route.ts`
- `components/auth/PasswordInput.tsx`
- `components/auth/LoginForm.tsx`
- `components/auth/SignUpForm.tsx`
- `components/layout/Header.tsx`

### REMOVE BEFORE PRODUCTION - dev-only login

The customer + partner login bypass is **local-dev / E2E tooling only**. It exists so the sign-in journey for customers and partners can be walked through and visually checked without real Supabase accounts. It must **not** ship in production-ready code.

**Now locked to localhost + automated E2E only.** `isDevAuthEnabled()` returns `true` only when `NODE_ENV==='development'` (local `next dev`) or `E2E_TESTING==='1'`. Every deployed runtime (Vercel preview AND production) has `NODE_ENV='production'`, so the bypass is off and `/dev/login` redirects to `/`. There is intentionally **no remote/preview toggle** — `KAABATRIP_ENABLE_DEV_AUTH` and `VERCEL_ENV` are no longer read or exposed. The hardcoded password only works on localhost, so a public/preview URL cannot be used to impersonate anyone.

> **Gotcha — "can't log in locally with the dev personas":** a local **production build** (`npm run build` + `npm start`, i.e. `next start`) runs with `NODE_ENV='production'`, so `isDevAuthEnabled()` is `false` and `/api/auth/sign-in` returns `401 AUTH_INVALID_CREDENTIALS` for `customer@example.com` / `KaabaTrip!2026` — this is the hardening working as designed, not a bug. To test customer/partner views you must run the **dev server** (`npm run dev`, which sets `NODE_ENV='development'`). Verify the running process: `next-server` started via `next start` = production = dev login off; `next dev --turbopack` = dev login on. (Alternatively set `E2E_TESTING=1`, but `.env.local` ships it empty.)

The shared password `KaabaTrip!2026` still exists in source + git history (harmless remotely now, but) the code, password, and personas must still be **physically removed** before production launch, not just gated.

Strip checklist (do all before prod launch):
- [ ] Delete `lib/auth/dev-users.ts` (personas + `DEV_ACCOUNT_PASSWORD = 'KaabaTrip!2026'` + `isDevAuthEnabled()`).
- [ ] Delete `app/dev/login/page.tsx` and the `/dev/*` route guard in `lib/supabase/middleware.ts`.
- [ ] Remove `__dev_user` read/write/clear in `app/api/auth/sign-in/route.ts`, `app/api/auth/sign-out/route.ts`, `lib/supabase/middleware.ts`, `lib/auth/session.ts`, `app/api/auth/me/route.ts`.
- [ ] Remove the dev-auth credential fallback in `/api/auth/sign-in` so all creds go to Supabase Auth.
- [ ] Drop `KAABATRIP_ENABLE_DEV_AUTH` / `VERCEL_ENV` exposure from `next.config.ts` env block.
- [ ] Remove dev-auth assertions from `tests/auth-api.test.ts` and `tests/auth-components.test.tsx`.
- [ ] Remove `__e2e_user` bypass if e2e is not part of prod pipeline.
- [ ] Update docs (`AI_NOTES.md` §4, `STATUS.md`, `PROJECT_BRIEF.md`) to state dev login is **removed**, not just gated.

Reason kept for now: testing the customer + partner sign-in journey and how it looks to those users. **Do not push this to production-ready code.**

---

## 5. Architecture Summary

High-level architecture:

```text
Next.js App Router UI
  -> API routes / Server Components
  -> lib/api/repository.ts
  -> lib/api/db/adapter.ts for Prisma/Supabase
  -> Supabase Postgres/Auth/Storage with RLS
```

Repository rule:

- UI and routes should go through `Repository`.
- MockDB is a test/local simulation layer, not a business dependency for UI components.

Important client/server boundary fix:

- Client components that import modules reaching `Repository` must not pull Prisma/`pg` into browser bundles.
- `next.config.ts` includes a browser-only alias for the DB adapter.
- `lib/api/db/client-adapter-stub.ts` exists to keep Turbopack/browser paths safe.

Core entities:

- `User`
- `OperatorProfile`
- `Package`
- `QuoteRequest`
- `Offer`
- `BookingIntent`
- `PaymentDetails`
- `BankChangeRequest`
- `AuditLogEntry`
- `Complaint`
- `AnalyticsEvent`

Operator eligibility:

- verified profile
- tier is not `listed`
- `eligibilityFlags.canReceiveBookings === true`
- `eligibilityFlags.bankDetailsActive === true`
- one active `PaymentDetails` record exists

RBAC shape:

- Customers see and mutate their own quote requests, booking intents, complaints, and evidence.
- Operators see relevant open leads and their own packages/offers/bookings/profile/payment records.
- Admins review bank changes, complaints, reconciliation, and sensitive operator/payment evidence flows.
- Public users can read published packages and public operator profiles only.

Payment/evidence policy:

- BookingIntent reference codes are `KT-...`, unique, and immutable.
- Evidence metadata and any file bytes must be visible only to the customer, involved operator, or admin.
- The product canon says MVP evidence storage is metadata-only; architecture notes mention bytes can be stored/purged. Treat this as a policy conflict to resolve before expanding evidence storage.

---

## 6. Current Feature Map

Public/customer routes:

| Route | Status |
| --- | --- |
| `/` | Done |
| `/umrah` | Done |
| `/hajj` | Done |
| `/umrah/ramadan` | Done |
| `/umrah/london` | Done |
| `/umrah/birmingham` | Done |
| `/umrah/manchester` | Done |
| `/umrah/cost` | Done |
| `/search/packages` | Done |
| `/packages` | Done |
| `/packages/[slug]` | Done |
| `/operators/[slug]` | Done |
| `/quote` | Done |
| `/requests/[id]` | Done |
| `/requests/[id]/confirmation` | Done |
| `/settings` | Done |
| `/privacy` | Done |
| `/terms` | Done |
| `/login` | Done |
| `/signup` | Done |
| `/dev/login` | Done for development only |

Operator/admin routes:

| Route | Status |
| --- | --- |
| `/partner` | Exists |
| `/operator/onboarding` | Done |
| `/operator/onboarding/status` | Done |
| `/operator/dashboard` | Done |
| `/operator/packages` | Done; includes CSV import/export and package wizard |
| `/operator/leads` | Done |
| `/operator/analytics` | Rebuilt with real event summaries/trends and verified on 2026-06-08 |
| `/operator/profile` | Done |
| `/operator/settings` | Done |
| `/operator/settings/payment-details` | Done |
| `/admin/bank-changes` | Done |
| `/admin/bank-changes/[id]` | Done |
| `/admin/complaints` | Done |
| `/admin/reconciliation` | Exists; business completeness/export format still needs explicit verification |

Feature areas currently implemented:

- Traveller search from `/umrah` to `/search/packages`.
- Shortlist and compare up to 3 packages.
- Package details with operator profile linking.
- Quote wizard and request tracking.
- Offer response flow.
- BookingIntent reference and confirmation screen.
- Operator onboarding/status.
- Operator dashboard, leads, packages, analytics, profile, payment settings.
- Bank details change-control and admin review.
- Complaints/admin triage.
- SEO foundations: metadata, sitemap, robots, JSON-LD helpers, corridor pages.
- GDPR customer settings: export/delete flows.
- Cookie consent UI.

---

## 7. Recent Verified Work

2026-06-08 dev account login fix and later hardening:

- Root cause for "Invalid email or password" with documented dev accounts: `/login` fallback and `__dev_user` readers were hard-gated to `NODE_ENV=development`, so Vercel preview / production-mode QA sent those credentials to Supabase Auth instead.
- The later hardened state is stricter: `isDevAuthEnabled()` is enabled only for local development or `E2E_TESTING=1`. Vercel preview/production and `KAABATRIP_ENABLE_DEV_AUTH` are not valid remote toggles.
- `__dev_user` handling is now aligned across sign-in, middleware, server sessions, `/api/auth/me`, `/dev/login`, and sign-out.

2026-06-08 header login + London airport split:

- Guest header links now render while `/api/auth/me` is loading, so the Login and For Partners links do not become invisible for unauthenticated users.
- Umrah route capture now uses airport-level values instead of generic city values.
- London is split into London Heathrow (LHR) and London Gatwick (LGW), with Birmingham (BHX) and Manchester (MAN) as the other launch airport options.
- Server-side search filtering validates and filters by `departureAirport`, so LHR and LGW produce distinct package result sets.
- Operator package API validation uses the shared airport code catalogue.
- Default exact-date submission uses local date formatting rather than UTC `toISOString()`, preventing UK timezone shifts from defaulting the departure date to yesterday.

2026-06-08 auth/dev persona work:

- Normal `/login` accepts documented dev persona credentials in local development or automated E2E only.
- Dev persona fallback verifies `KaabaTrip!2026`, sets `__dev_user`, and returns safe user shape.
- Dev persona password comparison trims accidental leading/trailing whitespace for these documented accounts only; real Supabase passwords are not trimmed or weakened.
- Real Supabase sign-in failures return safe 401 responses instead of masked 500s.
- Added `/api/auth/me`.
- Header now renders role-appropriate navigation for Supabase, dev, and E2E sessions.
- Sign-out clears `__dev_user`.
- Login/signup password fields have accessible eye-icon toggles.
- Signup mismatch E2E fixture now uses complexity-compliant mismatched passwords.
- Turbopack/browser DB adapter alias added.
- `images.unsplash.com` allowed for package card images.

2026-06-08 Umrah search UX:

- Departure and return route capture uses launch airport options: London Heathrow (LHR), London Gatwick (LGW), Birmingham (BHX), and Manchester (MAN).
- Travel timing supports exact dates or flexible holiday/religious periods.
- Hotel preference changed to clearer multi-select behavior.
- Search summary and hotel-star filter query handling updated.
- Cookie banner now visually prioritizes "Essential only".

2026-06-08 operator analytics:

- Added `AnalyticsEventType` and `AnalyticsEvent`.
- Added repository event tracking and summary/trend methods.
- Tracks package views, quote requests, offers sent, booking started, and future status transitions.
- Routed offer and booking intent creation through server APIs for tracking.
- Rebuilt `/operator/analytics` with range controls, summary cards, funnel, trend data, and existing chart primitives.
- Prisma push/validate/generate verified; RLS enabled on `analytics_events`.

Earlier completed platform work:

- Package wizard with 8 steps.
- Operator package persistence API.
- Package image upload and `images[]` migration.
- Payment details and bank change review.
- BookingIntent confirmation screen.
- Payment evidence metadata flow.
- Operator tier/status display.
- SEO/AEO content expansion.
- CSP nonce hardening.
- Error handling and GDPR endpoints.
- Rate limiter with Upstash path and dev fallback.

---

## 8. Pending / Left Areas

Do not mark these complete unless re-verified.

| Priority | Area | Current status / next step |
| --- | --- | --- |
| P0 | Trusted auth role source | Current auth/session paths read `user_metadata.role`. Move role authorization to Supabase `app_metadata` or the server-side `users` table before production. |
| P0 | MockDB cutover | Direct MockDB imports remain in production-facing UI/API routes. Remove or isolate behind dev/test-only boundaries before launch. |
| P0 | Hardcoded customer identity | Quote/request/booking paths still use `cust1` in production-facing code. Require login or build a real anonymous lead model. |
| P0 | Production fail-fast | Production can silently use MockDB if `FEATURE_USE_REAL_DB` is missing. Make production require real DB and required envs. |
| P0 | RLS/grants audit | Run Supabase advisors and tighten broad/incomplete RLS policies before exposing real data. |
| P0 | Production env validation | Confirm production has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; verify Redis path is used outside local/dev fallback. |
| P0 | Deployed Prisma/Supabase cutover | Local/verified paths exist with `FEATURE_USE_REAL_DB=true`; deployed environment needs explicit smoke against Supabase data, auth redirects, and RLS. |
| P0 | Domain launch | Buy/configure production domain. Then update `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, Supabase auth redirect URLs, canonical URLs, robots, sitemap, JSON-LD base URLs, and any hardcoded `kaabatrip.com` assumptions. |
| P1 | Plausible analytics | Wire after domain is live and cookie-consent behavior is confirmed. |
| P1 | Payment evidence policy conflict | Product canon says MVP evidence storage is metadata-only; architecture notes describe byte storage/purge. Resolve policy before shipping file-byte storage changes. |
| P1 | Admin reconciliation | `/admin/reconciliation` exists. Verify export completeness, expected CSV/PDF format, and payment-evidence linkage before treating as done. |
| P1 | Operator analytics depth | Base real-event dashboard is done. Future work: deeper conversion breakdowns, top-package analysis, attribution quality, and business-facing chart polish. |
| P2 | Local Chrome SEO/AEO QA | Server-side SEO/AEO work was done earlier. A rendered local Chrome audit remains useful for titles, JSON-LD, canonicals, noindex/robots, and visible FAQ consistency. |
| P2 | Test coverage | Tests pass, but coverage was previously around 28 percent. Increase coverage for auth session, auth API, DB adapter, package APIs, analytics, and payment evidence. |
| P2 | Docs consistency | Some docs still contain stale historical status such as operator analytics partial/E2E pending. Update those docs as touched; do not regress implementation to match stale docs. |

⚠️ PARTIALLY RESOLVED — Payment evidence RLS
The storage RLS policies now grant read access to the involved operator and to
admins (migration `006`, applied 2026-06-09), matching the §5 RBAC model. Customer
write access is unchanged. Adding the policies is forward-compatible and harmless.
Remaining (business decision, not code): whether to SHIP the operator/admin
evidence-review UI / signed-download path at launch. If yes, build the
signed-download route enforcing BookingIntent RBAC and never expose raw storage
paths. If no, this is confirmed post-launch debt — upload works, review UI is not
wired. Resolve before Gate 2 sign-off.

Known local/tooling files:

- `.agents/`
- `.claude/`

These are local/untracked tooling artifacts. Do not push them unless the user explicitly asks to version them.

Tracked diagnostic script:

- `npm run check:upstash` runs `scripts/check-upstash.mjs`. It loads `.env.local`, checks whether `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present, initializes Redis + `@upstash/ratelimit`, runs `PING`, and runs one limiter probe. It prints only boolean env presence and safe probe results; it must not print Redis URLs, tokens, token lengths, or other secret-derived values.

---

## Pre-launch gates

### Gate 1: Safe to merge dev → main
1. Fix Section 0 P0 blockers: trusted role source, MockDB cutover, no hardcoded `cust1`, production fail-fast, RLS/grants audit.
2. Photo upload smoke test - real operator account, real image, real browser. Do this BEFORE stripping dev login.
3. Strip dev-login - remove personas, password reference, `__dev_user`, and `isDevAuthEnabled()`. Update docs to say removed, not just gated.
4. Final verification - unit tests, type-check, build, operator E2E, basic mobile and desktop smoke.
5. PR dev → main.

### Gate 2: Safe to make public
1. Buy domain.
2. Set NEXT_PUBLIC_SITE_URL.
3. Update Supabase auth redirect URLs.
4. Wire Plausible.
5. Check canonical URLs, sitemap, robots.txt, JSON-LD.
6. Confirm all deployed auth flows: sign up, email confirmation, sign in, forgot password, reset password.
7. Confirm package image URLs resolve correctly on deployed pages.

### Gate 3: Soft launch readiness (business, not code)
1. Onboard 5 real operators.
2. Get ~50 packages live.
3. Run one real operator onboarding QA pass.
4. Confirm package data quality.
5. Confirm no copy implies KaabaTrip is a travel operator or payment processor.

---

## 9. Verification Playbook

For docs-only handover edits:

```bash
git diff --check
```

For implementation changes:

```bash
npx tsc --noEmit
npm run test
npm run build
```

For UI/routing changes:

```bash
npm run dev
npx playwright test
```

Manual smoke targets:

- `/`
- `/umrah`
- `/search/packages?type=umrah`
- `/login?type=customer`
- `/login?type=partner`
- `/operator/dashboard`
- `/operator/analytics`

Viewport requirements:

- 320px mobile
- 1280px desktop

Auth smoke:

- Customer: `customer@example.com` / `KaabaTrip!2026`
- Partner: `operator@example.com` / `KaabaTrip!2026`

Expected customer result:

- Redirects to `/`
- Customer-facing header/navigation visible
- Public customer flows usable

Expected partner result:

- Redirects to `/operator/dashboard`
- Partner/operator dashboard visible
- Operator nav usable

---

## 10. How The Next AI Should Work

Start with this sequence:

1. Read `AGENTS.md`, `docs/README_AI.md`, `docs/NOW.md`, and this file.
2. Run `git status -sb`.
3. Treat existing uncommitted changes as user/agent work; do not revert them.
4. If a doc conflicts with the verified state here, update the doc instead of undoing implementation.
5. Pick one scoped task.
6. Update relevant docs as part of the task.
7. Run the required verification gates.
8. Update `docs/NOW.md` before handoff or push.

Current handoff intent from the user:

- They want to see both **customer view** and **partner view** locally.
- Auth/dev persona login is fixed for that purpose.
- Use `/login?type=customer` and `/login?type=partner`, or `/dev/login` for one-click impersonation.
