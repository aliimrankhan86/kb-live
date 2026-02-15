# Kanban Workflow (Delivery System)

## Purpose

This document defines how KaabaTrip work is planned, executed, verified, and documented.
It is the operating system for shipping changes safely while keeping the repo and docs coherent.

This workflow is designed to work with:

- A human owner (Ali)
- Implementation via Codex
- Architecture decisions via Gemini 3 Pro (Cline)
- Evidence logging in `docs/PHASE_2_AUDIT.md` (and later phase audit files)

## Core principles

1. **Small batches win**

- Work is split into micro-tasks that can be finished in 30–120 minutes.
- Each micro-task ends with tests, evidence, and a commit.

2. **Definition of Done is non-negotiable**

- Code is not “done” until tests pass and required docs are updated.

3. **Docs are part of the product**

- Any change to behaviour must include a docs update per `docs/DOCS_INDEX.md`.

4. **Architecture decisions are explicit**

- Use Gemini 3 Pro only for architecture decisions or cross-cutting concerns.
- Record decisions in the relevant docs (Architecture/Security/Product canon) and in audit notes if needed.

5. **Evidence-based delivery**

- Every micro-task adds an entry to the audit log with commands and results.

---

## Board structure (recommended columns)

Use a simple flow with strict WIP limits:

1. **Backlog**
2. **Ready**
3. **In Progress**
4. **Review (Self-Review + QA)**
5. **Done**
6. **History / Archive**

### WIP limits

- Ready: unlimited (but keep tidy)
- In Progress: **max 1**
- Review: **max 1**
- Done: auto-archive after 7 days (if your `/kanban` supports it)

---

## Ticket types

### A) Micro-task (default)

Small, scoped, shippable unit.

**Must include:**

- Goal (one sentence)
- Allowed file scope
- Acceptance criteria (checkbox list)
- Required checks (commands)
- Evidence destination (audit entry)

### B) Spike / Research

Time-boxed exploration (no production changes required).

**Must include:**

- Question being answered
- Time-box
- Output artefact (notes, decision, recommendation)
- Follow-on micro-tasks

### C) Bug

Defect with repro steps.

**Must include:**

- Steps to reproduce
- Expected vs actual
- Where observed (route, component)
- Tests that should cover it

### D) Hygiene / Tech debt

Non-functional improvements (lint, refactor, test stability).

**Must include:**

- Why it matters
- Risk level
- What should NOT change (behaviour guarantees)

---

## Standard micro-task template

Copy/paste this into a Kanban card:

### MICRO-TASK <N>: <Title>

**Goal:**  
<one sentence>

**Allowed file scope:**

- <list of files and folders allowed>
- <explicitly say what is forbidden>

**Acceptance criteria:**

- [ ] ...
- [ ] ...
- [ ] ...

**Checks (must run):**

- [ ] `npm run test`
- [ ] `npx playwright test e2e/flow.spec.ts` (if relevant)
- [ ] Any additional check

**Evidence to append:**

- `docs/PHASE_2_AUDIT.md` (or current phase audit)

**Stop condition:**

- Stop before committing and provide exact git commands.

---

## Execution workflow (step-by-step)

### 1) Backlog grooming (Ali)

- Break work into micro-tasks.
- Ensure each micro-task has tight scope + clear acceptance criteria.
- Decide if this needs architecture input.

### 2) Decide which model to use

Use **Codex** when:

- Implementing a small scoped change
- Writing tests, wiring UI, refactors within one area
- Updating audit logs and docs

Use **Gemini 3 Pro (Cline)** when:

- The change affects architecture (data model, repository contracts, caching strategy)
- Cross-cutting concerns: localisation, currency, units, SEO strategy, security rules, ingestion strategy
- Decisions that must be recorded as long-lived policy

Rule of thumb:

- If it changes interfaces/contracts or long-term direction → Gemini first.
- If it’s straightforward implementation within an existing design → Codex first.

### 3) Development loop (Codex)

For each micro-task:

- Ensure working tree is clean: `git status -sb`
- Implement inside allowed scope
- Add/adjust unit tests where helpful
- Run required checks
- Append audit entry with evidence
- Stop and output exact git commands

### 4) Self-review (Ali)

Before commit:

- Scan diff for scope creep
- Verify acceptance criteria are satisfied
- Confirm tests/gates are clean
- Confirm docs updated

### 5) Commit + push

- One micro-task per commit (avoid mixing concerns)
- Commit message format (recommended):
  - `Feature: ...`
  - `Fix: ...`
  - `Chore: ...`
  - `Docs: ...`

### 6) Audit and close-out

- Each micro-task must have a PASS/FAIL entry in audit with:
  - commands run
  - results
  - notes/decisions
  - follow-ups (if any)

---

## Quality gates (global)

### Always required

- `npm run test` → PASS

### Required when UX flows are touched

- `npx playwright test e2e/flow.spec.ts` → PASS

### Required for catalogue/public pages changes

- `npx playwright test e2e/catalogue.spec.ts` → PASS

### Required when metadata/SEO changes

- `npm run build` → PASS
- manual: verify `/robots.txt` and `/sitemap.xml`

---

## Documentation rules

### Doc updates are mandatory when:

- Behaviour changes
- New route or component added
- New data field introduced or meaning changes
- New integration or external dependency added
- Any security/access change

### Where updates go

- Canon/policies: `docs/00_PRODUCT_CANON.md`
- Architecture: `docs/ARCHITECTURE.md`
- Security/RBAC: `docs/SECURITY.md`
- Accessibility: `docs/ACCESSIBILITY.md`
- QA processes: `QA.md`
- Phase evidence: `docs/PHASE_2_AUDIT.md` (or current)

`docs/DOCS_INDEX.md` remains the source of truth for what must be updated.

---

## Follow-ups and debt tracking

If a micro-task reveals a follow-up:

- Create a new Kanban card immediately
- Add it to the audit entry under “Follow-ups created”
- Keep follow-ups small and scannable (one problem per card)

---

## Release rhythm (lightweight)

Recommended cadence:

- Daily: 1–3 micro-tasks
- Weekly: a “release note” summary (can live in a future `docs/RELEASE_NOTES.md`)

Minimum release signal:

- Tests pass
- Audit entries complete
- Working tree clean
- Push is up to date

---

## Safety rules

- Never commit secrets or keys.
- Avoid adding scraping that violates website terms.
- Prefer partnerships, feeds, CSV uploads, or operator self-service onboarding for supply.
- Treat user data capture and voice bot transcripts as sensitive by default.
