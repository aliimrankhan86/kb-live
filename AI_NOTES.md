# KaabaTrip AI Handover - Single Source of Truth

**Last verified:** 2026-06-08
**Branch:** `dev`
**Audience:** Claude, Codex, Kimi, and any AI/developer taking over the project.

This file is the current handover source of truth. If another document conflicts with a verified statement here, treat that other document as stale and update it before changing implementation. Historical notes were intentionally overwritten to remove contradictory pending/completed status.

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

Verified on 2026-06-08:

- `npm run test`: **passes**, 18 files, **238/238 tests**.
- `npm run build`: **passes**, 0 build errors.
- `npx tsc --noEmit`: **passes**.
- `git diff --check`: **passes**.
- `npx playwright test`: **57 passed, 6 skipped, 0 failed**.
- `npx playwright test e2e/signup-password-mismatch.spec.ts`: **3 passed**.
- Manual Playwright smoke:
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
- Normal `/login` has a dev-auth credential fallback for the dev accounts above. It is enabled in local development, E2E, Vercel preview deployments, or when `KAABATRIP_ENABLE_DEV_AUTH=true` is explicitly set. It is disabled in true production by default. It validates `KaabaTrip!2026`, sets `__dev_user`, and returns the same safe user shape as real auth.
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

2026-06-08 dev account login fix:

- Root cause for "Invalid email or password" with documented dev accounts: `/login` fallback and `__dev_user` readers were hard-gated to `NODE_ENV=development`, so Vercel preview / production-mode QA sent those credentials to Supabase Auth instead.
- Fixed by centralizing dev-auth enablement in `isDevAuthEnabled()`: enabled for local development, E2E, Vercel preview, or explicit `KAABATRIP_ENABLE_DEV_AUTH=true`; disabled for true production by default.
- `__dev_user` handling is now aligned across sign-in, middleware, server sessions, `/api/auth/me`, `/dev/login`, and sign-out.

2026-06-08 header login + London airport split:

- Guest header links now render while `/api/auth/me` is loading, so the Login and For Partners links do not become invisible for unauthenticated users.
- Umrah route capture now uses airport-level values instead of generic city values.
- London is split into London Heathrow (LHR) and London Gatwick (LGW), with Birmingham (BHX) and Manchester (MAN) as the other launch airport options.
- Server-side search filtering validates and filters by `departureAirport`, so LHR and LGW produce distinct package result sets.
- Operator package API validation uses the shared airport code catalogue.
- Default exact-date submission uses local date formatting rather than UTC `toISOString()`, preventing UK timezone shifts from defaulting the departure date to yesterday.

2026-06-08 auth/dev persona work:

- Normal `/login` accepts documented dev persona credentials in local development, E2E, Vercel preview deployments, or controlled QA environments with `KAABATRIP_ENABLE_DEV_AUTH=true`.
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
| P0 | Production env validation | Confirm production has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; verify Redis path is used outside local/dev fallback. |
| P0 | Deployed Prisma/Supabase cutover | Local/verified paths exist with `FEATURE_USE_REAL_DB=true`; deployed environment needs explicit smoke against Supabase data, auth redirects, and RLS. |
| P0 | Domain launch | Buy/configure production domain. Then update `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, Supabase auth redirect URLs, canonical URLs, robots, sitemap, JSON-LD base URLs, and any hardcoded `kaabatrip.com` assumptions. |
| P1 | Plausible analytics | Wire after domain is live and cookie-consent behavior is confirmed. |
| P1 | Payment evidence RLS/read access | Old notes say operator/admin read access for payment evidence files may still be owner-only. Re-verify storage bucket policies before relying on evidence retrieval. |
| P1 | Payment evidence policy conflict | Product canon says MVP evidence storage is metadata-only; architecture notes describe byte storage/purge. Resolve policy before shipping file-byte storage changes. |
| P1 | Admin reconciliation | `/admin/reconciliation` exists. Verify export completeness, expected CSV/PDF format, and payment-evidence linkage before treating as done. |
| P1 | Operator analytics depth | Base real-event dashboard is done. Future work: deeper conversion breakdowns, top-package analysis, attribution quality, and business-facing chart polish. |
| P2 | Local Chrome SEO/AEO QA | Server-side SEO/AEO work was done earlier. A rendered local Chrome audit remains useful for titles, JSON-LD, canonicals, noindex/robots, and visible FAQ consistency. |
| P2 | Test coverage | Tests pass, but coverage was previously around 28 percent. Increase coverage for auth session, auth API, DB adapter, package APIs, analytics, and payment evidence. |
| P2 | Docs consistency | Some docs still contain stale historical status such as operator analytics partial/E2E pending. Update those docs as touched; do not regress implementation to match stale docs. |

Known local/tooling files:

- `.agents/`
- `.claude/`
- `scripts/`

These are local/untracked tooling artifacts. Do not push them unless the user explicitly asks to version them.

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
