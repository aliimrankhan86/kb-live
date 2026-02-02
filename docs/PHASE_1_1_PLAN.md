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

## Phase 1 Final Close-Out

**Date:** <YYYY-MM-DD>  
**Repo commit:** <git rev-parse --short HEAD>  
**Verdict:** PASS

### What Phase 1 delivers

- Customer Quote Request Wizard at `/quote` (multi-step, validated, persisted)
- Request detail at `/requests/[id]` showing offers and comparison selection
- Operator dashboard at `/operator/dashboard` to view open requests and submit offers
- Offers comparison table supports up to 3 offers side-by-side
- Standard UI components: Overlay (Dialog) and Slider, used consistently
- Mock persistence via localStorage (MockDB) to test end-to-end without backend

### Phase 1.1 stabilisation evidence

- Playwright E2E flow passes across Chromium, Firefox, WebKit:
  - Quote -> Offer -> Compare
- `npm run test` passes (Vitest suite)

### Commands run (evidence)

- `npm run test` → PASS
- `npx playwright test e2e/flow.spec.ts` → PASS
- (Optional) `npx playwright show-report` → reviewed

### Known limitations (accepted for Phase 1)

- No payments or booking confirmation. Booking is tracked as intent only (where applicable).
- No real authentication. “Current user” is simulated in MockDB.
- localStorage persistence is not a backend. It is for prototyping and QA only.

### Next approved scope

Proceed to Phase 2 Priority B (Public packages browse + detail + operator profile) with the same gates:
tests pass + docs updated + evidence logged in Phase 2 audit.
