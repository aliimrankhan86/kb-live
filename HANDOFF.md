# PilgrimCompare — AI Handoff Brief

> **Cold-start brief.** Give this file to any AI tool. Read top-to-bottom in 60 seconds, then you know what to do.
> Full status: `STATUS.md` · Business: `BUSINESS.md` · Deep handover: `AI_NOTES.md` · Rules: `AGENTS.md`

**What:** UK-first comparison marketplace for Umrah/Hajj packages. Pilgrims compare verified operators; operators publish packages + respond to quote leads. Enquiry/intent system — **no funds held** (pay-operator-direct).

**Stack:** Next.js 15.5 (App Router, Server Components) · React 19 · TypeScript strict · Supabase (auth/Postgres/RLS/storage, `eu-west-2`) · Prisma · Tailwind · Zustand · Vitest + Playwright.

**State (2026-06-10):** Branch `dev`. Tests 232/232 ✅. Build clean ✅. MockDB removed from production paths. RLS audit complete. Transactional email suite live — `send.pilgrimcompare.co.uk` verified on Resend, `RESEND_API_KEY` in Vercel, 4 templates wired into quote-requests + booking-intents APIs.

**Remaining setup items:** (1) Supabase SMTP → Resend (host: `smtp.resend.com`, port 465, user: `resend`, pass: Resend API key). (2) Paste Email 1 confirm-signup template into Supabase Auth → Email Templates. (3) Set `NEXT_PUBLIC_SITE_URL=https://pilgrimcompare.co.uk` in Vercel. (4) Cloudflare `.com` → `.co.uk` redirect. See `AI_NOTES.md` for exact steps.

**How to verify any change (mandatory before push):**
```bash
npm run test     # 232/232 must pass
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
