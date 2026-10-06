NOT READY (overnight run in progress; this report is updated after every iteration)

# PilgrimCompare overnight QA report

Branch `fix/overnight-qa` (from `dev` @ `d03892d`). Run in an isolated worktree against a **local** Supabase stack with labelled local test data. Production was never reachable: every database and Supabase URL pointed at 127.0.0.1, and there were no Resend, Upstash or other external keys.

## Status at a glance

| Item | State |
|---|---|
| Iterations completed | 1 (iteration 1 gate in progress) |
| Reported problem (tab and search show different packages) | **Fixed and verified** by unit tests and real-browser tests against the local DB |
| Defects found / fixed / open | 52 logged · 28 fixed (some partially) · see the table |
| Vitest | 1,974 / 1,974 (baseline 1,869; the brief quoted 1,833) |
| Type check / lint / build | pass / 0 errors (2 pre-existing warnings) / 0 errors |
| Real-DB Playwright (`.overnight/e2e`) | 18 / 18 |
| Repo Playwright (serial) | see the latest gate section |

## The reported problem: root causes

The browse tab (`/packages`) and the search results read from the same database query. The search results lost packages because of the filter layer and the search form:

1. **The search form had hidden defaults.** An untouched form searched Heathrow only, with a £500 to £1,000 budget, so most real packages disappeared.
2. **Corridor links did nothing.** "Browse Umrah packages from London" sent `departureCity=London`, and the filter ignored that parameter. It showed every city.
3. **Airport matching was code-only.** "London" did not match Gatwick or Stansted, and an airport typed as text (for example from a CSV) never matched.
4. **The budget maximum was dropped without saying so.** When nothing fitted the budget, the filter quietly ignored it and showed over-budget packages as matches.
5. **Travel dates were sent but ignored.** The Ramadan preset also said "Approx. May to Jun", which is wrong.
6. **"Clear all" and "Reset filters" could not remove the airport filter,** so a traveller could get stuck on an empty page.

**What happens now:**
- **One shared query layer** (`components/search/search-utils.ts`) and one location mapping (`lib/airports.ts`).
- **Must-haves apply strictly:** pilgrimage type, departure location and dates, each only when the traveller set it.
- **Other choices are preferences.** When exact matches are few, the page shows "Closest matches" and lists what differs on each card. Missing data reads "Not provided".
- **The empty state is honest** and offers a way out.
- **Search state lives in the URL,** including the page number.
- **One card mapping and one date and nights format** are shared by search, featured and browse.

Proof that the tests failed before the fix and pass after it is in `.overnight/evidence/before-fix-probe.txt` and `after-fix-probe.txt`.

## Defects

| ID | Sev | Summary | Status |
|---|---|---|---|
| D-001..007 | P1 | Search silently lost packages (6 root causes above) | Fixed 5e6820e |
| D-008 | P0 | Ramadan preset showed wrong months | Fixed 5e6820e |
| D-011 | P0 | Open redirect via `/auth/confirm?next=//evil.com` | Fixed f9c3a28 |
| D-015 | P0 | Open redirect via login `?redirect=` | Fixed f9c3a28 |
| D-010 | P0 | Public `/api/operators` exposed internal eligibility flags | Fixed a99abb8 |
| D-018 | P0 | Operator dashboard, analytics, profile save, CSV import/export and complaints inbox used the browser MockDB in production (seed data shown, writes lost) | Fixed 8215921, 38cab15, 2be7229, 39ecef0 (with guard test) |
| D-029 | P0 | Structured data invented a nights split, a £0 price, "InStock" and a founding date | Fixed 00ec11b |
| D-026 | P0 | Package page said PilgrimCompare "does not verify ATOL/ABTA", contradicting §7, and labelled ABTA as verified | Fixed 19de3e0 |
| D-028 | P0 | Package rail showed "?★" for missing stars | Fixed 19de3e0 |
| D-034 | P0 | Enquiry form did not say whose hands the details go into (§12) | Fixed 1938d90 |
| D-017 | P1 | Prisma adapter missing booking-outcome methods: operator leads and admin reconciliation threw in production | Fixed 9b6513a |
| D-009 | P1 | CSV import invented values, dropped ziyarat and broke on line breaks | Fixed 8215921 (round-trip test) |
| (new) | P1 | Operators could change their own verification status and keep an old ATOL check date after editing the number | Fixed 2be7229 |
| D-032 / D-033 | P2 | Tablet header and mobile enquire page overflowed sideways | Fixed c52b7fe / c55236c |
| D-031 | P0 | Fabricated showcase content (fake testimonials, a real-sounding demo operator and ATOL number) | Fixed a8c7dd1 |
| D-030 | P0 | /partner unsupported claims ("Thousands", "commission", "already listing") | Fixed 656ce6f |
| D-030 (rest) | P0 | Corridor, Ramadan, Hajj and cost pages: hardcoded prices, implied supply, urgency, wrong Ramadan dates, blanket ATOL claims | Open |
| D-019 | P1 | Account deletion reports success but deletes nothing | Open |
| D-014 | P1 | Password reset is broken end to end (missing API route, missing /auth/callback, no set-new-password page) | Open (plan in STATE.md) |
| D-020 | P1 | CSP blocks uploaded package images | Open |
| D-035 | P1 | /requests and the header "My Requests" link go to a parked /quote (404) | Fixed 66680ff |
| D-036 | P1 | Price attribution and date (§6) missing | Open |
| Others | P2/P3 | See `.overnight/STATE.md` | Open / logged |

## Tests added

search-journey (36), umrah-search-form (4), seed-guard (5), auth-redirect (18), login-redirect (4), public-operators (1), email-transport (4), package-detail-truth (4), enquiry-disclosure (1), json-ld-truth (3), package-csv-roundtrip (4), db-adapter-parity (1), operator-profile-api (4), client-data-guard (2), content-truth (12), rfq-parked-links (3). One existing test changed: the operator-surfaces profile save now asserts the PATCH to the server API, where it previously relied on the browser MockDB.

## Decisions taken without Ali (please review)

These are recorded in `.overnight/STATE.md` under DECISIONS:
- The search form now defaults to any airport, any dates and no budget.
- Distance filters on the Makkah hotel only.
- When exact matches are few, closest matches are shown (up to 10).
- Desktop navigation starts at 1024px wide.
- A local email log transport is used when no Resend key is set.

## New or changed copy needing approval

The list is in `.overnight/STATE.md` ("New/changed user-facing copy"). It will be copied here in full at the end of the run.

## Needs Ali

- **Registered office address** (§2, launch-blocking). It cannot be invented.
- **Inclusions schema.** Inclusions are true/false only, so "not included" and "not stated" look the same.
- **Unverified operators are listed publicly.**
- **No per-number ATOL check date is stored in the database.**
- **Four documents named in the brief are not in the repo.**

## Next step

The run continues with iteration 2. Read the top line of this file for the current verdict.
