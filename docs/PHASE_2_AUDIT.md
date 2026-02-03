# Phase 2 Audit (Evidence Log)

## Purpose

This file is the evidence log for Phase 2 work. Every completed micro-task must append one entry here.

## Rules (mandatory)

- One entry per micro-task.
- Include commands run and outcomes.
- Mark PASS only if acceptance criteria are met and required checks pass.
- If a task uncovers follow-ups, create new Kanban items and list them under Follow-ups.

---

## Entry Template (copy this section for each task)

### YYYY-MM-DD - <Task title>

**Goal:**  
<one sentence>

**User story (if applicable):**  
As a <user>, I want <capability> so that <benefit>.

**Acceptance criteria:**

- [ ]
- [ ]
- [ ]

**Result:** PASS / FAIL

**Files changed:**

- **Commands run (with results):**

- `npm run test` →
- `npx playwright test e2e/flow.spec.ts` → (only if relevant)
- Any other command →

**Manual smoke steps (if applicable):**

-
- **Notes / Decisions:**

- **Risks / Tech debt introduced:**

- **Follow-ups created:**

-

---

### 2026-02-02 - Micro-task 0: Gates (initial e2e)

**Goal:**  
Run the required initial Playwright flow test before Phase 2 changes.

**Acceptance criteria:**

- [ ] `npx playwright test e2e/flow.spec.ts` runs successfully.

**Result:** FAIL

**Files changed:**

- docs/PHASE_2_AUDIT.md

- **Commands run (with results):**

- `npx playwright test e2e/flow.spec.ts` → FAIL (webServer could not start; `listen EPERM: operation not permitted 0.0.0.0:3000`)

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Playwright webServer failed to bind to `0.0.0.0:3000` with EPERM; needs environment/policy adjustment before re-run.

**Risks / Tech debt introduced:**

- None

**Follow-ups created:**

- Investigate Playwright webServer bind policy or port config for this environment.

---

### 2026-02-02 - Micro-task 0b: Fix Playwright webServer bind

**Goal:**  
Allow Playwright webServer to bind to localhost so e2e can run without EPERM.

**Acceptance criteria:**

- [x] `npx playwright test e2e/flow.spec.ts` runs successfully after config change.

**Result:** PASS

**Files changed:**

- playwright.config.ts
- docs/PHASE_2_AUDIT.md

- **Commands run (with results):**

- `npx playwright test e2e/flow.spec.ts` → PASS (ran outside sandbox)

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Switched Playwright webServer to `npx next start -H 127.0.0.1 -p 3001` and updated `baseURL`/`url` to port 3001.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

### 2026-02-02 - Micro-task 1: Public Packages Browse (/packages)

**Goal:**  
Provide a customer-facing packages browse page with filters, states, and stable test hooks.

**User story (if applicable):**  
As a customer, I want to browse Umrah and Hajj packages with basic filters so I can find the right option quickly.

**Acceptance criteria:**

- [x] `/packages` lists published packages with stable test IDs.
- [x] Filters for pilgrimage type, season, and price sort are available.
- [x] Loading, error, and empty states are present and accessible.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- app/packages/page.tsx
- components/packages/PackagesBrowse.tsx
- docs/PHASE_2_AUDIT.md

- **Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Implemented client-side filters with `useTransition` to surface loading state.
- Error state rendered when repository read fails.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.

---

### 2026-02-03 - Micro-task 1: Public Packages Browse (/packages)

**Goal:**  
Provide a customer-facing packages browse page with filters, states, and stable test hooks.

**User story (if applicable):**  
As a customer, I want to browse Umrah and Hajj packages with basic filters so I can find the right option quickly.

**Acceptance criteria:**

- [x] `/packages` lists published packages with stable test IDs.
- [x] Filters for pilgrimage type, season, and price sort are available.
- [x] Loading, error, and empty states are present and accessible.
- [x] Required checks pass.

**Result:** PASS

**Files changed:**

- app/packages/page.tsx
- components/packages/PackagesBrowse.tsx
- docs/PHASE_2_AUDIT.md

- **Commands run (with results):**

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS

**Manual smoke steps (if applicable):**

- N/A

**Notes / Decisions:**

- Added `aria-busy` on the packages page container while filters update.
- Test IDs: `packages-page`, `package-card-{id}`, `package-link-{slug}`, `packages-filter-type`, `packages-empty`.

**Risks / Tech debt introduced:**

- None observed.

**Follow-ups created:**

- None.
