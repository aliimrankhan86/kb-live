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
- **Dev login fails locally → check the server, not the code.** Dev personas (`customer@example.com` / `operator@example.com` / `operator2@example.com` / `admin@example.com`, all `KaabaTrip!2026`) only work under `npm run dev` (`NODE_ENV=development`). A local prod build (`npm run build` + `npm start` → `next start`) runs `NODE_ENV=production`, so `isDevAuthEnabled()` is false and sign-in returns `401 AUTH_INVALID_CREDENTIALS` **by design**. Fix = restart with `npm run dev`. Full note: `PROJECT_BRIEF.md` §5, `AI_NOTES.md` §4.

## Non-negotiable before every push (from AGENTS.md)
- `npm run test` green · `npm run build` 0 errors · `npx tsc --noEmit` pass
- UI/route change → Playwright smoke `/`, `/umrah`, `/search/packages` at 320px + 1280px
- Small focused diffs, one concern per commit; add `data-testid` for Playwright targets
- Never invent operator trust claims — stored facts only; missing = "Not provided"
