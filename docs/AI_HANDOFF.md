# KAABATRIP AI HANDOFF DIGEST v1.2

This is the token-optimised constraint digest for AI agents. Treat it as binding, but keep `docs/00_PRODUCT_CANON.md` as the product policy source of truth.

## Constraints

- C1 MVP: pay-operator-direct only. KaabaTrip holds zero customer funds.
- C2 No guarantees. Operator is contracting party, not KaabaTrip.
- C3 Operators are source of truth. Missing values -> "Not provided". Never infer or default.
- C4 Compare: only "Comparable" items can be compared (max 3). Incomplete items -> Assisted Quote only.
- C5 Verified claims require evidence. No implied guarantees or "fully vetted".
- C6 Marketing: explicit opt-in only. Service messages: zero promos.
- C7 UI/UX: reuse existing theme tokens/patterns from codebase. WCAG 2.1 AA. Fast mobile.

## Core flows

- F1 Quote rail: QuoteRequest -> Offer -> Compare (max 3) -> BookingIntent.
- F2 Catalogue: Browse Packages -> Compare (max 3) -> Quote or BookingIntent.
- F3 BookingIntent: unique referenceCode, payment handoff, evidence upload (image/PDF + optional text), skip requires explicit acknowledgement.
- F4 Operator confirms payment status within 48h. Outcome required. Non-compliance affects routing/ranking.

## Trust and safety

- T1 Tiers: Listed / Verified / Verified Plus (future only).
- T2 Bank details: captured in controlled onboarding. Changes allowed only via change-request + cooling period + audit log + manual review.
- T3 Complaints: customer -> operator first. KaabaTrip logs + routes + escalates. No refund promises in MVP.

## Data and privacy

- D1 Evidence uploads: RBAC = customer + involved operator + admin only.
- D2 Evidence retention: delete after defined period unless active dispute. Store metadata longer only if needed.
- D3 Never email bank details or evidence. Emails link to in-app view.

## Non-goals (MVP)

- N1 No KaabaTrip-held payments/escrow/chargebacks.
- N2 No competitor scraping.
- N3 No automated WhatsApp follow-ups in MVP.

## Key clarifications

- K1 Phase status SSOT: single enum, no inline strings or redefinitions.
- K2 BookingIntent.referenceCode is unique and immutable once issued.
- K3 skipProofAcknowledged flag required when proof is skipped.
- K4 Flagged operators (missed 48h confirm SLA) are demoted or excluded from high-intent routing.
- K5 "Not provided" is display-only, never fallback computation.
- K6 Only Comparable items can be added to Compare. Assisted items must be excluded at type + runtime.

## Latest shipped behaviour

- Commit `c8c1774` shipped BookingIntent reference codes generated as `KT-...`.
- New BookingIntent records receive a unique `referenceCode`; `MockDB.saveBookingIntent` rejects duplicate or changed reference codes.
- `paymentEvidence` is metadata-only in MVP. No uploaded file bytes are stored.
- Evidence metadata accepts image/PDF file metadata plus optional payer name, operator payment reference, and note.
- If proof is skipped, the UI requires explicit acknowledgement and Repository records `skipProofAcknowledged` plus `proofSkippedAt`.
- Payment handoff UI must show the pay-operator-direct disclosure. KaabaTrip must not collect, hold, transfer, or imply control over customer funds.
- BookingIntent/evidence access is restricted through Repository RBAC to the customer, involved operator, and admin.
- Operator payment confirmation within 48h is a binding product requirement, but no UI/repository enforcement is shipped yet.

## Required copy

Pay-operator-direct disclosure:

> You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.

Skip-proof acknowledgement must include:

> KaabaTrip does not have access to the operator’s payment records… ability to help evidence payment may be limited… This does not remove legal rights…

## Red flags

- Organiser, merchant-of-record, checkout, invoice, escrow, chargeback, or KaabaTrip-branded package language.
- Any phrase: "guarantee", "we ensure", "KaabaTrip promises", "risk-free", "full refund".
- Operator data rendered by inference, fallback defaults, or `|| default` instead of "Not provided".
- Refund promises or complaint handling copy that suggests KaabaTrip decides refunds in MVP.
- Bank details editable without change-control gate, cooling period, audit log, and manual review.
- Marketing message sent without opt-in check, or promo content inside service messages.
- Hardcoded colours/spacing in UI components instead of existing tokens/patterns.
- Compare accepts more than 3 items or any non-Comparable item.
- Evidence upload stored or accessible outside strict RBAC.
