# PilgrimCompare AI Handover — Single Source of Truth

**Last verified:** 2026-06-10 (CI workflow + branch protection + infra verification)
**Branch:** `dev`
**Audience:** Claude, Codex, Kimi, and any AI/developer taking over the project.

**Next immediate action:**
Q1 — PilgrimCompare sweep, banned-phrase audit, dynamic departure cities
Prompt file: `docs/PILGRIMCOMPARE_QUALITY_PROMPTS.md` → Q1
Pre-req: `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` must be committed to repo first (founder manual task)

This file is the current handover source of truth. If another document conflicts with a verified statement here, treat that other document as stale and update it before changing implementation.

---

## 0. Gate Status

### Gate 1 — Safe to merge dev → main ✅ DONE
- MockDB removed from all production-facing paths (Prompt 1)
- `FEATURE_USE_REAL_DB` fail-fast implemented: throws if not `'true'` outside test/E2E (Prompt 1)
- RLS and grants audited; migrations 008 + 009 applied and verified (Prompt 2)
- PR #27 merged

### Gate 2 — Safe to make public ✅ DONE (one exception)
- Domain `pilgrimcompare.co.uk` live on Vercel; `NEXT_PUBLIC_SITE_URL` set correctly
- Supabase auth redirect URLs updated; email confirmation toggle ON
- Cloudflare DNS wired: `pilgrimcompare.com` + `www.pilgrimcompare.com` → `pilgrimcompare.co.uk` (301, preserve path + query)
- Resend SMTP configured; all 5 transactional emails live
- Email mailboxes: `support/privacy/dpo/complaints@pilgrimcompare.co.uk` forwarding active
- CI workflow green; branch protection active on `main` + `dev`

**Exception (not blocking, must close before scaling):**
- **Plausible analytics: UNCONFIRMED** — wire `data-domain=pilgrimcompare.co.uk` in `app/layout.tsx` behind cookie consent

### Gate 3 — Soft launch ⚡ ACTIVE
Target: 5 operators onboarded, ~50 packages live. No code blockers for this gate — it is an operator acquisition and data-quality goal.

**Pre-req before any operator onboarding:**
- `/public/logo.svg` and `/public/text-logo.svg` still contain PilgrimCompare — fix first (Q1 scope)

---

## 1. Product Identity & Hard Rules

### Brand
- **PilgrimCompare** — never PilgrimCompare in user-facing copy, UI components, or code comments
- UK-first Umrah comparison and enquiry marketplace
- Does not hold funds, take bookings, or issue ATOL certs
- Missing data = **"Not provided"** — never infer, estimate, or fill in

### Standard copy (use verbatim — do not paraphrase)
1. "You pay the operator directly. PilgrimCompare does not receive or hold your payment."
2. "Your travel contract, cancellations and refunds are with the operator named on this page."
3. "Your PilgrimCompare reference code is a tracking code, not a payment receipt."

### Hard don'ts — code and copy
- Never take, hold, route, or invoice payment
- Never conclude a booking or issue a ticket, voucher, or ATOL cert
- Never bundle services from two operators
- Never use undisclosed paid ranking — default sort must be neutral and disclosed (DMCC Act 2024)
- Never use "priority placement" in operator-facing copy — use "we build your profile to rank at its best"

---

## 2. Revenue Model

Operators pay. Travellers are always free. Funds never flow through the platform.

| Phase | Trigger | Model |
|---|---|---|
| **Phase 1** | Now — founding tier | Free. Framing: "we build your profile to rank at its best" |
| **Phase 2** | 150+ enquiries/month | £10/qualified enquiry **or** £79/month subscription |
| **Phase 3** | 90-day booking outcome loop proven | £75 flat success fee per completed booking — B2B invoice only |

**BookingOutcome dataset = billing evidence.** Protect from day one. Do not expose or truncate outcome records.

---

## 3. Non-Negotiable Rules

### Read before every session
1. `AGENTS.md`
2. `docs/README_AI.md`
3. `docs/NOW.md`
4. This `AI_NOTES.md`
5. `.agents/skills/supabase/SKILL.md`
6. `.agents/skills/supabase-postgres-best-practices/SKILL.md`

### Session protocol
- **One task per prompt.** Do not scope-creep into adjacent work.
- **`/compact` at ~50% context** to prevent overflow mid-task.
- **Update `AI_NOTES.md` at session end** — gate status if shifted, open risks if changed, next step updated.

### Before every push
- `npm run test` green (232/232 or higher)
- `npm run build` 0 errors
- `npx tsc --noEmit` pass
- UI/route change → Playwright smoke `/`, `/umrah`, `/search/packages` at 320px + 1280px
- Small focused diffs; one concern per commit; add `data-testid` for new Playwright targets

### Additional docs by task
- UI edits: `docs/UX_GUIDELINES.md`
- Public route/SEO changes: `docs/SEO.md`
- Operator work: `docs/OPERATOR_ONBOARDING.md`
- Architecture/security changes: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`

### Coding invariants
- UI components must not import MockDB directly — use `Repository`
- All `Repository.*` calls are async and must be awaited
- Next.js 15 `params` and `searchParams` are promises in Server Components
- Public schemas/forms must not expose an `admin` role
- Auth APIs must only return safe user shape: `{ user: { id, email, role, name } }`
- API errors use `AppError` / `mapErrorToResponse`, not raw `err.message`
- No production `console.log` / `console.warn`
- Use Zod validation before API/DB writes

---

## 4. Verified Current State

**Verified 2026-06-10:**
- `npm run test`: **232/232 passes**, 18 files
- `npm run build`: **0 errors**
- `npx tsc --noEmit`: **passes**
- `npm run lint`: **passes**
- `npx prisma validate`: **passes** (schema unchanged since 2026-06-09)
- `npx playwright test`: 57 passed, 6 skipped, 0 failed (last full run 2026-06-08)

**Stack:**
- Next.js 15.5.19 App Router · React 19 · TypeScript strict
- Tailwind v4 · Vitest 4.1.8 · Playwright
- Prisma 7 + Supabase Postgres/Auth/Storage (EU West / Ireland)
- Upstash Redis (rate limiting)

**Known non-failing warnings:**
- Supabase Edge warning from `@supabase/ssr` referencing `process.version`
- Webpack cache-size warnings during build

---

## 5. Auth & Dev Personas

### Password rules
Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character. Enforced in `lib/validation.ts`, sign-up route, and `SignUpForm.tsx`.

### Dev accounts (local `NODE_ENV=development` and `E2E_TESTING=1` only)

| Persona | Email | Password | Expected view |
|---|---|---|---|
| Customer | `customer@example.com` | `PilgrimCompare!2026` | Customer nav + public flows |
| Operator verified | `operator@example.com` | `PilgrimCompare!2026` | Partner dashboard |
| Operator new | `operator2@example.com` | `PilgrimCompare!2026` | Onboarding status flows |
| Admin | `admin@example.com` | `PilgrimCompare!2026` | Admin audit flows |

`PilgrimCompare!2026` is intentionally unchanged — it is a dev credential token, not user-facing copy.

### Auth bypass paths
- `__e2e_user` cookie: active only when `E2E_TESTING=1`. `next.config.ts` compiles `E2E_TESTING=''` in all deployments — path is dead in production/preview.
- `/dev/login` route and `lib/auth/dev-users.ts`: **deleted 2026-06-09**. No bypass for non-E2E flows.

### Role source
Authorization role reads from `app_metadata.role` (service-role-only) — not user-editable `user_metadata`. Fixed 2026-06-09.

⚠️ Backfill required: any Supabase auth user created before 2026-06-09 has role only in `user_metadata` and will default to `customer`. Set `app_metadata.role` via the service-role admin API before operator onboarding.

---

## 6. Architecture

```
Next.js App Router UI
  → API routes / Server Components
  → lib/api/repository.ts
  → lib/api/db/adapter.ts (Prisma/Supabase)
  → Supabase Postgres/Auth/Storage with RLS
```

**Repository rule:** UI and routes go through `Repository`. MockDB exists for unit tests and E2E only — never in production-facing paths.

**Client/server boundary:** `next.config.ts` aliases the DB adapter for browser bundles. `lib/api/db/client-adapter-stub.ts` keeps Turbopack/browser paths safe.

### Core entities
`User` · `OperatorProfile` · `Package` · `QuoteRequest` · `Offer` · `BookingIntent` · `PaymentDetails` · `BankChangeRequest` · `AuditLogEntry` · `Complaint` · `AnalyticsEvent`

### Operator eligibility (bookable)
- `verificationStatus === 'verified'`
- tier ≠ `listed`
- `eligibilityFlags.canReceiveBookings === true`
- `eligibilityFlags.bankDetailsActive === true`
- one active `PaymentDetails` record

### RBAC shape
- Customers: own quote requests, booking intents, complaints, evidence
- Operators: open leads, own packages/offers/bookings/profile/payment records
- Admins: bank changes, complaints, reconciliation, sensitive audit flows
- Public: published packages + public operator profiles only

### Payment/evidence policy
- BookingIntent reference codes are `KT-…`, unique, and immutable
- Evidence metadata and file bytes visible only to the customer, involved operator, or admin
- Product canon says MVP evidence storage is metadata-only; architecture supports byte storage — **policy conflict, resolve before shipping evidence-review UI**

---

## 7. Feature Map

### Public / customer routes

| Route | Status |
|---|---|
| `/` | Done |
| `/umrah` | Done |
| `/hajj` | Done |
| `/umrah/ramadan` · `/umrah/london` · `/umrah/birmingham` · `/umrah/manchester` · `/umrah/cost` | Done |
| `/search/packages` | Done |
| `/packages` · `/packages/[slug]` | Done |
| `/operators/[slug]` | Done |
| `/quote` | Done |
| `/requests/[id]` · `/requests/[id]/confirmation` | Done |
| `/settings` | Done |
| `/privacy` · `/terms` | Done |
| `/login` · `/signup` · `/verify-email` | Done |

### Operator / admin routes

| Route | Status |
|---|---|
| `/partner` | Exists |
| `/operator/onboarding` · `/operator/onboarding/status` | Done |
| `/operator/dashboard` | Done |
| `/operator/packages` | Done (CSV import/export + wizard) |
| `/operator/leads` | Done |
| `/operator/analytics` | Done (real event summaries + trends) |
| `/operator/profile` · `/operator/settings` | Done |
| `/operator/settings/payment-details` | Done |
| `/admin/bank-changes` · `/admin/bank-changes/[id]` | Done |
| `/admin/complaints` | Done |
| `/admin/reconciliation` | Exists — export format + CSV schema need business sign-off |

### Airport scope (launch)

| City | Airports |
|---|---|
| London | LHR (Heathrow), LGW (Gatwick) |
| Manchester | MAN |
| Birmingham | BHX |

---

## 8. Open Risks & Pending Items

### P0 — must resolve before scaling

| Item | Status |
|---|---|
| `/public/logo.svg` + `/public/text-logo.svg` contain PilgrimCompare | **OPEN — fix before operator onboarding (Q1 scope)** |
| PaymentEvidence RLS — operator/admin read access | **UNCONFIRMED** — storage policies updated (migration 006) but evidence-review UI and signed-download route not built. Resolve before Gate 2 fully closed. |
| `app_metadata` role backfill | Pre-2026-06-09 users default to `customer`. Backfill via service-role admin API before onboarding operators. |
| Plausible analytics | Not wired — add `data-domain=pilgrimcompare.co.uk` in `app/layout.tsx` gated behind cookie consent. |

### P1 — high value, not launch-blocking today

| Item | Status |
|---|---|
| GDPR export/delete | `/api/user/export` uses partial real-DB paths. Verify `Repository` methods cover all PII tables before public launch. |
| Rate limiting scope | Only `POST /api/quote-requests` + auth endpoints covered. Extend to booking intents, bank-detail changes, admin actions, evidence uploads. |
| Admin reconciliation | `/admin/reconciliation` exists. Export format, CSV schema, and payment-evidence linkage need owner sign-off before treating as done. |
| Email rate limiting | Per-user email cooldown not implemented. Existing Upstash rate limit on quote endpoint is only throttle. |
| Evidence bytes policy | Product canon: MVP = metadata only. Architecture supports byte storage/purge. Resolve policy before shipping evidence-review UI. |
| Google Workspace upgrade | Upgrade from Cloudflare Email Routing (forward-only) when first operator is onboarded and needs reply-from `support@pilgrimcompare.co.uk`. |
| Health check depth | `/api/health` returns static JSON. Add a deploy-time dependency check for Supabase, Prisma, and Upstash. |

### P2 — cleanup

| Item | Status |
|---|---|
| Test coverage | Passes at 232/232 but coverage ~28%. Increase for auth session, DB adapter, package APIs, analytics, payment evidence. |
| `KT-` reference prefix | Existing DB records use this. Rename only post-launch after migration. `/terms` copy references `KT-XXXXX` — update when prefix changes. |
| Docs consistency | Some docs contain stale historical status. Update when touched; do not regress implementation to match stale docs. |

---

## 9. Infrastructure Reference

### Domain + DNS

| Zone | Record / Rule | Value |
|---|---|---|
| `pilgrimcompare.com` | CNAME `www` | `pilgrimcompare.com` (Cloudflare proxied) |
| `pilgrimcompare.com` | Redirect rule | `http.host eq "pilgrimcompare.com" or http.host eq "www.pilgrimcompare.com"` → `concat("https://pilgrimcompare.co.uk", http.request.uri.path)`, 301, preserve query string |
| `pilgrimcompare.co.uk` | Vercel DNS | Production deployment |

### Transactional email

| Email | Trigger | From | Reply-to | To |
|---|---|---|---|---|
| Confirm signup (1) | Supabase Auth | Supabase → Resend SMTP | — | New user |
| Enquiry confirmation (2) | `POST /api/quote-requests` | `notifications@send.pilgrimcompare.co.uk` | `support@pilgrimcompare.co.uk` | Customer |
| Operator enquiry alert (3) | `POST /api/quote-requests` | same | Customer email | Operator |
| Booking intent (4) | `POST /api/booking-intents` | same | `support@` | Customer |
| Payment evidence (5) | `POST /api/booking-intents` (with evidence) | same | `support@` | Operator |

Mailboxes `support/privacy/dpo/complaints@pilgrimcompare.co.uk` → Cloudflare Email Routing → `aliimrankhan86@googlemail.com`. Gmail filter: `to:(pilgrimcompare.co.uk)` → label `PilgrimCompare`, never spam. Upgrade to Google Workspace when first operator onboarded.

### CI / branch protection
- Workflow: `.github/workflows/ci.yml` — triggers on PR to `main` + `dev`
- Steps: checkout → Node 20 → `npm ci` → `npx prisma generate` → `npx tsc --noEmit` → `npm run test`
- No Playwright in CI (too slow for PR checks — run manually pre-merge)
- Branch protection active on `main` + `dev`: require PR, require `ci` status check, block force-push, 0 required approvals (solo project)
- No `DATABASE_URL` in CI — `prisma generate` uses schema file only (correct and intentional)

### Supabase
- Region: EU West / Ireland
- Email confirmation toggle: **ON** ✅
- Redirect URL allow-list includes `https://pilgrimcompare.co.uk/auth/confirm` ✅
- SMTP: Resend — host `smtp.resend.com`, port 465, user `resend`

### Vercel production env vars (all must be set)
- `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk`
- `FEATURE_USE_REAL_DB=true`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- All Supabase vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) + `DATABASE_URL`

---

## 10. Pending Prompt Queue

### Completed

| Prompt | Task | Status |
|---|---|---|
| Prompt 1 | MockDB removal + `FEATURE_USE_REAL_DB` fail-fast | ✅ Done |
| Prompt 2 | RLS and grants audit — migrations 008 + 009 | ✅ Done |
| Prompt 3 | Domain wiring + full PilgrimCompare → PilgrimCompare rebrand | ✅ Done |
| Prompt 4 | GitHub branch protection + CI workflow | ✅ Done |

### Quality pass queue — NEXT

| Queue | Task | Pre-req |
|---|---|---|
| **Q1** ← next | PilgrimCompare sweep + banned-phrase audit + dynamic departure cities + logo SVGs | `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` committed |
| Q2 | Legal pages `/terms` `/privacy` `/how-it-works` | Q1 done |
| Q3 | IA/nav — header, footer, back buttons, breadcrumbs | Q1 done |
| Q4 | Mobile polish 360/390/430px | Q3 done |
| Q5 | SEO — metadata, JSON-LD, sitemap | Q1 done |
| Q6 | Ranking transparency + Featured infrastructure | Revenue model confirmed |

### Automation suite — NOT started

Prompts 5–13: email triggers, crons, Telegram alerts, operator data ingestion, target-list pipeline. Scope in `docs/PILGRIMCOMPARE_CLAUDE_CODE_PROMPTS.md` once committed.

---

## 11. Verification Playbook

```bash
# Docs-only changes
git diff --check

# Implementation changes
npx tsc --noEmit
npm run test
npm run build

# UI / routing changes
npm run dev
npx playwright test
```

**Manual smoke targets:** `/` · `/umrah` · `/search/packages?type=umrah` · `/login` · `/operator/dashboard` · `/operator/analytics`

**Viewports:** 320px mobile · 1280px desktop

**Auth smoke:**
- Customer: `customer@example.com` / `PilgrimCompare!2026` → redirects to `/`, customer nav visible
- Partner: `operator@example.com` / `PilgrimCompare!2026` → redirects to `/operator/dashboard`

---

## 12. How the Next AI Should Work

1. Read `AGENTS.md`, `docs/README_AI.md`, `docs/NOW.md`, this file, `.agents/skills/supabase/SKILL.md`, `.agents/skills/supabase-postgres-best-practices/SKILL.md`.
2. Run `git status -sb`.
3. Do not revert uncommitted user/agent work.
4. If a doc conflicts with verified state here, update the doc — do not undo implementation.
5. Pick **one** scoped task.
6. Update relevant docs as part of the task.
7. Run required verification gates.
8. Update `docs/NOW.md` and this file before handoff or push.

**Current handoff intent (2026-06-10):**
Prompts 1–4 complete. Infrastructure fully deployed. Gate 1 + Gate 2 done. Next session is Q1 — PilgrimCompare sweep. Wait for `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` to be committed before starting Q1.
