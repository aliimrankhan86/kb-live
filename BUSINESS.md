# PilgrimCompare — Business Plan & Objective

> Portable business context for any AI tool. Pair with `STATUS.md` (progress) and `HANDOFF.md` (cold-start).
> This is the **why**. It rarely changes — update only on real strategy shifts.

## One-liner
A UK-first, comparison-first marketplace connecting pilgrims with **verified** travel operators for Umrah and Hajj packages.

## Problem
Umrah/Hajj booking is opaque: scattered operators, inconsistent pricing, hard-to-verify trust, no easy way to compare like-for-like. Pilgrims overpay or risk unreliable providers.

## Solution — two modes
- **Catalogue listings:** operators publish structured, searchable, comparable, SEO-friendly package pages.
- **Quote-first offers:** travellers submit preferences; operators respond with comparable offers; travellers express booking intent.

## Users
- **Travellers / customers** — browse, search, shortlist, compare up to 3, request quotes, create BookingIntent.
- **Operators / partners** — onboard, manage packages, respond to leads, track intents, update profile/payment, view analytics.
- **Admins** — review operator/bank changes, complaints, reconciliation, sensitive audit flows.

## Business & legal posture (non-negotiable)
- PilgrimCompare is a **marketplace and enquiry system** — not a tour operator, not a payment processor.
- Operators are the source of truth for package content, availability, pricing, fulfilment, payment records.
- PilgrimCompare does **not** collect, hold, transfer, escrow, or invoice customer funds.
- **BookingIntent** = an intent/reference record (`PC-…`), not a payment confirmation or final booking.
- Customer payment is **pay-operator-direct**.
- Trust claims use **stored facts only** (verification status, ATOL/ABTA numbers, company metadata, regions, profile completeness). Never invented. Missing data → shown as "Not provided".

## Scope / market
- MVP: **UK-first, GBP-only**. Multi-currency = future scope.
- Launch corridors: London (LHR/LGW), Birmingham (BHX), Manchester (MAN).
- Compliance: UK GDPR, WCAG 2.2 AA.

## Monetisation (direction)
Operator-side: verified listings + qualified lead/quote flow. (Funds never flow through the platform — value is in discovery, comparison, trust, and lead quality.)

## Canonical product detail
`docs/00_PRODUCT_CANON.md`
