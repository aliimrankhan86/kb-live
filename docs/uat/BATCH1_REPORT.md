# Batch 1 report: reliability and UX (2026-10-09)

Branch `fix/batch-1-reliability-and-ux` from `dev` `1406525`. One PR into `dev`, not merged. `main` (`a4e7075`) untouched. No production database or production Vercel change. No new dependencies. No SQL was needed, so nothing was added to `supabase/migrations-pending/`.

## Test counts

| Suite | Baseline (dev `1406525`) | This branch |
| --- | --- | --- |
| Unit (Vitest) | 2,127 | 2,169 (76 files) |
| Repo Playwright | 69 passed, 6 skipped | 69 passed, 6 skipped |
| Real database (`npm run e2e:local-db`) | 25 of 25 | 32 of 32 |
| `tsc --noEmit`, lint, build | pass | pass (lint: the 2 existing warnings only) |

Every behaviour fix has a test that fails on the old code and passes on the new. The before runs were done by putting the old source files back for one run; the commit messages record each result.

## Per item

### Item 10, P1: emails sent fire and forget (DONE)

**Call sites found (all three):** `app/api/enquiries/route.ts`, `app/api/quote-requests/route.ts`, `app/api/booking-intents/route.ts`. Each called `void send...()` and returned. The two crons (`nudge-operators`, `outcome-followup`) already await their sends. `lib/email/send.tsx` already catches and logs every Resend error and exception, so the only gap was the unawaited promise.

**Change:** each route now hands the send to `after()` from `next/server`. The response does not wait for email, and Vercel keeps the function alive until the send ends. Failures are logged by `[email] sendEnquiryEmails failed:` / `sendQuoteEmails` / `sendBookingEmails` and by the per-email `[email] send... error:` lines. Nothing is swallowed.

**Tests:** `tests/enquiry-api.test.ts` (2 new) and `tests/email-after-routes.test.ts` (4) for all three routes: the send is scheduled through `after()` and has not run when the response returns; a rejected send is logged and the route still returns 201.

**Manual proof on staging (for Claude in Chrome):**

1. Open the Vercel preview for this PR (link in the Vercel bot comment on the PR). Confirm the yellow "Test site" banner, which shows the preview uses the staging Supabase project.
2. Go to `/packages`, open a fictional package (for example "10 night Umrah from Heathrow, December"), and press Enquire.
3. Fill in name `Batch1 Proof`, any email address (for example the `STAGING_EMAIL_TO` inbox itself), leave phone blank, tick the required box, and send. Note the reference code shown (`PC-` and 8 characters).
4. Within about a minute, the `STAGING_EMAIL_TO` inbox should receive two emails:
   - `[STAGING] to <the email you typed>: Your Umrah enquiry is on its way, reference PC-XXXXXXXX`
   - `[STAGING] to <the operator's contact email>: New enquiry from PilgrimCompare: Batch1 Proof, <package title>`
   (The operator alert is sent only when the fictional operator has a contact email; all seeded operators do.)
5. If an email is missing: in Vercel, open the preview deployment, then Runtime Logs, and filter for `[email]`. A failure now always logs a line (for example `[email] sendEnquiryConfirmation error:` with the Resend error, or `[email] sendEnquiryEmails failed:`). No email and no log line would mean `after()` did not run, which would be a new finding.

### Item 8, P1: expired packages show publicly (DONE)

**Does the 02:00 `expire-packages` cron work?** Partly.

- On production it works for well-formed dates: it sets `status = 'expired'` on published packages whose `date_window.end` is before `CURRENT_DATE`. The new real-database test calls it with the cron secret and it returns 200 and expires the seeded past package.
- It never runs on staging. Vercel runs crons only on the production deployment, which is why staging package 9 (August 2026) stayed listed.
- It expires on the **return** date, not the departure date, so a package stays public for its whole trip after it has departed.
- It would fail the whole run if any published package has an empty end date. The operator wizard saves `{ start: '2027-01-05', end: '' }` when only a start date is entered, and `''::date` throws in Postgres, so the cron would return 500 every night and expire nothing. Not changed in this batch (see "Not done").

**Change:** the public read path no longer depends on the cron. `lib/listing.ts` `hasDeparted()` is true when the start date is before today in London (Europe/London calendar day), or the cron has marked the package `expired`. A package with no start date is kept, because there is nothing to compare. `Repository.listPackages` feeds search, browse, compare, the operator page, the homepage and the sitemap, so one filter covers them all. Departure airports and the enquiry API follow the same rule (the enquiry API answers 404 "This package is no longer available.").

**Direct URL of a departed package (decision):** the URL keeps working and shows a notice, "This departure has passed", with the package title and departure date, a "Browse current packages" link to `/packages`, and no enquiry form. The same notice replaces the enquire page. The page is `noindex`. Cron-expired packages show the same notice instead of "Package not found".

**Tests:** `tests/departed-packages.test.tsx` (6): London day boundary in BST and GMT, start before today hides, today keeps, undated keeps, expired hides; list, enquiry lookup and airport list; the notice has an h1, a `/packages` link and no form. Real-DB e2e: the seeded "10 night summer Umrah from Heathrow, August 2026" package is missing from `/packages`, `/search/packages`, its operator page and the sitemap, the enquiry API returns 404, the package and enquire pages show the notice, and the cron then marks it expired and the notice still shows.

**Staging:** the August 2026 package will disappear from the preview as soon as this branch deploys, with no reseed needed. Other staging packages will leave the lists on their own departure dates (the earliest is 10 Nov 2026). The local real-DB seed now rolls its dates forward by whole years once 5 Nov 2026 passes, so the suite does not change with the calendar.

### UX-22, P1: /packages overflows sideways (DONE)

Measured locally with staging package 8's long title and hotel names: `/packages` was 718 px wide in a 386 px viewport, and at 320 px every page scrolled 26 px.

**Causes and changes:** the browse grid track was `1fr`, whose minimum is the card's min-content, so a long hotel name widened the page. It is now `minmax(0, 1fr)` with `min-width: 0` on the grid items. The header brand could not shrink at 320 px; below 375 px the brand and wordmark now give way so the menu button stays on screen. Chip rows already wrapped. Hotel rows now wrap to two lines (UX-10).

**Tests:** real-DB Playwright at 320, 360 and 390 px asserts no horizontal scroll on `/packages`, `/search/packages`, a package page and an operator page, using a new seeded package with staging package 8's long title and hotel names.

### UX-01, P1: compare shows "Makkah near / Madinah near" (DONE)

The compare dialog now uses `friendlyDistance` on the same fields as the package page: stated metres with a walking estimate, else the band wording, one line per city, and "Not provided" for a missing city. Ranking uses stated metres before the band. Tests in `tests/compare-distance.test.ts`.

### Item 5: known items 1, 2, 6, 11 and UX-14, UX-13 (DONE)

- **En dashes:** removed from all visible copy (list below). `tests/no-em-dash.test.ts` now fails on en dashes as well as em dashes, scans all of `lib`, and ignores inline block comments.
- **Title template:** 20 page titles carried "| PilgrimCompare" on top of the root template, so 24 of 29 sitemap routes rendered the brand twice. Titles now leave the brand to the template. Real-DB test: every sitemap route names PilgrimCompare exactly once.
- **/partner:** em dashes removed from the three JSX comments.
- **Smoke test 10:** `HANDOFF.md`, `STATUS.md` and `AI_NOTES.md` now record it as passed on 7 Oct 2026 (enquiry-retention cron, 03:45 UTC, 2XX).

### Item 6: UX groups

| Item | Result |
| --- | --- |
| UX-02 operator name blank then layout shift | DONE. `/packages` and `/search/packages` load public operators on the server, so names are in the first HTML. Test: server render contains the name, no client fetch. |
| UX-03 operator name links to operator page | DONE. Card name links to `/operators/<slug>`. |
| UX-04 hotel image fallback, collapse hero | DONE. Themed building tile (dark and light) for missing or broken hotel photos; package hero collapses if its photo fails to load (it was already absent with no photo). |
| UX-05 title and duration in compare | DONE. Columns show package title and nights; compare-bar chips show "N nights · title". |
| UX-06 evaluative marks | DONE. See wording list. Lowest price flag only when every package has the same number of nights. Visible note on what marks mean. |
| UX-07 muted row contrast | DONE. Dark 0.35 to 0.6 white, light 0.30 to 0.62 black; test computes at least 4.5:1 from `styles/tokens.css` on every background. |
| UX-12 /signup defaults to pilgrim | DONE. Operator tab only when operator self-serve is on (parked, off); `/signup?type=operator` redirects to `/partner`. |
| UX-16 password policy on /login | DONE. Removed. |
| UX-17 background behind list text | DONE. List and detail pages sit on an opaque wrapper in the overlay colour; the silhouette stays on the homepage and guides. |
| UX-19 one h1 on /search | DONE. The Suspense fallback and client list each rendered one; now one, outside the boundary. |
| UX-20 404 h1 and link | DONE. |
| UX-21 Save, Compare, operator link on package page | DONE. Save uses the same saved list as the cards; Compare opens `/packages?compare=<id>` with it selected. |
| UX-15 verification notice | DONE. Titled "How we verify operators", shorter, same checks and limits, links to the full §7 statement, and follows verification status rather than tier. |
| UX-18 "rank at its best" | DONE. Reworded, see list. |
| UX-23 tap targets | DONE. 44 px for footer links (phones), footer buttons, contact links, filter controls, card Save and operator link, FAQ toggles; inline text links padded to at least 24 px. Real-DB Playwright checks 14 pages at 390 px. |
| UX-24 12 px minimum | DONE. All 15 sub-12 px sizes raised; source scan test and real-DB check. |
| UX-10 two-line hotel names | DONE. |
| UX-09 airport and duration filters | DONE (not parked). Shared search logic, `departureAirport` and `minNights`/`maxNights` in the URL, chips, Clear all, close-match reason. |
| UX-08 merge /packages and /search/packages | NOT DONE, as instructed. Options below and in the PR. |
| UX-11, item 9 (per room prices) | NOT DONE, as instructed. Need Ali's decision. |

## Decisions made

1. **Departed means start date before today in London**, or status `expired` from the cron. A package with no start date stays listed.
2. **A departed package's URL shows a notice**, not a 404: "This departure has passed", a link to `/packages`, no enquiry form, `noindex`. The enquire page shows the same notice and the enquiry API refuses with 404.
3. **Cron left unchanged.** The read path now hides departed packages whatever the cron does. Fixing its end-date cast and switching it to departure dates would change production data each night, so it is listed below for Ali instead.
4. **Lowest price flag only for equal trip lengths.** With different nights, no price flag shows; every column shows its nights next to its price.
5. **Mark wording**: "Highest star rating", "Shortest distance", "Most items included", "Lowest price in this comparison", plus a visible note that marks compare only the packages shown.
6. **Compare row label** "Distance to Haram" became "Distance to the mosque", because the Madinah line measures to the Prophet's Mosque.
7. **Verification notice** uses a shorter form of the §7 statement (`VERIFICATION_STATEMENT_SHORT` in `lib/content-rules.ts`) with all three checks, "at the time of listing" and all three non-guarantees, and always links the full approved statement. The full statement is unchanged and still used on the homepage, `/partner` and `/how-we-rank`.
8. **/signup** is pilgrim-only while operator self-serve stays parked; operators are sent to `/partner`.
9. **UX-17** uses an opaque page wrapper rather than `body:has()`, because Lightning CSS drops `:has()` rules for Next's default browser targets (no `browserslist` in the repo).
10. **Tap targets**: inline links in sentences get vertical padding (24 px or more, text does not move); standalone controls get 44 px. Footer list links are 44 px on phones and 24 px on desktop.
11. **Trip length is a preference**, like budget: packages outside it show under close matches with a reason rather than vanishing.

## UX-08 options (not done)

`/packages` (browse: canonical `/packages`, sitemap priority 0.8, daily) and `/search/packages` (search: canonical `/search/packages`, priority 0.6) list the same packages from the same query layer.

- **A. Keep both, de-duplicate for search engines.** `/search/packages` gets `rel=canonical` to `/packages` and filtered URLs are `noindex`. Smallest change; users still meet two list designs.
- **B. One list at `/packages` (recommended).** `/packages` takes the full filter panel and results; `/search/packages?...` returns a 308 to `/packages?...` with the query kept; the sitemap drops `/search/packages`; the `/umrah` form and internal links point at `/packages`. One URL collects all ranking signals, no duplicate content, and the canonical, higher-priority URL is kept. Cost: one redirect, link updates and e2e updates.
- **C. One list at `/search/packages`.** The same as B in reverse, but it gives up the canonical, higher-priority `/packages` URL.

## Not done, and why

- **UX-08, UX-11, item 9:** out of scope by instruction.
- **Cron hardening** (decision 3): guard the `::date` cast against empty or malformed end dates, and decide whether to expire on departure or return date. This changes production data, so it needs Ali's decision. A ready test exists in the real-DB suite (the cron call in `search-journey.spec.ts`).
- **Staging email proof:** needs the PR preview; steps above for Claude in Chrome.

## Tests added

`tests/email-after-routes.test.ts`, `tests/departed-packages.test.tsx`, `tests/compare-distance.test.ts`, `tests/operator-name-ssr.test.tsx`, `tests/image-fallbacks.test.tsx`, `tests/compare-contrast.test.ts`, `tests/compare-bar.test.tsx`, `tests/pages-group.test.tsx`, `tests/min-text-size.test.ts`, `tests/search-filters-airport-duration.test.tsx`; extended `tests/enquiry-api.test.ts`, `tests/comparison-table.test.tsx`, `tests/auth-components.test.tsx`, `tests/no-em-dash.test.ts`, `tests/operator-form-defaults.test.ts`. Real DB: `e2e/local-db/seo-titles.spec.ts`, `e2e/local-db/mobile-targets.spec.ts`, and new tests in `e2e/local-db/search-journey.spec.ts` (departed package and cron, phone widths, two-line hotel names, airport and trip length filters). Local seed: package 16 (departed) and 17 (long title and hotel names).

## Every user-visible wording change

| Where | Before | After |
| --- | --- | --- |
| Departed package page and enquire page | (package page with enquiry form) | "This departure has passed" / "<title> departed on <date>. You can no longer send an enquiry for it." / "Browse current packages" |
| Departed package page title | package title | "This departure has passed" |
| Compare row label | "Distance to Haram" | "Distance to the mosque" |
| Compare distance values | "Makkah near / Madinah near" | "Makkah: 350 m from the Haram (Grand Mosque), about a 4-minute walk" (one line per city; band wording when no metres; "Not provided" per missing city) |
| Walking estimate | "about a 8-minute walk" | "about an 8-minute walk" (also 11, 18, 80 to 89) |
| Package page distance band | "roughly a 10[en dash]20 minute walk" | "roughly a 10 to 20 minute walk" |
| Signup password hints | "(A[en dash]Z)", "(a[en dash]z)", "(0[en dash]9)" | "(A to Z)", "(a to z)", "(0 to 9)" |
| /umrah travellers | "Children (0[en dash]11 years)" | "Children (0 to 11 years)" |
| /umrah budget label | "GBP 500 [en dash] 3,000" | "GBP 500 to 3,000" |
| Filter panel budget | "£300 [en dash] £3,000" | "£300 to £3,000" |
| Active budget chip | "£500[en dash]£2,000" | "£500 to £2,000" |
| Operator onboarding | "within 1[en dash]2 business days" | "within 1 to 2 business days" |
| Settings name error | "Name must be 1[en dash]100 characters." | "Name must be 1 to 100 characters." |
| Operator leads budget | "Budget: £0[en dash]£2000" | "Budget: £0 to £2000" |
| Wizard distance bands | "Near Haram (0[en dash]500m)", "Medium (500m[en dash]2km)" | "Near Haram (0 to 500m)", "Medium (500m to 2km)" |
| Wizard policy placeholder | "50% refund 30[en dash]59 days" | "50% refund 30 to 59 days" |
| Mock data cancellation policies (dev and e2e only) | "45[en dash]15 days" and similar | "45 to 15 days" and similar |
| Page titles (20 pages) | "<page> \| PilgrimCompare \| PilgrimCompare" | "<page> \| PilgrimCompare" |
| Package page title | "<title> by <operator> \| Compare on PilgrimCompare \| PilgrimCompare" | "<title> by <operator> \| PilgrimCompare" |
| /how-it-works title | "How PilgrimCompare Works \| Compare Umrah Packages from Verified UK Operators \| PilgrimCompare" | "How It Works: Compare Umrah Packages from Verified UK Operators \| PilgrimCompare" |
| /partner title | "List Your Umrah & Hajj Packages on PilgrimCompare \| PilgrimCompare" | "List Your Umrah & Hajj Packages \| PilgrimCompare" |
| Card operator name, unknown operator | (blank, screen readers: "Loading operator name") | "Not provided" |
| Card hotel photo placeholder | "Hotel Image" (in the image) | (no text; icon tile) |
| Compare column header | operator and price | operator, package title, price, "N nights" |
| Compare bar chip | operator name (fallback: package title or "Selected package") | operator name and "N nights · <title>" (fallback "Not provided") |
| Compare price flag | "LOWEST PRICE" | "Lowest price in this comparison" (only when nights are equal) |
| Compare marks | "BEST" (screen readers: "best-rated hotels", "closest to the Haram", "most included") | "Highest star rating", "Shortest distance", "Most items included" (screen readers add "among these packages") |
| Compare caption (screen readers) | "Package comparison. Best value on each row is marked." | "Package comparison. Marks show the highest star rating, shortest distance and most items included among these packages, and the lowest price when all have the same number of nights." |
| Compare note (new) | none | "Marks compare only the packages shown here, using the details each operator gave us." |
| /signup | Operator tab by default, "Operator Registration" | Pilgrim form ("Create Account"); "Travel company? See how operators list packages" |
| /signup description (meta) | "Sign up for a PilgrimCompare traveller or operator account." | "Create a PilgrimCompare traveller account to save packages and send enquiries." |
| /login partner tab | "Don't have an operator account? Register your company" | "Want to list your packages? See how operators join" (to /partner) |
| /login password helper | "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character." | (removed) |
| 404 | "Page not found" (h2) / "The page you're looking for doesn't exist." / "Go home" | "Page not found" (h1) / "The page you are looking for does not exist or has moved." / "Browse packages", "Go home" |
| Package page | "Sold by <operator>" (plain text) | "Sold by <operator>" (link to operator page); "Save" / "Saved"; "Compare with other packages" |
| Operator notice (package and operator pages) | "Listed: This operator is registered on PilgrimCompare. Basic details have been collected." or "Verified: <full §7 statement>" | "How we verify operators" / "Before listing, we check this operator's ATOL number on the CAA's public register, its Companies House status and its UK trading address. These checks apply at the time of listing. They do not guarantee service quality, financial protection for your specific booking, or future conduct." / "Full statement" (unverified: "Verification not complete" / "We have not finished our checks on this operator.") |
| Homepage operator card | "Reach pilgrims comparing UK operators. We build your profile to rank at its best." | "Reach pilgrims comparing UK operators. We set up your listing with you, and no operator pays for ranking." |
| Filter panel (new) | none | "Departure airport", "Any airport", "Trip length", "Any length", "Up to 7 nights", "8 to 10 nights", "11 to 14 nights", "15 nights or more" |
| Close-match reason (new) | none | "Trip length: N nights" |
| Active filter chip (new) | none | the trip length label, for example "8 to 10 nights" |

The three mandated lines, the pricing wording, "Not provided" and the blank registered office are unchanged.
