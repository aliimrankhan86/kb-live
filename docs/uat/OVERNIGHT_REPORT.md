GREEN WITH OPEN ITEMS

# PilgrimCompare QA run: final report

**Branch:** `fix/overnight-qa` (from `dev` @ `d03892d`).
**Setup:** isolated worktree, its own local Supabase stack and labelled local test data. Production was never reachable.
**Result:**
- Two consecutive full gates are green, including a clean verification run.
- No P0, P1 or P2 defects are open, except the items that need Ali (listed below).

## Gate results (final, after a clean `npm ci` and a fully rebuilt local database)

| Check | Baseline | Final |
|---|---|---|
| Vitest | 1,869 (restart baseline 1,974) | **2,047 / 2,047** |
| tsc / lint / build | pass / 0 errors / pass | pass / 0 errors (2 pre-existing warnings) / pass |
| Repo Playwright (`--workers=1`, chromium + firefox + webkit) | 64 pass, 2 fail (parallel MockDB race) | **69 passed · 6 skipped · 0 failed** |
| Real-DB Playwright (`e2e/local-db`, committed, CI job `local-db`) | n/a | **24 / 24** (after review follow-up: see below) |

The real-DB suite covers:
- **The reported tab/search mismatch:** closest matches, empty state, and URL, reload and back.
- **Operator and admin:** operator dashboard, CSV import/export, profile save, access control, and the admin pages.
- **Listing and display:** verified-only listing, an uploaded image under the CSP, price attribution, and three-state inclusions.
- **Content:** guide pages with no PilgrimCompare prices or dates.
- **Accounts:** password reset end to end through a real email link (local Mailpit), and real account deletion.
- **Layout:** 1280, 768 and 375 px with no console errors and no sideways scrolling.

## The reported problem (fixed and verified)

The browse tab and search read the same packages; the search filters lost them. Six root causes:
1. The form silently applied Heathrow and a £500 to £1,000 budget.
2. Corridor links (`departureCity`) were ignored.
3. Airports matched by code only, so London did not include Gatwick or Stansted.
4. The budget maximum was dropped silently.
5. Travel dates were ignored, and the Ramadan dates shown were wrong.
6. "Clear all" could not remove the airport.

The fix is one shared query layer and one card mapping:
- Must-haves (type, location, dates) apply strictly.
- When exact matches are few, closest matches are shown with what differs.
- The empty state is honest.
- Search state lives in the URL.

Before/after proof: `.overnight/evidence/before-fix-probe.txt`.

## Defects fixed

**Iteration 1**
- D-001..008 search: 5e6820e
- D-011, D-015 open redirects: f9c3a28
- D-010 operators API: a99abb8, c9ff44e
- D-018 operator portal used the browser MockDB in production: 8215921, 38cab15, 2be7229, 39ecef0
- D-017 database adapter: 9b6513a
- D-029 invented structured data: 00ec11b
- D-026, D-028 package-page protection copy and "?★": 19de3e0
- D-034 enquiry data-sharing disclosure: 1938d90
- D-009 CSV: 8215921
- D-030, D-031 fake showcase content and /partner: a8c7dd1, 656ce6f
- D-035 parked links: 66680ff
- D-032, D-033 overflow: c52b7fe, c55236c

**Iteration 2 (Ali's order)**
- D-019 account deletion: 4bc9eea
- D-030 guide pages: 3654c6d
- D-020 image CSP: 76bf57b
- D-014 password reset: f0627c2, plus three issues found by the real-browser test (reset link host via the Origin header, `/auth/confirm` host, and the Supabase origin in `connect-src`)
- D-036 operator name and price date beside prices: 6043fde

**Ali's decisions**
- Verified-only listing: e4072a3
- Three-state inclusions: 1381205
- ATOL/ABTA check-date migration, written and **not applied**: 2ceb5d0 (`supabase/migrations-pending/013_…`)
- Registered office as a single unset config value: a7cd91a

**P2**
- aeb8752 sort disclosure
- 7ea3e1a no internal errors shown to users
- 439b7b8 robots
- 4d02df8 fonts
- eb1416d no pre-selected room types
- 1cb4fa9 compare dates row
- 42f4918 card operator fallback
- 3832dab parked-flow wording
- 9e73f86 real-file banned-phrase scan
- 281c4a6 em dashes and the 48-hour claim
- 2c75983 city links
- 531bc86 onboarding status
- f204dbc GDPR self-claim
- 0367791 nested `<main>`

Full register: `.overnight/STATE.md`.

## Tests added (about 180)

- Search: search-journey, umrah-search-form, seed-guard
- Auth and accounts: auth-redirect, login-redirect, password-reset, account-delete, email-transport
- Operators and data: public-operators, package-csv-roundtrip, db-adapter-parity, operator-profile-api, client-data-guard, verified-only-listing
- Truth and content: package-detail-truth, enquiry-disclosure, json-ld-truth, content-truth, banned-phrases-files, no-em-dash, registered-office
- Display: price-attribution, inclusions-three-state, sort-disclosure, rfq-parked-links, image-csp
- Hygiene: no-internal-errors, robots, landmarks

Existing tests updated for new behaviour, with their assertions kept:
- operator-surfaces now asserts the server API PATCH.
- enquiry-api mocks the public lookup.
- public-operators is verified-only.
- phase2 now writes "missing" as `null`.
- E2E slider, wizard and bank cooling text match the new UI.

## Decisions taken (please review)

- **Search:** must-haves are type, location and dates. Closest matches appear when there are fewer than 3 exact matches. Distance is measured to the Makkah hotel. The form defaults to Any airport / Any dates / no budget.
- **Operator self-service:** operators cannot change their own verification. A changed ATOL or ABTA number clears its check date.
- **Account deletion:** for customers linked to bookings or complaints, and for operator and admin accounts, the response is an honest 409 with the DPO email, and nothing is deleted.
- **Prices:** shown exactly as stated, never converted, with "updated" taken from `updatedAt`.
- **Local email:** a local-only log transport (`EMAIL_LOG_PATH`) is used. It never runs on Vercel production.
- **Layout:** desktop nav from 1024px; only the root layout renders `<main>`.

## Copy needing approval

The full list is in `.overnight/STATE.md` ("New/changed user-facing copy"), plus the em-dash rewrites in commit 281c4a6. It covers:
- **Search:** notices, chips, closest-match reasons, the empty state, and the "Any dates" / "Any airport" form options.
- **Package page:** the price attribution line, protection/ATOL copy, and the nights format and "Not provided" variants.
- **Journeys:** the enquiry data-sharing line, the account deletion messages and the reset-password page.
- **Content pages:** city, Ramadan, Hajj and cost guides, and /partner.

## Needs Ali

1. **Registered office address** (§2, launch-blocking): set `REGISTERED_OFFICE` in `lib/legal.ts`.
2. **Production checks:** run `supabase/migrations-pending/PRODUCTION_CHECKS.sql` in the Supabase SQL editor, one query at a time. If query 1 shows any FAIL, review and apply `014_revoke_api_role_writes_operator_profiles.sql`. Check the redirect allow-list against the list at the bottom of that file (`https://pilgrimcompare.co.uk/auth/confirm**`, no `*.vercel.app` wildcard).
3. **Migration 013:** only after step 2. Move it into `supabase/migrations/`, apply it when ready, then ship the Prisma and adapter change described in the file.
4. **Images:** `public/og.png` is 1×1 and `apple-touch-icon.png` is an SVG. A real 1200×630 brand image is needed; none was invented.
5. **Enquiry retention:** the privacy page says "auto-deleted after 90 days", but no deletion job exists. Decide the policy, then either build the job or change the wording.
6. **Docs:** four documents named in the original brief are not in the repo.

## Follow-up after the independent review (2026-10-06)

Resolution table: `docs/uat/PR108_REVIEW.md`. In short:
- **Real-DB suite committed and in CI:** `e2e/local-db/` plus a `local-db` CI job (throwaway Supabase in the runner, public local keys only). CI also runs lint and build now.
- **Account deletion:** erases data first and the sign-in last, so every step can be retried. Enquiries are anonymised and marketing consents deleted.
- **Listing:** a verified operator with no ATOL number is not listed. An operator changing its ATOL number goes back to pending.
- **Production checks:** read-only SQL for Ali, plus pending migration 014 if a grant gap shows.
- **Open review P3s:** `websiteUrl` scheme; full operator object in the package page payload; reset page accepts any session; `requestOrigin` trusts proxy headers; email log transport on previews; admin ATOL verify does not persist before 013; dashboard shows quote notes to all operators; partner page "1 to 2 business days"; parked onboarding hardcoded reason.

## Logged only (P3)

- CSP `style-src 'unsafe-inline'` (`script-src` is nonce-only).
- The E2E build bakes `E2E_TESTING` into `.next`.
- Upstash `webpackIgnore` imports are unverified on Vercel.
- Parked-flow APIs are not flag-gated.
- `/api/outcomes` writes on a GET request.
- The middleware static-file regex never matches.
- Playwright has a parallel MockDB race.

## CSV round trip

Touched: import and export are now server-side and keep every decision field (round-trip test).

## Next step for Ali

1. Review and merge the pull request into `dev`. It was not merged here.
2. Do "Needs Ali" items 1 and 2 before going live.
3. Run `docs/uat/SEARCH_JOURNEY_UAT.md`.
4. Refresh `PILGRIMCOMPARE_HANDOFF.md`.
