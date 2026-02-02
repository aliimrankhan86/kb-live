# Phase 1.1 Stabilisation Plan

## Overview

This phase focuses on stabilizing the MVP, ensuring test reliability, implementing a robust delivery workflow (Kanban), and establishing security/accessibility foundations.

## Tasks & Execution Order

### 1. Fix E2E Test Stability (Priority A)

- **Goal**: Make `e2e/flow.spec.ts` deterministic and robust.
- **Implementation**:
  - Add `data-testid` attributes to `RequestDetail.tsx` (offer cards, checkboxes, compare button).
  - Update test to wait for offer count >= 2.
  - Update test to target specific checkboxes.
- **Acceptance Criteria**:
  - `npx playwright test e2e/flow.spec.ts` passes consistently on Chromium, Firefox, WebKit.
  - No `undefined` errors for checkbox selection.

### 2. Delivery Kanban Enhancements (Priority B)

- **Goal**: Implement "Role Workflow" and "Auto-archive".
- **Implementation**:
  - Update `Task` type: Add `userStory`, `acceptanceCriteria`, `qaNotes`, `checklists`.
  - Enhance `TaskForm` to support these fields.
  - Implement auto-archive logic (Done > 7 days -> History).
  - Implement Role Workflow triggers (Dev -> In Progress showing checklist).
  - Add search/filters.
  - Ensure keyboard accessibility (Drag & Drop via keyboard).
- **Acceptance Criteria**:
  - Drag/drop works.
  - Tasks persist.
  - Done tasks archive after 7 days.
  - Role-specific checklists appear.

### 3. Partner Portal & RBAC (Priority C)

- **Goal**: Secure foundation for operators.
- **Implementation**:
  - Define RBAC rules (Operator can only see own offers/requests).
  - Create `BookingIntent` entity/store.
  - Create `/operator/analytics` page.
  - Update `RequestDetail`: Add "Proceed / Request booking" button -> Creates `BookingIntent`.
  - Refactor `MockDB` access to simulate "Repository" pattern for easier swap.
- **Acceptance Criteria**:
  - Operator sees only their data.
  - Analytics page shows stats.
  - BookingIntent flows works (Started -> Contacted).

### 4. Accessibility & Security (Priority D/E)

- **Goal**: Compliance foundations.
- **Implementation**:
  - Audit and fix contrast/ARIA labels.
  - Implement rate limiting stub/logic in API/Store.
  - Document Security threats and mitigations.
- **Acceptance Criteria**:
  - `docs/ACCESSIBILITY.md` created with checklist.
  - `docs/SECURITY.md` created.
  - `docs/ARCHITECTURE.md` updated with RBAC matrix.

## Validation Commands

- **Unit Tests**: `npm test`
- **E2E Tests**: `npx playwright test e2e/flow.spec.ts`
- **Dev Server**: `npm run dev`
