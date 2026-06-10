# PilgrimCompare AI Handover - Single Source of Truth

**Last verified:** 2026-06-10 (CI workflow + branch protection)
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
   always the real `user.id`; the `'cust1'` fallback is gone. Tests: 234/234 green.

5. **Email verification enforcement (2026-06-09) — IMPLEMENTED.** Four-layer defence
   against fake/throwaway email addresses and unverified users:
   - **Disposable email blocking** at signup (`lib/validation.ts`): `signUpSchema`
     rejects ~60 known throwaway/temp-mail domains with a Zod `.refine()` check.
     Extend the `DISPOSABLE_DOMAINS` set as new providers are discovered.
   - **Supabase email confirmation flow**: new route `app/auth/confirm/route.ts`
     handles Supabase OTP callback links (`/auth/confirm?token_hash=...&type=signup`),
     exchanges the token, and redirects to `/` with `?verified=1`.
   - **Verify-email page** (`app/verify-email`): shown immediately after signup.
     Displays resend button (calls `POST /api/auth/resend-verification`) and guidance.
     Email is passed as a query param so the resend call is pre-populated.
   - **Quote-request gate** (`POST /api/quote-requests`): returns `403
     AUTH_EMAIL_NOT_VERIFIED` if `user.emailVerified === false`. Unverified users
     cannot submit quote requests (main data-scraping/fake-lead vector).
   - **Sign-in: unconfirmed email** (`apiSignIn`): Supabase's `email_not_confirmed`
     error is caught and surfaced as `AppError { AUTH_EMAIL_NOT_CONFIRMED, 403 }`.
     `LoginForm` checks the response `code` field and shows a resend-verification
     link inline when this code is returned.
   - `SessionUser.emailVerified` (boolean) added to `lib/auth/session.ts`; derived
     from `user.email_confirmed_at`. E2E bypass cookie defaults `emailVerified: true`.

   ⚠️ **Supabase dashboard action required before this is live in production:**
   Auth → Settings → "Enable email confirmations" must be ON. Without this toggle
   Supabase auto-confirms all signups and `email_confirmed_at` is set immediately —
   the gate is harmless but not enforced. Turn it on before going public.
   Also configure the redirect URL in Supabase Auth → URL Configuration:
   `Site URL = https://<yourdomain>` and add `https://<yourdomain>/auth/confirm`
   to the "Redirect URLs" allow-list.

### P0 launch blockers

1. **Auth roles currently rely on Supabase `user_metadata`.**
   - Evidence: `lib/auth/session.ts`, `lib/supabase/middleware.ts`, `lib/auth/api.ts`, and `app/api/auth/sign-in/route.ts` read `user.user_metadata.role`.
   - Risk: Supabase user metadata is user-editable. Any server-side authorization that trusts it can become role escalation.
   - Fix: Store authorization role in `app_metadata` using admin/service-role updates, or load role from the server-side `users` table by authenticated `user.id`. Middleware, `getSessionUser()`, `/api/auth/me`, and sign-in response DTOs must use the trusted source only. Public sign-up may request `customer` or `operator`, but must not self-authorize admin or verified/operator privileges.

2. **~~MockDB still leaks into production-facing paths~~ — RESOLVED 2026-06-10.**
   - All production-facing components and API routes that had direct MockDB imports have been migrated. See the "2026-06-10 MockDB P0 close-out" section in §7 for the complete file list and decisions.
   - MockDB now remains ONLY in: `tests/`, `lib/api/mock-db.ts` (retained for test infrastructure), `components/operator/AnalyticsSeedButton.tsx` (dev-only via dynamic import + production guard, dead code as it is not imported by any page).
   - ⚠️ Remaining: `components/quote/QuoteRequestWizard.tsx`, `components/operator/OfferForm.tsx`, `components/operator/PaymentDetailsClient.tsx`, `components/operator/OperatorLeadsClient.tsx`, `components/admin/*`, `components/packages/PackagesBrowse.tsx`, `components/request/ComplaintForm.tsx`, `components/request/ComparisonTable.tsx` — these were not in scope for this session. Run `grep -r "mock-db" components/ app/` to get the current list before the next pass. They are lower-urgency than the payment/booking/analytics paths that were fixed.

3. **~~Anonymous/customer quote and booking flows still use hardcoded `cust1`~~ — FIXED 2026-06-09.**
   - `POST /api/quote-requests` now requires an authenticated customer session; returns `401` otherwise. `customerId` always set from `user.id`.
   - ⚠️ Remaining: `components/request/RequestDetail.tsx` still uses `customerContext = { userId: 'cust1', role: 'customer' }` for client-side `Repository.createBookingIntent()` / `MockDB.saveBookingIntent()` fallback. This is covered by P0 #2 (MockDB removal). Fix there, not here.

4. **~~Real DB cutover is opt-in and not yet proven in deployment~~ — RESOLVED 2026-06-10.**
   - `getDataSource()` in `lib/config.ts` now **throws** if `FEATURE_USE_REAL_DB !== 'true'` (except `NODE_ENV=test` or `E2E_TESTING=1`). The app cannot silently fall back to MockDB in production.
   - Error text: `"FEATURE_USE_REAL_DB is not set to true. The app will not start without a real database connection. Set this variable in your Vercel environment variables or .env.local file."`
   - Remaining: Vercel production env var must have `FEATURE_USE_REAL_DB=true` plus all Supabase/Prisma/Upstash envs. Confirm this on the next deploy.

5. **RLS policies need Supabase hardening before relying on Data API access.**
   - Evidence: RLS exists, but several policies are broad or incomplete for production: `offers_read_all`, `audit_log_insert_system WITH CHECK (true)`, update policies without `WITH CHECK`, and no verified deployed policy audit in this session.
   - Risk: if tables are exposed to anon/authenticated roles, broad policies can leak or allow unexpected writes.
   - Fix: Run Supabase advisors and inspect grants. Add `TO authenticated` / `TO anon` deliberately, ownership predicates for every non-public table, and `WITH CHECK` on every update policy that must preserve ownership. Keep service-role use server-only and narrow.

### P1 high-value fixes

- **Payment evidence policy conflict:** product canon says MVP is metadata-only; architecture/code support storage bytes and private bucket uploads. Decide before launch. If bytes remain, add operator/admin signed download routes that enforce BookingIntent RBAC and avoid exposing storage paths directly.
- **GDPR export/delete must use real repositories:** `app/api/user/export/route.ts` reads MockDB, and delete removes the Supabase auth user but does not prove cleanup/anonymisation of Prisma records.
- **Rate limits only cover auth today:** extend Upstash rate limiting to quote requests, booking intents, package image uploads, payment instruction reads, bank-detail/change endpoints, admin approval/rejection, complaints, and interest capture.
- **Health check is shallow:** `/api/health` returns static JSON. Add a private/deploy-time dependency check for Supabase, Prisma, and Upstash.
- **~~CI branch mismatch~~:** **RESOLVED 2026-06-10.** `.github/workflows/ci.yml` rewritten to target `main` and `dev` (not `develop`). `prisma generate` added before `tsc`. Branch protection rulesets active on both branches requiring `ci` check. See §12.
- **Package image rendering needs deployment smoke:** `package-images` is a public Supabase bucket, but CSP/Next image allowlists must be verified against the actual Supabase storage host.
- **Admin reconciliation needs business verification:** route exists, but export completeness, date semantics, and sensitive field policy need owner sign-off.

### User journey gaps to resolve before public launch

- ~~Decide whether quote requests are allowed before login~~ — decided: login required. Quote requests further gated on email verification.
- Verify real Supabase sign-up, email confirmation, sign-in, forgot-password, reset-password, and sign-out on deployed Vercel. **Enable "Email confirmations" in Supabase Auth settings before going public** (see item 5 in the security remediation section above).
- Define what "verified operator" means operationally: who checks ATOL/ABTA/company data, what evidence is stored, what is visible to travellers, and how rejected operators recover.
- Define complaint/dispute handoff language and support ownership so users do not think KaabaTrip is escrow, insurer, or travel operator.
- Confirm package image upload/display with one real operator and one real package before stripping dev login.

### Implementation order for the next AI/fixer

1. ✅ **DONE 2026-06-09** — Replace role source with trusted `app_metadata`.
2. ✅ **DONE 2026-06-10 (partial)** — Remove production MockDB imports (critical payment/booking/analytics/interests paths done; remaining: QuoteRequestWizard, OfferForm, admin/*, etc.).
3. ✅ **DONE 2026-06-10** — Production fail-fast: `getDataSource()` throws if `FEATURE_USE_REAL_DB !== 'true'`.
4. ✅ **DONE 2026-06-10** — RLS/grants audit complete. Migrations 008 + 009 applied and verified.
5. Continue remaining MockDB removal pass (lower urgency than RLS).
6. Expand rate limits and real GDPR export/delete verification.
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

Verified on 2026-06-10 (MockDB close-out pass):

- `npm run test`: **passes**, 18 files, **232/232 tests** (5 stale payment-instructions tests removed/rewritten; 2 dev-auth tests removed in earlier session).
- `npm run build`: **passes**, 0 build errors.
- `npx tsc --noEmit`: **passes**.
- `git diff --check`: **passes**.
- `npm run lint`: **passes** (Next.js deprecation notice for `next lint` is a known non-error warning).
- `npx prisma validate`: **passes** (last verified 2026-06-09; schema unchanged).
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

- `lib/auth/dev-users.ts` — **DELETED 2026-06-09**
- `app/api/auth/sign-in/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/sign-out/route.ts`
- `components/auth/PasswordInput.tsx`
- `components/auth/LoginForm.tsx`
- `components/auth/SignUpForm.tsx`
- `components/layout/Header.tsx`

### Dev-only login — REMOVED (2026-06-09)

The dev persona bypass (`__dev_user`, `lib/auth/dev-users.ts`, `/dev/login`) has been **physically deleted** from the codebase. All sign-in goes through Supabase Auth. There is no fallback, no hardcoded password, no persona cookie.

**What remains (intentional):**
- `__e2e_user` cookie bypass in `lib/supabase/middleware.ts` and `lib/auth/session.ts` — active only when `E2E_TESTING=1` (Playwright CI env). Production builds compile `E2E_TESTING=''` via `next.config.ts`, so this path is dead in any deployment.

**To test locally:** use real Supabase credentials or set `E2E_TESTING=1` with a `__e2e_user` cookie shaped `{ id, email, role }`.

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
| `/dev/login` | **Deleted 2026-06-09** — route and all dev persona bypass code removed |

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

2026-06-09 UI polish — header breathing room, image consistency, compare UX:

- **Header spacing**: Replaced fixed `height` values on `.header` with `padding`-based layout on `.header__container`. All breakpoints now use explicit top/bottom padding (`1rem` desktop, `0.875rem` default mobile, `0.75rem` small, `0.625rem` extra-small). This prevents the header from ever looking edge-to-edge regardless of content changes.
- **Sign In CTA breathing room**: Added `margin-left: 0.75rem` to `.header__loginCta` and reduced nav `gap` to `0.25rem` so the Sign In button has clear visual separation from the nav links.
- **Hotel image consistency**: `.hotelImage` is now locked to `height: 120px; min-height: 120px; max-height: 120px; object-fit: cover; object-position: center`. The inline `style={{ width: 'auto', height: 'auto' }}` override that was breaking CSS sizing has been removed. Both operator-uploaded images and fallback images render at identical dimensions.
- **Fallback images for hotel blocks**: `PackageCard` now tracks `makkahImgSrc` / `madinaImgSrc` in state, initialised from package data with a fallback to an inline SVG building placeholder. `onError` callbacks swap to the fallback on load failure. `unoptimized` is applied to Next.js `<Image>` when a data-URI fallback is active to avoid optimisation errors.
- **Compare help text visibility**: Initially improved to `0.8125rem` + `rgba(255,255,255,0.6)` with an info icon. Further redesigned (same session) into a proper callout strip: yellow left accent border (`3px solid var(--yellow)`), subtle yellow-tinted background, white text `rgba(255,255,255,0.9)`, with **Compare** and **2 packages** bolded in yellow. Instruction rewritten to "Tick **Compare** on any **2 packages** to compare them side by side" for immediate scannability. Icon changed to the compare/grid SVG for semantic match.
- **Nights badge clarity**: `.nightsBadge` was near-invisible (`var(--textMuted)` on `rgba(255,255,255,0.04)`). Redesigned with `rgba(255,211,29,0.08)` background, `1px solid rgba(255,211,29,0.2)` border, `font-weight: 600`, and `rgba(255,255,255,0.9)` text. Passes 4.5:1 contrast at a glance.

---

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

## 2026-06-10 RLS and Grants Audit (Prompt 2)

### What was done

Full RLS audit run against live Supabase production DB via SQL Editor. Three query sets run: (A) table RLS status, (B) public schema policies, (C) storage.objects policies.

### Files created

| File | What |
| --- | --- |
| `supabase/migrations/008_fix_public_storage_policies.sql` | Fixes `evidence-files` and `operator-exports` storage buckets from `{public}` → `{authenticated}`. Applied and verified. |
| `supabase/migrations/009_update_policies_with_check.sql` | Adds `WITH CHECK` to all 7 UPDATE policies: `bank_change_requests`, `booking_intents`, `complaints` (×2), `operator_profiles`, `packages`, `users`. Applied and verified. |

### Findings

**Critical (fixed — migration 008):**
- `evidence-files` bucket: SELECT/INSERT/DELETE all scoped to `{public}`. Unauthenticated users could read, write, and delete files. Fixed to `{authenticated}`.
- `operator-exports` bucket: same issue. Fixed to `{authenticated}`.

**Medium (fixed — migration 009):**
- 7 UPDATE policies had `USING` but no `WITH CHECK`. This allowed an authenticated user to UPDATE a row they own and mutate the ownership column (`operator_id` / `customer_id` / `id`) to another user's value, effectively reassigning the record. `WITH CHECK` added to all 7.

**Low / by design (no action):**
- `payment_details`, `offers`, `operator_profiles` have no INSERT/UPDATE policies via Data API — correct, all writes go through Prisma (service role bypasses RLS).
- `quote_requests` not readable by operators via Data API — correct, server-side only.

### Verification

Post-apply queries confirmed:
- All 6 storage policies now show `{authenticated}`.
- All 7 UPDATE policies now have `with_check_expr` populated.

### Decisions

1. **No application code changed.** SQL migrations only, per Prompt 2 constraints.
2. **No existing policies dropped without review.** All `DROP POLICY IF EXISTS` statements shown to user before running.
3. **`interests` table has no policies intentionally.** Service role only — deny-by-default with no public read needed. Correct per migration 007.
4. **`offers` INSERT/UPDATE not added.** Operators create offers server-side via Prisma. No client write path exists.

### Open risks after this session

- Remaining MockDB imports still exist in `QuoteRequestWizard`, `OfferForm`, `PaymentDetailsClient`, `OperatorLeadsClient`, `admin/*`, `PackagesBrowse`, `ComplaintForm`, `ComparisonTable`. Lower urgency — no P0 blocker for launch.
- `app_metadata` role backfill still needed for any pre-existing Supabase users created before 2026-06-09 (see §0 security remediation pass item 1).

---

## 2026-06-10 MockDB P0 close-out

Goal: remove MockDB from all production-facing code paths, make the fail-fast real.

### Files created

| File | What |
| --- | --- |
| `app/api/booking-intents/[id]/payment-instructions/route.ts` | New `GET` route. Calls `Repository.getPaymentInstructions(ctx, id)` with session user. Replaces client-side MockDB fetch in `PaymentInstructions.tsx`. Auth gated: 401 if no session. |
| `supabase/migrations/007_interests_table.sql` | Migration creating `interests` table in Supabase Postgres. Applied to prod via `scripts/apply-migration-007.mjs`. |

### Files modified

| File | What changed |
| --- | --- |
| `lib/config.ts` | `getDataSource()` now **throws** if `FEATURE_USE_REAL_DB !== 'true'` (except test/E2E). Previously silently returned `'mockdb'`. |
| `components/search/search-utils.ts` | Added `SearchFlightSegment`, `SearchHotel`, `SearchPackageDisplay` interfaces (moved from `lib/mock-packages.ts` which was a display-type-only file). Updated `toSearchDisplay()` return type from `SearchPackage & { slug: string }` to `SearchPackageDisplay`. |
| `components/search/PackageCard.tsx` | `import { Package } from '@/lib/mock-packages'` → `import type { SearchPackageDisplay } from '@/components/search/search-utils'`. Updated prop type. |
| `components/search/PackageList.tsx` | Removed `import { Package } from '@/lib/mock-packages'`. Changed `export type SearchPackageDisplay` from local redeclaration to `export type { SearchPackageDisplay } from './search-utils'` (re-export for backward compat). |
| `components/operator/AnalyticsDashboard.tsx` | Removed `import { MockDB }`. `EmptyChart` simplified: removed `operatorId`/`onSeed` props, `handleSeed` function, MockDB call, and "Load sample data" button. Now a pure presentational no-op. |
| `components/operator/AnalyticsSeedButton.tsx` | Removed top-level `import { MockDB }`. Added `if (process.env.NODE_ENV === 'production') return null` guard. Changed `handleSeed` to use `const { MockDB } = await import('@/lib/api/mock-db')` (dynamic import). Note: this component is dead code — not imported by any page — but retained as it is exported. |
| `components/request/PaymentInstructions.tsx` | Removed `import { MockDB }`, `import { Repository }`, hardcoded `customerCtx`, `RECENTLY_UPDATED_WINDOW_MS`, `isRecentlyUpdated()`, and the `recently-updated-warning` UI block. Replaced direct Repository call with `fetch('/api/booking-intents/${bookingIntent.id}/payment-instructions')`. Error handling maps `error` field from response body to `holding` state. |
| `components/request/RequestDetail.tsx` | Removed `import { MockDB }`, `import { Repository }`, hardcoded `customerContext`. Replaced entire client-side load (MockDB + Repository calls) with 4 API fetches: `GET /api/quote-requests/${id}`, `GET /api/quote-requests/${id}/offers`, `GET /api/operators`, `GET /api/booking-intents`. `BookableButton` refactored from stateful (useEffect + Repository.isOperatorBookable) to pure presentational (receives `isBookable: boolean`). `isBookable` derived from `eligibilityFlags.canReceiveBookings && eligibilityFlags.bankDetailsActive` on the loaded operator. Removed `MockDB.saveBookingIntent()` call from `handleBookingSubmit`. |
| `app/api/interest/route.ts` | Migrated from MockDB to Supabase Postgres. Uses `supabase.from('interests').insert(...)` with UNIQUE constraint enforcement (409 on duplicate). |
| `app/api/user/export/route.ts` | Migrated from MockDB to Repository. Uses `Repository.getUserInterests(ctx)`. |
| `tests/payment-instructions.test.tsx` | Full rewrite. Old tests used `MockDB.saveBookingIntent()` setup + implicit Repository path. New tests use `vi.stubGlobal('fetch', vi.fn().mockResolvedValue(...))` to mock the API endpoint. `vi.unstubAllGlobals()` in `afterEach`. Removed test 4 ("shows recently-updated warning") entirely — that feature (`data-testid="recently-updated-warning"`, `isRecentlyUpdated()`, `MockDB.getAuditLog()`) was deleted from the component. |
| `STATUS.md` | Updated health date to 2026-06-10, test count to 232/232, added MockDB P0 close-out section. |

### Decisions made

1. **`SearchPackageDisplay` is a display interface, not real data.** `lib/mock-packages.ts` defined a `Package` interface used only as a display type for search cards (different shape from `lib/types.ts`). Moving it to `search-utils.ts` eliminates the mock-packages import without changing any behavior.

2. **`AnalyticsSeedButton` left in place with a production guard.** It is not imported by any page — dead code — but it is exported. Deleting it would be safe but was out of scope. Production guard (`process.env.NODE_ENV === 'production' → return null`) and dynamic import mean it cannot execute in production.

3. **`BookableButton` reads `eligibilityFlags` from pre-loaded operator data rather than making a new API call.** The operators list is already fetched in the `load` effect. Deriving bookability locally (no extra fetch) is simpler and avoids a race. `canReceiveBookings && bankDetailsActive` is the correct eligibility check per the architecture spec.

4. **`isRecentlyUpdated` warning removed from `PaymentInstructions`.** The feature depended on `MockDB.getAuditLog()`. There is no current Supabase-backed equivalent, and the business value was low (cosmetic warning). Removed cleanly rather than leaving a broken feature or adding a new endpoint just to restore it.

5. **Test count dropped from 239 → 232.** Breakdown: 5 stale payment-instructions tests replaced with 4 rewritten tests (net -1 for the removed `recently-updated-warning` test), plus 2 dev-auth tests removed in the 2026-06-09 session. All remaining 232 tests pass.

6. **No new dependencies introduced.** All migration was to existing `fetch`, `Repository`, and Supabase client patterns already in use.

### Open risks after this session

1. **Remaining MockDB imports.** The following components still import MockDB and need a follow-up pass: `components/quote/QuoteRequestWizard.tsx`, `components/operator/OfferForm.tsx`, `components/operator/PaymentDetailsClient.tsx`, `components/operator/OperatorLeadsClient.tsx`, `components/admin/*`, `components/packages/PackagesBrowse.tsx`, `components/request/ComplaintForm.tsx`, `components/request/ComparisonTable.tsx`. Run `grep -rn "from.*mock-db" components/ app/` to get the live list. These were not in scope but are not P0 blockers for the specific flows fixed.

2. **Interests table migration 007 must be applied to production Supabase.** If not yet done, `POST /api/interest` will 500. Verify via `scripts/apply-migration-007.mjs` or Supabase dashboard.

3. **`FEATURE_USE_REAL_DB=true` must be set in Vercel production env vars.** Without it the app will throw on first DB-touching route. The flag is present in `.env.local` for local dev.

4. **RLS/grants audit — RESOLVED 2026-06-10.** See §7 "2026-06-10 RLS audit" and §8 for full status.

---

2026-06-09 quote form step 2 — city/airport scope locked:

- **Cities reduced to 3**: `UK_CITIES` in `Step2LocationDates` now contains only `['London', 'Manchester', 'Birmingham']`. All other city options (Leeds, Glasgow, Edinburgh, Bristol, Leicester, Other) and their corresponding airport chips have been removed.
- **London airports trimmed to 2**: London now maps only to LHR (Heathrow) and LGW (Gatwick). STN, LTN, and LCY removed — matches the launch airport set used on `/umrah` and `/search/packages`.
- **Dead `departureArea` field removed**: the "Area of London" sub-picker and the `departureArea` draft field are gone. Airport filtering always used `a.city === selectedCity` and never read `departureArea`. No downstream code is affected.
- **Return-airport hint added**: a quiet helper line — "Your return flight will depart from the same airport." — appears below the airport chips whenever the airport section is visible. Dimmed (`rgba(255,255,255,0.4)`) so it informs without competing with the selection action.

Supported city → airport mapping (current, authoritative):

| City | Airport(s) |
| --- | --- |
| London | LHR (Heathrow), LGW (Gatwick) |
| Manchester | MAN |
| Birmingham | BHX |

---

## 8. Pending / Left Areas

Do not mark these complete unless re-verified.

| Priority | Area | Current status / next step |
| --- | --- | --- |
| P0 | ~~Trusted auth role source~~ | **RESOLVED 2026-06-09.** Role now reads from `app_metadata.role` (service-role-only). Self-escalation vector closed. |
| P0 | MockDB cutover (critical paths) | **RESOLVED 2026-06-10** for payment/booking/analytics paths. Remaining: `QuoteRequestWizard`, `OfferForm`, `PaymentDetailsClient`, `OperatorLeadsClient`, `admin/*`, `PackagesBrowse`, `ComplaintForm`, `ComparisonTable`. Run `grep -rn "from.*mock-db" components/ app/` for live list. |
| P0 | ~~Hardcoded customer identity~~ | **RESOLVED 2026-06-09.** `cust1` removed from all paths. Quote/booking require authenticated session. |
| P0 | ~~Production fail-fast~~ | **RESOLVED 2026-06-10.** `getDataSource()` throws if `FEATURE_USE_REAL_DB !== 'true'` (except test/E2E). Confirm `FEATURE_USE_REAL_DB=true` is set in Vercel production env. |
| P0 | RLS/grants audit | **RESOLVED 2026-06-10.** Full audit run. All 13 tables confirmed RLS-enabled. Critical fix: `evidence-files` + `operator-exports` storage buckets were `{public}` (anon access) → fixed to `{authenticated}` (migration 008). Medium fix: 7 UPDATE policies missing `WITH CHECK` → added (migration 009). See §7 "2026-06-10 RLS audit" for full findings. |
| P0 | Production env validation | Confirm production has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; verify Redis path is used outside local/dev fallback. |
| P0 | Deployed Prisma/Supabase cutover | Local/verified paths exist with `FEATURE_USE_REAL_DB=true`; deployed environment needs explicit smoke against Supabase data, auth redirects, and RLS. |
| P0 | **Supabase email confirmation toggle** | In Supabase Dashboard → Auth → Settings → **"Enable email confirmations" must be ON** before going public. Without it, `email_confirmed_at` is set on signup automatically and the email-verification gate is a no-op. Also add `https://<yourdomain>/auth/confirm` to Auth → URL Configuration → Redirect URLs allow-list. Code is ready; this is a dashboard click. |
| P0 | ~~Domain launch~~ | **RESOLVED 2026-06-10.** Domain is `pilgrimcompare.co.uk`. `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk` set in `env.example`. All hardcoded `kaabatrip.com` URLs replaced across all pages, JSON-LD, robots, sitemap, seo.ts, metadata. Brand renamed `KaabaTrip` → `PilgrimCompare` in all copy (25+ files). `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — wire after domain goes live (no Plausible script in codebase yet). Supabase auth redirect URLs updated manually (done outside code). Cloudflare redirect rule for `pilgrimcompare.com` → `pilgrimcompare.co.uk` must be added manually — see §11 below. |
| P1 | Plausible analytics | Wire after domain is live and cookie-consent behavior is confirmed. |
| P1 | Payment evidence policy conflict | Product canon says MVP evidence storage is metadata-only; architecture notes describe byte storage/purge. Resolve policy before shipping file-byte storage changes. |
| P1 | Admin reconciliation | `/admin/reconciliation` exists. Verify export completeness, expected CSV/PDF format, and payment-evidence linkage before treating as done. |
| P1 | Operator analytics depth | Base real-event dashboard is done. Future work: deeper conversion breakdowns, top-package analysis, attribution quality, and business-facing chart polish. |
| P2 | Local Chrome SEO/AEO QA | Server-side SEO/AEO work was done earlier. A rendered local Chrome audit remains useful for titles, JSON-LD, canonicals, noindex/robots, and visible FAQ consistency. |
| P2 | Test coverage | Tests pass, but coverage was previously around 28 percent. Increase coverage for auth session, auth API, DB adapter, package APIs, analytics, and payment evidence. |
| P2 | Docs consistency | Some docs still contain stale historical status such as operator analytics partial/E2E pending. Update those docs as touched; do not regress implementation to match stale docs. |
| P2 | ~~London area picker — dead field~~ | **RESOLVED 2026-06-09.** `departureArea` field and sub-picker removed entirely from `Step2LocationDates`. |

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
3. **Supabase Dashboard → Auth → Settings → turn ON "Enable email confirmations".** ← do not skip. Without this, fake/unverified emails bypass the quote-request gate.
4. **Supabase Dashboard → Auth → URL Configuration → add `https://<yourdomain>/auth/confirm` to Redirect URLs allow-list.** ← required for verification links to work.
5. Update remaining Supabase auth redirect URLs (password reset, etc.).
6. Wire Plausible.
7. Check canonical URLs, sitemap, robots.txt, JSON-LD.
8. Confirm all deployed auth flows: sign up, email confirmation, sign in, forgot password, reset password.
9. Confirm package image URLs resolve correctly on deployed pages.

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

Current handoff intent from the user (2026-06-10):

- **Prompt 1 (MockDB P0 close-out) is complete and verified.**
- **Prompt 2 (RLS and Grants Audit) is complete and verified.** Migrations 008 + 009 applied to production Supabase.
- **Prompt 3 (rebrand + domain wiring) is complete and verified.** See §11 below.

### Exact next step for next session

All Gate 1 P0 blockers are now resolved. The next work is:

1. **Continue remaining MockDB removal pass.** Run `grep -rn "from.*mock-db" components/ app/` for live list. Components still importing MockDB: `QuoteRequestWizard`, `OfferForm`, `PaymentDetailsClient`, `OperatorLeadsClient`, `admin/*`, `PackagesBrowse`, `ComplaintForm`, `ComparisonTable`. These are lower urgency but must be fixed before public launch.

2. **Confirm Vercel production env vars.** `FEATURE_USE_REAL_DB=true`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk` must all be set. Without them the app throws on first DB-touching route.

3. **Supabase email confirmation toggle.** Dashboard → Auth → Settings → "Enable email confirmations" ON. Required before going public. Also add `https://pilgrimcompare.co.uk/auth/confirm` to Auth → URL Configuration → Redirect URLs.

4. **`app_metadata` role backfill.** Any Supabase auth user created before 2026-06-09 has role only in `user_metadata` and will default to `customer`. Backfill via the service role admin API before launch.

5. **Add Cloudflare redirect rule** for `pilgrimcompare.com` → `pilgrimcompare.co.uk`. See §11 for exact rule.

6. **Wire Plausible analytics.** Add script to `app/layout.tsx` with `data-domain=pilgrimcompare.co.uk` once domain is live. Gate behind cookie consent.

---

## 11. Domain & Rebrand — 2026-06-10

### What changed

Brand renamed **KaabaTrip → PilgrimCompare**. Production domain wired to **pilgrimcompare.co.uk**. Redirect domain **pilgrimcompare.com** (Cloudflare rule required — see below).

### Files touched (25+ source files)

| Category | Files |
| --- | --- |
| Config | `package.json`, `env.example` |
| SEO infra | `lib/seo.ts`, `lib/seo/json-ld.ts`, `app/robots.ts`, `app/sitemap.ts` |
| Layout | `app/layout.tsx` |
| Pages (metadata + copy) | `app/page.tsx`, `app/umrah/page.tsx`, `app/umrah/birmingham/page.tsx`, `app/umrah/london/page.tsx`, `app/umrah/manchester/page.tsx`, `app/umrah/cost/page.tsx`, `app/umrah/ramadan/page.tsx`, `app/hajj/page.tsx`, `app/search/packages/page.tsx`, `app/partner/page.tsx`, `app/packages/[slug]/page.tsx`, `app/operators/[slug]/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/settings/page.tsx`, `app/signup/page.tsx`, `app/verify-email/page.tsx`, `app/login/page.tsx`, `app/requests/[id]/confirmation/page.tsx`, `app/admin/layout.tsx`, `app/api/health/route.ts`, `app/operator/onboarding/page.tsx`, `app/showcase/page.tsx` |
| Components | `components/layout/Footer.tsx`, `components/layout/Header.tsx`, `components/operators/TierExplanation.tsx`, `components/auth/LoginModal.tsx`, `components/auth/SignUpForm.tsx`, `components/compliance/CookieConsent.tsx`, `components/marketing/CityCorridor.tsx`, `components/request/RequestDetail.tsx`, `components/request/ComplaintForm.tsx`, `components/request/PaymentInstructions.tsx`, `components/packages/PackageDetail.tsx`, `components/graphics/Logo.tsx`, `components/operator/OperatorRegistrationForm.tsx`, `components/showcase/*` |
| Lib | `lib/config.ts`, `lib/api/repository.ts`, `lib/api/mock-db.ts` |
| Tests | `tests/bank-details.test.ts`, `tests/smoke.e2e.spec.ts`, `tests/payment-instructions.test.tsx`, `tests/hero.spec.tsx`, `e2e/smoke.e2e.spec.ts`, `e2e/bank-payment.spec.ts` |
| Docs | `README.md`, `docs/SEO.md` |

### What was NOT changed (intentional)

- `KaabaTrip!2026` — dev login password credential; unchanged by design (code logic, not copy)
- `KT-XXXXX` booking reference prefix — existing DB records use this prefix; changing mid-flight would break lookups. Rename post-launch when reference DB is migrated.
- Supabase auth redirect URLs — updated manually in dashboard (per original instruction)
- CLAUDE.md, AI_NOTES.md internal planning docs — updated header only; historical entries preserve original context

### env.example state

```
NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk
NEXT_PUBLIC_APP_NAME=PilgrimCompare
```

Vercel must have `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk` set — without it the sitemap fallback and JSON-LD BASE_URL fallback both still resolve correctly (`?? 'https://pilgrimcompare.co.uk'`), but explicit env var is safer.

### Cloudflare redirect rule (add manually)

In the Cloudflare dashboard for the **pilgrimcompare.com** zone:

**Rules → Redirect Rules → Create rule**

| Field | Value |
| --- | --- |
| Rule name | `Redirect .com to .co.uk` |
| When incoming requests match | `Hostname equals pilgrimcompare.com` |
| Then | Redirect to `https://pilgrimcompare.co.uk${uri.path}` |
| Type | 301 (Permanent) |
| Preserve query string | Yes |

This covers all paths (`/`, `/umrah`, `/search/packages`, etc.) with a 301 permanent redirect preserving the path and query string.

### Open risks

1. **KT- reference codes** — the copy in `app/terms/page.tsx` still mentions "e.g., KT-XXXXX". This is a correct description of current DB behaviour; update copy once reference prefix is formally migrated.
2. **Plausible analytics** — no script in codebase yet. Wire `data-domain=pilgrimcompare.co.uk` to `app/layout.tsx` post-domain-launch, gated behind cookie consent check.
3. **Email addresses** — footer/privacy/terms now show `@pilgrimcompare.co.uk` addresses. Ensure those mailboxes exist before going live (`support@`, `privacy@`, `dpo@`, `complaints@`).

---

## 12. CI Workflow + Branch Protection — 2026-06-10 (Prompt 4)

### What changed

GitHub Actions CI workflow rewritten and branch protection rulesets created for both `main` and `dev`.

### Files created / modified

| File | What |
| --- | --- |
| `.github/workflows/ci.yml` | **Rewritten** — old file targeted non-existent `develop` branch, ran Playwright E2E, had npm caching. New file: PR-only trigger on `main`+`dev`, job named `ci`, steps: checkout → Node 20 → `npm ci` → `npx prisma generate` → `npx tsc --noEmit` → `npm run test`. No Playwright, no caching, no build step. |

### Root cause fix: prisma generate

First CI run failed with:
```
error TS2307: Cannot find module '@/lib/generated/prisma/models'
error TS2307: Cannot find module '@/lib/generated/prisma/client'
```
`lib/generated/prisma` is in `.gitignore` — Prisma client is never committed. Added `npx prisma generate` step between `npm ci` and `npx tsc --noEmit`. Second run passed in 48s.

### Branch protection rulesets (configured manually in GitHub)

Two rulesets created via **Settings → Rules → Rulesets**:

**Protect main** (Active):
- Target: `main`
- Rules: Restrict deletions ✅, Require PR before merging ✅ (0 approvals), Require status checks to pass ✅ (`ci` check, branches must be up to date), Block force pushes ✅

**Protect dev** (Active):
- Target: `dev`
- Same rules as above

### Decisions made

1. **No Playwright in CI.** E2E tests take too long for PR checks. Vitest (unit/integration) is sufficient gate. Playwright stays as a manual/pre-merge step.
2. **Job named `ci` not `test`.** Branch protection requires specifying the exact job name as a status check. `ci` matches the workflow file job name exactly.
3. **Node 20 not 24.** Local machine runs Node 24 but `@types/node` is `^20` — using Node 20 LTS for CI consistency.
4. **0 required approvals on both rulesets.** Solo project. PRs are required as a workflow record and CI gate, not for human review. Change to 1 when collaborators are added.
5. **No bypass list.** Ruleset applies to everyone including the repo owner — intentional to prevent accidental direct pushes to protected branches.

### AI_NOTES.md P1 item resolved

The item "CI branch mismatch: `.github/workflows/ci.yml` runs on `main` and `develop`, while docs say active branch is `dev`" is now **RESOLVED**.

### Open risks

1. **`ci` status check requires at least one completed run before it appears in the branch protection dropdown.** Already resolved — PR #29 ran and passed before the ruleset was created. Future repos: create the workflow file and run a PR first, then add protection.
2. **Prisma generate in CI uses the schema from the repo** — it does not connect to the database. Type generation only. This is correct and intentional. If the schema ever requires a live DB introspection step, revisit.
3. **No `DATABASE_URL` secret set in GitHub Actions.** Not needed currently — `prisma generate` uses the local schema file, not a live DB. If a future CI step needs a real DB connection (e.g. migration smoke test), `DATABASE_URL` must be added as a GitHub Actions secret.

### Exact next step for next session

All Gate 1 P0 blockers are resolved. CI is green. Branch protection is live.

**Next: Prompt 5 — Remaining MockDB removal pass.**

Run `grep -rn "from.*mock-db" components/ app/` to get the live list. Components still importing MockDB:
- `components/quote/QuoteRequestWizard.tsx`
- `components/operator/OfferForm.tsx`
- `components/operator/PaymentDetailsClient.tsx`
- `components/operator/OperatorLeadsClient.tsx`
- `components/admin/*`
- `components/packages/PackagesBrowse.tsx`
- `components/request/ComplaintForm.tsx`
- `components/request/ComparisonTable.tsx`

After MockDB pass, confirm:
- Vercel production env vars: `FEATURE_USE_REAL_DB=true`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk`
- Supabase Dashboard → Auth → Settings → "Enable email confirmations" ON
- `app_metadata` role backfill for pre-2026-06-09 users
