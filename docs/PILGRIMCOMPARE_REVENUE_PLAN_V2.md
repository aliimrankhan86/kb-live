# PilgrimCompare Revenue Plan v2 — Research-Adjusted Commercial Model

**June 2026. Replaces Section 2 of the master plan. Adjusted for the DMCC Act 2024, Package Travel Regulations 2018, and ATOL boundaries researched June 2026. Every revenue line below is structured to stay outside the Section 14 red lines in PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md.**

---

## 1. What changed and why

Three research findings reshape the model:

1. **"Priority placement" as promised to founding operators is non-compliant as worded.** Undisclosed paid or commercially incentivised ranking is a Schedule 20 banned practice with no need for the CMA to prove anyone was misled. The benefit is reframed below; the economics survive, the wording does not.
2. **The parked Phase 3 (merchant of record, 3 to 8% commission) stays permanently parked, but its economics do not.** A per-completed-booking success fee, invoiced B2B to the operator and never touching customer money, delivers commission-class revenue with none of the ATOL, PTR organiser, or merchant-of-record exposure. This becomes the real Phase 3. The Regulations bite on who takes payment and concludes the travel contract; a referral fee on an outcome the operator reports does neither.
3. **The BookingOutcome dataset is now the single most commercially valuable asset in the codebase.** It was already planned as "the future billing dataset"; under the success-fee model it is the billing dataset for the highest-margin revenue line. Its integrity gets explicit protections (Section 5 below).

## 2. The three phases, adjusted

### Phase 1 (now to ~month 6): Free Founding Operator tier — reworded benefits, same offer

Free 12-month listing, verified badge, concierge onboarding. The placement benefit is restructured to be both compliant and more honest:

- **Old promise:** "priority placement" (silent ranking boost: banned).
- **New promise:** "We build your profile to rank at its best." Default ranking is neutral and disclosed (completeness, response rate, price recency). Concierge onboarding legitimately maximises a founding operator's completeness score, and the 48-hour SLA maximises response rate. Founding operators win the neutral ranking by being genuinely better listings, which is also true and sellable: "We do the work that makes you rank well."
- **Plus:** a "Founding Operator" badge variant, and first refusal on Featured slots when those launch (Phase 2), at founding rates locked into the agreement.

The founding agreement (one page) must now include: future pricing terms, booking-outcome reporting obligation against reference codes, accuracy warranty on supplied content, consent to ranking disclosure rules, and consent to the success-fee mechanism in Phase 3 with the percentage/flat rate stated. **Getting Phase 3 consent signed now, while the listing is free, is the highest-leverage commercial act in the whole plan.** Operators sign easily for a free service; renegotiating fee consent after they depend on the channel is far harder.

### Phase 2 (trigger: 150+ enquiries/month OR 8+ live operators): the compliant monetisation stack

Three lines, launched in this order:

1. **Qualified enquiry fee: £10 per qualified enquiry** (band £8 to £15, test upward). "Qualified" defined contractually: unique customer, valid contact details, not a duplicate of the same customer to the same operator within 30 days, not flagged as spam. Billed monthly in arrears on PilgrimCompare's own enquiry data with a per-enquiry log the operator can audit. Unit economics for the operator: average Umrah package £900 to £1,400 per person, typical group 3 to 5 people, so a converted booking is £3,000 to £6,000 of revenue; at a conservative 8% enquiry-to-booking conversion, £10 a lead is a cost of ~£125 per booking won. Easy yes for any operator doing real volume.
2. **Subscription alternative: £79/month including 12 qualified enquiries, then £8 each.** Operators who hate variable bills pick this; it also smooths PilgrimCompare's revenue. Keep exactly two options. More tiers at this scale is decoration.
3. **Featured slots: £49/month per corridor page, max 2 slots per list view, labelled "Featured" at the slot, excluded from the neutral default sort.** Launch only after enquiry billing is stable; it is the smallest line and the easiest to get wrong.

Weekly digest emails remain the conversion engine: every free operator sees their views and enquiries in numbers every week, so the paid conversation is "keep what you already get".

### Phase 3 (trigger: outcome-reporting loop proven over 90+ days with 2+ operators): booking success fee

**£75 flat per completed booking** (or 2% of booking value where the operator self-reports value; flat fee is recommended because it removes any argument about value verification). Invoiced B2B monthly against BookingOutcome records tied to reference codes. Customers are never charged, never pay PilgrimCompare, and the operator remains the sole organiser and merchant. This is the standard introducer model used across UK lead-generation; it requires no ATOL, no PTR organiser status, and crosses none of the Section 14 red lines.

Operators on the success fee get enquiry fees waived (one or the other, never both, to keep incentives clean and the pitch simple: "pay only when you win the booking").

**Merchant of record / escrow / holding funds remains permanently out of scope.** If a future investor or partner pushes for it, the answer is a separate regulated workstream, not a feature.

## 3. Revenue model at modest scale (illustrative, not a forecast)

Assumptions deliberately conservative: 15 live operators by month 9, 400 enquiries/month across the platform by month 12, 8% enquiry-to-booking conversion, half of operators on enquiry fees and half migrated to success fee by month 12.

- Enquiry fees: ~200 billable enquiries × £10 = £2,000/month
- Success fees: ~16 completed bookings/month attributable × £75 = £1,200/month
- Featured slots: 6 slots × £49 = ~£300/month
- Total ~£3,500/month run rate by month 12, with the success-fee line scaling fastest as outcome tracking matures.

The number itself matters less than the shape: three independent lines, none requiring payments infrastructure, all billed on data PilgrimCompare already collects.

## 4. Why this is more likely to succeed than v1

1. **The pitch gets stronger, not weaker.** "No operator pays for ranking" is now a consumer-facing trust line AND a legal requirement. PilgrimCompare's whole thesis is trust in a market with a fraud problem; the compliance posture is the marketing.
2. **Success fees align incentives perfectly.** PilgrimCompare only earns when the operator wins a booking, which makes the 48-hour SLA enforcement, outcome follow-ups, and listing quality directly revenue-generating rather than cost centres.
3. **Consent is collected when it is cheapest.** Phase 3 terms signed inside the free founding agreement remove the hardest future negotiation.
4. **No payments infrastructure, ever, on the critical path.** Every competitor that becomes a booking platform takes on ATOL/PTR costs; PilgrimCompare's cost base stays near zero, which at this budget is the difference between surviving to traction and not.

## 5. Protecting the BookingOutcome dataset (now revenue-critical)

Already planned, now prioritised:

1. **Three independent signals per outcome:** operator reporting (contractual obligation), customer follow-up email at day 10 to 14 ("did you complete your booking?"), and PaymentEvidence uploads where customers provide them. Cross-check; discrepancies flag to founder via Telegram.
2. **Under-reporting deterrent in the agreement:** operators warrant accurate outcome reporting; pattern under-reporting (customer confirms, operator does not) is grounds for suspension. State it plainly; never need to use it.
3. **Reference code discipline:** every enquiry and booking intent carries the code; emails repeat it; the customer follow-up asks for it. The code is the audit trail the invoice stands on.
4. **Keep the data clean from day one** even while free: the Phase 3 billing conversation in month 9 is "here are the 14 bookings we sent you, signed for in your agreement", not an argument.

## 6. Lines considered and rejected

- **Travel insurance affiliate/commission:** introducing insurance for commission is potentially an FCA-regulated activity (insurance distribution). Rejected until/unless checked properly; plain editorial links with no commission are fine in trust content.
- **Advertising (display/AdSense):** pennies at this traffic, erodes the trust positioning, and ad content cannot be quality-controlled against the standards file. Rejected.
- **Charging pilgrims:** kills the comparison value proposition and adds consumer-contract complexity. Rejected permanently.
- **Data sales:** obvious GDPR and trust violation. Never.

## 7. Changes to make now (feeds the prompt queue)

1. Update the founding operator agreement template: reworded placement benefit, outcome-reporting obligation, ranking-disclosure consent, Phase 3 success-fee consent with the rate stated.
2. Update outreach message library (master plan section 5): replace "priority placement" with "we build your profile to rank at its best, and founding operators get first refusal on Featured slots at locked founding rates".
3. Implement ranking transparency UI (Prompt Q6): neutral default sort, disclosure line, "How we rank" explainer, Featured label component built now so the Phase 2 launch is a config change, not a build.
4. Treat the outcome follow-up cron (already queued) as revenue infrastructure: it ships before Phase 2 pricing goes live.
