# Product Canon (KaabaTrip)

## Vision

Build a trusted, comparison-first platform for Umrah/Hajj that supports both:

- Catalogue listings (structured packages, SEO-friendly)
- Quote-first offers (operators respond with assisted quotes)

Goal: onboard supply easily while giving customers clarity and confidence.

## Primary users

### End Customer

- Browse and compare
- Request quotes
- Shortlist options
- Proceed via BookingIntent (payments later)

### Travel Operator (Partner)

- Respond to quote requests fast
- List packages (optional catalogue-lite)
- Track booking intents and outcomes

## Success criteria (MVP)

- Customer can request a quote in minutes
- Operator can send a comparable offer quickly
- Customer can compare up to 3 items without ambiguity
- BookingIntent is recorded reliably
- SEO foundations exist without spam indexing

## Current stage

- Phase 1 + 1.1 complete (quote-first + compare + stabilisation + tests)
- Phase 2 pending (catalogue-lite + mixed compare + SEO-lite)

## Scope boundaries (current)

### In scope

- QuoteRequest wizard and Offer response flow
- Operator portal (requests, packages, analytics)
- Catalogue-lite Packages and public pages
- Mixed comparison (Offers + Packages)
- BookingIntent tracking only (no payments)
- SEO-lite: curated pages, package detail pages, sitemap, canonical/noindex rules

### Out of scope (for now)

- Payment gateway integration
- Scraping competitor sites
- Automated WhatsApp/phone follow-ups
- Self-serve onboarding with verification unless explicitly added
- Claims of guaranteed availability or final pricing

## Data and truth policy

- Operators are the source of truth.
- If data is missing, show "Not provided" (never guess).
- Notes are plain text (no HTML).
- Price must declare type (exact vs from) and currency.

## Geography and currency

- Default launch: UK-first, GBP.
- Multi-currency is future scope.

## Operator onboarding policy

- Default: invite-only onboarding initially.
- Verification: define what "verified" means before public launch.

## Legal positioning (initial)

- Marketplace and enquiry system until payments are implemented.
- No guarantees. Final confirmation is with the operator.

## Naming

Project name may change in future, but docs and code refer to "KaabaTrip" for now.
