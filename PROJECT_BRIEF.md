# PilgrimCompare — Full Project Brief (self-contained)

> **Paste this whole file into a Claude Project / ChatGPT Project / any AI chat.** It is standalone — no other files needed. Last verified **2026-06-08**.

---

## 1. What it is
A **UK-first, comparison-first marketplace** connecting pilgrims with **verified** travel operators for **Umrah and Hajj** packages.

**One-liner:** compare Umrah/Hajj packages from verified UK operators in one place.

Two modes:
- **Catalogue listings** — operators publish structured, searchable, comparable, SEO-friendly package pages.
- **Quote-first offers** — travellers submit preferences; operators respond with comparable offers; travellers express booking intent.

---

## 2. Business & legal posture (non-negotiable — never violate in code or copy)
- PilgrimCompare is a **marketplace / enquiry system** — NOT a tour operator, NOT a payment processor.
- Operators are the source of truth for package content, availability, pricing, fulfilment, payment records.
- PilgrimCompare does **not** collect, hold, transfer, escrow, or invoice customer funds.
- **BookingIntent** (`KT-…` ref) = an intent/reference record, **not** a payment confirmation or final booking.
- Customer payment is **pay-operator-direct**.
- Trust claims use **stored facts only** (verification status, ATOL/ABTA numbers, company metadata, regions, profile completeness). **Never invent trust claims.** Missing data → show "Not provided".
- MVP scope: **UK-first, GBP-only**. Multi-currency = future. Launch corridors: London (LHR/LGW), Birmingham (BHX), Manchester (MAN).
- Compliance: **UK GDPR, WCAG 2.2 AA**.

**Users:** Travellers (browse/search/shortlist/compare 3/quote/BookingIntent) · Operators (onboard/manage packages/respond to leads/track intents/analytics) · Admins (review bank changes, complaints, reconciliation, audit).

---

## 3. Tech stack
- **Next.js 15.5** (App Router, Server Components by default) · **React 19** · **TypeScript strict** (zero `any`)
- **Supabase** (`eu-west-2` London) — auth, PostgreSQL, Row Level Security, Storage
- **Prisma** ORM · **MockDB** in-memory store for dev/tests
- **Tailwind** · **Zustand** (state) · **Zod** (validation) · **Upstash** (rate limiting) · **Framer Motion**
- **Vitest** (unit) · **Playwright** (e2e) · ESLint + Prettier

**Where things live:** routes/UI `app/` + `components/` · data access `lib/api/db/` (Repository pattern, role-filtered) · types `lib/types.ts` · migrations `supabase/migrations/` · Prisma schema `prisma/`.

---

## 4. Current state (verified 2026-06-08)
- **Branch:** `dev` (target `main` after PR)
- **Tests:** ✅ 239/239 pass (18 files) · **Build:** ✅ 0 errors · **tsc:** ✅ pass · **Lint:** ✅ clean
- **MVP is feature-complete** across traveller / operator / admin flows.

---

## 5. ✅ Done (shipped & verified)
**Traveller:** package discovery (sort + filter: budget, dates, hotel stars, Haram distance, flight type) · Umrah 4-step search form · airport-level routing (LHR/LGW/BHX/MAN, backend filters by airport code) · shortlist + compare up to 3 · quote journey → BookingIntent (`KT-…`) · payment handoff (pay-operator-direct + evidence upload + bank details).

**Operator:** registration + profile · package CRUD via 8-step wizard (single POST) · CSV import/export · multi-image upload (`imageUrl` → `images[]` across Zod/OG/JSON-LD/components) · dashboard on real data via `Repository.getOffers()` (role-filtered) + manual Refresh · BookingOutcome entity + OutcomeForm · TierExplanation (status transparency) · analytics wired to real events.

**Admin:** complaint triage · bank-change review queue · reconciliation CSV export · audit logs.

**Auth:** Supabase + `/api/auth/me` (customer/operator/admin nav) · **dev persona login is localhost + automated-E2E ONLY** — never enabled on any deployed env (preview or production); no remote toggle, so the `PilgrimCompare!2026` personas cannot be reached from a public URL · password show/hide · forgot password.
> ⚠️ **Dev login = local testing scaffold, NOT production code.** Must be physically removed before production launch (strip checklist in `AI_NOTES.md` §4). Gated to localhost only as of 2026-06-08; safe on deploys but still slated for removal.
>
> 🛠️ **Gotcha — "can't log in locally":** dev personas (`customer@example.com` / `operator@example.com` / `operator2@example.com` / `admin@example.com`, all `PilgrimCompare!2026`) only work under **`npm run dev`** (`NODE_ENV=development`). A local **production build** (`npm run build` + `npm start` → `next start`) runs `NODE_ENV=production`, so `isDevAuthEnabled()` is false and sign-in returns **`401 AUTH_INVALID_CREDENTIALS`** — this is the hardening working as designed, not a bug. Fix = restart with `npm run dev`. Quick check: running process `next-server` (from `next start`) = login off; `next dev --turbopack` = login on.

**Platform:** UK GDPR (privacy, terms, cookie consent, marketing consent) · SEO (JSON-LD, dynamic sitemap, city corridor pages `/umrah/london|birmingham|manchester`) · A11y WCAG 2.2 AA · security (nonce-based CSP, RLS migrations, rate limiting).

---

## 6. ⏳ Pending / blocked
| Item | Status | Blocker |
| --- | --- | --- |
| Apply migration `004_package_images_bucket.sql` to Supabase | ❗ code ready, NOT applied | needs Supabase DB access — creates `package-images` bucket (5MB; jpeg/png/webp). **Image upload is inert until applied.** |
| Remove dev login scaffold before prod | ⚠️ must strip, do not ship | localhost-only & safe today, but personas + `PilgrimCompare!2026` + `__dev_user` must be deleted pre-launch. Checklist: `AI_NOTES.md` §4. |
| Merge `dev` → `main` | open | PR review |

## 7. ▶️ Next actions (in order)
1. Apply migration 004 to Supabase → verify image upload end-to-end on package wizard step 7.
2. Open PR `dev` → `main`; run full gate (test + build + Playwright smoke at 320px & 1280px).
3. Groom backlog.

---

## 8. Engineering rules (apply to every change)
- Small focused diffs, **one concern per commit**.
- **Before every push:** `npm run test` green · `npm run build` 0 errors · `npx tsc --noEmit` pass. If UI/routes changed → Playwright smoke `/`, `/umrah`, `/search/packages` at **320px + 1280px**.
- Add stable `data-testid` for anything Playwright tests.
- A11y required: labels, keyboard, focus management, clear errors, ≥44px tap targets.
- **Never invent operator trust claims** — stored facts only; missing = "Not provided".

---

## 9. How to keep this brief current
This is a snapshot. After finishing + verifying work, update sections **4 (state), 5 (done), 6 (pending), 7 (next)** and the "Last verified" date at the top. In the repo, the live equivalent is `STATUS.md`.

**Recurring-gotcha rule (for current + future AI sessions):** when a local issue is diagnosed as *expected behavior* rather than a bug (e.g. the dev-login `npm run dev` vs `npm start` gotcha in §5), record it once as a 🛠️ **Gotcha** note in the relevant section here **and** mirror it in `AI_NOTES.md` + `STATUS.md`. Treat the three docs as one synced set — if you add or change a gotcha in one, update the other two in the same pass. Do not spin up a separate notes file.
