# PR #108 re-review (commits since 8bb16d7)

**Verdict: APPROVE WITH CHANGES**

Merge into `dev` is fine as it stands. Fix P2-1 (the `interests` rows survive account deletion) before `dev` goes to `main`. No P0 or P1 findings.

**PR:** `fix/overnight-qa` into `dev`, OPEN, MERGEABLE. Head `73d4ad3` (local HEAD = PR head).
**Reviewed:** 2026-10-06, read only. I changed no code, committed nothing, pushed nothing and applied no migration. I did not touch production or `kb-live`. All DB work ran against the local stack (`127.0.0.1:54322`). `.env.local` points only at `127.0.0.1`.
**GitHub CI on `73d4ad3`:** `ci` pass (2m6s), `local-db` pass (4m13s), `Supabase Preview` skipped.

## Gates (rerun by me on 73d4ad3, local stack from `supabase start --workdir e2e/local-db`)

| Check | Result | Baseline | Match |
|---|---|---|---|
| `npm run lint` | 0 errors, 2 warnings (`Logo.tsx:14`, `Footer.tsx:60`, both pre-existing) | 0 errors | yes |
| `npx tsc --noEmit` | pass | pass | yes |
| `npm run test` | **2,056 / 2,056**, 62 files | 2,056 | yes |
| `npm run build` | pass ("Compiled successfully") | pass | yes |
| `npm run e2e:local-db` | **24 / 24** passed (46.8s), fresh `supabase db reset` | 24 / 24 | yes |

I did not rerun the repo Playwright suite (69/6/0). It was not in the brief.

## Item-by-item evidence

### 1. `git diff d40aff5..73d4ad3` is docs only: YES
```
M  AI_NOTES.md                (1 line: gate summary)
M  docs/uat/PR108_REVIEW.md   (+15: gates table, CI note, verdict)
```
Those are the only two files. No code, config or SQL.

### 2. Every P1 and P2 from PR108_REVIEW.md is fixed: YES (P2-3 is a production check for Ali, as intended)

| Finding | Evidence |
|---|---|
| P1-1 suite not committed, no build/lint in CI | Suite is in `e2e/local-db/` (3 spec files, 24 tests), excluded from `npm run e2e` (`playwright.config.ts` ignores `local-db/**`). `package.json:18` adds `e2e:local-db`. `.github/workflows/ci.yml:27-37` runs lint, tsc, vitest and build. `ci.yml:42-88` adds the `local-db` job. I reran it and got 24/24. It also passes on GitHub. |
| P2-1 enquiries and consent left behind, copy overstated | `lib/api/repository.ts:1513-1520` anonymises enquiries and deletes consents. `lib/api/db/adapter.ts:679-688` uses `updateMany` and `deleteMany`, case-insensitive. Copy at `app/settings/page.tsx:500,516`. `docs/COMPLIANCE.md:44` corrected. **One gap remains: see new P2-1 below.** |
| P2-2 sign-in deleted first | `app/api/user/delete/route.ts:24` erases the data first and `:34` deletes the auth user last. The 500 message at `:8-9` is honest and the user id is logged at `:30,:36`. Tests at `tests/account-delete.test.ts:44,56`. |
| P2-3 allow-list and grants | `supabase/migrations-pending/PRODUCTION_CHECKS.sql` (queries 1 to 3 plus a manual allow-list checklist at `:65-76`). Fix written as `014_...sql`. Locally, query 1 gives 26/26 PASS (I reran it). Only production can answer this, so it stays open for Ali. |
| P2-4 ATOL claim not enforced | `lib/listing.ts:9-10` `isPubliclyListed`. It is used at `repository.ts:80,506,1275,1530`, `adapter.ts:394,399` and `sitemap.ts:68`. The ATOL reset is at `repository.ts:1199-1205`. Tests at `tests/verified-only-listing.test.ts:39-62`. |
| P3-7 013 rollback | `013_operator_atol_abta_checked_at.sql:26-27`. |

### 3. Account deletion: YES, with one gap (new P2-1)
- **Data erased before sign-in:** `route.ts:24` (`eraseOwnCustomerData`) runs before `route.ts:34` (`auth.admin.deleteUser`). `deleted: true` is returned only after both succeed (`:42`).
- **Every step safe to retry:** `assertCanDeleteOwnAccount` is read only. Anonymising enquiries is an `updateMany` on the email, and a rerun matches nothing because the email is now null. Consent removal is a `deleteMany`, and `deleteUser` is `prisma.user.deleteMany` (`adapter.ts:285-287`). None of them throws on zero rows. `getSessionUser` (`lib/auth/session.ts:32-47`) reads only the Supabase auth user and never the `users` row, so the customer can still sign in and retry after a partial failure.
- **Enquiries anonymised, with reference, package and date kept:** `adapter.ts:681-682` sets `name = 'Deleted account'` and nulls `email`, `phone` and `message`. `referenceCode`, `packageId`, `createdAt`, `operatorId`, titles and `travelMonth` are kept. The local-db test "account deletion removes the sign-in and consent, and anonymises enquiries" passed.
- **Marketing consents deleted:** `adapter.ts:686-688`.
- **Honest message on failure:** a 409 gives `ACCOUNT_DELETE_MANUAL_MESSAGE` ("Nothing has been deleted"). A 500 gives "You can still sign in, so please try again". The client shows the server text (`app/settings/page.tsx:268-277`).

### 4. ATOL rule: YES
- **An operator changing its own ATOL number goes back to pending:** `repository.ts:1199-1203` compares trimmed values, so a change, a removal or a newly added number all flip `verified` to `pending`. Admin edits are exempt. The only operator write path is `PATCH /api/operator/profile` → `updateOperator` (`app/api/operator/profile/route.ts:43`).
- **A verified operator with no ATOL number is hidden publicly:** `isPubliclyListed` requires `atolNumber?.trim()`, so blank strings are hidden too. Every public read goes through it. Prisma stores a cleared number as `''` (`adapter.ts:476`), and the trim catches that.
- **Operators cannot set their own verification:** `OPERATOR_PROTECTED_FIELDS` (`repository.ts:517-519`) is stripped for non-admins (`:1186-1188`). The profile zod schema is `.strict()` (`route.ts:30`), so the field is rejected with a 400 before that. At the DB level, local `authenticated` has no UPDATE on `operator_profiles` (query 1: 26/26 PASS). Production is unconfirmed until Ali runs query 1.

### 5. CI contains no secrets: YES
`ci.yml` has no `secrets.*` and no literal keys. The `local-db` job builds `.env.local` at run time from `supabase status -o env` (`ci.yml:68-82`), so it only holds the CLI's public local default keys, and it checks that the API URL is `127.0.0.1` (`:82`). `e2e/local-db/supabase/config.toml` has no keys. A grep of the whole diff since 8bb16d7 for JWTs, `sb_secret`, `sk_` or literal service-role values found nothing.

### 6. PRODUCTION_CHECKS.sql is read only: YES
It holds three SELECTs only. The functions are `format`, `has_column_privilege`, `has_table_privilege` and `count`, all of them pure. There is no `SET`, DDL, DML, `GRANT`/`REVOKE`, `set_config`, `nextval` or `pg_*` admin function. The dashboard section is comments only. `tests/production-checks-sql.test.ts:9-15` enforces this. I ran query 1 locally, read only.

### 7. Migrations 013 and 014: safe, idempotent, unapplied, order confirmed
- **013:** `ADD COLUMN IF NOT EXISTS` ×2, nullable and additive, so it is idempotent. It has a rollback note.
- **014:** `REVOKE` is idempotent. No policy or table in `supabase/migrations/` reads `operator_profiles` in a subquery, and the app never uses supabase-js on that table (only `interests`), so the revoke breaks nothing. It has a rollback note.
- **Unapplied:** both files are in `migrations-pending/`. `setup.sh` and CI apply only `supabase/migrations/[0-9]*.sql`, which stops at `012`. The local DB has no `atol_verified_at` or `abta_verified_at` columns (checked after the suite's reset). `tests/production-checks-sql.test.ts:17-21` guards 014's location. I cannot check production without touching it. Nothing in the repo applies either file, and `Supabase Preview` was skipped.
- **Order:** confirmed. `013:12-14` says to run query 1 first and apply 014 before 013 if it fails. That order is correct: a table-level UPDATE grant would cover the new columns. After 014 has removed the table grants, the new columns get no column grants and stay safe.

### 8. Gates: see the table above. All match the baseline.

### 9. Language rules: no breaches in the new copy
No em or en dashes, no guarantees and no unsupported claims in the strings added since 8bb16d7 (settings copy, delete messages, operator form hints, registration form). "We check each operator's ATOL number before listing" (`app/partner/page.tsx:56`, `app/hajj/page.tsx:99`) is now backed by code. No "Not provided" display paths changed. The local-db test "cards never show undefined/null/NaN and gaps read Not provided" passes.

## Findings

### P0
None.

### P1
None.

### P2

**P2-1. Account deletion leaves the account's `interests` ("notify me") rows, even though the data export treats them as the account's data.**
- File: `lib/api/repository.ts:1513-1520` (no `interests` step). Evidence: `app/api/user/export/route.ts:27-31` exports `interests` rows matched on `user.email`. `app/api/interest/route.ts:35-37` is live, posted from `components/hajj/HajjInterestForm.tsx:18`. The table comes from `supabase/migrations/007_interests_table.sql`. The new copy at `app/settings/page.tsx:500` asks the customer to trust that Article 17 erasure covers their data, but a waitlist email for the same address survives deletion.
- Fix: in the erase step, delete `interests` where `lower(email) = lower(account email)` (it is idempotent, so the retry design still holds). Add "and any availability alerts you signed up for" to the copy at `:500,516`, plus a unit test.

### P3

1. **014 and query 1 miss TRUNCATE, REFERENCES and TRIGGER.** Locally, `anon` and `authenticated` still hold all three on `operator_profiles`, and query 1 still reports 26/26 PASS. TRUNCATE ignores RLS. PostgREST cannot issue it, so the risk is low, but 014's claim that "the API roles need no privileges" is only partly carried out. Fix: in 014, `REVOKE ALL ON public.operator_profiles FROM anon, authenticated;`, and add `TRUNCATE` to the privilege list in query 1 (`PRODUCTION_CHECKS.sql:39`).
2. **Query 1 column list omits `bank_details_active`** (`PRODUCTION_CHECKS.sql:31-33`), which is a trust flag (`prisma/schema.prisma:202`). The table-level UPDATE row still catches a table grant, but not a column-only grant. Fix: add `'bank_details_active'` to the IN list.
3. **Release impact of the ATOL rule is not measured.** On merge to `main`, every production operator that is `verified` with no ATOL number disappears from public pages straight away. Fix: add a read-only count to PRODUCTION_CHECKS (`SELECT count(*) FROM operator_profiles WHERE verification_status='verified' AND coalesce(trim(atol_number),'')=''`) and have Ali run it before release.
4. **Other "verified" checks do not use the ATOL rule.** `repository.ts:681` (quote broadcast) and `:289,:375` (bookability) check only `verificationStatus === 'verified'`. Both features are parked, so nothing public is affected. Fix: use `isPubliclyListed` before un-parking RFQ or booking.
5. **A thrown error in the delete route gives a raw 500.** `route.ts:34`: if `createServiceRoleClient()` or `deleteUser` throws instead of returning `{ error }`, Next returns a non-JSON 500, and the client (`settings/page.tsx:270`) shows a JSON parse error instead of `NOT_FINISHED`. Fix: wrap lines 34-38 in try/catch and return `NOT_FINISHED`.
6. **Published packages of hidden operators can be read through the API.** `001_enable_rls.sql:125-126` lets anon SELECT any `status='published'` package, so a package from an unverified or no-ATOL operator can be read directly through PostgREST if anon holds the grant. Query 2's `anon_select` column will show this. Fix: if prod shows `anon_select = true` on `packages`, revoke it the same way as 014.
7. **Stale counts in OVERNIGHT_REPORT.** `docs/uat/OVERNIGHT_REPORT.md:15` still says Vitest 2,047. The current figure is 2,056 (as in `PR108_REVIEW.md` and `AI_NOTES.md:31`). Fix: update the figure.
8. **Earlier P3s 1 to 6 and 8 to 10 are still open, as the resolution table says.** No change in this range. Track them in the follow-up.

## Not checked
- Production grants, RLS, the redirect allow-list and whether 013 or 014 has been applied in production. This review is read only and production is out of scope. Ali needs to run `PRODUCTION_CHECKS.sql`.
- Repo Playwright (69/6/0). Not in the brief, and not rerun.
