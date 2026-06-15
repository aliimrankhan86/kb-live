# PILGRIMCOMPARE — PROJECT DIRECTION

**The single source of truth for what this product is, where it is going, and what to build next.**

**Status:** Active and authoritative. Created June 2026.
**Owner:** Ali (founder: strategy, selling, approvals).
**Audience:** This Claude project instance (strategy and prompts), Claude Code and Codex (execution), and the founder.

---

## 0. PRECEDENCE (read this first)

**This file takes precedence over every other document in the project.** Where any other file (master plan, go-live plan, prompt queues, handoffs, revenue plan, language standards) conflicts with this one, **this file wins**, with a single exception: `PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` still governs copy and legal red lines, because those protect the business legally.

**Every Claude Code session must read this file first**, before any other project file, and must not introduce anything that contradicts the direction set out here.

If anything in this file is unclear or appears to conflict with a legal red line, stop and ask the founder rather than guessing.

---

## 1. THE OBJECTIVE (what success actually means, honestly)

PilgrimCompare exists to generate **sustainable recurring revenue** for a time-poor, non-technical solo founder, without consuming years of effort that ends in pulling the plug.

**The honest target, in order:**

1. **Prove operators will pay.** This is the only question that matters right now. Until it is answered, nothing else counts.
2. **Build a sellable asset:** a base of paying operators plus a consented pilgrim email list. The list is the part competitors cannot copy.
3. **Reach a meaningful side income:** roughly £1,000 to £3,000 per month within 12 to 18 months (base case), on about 5 to 8 founder hours per week and under £100 per month of tooling.
4. **Long-term stretch goal:** grow to the point where the product could sustain the founder or replace a day-job income. This is a multi-year, lower-probability goal and must not drive near-term decisions.

**Success is judged by the asset built and the side income earned, not by quitting the day job quickly.** Setting the bar correctly is what keeps this from feeling like a failure.

**The market, in brief (verified):** about 100,000 UK pilgrims travel for Umrah each year; the UK Umrah and Hajj sector is worth roughly £310m including Umrah (Council of British Hajjis / University of Leeds). It is a real, growing, but niche market. A platform capturing a slice of enquiry flow is valuable to operators, but the niche size caps how fast revenue can scale. Hajj is now largely routed through Saudi Arabia's official Nusuk platform and is disintermediated from UK operators, so **Hajj is an email-capture play only, not a transactional product.**

---

## 2. THE DIRECTION (the model in one paragraph)

**PilgrimCompare is a trust-led UK Umrah comparison and lead-generation marketplace.** Pilgrims compare ATOL-verified operator packages side by side, then send a short enquiry about one package. The operator receives a warm lead and contacts the pilgrim directly to quote and close on their own channels (usually WhatsApp). PilgrimCompare never holds funds, never takes bookings, never issues ATOL certificates, and is never the merchant of record. The travel contract is always between pilgrim and operator. PilgrimCompare makes money by charging operators for the leads it sends them, and builds a consented pilgrim email list as its durable core asset.

**What we are:** a trusted comparison surface and a warm-lead feeder into operators' existing sales channels.

**What we are not:** a booking engine, a payment processor, a travel agent, an escrow, or a Hajj transaction platform.

**The wedge is trust.** ATOL-verified operators only, honest "Not provided" instead of guessed data, neutral disclosed ranking with no paid ranking, and an honest "distance to the Haram" feature. Trust is the one thing incumbents and future copycats do not have.

---

## 3. THE ONE PILGRIM JOURNEY (canonical, tap by tap)

This is the only pilgrim journey. Any flow that deviates from this is wrong and must be parked or removed.

1. Pilgrim lands on a corridor or browse page (for example Umrah from London) and sees comparable packages with the decision-relevant details visible.
2. Pilgrim compares two or three packages side by side. Every field that matters for the decision is on screen. **No form is required to compare.**
3. Pilgrim taps **Enquire** on the one package they want.
4. A short enquiry form appears, **pre-filled with the package they are enquiring about**. Fields: name, contact (email and/or phone), optional travel month, optional message. Nothing the package already states is asked again.
5. On the same form, a separate, unticked, optional opt-in: "Email me Umrah and Hajj offers and guides from PilgrimCompare." Submitting the enquiry does not require ticking it.
6. Pilgrim submits. A reference code is issued and a confirmation screen explains: the operator will contact them directly to confirm live price and availability, the pilgrim pays the operator directly, and the reference code is a tracking code, not a payment receipt.
7. The operator receives the lead (email now, WhatsApp later if automated compliantly). The pilgrim and operator continue off-platform.

**The decision fields to lead with, in priority order** (an ordinary pilgrim decides on these): total price (per person, date-stamped, "confirm with operator"); what is included (flights, visa, transfers, both hotels, board basis); dates and duration including the Makkah and Madinah nights split; hotel and distance to the Haram; ATOL verification; operator identity and contact. Everything else is secondary and sits below or behind "more details".

**One package, one enquiry, one operator at a time.** A multi-package shortlist is a parked future enhancement, not part of the current journey.

---

## 4. PARKED FEATURES (switched off, never deleted)

These features represent real, paid-for work. **They are parked, not removed.** Each is switched off behind a feature flag so users never see it, while the code stays intact and reversible. Claude Code must formalise this list in a dedicated `PARKED_FEATURES.md` and must never delete or re-enable any of these without the founder's explicit instruction.

| Parked feature | What it does | Why parked | How to re-enable |
|---|---|---|---|
| Booking-intent / bank-details / payment-evidence flow | After enquiry, walked the pilgrim toward a booking and showed operator bank details | Creates the "asked twice" broken journey and adds legal exposure (looks like acting as a booking agent) | Flip its feature flag on; restore the route in the pilgrim journey |
| Multi-step RFQ quote engine | Asked pilgrims to re-enter trip type, airport, duration, hotel rating, budget to "request a quote", then collected operator offers | Re-asks what the package already states; defeats the comparison USP | Flip its feature flag on; re-link from the package page |
| Self-serve operator onboarding wizard | Let operators register and enter their own packages | Small operators will not self-serve; concierge onboarding is the model now | Remove from nav-hidden state; re-expose route |
| Success fee (£75 per completed booking) as primary model | Charged operators per completed booking, tracked by reference code | Structurally uncollectable: operators close off-platform and will under-report | Keep only as an optional voluntary pilot if an operator prefers it |
| Multi-package shortlist enquiry | Send one enquiry across several packages or operators | Adds complexity; one-at-a-time is simpler and easier to trust | Build as a scoped enhancement when core model is proven |

**Standing rule:** parked code is never deleted, never re-enabled without founder approval, and is always documented in `PARKED_FEATURES.md` and noted in `AI_NOTES.md`.

---

## 5. THE MONETISATION MODEL

**Phase 1 (now): free.** Operators are listed free for a 90-day trial to build supply and prove enquiry volume. No billing code is built yet.

**Phase 2 (after leads are delivered): charge for leads.** Two options, operator's choice:

- **Per qualified lead: £10.** A qualified lead has a real name, a valid contact, and a stated travel month, within the operator's served route, de-duplicated, not spam. This definition must be stored against each lead as both billing evidence and quality control.
- **Subscription: £69 per month** for unlimited qualified leads. This is the recurring revenue we actually want; per-lead is the easier first "yes".

**Phase 3 (parked): the £75 success fee is not the primary model.** It is uncollectable because we never see the booking. Keep it only as an optional voluntary arrangement if a specific operator prefers it.

**The free-to-paid converter is the monthly value digest:** an automated email showing each operator how many enquiries PilgrimCompare sent them. Operators convert when they see the number. Build the lead-counting first; the digest depends on it.

**Pricing guardrails (from the language and legal standards, never break):** never sell ranking; default sort stays neutral and disclosed; any featured placement is clearly labelled, separate from default results, and the feature flag stays OFF until used; free-tier framing is "we build your profile to rank at its best", never "priority placement".

---

## 6. THE PILGRIM EMAIL LIST (the durable asset, built legally)

The email list is the most defensible long-term asset. Build it from day one, cleanly.

- **Consent: explicit, unticked, unbundled opt-in only.** Do not rely on the soft opt-in, because PilgrimCompare is not the merchant of record. The enquiry must submit successfully whether or not the marketing box is ticked.
- **Record consent properly:** timestamp, source, and the exact wording shown, stored against the record. This is a PECR requirement and protects the business.
- **Honour unsubscribes immediately** and keep a suppression list. Re-emailing an opt-out is the most common and most fined breach.
- **Operator (B2B) email is easier:** corporate subscribers do not need prior consent; identify yourself, give an opt-out, stop on request. Treat sole-trader operators as individuals to be safe.
- **Monetise the list later** via clearly labelled sponsored or featured operator sends, affiliate links, and "register interest" campaigns for Hajj 2027 and unserved dates that convert into bundled leads. Never let monetisation compromise the neutral default sort or the trust positioning.

---

## 7. OUTREACH STRATEGY (how the founder wins supply)

Supply is the bottleneck. Zero operators are signed. This is the founder's highest-value work and cannot be automated away. The full message library lives in `PILGRIMCOMPARE_GO_LIVE_DIRECTION_AND_GROWTH_PLAN.md` and `PILGRIMCOMPARE_MASTER_PLAN.md`; use those templates.

**Who, in order:** the four warm specialists first (Al Amanah, Labbaik, Aqdas, Nabil), because Umrah is their core business and they value leads most. Then HIGH-priority operators from the outreach tracker. Generalists last.

**Channel, in order:** WhatsApp first (this market lives there, always manual and personal), Instagram DM second, email third (one follow-up only, then stop), phone or in person for the warmest targets.

**The pitch that validates the business** (this is the key change): offer a free 90-day lead trial **with explicit paid intent stated up front.** For example: "I will send you qualified pilgrim enquiries free for 90 days. If you find them valuable, after that it is £10 per qualified lead or £69 a month for unlimited. You pay nothing now and nothing if the leads are not worth it." The goal of the first conversations is a verbal yes-in-principle to that arrangement. If no warm operator will even agree to a free trial with paid intent, the model itself is in question.

**The promise that sells for you:** concierge onboarding with a 48-hour approval turnaround. The operator sends a brochure or WhatsApp list, you build the verified profile, they approve in one message. Fast, free, done-for-you onboarding is what makes operators recommend you to other operators.

**Objection handling, in one line each:** cost (free for 90 days, then only if it drives real enquiries, you see the numbers first); do you take a cut (no, customers pay you directly, we never touch the money or the booking); my prices change daily (fine, we show an indicative date-stamped price and the enquiry comes to your WhatsApp to quote live); I prefer WhatsApp (perfect, we feed enquiries straight to your WhatsApp); are you legit (we list only ATOL-verified operators and show your ATOL number with a CAA link).

---

## 8. AUTOMATION STRATEGY (reliable, low founder time)

The principle: **automate the boring and repeatable, keep manual the things where a mistake destroys trust.**

**Automate:**

- **Lead capture, logging and counting:** every enquiry logged against the operator it was sent to, with the qualification flag and reason. This is the foundation of both billing and the value digest.
- **Monthly operator value digest:** automated email to each operator with their lead count.
- **Transactional email:** enquiry confirmation to the pilgrim, lead alert to the operator. Use Resend (free up to 3,000 emails per month).
- **Pilgrim marketing email:** newsletter and offers via an ESP with built-in consent and unsubscribe handling. Free tier to start.

**Keep manual (deliberately):**

- **Operator relationships and WhatsApp conversations.** This is where trust is built and there are only a few dozen operators. Do not automate WhatsApp outreach. Meta's 2025 to 2026 rules require prior opt-in and pre-approved templates, ban general AI chatbots on the API, and get numbers banned for unsolicited messaging. Use the free WhatsApp Business App by hand. Add compliant transactional WhatsApp (via an official provider with opt-in templates) only later, once volume justifies it.
- **Verification decisions.** Re-checking ATOL status against the CAA register and Companies House status is the differentiator. Do this by hand quarterly, flag or de-list stale or lapsed operators. Automate only the reminder to do the check, never the trust decision itself.

**The one automation worth building now is the concierge AI ingestion inbox** (paste brochure or text, AI drafts the package, founder reviews, operator approves). It buys back the most founder hours. Everything else automation-wise waits.

**Recommended stack, about £40 to £90 per month:** lead logging and digest via a no-code automation tool (for example Zapier into a sheet or table); transactional email via Resend; marketing email via a simple ESP; verification kept manual on a quarterly reminder.

---

## 9. CLAUDE CODE TASK QUEUE (autonomous, one task per prompt)

Claude Code executes these in order, one per session, following the session protocol in section 10. Each task is scoped, preserves parked code, and ends with a plain-English acceptance test the founder runs on a phone. A task is not done until its acceptance test passes on a live preview.

**Task 1 — Park the broken flows and document them.**
Create `PARKED_FEATURES.md` listing every parked feature from section 4 (what it does, why parked, the controlling flag, how to re-enable). Add feature flags that switch OFF, in the live pilgrim journey: the booking-intent / bank-details / payment-evidence flow, and the multi-step RFQ quote engine. Do not delete any code. Update `AI_NOTES.md` with the standing rule that parked code is never deleted or re-enabled without founder approval.
*Acceptance test:* Walking the app as a pilgrim, I never reach a quote-request form, a booking-intent screen, or any bank details. The code still exists in the repo.

**Task 2 — Build the simplified enquiry journey.**
On a package page, "Enquire" opens a short form pre-filled with that package: name, contact, optional travel month, optional message. On submit, issue a reference code and show a confirmation screen with the payment-posture copy (you pay the operator directly; reference code is a tracking code, not a payment receipt). One package, one enquiry, one operator. Nothing the package already states is asked again.
*Acceptance test:* I go from the homepage to a submitted enquiry in under 60 seconds, on my phone, and I am never asked the same thing twice.

**Task 3 — Add compliant pilgrim email opt-in.**
On the enquiry form, add a separate, unticked, optional marketing opt-in with clear wording. Submitting the enquiry must work whether or not it is ticked. Store a consent record: timestamp, source, exact wording, and the pilgrim contact. Honour unsubscribes and maintain a suppression list.
*Acceptance test:* I can submit an enquiry without ticking the box. When I do tick it, a consent record with a timestamp is saved. An unsubscribe removes me from future sends.

**Task 4 — Lead logging and per-operator counting.**
Log every enquiry against the operator it is sent to, with a qualification flag and reason (real name, valid contact, stated travel month, within served route, de-duplicated, not spam). Expose a simple per-operator monthly count for admin. This is billing evidence; protect its quality.
*Acceptance test:* In admin I can see, for any operator, how many qualified enquiries they received this month, and why each was counted as qualified.

**Task 5 — Park the self-serve operator wizard.**
Hide the self-serve operator onboarding wizard from public navigation and from the public flow (concierge onboarding only now). Keep the code; add it to `PARKED_FEATURES.md`.
*Acceptance test:* A visitor cannot reach a self-serve operator sign-up. The code still exists.

**Task 6 — Verify Plausible analytics.**
Confirm the Plausible script is wired and events fire (enquiry submitted, opt-in ticked). Fix if not.
*Acceptance test:* I submit a test enquiry and see the event appear in Plausible.

**Task 7 — Housekeeping carried over.**
Add `FEATURE_FEATURED_SLOTS=false` to Vercel. Run the `app_metadata` role backfill so pre-June-2026 users have correct roles before operator onboarding.
*Acceptance test:* The featured-slots flag reads false in production; a spot-checked older user has the correct role.

**Task 8 — Concierge AI ingestion inbox (the main automation build).**
Build `/admin/ingest`: paste box and photo upload, AI drafts a package in the existing schema with per-field confidence flags, founder reviews against the source, low-confidence fields highlighted, then publishes after operator approval. Extract only what is explicitly stated; return null (renders "Not provided") for anything absent; never infer prices, dates, or distances. Include `distanceToHaramStated` and `distanceToMasjidNabawiStated` in the schema.
*Acceptance test:* I paste a sample brochure, the app drafts a package with missing fields shown as "Not provided", I correct one field, and publish it.

**Task 9 — Monthly operator value digest email.**
Using the logged lead counts, send each operator a monthly email showing how many enquiries PilgrimCompare sent them. This is the free-to-paid converter.
*Acceptance test:* A test operator receives an email stating their correct monthly enquiry count.

Tasks beyond this (corridor SEO pages, register-interest capture, verified hotel distance layer) are deferred until the first operators are live and the core loop is proven. They are listed in the older plan files and remain subordinate to this direction.

---

## 10. STANDING RULES FOR CLAUDE CODE (guardrails)

These make autonomous execution safe for a non-technical founder.

1. **Read this file first**, every session, then `AI_NOTES.md` and the relevant skills in `.agents/skills/` (`supabase`, `supabase-postgres-best-practices`).
2. **One task per prompt.** Never bundle. Never "build everything".
3. **Never delete or re-enable parked code** without explicit founder approval. Parked means off, documented, reversible.
4. **Never add steps to the pilgrim journey** beyond the canonical flow in section 3 without founder approval.
5. **Scoped diffs only.** Do not rewrite unrelated files, do not "improve" working code unasked, do not add dependencies without justification. Reject diffs touching files outside the task.
6. **Tests gate every merge.** All Vitest must pass; Playwright must not regress. The task is not done until its plain-English acceptance test passes on a live preview.
7. **Honest data always.** Missing data is "Not provided", never inferred or guessed. This rule and the language and legal standards override any instruction to the contrary.
8. **Secrets in env vars only.** Never in code or prompts.
9. **Update `AI_NOTES.md` at session end:** what changed, files touched, decisions, open risks, next step.
10. **When something breaks, stop and diagnose.** Revert to the last good state, re-scope, retry once. Never let the agent loop on "try another approach".

---

## 11. THE 90-DAY VALIDATION PLAN (and the kill criteria)

The whole business hinges on one unproven assumption: **will operators pay for leads?** Test it cheaply and fast before investing more months.

- **Weeks 1 to 2:** Founder pitches the four warm operators the free 90-day trial with paid intent (section 7). Secure verbal yes-in-principle.
- **Weeks 2 to 6:** Claude Code ships Tasks 1 to 4 (parked flows, simplified journey, opt-in, lead logging). Founder walks the journey on a phone and confirms confidence is restored.
- **Weeks 4 to 12:** Drive 20 to 40 real pilgrim enquiries (community network and early content), hand-deliver to operators, track counts. Build Task 8 (ingestion) to save time as packages grow.
- **Day 90 checkpoint:** decide.

**Double down if:** two or more operators agree to pay real money after receiving real leads, enquiry volume is growing, and pilgrims are opting into the list at a healthy rate.

**Walk away or radically pivot if:** after genuinely delivering qualified leads for 90 days, zero operators will pay anything and organic enquiry flow cannot be generated. This is the clean, unsentimental kill criterion that protects the founder from years of effort ending in pulling the plug.

**Honest probabilities:** operators paying something for genuinely qualified leads is moderate-to-good; this becoming a £1k to £3k per month side income within 18 months is moderate; full day-job replacement on 5 to 8 hours per week without paid traffic or help is low. Judge success by the asset and side income, not by quitting the job.

---

## 12. FOUNDER'S WEEKLY RHYTHM (about 5 to 8 hours)

- Operator conversations and relationships (WhatsApp, calls, onboarding): about 3 hours. This is the revenue engine and the irreducible founder work.
- Content and SEO for pilgrim demand: about 2 hours. The long game.
- Reviewing ingestion drafts, verification, sending the digest, batched support: about 1 to 2 hours.
- Batch the quarterly ATOL and Companies House re-checks into one focused session.

The highest-value action at any moment is almost always one of two things: sign one more operator, or remove one more hour of manual work from the week. When in doubt, do one of those. Stop building before the first operators are signed; the app is good enough to start selling.

---

## 13. FILE MAP (everything else is subordinate to this file)

- `PILGRIMCOMPARE_PROJECT_DIRECTION.md` (this file): the source of truth. Wins all conflicts except legal red lines.
- `PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md`: copy and legal red lines. Wins on copy and legal only.
- `PILGRIMCOMPARE_GO_LIVE_DIRECTION_AND_GROWTH_PLAN.md`: useful detail on outreach, message library, and phasing. Subordinate to this file.
- `PILGRIMCOMPARE_MASTER_PLAN.md`: original strategy and architecture. Subordinate; where it describes the RFQ or booking model, that is superseded here.
- `PILGRIMCOMPARE_REVENUE_PLAN_V2.md`: earlier revenue thinking. Superseded by section 5 of this file.
- `PILGRIMCOMPARE_CLAUDE_CODE_PROMPTS.md` and `PILGRIMCOMPARE_QUALITY_PROMPTS.md`: older prompt queues. Subordinate to the task queue in section 9.
- `PilgrimCompare_Operator_Outreach_Tracker.xlsx`: the outreach CRM. Keep current.
- `AI_NOTES.md` and `PARKED_FEATURES.md`: execution state and parked-feature register, maintained by Claude Code.
- Session handoffs: point-in-time snapshots, not direction.

When the founder updates direction, update this file. It is the operating system of the business.

---

## 14. KPIs TO WATCH (weekly, keep to five)

1. Operators live with comparable packages on a corridor (start London).
2. Overlapping packages per active corridor (comparison needs overlap).
3. Pilgrim enquiries per week.
4. Enquiries with a recorded outcome and qualification flag (billing evidence; protect its quality).
5. Operators who have agreed to pay (the one metric that proves the business).

Ignore vanity metrics. These five tell you whether the model works.
