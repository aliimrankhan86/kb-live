# CLAUDE.md — PilgrimCompare

Any AI/agent working here: this file auto-loads. Obey it.

## Read first (the front door)

1. `HANDOFF.md` — 60-second cold-start brief
2. `STATUS.md` — current done / pending / next
3. `BUSINESS.md` — the why (business + legal posture)
4. `AGENTS.md` — hard rules + allowed-files scopes (deeper detail in `AI_NOTES.md`, `docs/`)

## Mandatory: keep the docs live

After any unit of work that is **done + tested + verified** (passes `npm run test` **and** `npm run build`):

- Update **`STATUS.md`** — move item Pending/Next → Done, refresh the Health date.
- If product state shifted, sync **`HANDOFF.md`**.
- Only touch **`BUSINESS.md`** on real strategy change.
- Keep `STATUS.md`/`HANDOFF.md` short (≤2 screens / ≤1 screen). Push detail into `docs/`.

Do **not** spawn new status/progress docs — these three are canonical. `AI_NOTES.md` + `docs/` are the detailed appendix.

When a local problem turns out to be **expected behavior, not a bug**, capture it once as a 🛠️ **Gotcha** note and keep `PROJECT_BRIEF.md`, `AI_NOTES.md`, and `STATUS.md` in sync (one synced set — change one, update the other two same pass).

## Known gotchas (read before debugging "broken" local behavior)

- **Local login uses real Supabase test accounts — not a code bypass.** The old `@example.com` dev-login personas and the `/dev/login` route were **removed 2026-06-09 and no longer work** (do not reintroduce them). Local sign-in now uses three real Supabase auth accounts — `admin@test.local`, `operator@test.local`, `customer@test.local`, all password `TestPass1!` — created by `node scripts/create-test-users.mjs`. The script provisions them in whatever Supabase project `.env.local` points at; **LOCAL ONLY** once C1 (local/prod Supabase separation) lands, so run it against the local stack, never prod. Roles are set in `app_metadata` (the authz source). If local login fails, the accounts are missing → run the script. Full note: `AI_NOTES.md` §5.

## Execution rules (mandatory every session)

- **Discuss and plan before writing any code.** State the approach, list exact files to be touched, wait for go-ahead.
- **Work backwards from acceptance criteria** before starting each step. If the goal is unclear, ask once then proceed with stated assumptions.
- **If verification fails, debug internally.** Do not ask what to try next. Form a hypothesis, test it, report the outcome.
- **One concern per commit.** No TODOs, no empty returns, no placeholder code. Every commit must pass `npm run test` and `npm run build`.
- **`/compact` at ~50% context.** Before compacting, write current goal, completed steps, changed files, open risks, and next step into the summary.

## Git branching strategy (mandatory)

- **Never push directly to `main` or `dev`** — both are protected, require PR + CI green.
- Flow: `feature/your-branch` → PR → **`dev`** → (when approved) PR → `main`.
- All new work branches off `dev`. All PRs target `dev` first.
- Only `dev` → `main` PRs are allowed once `dev` is verified and stable.
- Before creating a PR, always `git fetch origin` first to ensure local refs are current.

## Non-negotiable before every push (from AGENTS.md)

- `npm run test` green · `npm run build` 0 errors · `npx tsc --noEmit` pass
- UI/route change → Playwright smoke `/`, `/umrah`, `/search/packages` at 320px + 1280px
- Small focused diffs, one concern per commit; add `data-testid` for Playwright targets
- Never invent operator trust claims — stored facts only; missing = "Not provided"

## Mandatory before raising a PR

- Update **`AI_NOTES.md`** with what changed, why, any gotchas, and the new test count.
- Update **`STATUS.md`** — move items Done, refresh Health date and branch/PR reference.
- Commit the doc updates **on the same branch** before opening the PR so they land together.
