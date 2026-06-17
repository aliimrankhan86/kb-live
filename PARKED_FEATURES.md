# PARKED FEATURES

**The register of features that are switched off but kept in the codebase, never deleted.**

**Status:** Active register. Created June 2026.
**Governed by:** `PILGRIMCOMPARE_PROJECT_DIRECTION.md` (section 4). That file wins on any conflict.

---

## What "parked" means

A parked feature is real, paid-for work that we are not using right now but do not want to lose. It is switched off behind a feature flag so pilgrims and operators never see it, while the code stays intact and reversible. We park rather than delete so the effort is preserved and any feature can be brought back later with a flag change, not a rebuild.

**Standing rules (also in `AI_NOTES.md`):**

- Parked code is **never deleted**.
- Parked code is **never re-enabled without the founder's explicit instruction**.
- Every parked feature is **recorded here** and noted in `AI_NOTES.md`.
- Claude Code confirms the exact flag name and file paths for each entry when it implements the switches (Task 1 in the direction file), and corrects the "controlling flag" and "where it lives" fields below to match the real code.

---

## How the flags work

Both flags are **server-side environment variables**, read at runtime in `lib/config.ts`. They default to **OFF** when the variable is unset or anything other than the string `true`. Never read these flags in client components — they are evaluated on the server and passed down as boolean props (same rule as `FEATURE_FEATURED_SLOTS`).

| Flag (env var) | Helper in `lib/config.ts` | Default | Turns ON with |
|---|---|---|---|
| `FEATURE_BOOKING_FLOW` | `isBookingFlowEnabled()` | OFF | `FEATURE_BOOKING_FLOW=true` |
| `FEATURE_RFQ_QUOTE` | `isRfqQuoteEnabled()` | OFF | `FEATURE_RFQ_QUOTE=true` |

In the Playwright E2E suite both flags are forced ON via `playwright.config.ts` (`webServer.env`) so the parked flows are still exercised end-to-end and proven intact/reversible. The live preview and production read the real (unset → OFF) environment.

---

## The register

### 1. Booking-intent / bank-details / payment-evidence flow

- **What it does:** after a pilgrim enquired, it walked them toward a booking and displayed the operator's bank details for direct payment, with a payment-evidence upload step.
- **Why parked:** it is the main cause of the broken "asked the same thing twice" journey, and showing bank details while guiding a user toward payment adds legal exposure by making the platform look like a booking agent. Our entire positioning is that we never touch the booking or the money.
- **Status:** OFF.
- **Controlling flag:** `FEATURE_BOOKING_FLOW` (env var) → `isBookingFlowEnabled()` in `lib/config.ts`. Default OFF.
- **Where it lives (gated, not deleted):**
  - `components/request/RequestDetail.tsx` — "Proceed direct" button (`BookableButton`), the booking dialog, the payment-evidence upload, `PaymentInstructions` (operator bank details). Hidden when `bookingEnabled` prop is false.
  - `app/requests/[id]/page.tsx` — passes `bookingEnabled={isBookingFlowEnabled()}` to `RequestDetail`.
  - `app/requests/[id]/confirmation/page.tsx` — `notFound()` when the flag is off.
  - `app/api/booking-intents/route.ts` — `POST` returns 404 when the flag is off (server-side guard).
  - Supporting code kept untouched: `components/request/PaymentInstructions.tsx`, `app/api/outcomes/[intentId]/route.ts`, `lib/api/repository.ts` booking-intent methods, the `BookingIntent` / `PaymentDetails` Prisma models.
- **How to re-enable:** set `FEATURE_BOOKING_FLOW=true` and restore the booking step in the pilgrim journey. Re-check legal exposure first against `PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md`.

### 2. Multi-step RFQ (request-for-quote) engine

- **What it does:** asked pilgrims to re-enter trip type, departure airport, duration, hotel rating and budget to "request a quote", then collected operator offer prices for the pilgrim to compare.
- **Why parked:** it re-asks information the package already states, which defeats the comparison value proposition, and it depends on operators sending detailed offers through our system, a behaviour they resist. Replaced by the short enquiry form in the canonical journey.
- **Status:** OFF.
- **Controlling flag:** `FEATURE_RFQ_QUOTE` (env var) → `isRfqQuoteEnabled()` in `lib/config.ts`. Default OFF.
- **Where it lives (gated, not deleted):**
  - `app/quote/page.tsx` — the multi-step `QuoteRequestWizard` route; `notFound()` when the flag is off.
  - `app/api/quote-requests/route.ts` — `POST` returns 404 when the flag is off (server-side guard).
  - `components/packages/PackageDetail.tsx` — "Request quote" CTAs (desktop + mobile) hidden when `rfqEnabled` prop is false; `app/packages/[slug]/page.tsx` passes `rfqEnabled={isRfqQuoteEnabled()}`.
  - `/quote` entry links also gated when the flag is off: `components/layout/Header.tsx` + `components/layout/Footer.tsx` (props threaded from `app/layout.tsx`), `components/marketing/CityCorridor.tsx`, `app/umrah/ramadan/page.tsx`, `app/umrah/cost/page.tsx`.
  - Supporting code kept untouched: `components/quote/QuoteRequestWizard.tsx` and `components/quote/steps/*`, `lib/quote-prefill.ts`, `components/request/ComparisonTable.tsx`, the `QuoteRequest` / `Offer` Prisma models.
- **How to re-enable:** set `FEATURE_RFQ_QUOTE=true` and the wizard, its links, and the package-page CTA reappear automatically.

### 3. Self-serve operator onboarding wizard

- **What it does:** let operators register themselves and enter their own packages.
- **Why parked:** small Umrah operators run on WhatsApp and brochures and will not self-serve. The model is concierge onboarding: the operator sends a brochure, the founder builds the verified profile, the operator approves in one message.
- **Status:** OFF — hidden from public navigation and the public flow (2026-06-17). Previously *described* as parked, but the `/partner` page still linked it three times; those CTAs are now removed and the route is flag-guarded.
- **Controlling flag:** `FEATURE_OPERATOR_SELF_SERVE` (`lib/config.ts`, default **OFF**; server-side accessor `isOperatorSelfServeEnabled()`). Never read client-side.
- **Where it lives / how it's hidden:**
  - `app/operator/onboarding/page.tsx` — server guard `if (!isOperatorSelfServeEnabled()) notFound()` → the wizard route 404s when off. Belt-and-braces: `/operator/onboarding` is *also* role-gated by `middleware.ts` (`ROLE_PROTECTED['/operator/']`), so an unauthenticated visitor is redirected to `/` regardless of the flag.
  - `app/partner/page.tsx` — the three "Apply as an Operator" CTAs (→ `/operator/onboarding`) replaced with a concierge contact (`mailto:operators@pilgrimcompare.co.uk`); the "How to get listed" step-1 copy now says *get in touch*, not "complete the registration form".
  - `app/auth/confirm/route.ts` — a confirming operator is routed to `/operator/dashboard` (not the parked onboarding route) when the flag is off.
  - **Kept untouched (parked, never deleted):** `components/operator/OperatorRegistrationForm.tsx`, its step components, `app/operator/onboarding/status/page.tsx`, `OnboardingVerifiedBanner`.
  - `playwright.config.ts` forces `FEATURE_OPERATOR_SELF_SERVE=true` so the existing E2E still exercises the parked wizard (same convention as the RFQ/booking flags).
- **How to re-enable:** set `FEATURE_OPERATOR_SELF_SERVE=true` and re-add the `/partner` CTAs — the route renders again automatically.

### 4. Success fee (£75 per completed booking) as the primary revenue model

- **What it does:** charged operators a flat fee per completed booking, tracked by reference code.
- **Why parked:** it is structurally uncollectable. We never see the booking, operators close off-platform on WhatsApp, and they will under-report. The monetisation model is per-lead and subscription instead (direction file section 5).
- **Status:** PARKED as the primary model. May exist only as an optional voluntary arrangement if a specific operator prefers it.
- **Controlling flag:** not built as a billing mechanism yet; do not build success-fee billing without founder approval.
- **How to re-enable:** founder decision only, and only as an optional per-operator arrangement, never as the default.

### 5. Multi-package shortlist enquiry

- **What it does:** would let a pilgrim shortlist several packages and send one enquiry across multiple operators at once.
- **Why parked:** added complexity. The current model is one package, one enquiry, one operator at a time, which is simpler and easier to trust.
- **Status:** NOT BUILT. Logged as a future enhancement, not a parked-but-coded feature.
- **How to enable:** build as a scoped enhancement once the core one-at-a-time model is proven and operators are paying.

---

## Change log

- June 2026: register created. Entries 1 to 4 to be switched off in code by Claude Code in Tasks 1 and 5 of the direction file; entry 5 logged as a future enhancement. Claude Code to update the controlling-flag and file-path fields to match the real implementation when those tasks run.
- June 2026 (Task 1): entries 1 and 2 switched off in code. Flags `FEATURE_BOOKING_FLOW` (`isBookingFlowEnabled()`) and `FEATURE_RFQ_QUOTE` (`isRfqQuoteEnabled()`) added to `lib/config.ts`, both default OFF. Controlling-flag and file-path fields above corrected to the real implementation. No code deleted. Entries 3, 4, 5 unchanged (3 is Task 5).
