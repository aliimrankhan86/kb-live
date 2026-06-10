# PilgrimCompare Quality Prompt Pack — Content, Legal, IA/UX, Mobile, SEO

**Run in order, one prompt per Claude Code session. Each session starts by reading AI_NOTES.md and `docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md` (commit that file to the repo first, in `docs/`). Use `/compact` around 50% context. End every session with: summary of files changed, decisions made, test status, open risks, next steps appended to AI_NOTES.md.**

---

## Prompt Q1 — Rebrand sweep and content accuracy audit

```
Role: You are a senior content engineer and UK consumer-law-aware copy auditor working on PilgrimCompare (Next.js 15.5 App Router, TypeScript strict).

Before anything: read AI_NOTES.md and docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md in full. That standards file is the source of truth for every decision in this session.

Task, in this order:

STEP 1 — KaabaTrip eradication:
1. Run a case-insensitive repo-wide search for: kaabatrip, kaaba-trip, kaaba_trip, KaabaTrip, KAABATRIP. Search all file types including .svg, .json, .md, .env.example, test fixtures, seed data, email templates.
2. Replace every occurrence with the PilgrimCompare equivalent. Known offenders: /public/logo.svg and /public/text-logo.svg contain KaabaTrip branding. Recreate both as clean PilgrimCompare SVGs: wordmark "PilgrimCompare" in the existing brand font/colour tokens (inspect Tailwind config and existing components for the brand colour; do not invent a new palette). Keep viewBox proportions compatible with current usage so layout does not shift.
3. Check favicon, apple-touch-icon, manifest.json (name, short_name), OG images, and any hardcoded social handles or email addresses.
4. Output a table: file, old reference, what you changed.

STEP 2 — Banned-phrase audit:
1. Grep all user-facing strings (pages, components, email templates, metadata, structured data, error messages) for every banned phrase in Section 5 of the standards file, plus: "book now", "ATOL protected" (as a site claim), "guaranteed", "cheapest", "best price", "trusted by", "official", "partner", "we operate".
2. For each hit, replace with the approved alternative from the standards file. Where the correct replacement depends on data we do not have, use "Not provided" or remove the claim entirely. Never soften by paraphrase; use the verbatim standard copy blocks where specified.
3. Verify the three verbatim standard copy lines (Section 4) appear where Section 12 requires them: package page, enquiry confirmation, booking intent confirmation email template.

STEP 3 — Airports/departure cities:
1. Find every place departure airports or cities are displayed (homepage, filters, footer, corridor pages, hero copy). If any list is hardcoded, replace it with a server-side query that derives distinct departure cities/airports from LIVE published packages only.
2. If zero live packages exist for a city, it must not render as a departure option. Empty state copy: "No packages currently listed from [city]. New operators are being added."

Constraints:
- Do not change layout, components, or routes in this session. Copy and data sourcing only.
- Do not touch the database schema.
- TypeScript strict, no any.
- One PR. Conventional commits per step.

Validation:
- grep -ri "kaabatrip" . --include="*" returns zero hits outside node_modules and .git.
- npx tsc --noEmit passes. npm run test passes.
- Manually list every page where the three standard copy lines now render.
- Screenshot or describe the new logo SVGs rendered in header at mobile and desktop widths.

When done, run the Session End Block.
```

---

## Prompt Q2 — Legal pages (Terms, Privacy, Cookies, How it works)

```
Role: You are a senior product counsel-adjacent content engineer. You draft UK-compliant legal page CONTENT and implement the pages. Drafting principle: claim less rather than more; where a clause is uncertain, choose the conservative version and tag it <!-- LEGAL REVIEW --> so a future solicitor pass is cheap. There is no solicitor in the loop right now, so the standards file's Section 14 behavioural red lines and Section 15 checklist are binding.

Read AI_NOTES.md and docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md first. Sections 1 to 10, 14, and 15 of that file define exactly what each page must and must not say.

Task:
1. Create /terms, /privacy, /how-it-works, and (only if non-essential cookies exist; check the codebase, Plausible is cookieless) /cookies. App Router pages, server components, statically rendered, indexable.
2. Draft the content per Section 10 of the standards file. Terms must include all 11 listed elements. Privacy must disclose that enquiry details are shared with the enquired operator. Use {{LEGAL_ENTITY_BLOCK}} placeholder sourced from a single config constant (lib/legal.ts) so the founder can fill company details in one place; render a visible "Company details to be confirmed" fallback in dev, and fail the build if the constant is empty when NODE_ENV is production... actually do not fail the build; instead add a Vitest test that fails if the constant is empty, so it blocks PR merge not deploys.
3. /how-it-works: plain-English 5-step model page per Section 10.5, mobile-first, using existing design tokens. Include the verification statement from Section 7 verbatim and the three standard copy lines.
4. Add a LastUpdated date constant per page, rendered visibly.
5. Wire footer links to all four pages and add the legal entity line to the footer.
6. Accessibility: semantic headings in order, single h1 per page, focus-visible styles, table of contents with anchor links on /terms for mobile usability.

Constraints:
- No new dependencies. No CMS. Content lives as typed constants or MDX consistent with existing project conventions (inspect first, follow what exists).
- Do not promise anything the standards file bans. When in doubt, say less.
- Every liability clause and the governing law clause get <!-- LEGAL REVIEW --> comments.

Validation:
- npx tsc --noEmit, npm run test pass, including the new legal-entity test.
- Playwright: each page renders, h1 correct, footer links resolve, 390px viewport has no horizontal scroll.
- Output a checklist mapping each Section 10 requirement to where it is implemented, plus the list of LEGAL REVIEW tags preserved in source for a future fixed-fee review.

When done, run the Session End Block.
```

---

## Prompt Q3 — Information architecture, navigation, header and footer

```
Role: You are a senior IA/UX engineer. Apply information architecture discipline: every page must answer "where am I, what can I do here, how do I get back".

Read AI_NOTES.md and docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md. Then, before changing anything, produce a sitemap of all current routes (public, customer, operator, admin) by inspecting the app directory, and present the current vs proposed IA as a short tree. Wait-free: proceed with the proposal, do not ask questions, but record assumptions.

Task:
1. Global header (all public pages): logo links home, primary nav (Packages, Compare, How it works), auth state (Sign in / account menu), persistent and identical across pages. Mobile: hamburger opening an accessible slide-over (focus trapped, Escape closes, aria-expanded, body scroll locked).
2. Global footer (all public pages): What we do paragraph (Section 1 of standards), nav links, legal links (Terms, Privacy, How it works, Contact), legal entity line, dynamic departure cities block (reuse the query from Prompt Q1, do not duplicate logic).
3. Back navigation: every detail page (package, operator profile, comparison) gets a visible back control top-left that returns to the preceding list WITH filters/scroll preserved (use router.back() when the referrer is internal, fall back to the canonical list route otherwise). Breadcrumbs on package and operator pages: Home > Packages > [Package name], schema.org BreadcrumbList markup included.
4. Dashboard areas (customer, operator, admin): consistent shell with section nav, current section highlighted, and a clear route back to the public site.
5. Empty, loading, and error states: audit every list and detail route; any missing state gets honest copy per Section 12 (no fabricated alternatives) and a skeleton or spinner consistent with existing patterns.
6. URL hygiene: kebab-case, stable, human-readable slugs for packages and operators if not already; if slug changes are needed, add 301 redirects in next.config and flag the risk.

Constraints:
- Use the frontend-design skill conventions in .agents/skills if present; otherwise follow existing Tailwind v4 tokens. No new UI libraries.
- Keyboard support and visible focus states on all new interactive elements. Tap targets minimum 44px.
- Do not redesign pages; this is structure and navigation only.

Validation:
- npx tsc --noEmit, npm run test, Playwright nav suite: header/footer present on every public route, mobile menu opens/closes by keyboard, back control returns to filtered list state, breadcrumb schema validates.
- Manual: 390px viewport walk of home > packages > package > compare > enquiry with no dead ends and no horizontal scroll.

When done, run the Session End Block.
```

---

## Prompt Q4 — Mobile polish and user-flow quality pass

```
Role: You are a senior mobile-first front-end engineer doing a polish pass. Standard: nothing misaligned, nothing truncated, nothing requiring horizontal scroll, every action reachable with a thumb.

Read AI_NOTES.md and docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md.

Task:
1. Audit every public route and the enquiry flow at 360px, 390px, and 430px widths. For each route, log defects in a table: route, element, defect (misalignment, overflow, truncation, tap target <44px, text <14px, contrast failure), fix applied.
2. Fix all defects. Common targets: comparison table (must become a swipeable or stacked card layout on mobile, with comparison fields aligned row-to-row; "Not provided" cells styled consistently, never blank), package cards (price, operator, departure city never wrap awkwardly), forms (labels above inputs, inputmode and autocomplete attributes, error messages inline below fields, submit button never hidden by keyboard), sticky elements (no overlap with content or each other).
3. Enquiry flow specifically: progress indication if multi-step, data-sharing disclosure visible before submit ("Your details will be sent to [operator]"), confirmation screen shows reference code with the verbatim tracking-code copy and a copy-to-clipboard control.
4. Performance: check public pages for layout shift sources (unsized images, late-loading fonts). Add width/height or aspect-ratio to images, next/font if not used. Do not pursue micro-optimisation; fix only visible jank.
5. Run the accessibility-review skill checklist if available in .agents/skills; otherwise: focus order matches visual order, all images have alt text, form fields labelled, colour contrast AA.

Constraints:
- No redesign, no new dependencies, no breaking desktop. Tailwind responsive utilities only.
- Keep diffs scoped per route; one commit per route or component group.

Validation:
- npx tsc --noEmit, npm run test pass.
- Playwright at 390px: no element wider than viewport on any public route (assert document.scrollingElement.scrollWidth <= innerWidth).
- Output the defect table with before/after notes as the PR description.

When done, run the Session End Block.
```

---

## Prompt Q5 — SEO and structured data accuracy

```
Role: You are a senior technical SEO engineer. Accuracy beats reach: nothing in metadata or schema may claim what the standards file bans.

Read AI_NOTES.md and docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md, especially Sections 5, 8, and 13.

Task:
1. Metadata: implement generateMetadata for every public route. Pattern: "Compare Umrah Packages from Verified UK Operators | PilgrimCompare". Package pages: "[Package name] by [Operator] | Compare on PilgrimCompare" with description built only from operator-provided fields; omit absent fields, never pad. Canonical URLs on everything; noindex on auth, dashboard, admin, and any corridor page with zero live packages.
2. Structured data (JSON-LD): Organization and WebSite on the root layout; BreadcrumbList (coordinate with Prompt Q3 if already done); Product + Offer on package pages with seller = the OPERATOR organisation, price and priceCurrency from operator data only, priceValidUntil only if the operator gave a validity date. NO AggregateRating, NO Review markup anywhere (no verified review system exists yet).
3. Sitemap.xml and robots.txt: dynamic sitemap from live packages, operators, corridor pages with supply, and static pages. Exclude expired packages.
4. OG/Twitter: per-page OG title and description passing the same banned-phrase rules; a default OG image with the new PilgrimCompare branding (generate a simple branded OG image route or static asset consistent with the rebuilt logo).
5. Corridor page readiness: ensure the corridor page template renders only from live package data with a city-level intro that states facts (number of live packages, price range from real data, departure airports from real data). If supply is zero, page returns noindex and the honest empty state from Prompt Q1.
6. Add a Vitest test that scans all metadata constants/templates for banned phrases (import the banned list from a single shared constant, lib/content-rules.ts, so the audit is enforceable in CI going forward).

Constraints:
- No SEO copy that violates Sections 5 or 13. No keyword stuffing. No fake counts.
- next-sitemap or hand-rolled route handlers, whichever matches existing conventions; no heavy new dependencies.

Validation:
- npx tsc --noEmit, npm run test (including the new banned-phrase test).
- Validate JSON-LD with a schema validator script or manual paste check; list the output.
- curl the sitemap locally and confirm no expired or zero-supply URLs.

When done, run the Session End Block.
```

---

## Prompt Q6 — Ranking transparency and Featured infrastructure

```
Role: You are a senior full-stack engineer implementing ranking transparency required by the DMCC Act and Section 16 of the standards file. This also pre-builds the Featured tier so future monetisation is a config change, not a build.

Read AI_NOTES.md, docs/PILGRIMCOMPARE_LANGUAGE_AND_LEGAL_STANDARDS.md (Section 16), and docs/PILGRIMCOMPARE_REVENUE_PLAN_V2.md.

Task:
1. Neutral default sort: implement the package list default ordering as a deterministic score from only these inputs: relevance to active filters, profile/data completeness (count of non-"Not provided" comparison fields), operator response rate (from enquiry response data if available, else neutral), and recency of price confirmation. Document the formula in code comments and in a short /how-we-rank page.
2. Disclosure line: render near every sort control on list and corridor pages: "Sorted by relevance and listing quality. No operator pays for ranking." linking to /how-we-rank. Keep this string in lib/content-rules.ts so it is single-source.
3. /how-we-rank page: plain-English explanation of the criteria, what Featured will mean when it exists (clearly labelled, never mixed into default results), and the verification statement link. Indexable, in the footer legal block.
4. Featured infrastructure (build dark): an isFeatured flag pathway (schema field or config, follow existing conventions; if a schema change is needed, a single additive migration), a FeaturedBadge component visually distinct per Section 16, slot logic capping 2 Featured cards per list view rendered ABOVE and separate from the default-sorted results, and Featured cards excluded from the default sort result count. Ship with zero operators featured; behind a feature flag default OFF.
5. Vitest: test that default sort ignores isFeatured entirely; test that the disclosure string renders on list pages; extend the banned-phrase test to fail on "top rated", "best operator", "#1", and star characters in UI strings.

Constraints:
- No payment or billing code in this session. Infrastructure only.
- No ratings, scores, or review-derived inputs in the ranking formula (none exist; do not stub them).
- Mobile: Featured cards and disclosure line verified at 390px.

Validation:
- npx tsc --noEmit, npm run test including new tests.
- Playwright: toggle the feature flag in a test and assert Featured cards render labelled, capped at 2, above the neutral list.

When done, run the Session End Block.
```

---

## Run order and dependencies

1. Commit the standards file and revenue plan to `docs/` first (one-minute manual step or include in Q1).
2. Q1 (rebrand + copy accuracy) unblocks everything; run before operators see the site again.
3. Q2 (legal pages) next; Gate 3 outreach should not accelerate without Terms and Privacy live.
4. Q3 (IA/nav) then Q4 (mobile polish); Q4 depends on Q3's header/footer being stable.
5. Q5 (SEO) then Q6 (ranking transparency); Q6's disclosure line and /how-we-rank page should exist before the first founding operator goes live, because the reworded placement pitch references it.

Manual founder tasks alongside (not code): update the founding operator agreement and the outreach message library per Revenue Plan v2 Section 7, items 1 and 2.

After Q2 ships: no solicitor needed yet. The LEGAL REVIEW tags stay in source. The trigger points for a future fixed-fee review are in Section 15 of the standards file: first paying operator, 5,000 sessions/month, or any feature touching the Section 14 red lines.
