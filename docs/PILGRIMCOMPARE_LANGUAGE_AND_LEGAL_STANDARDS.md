# PilgrimCompare Language, Legal and Accuracy Standards v1

**June 2026. Canonical reference for all site copy, legal pages, UI text, emails, and SEO content. Claude Code must read this file before touching any user-facing string. Where this document and existing code disagree, this document wins.**

**Status: founder-approved working standard, researched against the primary legislation and regulator guidance (PTR 2018, DMCC Act 2024, CAA ATOL standard terms, UK GDPR, E-Commerce Regulations 2002). Solicitor review is deferred until revenue exists; until then the compliance strategy is (a) conservative drafting that claims less rather than more, (b) the behavioural red lines in Section 14, which matter more than any disclaimer, and (c) clauses tagged `LEGAL REVIEW` in code so a future fixed-fee review is a half-day job, not a rewrite. This document is not legal advice.**

---

## 1. What PilgrimCompare is, in one approved paragraph

> PilgrimCompare is a UK comparison and enquiry service for Umrah travel packages. We list packages from independent, verified UK travel operators so you can compare them side by side and send enquiries directly. We are not a travel agent, tour operator, or organiser. We do not sell travel, take bookings, or handle payments. Your booking, contract, and payment are always with the operator you choose.

Use this paragraph (or a tightened version of it) on the About page, the footer "What we do" block, and the first section of the Terms.

## 2. Identity rules (rebrand enforcement)

- The brand is **PilgrimCompare**, one word, capital P and capital C. Never Pilgrim Compare, PilgrimCompare.co.uk as a name, or pilgrimcompare in body copy.
- **Zero references to PilgrimCompare anywhere**: code, comments, copy, metadata, OG tags, structured data, email templates, SVGs, alt text, favicons, manifest.json, package.json, README, test fixtures, seed data, error messages, environment variable names, URLs.
- Known outstanding offenders: `/public/logo.svg` and `/public/text-logo.svg` still contain PilgrimCompare branding.
- Legal entity disclosure in the footer and Terms (Companies Act 2006 and E-Commerce Regulations 2002 require all of these for a UK online service): registered company name, company number, country of registration, registered office address, a contact email, and VAT number if VAT-registered. If the registered entity name differs from PilgrimCompare, use: "PilgrimCompare is a trading name of [Company Name Ltd], registered in England and Wales, company number [N], registered office [address]. Contact: support@pilgrimcompare.co.uk." Use a placeholder token `{{LEGAL_ENTITY_BLOCK}}` in code if details are not yet in env config; never invent them. Operating without this disclosure is itself a breach, so this is launch-blocking, not cosmetic.

## 3. The five hard boundaries (never violate in any copy)

1. PilgrimCompare does NOT hold customer funds. Customers pay the operator directly.
2. PilgrimCompare is NOT the organiser, merchant of record, agent, or escrow.
3. Operators are the source of truth for all package and quote content.
4. Missing data shows as **Not provided**. Never inferred, never guessed, never filled by AI.
5. No promises of refunds, guarantees, availability, visa outcomes, or travel protection.

## 4. Standard copy (use verbatim, do not paraphrase)

- "You pay the operator directly. PilgrimCompare does not receive or hold your payment."
- "Your travel contract, cancellations and refunds are with the operator named on this page."
- "Your PilgrimCompare reference code is a tracking code, not a payment receipt."

## 5. Banned phrases and required replacements

| Banned | Why | Use instead |
|---|---|---|
| "Book with PilgrimCompare" / "Book now" as a PilgrimCompare action | We do not take bookings | "Send an enquiry" / "Enquire with [operator]" |
| "We operate from [airport]" / "Our flights from..." | We operate nothing | "Compare packages departing from [airport/city]" |
| "ATOL protected" as a blanket site claim, or the ATOL logo on PilgrimCompare pages | Only the operator's package can be ATOL protected; over-broad badge use misleads and breaches CAA expectations | "We check each operator's ATOL number against the CAA register before listing. ATOL protection, where it applies, is provided by the operator. Always check your ATOL Certificate when you pay." |
| "Guaranteed" / "100% secure" / "risk-free" / "best price guaranteed" | Unsubstantiable, misleading under DMCC Act | "Compare verified operators" / state what verification actually checks |
| "Cheapest Umrah packages" / "lowest prices" | Comparative price claim we cannot prove | "Compare prices side by side" |
| "All UK operators" / "every Umrah package in the UK" | False completeness claim | "Packages from our verified operators" |
| "Trusted by thousands" or any volume/social-proof number not backed by real data | Misleading action | Real numbers only, or nothing |
| "Visa included/guaranteed" as a PilgrimCompare statement | Visa issuance is Saudi government discretion via the operator | Show the operator's stated inclusion as structured data: "Visa: Included (per operator)" or "Not provided" |
| "Refund available" / "free cancellation" as PilgrimCompare copy | Refunds are the operator's contract terms | "Cancellation and refund terms are set by the operator. Ask before you pay." |
| "Partner" to describe operators | Implies joint responsibility | "Listed operator" / "verified operator" |
| "Official" / "approved by" any authority | We hold no approvals | Describe the actual check performed |

## 6. Pricing language (DMCC Act drip pricing rules)

The DMCC Act 2024 (in force since 6 April 2025) bans drip pricing: the headline price shown must include all unavoidable mandatory charges, or the listing is an unfair commercial practice with direct CMA enforcement.

Rules for PilgrimCompare:

- Display the price exactly as the operator provides it, and label what it covers: "From £X per person, based on [occupancy], as stated by [operator]."
- If the operator's price excludes mandatory items (e.g. visa fee, mandatory transfers), this must be visible next to the price, not buried: "Excludes: [items] (per operator)". If unknown: "Price inclusions: Not provided".
- "From" prices must be genuinely available at that price for the stated configuration. If we cannot verify, attribute: "as stated by the operator on [date]".
- Never compute, average, infer, or convert prices. Never display a price the operator did not give.
- Date-stamp prices: "Prices provided by the operator and last confirmed [date]. Confirm the final price with the operator before paying."

## 7. Verification claims (say exactly what we check, nothing more)

Approved verification statement:

> Before any operator is listed, we check: (1) their ATOL number against the CAA's public register, (2) their company status at Companies House, (3) that they have a real, verifiable UK trading address. Verification confirms these checks at the time of listing. It is not a guarantee of service quality, financial protection for your specific booking, or future conduct.

Rules:

- The "Verified" badge must link or expand to this statement everywhere it appears.
- Show the operator's ATOL number and a link to the CAA check page on every operator profile, so users can verify themselves.
- Never use "vetted", "endorsed", "accredited", "certified", or "approved". Only "verified", defined as above.
- If an operator's ATOL lapses, the listing is suspended, not annotated.

## 8. Airports and departure points

- PilgrimCompare does not "operate from" anywhere. Departure airports/cities are attributes of operator packages.
- Any list of departure airports or cities shown on the site (homepage, corridor pages, filters, footer) must be **generated from live, published package data**. If no live package departs from Manchester, Manchester does not appear as a departure option.
- Approved phrasing: "Compare Umrah packages departing from London, Birmingham and Manchester" only when live packages exist for each named city. Component should render from a query, not a constant.
- Corridor SEO pages with zero live packages must either not be indexed or clearly state "No packages currently listed from [city]. New operators are being added." Never fake supply.

## 9. Reviews and testimonials (DMCC Act publisher obligations)

If/when reviews or testimonials appear:

- Only publish reviews tied to a real PilgrimCompare reference code (enquiry or booking intent). This is the "reasonable and proportionate steps" defence.
- Never write, commission, edit for sentiment, or selectively suppress reviews. Incentivised reviews must be labelled.
- Terms must state the review policy: who can review, what is removed (abuse, fake, off-topic), and that operators cannot pay to alter reviews.
- Until a verified-review system exists, publish no reviews and no star ratings at all. No placeholder testimonials, ever.

## 10. Required legal pages and what each must contain

### 10.1 Terms of Use (customer-facing)

1. Who we are: legal entity block, trading name, contact.
2. What the service is: comparison and enquiry only, using the Section 1 paragraph.
3. What we are not: not an organiser, agent, merchant of record, or party to the travel contract; we do not take payment; the Package Travel and Linked Travel Arrangements Regulations 2018 obligations sit with the operator as organiser.
4. Operator content: operators supply and are responsible for package data; we display it in good faith with the verification checks described in Section 7; "Not provided" means the operator did not supply it.
5. Reference codes: tracking only, verbatim standard copy.
6. No advice: information is not travel, visa, financial, or religious advice.
7. Acceptable use, account terms, suspension rights.
8. Liability: exclude liability for operator performance, package accuracy beyond our stated checks, and consequential loss, while never excluding what cannot legally be excluded (death/personal injury from negligence, fraud, Consumer Rights Act 2015 statutory rights).
9. Reviews policy (Section 9), once reviews exist.
10. Complaints route: about the platform → support@pilgrimcompare.co.uk; about a booking → the operator, with our escalation help offered but not guaranteed.
11. Governing law: England and Wales.

### 10.2 Operator Terms (separate page or signed agreement reference)

Listing conditions, verification cooperation, accuracy warranty from operator, 48-hour response expectation, outcome reporting against reference codes, suspension rights, future pricing terms.

### 10.3 Privacy Policy (UK GDPR)

Controller identity, what is collected (enquiry details, account data, analytics), lawful bases (performance of the service for enquiry routing; legitimate interests for analytics and fraud prevention), retention periods, rights, ICO complaint route. The key disclosure: **enquiry details are shared with the operator you enquire with, and from that point the operator is a separate, independent data controller of your details under its own privacy policy**. State this plainly; it is accurate (the operator decides what it does with the lead) and it correctly walls off PilgrimCompare from liability for the operator's later data handling. Plausible is cookieless analytics; if only Plausible plus strictly necessary cookies are used, state that and skip a consent banner; add a banner only if non-essential cookies appear.

### 10.4 Cookie notice

Only needed as above. Keep it honest and short.

### 10.5 "How PilgrimCompare works" page

Plain-English version of the model: compare → enquire → operator replies → you book and pay the operator directly → reference code tracks it. This page does more trust work than the Terms; link it from header or footer.

## 11. Tone rules

- UK English. Calm, precise, non-promotional. Comparison over persuasion.
- No em dashes. No hype adjectives (amazing, unbeatable, ultimate, seamless).
- Salaam greetings in relational emails are fine; legal pages stay neutral.
- Every claim must be checkable: either from our own data, the operator's stated data (attributed), or a public register (linked).

## 12. Page-by-page accuracy checklist (audit against this)

| Surface | Must have | Must not have |
|---|---|---|
| Homepage | One-line model description, verification statement link, dynamic departure cities | Booking language, blanket ATOL claims, fake volume stats |
| Package page | Operator name prominent, ATOL number + CAA link, price attribution + date, standard payment copy, "Not provided" for gaps | Inferred fields, PilgrimCompare-voiced promises |
| Compare view | Identical field set per package, explicit "Not provided" cells | Hidden differences, default-sorted by anything resembling paid placement |
| Enquiry flow | Data-sharing disclosure ("your details go to the operator"), reference code copy on confirmation | Payment fields of any kind |
| Header/footer | Links to Terms, Privacy, How it works, Contact; legal entity line in footer | PilgrimCompare anything |
| Emails | Standard copy blocks from master plan section 7.1 | Refund/availability promises |
| 404/empty/error states | Honest copy ("No packages currently match") | Fabricated alternatives |

## 13. SEO accuracy rules

- Title tags and meta descriptions follow the same banned-phrase rules. "Compare Umrah Packages from Verified UK Operators | PilgrimCompare" is the pattern; never "Book Cheap Umrah".
- Structured data: use `Organization`, `WebSite`, `Product`/`Offer` with `seller` set to the **operator**, never PilgrimCompare. `priceValidUntil` from operator data only. No `AggregateRating` until verified reviews exist (fake ratings are a Google penalty and a DMCC breach).
- Corridor pages index only with live supply (Section 8).
- OG and Twitter card text must pass the same audit; these are often missed in rebrands.

## 14. Behavioural red lines (these protect more than any disclaimer)

The Package Travel and Linked Travel Arrangements Regulations 2018 apply substance over form: a trader cannot avoid organiser or LTA-facilitator obligations by calling itself an intermediary or comparison site. What keeps PilgrimCompare outside the Regulations is what the product does, not what the Terms say. Two statutory triggers exist: (a) facilitating separate selection AND separate payment of travel services at PilgrimCompare's point of sale, and (b) targeted procurement where a contract with another trader is concluded within 24 hours of a first booking confirmation, typically via a linked booking handoff passing the customer's name, payment details, and email.

Therefore the product must NEVER, in any future feature, without first revisiting the entire legal posture:

1. Take, hold, route, or facilitate any payment, deposit, or "reservation fee", including via Stripe Connect, payment links, or embedded operator checkouts on PilgrimCompare pages.
2. Conclude or confirm a booking. "Booking intent" must remain a tracking record, never a contractual acceptance. The confirmation screen confirms the enquiry was sent, nothing more.
3. Pass payment details to an operator in any form, or pass name + email + payment details together as a linked booking handoff.
4. Bundle services from multiple operators (e.g. flights from one, hotel from another) into a single flow. That is package creation and makes PilgrimCompare the organiser.
5. Set, negotiate, or guarantee prices, availability, or inventory. Display only what the operator stated.
6. Issue anything resembling a booking confirmation, ticket, voucher, or ATOL Certificate.
7. Sign up for merchant-of-record status, escrow, or "buyer protection" schemes. That is the parked Phase 3 decision and requires ATOL and PTR work before a single line of code.

If a future feature brushes any of these lines, stop and reassess the regulatory position before building. This section exists so that decision is made consciously, not slid into.

## 15. Self-serve compliance checklist (no-solicitor posture)

Until a solicitor review is affordable, this is the risk-ranked order of what must be true:

1. Section 2 legal entity disclosure live in footer and Terms (statutory requirement, trivial to fix, launch-blocking).
2. Sections 3 to 6 enforced across all copy (misleading-claims risk under the DMCC Act is the realistic enforcement exposure for a comparison site).
3. Privacy Policy live with the operator data-sharing disclosure before the first real enquiry is routed.
4. Section 14 red lines respected in every feature decision.
5. Terms live with `LEGAL REVIEW` tags preserved in source so future review is cheap.
6. No reviews, no ratings, no testimonials until the verified-review system exists.

Revisit solicitor review when: first paying operator, OR first month above 5,000 sessions, OR any feature touching Section 14, whichever comes first.

## 16. Ranking and paid placement transparency

Schedule 20 of the DMCC Act bans, in all circumstances, presenting search or comparison results without prominently disclosing any payment made for higher ranking, and bans paid promotion presented as editorial content. The CMA does not need to prove a consumer was misled; the practice itself is the breach. Rules:

1. The default sort order of any package list or comparison must be neutral and based only on disclosed, non-commercial criteria. Approved default criteria: relevance to the user's filters, profile/data completeness, operator response rate, recency of price confirmation. Publish the criteria in a one-line disclosure near the sort control: "Sorted by [criteria]. No operator pays for ranking." Link to a short "How we rank" explainer.
2. Commercial relationships must never silently influence default ranking. If a paid Featured tier ever exists, Featured slots are visually distinct, labelled "Featured" at the slot itself (not in a footnote), capped (max 2 per list view), and excluded from the default-sorted results count.
3. "Priority placement" must not be promised to operators as an undisclosed ranking benefit. The compliant version: founding operators rank well because concierge onboarding maximises their completeness and response-rate scores under the neutral criteria, and any explicit placement benefit is labelled Featured.
4. No `AggregateRating`, star scores, review counts, or "top rated" claims anywhere until a verified review system exists; aggregate review information is squarely within the Act's scope.
5. The operator agreement must include consent to these disclosure rules so no operator can later claim a promised hidden boost.
