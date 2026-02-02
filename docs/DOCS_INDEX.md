# Docs Index (Authoritative Map)

## How to use this

- Start here.
- Each doc below has:
  - Purpose
  - Owner (role)
  - Update triggers (when it must be updated)

## Mandatory rule

Any change to code, UX, tests, or workflow must include a docs update per this index.  
If a task changes behaviour and docs are not updated, the task is not complete.

## Canonical docs

| File                 | Purpose                                             | Owner                 | Update triggers                                                              |
| -------------------- | --------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| 00_PRODUCT_CANON.md  | Product truth: goals, scope, non-goals, policies    | Ali + Tuffy Architect | Any scope change, pricing policy, onboarding policy, legal stance, geography |
| 00_AGENT_HANDOVER.md | How any agent must work, including doc update rules | Tuffy Architect       | Any workflow/tooling change, Definition of Done, checks, model routing       |
| ARCHITECTURE.md      | System design, domain entities, repo boundaries     | Tuffy Architect       | Any change to types, repo pattern, storage, auth/RBAC                        |
| SECURITY.md          | Threat model, RBAC rules, data handling             | Tuffy Architect       | Any data model change, auth/RBAC change, new endpoints, new storage          |
| ACCESSIBILITY.md     | A11y rules and checklist                            | Tuffy QA              | Any new UI component, overlay, form, navigation changes                      |
| QA.md                | QA checklists and test matrix                       | Tuffy QA              | Any feature added/changed, any bug fixed, any test added                     |
| PHASE_1_1_PLAN.md    | Phase 1.1 gates and evidence                        | Ali + QA              | Only if Phase 1.1 standards change                                           |
| PHASE_2_PLAN.md      | Phase 2 scope and micro-task list                   | Ali + Architect       | Any Phase 2 scope change, resequencing, new acceptance criteria              |

## Supporting docs

| File                   | Purpose                                   | Owner           | Update triggers                               |
| ---------------------- | ----------------------------------------- | --------------- | --------------------------------------------- |
| 01_MODEL_ROUTING.md    | Which model does what, token control      | Tuffy Architect | Provider changes, quota limits, routing rules |
| 02_REPO_MAP.md         | Where things live, key files              | Tuffy Dev       | Structural refactors, new feature folders     |
| 09_KANBAN_WORKFLOW.md  | Kanban rules, roles, DoD                  | Ali             | Any process change                            |
| 10_PROMPT_TEMPLATES.md | Reusable prompts and micro-task templates | Ali + Architect | Prompt improvements, new workflow patterns    |
