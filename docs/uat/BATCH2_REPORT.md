# Batch 2 report: one package list, room prices, cron guard (2026-10-09)

Branch `fix/batch-2-single-list-room-prices` from `dev` `0e4ffa8` (batch 1 merged). One PR into `dev`, not merged. `main` (`a4e7075`) untouched. No production database or production Vercel change. No new dependencies. Nothing was applied to staging or production.

## Read this first: migration 015 is pending

The new code reads three new `packages` columns. Until `supabase/migrations-pending/015_package_room_prices.sql` is applied, every package query on that database fails.

- **Staging:** apply 015 to the staging project before checking the PR preview (Claude in Chrome, on Ali's instruction).
- **Production:** apply 015 before any release of this code to `main`.
- **Rollback:** `supabase/migrations-pending/015_package_room_prices.rollback.sql`, only after the previous code is live again.

015 is additive: three nullable `numeric(10,2)` columns, no default, no backfill, no data change. It was rehearsed on the local database: applied, applied again (no-op), rolled back, applied again, and Prisma then reports no drift on `packages`.

## Test counts

| Suite | Baseline (dev `0e4ffa8`) | This branch |
| --- | --- | --- |
| Unit (Vitest) | 2,169 | 2,265 (81 files) |
| Repo Playwright | 69 passed, 6 skipped | 69 passed, 6 skipped |
| Real database (`npm run e2e:local-db`) | 32 of 32 | 37 of 37 |
| `tsc --noEmit`, lint, build | pass | pass (lint: the 2 existing warnings only) |

Every behaviour fix has a test that fails on the old code and passes on the new. The commit messages record each before and after result.

## Per item

### 1. Cron hardening: expire-packages (DONE)

**Problem:** the cron cast `date_window->>'end'` to a date in SQL. The operator wizard saves an empty end when only a start date is entered, and `''::date` throws, so the whole nightly run returned 500 and expired nothing.

**Change:** `app/api/cron/expire-packages/route.ts` reads the end date as text and checks it in code (`storedEndDay` in `lib/listing.ts`). Empty, missing and malformed values (for example `2026-02-30`) are skipped, each with one log line:

`[cron/expire-packages] skipped id=<id> title="<title>": end date "<value>" is empty or not a valid date`

The rule is unchanged: published (or `active`) packages whose end date is before the database's `CURRENT_DATE` become `expired`. The response now also lists the skipped ids. No SQL change to any database.

**Tests:** real DB, one run with an empty end, a malformed end and a past end: before, 500 (`invalid input syntax for type date: ""`); after, 200, only the past one expired, two skip lines in the server log. Unit: `storedEndDay` cases and the exact log lines.

### 2. UX-08 option B: one list at /packages (DONE)

- `/packages` now renders the full search list: filter panel, active filter chips, close matches, departure airport and trip length filters, sort, saved list, compare and pagination, all with state in the URL. The browse page's All, Umrah and Hajj tabs moved onto it and now use the URL (`?type=`). `/packages?compare=<id>` still arrives with that package selected.
- `/search/packages` and `/search/packages?...` answer **308** to `/packages` and `/packages?...` with every query parameter kept. The redirect is in `next.config.ts` (`redirects()`, `permanent: true`), not in client code.
- `app/search/packages/page.tsx`, `components/packages/PackagesBrowse.tsx` and its stylesheet are removed.
- The sitemap no longer lists `/search/packages`. Canonical for `/packages` stays `/packages`. No page keeps a canonical, alternate or JSON-LD id pointing at `/search/packages`.
- Every internal link points at `/packages`: the `/umrah` search form, the hero and home buttons, the compare preview, city corridor links, departure city links, breadcrumbs on package, enquire and operator pages, the enquiry form, `/how-we-rank`, `/umrah/cost` and `/umrah/ramadan`.

**Tests:** unit (`tests/single-package-list.test.tsx`): the redirect config, no page left, the sitemap, no link, canonical or alternate in `app`, `components` or `lib`, and the type tabs writing the URL. All 5 fail on the previous commit. Real DB: 308 with the query kept (and without a query), the sitemap, the canonical, no link or form to the old URL on 11 pages, the filter panel on `/packages`, and the batch 1 phone width test at 320, 360 and 390 px. Every unit and Playwright test that visited `/search/packages` now visits `/packages`.

### 3. Item 9 and UX-11: optional per room prices (DONE; closes UX-11)

**How the headline price is stored today, and followed:** `price_per_person numeric(10,2)` in the package's own `currency` (GBP only in the wizard), validated as a number greater than 0, shown exactly as stated by `formatStatedPrice` (never converted or rounded), attributed "As stated by <operator>, updated <date>" from the package's `updated_at`.

**New fields:** `price_quad_per_person`, `price_triple_per_person`, `price_double_per_person`, all `numeric(10,2)`, nullable, no default (Prisma `priceQuadPerPerson`, `priceTriplePerPerson`, `priceDoublePerPerson`). NULL means not stated and reads "Not provided"; a stated price must be greater than 0, so empty is never stored as zero.

- **Operator side:** the package wizard (also the edit form: editing opens the same wizard with the package loaded) has three optional fields on the Pricing step, "Quad room (4 sharing)", "Triple room (3 sharing)" and "Double room (2 sharing)", with a short note that blank shows as "Not provided". Blank sends `null`, so an edit can clear a price. The review step lists them. The API validates each as a number greater than 0 or null.
- **Pilgrim side, package page:** a "Prices by room type" block in "Price & payment", only when at least one is stated. Each stated line reads, for example, "£1,095 per person" with "As stated by <operator>, updated <date>" under it; a missing one reads "Not provided".
- **Pilgrim side, compare:** three rows in "Price & flexibility", one per room type. Each cell is the stated price with the same attribution line, or "Not provided". The rows carry no rank, so no mark ever compares a missing value.
- **Unchanged:** the headline "From" price everywhere, sort, filters, close matches and the lowest price flag all still use `price_per_person` only.
- **CSV:** export adds `priceQuadPerPerson`, `priceTriplePerPerson`, `priceDoublePerPerson` (blank when not stated). Import reads them when present; an older CSV without the columns imports as before, with the room prices not stated. A room price of 0, a negative number or text refuses that row with "<room> price must be a positive number or blank".
- **Migration:** see the top of this report. Local setup (`e2e/local-db/setup.sh`) now also runs 015 on every local and CI real-database run, so the file is proven to apply cleanly each time.

**Tests:** `tests/room-prices.test.tsx` (15) and a room price case in `tests/package-patch-partial.test.ts`: validation (stated, null, absent, 0, negative, text, NaN, clearing on edit, the wizard message), formatting, the package page with none, one and three stated, the headline price unchanged, the compare table with mixed missing values and no marks. `tests/package-csv-roundtrip.test.ts`: the three fields round trip, an old CSV without the columns, blank export, and bad values refused. Real DB: through Postgres via the operator edit API (stated, refused 0, cleared to NULL) and CSV export; the package page for packages with three, one and no room prices; compare with mixed values and no marks.

### 4. CSV round trip for the other rich decision fields (DONE)

The fields named in the brief (group type, cancellation policy, payment plan, hotel stars and names, distance bands, inclusions, ziyarat included and details) already round tripped through export and import: an earlier PR fixed them, and one existing test covered them together. This batch makes it one test per field, run on two packages so both states of each field are covered (true and false, stated and not stated, every enum value side).

That found one real loss, now fixed: the import read `depositAmount` and the two stated distances with `Number(x) || undefined`, so a stated £0 deposit (and a stated 0 m distance) came back as "Not provided". They now keep 0. Before: the `depositAmount` round trip test failed (0 became undefined). After: 33 fields by 2 packages, all pass.

Not in the CSV, by design and unchanged: `highlights` and `images` (neither is a column in the export today), `slug`, `id` and `status` (an import always creates new packages, published only when the file says `published`).

### Found on the way: a partial package PATCH reset other fields (FIXED)

While testing room price edits through the real database, a PATCH that sent only room prices also unpublished the package. `updatePackageSchema` is `packageSchema.partial()`, and Zod 4 (4.4.3 here) still fills `.default()` values inside a partial schema, so any PATCH set `status` to `draft` and reset distance bands to `unknown`, inclusions to not stated, room types to none and currency to GBP unless the request sent them. The wizard always sends the whole package, so the UI never hit it. `app/api/operator/packages/route.ts` now applies only the keys the request body contains. Test: `tests/package-patch-partial.test.ts` (before: a one-field PATCH left the package as `draft`; after: only that field changes, and a room price edit or `null` clear leaves the rest alone). The real-database room price test also depends on it.

### 5. Docs (DONE)

`STATUS.md`, `HANDOFF.md`, `AI_NOTES.md` (§B2) and `docs/BACKLOG.md` are updated. `BACKLOG.md` records: the cron still expires on the return date (decision pending: departure date or return date), and migration 015 is pending and needs the staging rehearsal, then production, by Ali. Current-state docs that named `/search/packages` as a live route now name `/packages`; historical reports and release notes keep the old path as history.

## Not done, and why

Nothing in the work list was parked. Left out on purpose:

- **Applying migration 015 to staging or production:** by instruction. Claude in Chrome applies it to staging on Ali's instruction; production is Ali's.
- **The cron's expiry date:** by instruction, only the guard changed. The cron still expires on the return date (decision pending, in `docs/BACKLOG.md`).
- **Writing room prices from the staging seed into the new columns:** it would break `npm run seed:staging` until 015 is on staging (decision 10, in `docs/BACKLOG.md`).
- **`highlights` and `images` in the CSV:** they were never CSV columns and were not part of the named gap.

## Tests added

- **Unit, new:** `tests/expire-packages-cron.test.ts`, `tests/single-package-list.test.tsx`, `tests/package-patch-partial.test.ts`, `tests/room-prices.test.tsx`.
- **Unit, extended:** `tests/package-csv-roundtrip.test.ts` (one test per field on two packages, room price columns, old CSV, bad values), `tests/banned-phrases.test.ts` (the `/packages` metadata strings, replacing the removed search page strings).
- **Unit, moved to the one list:** `tests/packages-browse.test.tsx` became `tests/packages-shortlist.test.tsx`; `tests/operator-name-ssr.test.tsx` and `tests/pages-group.test.tsx` render the `/packages` list; the search filter and featured slot tests use the `/packages` path.
- **Real DB, new:** `e2e/local-db/room-prices.spec.ts` (package page and compare); in `trust-and-account.spec.ts` the cron guard; in `search-journey.spec.ts` the 308, sitemap, canonical and link check; in `operator-access.spec.ts` the room price round trip through Postgres and CSV export.
- **Updated:** every unit and Playwright test that visited `/search/packages` (real DB and `e2e/slider-consistency.spec.ts`).

## Decisions made

1. **Pilgrimage type tabs** from the old browse page are kept on `/packages`, as URL state (`?type=umrah`), so a visitor arriving from the `/umrah` form can see and change the type.
2. **Season:** the browse page's season dropdown (exact operator labels) is replaced by the filter panel's season choice, which the search page already had. Nothing the search page offered is lost.
3. **Saved chip:** follows the search page: it appears once something is saved (the browse page showed "Saved (0)").
4. **Header and footer:** the "Compare" header link and the "Compare Packages" footer link pointed at `/search/packages` and would now duplicate "Packages" and "Browse Packages", so they are removed. The operator page breadcrumb "Search" became "Packages".
5. **Page heading:** `/packages` keeps its visible "Browse packages" heading and subtitle and its metadata; the search page's sr-only heading and count-based title went with the route.
6. **Room price labels:** "Quad room (4 sharing)", "Triple room (3 sharing)", "Double room (2 sharing)", shown in that order.
7. **Room prices are never ranked** in compare and do not feed sort, filters or the lowest price flag.
8. **Room price attribution** uses the package's existing "As stated by <operator>, updated <date>" line from `updated_at`, the same source as the headline price.
9. **CSV:** a non-blank room price that is not a positive number refuses that row (the operator sees why), rather than being dropped silently.
10. **Staging seed not changed:** it already states fictional room prices in operator notes. Writing them into the new columns would make `npm run seed:staging` fail until 015 is applied, so the staging proof sets two fictional packages by hand instead (below), and the seed change is in `docs/BACKLOG.md`.
11. **Legacy `components/operator/PackageForm.tsx`** is not rendered anywhere (already noted in `tests/client-data-guard.test.ts`), so it is not changed.

## Staging proof (Claude in Chrome, on the PR preview)

**Before anything else:** apply `supabase/migrations-pending/015_package_room_prices.sql` to the **staging** project (SQL editor), on Ali's instruction. Then run its read-only check query (at the bottom of the file): three rows, `numeric`, precision 10, scale 2, nullable `YES`. Until then the preview's package pages fail.

1. **Redirect:** open `<preview>/search/packages?departureAirport=LHR`. The address bar ends `/packages?departureAirport=LHR`, the page shows the "From London Heathrow" filter chip, and DevTools Network shows the first request answered `308`.
2. **Sitemap:** open `<preview>/sitemap.xml`. It lists `/packages` and does not contain `/search/packages`.
3. **Room prices:** in the staging SQL editor, give two fictional packages the room prices their seed already states in operator notes:
   ```sql
   UPDATE packages SET price_quad_per_person = 1295, price_triple_per_person = 1395, price_double_per_person = 1595 WHERE slug = '10-night-umrah-from-manchester-december-10';
   UPDATE packages SET price_quad_per_person = 799, price_triple_per_person = 849 WHERE slug = '7-night-budget-umrah-from-manchester-january-12';
   ```
   (Undo: `UPDATE packages SET price_quad_per_person = NULL, price_triple_per_person = NULL, price_double_per_person = NULL WHERE slug IN ('10-night-umrah-from-manchester-december-10', '7-night-budget-umrah-from-manchester-january-12');`)
   - `/packages/10-night-umrah-from-manchester-december-10`: "Prices by room type" shows £1,295, £1,395 and £1,595 per person, each with "As stated by Test Northern Umrah Services, updated <date>". The headline price is unchanged.
   - `/packages/7-night-budget-umrah-from-manchester-january-12`: the block shows quad and triple; "Double room (2 sharing)" reads "Not provided".
   - `/packages/7-night-off-peak-umrah-from-manchester-may-16`: no "Prices by room type" block.
   - On `/packages?departureCity=Manchester`, tick Compare on those three packages (10 December, 12 January, 16 May) and press Compare: three room type rows; package 16's cells all read "Not provided", package 12's double reads "Not provided", and no mark appears on those rows.

## Every user-visible wording change

| Where | Before | After |
| --- | --- | --- |
| `/search/packages` | search results page | 308 to `/packages` (query kept) |
| `/packages` | browse grid: type tabs, season and sort dropdowns, "Saved (N)" | the search list under the same "Browse packages" heading: type tabs, Filter, Sort, active filter chips, close matches, pagination, "Saved (N)" once something is saved |
| `/packages` failure state (new on this URL) | "Unable to load packages right now." | "We couldn't load packages right now" / "This is usually a brief connection hiccup. Please refresh in a moment. Your search is still saved in the address bar." / "Try again" (the search page's wording) |
| Header navigation | "Packages", "Compare", "How it works" | "Packages", "How it works" |
| Footer, Platform | "Browse Packages", "Compare Packages", ... | "Browse Packages", ... |
| Operator page breadcrumb | "Search" | "Packages" |
| Wizard, Pricing step (new) | none | "Price per person by room type (£), optional" / "Leave a room type blank if you do not price it separately. Pilgrims see blank as "Not provided", never £0." / "Quad room (4 sharing)", "Triple room (3 sharing)", "Double room (2 sharing)" / placeholder "Optional" |
| Wizard error (new) | none | "<room>: the price must be greater than 0, or left blank." |
| Wizard review step (new rows) | none | "Quad room (4 sharing)", "Triple room (3 sharing)", "Double room (2 sharing)" with the price or "Not set" |
| API validation (new) | none | "Room prices must be greater than 0, or left blank" |
| Package page (new block) | none | "Prices by room type" / "<room>" / "£X per person" / "As stated by <operator>, updated <date>" / "Not provided" |
| Compare (new rows) | none | "Quad room (4 sharing)", "Triple room (3 sharing)", "Double room (2 sharing)": "£X per person" and "As stated by <operator>, updated <date>", or "Not provided" |
| CSV export (new columns) | none | `priceQuadPerPerson`, `priceTriplePerPerson`, `priceDoublePerPerson` |
| CSV import error (new) | none | "<room> price must be a positive number or blank" |

The three mandated lines, the pricing wording (10 pounds per lead or 79 pounds a month, founding first 8 operators 12 months free), "Not provided" and the blank registered office are unchanged.
