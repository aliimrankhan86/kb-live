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
1. MT8-COOLING-AUDIT-LOG (depends on MT4)

### Backend
1. MT8-COOLING-AUDIT-LOG (depends on MT4)
2. P1-EVIDENCE-BYTES
3. P1-PERSISTENCE-MIGRATION

### Frontend
1. MT4-ADMIN-BANK-REVIEW ← highest priority READY now
2. MT5-CUSTOMER-PAYMENT-INSTRUCTIONS
3. MT6-ELIGIBILITY-GATING
4. P0-COMPLAINTS-FLOW
5. P1-SEO-CORRIDORS

### UX
1. MT4-ADMIN-BANK-REVIEW
2. MT5-CUSTOMER-PAYMENT-INSTRUCTIONS
3. P0-COMPLAINTS-FLOW

### QA
1. MT7-E2E-BANK-TESTS (depends on MT4 + MT5 + MT6)
2. P0-HYGIENE-ARTEFACTS

### SEO
1. P1-SEO-CORRIDORS

### Partnerships / Supply
No READY tasks currently. Monitor P0-COMPLAINTS-FLOW for operator routing spec.

### Business Analyst
1. P0-COMPLAINTS-FLOW (spec the operator-routing and admin-triage rules)
2. P2-PKG-CSV

---

## 4. PENDING TASKS SUMMARY

```
MT4-ADMIN-BANK-REVIEW          Admin UI approve/reject bank change requests
MT5-CUSTOMER-PAYMENT-INSTR     Customer in-app payment instructions gated by BookingIntent
MT6-ELIGIBILITY-GATING         Wire "Book now" CTA to operator bookability check
MT8-COOLING-AUDIT-LOG          Cooling period display + operator audit log view
MT7-E2E-BANK-TESTS             Playwright E2E for bank onboarding + payment instruction flows
P0-COMPLAINTS-FLOW             Complaints routing: customer → operator → admin triage
P0-HYGIENE-ARTEFACTS           Remove duplicate docs dirs, gitignore .next artefacts
P1-EVIDENCE-BYTES              Evidence file bytes storage with RBAC + retention
P1-PERSISTENCE-MIGRATION       Replace localStorage with server persistence for beta
P1-SEO-CORRIDORS               Budget Umrah corridor pages (London / Birmingham / Manchester)
P2-PKG-CSV                     CSV import/export for operator packages
```

---

## 5. ACTIVE TASKS

```yaml
id: MT4-ADMIN-BANK-REVIEW
priority: P0
status: READY
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
  - Queue list view renders pending BankChangeRequest records with operator name, submitted date, status badge, Review link
  - Detail view shows before/after snapshot table with semantic th[scope=col] headers
  - Approve action: confirmation dialog shows coolingEndsAt date, calls Repository.approveBankChangeRequest, writes AuditLogEntry
  - Reject action: reason textarea aria-required=true, min 10 chars enforced client and Repository side, calls Repository.rejectBankChangeRequest
  - Approve and reject buttons have distinct aria-label values
  - data-testid approve-btn, reject-btn, review-reason, change-request-before, change-request-after present
  - tsc --noEmit passes
  - npm test passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - QA.md
  - docs/SECURITY.md
evidence_required: commit hash + QA.md entry
```

```yaml
id: MT5-CUSTOMER-PAYMENT-INSTR
priority: P0
status: READY
primary_owner_role: Frontend
supporting_roles: [UX, Backend]
goal: Build PaymentInstructions component gated by BookingIntent ownership + Verified operator eligibility, shown in-app only.
dependencies: [a8eee55]
allowed_scope:
  - components/request/PaymentInstructions.tsx
  - app/requests/[id]/page.tsx
  - tests/payment-instructions.test.ts
acceptance_criteria:
  - Repository.getPaymentInstructions gate enforced — Listed operator returns holding message not bank details
  - Customer without matching BookingIntent gets holding message not bank details
  - Verified operator with matching BookingIntent shows accountHolderName, sortCode, accountNumber, bankName or "Not provided", referenceCode, pay-operator-direct disclosure
  - bankDetailsRecentlyUpdatedWarning banner shown when flag is true; role=alert; icon aria-hidden=true
  - Pay-operator-direct disclosure text matches required copy exactly
  - Never rendered server-side in a way reachable by email paths
  - data-testid payment-instructions, recently-updated-warning, payment-disclaimer, bank-account-holder, bank-sort-code, bank-account-number present
  - tests/payment-instructions.test.ts passes
  - tsc --noEmit passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm test tests/payment-instructions.test.ts
  - npm run build
docs_to_update:
  - QA.md
  - docs/00_PRODUCT_CANON.md
evidence_required: commit hash + QA.md entry
```

```yaml
id: MT6-ELIGIBILITY-GATING
priority: P0
status: READY
primary_owner_role: Frontend
supporting_roles: [Backend]
goal: Wire "Book now" / proceed-to-BookingIntent CTAs to Repository.isOperatorBookable so Listed or suspended operators cannot initiate bookings.
dependencies: [a8eee55]
allowed_scope:
  - components/search/PackageCard.tsx
  - components/request/RequestDetail.tsx
  - tests/operator-eligibility.test.ts
acceptance_criteria:
  - PackageCard "Book now" CTA disabled with aria-disabled=true and tooltip "Verification in progress" when operator not bookable
  - Offer card in RequestDetail same gating applied
  - Verified badge shown only for tier=verified operators; listed operators show no badge
  - Repository.createBookingIntent still enforces gate server-side regardless of UI state
  - tests/operator-eligibility.test.ts still passes with no regressions
  - tsc --noEmit passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm test tests/operator-eligibility.test.ts
  - npm run build
docs_to_update:
  - QA.md
  - docs/ARCHITECTURE.md
evidence_required: commit hash + QA.md entry
```

```yaml
id: MT8-COOLING-AUDIT-LOG
priority: P0
status: READY
primary_owner_role: Frontend
supporting_roles: [Architect, Backend]
goal: Surface cooling period lazy-activation and render operator-facing audit log for bank detail events.
dependencies: [a8eee55, MT4-ADMIN-BANK-REVIEW]
allowed_scope:
  - lib/api/repository.ts
  - components/operator/AuditLogView.tsx
  - app/operator/settings/payment-details/page.tsx
  - app/admin/bank-changes/[id]/page.tsx
acceptance_criteria:
  - On Repository.getPaymentDetails, lazy-activation fires when coolingEndsAt <= now and status=approved
  - AuditLogView component renders entries reverse-chronologically with date, actor, action columns
  - Operator settings page shows last 5 own bank audit entries (own events only, not other operators)
  - Admin detail page shows full audit log for the operator under review
  - tsc --noEmit passes
  - npm test passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - docs/AI_RUNBOOK.md
  - docs/ARCHITECTURE.md
evidence_required: commit hash
```

```yaml
id: MT7-E2E-BANK-TESTS
priority: P0
status: READY
primary_owner_role: QA
supporting_roles: [Frontend]
goal: Add Playwright E2E test specs covering bank onboarding, payment instructions access, and change-control cooling flow.
dependencies: [MT4-ADMIN-BANK-REVIEW, MT5-CUSTOMER-PAYMENT-INSTR, MT6-ELIGIBILITY-GATING]
allowed_scope:
  - e2e/bank-onboarding.spec.ts
  - e2e/payment-instructions.spec.ts
  - e2e/bank-change-control.spec.ts
acceptance_criteria:
  - e2e/bank-onboarding.spec.ts covers operator add flow, phone OTP, admin reject, operator cancel
  - e2e/payment-instructions.spec.ts covers Verified gate pass, Listed gate block, no-BI block, recently-updated warning
  - e2e/bank-change-control.spec.ts covers submit change, approve, cooling banner, second change blocked during cooling
  - All new specs pass on chromium
  - No regressions on e2e/flow.spec.ts
  - Selectors use getByTestId or getByRole with name — no brittle CSS selectors
checks_required:
  - npx playwright test e2e/bank-onboarding.spec.ts
  - npx playwright test e2e/payment-instructions.spec.ts
  - npx playwright test e2e/bank-change-control.spec.ts
  - npx playwright test e2e/flow.spec.ts
docs_to_update:
  - QA.md
evidence_required: commit hash + all playwright specs passing
```

```yaml
id: P0-COMPLAINTS-FLOW
priority: P0
status: READY
primary_owner_role: Frontend
supporting_roles: [UX, Business Analyst, Backend]
goal: Add a basic complaints/dispute routing flow — customer submits complaint, system routes to operator, admin can triage — with no refund promises anywhere in copy or logic.
dependencies: []
allowed_scope:
  - lib/types.ts
  - lib/api/mock-db.ts
  - lib/api/repository.ts
  - components/request/ComplaintForm.tsx
  - app/requests/[id]/page.tsx
  - app/operator/dashboard/page.tsx
acceptance_criteria:
  - Complaint type added to lib/types.ts with fields id, bookingIntentId, customerId, operatorId, status, description, createdAt
  - Status enum: submitted, operator_notified, admin_triage, resolved, closed
  - Customer can submit complaint from their BookingIntent detail view
  - Operator sees complaints on their dashboard (own only — RBAC enforced)
  - Admin sees all complaints (future admin panel stub acceptable in MVP)
  - No copy contains "refund", "guarantee", "KaabaTrip will resolve", or similar
  - Copy must state customer should contact operator directly and KaabaTrip will log and escalate if unresolved
  - tsc --noEmit passes
  - npm test passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - QA.md
  - docs/SECURITY.md
  - docs/00_PRODUCT_CANON.md
evidence_required: commit hash + QA.md entry
```

```yaml
id: P0-HYGIENE-ARTEFACTS
priority: P0
status: READY
primary_owner_role: QA
supporting_roles: []
goal: Remove duplicate docs/_archive 2 and docs/skills 2 directories from the repo and ensure .next build artefacts are gitignored.
dependencies: []
allowed_scope:
  - docs/_archive 2/
  - docs/skills 2/
  - .gitignore
acceptance_criteria:
  - docs/_archive 2/ removed from repo (git rm -r)
  - docs/skills 2/ removed from repo (git rm -r)
  - .gitignore includes .next/ entry (add if absent)
  - git status shows clean working tree after removal
  - npm run build passes after cleanup
checks_required:
  - git status
  - npm run build
docs_to_update: []
evidence_required: commit hash
```

```yaml
id: P1-EVIDENCE-BYTES
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Implement actual file byte storage for payment evidence uploads with RBAC enforcement and a defined retention policy.
dependencies: [c8c1774]
allowed_scope:
  - lib/api/repository.ts
  - lib/api/mock-db.ts
  - lib/types.ts
  - components/request/RequestDetail.tsx
acceptance_criteria:
  - BookingPaymentEvidence can store file bytes (base64 or blob URL) in addition to metadata
  - RBAC: only customer, involved operator, admin can read evidence bytes
  - Retention policy defined in types/docs: delete after 90 days unless dispute flag set
  - storageStatus field reflects actual storage state (metadata-only vs bytes-stored)
  - tsc --noEmit passes
  - npm test passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - docs/ARCHITECTURE.md
  - docs/SECURITY.md
  - docs/00_PRODUCT_CANON.md
evidence_required: commit hash + ARCHITECTURE.md update
```

```yaml
id: P1-PERSISTENCE-MIGRATION
priority: P1
status: READY
primary_owner_role: Backend
supporting_roles: [Architect]
goal: Replace localStorage-based MockDB with a server-side persistence layer (Postgres or similar) suitable for private beta.
dependencies: [a8eee55]
allowed_scope:
  - lib/api/mock-db.ts
  - lib/api/repository.ts
  - lib/api/db/ (new)
  - app/api/ (new route handlers)
acceptance_criteria:
  - Repository interface unchanged — only lib/api/ internals change
  - All existing unit tests pass against the new persistence layer
  - Auth middleware wired to operator and customer routes
  - Server-side sessions replace localStorage session simulation
  - Seed data migrated to a SQL seed script
  - tsc --noEmit passes
  - npm test passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - docs/ARCHITECTURE.md
  - docs/SECURITY.md
evidence_required: commit hash + ARCHITECTURE.md migration section updated
```

```yaml
id: P1-SEO-CORRIDORS
priority: P1
status: READY
primary_owner_role: SEO
supporting_roles: [Frontend]
goal: Create SEO corridor pages for high-intent search terms Budget Umrah from London, Birmingham, and Manchester.
dependencies: []
allowed_scope:
  - app/umrah/london/page.tsx
  - app/umrah/birmingham/page.tsx
  - app/umrah/manchester/page.tsx
  - app/sitemap.ts
acceptance_criteria:
  - Three static pages created with unique h1, meta title, and meta description per city
  - Each page links to /search/packages with pre-filled query params (type=umrah, departureCity=...)
  - Pages included in sitemap.ts
  - No scraped or fabricated operator data — content uses product-owned copy only
  - No claims of "best price" or "guaranteed availability"
  - Lighthouse performance score >= 90 on mobile
  - tsc --noEmit passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm run build
docs_to_update:
  - docs/SEO.md
evidence_required: commit hash + sitemap.ts updated
```

```yaml
id: P2-PKG-CSV
priority: P2
status: READY
primary_owner_role: Frontend
supporting_roles: [Backend, Business Analyst]
goal: Add CSV import and export for operator packages to speed up bulk onboarding.
dependencies: [a8eee55]
allowed_scope:
  - components/operator/PackageCsvImport.tsx
  - components/operator/PackageCsvExport.tsx
  - app/operator/packages/page.tsx
  - lib/api/repository.ts
acceptance_criteria:
  - Export: operator can download all their packages as a CSV from /operator/packages
  - Import: operator can upload a CSV; rows are validated against Package type before saving
  - Invalid rows reported back to operator with row number and reason — not silently skipped
  - RBAC: operator can only import/export their own packages
  - tsc --noEmit passes
  - npm test passes
  - npm run build passes
checks_required:
  - npx tsc --noEmit
  - npm test
  - npm run build
docs_to_update:
  - QA.md
  - docs/ARCHITECTURE.md
evidence_required: commit hash + QA.md entry
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
