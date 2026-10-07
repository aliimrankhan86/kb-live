# PilgrimCompare — AI Handoff Brief

> **Cold-start brief.** Give this file to any AI tool. Read top-to-bottom in 60 seconds, then you know what to do.
> Full status: `STATUS.md` · Business: `BUSINESS.md` · Deep handover: `AI_NOTES.md` · Rules: `AGENTS.md`

**What:** UK-first comparison marketplace for Umrah/Hajj packages. Pilgrims compare verified operators; operators publish packages + respond to quote leads. Enquiry/intent system — **no funds held** (pay-operator-direct).

**Stack:** Next.js 15.5 (App Router, Server Components) · React 19 · TypeScript strict · Supabase (auth/Postgres/RLS/storage, `eu-west-2`) · Prisma · Tailwind · Zustand · Vitest + Playwright.

**State (2026-06-13):** Production on `main` (PR #54). Tests 1,830/1,830 ✅. Build clean ✅. Light theme + search redesign + pagination on `main`. Homepage redesign merged to `dev` (PR #63). Data-integrity "Not provided" display fix merged to `dev` (PR #64) — cards, JSON-LD, quote prefill. Operator-form no-silent-defaults fix on `fix/operator-form-no-silent-defaults` (PR → dev pending) — wizard no longer saves default stars/distance/group type for skipped fields; they persist unset → "Not provided" (see AI_NOTES §28). Q1–Q6 quality passes complete. Full transactional email suite live. 3 Vercel cron jobs active.

**Overnight QA (2026-10-06):** branch `fix/overnight-qa` (PR into dev, awaiting review) fixes the search/tab package mismatch and several P0 data/security issues. See `docs/uat/OVERNIGHT_REPORT.md`.

**Release 2026-10-06 (done):** production runs `main` `0c80db9` (deployment `dpl_37VRWgywt4AhiwteZyHz9UfwURjs`, rollback target `dpl_7njTU7yY4NuEBtHznKhJsrEx7VbM` on `1505dcd`). Migrations 013 and 014 applied in production (`supabase/migrations-pending/APPLIED.md`). Smoke tests pass except where no package data exists yet. Smoke 10, the first retention cron log line, is pending. Post-release items: `docs/BACKLOG.md`. Detail: `AI_NOTES.md` §REL.

**Release 2026-10-07 (done):** PR #115 (`/partner` founding operators copy) and PR #116 (`dev` into `main`). Production runs `main` `a4e7075` (`dpl_C6wvCksUXATpod7GaWpNwABsVQFM`).

**Staging (B0, PR #117 into `dev`, not merged):** Vercel Preview deployments use the fictional Supabase project `pilgrimcompare-staging` (`fkcudutzgltrsoykfvfn`), with a test-site banner, `noindex` and email only to `STAGING_EMAIL_TO`. Reseed with `npm run seed:staging`. Read `docs/STAGING.md` before touching Preview env vars or staging data.

**Listing rule (2026-10-06):** an operator is public only when admin-verified AND it has an ATOL number (`lib/listing.ts`); changing its ATOL number returns it to pending. Real-DB browser suite: `supabase start --workdir e2e/local-db` then `npm run e2e:local-db` (also CI job `local-db`).

**Remaining setup items:** Operational only — curl-test 3 cron endpoints with CRON_SECRET, submit test enquiry to verify email delivery (failed on the B0 preview: email sends are fire-and-forget, see `docs/BACKLOG.md`), onboard first operator. Email mailboxes live via Cloudflare Email Routing (→ Gmail). Upgrade to Google Workspace when onboarding real operators.

**How to verify any change (mandatory before push):**
```bash
npm run test     # 2,127/2,127 must pass
npm run build    # 0 errors
npx tsc --noEmit # pass
# if UI/routes changed: Playwright smoke on / , /umrah , /search/packages at 320px + 1280px
```

**Where things live:**
- Routes/UI → `app/`, `components/`
- Data access → `lib/api/db/` (Repository pattern, role-filtered), Prisma schema `prisma/`
- Types → `lib/types.ts` · Validation → Zod schemas · Migrations → `supabase/migrations/`
- Product truth → `docs/00_PRODUCT_CANON.md` · UX rules → `docs/UX_GUIDELINES.md` · SEO → `docs/SEO.md`

**Hard rules (from `AGENTS.md`):** small focused diffs, one concern per commit · never invent operator trust claims (stored facts only; missing = "Not provided") · a11y required · add `data-testid` for Playwright targets · update `STATUS.md` + relevant doc on every push.

**After you finish + verify work:** update `STATUS.md` (Done/Pending/Next) — see its Update protocol.
