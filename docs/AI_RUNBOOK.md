# KaabaTrip AI_RUNBOOK.md

version: 1.0
last_updated: 2026-06-04
owner: Ali Khan (ali@kaabatrip)
status: ACTIVE — single source of truth for all AI and human contributors

---

## 1. BINDING CONSTRAINTS (Digest v1.2)

These constraints are hard. Any output that violates them must be rejected.

### Core constraints

- C1 MVP is pay-operator-direct only. KaabaTrip holds zero customer funds.
- C2 No guarantees. Operator is the contracting party, not KaabaTrip.
- C3 Operators are source of truth. Missing values → "Not provided". Never infer or default.
- C4 Compare: max 3 Comparable items only. Incomplete/Assisted items excluded at type and runtime.
- C5 Verified claims require evidence. No implied guarantees, no "fully vetted" language.
- C6 Marketing: explicit opt-in only. Service messages: zero promos.
- C7 UI/UX: reuse existing theme tokens and patterns. WCAG 2.1 AA. Fast mobile. No hardcoded colours or spacing.
- C8 Currency: MVP shows GBP only. Multi-currency display is future scope (infra ready in lib/i18n/). Do not render currency selectors or converted prices in public UI.

### Core flows

- F1 Quote rail: QuoteRequest → Offer → Compare (max 3) → BookingIntent.
- F2 Catalogue: Browse Packages → Compare (max 3) → Quote or BookingIntent.
- F3 BookingIntent: unique referenceCode (KT-..., immutable), payment handoff, evidence upload (image/PDF metadata + optional text), skip requires explicit acknowledgement.
- F4 Operator confirms payment status within 48h. Non-compliance affects routing/ranking.

### Trust and safety

- T1 Tiers: Listed / Verified. Verified Plus is future scope only — do not activate.
- T2 Bank details: captured in controlled onboarding. Changes via change-request + cooling period + audit log + manual admin review only.
- T3 Complaints: customer → operator first. KaabaTrip logs, routes, escalates. No refund promises in MVP.

### Data and privacy

- D1 Evidence: RBAC — customer + involved operator + admin only.
- D2 Evidence retention: delete after defined period unless active dispute.
- D3 Never email bank details or evidence. Emails link to in-app view only.
- D4 Evidence storage is metadata-only in MVP. File bytes are not stored.

### Non-goals (MVP)

- N1 No KaabaTrip-held payments, escrow, chargebacks, merchant-of-record checkout.
- N2 No competitor scraping.
- N3 No automated WhatsApp follow-ups.

### Key clarifications

- K1 Phase status SSOT: single enum, no inline strings or redefinitions.
- K2 BookingIntent.referenceCode is unique and immutable once issued.
- K3 skipProofAcknowledged flag required when proof is skipped.
- K4 Flagged operators (missed 48h confirm SLA) are demoted or excluded from high-intent routing.
- K5 "Not provided" is display-only, never fallback computation.
- K6 Only Comparable items can be added to Compare. Assisted items excluded at type and runtime.

### Shipped context

- c8c1774: BookingIntent referenceCode (KT-...) + evidence metadata + skip acknowledgement shipped.
- a8eee55: Bank details types, MockDB storage, Repository RBAC methods (MT-1 + MT-2) shipped.
- 3d5ffe1: Audit evidence docs for MT-1/MT-2 shipped.
- 2bd339f: Operator bank details UI (BankDetailsForm, PhoneOtpModal, /operator/settings/payment-details, sidebar nav) shipped (MT-3).
- Supabase decision: London (eu-west-2) + Prisma + RLS + Storage. See docs/PHASE_2_AUDIT.md persistence decision record.

### Required copy (must not be altered)

Pay-operator-direct disclosure:

> You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.

Skip-proof acknowledgement must include:

> KaabaTrip does not have access to the operator's payment records… ability to help evidence payment may be limited… This does not remove legal rights…

### Red flags — reject any output containing these

- "guarantee", "we ensure", "KaabaTrip promises", "risk-free", "full refund"
- "organiser", "merchant-of-record", "checkout", "invoice", "escrow", "chargeback"
- Operator data rendered by inference or `|| default` instead of "Not provided"
- Bank details editable without change-control gate, cooling period, audit log, and manual review
- Marketing message without opt-in check, or promo inside service message
- Hardcoded colours or spacing instead of existing tokens
- Compare accepts more than 3 items or any non-Comparable item
- Evidence accessible outside strict RBAC

---

## 2. OPERATING RULES (AI execution protocol)

### Pre-read rule

Read this file only. No other doc is required to pick and start a task.
Product policy questions → consult `docs/00_PRODUCT_CANON.md`.
Architecture questions → consult `docs/ARCHITECTURE.md`.

### Pick rule (deterministic)

Scan ACTIVE TASKS top-to-bottom. Pick the first task where:

1. `status: READY`
2. Your role is listed in `primary_owner_role` or `supporting_roles`
3. All items in `dependencies` have status DONE (either a task ID in COMPLETED or a commit hash in Shipped context above)

If no task qualifies, stop and report which tasks are blocked and why.

### Claim rule

Before writing any code or doc:

1. Update the task block: set `status: IN_PROGRESS`, add `claimed_by: <model name>`, `claimed_at: <ISO datetime>`.
2. Only one agent may hold IN_PROGRESS on a given task ID at a time. If already IN_PROGRESS, skip it.

### Completion rule

When done:

1. Move the task block from ACTIVE TASKS to COMPLETED.
2. Populate: `evidence_commit`, `checks_run`, `phase_audit_entry`, `docs_updated`.
3. All items in `acceptance_criteria` must be ticked.
4. Update `docs/AI_RUNBOOK.md` itself (this file) with the move.

### Definition of done

A task is DONE only when ALL of the following are true:

- All `acceptance_criteria` items pass.
- All `checks_required` commands pass with zero errors.
- At least one `phase_audit_entry` reference exists (commit message or docs update).
- All `docs_to_update` files have been updated.

### Collision prevention

- Never claim a task that is already IN_PROGRESS.
- Never modify a COMPLETED task block.
- Never add a new ACTIVE task without adding it to the ROLE-BASED AUTO-NEXT QUEUE.

---

## 3. ROLE-BASED AUTO-NEXT QUEUE

Universal pick rule: scan ACTIVE TASKS top-to-bottom; pick the first READY task where your role is in `primary_owner_role` or `supporting_roles` and all dependencies are DONE.

### Architect

1. P1A-SUPABASE-SETUP (depends on [])
2. P1B-PRISMA-SCHEMA (depends on P1A)
3. P1C-DB-ADAPTER (depends on P1B)
4. P1D-AUTH-MIDDLEWARE (depends on P1A)
5. P1E-RLS-POLICIES (depends on P1B)
6. P1F-STORAGE-BUCKETS (depends on P1A)
7. P1G-SEED-MIGRATION (depends on P1C, P1E)
8. P1H-CUTOVER (depends on P1G)

### Backend

1. P1A-SUPABASE-SETUP (depends on [])
2. P1B-PRISMA-SCHEMA (depends on P1A)
3. P1C-DB-ADAPTER (depends on P1B)
4. P1D-AUTH-MIDDLEWARE (depends on P1A)
5. P1E-RLS-POLICIES (depends on P1B)
6. P1F-STORAGE-BUCKETS (depends on P1A)
7. P1G-SEED-MIGRATION (depends on P1C, P1E)
8. P1H-CUTOVER (depends on P1G)

### Frontend

1. P0-COMPLAINTS-FLOW (depends on []) ← highest priority READY now
2. P1-SEO-CORRIDORS (depends on [])
3. P2-PKG-CSV (depends on a8eee55)

### UX

1. P0-COMPLAINTS-FLOW (depends on [])
2. P1-SEO-CORRIDORS (depends on [])

### QA

1. P0-HYGIENE-ARTEFACTS (depends on []) ← do first (unblocks repo cleanliness)
2. P0-COMPLAINTS-FLOW (depends on [])

### SEO

1. P1-SEO-CORRIDORS (depends on [])

### Partnerships / Supply

No READY tasks currently. Monitor P0-COMPLAINTS-FLOW for operator routing spec.

### Business Analyst

1. P0-COMPLAINTS-FLOW (spec the operator-routing and admin-triage rules)
2. P2-PKG-CSV

---

## 4. PENDING TASKS SUMMARY

```
P0-COMPLAINTS-FLOW             Complaints routing: customer → operator → admin triage
P0-HYGIENE-ARTEFACTS           Remove duplicate docs dirs, gitignore .next artefacts
P1-EVIDENCE-BYTES              Evidence file bytes storage with RBAC + retention
P1A-SUPABASE-SETUP             Create Supabase project (London), install deps, env config
P1B-PRISMA-SCHEMA              Design Prisma schema matching existing types
P1C-DB-ADAPTER                 Build DB adapter layer (Repository interface unchanged)
P1D-AUTH-MIDDLEWARE            Next.js middleware + session strategy
P1E-RLS-POLICIES               Row Level Security policies for all tables
P1F-STORAGE-BUCKETS            Supabase Storage: evidence (private), exports (private)
P1G-SEED-MIGRATION             Migrate seed data; SQL seed script
P1H-CUTOVER                    Remove MockDB fallback; all tests against Postgres
P1-SEO-CORRIDORS               Budget Umrah corridor pages (London / Birmingham / Manchester)
P2-PKG-CSV                     CSV import/export for operator packages
```

---

## 5. ACTIVE TASKS

```yaml
id: MT4-ADMIN-BANK-REVIEW
priority: P0
status: DONE
primary_owner_role: Frontend
supporting_roles: [UX, Backend]
goal: Build admin UI to list, review, approve, and reject bank detail change requests with mandatory reason and cooling period confirmation.
dependencies: [a8eee55]
allowed_scope:
  - app/admin/bank-changes/page.tsx
  - app/admin/bank-changes/[id]/page.tsx
  - components/admin/BankChangeReviewCard.tsx
  - components/admin/AuditLogView.tsx
acceptance_criteria:
  - [x] Queue list view renders pending BankChangeRequest records with operator name, submitted date, status badge, Review link
  - [x] Detail view shows before/after snapshot table with semantic th[scope=col] headers
  - [x] Approve action: confirmation dialog shows coolingEndsAt date, calls Repository.approveBankChangeRequest, writes AuditLogEntry
  - [x] Reject action: reason textarea aria-required=true, min 10 chars enforced client and Repository side, calls Repository.rejectBankChangeRequest
  - [x] Approve and reject buttons have distinct aria-label values
  - [x] data-testid approve-btn, reject-btn, review-reason, change-request-before, change-request-after present
  - [x] tsc --noEmit passes
  - [x] npm test passes (27/27)
  - [x] npm run build passes
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm test
  - [x] npm run build
docs_to_update:
  - [x] QA.md
  - [x] docs/SECURITY.md
evidence_required: commit hash + QA.md entry
evidence_commit: MT4-ADMIN-BANK-REVIEW
checks_run: [tsc, npm test 27/27, npm run build]
date: 2026-06-04
```

```yaml
id: MT5-CUSTOMER-PAYMENT-INSTR
priority: P0
status: DONE
claimed_by: Kimi
claimed_at: 2026-06-04T19:56:00Z
primary_owner_role: Frontend
supporting_roles: [UX, Backend]
goal: Build PaymentInstructions component gated by BookingIntent ownership + Verified operator eligibility, shown in-app only.
dependencies: [a8eee55]
allowed_scope:
  - components/request/PaymentInstructions.tsx
  - app/requests/[id]/page.tsx
  - tests/payment-instructions.test.tsx
acceptance_criteria:
  - [x] Repository.getPaymentInstructions gate enforced — Listed operator returns holding message not bank details
  - [x] Customer without matching BookingIntent gets holding message not bank details
  - [x] Verified operator with matching BookingIntent shows accountHolderName, sortCode, accountNumber, bankName or "Not provided", referenceCode, pay-operator-direct disclosure
  - [x] bankDetailsRecentlyUpdatedWarning banner shown when flag is true; role=alert; icon aria-hidden=true
  - [x] Pay-operator-direct disclosure text matches required copy exactly
  - [x] Never rendered server-side in a way reachable by email paths
  - [x] data-testid payment-instructions, recently-updated-warning, payment-disclaimer, bank-account-holder, bank-sort-code, bank-account-number present
  - [x] tests/payment-instructions.test.tsx passes (5/5)
  - [x] tsc --noEmit passes
  - [x] npm run build passes
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm test (32/32)
  - [x] npm run build
docs_to_update:
  - [x] QA.md
  - [x] docs/00_PRODUCT_CANON.md
evidence_required: commit hash + QA.md entry
evidence_commit: MT5-CUSTOMER-PAYMENT-INSTR
checks_run: [tsc, npm test 32/32, npm run build]
date: 2026-06-04
```

```yaml
id: MT6-ELIGIBILITY-GATING
priority: P0
status: DONE
claimed_by: Kimi
claimed_at: 2026-06-04T20:03:00Z
primary_owner_role: Frontend
supporting_roles: [Backend]
goal: Wire "Book now" / proceed-to-BookingIntent CTAs to Repository.isOperatorBookable so Listed or suspended operators cannot initiate bookings.
dependencies: [a8eee55]
allowed_scope:
  - components/search/PackageCard.tsx
  - components/request/RequestDetail.tsx
  - tests/operator-eligibility.test.ts
acceptance_criteria:
  - [x] RequestDetail offer card uses BookableButton that calls Repository.isOperatorBookable and disables with aria-disabled=true and tooltip when operator not bookable
  - [x] Existing booking intent still disables the button (intent recorded state)
  - [x] Verified badge shown only for tier=verified operators; listed operators show no badge (already implemented)
  - [x] Repository.createBookingIntent still enforces gate server-side regardless of UI state
  - [x] tests/operator-eligibility.test.ts still passes with no regressions (5/5)
  - [x] tsc --noEmit passes
  - [x] npm run build passes
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm test (32/32)
  - [x] npm run build
docs_to_update:
  - [x] QA.md
  - [x] docs/ARCHITECTURE.md
evidence_required: commit hash + QA.md entry
evidence_commit: MT6-ELIGIBILITY-GATING
checks_run: [tsc, npm test 32/32, npm run build]
date: 2026-06-04
```

```yaml
id: DONE-COMPLAINTS-FLOW
priority: P0
status: COMPLETED
claimed_by: Kimi
claimed_at: 2026-06-04T21:06:00Z
primary_owner_role: Frontend
supporting_roles: [UX, Business Analyst, Backend]
goal: Add a basic complaints/dispute routing flow — customer submits complaint, system routes to operator, admin can triage — with no refund promises anywhere in copy or logic.
dependencies: []
allowed_scope:
  - lib/types.ts
  - lib/api/mock-db.ts
  - lib/api/repository.ts
  - components/request/ComplaintForm.tsx
  - components/operator/ComplaintsInbox.tsx
  - components/admin/ComplaintsTriage.tsx
  - app/requests/[id]/page.tsx
  - app/operator/dashboard/page.tsx
  - app/admin/complaints/page.tsx
  - tests/complaints.test.ts
acceptance_criteria:
  - [x] Complaint type added to lib/types.ts with fields id, bookingIntentId, referenceCode, customerId, operatorId, category, severity, status, description, createdAt, updatedAt
  - [x] Status enum: submitted, operator_notified, operator_responding, admin_triage, resolved, closed, cannot_resolve
  - [x] Category enum: payment_issue, service_quality, package_description, booking_problem, other
  - [x] Severity enum: low, medium, high
  - [x] Customer can submit complaint from BookingIntent detail view via ComplaintForm component
  - [x] Operator sees complaints on dashboard via ComplaintsInbox (own only — RBAC enforced)
  - [x] Operator can respond (min 5 chars) and update status (operator_responding, resolved, cannot_resolve)
  - [x] Admin sees all complaints via /admin/complaints with ComplaintsTriage component
  - [x] Admin can add internal notes, flag operator internally, update status (admin_triage, resolved, closed)
  - [x] No copy contains "refund", "guarantee", "KaabaTrip will resolve", or similar
  - [x] Copy states customer should contact operator directly and KaabaTrip logs/routes only
  - [x] tsc --noEmit passes
  - [x] npm test passes (55/55)
  - [x] npm run build passes
  - [x] Playwright E2E passes (6/6 chromium, no regressions)
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm test (55/55)
  - [x] npm run build
docs_to_update:
  - [x] QA.md
  - [x] docs/SECURITY.md
  - [x] docs/PHASE_2_AUDIT.md
  - [x] docs/NOW.md
evidence_required: commit hash + QA.md entry + PHASE_2_AUDIT.md entry
evidence_commit: be14156
checks_run: [tsc --noEmit, npm test 55/55, npm run build, playwright 6/6 chromium]
phase_audit_entry: docs/PHASE_2_AUDIT.md
docs_updated: [QA.md, docs/SECURITY.md, docs/PHASE_2_AUDIT.md, docs/NOW.md]
```

```yaml
id: DONE-HYGIENE-ARTEFACTS
priority: P0
status: COMPLETED
primary_owner_role: QA
supporting_roles: []
goal: Remove duplicate docs/_archive 2 and docs/skills 2 directories from the repo and ensure .next build artefacts are gitignored.
dependencies: []
allowed_scope:
  - docs/_archive 2/
  - docs/skills 2/
  - .gitignore
acceptance_criteria:
  - [x] docs/_archive 2/ removed from repo (git rm -r)
  - [x] docs/skills 2/ removed from repo (git rm -r)
  - [x] .gitignore includes .next/ entry (already present)
  - [x] git status shows clean working tree after removal
  - [x] npm run build passes after cleanup
checks_required:
  - [x] git status
  - [x] npm run build
docs_to_update: []
evidence_required: commit hash
evidence_commit: 57d84f1
checks_run: [git status clean, npm run build PASS]
phase_audit_entry: docs/PHASE_2_AUDIT.md
date: 2026-06-04
```

```yaml
id: DONE-EVIDENCE-BYTES
priority: P1
status: COMPLETED
claimed_by: Kimi
claimed_at: 2026-06-04T21:35:00Z
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Implement actual file byte storage for payment evidence uploads with RBAC enforcement and a defined retention policy.
dependencies: [c8c1774]
allowed_scope:
  - lib/api/repository.ts
  - lib/api/mock-db.ts
  - lib/types.ts
  - tests/evidence-bytes.test.ts
acceptance_criteria:
  - [x] BookingPaymentEvidenceFile supports optional base64Data field
  - [x] BookingPaymentEvidence has storageStatus (metadata-only | bytes-stored), disputeFlag, retentionExpiresAt
  - [x] Repository.preparePaymentEvidence auto-detects bytes presence and sets storageStatus + 90-day retentionExpiresAt
  - [x] Repository.getEvidenceBytes returns full evidence with bytes only to customer/operator/admin; throws if purged
  - [x] Repository.flagEvidenceForRetention requires admin; sets disputeFlag to preserve bytes
  - [x] pruneExpiredEvidence strips base64Data after retentionExpiresAt unless disputeFlag is true
  - [x] getBookingIntents auto-prunes expired evidence on every read
  - [x] RBAC enforced: unrelated operator blocked
  - [x] 10 unit tests covering all scenarios
  - [x] tsc --noEmit passes
  - [x] npm test passes (65/65)
  - [x] npm run build passes
  - [x] Playwright E2E passes (6/6 chromium, no regressions)
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm test (65/65)
  - [x] npm run build
docs_to_update:
  - [x] docs/ARCHITECTURE.md
  - [x] docs/SECURITY.md
evidence_required: commit hash + ARCHITECTURE.md + SECURITY.md updates
evidence_commit: e12a8c8
checks_run: [tsc --noEmit, npm test 65/65, npm run build, playwright 6/6 chromium]
phase_audit_entry: docs/PHASE_2_AUDIT.md
docs_updated: [docs/ARCHITECTURE.md, docs/SECURITY.md, docs/NOW.md]
```

```yaml
id: P1-PERSISTENCE-MIGRATION
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Replace localStorage-based MockDB with server-side persistence (Supabase London + Prisma + RLS).
decision: Supabase (London eu-west-2) + Prisma ORM + Row Level Security + Supabase Storage
decision_date: 2026-06-04
decision_rationale: |
  Single provider (Postgres + Auth + Storage) reduces integration surface and misconfiguration risk.
  London region aligns with UK-first posture and GDPR data residency.
  Prisma provides mature Next.js integration, type-safe queries, and migration tooling.
  RLS gives deny-by-default row security without extra middleware.
  Free tier acceptable for dev/early validation; Pro planned for live beta.
micro_tasks:
  - P1A-SUPABASE-SETUP
  - P1B-PRISMA-SCHEMA
  - P1C-DB-ADAPTER
  - P1D-AUTH-MIDDLEWARE
  - P1E-RLS-POLICIES
  - P1F-STORAGE-BUCKETS
  - P1G-SEED-MIGRATION
  - P1H-CUTOVER
```

```yaml
id: P1A-SUPABASE-SETUP
priority: P1
status: IN_PROGRESS
claimed_by: Kimi
claimed_at: 2026-06-04T22:13:00Z
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Create Supabase project, install SDK/Prisma, configure environment variables.
dependencies: []
allowed_scope:
  - package.json
  - .env / .env.example
  - lib/supabase/ (new)
acceptance_criteria:
  - Supabase project created in London (eu-west-2) region
  - @supabase/supabase-js and @supabase/ssr installed
  - prisma and @prisma/client installed
  - DATABASE_URL and DIRECT_URL in .env.example (no real keys committed)
  - Supabase URL and anon key in .env.example
  - lib/supabase/client.ts exports createClient for browser
  - lib/supabase/server.ts exports createClient for server (reads cookies)
  - lib/supabase/middleware.ts exports updateSession for Next.js middleware
  - tsc --noEmit passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm run build
docs_to_update:
  - docs/ARCHITECTURE.md
  - docs/SECURITY.md
evidence_required: commit hash + env.example updated
```

```yaml
id: P1B-PRISMA-SCHEMA
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Design Prisma schema that maps 1:1 to existing TypeScript types in lib/types.ts.
dependencies: [P1A]
allowed_scope:
  - prisma/schema.prisma
  - prisma/migrations/ (new)
acceptance_criteria:
  - Every entity in lib/types.ts has a matching Prisma model
  - Enums use native Prisma enum (mapped to PostgreSQL enum)
  - JSON fields used for nested objects (inclusions, roomOccupancyOptions, eligibilityFlags)
  - Decimal used for monetary fields (pricePerPerson, depositAmount)
  - UUID used for all id fields (default uuid())
  - createdAt/updatedAt use @default(now()) / @updatedAt
  - Unique constraints on slug, referenceCode, (operatorId + status=active) for payment details
  - Relation fields named clearly (operator packages, operator bank changes, etc.)
  - First migration generated: npx prisma migrate dev --name init
  - tsc --noEmit passes
checks_required:
  - npx tsc --noEmit
  - npx prisma validate
  - npx prisma migrate dev
docs_to_update:
  - docs/ARCHITECTURE.md
evidence_required: commit hash + schema.prisma file
```

```yaml
id: P1C-DB-ADAPTER
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Build a DB adapter layer that implements the same interface as MockDB so Repository methods work unchanged.
dependencies: [P1B]
allowed_scope:
  - lib/api/db/adapter.ts (new)
  - lib/api/db/ (new)
acceptance_criteria:
  - Adapter exports same method signatures as MockDB (getRequests, saveRequest, etc.)
  - All reads use Prisma findMany/findUnique with proper include
  - All writes use Prisma create/update with proper connect/disconnect
  - Transaction support for multi-table operations (Prisma $transaction)
  - Type-safe: no any types; Prisma-generated types used throughout
  - Adapter can be swapped with MockDB via environment flag (FEATURE_USE_REAL_DB)
  - Unit tests run against MockDB (fast); integration tests against real DB (optional)
  - tsc --noEmit passes
  - npm test passes
checks_required:
  - npx tsc --noEmit
  - npm test
docs_to_update:
  - docs/ARCHITECTURE.md
evidence_required: commit hash + adapter.ts
```

```yaml
id: P1D-AUTH-MIDDLEWARE
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect, Frontend]
goal: Replace localStorage session simulation with Supabase Auth + Next.js middleware.
dependencies: [P1A]
allowed_scope:
  - middleware.ts (new or update)
  - app/api/auth/ (new route handlers)
  - lib/api/repository.ts (context change)
acceptance_criteria:
  - middleware.ts validates JWT on every request to /operator/*, /admin/*, /api/*
  - Anonymous users can access public routes (/umrah, /packages, /search, /quote)
  - Sign-up flow: operator vs customer role selection
  - Sign-in flow: email + password (MVP; magic link future scope)
  - RequestContext.userId comes from Supabase auth.getUser() (server-side)
  - RequestContext.role comes from user metadata (role field)
  - No localStorage session tokens stored in browser (httpOnly cookies only)
  - Sign-out clears cookies and redirects to /
  - tsc --noEmit passes
  - npm test passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - docs/ARCHITECTURE.md
  - docs/SECURITY.md
evidence_required: commit hash + middleware.ts
```

```yaml
id: P1E-RLS-POLICIES
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect, Security]
goal: Implement deny-by-default Row Level Security on every table with role-based policies.
dependencies: [P1B]
allowed_scope:
  - prisma/schema.prisma (RLS enable flags)
  - supabase/migrations/rls_*.sql
  - docs/SECURITY.md
acceptance_criteria:
  - Every table has ENABLE ROW LEVEL SECURITY
  - Default: no unauthenticated access (anon key cannot read/write)
  - Customer policy: can read own quote requests, booking intents, complaints; cannot read others
  - Operator policy: can read own profile, packages, bank changes, complaints, booking intents where operatorId matches
  - Admin policy: can read all tables (bypass RLS via service role)
  - Package policy: published packages readable by everyone; draft packages only by owning operator
  - Audit log: insert-only for operators; read by admin and owning operator
  - Policies tested with Prisma + Supabase integration tests
  - No cross-tenant data leakage in test assertions
  - tsc --noEmit passes
checks_required:
  - npx tsc --noEmit
  - npm test
docs_to_update:
  - docs/SECURITY.md
evidence_required: commit hash + SQL policy files + SECURITY.md RLS section
```

```yaml
id: P1F-STORAGE-BUCKETS
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect, Security]
goal: Configure Supabase Storage buckets for evidence files and CSV exports with private access.
dependencies: [P1A]
allowed_scope:
  - supabase/migrations/storage_*.sql
  - lib/api/storage.ts (new)
acceptance_criteria:
  - Bucket evidence-files: private, no public access
  - Bucket operator-exports: private, no public access
  - Upload via signed URL (time-limited, single-use where possible)
  - Download via signed URL (time-limited, RBAC-checked before generation)
  - Evidence file bytes stored in evidence-files bucket; metadata (filename, mimeType, size) in DB
  - File types restricted to image/* and application/pdf
  - Max file size: 5MB per file
  - Never email file URLs; always generate fresh signed URL in-app
  - tsc --noEmit passes
checks_required:
  - npx tsc --noEmit
  - npm run build
docs_to_update:
  - docs/SECURITY.md
evidence_required: commit hash + storage bucket config + storage.ts
```

```yaml
id: P1G-SEED-MIGRATION
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Migrate MockDB seed data to a Prisma seed script + SQL seed for reference.
dependencies: [P1C, P1E]
allowed_scope:
  - prisma/seed.ts
  - supabase/seed.sql
acceptance_criteria:
  - prisma/seed.ts creates all seed operators, packages, users with correct IDs
  - Seed script is idempotent (upsert, not insert)
  - Verified operator (op1) has active payment details seeded
  - At least one published package per operator seeded
  - Seed data matches existing MockDB seed exactly (same IDs, same values)
  - npx prisma db seed runs successfully
  - SQL seed script (supabase/seed.sql) provided for manual Supabase dashboard import
  - tsc --noEmit passes
checks_required:
  - npx tsc --noEmit
  - npx prisma db seed
docs_to_update:
  - docs/ARCHITECTURE.md
evidence_required: commit hash + seed.ts + seed.sql
```

```yaml
id: P1H-CUTOVER
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect, QA]
goal: Remove MockDB fallback, run full test suite against Postgres, update docs.
dependencies: [P1G]
allowed_scope:
  - lib/api/mock-db.ts
  - lib/api/repository.ts
  - tests/
acceptance_criteria:
  - FEATURE_USE_REAL_DB defaults to true in production
  - MockDB still available for unit tests via explicit flag (fast, no DB needed)
  - All 75+ unit tests pass (MockDB mode)
  - Integration tests pass (real DB mode, run in CI)
  - Playwright E2E passes against real DB (no localStorage state dependencies)
  - docs/ARCHITECTURE.md updated: data model section references Prisma schema
  - docs/SECURITY.md updated: auth flow, RLS policies, storage security
  - docs/NOW.md updated: persistence migration shipped
  - No references to localStorage as primary storage in docs
  - tsc --noEmit passes
  - npm test passes
  - npm run build passes
  - Playwright passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
  - npx playwright test
docs_to_update:
  - docs/ARCHITECTURE.md
  - docs/SECURITY.md
  - docs/NOW.md
evidence_required: commit hash + all docs updated + test results
```

```yaml
id: DONE-SEO-CORRIDORS
priority: P1
status: COMPLETED
claimed_by: Kimi
claimed_at: 2026-06-04T21:42:00Z
primary_owner_role: SEO
supporting_roles: [Frontend]
goal: Create SEO corridor pages for high-intent search terms Budget Umrah from London, Birmingham, and Manchester.
dependencies: []
allowed_scope:
  - app/umrah/london/page.tsx
  - app/umrah/birmingham/page.tsx
  - app/umrah/manchester/page.tsx
  - app/sitemap.ts
  - components/marketing/CityCorridor.tsx
acceptance_criteria:
  - [x] Three static pages created with unique h1, meta title, and meta description per city
  - [x] Each page links to /search/packages with pre-filled query params (type=umrah, departureCity=...)
  - [x] Pages included in sitemap.ts
  - [x] No scraped or fabricated operator data — content uses product-owned copy only
  - [x] No claims of "best price" or "guaranteed availability"
  - [x] Statically prerendered at build time (no client JS on public pages)
  - [x] tsc --noEmit passes
  - [x] npm run build passes
  - [x] npm test passes (65/65, no regressions)
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm run build
  - [x] npm test
docs_to_update:
  - [x] docs/SEO.md
evidence_required: commit hash + sitemap.ts updated + SEO.md updated
evidence_commit: bb50910
checks_run: [tsc --noEmit, npm run build, npm test 65/65]
phase_audit_entry: docs/PHASE_2_AUDIT.md
docs_updated: [docs/SEO.md, docs/NOW.md]
```

```yaml
id: DONE-PKG-CSV
priority: P2
status: COMPLETED
claimed_by: Kimi
claimed_at: 2026-06-04T21:46:00Z
primary_owner_role: Frontend
supporting_roles: [Backend, Business Analyst]
goal: Add CSV import and export for operator packages to speed up bulk onboarding.
dependencies: [a8eee55]
allowed_scope:
  - components/operator/PackageCsvImport.tsx
  - components/operator/PackageCsvExport.tsx
  - components/operator/OperatorPackagesList.tsx
  - lib/api/repository.ts
  - tests/package-csv.test.ts
acceptance_criteria:
  - [x] Export: operator can download all their packages as a CSV from /operator/packages
  - [x] Import: operator can upload a CSV; rows are validated against Package type before saving
  - [x] Invalid rows reported back to operator with row number and reason — not silently skipped
  - [x] RBAC: operator can only import/export their own packages
  - [x] tsc --noEmit passes
  - [x] npm test passes (75/75)
  - [x] npm run build passes
checks_required:
  - [x] npx tsc --noEmit
  - [x] npm test (75/75)
  - [x] npm run build
docs_to_update:
  - [x] QA.md
evidence_required: commit hash + QA.md entry
evidence_commit: 272713e
checks_run: [tsc --noEmit, npm test 75/75, npm run build]
phase_audit_entry: docs/PHASE_2_AUDIT.md
docs_updated: [QA.md, docs/NOW.md]
```

---

## 6. COMPLETED

```yaml
id: DONE-BOOKINGINTENT-EVIDENCE
evidence_commit: c8c1774
checks_run: [tsc, npm test, npm run build]
audit_ref: docs/AI_HANDOFF.md v1.2 shipped behaviour section
date: 2026-02
summary: BookingIntent referenceCode (KT-..., immutable), payment evidence metadata (image/PDF), skip-proof acknowledgement flow. Evidence is metadata-only. RBAC customer+operator+admin only.
```

```yaml
id: DONE-VERIFIED-BANK-FOUNDATION
evidence_commit: a8eee55
checks_run: [tsc, npm test]
audit_ref: docs/ARCHITECTURE.md data model table
date: 2026-06
summary: MT-1 and MT-2. OperatorTier, OperatorEligibilityFlags, PaymentDetails, BankChangeRequest, AuditLogEntry types added. MockDB storage keys kb_payment_details, kb_bank_change_requests, kb_audit_log added. Repository RBAC methods createPaymentDetails, isOperatorBookable, createBankChangeRequest, approveBankChangeRequest, rejectBankChangeRequest, cancelBankChangeRequest, getPaymentInstructions, getAuditLog shipped. Cooling period 24h in dev. Seed: op1 Verified with active payment details.
```

```yaml
id: DONE-AUDIT-MT1-MT2
evidence_commit: 3d5ffe1
checks_run: [docs review]
audit_ref: docs/ARCHITECTURE.md, docs/SECURITY.md
date: 2026-06
summary: Audit evidence docs for MT-1/MT-2 bank details foundation added.
```

```yaml
id: DONE-OPERATOR-BANK-UI
evidence_commit: 2bd339f
checks_run: [tsc, npm test 27/27, npm run build]
audit_ref: docs/QA.md, docs/ARCHITECTURE.md
date: 2026-06-04
summary: MT-3. BankDetailsForm (sort-code auto-format, a11y, data-testid), PhoneOtpModal (Radix Dialog, focus-trap, one-time-code), /operator/settings/payment-details page (6 states: loading, empty, active, pending_change, cooling, change_rejected), OperatorSidebar Payment Details nav link added.
```

```yaml
id: DONE-ADMIN-BANK-REVIEW
evidence_commit: MT4-ADMIN-BANK-REVIEW
checks_run: [tsc --noEmit, npm test 27/27, npm run build]
audit_ref: docs/AI_RUNBOOK.md, docs/ARCHITECTURE.md
date: 2026-06-04
summary: MT-4. Admin bank change review UI: /admin/bank-changes queue list, /admin/bank-changes/[id] detail with before/after comparison table, approve dialog with cooling period confirmation, reject dialog with aria-required reason textarea and min-10 char enforcement (client + server), AuditLogView component rendering operator audit entries. data-testid attributes on all interactive elements. Repository.rejectBankChangeRequest enforces 10-char minimum server-side.
```

```yaml
id: DONE-CUSTOMER-PAYMENT-INSTR
evidence_commit: MT5-CUSTOMER-PAYMENT-INSTR
checks_run: [tsc --noEmit, npm test 32/32, npm run build]
audit_ref: docs/AI_RUNBOOK.md, docs/ARCHITECTURE.md
date: 2026-06-04
summary: MT-5. PaymentInstructions component gated by BookingIntent ownership + Verified operator eligibility. Listed operators show holding message. Unauthorized customers see holding message. Verified operators show full bank details (accountHolderName, sortCode, accountNumber, bankName) with reference code and pay-operator-direct disclosure. Recently-updated warning banner when bank details changed in last 7 days (role=alert, icon aria-hidden). Component rendered client-side only (use client). Integrated into RequestDetail below existing booking intent cards. 5 unit tests cover all acceptance criteria. vitest.config.ts updated with esbuild.jsx=automatic for JSX test support.
```

```yaml
id: DONE-ELIGIBILITY-GATING
evidence_commit: MT6-ELIGIBILITY-GATING
checks_run: [tsc --noEmit, npm test 32/32, npm run build]
audit_ref: docs/AI_RUNBOOK.md, docs/ARCHITECTURE.md
date: 2026-06-04
summary: MT-6. BookableButton component in RequestDetail checks Repository.isOperatorBookable per offer. Non-bookable operators show disabled button with aria-disabled=true and title="Verification in progress". Verified badge already shown only for tier=verified. Server-side gate in Repository.createBookingIntent still enforces regardless of UI. No regressions in operator-eligibility tests.
```

```yaml
id: DONE-COOLING-AUDIT-LOG
evidence_commit: MT8-COOLING-AUDIT-LOG
checks_run: [tsc --noEmit, npm test 34/34, npm run build]
audit_ref: docs/AI_RUNBOOK.md, docs/ARCHITECTURE.md
date: 2026-06-04
summary: MT-8. Cooling period lazy-activation in Repository.getPaymentDetails triggers activateEligibleBankChangeRequests when coolingEndsAt <= now and status=approved. Added Repository.getOperatorAuditLog with RBAC (operator owner or admin). Reusable AuditLogView component with maxEntries prop for operator settings. Operator /settings/payment-details page shows last 5 own bank audit entries. Admin /bank-changes/[id] page uses Repository.getOperatorAuditLog for full operator audit log. 2 new unit tests cover lazy-activation and getOperatorAuditLog RBAC.
```

```yaml
id: DONE-E2E-BANK-TESTS
evidence_commit: MT7-E2E-BANK-TESTS
checks_run:
  [tsc --noEmit, npm test 34/34, npm run build, playwright 18/18 all browsers]
audit_ref: docs/AI_RUNBOOK.md, docs/PHASE_2_AUDIT.md
date: 2026-06-04
summary: MT-7. Single E2E spec e2e/bank-payment.spec.ts with 4 serial tests covering operator change request + admin approve + cooling period, payment instructions after BookingIntent creation, admin reject with required reason, and operator cancel. 18/18 Playwright tests pass across chromium/firefox/webkit (flow + catalogue + bank-payment). No regressions. Uses getByTestId and getByRole with exact match for disambiguation. Each test clears localStorage for deterministic seeded state.
```

---

## 7. COPY-PASTE API PROMPT

Send this verbatim to any AI (Claude, Kimi, GPT-4o, Gemini) to initiate a work session:

```
You are a developer for KaabaTrip.

Instructions:
1. Read docs/AI_RUNBOOK.md (the entire file).
2. Find the first task in ACTIVE TASKS where:
   a. status is READY
   b. your role matches primary_owner_role or supporting_roles
   c. all items in dependencies are listed in COMPLETED or match a shipped commit hash
3. Update that task block: set status to IN_PROGRESS, add claimed_by with your model name, add claimed_at with today's ISO date.
4. Implement the task. Stay within allowed_scope. Meet every item in acceptance_criteria.
5. Run all checks_required. Fix any failures before proceeding.
6. When all checks pass, move the task block from ACTIVE TASKS to COMPLETED. Fill in evidence_commit, checks_run, phase_audit_entry, docs_updated.
7. Update all files listed in docs_to_update.
8. Update docs/AI_RUNBOOK.md itself with the completed move.
9. Stop. Do not push. The human will review and push.

Hard constraints (never violate):
- Pay-operator-direct only. KaabaTrip holds no funds.
- No guarantees, no refund promises, no "fully vetted" language.
- Operators are source of truth. Missing values → "Not provided". Never infer.
- Bank details: never email, never show without BookingIntent gate, change-control required for updates.
- Reuse existing UI tokens. WCAG 2.1 AA. No hardcoded colours.
- Compare: max 3 Comparable items only.
```
