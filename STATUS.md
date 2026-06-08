# KaabaTrip — Project Status

> **Single rolling tracker.** Any AI/dev: read this for current state. Update it after work is **done + tested + verified** (see `CLAUDE.md` rule).
> Detailed handover lives in `AI_NOTES.md`. Cold-start brief: `HANDOFF.md`. Business: `BUSINESS.md`.

**Last verified:** 2026-06-08 · **Branch:** `dev` → `main` · **App:** Next.js 15.5 / React 19 / Supabase / Prisma

---

## Health (verified 2026-06-08)

| Check | State |
| --- | --- |
| `npm run test` | ✅ 239/239 pass (18 files) |
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
- Dev persona login (`KaabaTrip!2026`) — **localhost + automated E2E only**, never on any deployed env (preview or production); no remote toggle. ⚠️ remove before prod launch (`AI_NOTES.md` §4). Note: only works under `npm run dev` (`NODE_ENV=development`); a local prod build (`npm start`) returns 401 by design.
- Password show/hide toggle, forgot password

**Quality / tests (EXECUTION_QUEUE Phase 5)**
- Validation utility: 7 reusable validators (`lib/validation.ts`) + 39 unit tests (Task 14)
- SEO JSON-LD consolidated: every page imports `@/lib/seo/json-ld`, no inline/local helpers (Task 13)
- E2E operator flow: `e2e/operator.spec.ts` 30/30 cross-browser via `__e2e_user` cookie bypass (Task 16)

**Storage / images**
- Migration `004_package_images_bucket.sql` **applied + verified** on Supabase (2026-06-08): public `package-images` bucket (5MB; jpeg/png/webp) + 4 RLS policies (public read; insert/update/delete only into own `{auth.uid()}/…` prefix). Matches `lib/api/storage.ts` path convention. Re-runnable via `scripts/apply-migration-004.mjs` (idempotent).

**Platform**
- UK GDPR (privacy, terms, cookie consent, marketing consent)
- SEO: JSON-LD, dynamic sitemap, city corridor pages (`/umrah/london|birmingham|manchester`)
- A11y: WCAG 2.2 AA, ARIA, keyboard nav, 44px tap targets
- Security: nonce-based CSP (replaced unsafe-inline), RLS migrations, rate limiting (Upstash)

---

## ⏳ Pending (blocked / not done)

| Item | Status | Blocker |
| --- | --- | --- |
| **Remove dev/preview login bypass before prod** | ⚠️ must strip, do not ship | Dev-only customer/partner sign-in (personas + `KaabaTrip!2026` + `__dev_user`). Safe (gated off in prod build) but must be physically removed pre-launch. Strip checklist in `AI_NOTES.md` §4. |
| Merge `dev` → `main` | open | PR review |

---

## ▶️ Next actions (do in order)

1. ✅ ~~Apply migration 004 to Supabase~~ — applied + verified 2026-06-08 (bucket + 4 RLS policies live). Remaining nicety: drive a real upload through package wizard step 7 with a logged-in operator to confirm the browser→Supabase round-trip.
2. Open PR `dev` → `main`, run full gate (test + build + Playwright smoke at 320px/1280px).
3. (then) groom backlog — see `docs/EXECUTION_QUEUE.md`.

> **Queue status (2026-06-08):** EXECUTION_QUEUE Tasks 13/14/16 verified `[x]`; Task 17 `[~]` — gate green, only manual dev smoke + commit/push remain. No `[ ]` backlog left in the queue. Migration 004 applied → only Pending items are dev-login strip (pre-prod) + PR `dev`→`main`.

---

## Update protocol

When you finish a unit of work **and** it passes `npm run test` + `npm run build`:
1. Move the item from **Pending/Next** → **Done**.
2. Update the **Health** date if you re-ran checks.
3. If product state shifted, sync `HANDOFF.md` (one-screen brief) and `AI_NOTES.md`.
4. Keep this file ≤ 2 screens. Push detail into `docs/`.
