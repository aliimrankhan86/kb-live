# PilgrimCompare AI Handover — Single Source of Truth

**Last verified:** 2026-06-10 (mobile UX pass: footer compaction + drawer overlay + scroll lock)
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
| Prompt 3 | Domain wiring + full KaabaTrip → PilgrimCompare rebrand | ✅ Done |
| Prompt 4 | GitHub branch protection + CI workflow | ✅ Done |

### Quality pass queue — NEXT

| Queue | Task | Pre-req |
|---|---|---|
| **Q1** ← next | PilgrimCompare sweep + banned-phrase audit + dynamic departure cities | `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` committed |
| Q2 | Legal pages `/terms` `/privacy` `/how-it-works` | Q1 done |
| Q3 | IA/nav — header, footer, back buttons, breadcrumbs | Partial — footer + drawer done 2026-06-10 (see §13) |
| Q4 | Mobile polish 360/390/430px | Q3 done |
| Q5 | SEO — metadata, JSON-LD, sitemap | Q1 done |
| Q6 | Ranking transparency + Featured infrastructure | Revenue model confirmed |

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

Branch: `feature/umrah-mobile-ux-overhaul` (off `dev`, PR pending). Scope: the core business surfaces — `/search/packages` results, the compare experience, the filter panel, and `/umrah` form headings. Grounded in the `ui-ux-pro-max` + `make-interfaces-feel-better` + `accessibility` skills. Verified at 360/390px in the live preview; `npm run test` 232/232, `npm run build` 0 errors, `tsc` pass.

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
