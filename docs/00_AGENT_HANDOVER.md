# Agent Handover and Operating Rules

## Read order (required)

1. docs/DOCS_INDEX.md
2. AGENTS.md (repo root) and follow it strictly
3. **docs/NOW.md** (current context / branch memory — read first for in-progress work)
4. docs/00_PRODUCT_CANON.md
5. docs/ARCHITECTURE.md
6. docs/SECURITY.md
7. docs/ACCESSIBILITY.md
8. docs/QA.md
9. docs/PHASE_2_PLAN.md

## Work style rules

- Use micro-tasks only (small diffs, one concern at a time).
- Do not scan the whole repo.
- Only use Allowed files list in AGENTS.md.
- Ask before reading any additional file.
- Prefer deterministic selectors (data-testid) for E2E stability.

## Definition of Done (mandatory)

A task is only Done when:

- Acceptance criteria met
- npm run test passes
- Playwright passes if core flows/selectors touched
- Accessibility checklist items checked for impacted UI
- Docs updated per DOCS_INDEX triggers

## Before each commit (mandatory)

Update the context file so you (and any agent) stay aware of context and can make better decisions:

1. **Update docs/NOW.md** with:
   - What this commit changes (short list)
   - Current state of the task / branch
   - Next step or known follow-ups (if any)
2. If architecture, scope, or allowed-files changed: update **docs/CURSOR_CONTEXT.md** (e.g. "Current architecture notes", "Allowed edit scope").
3. Then run the usual checks and commit.

This keeps a single place (NOW.md) as the session/branch memory and avoids losing context between commits or sessions.

## Docs update protocol (mandatory)

At the end of every completed task:

1. Identify which docs are impacted using DOCS_INDEX triggers
2. Update those docs in the same PR/commit
3. Update QA.md if behaviour changed
4. Add a short entry to PHASE_2_AUDIT.md or CHANGELOG.md (if used)
5. Ensure docs/NOW.md was updated before the commit (see "Before each commit" above)

## Evidence format (required in task summary)

- Files changed
- Commands run
- Results
- Any follow-ups created
