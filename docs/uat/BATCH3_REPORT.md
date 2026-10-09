# Batch 3 report: soft 404, staging seed room prices, copy hygiene (2026-10-09)

Branch `fix/batch-3-soft-404-and-cleanup` from `dev` `e571228` (batch 2 merged). One PR into `dev`, not merged. `main` (`a4e7075`) untouched. No production database or Vercel change. No SQL written or applied anywhere. The staging seed was changed but **not run** against staging. No new dependencies.

## Test counts

| Suite | Baseline (dev `e571228`) | This branch |
| --- | --- | --- |
| Unit (Vitest) | 2,265 as briefed; 2,264 tracked (see note) | 2,268 (81 files) |
| Repo Playwright | 69 passed, 6 skipped | 69 passed, 6 skipped |
| Real database (`npm run e2e:local-db`) | 37 of 37 | 39 of 39 |
| `tsc --noEmit`, lint, build | pass | pass (lint: the 2 existing warnings only) |

Note on the unit baseline: 2,265 included `tests/zz-zodcheck.test.ts`, a one-test debug file left untracked in the worktree by the batch 2 run. It was never committed, so CI never ran it. It is moved out of the repo. The tracked baseline is 2,264 in 80 files; this branch adds 4 unit tests.

Every behaviour fix has a test that fails on the old code and passes on the new. Each commit message records the before and after result.

## Per item

### 1. Soft 404 on unknown package URLs (DONE)

**Problem:** `/packages/does-not-exist` answered HTTP 200 with robots "index, follow" and a "Package not found" body. `app/packages/[slug]/page.tsx` rendered the message itself, and the `generateMetadata` fallback had no robots entry.

**Change:**
- A missing slug, or a package that is not published and has not departed, now calls `notFound()`. The response is HTTP 404, rendered by the new `app/packages/[slug]/not-found.tsx` with the same markup (`role="alert"`, `data-testid="package-not-found"`, heading "Package not found", text "This package is no longer available.") and robots noindex.
- The `generateMetadata` fallback returns `robots: { index: false, follow: false }`.
- The load error branch ("Unable to load this package right now.") stays a rendered message and adds `<meta name="robots" content="noindex, nofollow">` (React hoists it into `<head>`), so it is never indexable, even if `generateMetadata` loaded the package and only the page load failed.
- Unchanged: the departed notice (noindex, follow), published pages, the enquiry page and the enquiry API.

**Tests:**
- Unit, `tests/package-not-found.test.tsx` (4): `generateMetadata` on a missing slug is noindex, nofollow; a missing slug and an unpublished package call `notFound()`; `not-found.tsx` keeps the markup and is noindex; a load error keeps the message with the noindex tag. 3 of 4 fail on the old page.
- Real DB, `e2e/local-db/seo-titles.spec.ts`: `/packages/does-not-exist` and the seeded draft (`/packages/local-test-14`) return 404, every robots meta tag says noindex, the alert shows; the departed package (`local-test-16`) is still 200 with "noindex, follow" and a published package (`local-test-01`) is still 200 without noindex. On the old code it fails: "Expected 404, Received 200".
- The existing departed and published tests pass unchanged. `e2e/local-db/trust-and-account.spec.ts` checks the body text of two hidden packages and still passes. No test expected 200 for the not found page.

### 2. Staging seed learns room prices (DONE, not run on staging)

**Change:** `npm run seed:staging` (`scripts/seed-staging.mjs`) now writes each package's stated room prices into `price_quad_per_person`, `price_triple_per_person` and `price_double_per_person`. The numbers are the ones its operator notes state ("Room prices per person: Quad £1,295, Triple £1,395, Double £1,595."); a room the notes do not state stays NULL. Example: package 12 gets quad 799 and triple 849, double NULL.

**The seed was not additive before.** It deleted every row carrying the seed marker (plus analytics events, booking outcomes and complaints pointing at them) and inserted the dataset again, and it updated existing accounts, users and operators. On staging that would wipe UAT activity on seed packages and reset edits. To meet "idempotent, additive, never delete or reset", it now:
- inserts with `on conflict do nothing` and deletes nothing;
- uses an existing sign-in account as it is and never updates it (one without the seed marker is still refused);
- makes one write to an existing row: it fills a seed package's room price columns, only those that are empty, and only while the package's notes still read as seeded. A price someone already set is kept.

The production ref deny guard is unchanged. `docs/STAGING.md` (reseed and lost-password notes) is updated.

**Tests:** `e2e/local-db/staging-seed.spec.ts` runs `seedRows` on the local database inside one transaction that is rolled back, so the local suite's data is untouched. It first builds the staging state batch 2 left (seeded, no room prices), adds UAT changes (an analytics event on a seed package, a hand-set double price, edited notes, an operator phone edit), then runs the new seed. After: row counts in all 11 tables, the operators and every other package column are unchanged, the UAT event is still there, room prices equal the numbers parsed from each package's notes (others NULL), the hand-set price and the edited package are left alone, and a third run changes nothing. On the old seed it fails (the UAT analytics event is deleted). The existing `tests/staging-seed.test.ts` (19) passes.

### 3. Copy hygiene sweep (DONE)

**En dashes in ranges:** the signup password hints (A to Z, a to z, 0 to 9), `/umrah` "Children (0 to 11 years)" and the other ranges were already fixed on `dev` by batch 1 (`d38e259`); `docs/BACKLOG.md` listed them from production. A search of the whole repo found the rest:
- Demo seed data that renders on a page when used: `prisma/seed.ts` and `supabase/seed.sql` package titles ("7 Nights Umrah Package: Value", was an em dash) and cancellation policies ("50% refund 15 to 44 days", was an en dash). Neither seed is loaded on staging or production (`supabase/config.toml` has the seed disabled).
- 212 comment lines in 76 shipped source files (`app`, `components`, `lib`, `emails`, `hooks`, `styles`, `middleware.ts`, `next.config.ts`, `prisma.config.ts`): ranges read "to", a single dash became a colon, a paired aside became commas. Comments only.
- Not changed: tests, docs written before this batch, and developer scripts in `scripts/` (console output for developers, not shipped).

**Titles:** every public route was checked for a doubled "| PilgrimCompare | PilgrimCompare". None found: batch 1 (`0bcc889`) fixed them on `dev`. The real-DB title test now also covers routes outside the sitemap (`/login`, `/signup`, `/reset-password`, `/verify-email`, an enquiry form, a departed package and three not found pages), and fails if any public title names the brand more than once. Production still shows the doubled suffix until `dev` is released.

**Tests:** `tests/no-em-dash.test.ts` now checks comments too, plus `hooks`, `styles`, the root config files and both demo seeds. It fails on the previous commit and passes after.

### 4. Docs (DONE)

`docs/BACKLOG.md`: cron expiry decision recorded (return date, no code change) and the "decision pending" line removed; soft 404, staging seed room prices and copy hygiene marked done; still open: interests grants hardening (SQL, needs Ali's yes on staging) and migration 015 on production before any release to `main`. `STATUS.md`, `HANDOFF.md` and `AI_NOTES.md` (§B3) updated. The brief named `docs/STATUS.md` and `docs/HANDOFF.md`; the canonical files are at the repo root (`CLAUDE.md`), so those were updated and no new copies were made.

## Decisions made

1. **Cron expiry (given):** keeps expiring on the return date. No code change.
2. **Staging seed made additive** (see item 2). The previous delete and reinsert of seed rows conflicted with "never delete or reset". Smallest safe option: insert missing rows only, never update accounts, fill only empty room price columns while the notes are unchanged.
3. **A lost passwords file** (`staging-seed.config.local.json`) is no longer repaired by the seed, because that meant updating existing accounts. `docs/STAGING.md` now says to set the password in the Supabase dashboard instead.
4. **Load error robots:** a `<meta name="robots" content="noindex, nofollow">` tag in the error branch, in addition to the noindex metadata fallback, so the error page is noindex even when the two loads disagree.
5. **Comment sweep wording:** a single dash became a colon and a paired aside became commas, to keep the change mechanical and reviewable. One range comment was fixed by hand.

## Not done, and why

- **The staging seed was not run on staging.** The brief says not to. Ali runs it (command below) when ready.
- **Interests grants hardening:** SQL that needs Ali's yes on staging first. Not touched.
- **Migration 015 on production:** Ali's step before any release to `main`.

## Risks

- `notFound()` changes the HTTP status for every unknown or unpublished package URL from 200 to 404. Search engines drop those URLs, which is the intent. A package that is unpublished and later republished returns 200 again.
- The seed no longer heals drift on existing staging rows (for example an operator profile edited in UAT stays edited). Rerun safety was the priority; a full reset would now need an explicit decision.
- The comment sweep touched 76 files. It changes comments only (tsc, lint, build and all suites pass), but it makes this PR look larger than it is. It is its own commit (`660f1f2`) and reverts alone.

## Staging proof (Claude in Chrome, on the PR preview)

No SQL is involved and no staging migration is needed.

1. **404 with noindex:** open `<preview>/packages/does-not-exist`. DevTools Network shows the document answered **404**. The page shows "Package not found" and "This package is no longer available.". In the Elements panel, `<head>` has `<meta name="robots" content="noindex...">` and no "index, follow". (Every preview also sends an `X-Robots-Tag: noindex` header because it is not production; check the meta tag, not the header.) Repeat for the staging draft `<preview>/packages/10-night-umrah-from-manchester-draft-17`: 404 and the same notice.
2. **Departed package:** open `<preview>/packages/10-night-summer-umrah-from-heathrow-august-2026-9`. It still answers 200 with the heading "This departure has passed" and no enquiry form.
3. **Published package:** open `<preview>/packages/10-night-umrah-from-manchester-december-10`. It answers 200 and shows the full package page with the price and the enquiry link.
4. **Sitemap unchanged:** open `<preview>/sitemap.xml`. It lists `/packages` and the published package URLs, and does not contain `does-not-exist`, the draft (`-draft-17`) or the departed August package (`-august-2026-9`).

Optional, only on Ali's instruction (writes to staging): `NEXT_PUBLIC_SUPABASE_URL=https://fkcudutzgltrsoykfvfn.supabase.co npm run seed:staging -- --ref fkcudutzgltrsoykfvfn`. Afterwards `<preview>/packages/7-night-off-peak-umrah-from-manchester-may-16` shows "Prices by room type" with £1,050, £1,150 and £1,300 per person; nothing else on staging changes.

## Every user-visible wording change

| Where | Before | After |
| --- | --- | --- |
| `/packages/<unknown or unpublished>` | HTTP 200, robots "index, follow", "Package not found" / "This package is no longer available." | HTTP 404, robots noindex, the same two lines |
| `/packages/<slug>` when the load fails | "Unable to load this package right now.", indexable | the same text, noindex, nofollow |
| Demo seed package titles (`prisma/seed.ts`, `supabase/seed.sql`; not live anywhere) | "7 Nights Umrah Package", an em dash, "Value" and similar | "7 Nights Umrah Package: Value" and similar |
| Demo seed cancellation policies (`prisma/seed.ts`) | "50% refund 15", an en dash, "44 days" and similar | "50% refund 15 to 44 days" and similar |
| Staging package pages, after Ali reruns the seed | no "Prices by room type" block | the block from batch 2, with the prices each package's notes state |

The three mandated lines, the pricing wording (10 pounds per lead or 79 pounds a month, founding first 8 operators 12 months free), "Not provided" and the blank registered office are unchanged.
