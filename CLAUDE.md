# CLAUDE.md — KaabaTrip

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

## Non-negotiable before every push (from AGENTS.md)
- `npm run test` green · `npm run build` 0 errors · `npx tsc --noEmit` pass
- UI/route change → Playwright smoke `/`, `/umrah`, `/search/packages` at 320px + 1280px
- Small focused diffs, one concern per commit; add `data-testid` for Playwright targets
- Never invent operator trust claims — stored facts only; missing = "Not provided"
