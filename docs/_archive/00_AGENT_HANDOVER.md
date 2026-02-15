# Agent Handover and Operating Rules

## Read order (single entry point)

1. **docs/README_AI.md** — Canonical AI onboarding (product, routes, key code, dev routine, status)
2. **docs/skills/** — Dev routines, public flow, shortlist, compare, test gates
3. `git status -sb` and `git log -1 --oneline` — Confirm branch and latest commit
4. **docs/NOW.md** — Current session state and next tasks
5. **docs/DOCS_INDEX.md** — Deep-dive into any specific topic as needed

## Work style rules

- Use micro-tasks only (small diffs, one concern at a time).
- Do not scan the whole repo.
- Only use Allowed files list in AGENTS.md (root).
- Ask before reading any additional file.
- Prefer deterministic selectors (data-testid) for E2E stability.

## Local development (avoid chunk 404s)

After clone/pull or when you see 404s for `_next/static/chunks/*`, start the dev server with a clean build: **`npm run dev:clean`**. Then hard-refresh the page. See `docs/skills/DEV_ROUTINES.md` for full recovery steps.

## Definition of Done (mandatory)

A task is only Done when:

- Acceptance criteria met
- `npm run test` passes
- `npm run build` passes
- Playwright passes if core flows/selectors touched
- Accessibility checklist items checked for impacted UI
- Docs updated per DOCS_INDEX triggers

## Before each commit (mandatory)

1. **Update docs/NOW.md** with:
   - What this commit changes (short list)
   - Current state of the task / branch
   - Next step or known follow-ups (if any)
2. If architecture, scope, or allowed-files changed: update **AGENTS.md** and **docs/CURSOR_CONTEXT.md**.
3. Run `npm run test` and `npm run build`, then commit.

## Docs update protocol (mandatory)

At the end of every completed task:

1. Identify which docs are impacted using DOCS_INDEX triggers
2. Update those docs in the same PR/commit
3. Update QA.md if behaviour changed

## Evidence format (required in task summary)

- Files changed
- Commands run
- Results
- Any follow-ups created
