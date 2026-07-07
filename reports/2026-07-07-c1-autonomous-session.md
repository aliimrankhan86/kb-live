# C1 Autonomous Session — 2026-07-07

Local/prod Supabase separation, branch hygiene, stale-doc cleanup, authorised prod
cleanup, tests, and merge to dev. Run without merging or pushing to `main`, and without
deploying. All work landed on `chore/c1-local-supabase` → PR **#105** to `dev`.

---

## Branch state — before and after

**Before**
- `origin/main` `8f58818` · `origin/dev` `99909c2` · working branch `docs/record-preclean` `5c395bb` (= PR #104).
- One open PR: **#104** (docs-only), from `docs/record-preclean` → `dev`.
- ~30 stale local branches, plus stale remote branches; several remotes already pruned on fetch.

**After**
- `origin/main` **untouched** (`8f58818`).
- `origin/dev` = `02af94a` (PR #104 merged) → will advance again when PR #105 merges.
- Open PR: **#105** (`chore/c1-local-supabase` → `dev`).
- Deleted **26 merged local** + **6 merged remote** branches.
- Remaining remote branches: `origin/dev`, `origin/main`, `origin/ci/add-pr-workflow` (last is unmerged — kept).
- Unmerged local stragglers kept: `feature/mobile-ux-pass-sliders-footer`, `fix/duplicate-email-error`, `fix/merge-main-conflicts`, `fix/signup-and-auth-confirm`, `qa/app-readiness-audit`.

## What merged
- **PR #104** (docs-only: `.gitignore`, `AI_NOTES.md`, `STATUS.md`) → `dev` as merge commit `02af94a`. Verified the net diff was exactly those 3 files; CI was green; branch deleted.
- **PR #105** (this session's C1 branch) → opened to `dev`; merged once CI green (see Test results). `main` never touched.

`main` vs `dev`: the only commits on `main` not on `dev` are the 7 promotion merge commits (`Merge pull request #NN from …/dev`) — the expected, healthy promotion delta. No genuine non-promotion commits, so `main` was **not** merged into `dev`.

## C1 outcome (local/prod Supabase separation)
Local Supabase stack stood up with the CLI (Docker running). RLS policies and storage-bucket
SQL were **already fully captured** as files under `supabase/migrations/` (`001_enable_rls`,
`002`–`004` buckets, `005`/`006`/`008`/`009` policies) — so **no read-only `pg_dump` from prod
was required**; the reproducibility gap was already closed on the file side and is now exercised
end-to-end.

Reproducible provisioning sequence (documented in `AI_NOTES.md §C1`):
`supabase init` → disable `[db.migrations]` + `[db.seed]` in the (gitignored) `config.toml`
→ `supabase start` → repoint `.env.local` at the local stack → `prisma db push` →
apply `supabase/migrations/*.sql` in numeric order → `node scripts/create-test-users.mjs`.

**Verified local:** 15 public tables; RLS on across all key tables; 4 storage buckets
(`evidence-files`, `operator-exports`, `package-images`, `payment-evidence`); **zero rows** in
`users`/`packages`/`operator_profiles`. App boots on `127.0.0.1:3000`; `admin@test.local` /
`TestPass1!` signs in; `/api/auth/me` returns role `admin`. Local project ref
(`supabase-demo` / `127.0.0.1:54322`) is provably distinct from prod
(`nzvepuzzxjoxvpcrlozx`). **Acceptance met: local dev cannot touch prod data.**

Local-stack artefacts (`supabase/config.toml`, `supabase/.branches`, `supabase/.temp`) are
gitignored per the brief; `.env.local` now points local; `.env.production.local` holds the
prod snapshot for Gate 4.

## The three prod operations (before → after)
Executed against prod (`nzvepuzzxjoxvpcrlozx`) via `.env.production.local`. Read-only
inspection first, then writes.

1. **Role mirror sync — `aliimrankhan86@gmail.com`.**
   Before: `public.users.role = customer` (while `app_metadata.role` was already `admin`).
   After: `public.users.role = admin`. Idempotent; authz reads `app_metadata`, so this only
   fixes the mirror.

2. **Delete `operator@test.local` + `customer@test.local`.**
   Before: both present in `auth.users`; checked every FK into `public.users`
   (`operator_profiles`, `payment_details`, `bank_change_requests` ×3, `audit_log_entries`,
   `quote_requests`, `booking_intents`, `complaints`) → **0 references each**; **0**
   `public.users` mirror rows. After: both deleted from `auth.users` (admin API), 0 rows
   remaining. `admin@test.local` confirmed **preserved**.

3. **`scripts/remove-test-admin-guard.mjs` (written, not executed against `admin@test.local`).**
   Dry-run by default, `--execute` to act. Removes `admin@test.local` (auth + mirror) but
   **refuses to remove the last admin** (lockout guard on `app_metadata.role`). Targets
   `.env.production.local` if present. Dry-run validated against prod — it correctly sees
   `aliimrankhan86@gmail.com` as the other admin and reports it would delete `admin@test.local`
   (1 auth row, 0 mirror rows) without making changes.

No other prod writes occurred.

## Test results
- `npx tsc --noEmit` — clean.
- `npm run build` — 0 errors.
- `npm run test` (Vitest) — **1,869 / 1,869** passed (32 files).
- `npx playwright test` — parallel run showed **1 failure** on
  `bank-payment.spec.ts:15` (firefox), the AI_NOTES-documented multi-worker MockDB race
  between the operator/bank-payment specs. Re-run under CI conditions
  (`--workers=1`): **69 passed / 6 skipped / 0 failed**. Playwright uses `E2E_TESTING=1` +
  MockDB and never touches prod.

## Blockers
None hit. (Prior sessions reported a sandboxed environment; this session had full tool
access — Node, Docker, Supabase CLI, network — so all gates executed for real.)

## Waiting on the founder (three items, in order)
1. **Verify gmail admin login on live** — sign in fresh at the live site as
   `aliimrankhan86@gmail.com` and confirm admin access (role is in `app_metadata`; log in
   fresh so the JWT carries it).
2. **Run `node scripts/remove-test-admin-guard.mjs --execute`** — only after step 1, to remove
   the synthetic `admin@test.local` from prod. (Dry-run first if you want to preview.)
3. **Review `dev`** (with PR #105 merged) before promoting `dev → main`. Promotion remains a
   human-gated step; nothing in this session touched `main` or deployed.
