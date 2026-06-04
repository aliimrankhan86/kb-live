# Phase 2 Implementation Plan

## Overview

Implement Catalogue Lite (Packages), Mixed Comparison, and SEO Lite foundations while maintaining Phase 1 standards.

## Tasks & Execution Order

### 1. Domain & Repository Updates (Priority A)

- **Goal**: Define `Package` entity and secure storage access.
- **Status**: **DONE**
- **Implementation**:
  - [x] Update `lib/types.ts`: Add `Package` interface.
  - [x] Update `lib/api/mock-db.ts`: Add `packages` storage.
  - [x] Update `lib/api/repository.ts`: Add CRUD methods with RBAC.
  - [x] Implement slug generation utility.
- **Acceptance Criteria**:
  - `Package` type matches spec.
  - Operators can only create/edit their own packages.
  - Public read access for packages.

### 2. Operator Packages UI (Priority A)

- **Goal**: CRUD interface for operators.
- **Status**: **DONE**
- **Implementation**:
  - [x] Page: `/operator/packages` (List view).
  - [x] Component: `PackageForm` (in Overlay).
  - [x] Actions: Create, Edit, Delete.
- **Acceptance Criteria**:
  - Uses standard Overlay/forms.
  - Validates inputs.
  - Persists to MockDB.

### 3. Public Package Browse & Detail (Priority B)

- **Goal**: Customer-facing catalogue.
- **Status**: **DONE**
- **Implementation**:
  - Page: `/packages` (Browse/Filter).
  - Page: `/packages/[slug]` (Detail).
  - Page: `/operators/[slug]` (Profile).
- **Acceptance Criteria**:
  - Filters work (Pilgrimage, Season, etc.).
  - Detail page shows all structured data + disclaimers.

### 4. Quote Prefill (Priority B)

- **Goal**: Conversion path from Package -> Quote.
- **Status**: **DONE**
- **Implementation**:
  - Add "Request Quote" CTA on package page.
  - Update `QuoteRequestWizard` (or store) to accept initial data via URL/State.
- **Acceptance Criteria**:
  - Clicking CTA opens Wizard with fields pre-filled from Package.

### 5. Mixed Comparison (Priority B)

- **Goal**: Compare Offers and Packages.
- **Status**: **DONE**
- **Implementation**:
  - Refactor `ComparisonTable` to accept `CompareItem` (union).
  - Mapper: `Package -> CompareItem`.
  - UI: Add "Compare" checkbox to Package cards.
  - UI: Ensure `RequestDetail` comparison still works.
- **Acceptance Criteria**:
  - Can compare 1 Offer + 1 Package.
  - Missing values show "Not provided".

### 6. SEO Lite (Priority C)

- **Goal**: Indexable pages.
- **Status**: **DONE**
- **Implementation**:
  - Pages: `/umrah`, `/hajj`, `/umrah/ramadan` (Static/SSG or server components).
  - Metadata: Dynamic titles/descriptions.
  - Sitemap: Generate `sitemap.xml` (mock/dynamic).
  - Canonicals: Add `<link rel="canonical">`.
- **Acceptance Criteria**:
  - Curated pages exist.
  - Filter pages have `noindex` (or canonical to root).

### 7. Tests & Quality Gates (Priority D)

- **Implementation**:
  - Unit tests for mappers and slug generation.
  - E2E tests for Package CRUD and Mixed Compare.
  - Accessibility check (ARIA labels, keyboard nav).
  - Update `QA.md`.
  - Create `PHASE_2_AUDIT.md`.
- **Status**: **DONE**

## Validation Commands

- `npm test`
- `npx playwright test`
- `npm run dev`

## Current status (as of 2026-02-03)

- Priority A: DONE
- Priority B: DONE
- Priority C: DONE (SEO lite implemented: robots + sitemap + metadata + Ramadan landing)
- Priority D: DONE (tests + audit)
- Notes: Non-blocking ESLint warnings remain (see PHASE_2_AUDIT.md).
