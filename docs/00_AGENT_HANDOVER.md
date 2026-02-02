# Agent Handover and Operating Rules

## Read order (required)

1. docs/DOCS_INDEX.md
2. AGENTS.md (repo root) and follow it strictly
3. docs/00_PRODUCT_CANON.md
4. docs/ARCHITECTURE.md
5. docs/SECURITY.md
6. docs/ACCESSIBILITY.md
7. docs/QA.md
8. docs/PHASE_2_PLAN.md

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

## Docs update protocol (mandatory)

At the end of every completed task:

1. Identify which docs are impacted using DOCS_INDEX triggers
2. Update those docs in the same PR/commit
3. Update QA.md if behaviour changed
4. Add a short entry to PHASE_2_AUDIT.md or CHANGELOG.md (if used)

## Evidence format (required in task summary)

- Files changed
- Commands run
- Results
- Any follow-ups created
