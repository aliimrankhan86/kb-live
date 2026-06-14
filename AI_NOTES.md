# PilgrimCompare AI Handover — Single Source of Truth

**Last verified:** 2026-06-12 (Prompt 5 + 6 — transactional email + cron suite — 1,818 tests, 0 build errors)
**Branch:** `dev` (clean — Q1–Q6 all merged via PRs)
**Audience:** Claude, Codex, Kimi, and any AI/developer taking over the project.

**Next immediate action:**
Gate 3 — operator onboarding. Run the 3 DB migration SQL statements in §23 against Supabase before deploying. Then begin operator acquisition.
See §10 + §23 for queue context.

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
- `WordmarkLogo` component (`components/graphics/WordmarkLogo.tsx`) ✅ done — Nunito ExtraBold 800, `currentColor`, used in Header + Footer
- `/public/logo.svg` and `/public/text-logo.svg` static files — verify brand strings are current (Q1 scope)

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

**Verified 2026-06-12 (Prompt 5 + 6 — transactional email + cron suite):**
- `npm run test`: **1,818/1,818 passes**, 24 files
- `npm run build`: **0 errors**
- `npx tsc --noEmit`: **passes**
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

### Future features — flagged, NOT approved for build

- **Hotel data enrichment** logged as a FUTURE feature, NOT approved for build — must be scoped against standards §9 before any work (three distinct states: operator-stated / verified-with-source / Not provided; never silent-fill; operator can correct; disclose to users). The "Not provided" baseline from this fix is its prerequisite. Knowledge base Section 8 + 15 updated.

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
| Prompt 3 | Domain wiring + full rebrand to PilgrimCompare | ✅ Done |
| Prompt 4 | GitHub branch protection + CI workflow | ✅ Done |
| Prompt 5 | Transactional email suite (5 emails, React Email, Resend) | ✅ Done 2026-06-12 — see §23 |
| Prompt 6 | Cron job suite (3 crons + outcomes endpoint + idempotency) | ✅ Done 2026-06-12 — see §23 |

### Quality pass queue — NEXT

| Queue | Task | Pre-req |
|---|---|---|
| ~~Q1~~ ✅ | PilgrimCompare sweep + banned-phrase audit + dynamic departure cities | Done 2026-06-12 — see §17 |
| ~~Q2~~ ✅ | Legal pages `/terms` `/privacy` `/how-it-works` | Done 2026-06-12 — see §18 |
| ~~Q3~~ ✅ | IA/nav — header, footer, back buttons, breadcrumbs | Done 2026-06-12 — see §19 |
| ~~Q4~~ ✅ | Mobile polish 360/390/430px | Done 2026-06-12 — see §20 |
| ~~Q5~~ ✅ | SEO — metadata, JSON-LD, sitemap, banned-phrase CI | Done 2026-06-12 — see §21 |
| ~~Q6~~ ✅ | Ranking transparency + Featured infrastructure | Done 2026-06-12 — see §22 |

---

## 13. Mobile UX Pass — 2026-06-10

### Problems addressed
1. **Footer too tall on mobile** (~1100px) — 3-column stack with centered top block then left-aligned sections caused visual alignment break and excess scroll.
2. **Section headings felt "right-aligned" / disconnected** — IA mismatch: top brand block centered (`flex-col items-center`) then sections switched to left-aligned, breaking eye anchor.
3. **Mobile drawer overlay too subtle** — `rgba(0,0,0,0.6)` + 4px blur was barely perceptible; user did not notice it existed.
4. **Background scroll while drawer open** — body could be scrolled behind the drawer, breaking the modal mental model.

### Fixes applied
- **[components/layout/Footer.tsx](components/layout/Footer.tsx)** — rewritten as client component.
  - Left-aligned consistently across all breakpoints (no more centered→left jump).
  - 3 sections now collapsible accordions on mobile (`<button aria-expanded aria-controls>` + `hidden` content div), force-open on desktop (≥768px) via `matchMedia` hook.
  - First section ("PilgrimCompare Limited") open by default on mobile so contact info is immediately visible.
  - Disclaimer condensed from 2 paragraphs to 1 (ATOL + ABTA verification merged inline).
  - Copyright row collapsed from 2 rows to stacked column on mobile.
  - Mobile footer height: ~1100px → ~671px (~40% reduction). Desktop unchanged in layout.
- **[components/layout/header.module.css:88](components/layout/header.module.css:88)** — overlay strengthened: `rgba(0,0,0,0.72)` + `blur(8px) saturate(140%)`. Visually obvious without obscuring the drawer.
- **[components/layout/Header.tsx](components/layout/Header.tsx)** — body scroll lock when drawer open: sets `position: fixed` on body + `overflow: hidden` on `html` + preserves scrollY and restores on close. Covers iOS Safari edge case where `body { overflow: hidden }` alone doesn't lock window scroll.

### Verification
- `npx tsc --noEmit`: pass
- `npm run build`: 0 errors
- `npm run test`: 232/232 pass
- Manual: DOM inspection via dev preview — mobile accordions toggle correctly, desktop sections all open at ≥768px (verified `aria-expanded="true"` on all 3 at 826px viewport), drawer overlay visible + body scroll-locked when open.

### Out of scope for this pass (deferred to Q3/Q4)
- ~~Breadcrumbs on inner pages~~ — addressed in §14 below
- ~~Back-button affordances on operator dashboard~~ — covered by dual-purpose Breadcrumb (§14)
- Cross-page consistency audit of typography scale at 360px

---

## 14. UX Pass 2 — IA, sliders, steppers — 2026-06-10

### Problems addressed
1. **Stepper buttons 36×36px** in [UmrahSearchForm](components/umrah/UmrahSearchForm.tsx) — below the project's 44px tap-target rule (CLAUDE.md).
2. **RangeSlider thumbs 24px desktop / 28px small mobile** — too small for confident thumb interaction; track wrapper only 40px tall.
3. **No mobile back-affordance** on nested pages. Full breadcrumb trail at small viewports wastes horizontal space and gives tiny tap targets.
4. **Three nested pages missing breadcrumbs entirely**: `/operator/settings/payment-details`, `/operator/onboarding/status`, `/admin/bank-changes/[id]` (latter had an ad-hoc "← Back to queue" button replaced for consistency).

### Fixes applied
- **[components/umrah/umrah-search-form.module.css:560](components/umrah/umrah-search-form.module.css:560)** — stepper buttons 36 → **44×44px** + `:active` scale feedback + explicit focus ring + `touch-action: manipulation`.
- **[components/ui/RangeSlider.module.css](components/ui/RangeSlider.module.css)** — track wrapper 40 → **44px** (WCAG AAA touch target). Thumb 24 → **28px desktop, 32px mobile** (≤480px). Pointer-events on input kept as `none` so the second range input doesn't block the first thumb (keyboard focus still works — `pointer-events: none` only blocks pointer, not focus).
- **[components/ui/Breadcrumb.tsx](components/ui/Breadcrumb.tsx)** — same component now renders two views:
  - **Mobile (<640px / `sm:hidden`)**: compact `← {parent label}` with 44px min-height — doubles as wayfinding *and* back-affordance.
  - **Desktop (≥640px / `sm:flex`)**: full breadcrumb trail (existing behavior). No API change — all existing usages just gain the mobile mode automatically.
  - Targets the nearest ancestor item with an `href` (skipping the current page). Falls back to nothing if no parent has an href.
- **Nested pages now have Breadcrumb**:
  - [app/operator/settings/payment-details/page.tsx](app/operator/settings/payment-details/page.tsx) — Dashboard → Settings → Payment details
  - [app/operator/onboarding/status/page.tsx](app/operator/onboarding/status/page.tsx) — Onboarding → Verification status
  - [app/admin/bank-changes/[id]/page.tsx](app/admin/bank-changes/[id]/page.tsx) — Admin → Bank changes → Review (replaces ad-hoc back button)

### Verification
- `npx tsc --noEmit`: pass
- `npm run test`: 232/232 pass
- `npm run build`: 0 errors
- Runtime (375px mobile preview): stepper buttons measured 44×44px, slider track wrapper 44px tall. Component renders mobile `← parent` link on `<640px` viewports via `sm:hidden` / `sm:flex` swap.

### Out of scope (later passes)
- Quote wizard step-back affordance (already has per-step Previous button — not duplicating)
- Login/signup back-to-home (intentional — auth is a sink, header brand link covers exit)
- Per-page IA audit of admin sub-pages beyond `/bank-changes/[id]`

### Footer legal/contact cleanup (same session)
- **Removed misleading legal entity framing** from footer ([Footer.tsx](components/layout/Footer.tsx)):
  - Section "PilgrimCompare Limited" → renamed to **"Contact"** (address + email only).
  - Dropped `Company Reg: [Registration in progress]` and `VAT: [To be completed]` placeholders — Companies Act 2006 §82 requires real registered name + number, never placeholders.
  - Copyright "© PilgrimCompare Limited" → "© PilgrimCompare".
- **Added Companies Act 2006 §82 disclosure** under copyright row: *"PilgrimCompare is a trading name of **Paramount Consultants Limited**, registered in England and Wales (company no. **09679002**). VAT no. **GB 221 6154 46**."*
- **⚠ Open compliance gap — registered office address omitted from website intentionally.**
  - Current Companies House registered office for Paramount Consultants Limited is the founder's **residential address** (25 Thurston Road). Publishing on the website would expose home address; not publishing leaves website partially non-compliant with Trading Disclosures Regs 2008 (which require registered office on the site).
  - Note: residential address is already public on Companies House search regardless — so the privacy fix requires changing the registered office at Companies House, not just hiding it on the website.
  - **Remediation plan (target: within 30 days of 2026-06-10)**:
    1. Set up virtual / business registered office (e.g., Hoxton Mix, Mint Formations, accountant-bundled service — typical cost £40–200/yr).
    2. File **Companies House form AD01** to update Paramount Consultants Limited's registered office.
    3. Wait for Companies House to confirm (usually same day).
    4. Add the new registered office line back to footer + uncomment the line in [Footer.tsx](components/layout/Footer.tsx).
    5. Also restore "Slough, Berkshire" line in Contact section if the new registered office is in Slough (currently removed for consistency).
  - **Risk while gap open**: practically zero. Trading Standards enforcement against pre-revenue solo Ltd companies for missing registered office on website is unheard of. Home-address exposure was the bigger risk.
- **Added DPO contact** to Legal section: `mailto:dpo@pilgrimcompare.co.uk` ("Data Protection (DPO)"). GDPR Art 38 expects discoverable DPO contact; mailbox already forwarding per §9 of this doc.

### Trust strip layout fix (same session)
- **[components/marketing/Hero.module.css](components/marketing/Hero.module.css)** — Hero trust bar (Verified Operators / ATOL Protected / Transparent Pricing / Side-by-side Comparison) was using `flex-wrap + justify-center` which produced an uneven 2/1/1 stack at mobile widths. Switched to explicit grid: **2 cols at <768px**, **4 cols at ≥768px**. Allow text to wrap (no more ellipsis). Now balanced at every breakpoint.

### Footer alignment fixes (same session)
- **Legal disclosure paragraph** ([Footer.tsx:206](components/layout/Footer.tsx:206)) — centered using `flex justify-center` wrapper with `max-w-md` paragraph (text-center on paragraph itself didn't apply reliably; flex container ensures mobile centering).
- **Copyright section** ([Footer.tsx:198](components/layout/Footer.tsx:198)) — mobile center-aligned (text-center on each `<p>`), desktop left-aligned with justify-between spread. Both lines now visually centered on <768px viewports.

### Automation suite — NOT started

Prompts 5–13: email triggers, crons, Telegram alerts, operator data ingestion, target-list pipeline. Scope in `docs/PILGRIMCOMPARE_CLAUDE_CODE_PROMPTS.md` once committed.

---

## 15. Umrah Mobile UX Overhaul — 2026-06-10

Branch: `chore/remove-dead-filter-components` (off `dev`) → **PR [#41](https://github.com/aliimrankhan86/kb-live/pull/41) open to `dev`, CI green** (2026-06-11). Scope: the core business surfaces — `/search/packages` results, the compare experience, the filter panel, the `/umrah` form headings, **and the `/packages/[id]` detail page** (decision-detail pass below). Grounded in the `ui-ux-pro-max` + `make-interfaces-feel-better` + `accessibility` skills. Verified at 360/390px + 1280px in the live preview; `npm run test` **235/235**, `npm run build` 0 errors, `tsc` pass.

### Problems addressed (confirmed in code + live preview)
1. **Two overlapping concepts collided.** Every card had **Save** (heart) *and* **Compare** (grid). The header *also* stacked a "Shortlist only" toggle, an "N in shortlist" counter, a disabled **Compare (0)** button (looked active), and a help banner with a cryptic ▣ grid icon. High cognitive load; users couldn't tell shortlist from compare.
2. **Cards ~2.5 screens tall**, dominated by placeholder noise ("Departure TBC / - / LHR → JED/MED" twice). Price — the thing people compare on — was buried below the fold.
3. **Comparison was a 672px sideways-scrolling table** inside a dialog — you couldn't see two packages at once on a phone.
4. **The filter panel did nothing.** `FilterOverlay` wrote to local React state with a shape `filterByParams` never read (it had a literal `// Here you would typically filter…` placeholder). It also priced in **USD** and offered **Christmas/Easter** presets — wrong audience for Umrah.

### Decisions taken (founder-approved via AskUserQuestion)
- **Compare-first + sticky bar** (demote Save to a quiet bookmark).
- **Filters: make them fully work + localize** (GBP, Umrah-relevant presets).
- **Mobile comparison: native side-by-side** with attribute labels (implemented as fit-to-width, no horizontal scroll — see note below).
- **Scope: all of** results/cards, compare, filters & sort, `/umrah` form.

### What changed
- **[PackageCard.tsx](components/search/PackageCard.tsx)** — rewritten price-first (~1 screen). Flight placeholders condensed to a single quiet route/nights line (`TBC`/`-` suppressed via `isPlaceholder`). Compact hotel rows with 56px thumbnails. Save = quiet bookmark in the header (kept `data-testid="shortlist-toggle-…"`). Compare = a real word-labelled checkbox ("Compare" → "Selected", yellow tick); selected card gets a yellow glow border. Kept `data-testid="package-compare-toggle-…"`; added `package-view-…`. New `compareFull` prop disables the toggle when 3 are already picked.
- **[CompareBar.tsx](components/search/CompareBar.tsx)** + module CSS — new sticky bottom bar (`position: fixed`, `env(safe-area-inset-bottom)`). Appears on first selection; says in plain words what to do ("Pick N more to compare" → "Ready — tap Compare"); shows operator-name chips with remove ×; Clear + Compare CTA (kept `data-testid="search-compare-button"`). The list reserves `padding-bottom` so the bar never hides the last card.
- **[PackageList.tsx](components/search/PackageList.tsx)** — header decluttered to **count + Filter + Sort**. "Saved" is now a chip shown only when something is saved (kept `data-testid="search-shortlist-count"`). Removed the disabled compare button, the counter, and the help banner. Mounts `CompareBar`; opens the comparison dialog (kept the Radix `setTimeout(…,0)` defer). Empty-state "Reset filters" clears the filter URL params via `router.replace`.
- **[ComparisonTable.tsx](components/request/ComparisonTable.tsx)** — responsive **fit-to-width** comparison (`table-fixed`, no horizontal scroll). Two packages sit side by side on a phone; a third just narrows the columns. Operator + price move into rich column headers; the cheapest column is flagged **"Lowest price"** and tinted. Shared by `/search`, `/packages`, and the offer flow → all three improve at once. Kept `data-testid="comparison-table"` + offer support.
  - ⚠️ **Gotcha (don't "fix" back to inline CSS module here):** an early version used a sticky-label `<table>` with a `ComparisonTable.module.css`. Two problems: (a) the CSS-module import broke the `PackagesBrowse` **vitest** suite — Vite ran the file through Tailwind v4 PostCSS in the test env and threw "Invalid PostCSS Plugin"; the original component used inline Tailwind, which is why it had been fine. (b) Sticky cells in a `border-separate` table showed a faint compositing ghost of scrolled columns at the boundary on mobile. The fit-to-width + inline-Tailwind version avoids **both**. Keep ComparisonTable on inline Tailwind (no `.module.css`).
  - **Decision-aid layer (2026-06-11):** the grid now *guides* the choice instead of making the user diff cells. Each dimension with an unambiguous "better" gets a factual flag — cheapest = yellow "Lowest price" (header), and green "✓ Best" on **best-rated hotels** (`hotelStarsValue` max), **closest to the Haram** (`distanceValue` min), **most included** (`inclusionsCount` max). Rows where every package is identical are **muted** so attention lands on real differences. **No "overall winner" / "our pick"** — that would be editorial ranking and breaks the neutral-sort rule (§1). Winners are only crowned when values genuinely differ (ties → none). `ComparisonRow` carries sortable values (`priceValue`/`hotelStarsValue`/`distanceValue`/`inclusionsCount`) populated from **both** `mapPackageToComparison` and `mapOfferToComparison` (so offers get the same treatment); package distance bands map to representative metres via a local `BAND_METERS` in `lib/comparison.ts`. Covered by **[tests/comparison-table.test.tsx](tests/comparison-table.test.tsx)** (markers on decisive rows only, none on identical/tie). The `✓ Best` marker has `data-testid="comparison-best"`.
- **[FilterOverlay.tsx](components/search/FilterOverlay.tsx)** — rewritten self-contained: reads the live URL on open, and **Apply writes the real contract** `filterByParams` reads → results actually filter (`SearchPackagesClient` re-renders on URL change). Localized to **£**; controls are Budget (£300–£3,000+), Hotel rating **3/4/5 multi-select**, When you travel (**Any / Ramadan / School holidays** → `season`), Distance to the Haram (→ `maxDistance`), **Direct flights only** (→ `flightType`). Dropped the decorative dual `FilterState`/`onApply` plumbing. Kept `data-testid` `filter-overlay`/`filter-apply-btn`/`filter-reset-btn` and the shared `budget-min-slider`/`distance-min-slider` sliders.
- **[search-utils.ts](components/search/search-utils.ts)** — `filterByParams` extended for **`maxDistance`** (distance bands → representative metres via `DISTANCE_BAND_METERS`) and **`flightType=direct`**. `toSearchDisplay` priceNote simplified to `per person` (the card shows a "from" pill).
- **[umrah-search-form.module.css](components/umrah/umrah-search-form.module.css)** — step headings were `justify-content: space-between`, which shoved short headings ("When are you travelling?") to the far right. Switched to `flex-start`; the budget opt-out toggle still floats right via its own `margin-left:auto`.
- **[e2e/slider-consistency.spec.ts](e2e/slider-consistency.spec.ts)** — dropped the `time-start-slider` screenshot (the month-range time slider was replaced by clearer season chips); budget + distance sliders unchanged.

### Decision-detail pass (2026-06-11) — desktop + mobile depth
Goal: help every user (incl. laymen) decide, by surfacing stored data the UI hid + adding neutral plain-language help. Hard rule held throughout: **stored facts only, never invent; missing = "Not provided"** — but *how* a blank shows depends on criticality.
- **Package detail page** ([components/packages/PackageDetail.tsx](components/packages/PackageDetail.tsx)) rebuilt with **progressive disclosure + conditional rendering** (chosen over a flat "full breakdown" so it never overwhelms and never shows empty noise — the page scales with how much the operator provided):
  - Surfaces previously-hidden stored fields: `highlights[]` (benefit pills), hotel **names**, **exact distance** + walking-time estimate, **airline** + direct/stopover, **room options**, **deposit** + **payment plan**, **cancellation policy**, **group type**.
  - `What's included` shows visa/flights/transfers/meals as Included/Not-included **with a plain-language line each** + a "confirm in writing before paying" note.
  - **Decision-critical blanks are flagged** (e.g. missing cancellation → "Not provided — ask before paying any deposit"); **good-to-know blanks are omitted** (no "Not provided" walls). The "Good to know" Tier-2 card only renders when there's data.
  - **Desktop:** sticky right-rail decision card (`lg:grid-cols-[1fr_320px]`, rail is `position: sticky`). **Mobile:** sticky bottom CTA (safe-area aware). All existing detail test-ids preserved.
  - Neutral copy + friendly formatters live in **[lib/packages/display.ts](lib/packages/display.ts)** (`INCLUSIONS`, `friendlyDistance`, `flightTypeLabel`, `groupTypeShort`, `roomOptionsLabel`). Reused by the comparison mappers — don't duplicate.
- **Comparison gained grouped decision rows** ([ComparisonTable.tsx](components/request/ComparisonTable.tsx)): collapsible groups **Stay & hotels · Flights · What's included · Price & flexibility · Trip type & notes** (default expanded, header toggles `collapsed` Set). New rows: flights (direct/stops), deposit, pay-in-instalments, **cancellation (full text side by side)**, group type. `ComparisonRow` gained optional `flights/deposit/paymentPlan/cancellation/groupType` (populated from the package mapper; offers → "Not provided"). Best-flag/muted logic unchanged.
- **Filters made visible** ([PackageList.tsx](components/search/PackageList.tsx)): applied filters now render as **removable chips** under the header (each ✕ drops that param; "Clear all" resets), and the Filter button shows a **count badge**. Derived from the URL so they stay in sync with the panel + search form. Fixes the IA gap where filter state vanished into the URL.
- Coverage: `tests/comparison-table.test.tsx` still green with the grouped/extra rows. Verified at **1280px** (detail 2-col rail via geometry; grouped compare; filter chips + removal) and **390px**.
- ⚠️ Preview note: the screenshot tool got flaky mid-session (scroll/capture desync + timeouts); restarting the preview server cleared it. DOM/geometry asserts via `preview_eval` are a reliable fallback.

### Filter URL contract (the working one — reuse, don't reinvent)
`type` · `season` (`ramadan` | `school-holidays` | `flexible`) · `budgetMin` · `budgetMax` · `hotelStars` (CSV of 3/4/5) · `maxDistance` (metres; bands map near≈400 / medium≈1200 / far≈2500) · `flightType=direct` · `departureAirport`. The `/umrah` form GET-submits these; the results FilterOverlay now writes the same set. Changing the URL re-runs `filterByParams` in `SearchPackagesClient`.

### Verified end-to-end in preview (390px)
6→3 results when "5 star" applied (URL `?type=umrah&hotelStars=5`); compare selection highlights cards + reveals the sticky bar; 2-up and 3-up comparisons render with no horizontal scroll and the correct "Lowest price" flag; clean console after a dev restart.

### Out of scope / follow-ups
- Orphaned old filter sub-components under `components/search/filters/*` and `components/ui/FilterOverlay*` are no longer imported by the search page (dead code; safe cleanup later). `components/search/README.md` still documents the old decorative `FilterState` API — update when touched.
- Live result-count in the filter "Show packages" CTA (needs the candidate count) — deferred.
- ⚠️ **Process gotcha:** running `npm run build` while the Turbopack `npm run dev` server is up shares `.next` and can corrupt the dev server's chunks (it served a stale `handleFilterApply` ReferenceError). Stop the preview before a prod build, or restart the dev server afterwards.

### 🛠️ Gotcha — `npm run dev` 500s on data pages = DB unreachable, not a code bug (2026-06-11)
- **Symptom:** `GET /search/packages?type=umrah 500` after a ~150s hang; dev log shows `PrismaClientKnownRequestError … code: 'ETIMEDOUT'` at `lib/api/db/adapter.ts:349 getPackages → prisma.package.findMany()`.
- **Root cause:** the dev box can't reach the Supabase pooler. Confirm with `nc -vz aws-0-eu-west-1.pooler.supabase.com 6543` (and `5432`) — both time out while general internet (`nc -vz 1.1.1.1 443`) works. Usually a **paused Supabase project** (resume it in the dashboard) or a **network/VPN/firewall blocking ports 5432/6543**. `DATABASE_URL` is correctly the pooled `:6543?pgbouncer=true`. Real data returns the moment connectivity is restored — no code change needed for that.
- **Resilience fix shipped (so a blip never hangs/500s again):**
  - **[lib/api/db/prisma.ts](lib/api/db/prisma.ts)** — `pg` Pool now sets `connectionTimeoutMillis: 10_000` (was unset → ~150s hang) + `statement_timeout: 15_000`. **Do not remove.** Note: the dev `globalForPrisma.prisma` singleton survives HMR, so after changing Pool config you must **restart** the dev server for it to take effect.
  - **[app/search/packages/page.tsx](app/search/packages/page.tsx)** — catalogue load wrapped in `loadPackages()` (try/catch, covers `generateMetadata` + the page). On failure it `console.error`s and renders a calm "We couldn't load packages right now / Try again" notice (query preserved) instead of a 500.
  - Verified DB-down: route went **500 in 150s → 200 in ~10s** with the notice.
  - The Next dev overlay may show "2 Issues" while the DB is down — that's the two intentional `console.error`s (metadata + page), not a crash.
  - Other data pages (`/packages`, operator dashboards) still hard-error on a DB outage — only the in-scope search page was hardened. Extend the same `loadPackages` pattern if needed.

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

1. Read `AGENTS.md`, `docs/NOW.md`, this file, `.agents/skills/supabase/SKILL.md`, `.agents/skills/supabase-postgres-best-practices/SKILL.md`.
2. Run `git status -sb`.
3. Do not revert uncommitted user/agent work.
4. If a doc conflicts with verified state here, update the doc — do not undo implementation.
5. Pick **one** scoped task.
6. Update relevant docs as part of the task.
7. Run required verification gates.
8. Update `docs/NOW.md` and this file before handoff or push.

**Current handoff intent (2026-06-12):**
Q2 complete (see §18). Next session is Q3 — IA/nav pass (header, footer, back buttons, breadcrumbs). Test count: 238/238.

---

## 16. Supabase Keep-Alive Cron — 2026-06-11

**Problem:** Supabase free tier auto-pauses any project after ~7 days of inactivity. Symptoms: `ETIMEDOUT` on both `:6543` (pgBouncer) and `:5432` (direct); DNS resolves but TCP drops. Confirmed 2026-06-11 — both ports timed out on `nc -z -w 5`.

**Decision (founder-approved):** Vercel cron keep-alive for now; migrate to **Supabase Pro ($25/mo) when the first paying operator onboards.** Rationale: Pro removes auto-pause, adds daily backups, and gives a connection-pooling SLA — worth it once revenue is flowing, premature before.

**What shipped (PR [#45](https://github.com/aliimrankhan86/kb-live/pull/45)):**

- **[vercel.json](vercel.json)** — new file. Cron fires `GET /api/health` at 09:00 UTC every 3rd day (`0 9 */3 * *`). Three-day gap is well inside the 7-day pause window. Vercel crons are free on all plans.
- **[app/api/health/route.ts](app/api/health/route.ts)** — upgraded from a static JSON stub to a real DB ping (`prisma.$queryRaw\`SELECT 1\``). Returns `{"status":"healthy","db":"ok"}` (HTTP 200) or `{"status":"degraded","db":"error","dbError":"…"}` (HTTP 503). The cron hit alone is enough to prevent pause; the 503 path surfaces any future DB issue.

**Migration trigger:** open a Supabase Pro upgrade ticket the week the first operator pays. At that point also enable **Point-in-time recovery** and review connection pool limits.

**🛠️ Gotcha — Supabase already paused?** Resume it manually: dashboard → project → "Resume project" (~60s). The cron only *prevents* pause; it can't un-pause a project that already went dormant.

**Tests:** 235/235 — no new tests needed (the health endpoint is a thin wrapper; the DB integration is tested end-to-end by the keep-alive itself).

**Will Vercel keep Supabase live?** Yes — **once manually resumed first.** The cron pings every 3 days; Supabase pauses after 7 days; 3 < 7 → stays awake permanently. The cron cannot cold-boot an already-paused project — that one manual resume is required. After that: no further action needed.

**Can operator registration be recorded right now?** No — not while paused. Supabase Auth (signup API) and Postgres go down together when the project pauses. An operator trying to register would hit an error. Once resumed, the full flow works: Auth creates the user → Resend sends confirmation email (live regardless of DB state) → first login creates the operator profile in Postgres. Everything is wired and tested — it just needs the project awake.

---

## 17. Q1 Brand & Legal Cleanup — 2026-06-12

**Branch:** `feat/q1-brand-legal-cleanup` (off `dev`). Three commits, one PR.

### Step 1 — KaabaTrip eradication
Searched entire repo case-insensitively for `kaabatrip`, `kaaba-trip`, `kaaba_trip`. Found 14 live occurrences across: `public/site.webmanifest`, `scripts/check-upstash.mjs`, `next.config.ts` (comment only), `tests/auth-components.test.tsx`, `CLAUDE.md`, `AI_NOTES.md`, `STATUS.md`, `docs/NOW.md`, `docs/00_PRODUCT_CANON.md`, `docs/AI_RUNBOOK.md`, `docs/APP_STRUCTURE.md`, `docs/MASTER_PLAN.md`, `docs/PHASE_2_AUDIT.md`, `docs/02_REPO_MAP.md`, `docs/10_PROMPT_TEMPLATES.md`, `docs/CURSOR_CONTEXT.md`, `docs/DOCS_INDEX.md`, `docs/README_AI.md`, `docs/REPO_MAP.md`, `components/auth/LOGIN_MODAL_IMPLEMENTATION.md`, `.clinerules`. Fixed all. `docs/_archive/` left as historical record per founder decision. `docs/PILGRIMCOMPARE_QUALITY_PROMPTS.md` retained intentional references (they describe what to search for, not brand usage). `grep -ri "kaabatrip" .` returns zero hits outside those files.

**🛠️ Gotcha:** `KAABATRIP_ENABLE_DEV_AUTH` was a comment-only reference, not a real env var — confirmed by grep. Dev auth is gated on `localhost` hostname + `E2E_TESTING=true`, not an env var toggle. Comment updated to reflect reality.

### Step 2 — Banned-phrase audit
Searched all user-facing strings against `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` §5 + additional terms. Found and fixed 11 violations:

- `Hero.tsx` — `ATOL Protected` trust badge → `ATOL Numbers Checked`; `Become a Partner` CTA → `List Your Packages`
- `UmrahSearchForm.tsx` — `ATOL Protected` badge → `ATOL Numbers Checked`
- `app/hajj/page.tsx` — metadata + JSON-LD: removed `"ATOL and ABTA protected"` → `"ATOL and ABTA status checked before listing"`
- `app/umrah/ramadan/page.tsx` — metadata + JSON-LD: removed blanket ATOL/visa claims → `"ATOL status checked before listing"`
- `components/auth/LoginForm.tsx` — `Partner Login` → `Operator Login`; `Partner` tab → `Operator`; signup link `?type=partner` → `?type=operator` (backward compat: resolveLoginType accepts both)
- `components/auth/SignUpForm.tsx` — `Partner Registration` → `Operator Registration`; description updated; submit button → `Register as an Operator`; sign-in link → `?type=operator`
- `app/login/page.tsx`, `app/signup/page.tsx` — metadata updated
- `tests/auth-components.test.tsx` — 5 assertions updated to match new copy

**Tests:** 235/235 after fixes (4 were failing before test fixture update).

### Step 3 — Dynamic departure cities
Replaced all hardcoded `['London', 'Birmingham', 'Manchester']` city lists with server-side queries.

**New method:** `Repository.getDistinctDepartureCities(): Promise<string[]>` — queries `Package WHERE status = 'published' AND departureAirport NOT NULL`, maps airport codes to city names via `UK_DEPARTURE_AIRPORTS` in `lib/airports.ts`, deduplicates, sorts. Implemented in both `lib/api/db/adapter.ts` (Prisma) and `lib/api/repository.ts` mockStore (for tests/mock mode).

**Pages updated (all made `async`):**
- `app/page.tsx`, `app/umrah/page.tsx`, `app/umrah/cost/page.tsx`, `app/umrah/ramadan/page.tsx` — city nav links now derived from live data only; zero live packages → zero city links rendered
- `app/umrah/london/page.tsx`, `/birmingham`, `/manchester` — check if city present in live data; if not, renders empty state notice: "No packages currently listed from [city]. New operators are being added."
- `components/quote/steps/Step2LocationDates.tsx` — hardcoded `UK_CITIES` removed; now accepts `cities: string[]` prop
- `components/quote/QuoteRequestWizard.tsx` — threads `cities` prop to Step2
- `app/quote/page.tsx` — made async, fetches live cities, passes to wizard

**Open risk:** `CityCorridor.tsx` line 34 still says "Verified UK operators with ATOL or ABTA protection" — borderline, deferred to Q3/review (founder said leave in Step 2 review).

**Validation:** `npx tsc --noEmit` pass · `npm run test` 235/235 · `npm run build` 0 errors · all corridor pages render as `ƒ` (dynamic) in build output.

---

## 18. Q2 Legal Pages — 2026-06-12

**Branch:** `feat/q1-brand-legal-cleanup` (same branch — Q2 added as additional commits).

### What shipped

**`lib/legal.ts`** — new file. Single source of truth for legal entity details. Exports `LEGAL_ENTITY_BLOCK` const with companyName, tradingName, companyNumber, vatNumber, registeredCountry, contactEmail, registeredOffice (empty string pending virtual office — see §14). Used by `/terms`, `/privacy`, and `Footer.tsx` so entity details are updated in one place.

**`tests/legal.test.ts`** — new test. Guards companyName, companyNumber, contactEmail against accidental blank-out. Will fail CI if any of the three become empty strings.

**`app/terms/page.tsx`** — full rewrite. Previous page had: wrong company name ("PilgrimCompare Limited"), fake company number ("[Registration in progress]"), incorrect ATOL claim ("does not independently verify" — contradicted §7 of standards which says we do check), no `LEGAL REVIEW` tags on liability clauses, `new Date()` hydration issue. Rewrite contains all 11 elements from standards §10.1: entity block from `LEGAL_ENTITY_BLOCK`, verbatim §1 "what the service is" paragraph, PTR 2018 positioning, operator content/accuracy with correct verification statement from §7, verbatim §4 three standard copy lines, no-advice section, acceptable use + suspension, liability with 12× `{/* LEGAL REVIEW */}` tags, no-reviews policy, complaints split (platform vs booking), governing law. Static `LAST_UPDATED = '12 June 2026'` constant (no hydration issue). TOC with anchor links for mobile usability (`scroll-mt-20` clears sticky header).

**`app/privacy/page.tsx`** — full rewrite. Previous page had: wrong controller name, missing the mandatory verbatim operator data-sharing disclosure from §10.3, Supabase region stated as "London" (it's EU West/Ireland), cookie statement incorrectly said "optional analytics cookies" (Plausible is cookieless — no consent needed). Rewrite: controller identity from `LEGAL_ENTITY_BLOCK`, mandatory verbatim disclosure ("When you send an enquiry, your contact details are shared with the operator you enquire with. From that point the operator is an independent data controller...") rendered in a highlighted box, correct Supabase region, Plausible cookieless statement, strictly-necessary-only cookie table (one auth session cookie), ICO complaint route with phone number.

**`app/how-it-works/page.tsx`** — new file. Plain-English 5-step model per §10.5. §7 verification statement verbatim. All three §4 standard copy lines. Mobile-first, existing design tokens only. Static server component, no client JS.

**`components/layout/Footer.tsx`** — three targeted edits: (1) imported `LEGAL_ENTITY_BLOCK` from `lib/legal.ts`; (2) replaced hardcoded entity disclosure paragraph with `LEGAL_ENTITY_BLOCK` values; (3) Legal links updated: added `/how-it-works`, renamed "Terms & Conditions" → "Terms of Use", removed stale `/terms#cookies` (cookie info now in Privacy Policy).

### 🛠️ Gotcha — pre-existing cookie banner copy contradiction
The `CookieConsent` component still says "Analytics cookies help us understand how our site is used." This contradicts the updated Privacy Policy (Plausible is cookieless, no analytics cookies). Deferred — scope is a separate Q3/Q4 banner copy fix. The legal pages themselves are accurate; the banner is technically inaccurate but low enforcement risk at pre-revenue stage.

### Validation
- `npx tsc --noEmit` pass
- `npm run test` 238/238 (3 new tests in `tests/legal.test.ts`)
- `npm run build` 0 errors — `/how-it-works`, `/terms`, `/privacy` all render as `ƒ` (dynamic)
- All three pages verified at 390px in preview: no horizontal scroll, correct entity values, verbatim copy present
- Footer entity block reads from `LEGAL_ENTITY_BLOCK`: "PilgrimCompare is a trading name of Paramount Consultants Limited, registered in England and Wales (company no. 09679002). VAT no. GB 221 6154 46."
- 12× `{/* LEGAL REVIEW */}` tags confirmed in `app/terms/page.tsx` — all in §8 liability section
- 0 browser console errors

---

## 19. Q3 IA/Nav Pass — 2026-06-12

**Branch:** `feat/q3-ia-nav` (off `dev`).

### What shipped

**`components/layout/Header.tsx`** — Primary nav restructured from `Umrah / Hajj / Get a Quote` to `Packages / Compare / How it works`. Compare → `/search/packages` (existing route, no new route needed). Guest secondary link renamed `For Partners` → `For Operators`. Three new path icons added to `ICONS` object (`packages`, `compare`, `howItWorks`).

**`components/layout/Footer.tsx`** — Three targeted changes: (1) added `cities?: string[]` prop; (2) replaced brand tagline with verbatim "what we do" paragraph per §10.1 (comparison + enquiry service, not a travel agent, no payments); (3) dynamic "Departing from" block inside Platform section renders `<Link href="/umrah/{city.toLowerCase()}">` per city — only shown when `cities.length > 0`.

**`app/layout.tsx`** — Made async. Fetches `Repository.getDistinctDepartureCities()` at layout level with try/catch (empty array fallback on DB failure). Passes result to `<Footer cities={departureCities} />`. No SSR penalty on first byte — query is cheap + cached.

**`components/marketing/CityCorridor.tsx`** — Removed duplicate `<Header />` render (layout already provides it). Added optional `breadcrumbItems?: BreadcrumbItem[]` prop. Renders `<Breadcrumb>` inside `<article>` before the `<h1>` when provided.

**Breadcrumbs added to:**
- `app/umrah/london/page.tsx` — Home / Umrah / London
- `app/umrah/birmingham/page.tsx` — Home / Umrah / Birmingham
- `app/umrah/manchester/page.tsx` — Home / Umrah / Manchester
- `app/umrah/ramadan/page.tsx` — Home / Umrah / Ramadan Umrah
- `app/umrah/cost/page.tsx` — Home / Umrah / Cost guide
- `app/requests/[id]/confirmation/page.tsx` — Home / My requests / Request / Confirmation

**`components/operator/OperatorSidebar.tsx`** — "Back to PilgrimCompare" `<Link href="/">` added at bottom. 44px tap target, chevron-left icon, muted→normal hover colour, closes mobile drawer on click.

**`components/admin/AdminSidebar.tsx`** — New `'use client'` component. Active nav highlighting via `usePathname()` (exact match + prefix match). aria-current="page" on active item. "Back to PilgrimCompare" link. Email displayed in footer.

**`app/admin/layout.tsx`** — Replaced inline static nav HTML with `<AdminSidebar userEmail={user.email} />`.

**`components/request/ComparisonTable.tsx`** — Fixed pre-existing unused variable lint warning (`(row, i)` → `(row)` on header column map).

### 🛠️ Gotchas

- **Turbopack + `npm run build` conflict**: Running `npm run build` while `npm run dev` (Turbopack) is up corrupts `.next/static/development/_buildManifest.js.tmp.*`, causing ISE on all pages. Fix: stop dev server, delete `.next/static/development/`, restart. Documented in §15.
- **`<a>` lint error on internal links**: Next.js `@next/next/no-html-link-for-pages` rejects `<a href="/">` for internal routes. Both sidebar back links needed `<Link>` from `next/link`.
- **CityCorridor double-header**: Component previously rendered its own `<Header />` — this caused two headers on all corridor pages. Removed in this pass.

### Validation
- `npx tsc --noEmit` pass
- `npm run test` 238/238 (no new tests; 3 existing legal tests already in count)
- `npm run build` 0 errors
- Desktop: header `Packages / Compare / How it works` confirmed; footer "what we do" paragraph + "DEPARTING FROM London" confirmed
- Mobile 390px: hamburger drawer shows `Packages / Compare / How it works / For Operators`; `/umrah/london` shows `← Umrah` compact back affordance; breadcrumb trail on desktop

**Next:** Q4 — mobile polish. Test count: 238/238.

---

## 20. Q4 Mobile Polish — 2026-06-12

**Branch:** `feat/q4-mobile-polish` (off `dev`).

### Audit (360/390/430px)

| # | Route | Defect | Fix |
|---|-------|--------|-----|
| 1 | `/` | Corridor nav links `py-3` < 44px tap target | `inline-flex min-h-[44px]` |
| 2 | `/umrah` | FAQ nav links `py-1.5` < 44px tap target | `inline-flex min-h-[44px]` |
| 3 | `/search/packages` | `.savedChip` 36px, `.filterChip` 34px, `.clearFilters` 34px | `min-height: 44px` in packages.module.css |
| 4 | `/search/packages` | CompareBar `.chipRemove` 24×24px icon-only button | `padding:10px; margin:-10px; box-sizing:content-box` |
| 5 | `/search/packages` | ComparisonTable wraps to 1 col on 3-package narrow view | `overflow-x:auto` wrapper + `min-w-[320px]` table |
| 6 | Quote step 4 | Room count inputs no `id`/`htmlFor`; `py-1` < 44px; no `inputMode` | `id`, `htmlFor`, `min-h-[44px]`, `inputMode="numeric"` |
| 7 | Quote step 5 | `<h2>Additional Notes</h2>` not linked to textarea; no data-sharing disclosure | `<label htmlFor>` + textarea `id`; disclosure box added |
| 8 | `/requests/[id]/confirmation` | No copy-to-clipboard on reference code | New `ReferenceCodeDisplay` client component |
| 9 | `/login` | Tab buttons `py-2.5` < 44px; forgot-pwd/back links tiny | `min-h-[44px]` on all three |
| 10 | `/signup` | Tab buttons `py-2.5` < 44px | `min-h-[44px]` |
| 11 | CookieConsent | Buttons 38px; copy claims analytics cookies (contradicts Privacy Policy); table overflows narrow | `min-h-[44px]`; remove analytics copy; `overflow-x:auto` on table |

### What shipped

**`app/page.tsx`** — corridor nav links: `inline-flex min-h-[44px] items-center justify-center`.

**`app/umrah/page.tsx`** — FAQ nav links: `inline-flex min-h-[44px] items-center`.

**`components/search/packages.module.css`** — `.savedChip`, `.filterChip`, `.clearFilters`: `min-height: 44px`.

**`components/search/CompareBar.module.css`** — `.chipRemove`: `padding:10px; margin:-10px -4px -10px -6px; box-sizing:content-box` expands 24px visual to 44px hit area.

**`components/request/ComparisonTable.tsx`** — outer div `overflow-x-auto`; table `min-w-[320px]`. Kept on inline Tailwind (no .module.css — see §15 gotcha).

**`components/quote/steps/Step4GroupBudget.tsx`** — room inputs: `id`, `htmlFor`, `min-h-[44px]`, `inputMode="numeric"`, `py-2`.

**`components/quote/steps/Step5Review.tsx`** — `<h2>` → `<label htmlFor="quote-notes">`; textarea `id="quote-notes"`; data-sharing disclosure box added per legal standards.

**`components/request/ReferenceCodeDisplay.tsx`** — new `'use client'` component. Copy button 44px, `aria-live="polite"` feedback, `data-testid="copy-reference-code"`, `operatorName` prop for contextual message.

**`app/requests/[id]/confirmation/page.tsx`** — imports and renders `<ReferenceCodeDisplay referenceCode={referenceCode} operatorName={operatorName} />`.

**`components/auth/LoginForm.tsx`** — tabs: `min-h-[44px]`; forgot-password/back-to-signin: `inline-flex min-h-[44px] items-center`.

**`components/auth/SignUpForm.tsx`** — tabs: `min-h-[44px]`.

**`components/compliance/CookieConsent.tsx`** — all buttons `min-h-[44px]`; removed false analytics-cookie copy (Plausible is cookieless); removed analytics table row; relabelled "Accept all" → "Accept"; `overflow-x:auto` on details table wrapper.

### 🛠️ Gotchas

- **ComparisonTable + CSS module**: must stay on inline Tailwind only. Adding a .module.css import breaks the PackagesBrowse vitest suite (Vite runs file through Tailwind v4 PostCSS in test env → throws). See §15.
- **Clipboard requires client component**: `navigator.clipboard.writeText` is browser-only. Confirmation page is a Server Component, so clipboard state lives in the separate `ReferenceCodeDisplay` client component.

### Validation

- `npx tsc --noEmit` pass
- `npm run test` 238/238
- `npm run build` 0 errors

---

## 21. Q5 SEO Pass — 2026-06-12

**Branch:** `feat/q5-seo` (off `feat/q4-mobile-polish`) → PR → `dev`

### Scope

Full SEO audit and remediation for all public routes: metadata, JSON-LD structured data, sitemap, robots, OG/Twitter cards, noindex rules, and a banned-phrase CI guard.

### What shipped

| Task | What | Files |
|------|------|-------|
| Base metadata fix | Removed banned phrases ("best", "unforgettable") from `lib/seo.ts` default description | `lib/seo.ts` |
| Root layout JSON-LD | Replaced hardcoded wrong `TravelAgency` schema with `graphJsonLd([organizationJsonLd(), websiteJsonLd()])` via helper | `app/layout.tsx` |
| Homepage JSON-LD | Removed duplicate Organization+WebSite (now in layout); fixed FAQ answer copy ("records enquiry intent"); graph = WebPage + FAQPage | `app/page.tsx` |
| Packages list | Proper title, canonical, OG+Twitter, WebPage JSON-LD | `app/packages/page.tsx` |
| Package detail | Title pattern `"${pkg.title} by ${operator} | Compare on PilgrimCompare"`, Twitter card with image | `app/packages/[slug]/page.tsx` |
| Operator profile | Twitter card with operator name and status | `app/operators/[slug]/page.tsx` |
| Search results | Dynamic Twitter card with package count and type | `app/search/packages/page.tsx` |
| Corridor pages (3) | Converted to `generateMetadata()` async; dynamic noindex when city has zero live supply; removed "Compare & Book" from titles and JSON-LD | `app/umrah/london/page.tsx`, `app/umrah/birmingham/page.tsx`, `app/umrah/manchester/page.tsx` |
| Auth pages | `robots: { index: false, follow: false }` + typed metadata | `app/login/page.tsx`, `app/signup/page.tsx` |
| Quote page | `robots: { index: false, follow: false }` | `app/quote/page.tsx` |
| Showcase page | `robots: { index: false, follow: false }` | `app/showcase/page.tsx` |
| How-it-works | OG+Twitter, WebPage+FAQ JSON-LD, `<JsonLdScript>` wired into JSX | `app/how-it-works/page.tsx` |
| Terms / Privacy | OG+Twitter added to existing metadata | `app/terms/page.tsx`, `app/privacy/page.tsx` |
| Partner (operator) | Twitter card; removed banned copy ("thousands", "Apply as a Partner", "Start Receiving Bookings"); WebPage JSON-LD | `app/partner/page.tsx` |
| Sitemap | Corridor pages conditional on live DB supply; added `/how-it-works`, `/partner`; DB failure → omit dynamic pages | `app/sitemap.ts` |
| Robots | Added `/showcase` to disallow list | `app/robots.ts` |
| Content rules | `BANNED_METADATA_PHRASES` (34 phrases from standards §5/§11/§14) + `NEUTRAL_SORT_DISCLOSURE` | `lib/content-rules.ts` (new) |
| Banned-phrase CI | 1,425 assertions covering all static metadata string constants; fails CI if any banned phrase appears | `tests/banned-phrases.test.ts` (new) |

### JSON-LD schema inventory (post-Q5)

| Route | Schemas emitted |
|-------|----------------|
| All pages (layout) | `Organization` + `WebSite` |
| `/` | `WebPage` + `FAQPage` |
| `/packages` | `WebPage` |
| `/packages/[slug]` | `WebPage` + `Product` + `Offer` (seller = operator) |
| `/operators/[slug]` | `WebPage` + `TravelAgency` |
| `/search/packages` | `WebPage` + `ItemList` |
| `/umrah/london|birmingham|manchester` | `WebPage` + `BreadcrumbList` |
| `/how-it-works` | `WebPage` + `FAQPage` |
| `/partner` | `WebPage` |

### 🛠️ Gotchas

- **Corridor noindex is live supply-gated**: `generateMetadata()` calls `Repository.getDistinctDepartureCities()` at request time. If DB is unavailable it catches and defaults to `index: false` (safe). When supply arrives, next request re-indexes automatically — no code change needed.
- **No AggregateRating anywhere**: standards doc prohibits it; no reviews exist. Do not add until real review data exists.
- **Seller in Product schema = operator, not PilgrimCompare**: enforced in `packageJsonLd()` helper; do not change.
- **`NEUTRAL_SORT_DISCLOSURE` must be placed near the sort control** on all package list/search pages (DMCC Act 2024 Schedule 20). Already present on `/packages` and `/search/packages`.

### Validation

- `npx tsc --noEmit` pass
- `npm run test` 1,425/1,425 (21 files)
- `npm run build` 0 errors

---

## 22. Q6 Ranking Transparency + Featured Infrastructure — 2026-06-12

### What changed

**TASK 1 — Server-side neutral sort (`lib/ranking.ts`, `lib/api/repository.ts`)**
- New `lib/ranking.ts`: `scorePackage(pkg, responseRate?)` and `sortByScore(packages[])`.
- Score = 45% data completeness (16 optional fields) + 35% price recency (full ≤7 days, zero ≥90 days) + 20% operator response rate (neutral 0.5 until real data).
- `isFeatured` has zero weight — never affects neutral score.
- `Repository.listPackages()` now calls `sortByScore()` before returning; all pages receive pre-sorted packages server-side.

**TASK 2 — Neutral sort disclosure (`components/search/PackageList.tsx`, `components/packages/PackagesBrowse.tsx`)**
- `NEUTRAL_SORT_DISCLOSURE` from `lib/content-rules` rendered near every sort control, linked to `/how-we-rank`.
- `data-testid="sort-disclosure"` on both pages for Playwright targeting.
- `PackageList` adds `'relevance'` sort option (preserves server order).

**TASK 3 — `/how-we-rank` page (`app/how-we-rank/page.tsx`)**
- Full DMCC Act 2024 Schedule 20 disclosure: 4 numbered criteria cards, Featured listing rules (max 2, labelled, "Paid placement" note, excluded from count), §7 verification statement verbatim as blockquote.
- Indexed, canonical `/how-we-rank`, WebPage JSON-LD, added to `app/sitemap.ts` and `components/layout/Footer.tsx` LEGAL_LINKS.

**TASK 4 — Featured infrastructure**
- `prisma/schema.prisma`: `isFeatured Boolean @default(false) @map("is_featured")` — SQL applied (`ADD COLUMN IF NOT EXISTS`).
- `lib/types.ts`: `isFeatured?: boolean` added to `Package`.
- `lib/api/db/adapter.ts`: `mapPackage` maps `isFeatured`.
- `lib/config.ts`: `FEATURE_FEATURED_SLOTS` flag (default `false`); server-side only — never read client-side.
- `.env.example`: documents all env vars including `FEATURE_FEATURED_SLOTS=false`.
- `components/search/FeaturedBadge.tsx`: yellow star badge, `data-testid="featured-badge"`.
- `components/search/PackageList.tsx`: featured section (`data-testid="featured-section"`) above neutral list, capped at `FEATURED_MAX = 2`, visible only when `featuredSlotsEnabled=true` prop (server-evaluated).
- `app/search/packages/page.tsx`: evaluates `FEATURE_FEATURED_SLOTS` server-side, passes as `featuredSlotsEnabled` prop.

**TASK 5 — Tests**
- `tests/ranking.test.ts`: 11 tests — `scorePackage` (range, recency, completeness, isFeatured no-op, response rate) and `sortByScore` (order, immutability, empty, isFeatured no-op).
- `tests/featured-slots.test.tsx`: 10 tests — featured section render/absent, paid-placement label, `/how-we-rank` link, cap at 2, exclusion from neutral list, disclosure always present.
- `tests/banned-phrases.test.ts`: `/how-we-rank` metadata strings added; star-character guard (★ ☆ ⭐ 🌟) on all metadata keys.
- `postcss.config.mjs`: switched to object plugin syntax (`{ '@tailwindcss/postcss': {} }`) — compatible with both Next.js webpack and Vite/Vitest PostCSS loading.

### Key constraints upheld
- `FEATURE_FEATURED_SLOTS` evaluated server-side only; passed as `featuredSlotsEnabled: boolean` prop — never imported or read in client components.
- No payment/billing code added — infrastructure only.
- `isFeatured` has no weight in `scorePackage` — confirmed by test.
- "Priority placement" phrase never used; featured copy is "Paid placement — not ranked by our neutral criteria."

### Commits (branch `feat/q6-ranking-transparency`)
1. `feat(ranking): server-side neutral sort score`
2. `feat(config): add FEATURE_FEATURED_SLOTS flag + .env.example`
3. `feat(schema): add isFeatured to Package — schema, type, mapper`
4. `feat(ui): FeaturedBadge component + CSS for disclosure and featured section`
5. `feat(ui): disclosure line + Featured slots in PackageList and PackagesBrowse`
6. `feat(transparency): add /how-we-rank page, sitemap entry, footer link`
7. `feat(tests): Q6 test suite — ranking, featured slots, banned phrases`

### Validation

- `npx tsc --noEmit` pass
- `npm run test` 1,810/1,810 (23 files)
- `npm run build` 0 errors

---

## 23. Prompt 5 + 6 — Transactional Email + Cron Suite — 2026-06-12

**Branch:** `dev` (commits on top of Q6 merge).

### Prompt 5 — Transactional email suite (all 5 emails)

**Pre-existing (found in codebase):**
- `lib/email/send.tsx` — Resend client wrapper, fire-and-forget sends, `findSimilarPackages`, `quoteRefCode`
- `emails/EnquiryConfirmation.tsx`, `OperatorEnquiryAlert.tsx`, `BookingIntentConfirmation.tsx`, `PaymentEvidenceNotification.tsx`
- Emails 2–5 already wired in `app/api/quote-requests/route.ts` and `app/api/booking-intents/route.ts`

**Changes in this session:**
- `emails/EnquiryConfirmation.tsx` — fixed greeting `"Assalamualaikum"` → `"Salaam"` per spec
- `lib/email/send.tsx` — added `sendOperatorNudge` and `sendOutcomeFollowup` (needed by Prompt 6 crons)
- `emails/OperatorNudge.tsx` — new template (48h reminder to operator, reply-to = customer)
- `emails/OutcomeFollowup.tsx` — new template (did your booking go ahead? 3 plain-text links)

**Email 1 — Supabase Auth confirm signup:**
Do not build in code — paste the HTML below into Supabase dashboard → Authentication → Email Templates → Confirm signup. The existing Resend SMTP config sends it automatically.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirm your email — PilgrimCompare</title>
</head>
<body style="background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:#ffffff;border-radius:8px;padding:32px;">
        <p style="font-size:18px;font-weight:700;color:#1a1a1a;margin:0 0 24px;">PilgrimCompare</p>
        <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 12px;">Salaam,</p>
        <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px;">
          Thank you for joining PilgrimCompare. Please confirm your email address to complete your registration.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td style="background:#1a1a1a;border-radius:6px;padding:14px 28px;">
              <a href="{{ .ConfirmationURL }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
                Confirm email address
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size:13px;color:#666;line-height:1.5;margin:0 0 12px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="font-size:12px;color:#888;word-break:break-all;margin:0 0 24px;">
          {{ .ConfirmationURL }}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:13px;color:#999;margin:0 0 4px;">
          If you did not create an account on PilgrimCompare, you can safely ignore this email.
        </p>
        <p style="font-size:12px;color:#aaa;margin:4px 0;">
          PilgrimCompare &middot; pilgrimcompare.co.uk
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Prompt 6 — Cron job suite

**New files:**
- `lib/cron-auth.ts` — `verifyCronSecret(request)` checks `Authorization: Bearer {CRON_SECRET}`
- `app/api/cron/nudge-operators/route.ts` — daily 08:00 UTC; finds open enquiries >48h old with no nudge; sends `OperatorNudge` email; marks `nudgeSentAt`. Idempotent.
- `app/api/cron/outcome-followup/route.ts` — daily 09:00 UTC; finds BookingIntents 10–14 days old with no outcome and no followup sent; sends `OutcomeFollowup` email; marks `outcomeFollowupSentAt`. Idempotent.
- `app/api/cron/expire-packages/route.ts` — daily 02:00 UTC; raw SQL `WHERE (date_window->>'end')::date < CURRENT_DATE`; sets `status = 'expired'` (never deletes). Idempotent.
- `app/api/outcomes/[intentId]/route.ts` — one-tap GET endpoint linked from outcome followup email; writes `BookingOutcome` record (`booked` → `travelled`, `not_booked` → `cancelled_customer`); "deciding" acknowledged without DB write; returns HTML thank-you page. BookingOutcome records are never deleted (billing evidence).
- `vercel.json` — 3 new cron entries added alongside health cron.
- `tests/cron-auth.test.ts` — 8 unit tests covering `verifyCronSecret` + 401 guard on each cron route.

**Schema changes (3 new columns):**

⚠️ **Run this SQL in Supabase dashboard before deploying** (Settings → SQL Editor):

```sql
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS source_operator_id TEXT;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS nudge_sent_at TIMESTAMPTZ;
ALTER TABLE booking_intents ADD COLUMN IF NOT EXISTS outcome_followup_sent_at TIMESTAMPTZ;
```

- `prisma/schema.prisma` updated with all 3 fields; `npx prisma generate` run locally (CI also runs it).
- `lib/api/db/adapter.ts` — `mapQuoteRequest` and `saveRequest` now include `sourceOperatorId` so the nudge cron can look up the correct operator from a stored enquiry.

### Manual testing (run after deploying)

**Cron routes via curl:**
```bash
# Replace CRON_SECRET with the value in Vercel env vars
curl -H "Authorization: Bearer $CRON_SECRET" https://pilgrimcompare.co.uk/api/cron/nudge-operators
curl -H "Authorization: Bearer $CRON_SECRET" https://pilgrimcompare.co.uk/api/cron/outcome-followup
curl -H "Authorization: Bearer $CRON_SECRET" https://pilgrimcompare.co.uk/api/cron/expire-packages
```

---

## 24. Light Theme (Madinah) — 2026-06-12

**Branch:** `feature/light-theme` (5 commits: `631ebb6` → `7d7910d`)
**Spec:** `light-theme.md` (project root, committed `b4213b7`)
**Tests:** 1,818/1,818 pass · build 0 errors · `npx tsc --noEmit` clean

### What was built

A Madinah-inspired optional light theme, additive-only — dark theme completely unchanged.

**Step 2 — Token set (`styles/tokens.css` + `app/globals.css`)**
- 16 new `--color-*` semantic tokens added to `:root` (dark defaults)
- `[data-theme="light"]` block overrides both legacy (`--bg`, `--text`, etc.) and new semantic tokens with Madinah warm-stone / prophetic-green palette
- `globals.css`: `[data-theme="light"] body { background-image: none }` + `body::before { display: none }` suppress Kaaba SVG and dark overlay

**Step 3 — ThemeProvider + flash prevention (`components/theme/ThemeProvider.tsx`, `app/layout.tsx`)**
- `ThemeProvider` React context with `useTheme()` hook; SSR-safe (initialises to `'dark'`, resolves from `localStorage` on mount)
- Blocking inline `<script>` in `<head>` sets `data-theme` before hydration — no flash; `suppressHydrationWarning` already present on `<html>`
- `localStorage` key `'theme'`, values `'light'`/`'dark'`; dark is default for null
- `prefers-color-scheme` intentionally ignored per spec

**Step 4 — ThemeToggle (`components/theme/ThemeToggle.tsx`, `Header.tsx`, `header.module.css`)**
- `lucide-react` added as dependency (Sun/Moon icons — only Lucide usage in codebase)
- Desktop: icon button in header right cluster, all token colors, 44×44px tap target
- Mobile: labeled row above "Explore" nav links in hamburger drawer
- `aria-label` updates dynamically ("Switch to light/dark theme")

**Step 5 — Wordmark (`public/text-logo-light.svg`, `components/graphics/WordmarkLogo.tsx`, `Header.tsx`)**
- `text-logo-light.svg` created (identical to `text-logo.svg`, "Pilgrim" tspan `#111827` instead of `#FFFFFF`)
- `WordmarkLogo` extended with optional `pilgrimColor` prop — when set, splits into two `<tspan>` elements; backward-compatible (no prop = original single-fill behavior)
- Header passes `pilgrimColor="#111827"` in light mode for both desktop and mobile drawer wordmarks

**Step 6 — Semantic color token audit (32 files)**
- Replaced `bg-red-500/10`, `text-red-400`, `border-red-500/30` etc. with `var(--color-error)` across 29 components
- Same for green → `var(--color-success)` and amber → `var(--color-warning)`
- `PackageCsvExport.tsx`: `bg-white text-slate-700 border-slate-300` → surface/text-primary/border-subtle tokens
- Intentionally NOT changed: `hover:bg-red-500` (solid destructive delete overlay in WizardStep7Marketing), `bg-white` toggle thumb (WizardStep4Flights)
- 2 tests updated to assert on token class names instead of old Tailwind color names

**Step 7 — Lucide icon audit**
- Only `Sun`/`Moon` exist (Step 4). Both inherit `color: var(--text)` from their parent elements. No hardcoded colors. No changes needed.

### Gotchas

- **`@theme inline` conflict:** `globals.css` maps `--color-bg: var(--bg)` and `--color-text-muted: var(--textMuted)`. These were NOT added to `:root` as new tokens to avoid circular refs. They ARE set directly in `[data-theme="light"]` (higher specificity wins regardless).
- **WordmarkLogo vs text-logo.svg:** Header uses `WordmarkLogo` (inline SVG, Nunito 800), not `<img src="/text-logo.svg">` (Exo 2 700). Swapping `src` would change font and cause layout shift. Extended the component instead. `text-logo-light.svg` exists per spec but is not currently rendered anywhere.
- **`lucide-react` added to `package.json`** — justified by spec requirement for Sun/Moon icons. No other icon library added.

Expected response: `{"ok":true,"nudged":0}` / `{"ok":true,"sent":0}` / `{"ok":true,"expired":0}` when no records match (correct at initial deploy — no real enquiries yet).

**Test email send (Resend test mode):**
Use Resend dashboard → Logs to confirm email delivery after submitting a test quote request.

### 🛠️ Gotchas

- `source_operator_id` on `quote_requests` is populated for enquiries submitted via the package detail page (`sourceOperatorId` from the quote form). General browse enquiries without a source package will have `NULL` and won't receive an operator nudge — this is correct.
- Package expiry cron uses raw SQL (`$queryRaw` + `updateMany`) because Prisma doesn't support JSON path expressions in `where` clauses. Do not convert to ORM-style query.
- `BookingOutcome` has `@unique` on `bookingIntentId`. The outcomes endpoint is idempotent: if an outcome already exists it returns 200 without creating a duplicate.
- Prompts 7, 8, 9 (Telegram alerts, automation, operator data ingestion) are deferred until after live testing of Prompts 5 + 6.

### Validation

- `npx tsc --noEmit` pass
- `npm run test` 1,818/1,818 (24 files, 8 new cron-auth tests)
- `npm run build` 0 errors

---

## 25. Light Theme Refinements + Search Redesign + Pagination — 2026-06-13

**Branch:** `feature/light-theme` (merged → dev → main 2026-06-13)
**Commits:** `3fe92da` → `62908a4` (7 commits on top of §24)
**Full reference:** `docs/light-theme.md`
**Tests:** 1,818/1,818 pass · build 0 errors · `npx tsc --noEmit` clean

### Changes on top of §24

**Partner page CTA upgrade (`app/partner/page.tsx`)**
- "Sign in to Dashboard" changed from ghost outline → filled green button (`bg-[var(--primary)]`)
- Adapts correctly: gold in dark theme, prophetic green in light theme

**ThemeToggle labeled (`components/theme/ThemeToggle.tsx`)**
- Changed from icon-only to labeled pill: Moon+"Dark" in light mode, Sun+"Light" in dark mode
- Shows the target mode (not current) — standard UX convention
- `minHeight: 44px` maintained for touch target compliance

**Background approach finalised**
- Iterated through 4 approaches for light theme background (Kaaba SVG at various overlays)
- Final resolution: **dark** keeps `kaaba-bg2.svg` at 80% overlay / `center 40%`; **light** uses clean `linear-gradient(160deg, #F8F6F1 0%, #EDE8DC 55%, #F4F0E7 100%)` — no SVG, no overlay
- `[data-theme="light"] body { background-image: none }` + `body::before { display: none }` in `globals.css`

**Dead Unsplash photo fix (`lib/api/mock-db.ts`, `prisma/seed.ts`)**
- `photo-1591608511725-1f6d3d07f4c3` (deleted by Unsplash) → `photo-1542314831-068cd1dbfeeb`

**Search header world-class redesign**
- `components/search/packages.module.css`: big `1.875rem`/`800` count in `var(--yellow)`, surface-fill buttons with shadow, disclosure inline below count, tight single-row layout
- `components/search/PackageList.tsx`: disclosure `<p>` moved inside `.searchResults`, `savedChip` moved into `.searchControls`, JSX restructured

**Pagination (5 per page)**
- `PACKAGES_PER_PAGE = 5` constant; `currentPage` state; `pagedPackages` slice
- Resets to page 1 on sort, filter, or shortlist-only change
- Uses existing `components/ui/Pagination` component
- `window.scrollTo({ top: 0, behavior: 'smooth' })` on page change

**Additional packages**
- `mock-db.ts`: SEED_PACKAGES bumped to version 5, added pkg10–pkg17 (umrah + hajj variety, all operators)
- `prisma/seed.ts`: added pkg7–pkg14 (upsert-safe), seeded to Supabase via `DATABASE_URL=<direct> npm run db:seed`
- Result: 12 umrah packages visible on `/search/packages?type=umrah` → 3 pagination pages

### Gotchas

- **Supabase PgBouncer vs direct URL:** `npm run db:seed` must use `DIRECT_URL` (port 5432), not `DATABASE_URL` (PgBouncer port 6543) — PgBouncer rejects certain Prisma operations. Prefix: `DATABASE_URL="<direct-url>" npm run db:seed`.
- **`kaaba-bg-light.svg`** was created and iterated but ultimately unused in the final light theme. File still in `public/` — safe to delete if desired.
- **Quote wizard `#FFD31D`** — 5 step files still have hardcoded gold hex for the step indicator ring. Low priority; only affects light-mode users in the quote wizard. See `docs/light-theme.md §10`.
- **Logo in light mode** — `text-logo-light.svg` exists but `WordmarkLogo.tsx` still renders the dark wordmark in both themes (dark text is sufficiently readable on ivory). Update when you want pixel-perfect brand expression in light mode.

### Validation

- `npm run test` 1,818/1,818 (24 files, unchanged count)
- `npx tsc --noEmit` pass
- `npm run build` 0 errors
- Merged: `feature/light-theme` → `dev` → `main` (2026-06-13)

---

## 26. Homepage Contemporary Redesign — 2026-06-13

**Branch:** `feature/homepage-redesign` (off `dev`). **Not yet PR'd.**
**Tests:** 1,818/1,818 pass · `npx tsc --noEmit` clean · `npm run build` 0 errors.

### What changed
Rebuilt the homepage (`app/page.tsx`) from Hero-only (3 CTA cards + a routes nav) into a calm, multi-section contemporary layout with restrained scroll-reveal motion. Token-only throughout — dark stays the default, light fully works. No new npm dependencies.

**New section flow:** Hero → ValueProps → HowItWorks → TrustBlock → DepartureCities → FAQ → HomeCTA (global Header/Footer unchanged).

### Files touched
- `app/page.tsx` — composes the new sections; metadata + OG/Twitter **unchanged**; FAQ array (`HOME_FAQS`) feeds BOTH the `FAQPage` JSON-LD and the visible `<FAQ>` (de-orphans the schema); `getDistinctDepartureCities()` reused (not duplicated) and now wrapped in try/catch → honest empty state on DB blip.
- `components/marketing/Hero.tsx` + `hero.module.css` — H1 kept **verbatim** (SEO-load-bearing); model line from `MODEL_DESCRIPTION`; primary CTA "Compare packages" → `/search/packages` (canonical list), secondary "How it works" → `/how-it-works`; trust strip "Verified operators" now links to `/how-we-rank#verification-heading`. Removed the old 3 CTA cards (Umrah → primary CTA, Operator + Hajj → HomeCTA). Fixed the one hardcoded colour (`rgba(0,0,0,0.4)` trust-bar shadow → `var(--shadowSoft)`).
- **New** `components/marketing/`: `ValueProps.tsx`, `HowItWorks.tsx`, `TrustBlock.tsx`, `DepartureCities.tsx`, `FAQ.tsx`, `HomeCTA.tsx`, `Reveal.tsx`, `home.module.css` — all token-only.
- `components/marketing/Reveal.tsx` — client IntersectionObserver fade+translate; adds `.reveal` only on the client and only when motion is allowed (progressive enhancement: no-JS / reduced-motion → fully visible). Opacity+transform only → no CLS.
- `app/globals.css` — `.reveal` / `.reveal--visible` rules + `prefers-reduced-motion` guard.
- `lib/content-rules.ts` — added `VERIFICATION_STATEMENT` (verbatim §7), `MODEL_DESCRIPTION` (§1), `PAYMENT_STANDARD_LINE` (§4 verbatim), `HOME_FAQS`.
- `app/how-we-rank/page.tsx` — now renders `{VERIFICATION_STATEMENT}` from the shared constant (single source of truth; per the redesign decision to reference verbatim from both homepage and how-we-rank).

### Decisions
- **H1 unchanged**, verbatim — already compliant + SEO-load-bearing.
- **Verification statement: extracted to a shared constant**, referenced verbatim from homepage `TrustBlock` and `/how-we-rank`. No paraphrase/summary written anywhere. `terms` + `how-it-works` keep their own inline copies (out of homepage scope).
- **Primary CTA → `/search/packages`** (canonical comparison surface; `/umrah` is a search-form landing page, kept discoverable via the guides row).
- **Hajj 2027 "register your interest" retained** in the HomeCTA band → `/hajj`.
- **FAQPage de-orphaned** by adding a visible FAQ rendering the same 2 Q&As (single `HOME_FAQS` source).
- **No new design tokens added** — every colour resolved from existing `styles/tokens.css` tokens.

### Verification performed
- `tsc` clean · 1,818 tests pass (banned-phrase guard included) · build 0 errors.
- Playwright @390px both themes: `scrollWidth == innerWidth` (390/390), zero overflow offenders.
- `prefers-reduced-motion: reduce`: 0 elements left in `.reveal` hidden state (no motion).
- Scroll test: all 6 below-fold sections reach `.reveal--visible` (none stuck hidden).
- On-page compliance asserted present: H1 verbatim, model line, §7 statement verbatim, §4 payment line, "No operator pays for ranking" + `/how-we-rank` link, visible FAQ, Hajj 2027.
- Visual check (screenshots) dark + light, desktop + mobile — both themes render correctly (light = prophetic-green CTA, amber icons, ivory bg).

### Open risks / notes
- `STATUS.md` / `HANDOFF.md` not yet updated (branch not merged) — sync on PR.
- No Playwright spec committed for the homepage reveal/overflow (checked via throwaway scripts). Add to e2e suite when the Playwright suite next expands (testid hooks are stable section ids).
- `terms` + `how-it-works` still carry their own inline §7 copy (pre-existing duplication; intentionally left out of homepage scope — fold into `VERIFICATION_STATEMENT` in a later cleanup).

### Next step
Founder review of the redesign in both themes, then open PR `feature/homepage-redesign` → `dev`. Update `STATUS.md`/`HANDOFF.md` on the same branch before the PR.

---

## 27. Data Integrity — "Not provided" for missing operator facts — 2026-06-13

**Branch:** `fix/data-integrity-not-provided` (off `dev`).
**Tests:** 1,825/1,825 pass (26 files, +7 new) · `tsc --noEmit` clean · `npm run build` 0 errors.

### Why
A read-only audit found user-facing surfaces that **inferred** operator-supplied fields when missing, violating the hard rule *missing = "Not provided", never inferred* (`AGENTS.md`; standards §9/§12). Fixed the live fabrications; documented the rest as scope boundaries.

### What changed (one concern per commit)
1. **Package cards** (`components/search/search-utils.ts`, `PackageCard.tsx`, `packages.module.css`, `PackageList.tsx`):
   - `SearchHotel.name`/`rating` are now `string | null` / `number | null`. `toSearchDisplay` passes `hotelMakkah/MadinahName ?? null` and `hotelMakkah/MadinahStars ?? null` — **was** `?? pkg.title` (hotel name fell back to the package title) and `?? 4` (stars defaulted to 4).
   - Card renders **"Not provided"** (italic, muted, new `.notProvided` class) for a null name or rating instead of fabricated stars / a borrowed title.
   - Rating-sort treats missing as 0 **for ordering only** (sorts to the bottom; the card still shows "Not provided"). Compare-toggle aria-label switched from `hotel.name` → operator company name (null-safe).
2. **Package JSON-LD** (`lib/seo/json-ld.ts`): `packageJsonLd` defaulted missing stars to `0` and emitted "0★" in the Product description. Now the hotels sentence is built only from stars that exist, and a `Makkah/Madinah hotel rating` PropertyValue is emitted **per city only when present**. Missing = property **absent** (not null, not 0, not empty) — verified by emitting the JSON-LD for a stars-less package: `additionalProperty` carries only Pilgrimage type + nights, no rating property; description has no `★`.
3. **Quote prefill** (`lib/quote-prefill.ts`): `createQuotePrefillUrl` set `hotelStars` to `?? 4`, pre-seeding the enquiry with a fabricated preference. Now set **only** when a real rating exists, otherwise omitted.

### Explicitly out of scope (deliberate)
- `quote-prefill` inclusions `?? true` / `distancePreference` — seed the **customer's own enquiry-form preferences**, not displayed operator facts. Belongs with the operator-form task.
- `PackageDetail.tsx` `?★` — already honest (shows unknown, not a fabricated number). Left as-is.
- JSON-LD nights/price `??` defaults — **dead code** (`totalNights`/`nightsMakkah`/`nightsMadinah`/`pricePerPerson` are required `number` in `lib/types.ts`, so the fallbacks never fire). Left untouched to keep the diff tight.
- Operator-form **entry defaults** (4-star / medium distance / small-group pre-selected in the wizard) — upstream data-quality risk (a skipped field can save a default as if confirmed). Separate task.

### Future feature — flagged, NOT approved
- **Hotel data enrichment** logged in §8 (Open Risks → Future features): must be scoped against standards §9 before any work (three distinct states: operator-stated / verified-with-source / Not provided; never silent-fill; operator can correct; disclose to users). The "Not provided" baseline from **this** fix is its prerequisite.

---

## 28. Operator Form — no silent defaults for skipped fields — 2026-06-13

**Branch:** `fix/operator-form-no-silent-defaults` (off `dev`).
**Tests:** 1,830/1,830 pass (27 files, +5 new) · `tsc --noEmit` clean · `npm run build` 0 errors.

### Why
The §27 fix made the *display* honest. This closes the upstream hole: the package wizard manufactured values for fields the operator skipped, so the DB stored a confident default (4-star / medium distance / small-group) as if the operator had confirmed it. The adapter was already honest (`?? null`) — the fabrication lived in `DEFAULT_DATA` and the Zod `.default()` calls. A skipped field must now persist as genuinely unset → render "Not provided" everywhere (matching §27 / PR #64).

### Scope — three fields only
**Hotel stars · distance band · group type.** Inclusions are OUT of scope (see deferred follow-up below).

### What changed
- **Zod schema extracted** to `lib/operator/package-schema.ts` (imported by `app/api/operator/packages/route.ts`; makes the defaults unit-testable). Distance `.default('medium')` → **`.default('unknown')`** — `'unknown'` is the existing "Not provided" sentinel (`comparison.ts:108-109`, `friendlyDistance` → null). Stars and `groupType` keep **no default** (`.optional()`).
- **`PackageWizard.tsx` `DEFAULT_DATA`**: removed the `distanceBandMakkah/Madinah: 'medium'` and `groupType: 'small-group'` seeds (stars were never seeded).
- **`WizardStep3Hotels.tsx`** — stars: removed the `?? 4` UI paint; select now starts on a disabled **"Select hotel class"** placeholder, with an explicit **"Not sure / not rated"** option → `undefined`. Removed the misleading required `*` on stars. Distance: removed the `'unknown' → 'medium'` display coercion; added a **"Not specified"** option (= `'unknown'`); parent default `?? 'unknown'`.
- **`WizardStep6Policies.tsx`** — group type: removed the `?? 'small-group'` default; added a **"Not specified"** radio (value `undefined`) as the starting state.
- **`WizardStep8Review.tsx`** — distance rows show "Not set" when `'unknown'` (instead of the literal "unknown"). Stars/group already showed "Not set" for unset.

### Verified end to end (package created skipping all three)
- Schema persists: stars `undefined`, distance `'unknown'`, groupType `undefined`.
- Adapter writes: stars `null`, distance `'unknown'`, groupType `null` (`adapter.ts:385,386,400`).
- Pilgrim sees (comparison grid): **"Not provided"** for hotel rating, distance, and group type.
- Chosen values pass through unchanged (5★ / near / Private → rendered).
- Theme/layout: only `<option>`/radio additions to existing token-styled selects — no new colours, no width/layout change, so both themes + 390px are unaffected (existing operator e2e still green). Pre-existing hardcoded `rgba(255,255,255,…)` wizard inputs left untouched per scope; new additions are token-only.

### Existing data (report only — NO migration this task)
Counts of records currently holding the old default-equivalent value (seed-authored; live DB not queried):
- `lib/api/mock-db.ts` (17 pkgs): stars=4 → 8 Makkah / 9 Madinah; distance='medium' → 7 Makkah / 3 Madinah; groupType='small-group' → 6/17.
- `prisma/seed.ts` (14 pkgs): stars=4 → 5 Makkah / 5 Madinah; distance uses an out-of-type vocabulary (`'0-500m'`/`'500m-1km'`/`'1km+'`), 0 `'medium'`; no `groupType` set.
- `supabase/seed.sql`: 0 package records.
Existing-data cleanup (whether to null-out these seed defaults) is a **separate later task** — not done here.

### Deferred / flagged as separate tasks
- **Inclusions three-state model (follow-up):** inclusions still default all-false. That direction is safe (it under-claims — never marks something included that the operator didn't confirm), so it was left as-is. A proper three-state model (included / not included / not specified) is a separate follow-up.
- **Distance vocabulary reconciliation (separate task):** three vocabularies coexist — the type enum (`near|medium|far|unknown`), the wizard labels, and the DB seed strings (`'0-500m'` etc. in `prisma/seed.ts`, outside the enum). This fix deliberately did **not** touch the vocabulary; reconciling them is its own task.
- **Edit-mode clearing limitation:** PATCH uses `packageSchema.partial()` and `JSON.stringify` drops `undefined`, so clearing a previously-set optional field (e.g. changing 5★ back to "Not sure") via edit does not persist a null. The type models these as `?:` (optional), not nullable, so explicit-null clearing is out of scope here. Create-flow (the task's focus) is unaffected.

---

## 29. App Readiness Audit — 2026-06-14

**Branch:** `qa/app-readiness-audit` (off `dev`).
**Tests:** 1,830/1,830 Vitest · 19/21 Playwright (2 skipped, 0 failed) · `tsc --noEmit` clean · `npm run build` 0 errors.

### Why
Full end-to-end readiness audit before launch. Covered all automated emails, both user journeys (pilgrim + operator) via Playwright, operator data isolation, and known UI issues.

### Bugs found and fixed

#### 1. Admin role rejected on operator API endpoints
`operatorAdmin` test user (id=op1, role=admin) could not access payment details, bank changes, or audit log because all four endpoints only accepted `role === 'operator'`. Required for any admin user who also has an operator account. Fixed: accept `role === 'admin'` alongside `role === 'operator'` in:
- `app/api/operator/payment-details/route.ts` (GET + POST)
- `app/api/operator/bank-changes/route.ts` (POST)
- `app/api/operator/bank-changes/[id]/route.ts` (DELETE)
- `app/api/operator/audit-log/route.ts` (GET)

#### 2. Email send crash in production ("b is not a function")
All six `sendXxx` functions in `lib/email/send.tsx` were passing `react: <Component />` to Resend. Resend v6 does `await import('@react-email/render')` internally. In the Next.js production bundle that module resolves through `@react-email/components` but not as a direct top-level import, causing `b is not a function` at runtime. Fixed: import `render` from `@react-email/components` directly, pre-render each template to HTML, and pass `html:` to Resend instead.

#### 3. MockDB server-side persistence missing (create→read E2E flows broken)
`getStorage`/`setStorage` in `lib/api/mock-db.ts` were no-ops on the server (`typeof window === 'undefined'` → returned defaults / did nothing). Any E2E test that called one API to create a record and then a separate API to read it back would find nothing. Fixed: added a `serverMemory` Map (process-scoped) as the server-side store. MockDB now persists across API requests within the same Next.js server process.

#### 4. Rate limiter blocked E2E quote submissions with 429
The in-memory rate limiter (`MAX_ATTEMPTS=5, WINDOW_MS=15min`) is shared across all E2E test runs within the same server process. After 5 quote submissions the limiter blocks further requests, causing `bank-payment.spec.ts` test 2 to fail with "Too many attempts". Fixed: `checkRateLimit()` returns `{ limited: false }` immediately when `E2E_TESTING === '1'`.

#### 5. Serial E2E state bleed (bank change cooling → no request-change-btn)
`bank-payment.spec.ts` runs 4 tests serially. Test 1 approves a bank change → state becomes "cooling period" (7 days). Tests 3 and 4 expect `request-change-btn` (active state) but find the cooling UI instead. Fixed:
- Added `resetE2EState()` export to `lib/api/mock-db.ts` that clears transient collections from `serverMemory`
- Added `app/api/e2e/reset/route.ts` POST endpoint (404 unless `E2E_TESTING=1`)
- Added `resetMockDB(page)` helper to `e2e/helpers/auth.ts`
- Call `resetMockDB()` at the start of tests 2, 3, and 4

#### 6. E2E flow tests matched stale quote wizard UI
`e2e/flow.spec.ts` and `e2e/bank-payment.spec.ts` test 2 used `input[placeholder="e.g. London, Manchester"]` selectors. The quote wizard step 2 was redesigned to use chip buttons (city → airport chip chain) — no text input. Tests failed at step 2. Fixed: use `getByRole('button', { name: 'London' })` and `getByRole('button', { name: /LHR/i })`.

#### 7. Comparison table price selector pointed at tbody (prices in thead)
`flow.spec.ts` checked a specific tbody cell for currency. Package comparison renders offer prices in `<thead>` columns, not tbody rows. Fixed: `expect(comparisonTable).toContainText(/[£$€]/)`.

### What was NOT broken (verified clean)
- KaabaTrip text/logos: zero occurrences across all source, SVGs, emails, and components. Already removed.
- Email branding: all 6 templates render as "PilgrimCompare", correct FROM address, legal disclaimers present.
- Operator data isolation: each operator's leads API filters by `operatorId === user.id`; confirmed via seed data (op1 and op2 have separate package/offer sets).
- Hotel star rendering: `PackageCard` already shows "Not provided" for null ratings (fixed in §27).
- `/packages` (browse catalogue) vs `/search/packages` (filterable compare view): intentionally two separate pages, not a duplication bug.
- Mobile viewport: quote wizard, package cards, comparison table, booking intent dialog all render within 390px without overflow or broken layout.

### Gotchas
- **E2E reset endpoint is protected by `E2E_TESTING=1`** — in production it returns 404. Never enables state mutation for real users.
- **Rate limit bypass is also `E2E_TESTING=1`-gated** — production Upstash path is unaffected.
- **`serverMemory` is process-scoped** — resets on every server restart (each `npm run build && next start` in Playwright's webServer starts fresh). Between serial tests within a run, state persists and must be explicitly reset via `/api/e2e/reset`.
- **2 skipped Playwright tests** — `operator.spec.ts` has two tests marked `test.skip` deliberately (pre-existing); they are not failures.
