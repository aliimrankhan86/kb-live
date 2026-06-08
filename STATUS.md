# KaabaTrip — Project Status

> **Single rolling tracker.** Any AI/dev: read this for current state. Update it after work is **done + tested + verified** (see `CLAUDE.md` rule).
> Detailed handover lives in `AI_NOTES.md`. Cold-start brief: `HANDOFF.md`. Business: `BUSINESS.md`.

**Last verified:** 2026-06-08 · **Branch:** `dev` → `main` · **App:** Next.js 15.5 / React 19 / Supabase / Prisma

---

## Health (verified 2026-06-08)

| Check | State |
| --- | --- |
| `npm run test` | ✅ 238/238 pass (18 files) |
| `npm run build` | ✅ 0 errors (known Supabase Edge + webpack cache warnings only) |
| `npx tsc --noEmit` | ✅ pass |
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
- Dev persona login (`KaabaTrip!2026`) for local development, E2E, Vercel preview, or controlled QA with `KAABATRIP_ENABLE_DEV_AUTH=true`; true production fallback disabled by default
- Password show/hide toggle, forgot password

**Platform**
- UK GDPR (privacy, terms, cookie consent, marketing consent)
- SEO: JSON-LD, dynamic sitemap, city corridor pages (`/umrah/london|birmingham|manchester`)
- A11y: WCAG 2.2 AA, ARIA, keyboard nav, 44px tap targets
- Security: nonce-based CSP (replaced unsafe-inline), RLS migrations, rate limiting (Upstash)

---

## ⏳ Pending (blocked / not done)

| Item | Status | Blocker |
| --- | --- | --- |
| **Apply migration `004_package_images_bucket.sql`** to Supabase | ❗ code ready, not applied | Needs Supabase DB access — creates `package-images` bucket (5MB, jpeg/png/webp). Image upload won't work until applied. |
| Merge `dev` → `main` | open | PR review |

---

## ▶️ Next actions (do in order)

1. Apply migration 004 to Supabase (`supabase/migrations/004_package_images_bucket.sql`) → verify image upload end-to-end on package wizard step 7.
2. Open PR `dev` → `main`, run full gate (test + build + Playwright smoke at 320px/1280px).
3. (then) groom backlog — see `docs/EXECUTION_QUEUE.md`.

---

## Update protocol

When you finish a unit of work **and** it passes `npm run test` + `npm run build`:
1. Move the item from **Pending/Next** → **Done**.
2. Update the **Health** date if you re-ran checks.
3. If product state shifted, sync `HANDOFF.md` (one-screen brief) and `AI_NOTES.md`.
4. Keep this file ≤ 2 screens. Push detail into `docs/`.
