# PilgrimCompare — AI Handoff Brief

> **Cold-start brief.** Give this file to any AI tool. Read top-to-bottom in 60 seconds, then you know what to do.
> Full status: `STATUS.md` · Business: `BUSINESS.md` · Deep handover: `AI_NOTES.md` · Rules: `AGENTS.md`

**What:** UK-first comparison marketplace for Umrah/Hajj packages. Pilgrims compare verified operators; operators publish packages + respond to quote leads. Enquiry/intent system — **no funds held** (pay-operator-direct).

**Stack:** Next.js 15.5 (App Router, Server Components) · React 19 · TypeScript strict · Supabase (auth/Postgres/RLS/storage, `eu-west-2`) · Prisma · Tailwind · Zustand · Vitest + Playwright.

**State (2026-06-12):** Production on `main` (PR #54 merged). Tests 1,818/1,818 ✅. Build clean ✅. Q1–Q6 quality passes complete. Full transactional email suite live (6 templates via Resend). 3 Vercel cron jobs active (nudge-operators 08:00, outcome-followup 09:00, expire-packages 02:00 UTC). CRON_SECRET auth on all cron routes. `/how-we-rank` ranking transparency page live. Sitemap + footer updated. All domain redirects working. Supabase email confirmations branded.

**Remaining setup items:** Operational only — curl-test 3 cron endpoints with CRON_SECRET, submit test enquiry to verify email delivery, onboard first operator. Email mailboxes live via Cloudflare Email Routing (→ Gmail). Upgrade to Google Workspace when onboarding real operators.

**How to verify any change (mandatory before push):**
```bash
npm run test     # 1,818/1,818 must pass
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
