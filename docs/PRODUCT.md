# Product Canon (KaabaTrip)

## Vision

Build a trusted, comparison-first platform for Umrah/Hajj pilgrimage travel. Two sides:

- **Travellers:** Search, compare, shortlist, express booking intent.
- **Operators/Agents:** List packages, respond to leads, track performance.

Goal: become the default comparison layer for pilgrimage travel.

## Primary users

### Traveller (buyer)

- UK/EU/UAE-based Muslim planning Umrah or Hajj
- Browses on mobile (60%+ expected traffic)
- Wants: clear pricing in their local currency, hotel proximity, transparent inclusions, save and compare 2-3 options
- Pain: packages presented as PDFs/WhatsApp messages, hard to compare, mobile experience broken

### Operator/Travel Agent (supply)

- Small-to-medium operator, 1-20 staff
- Has packages in brochure/spreadsheet format
- Wants: simple listing, visibility into interest, respond to leads
- Pain: no standard format, no conversion visibility, manual follow-up

## Current milestone: Catalogue Lite + Booking Intent

No payment gateway yet. Success means:

1. Traveller submits preferences → sees matching packages → shortlists → compares → expresses booking intent
2. Operator lists packages → packages appear in search → operator sees leads
3. Lead captured with package context attached

## Localisation (new requirement)

- **Currency:** Based on user's detected location. UK = GBP, France = EUR, UAE = AED.
- **Language:** English (default), French, Arabic. User can switch via header control.
- **Results context:** Show airports, flight routes, and agent info relevant to the user's region.
- **Direction:** Arabic is RTL. Layout must support bidirectional text.
- See `docs/I18N.md` for full specification.

## Scope boundaries

### In scope (now)

- Public search flow: `/`, `/umrah`, `/search/packages`, `/packages/[slug]`
- Shortlist + compare (2-3 items, modal)
- Booking intent capture (no payment)
- Operator package CRUD
- Basic operator analytics
- Localisation: currency detection, 3 languages, language switcher

### In scope (next milestone)

- Operator onboarding + verification
- Lead inbox for operators
- Promoted listings (revenue model)

### Out of scope

- Payment gateway
- Scraping competitor sites
- WhatsApp/phone automation
- Self-serve operator verification (manual review first)
- Claims of guaranteed availability or final pricing

## Data policy

- Operators are the source of truth for package data.
- If data is missing, show "Not provided" — never guess.
- Notes are plain text only (no HTML).
- Price must declare type (`exact` vs `from`) and currency.

## Geography

- Default launch: UK-first (GBP, English).
- Multi-region: EU (EUR, French), UAE (AED, Arabic).
- Multi-currency conversion using static rates initially.

## Operator onboarding policy

- Invite-only initially.
- "Verified" status defined and displayed before public launch.
