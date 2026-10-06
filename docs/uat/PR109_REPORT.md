# PR #109 report: erasure gaps, enquiry retention, grant checks

**Branch:** `fix/erasure-retention` into `dev`. **Not merged.**
**Stacked on PR #108.** The brief said #108 was merged, but at the start of this work it was still OPEN (`gh pr view 108`: `state OPEN, mergedAt null`), and `origin/dev` lacks the code this builds on (`eraseOwnCustomerData`, `migrations-pending/014`, `PRODUCTION_CHECKS.sql`). So the branch starts from `origin/fix/overnight-qa` (73d4ad3). Until #108 merges, this PR's diff into `dev` also shows #108's commits. **Merge #108 first.** Review this PR's own commits from `9bb5047` onwards.

No production system, `.env` file, `kb-live` or production secret was touched. Nothing was applied to any remote database. Migration 014 is still pending.

## What changed, per item

### 1. Account deletion also deletes Hajj "notify me" rows (`interests`)
- `Repository.eraseOwnCustomerData` (`lib/api/repository.ts:1523`) now also calls `store().deleteInterestsByEmail(email)`. This happens inside the existing sequence, before the sign-in is removed, so a failure still leaves a sign-in that can retry. A rerun deletes nothing and does not fail.
- Prisma: `DELETE FROM interests WHERE lower(email) = lower($1)` (parameterised, exact match, no wildcards) in `lib/api/db/adapter.ts`. MockDB has the same, case-insensitive.
- **Why not the Supabase service role:** my first version used `createServiceRoleClient().from('interests')`, the same as `/api/user/export`. The real-DB suite failed with `permission denied for table interests`. On this stack (Supabase CLI 2.109 defaults), `service_role`, `anon` and `authenticated` get no SELECT, INSERT or DELETE on new `public` tables. The delete now runs on the server's Prisma connection, the same as the other erase steps, so it does not depend on API-role grants. See open risk 2: the same gap may affect `/api/interest` in production.
- Settings copy names the alerts (sentences S1 and S2 below).

### 2. The delete route always answers in JSON
- `app/api/user/delete/route.ts`: the auth deletion is now inside try/catch, so a thrown error returns 500 `{ error: ACCOUNT_DELETE_NOT_FINISHED }`, the honest message with `dpo@pilgrimcompare.co.uk`. A failing `getSessionUser` returns 401 JSON. If sign-out fails after the account is gone, the route still reports `deleted: true` and logs the failure.
- `lib/account-delete.ts` (new) holds both messages and `deleteErrorMessage(res)`. The settings page reads errors through it. A reply that is not JSON (a timeout page, say), or no reply at all, shows S4. The page never shows a parse error.
- **One deviation from the brief:** the brief asked for a "nothing was deleted" message. A thrown error can come after some data steps have already run (for example, enquiries anonymised, then the auth call throws). "Nothing was deleted" would then be false. The existing message (S3) is accurate in every case: it says deletion did not finish, that the user can still sign in and retry, and gives the DPO email. "Nothing has been deleted" is kept only for the 409 refusal, where it is true.

### 3. Enquiry retention: personal details removed after 90 days
- `Repository.anonymiseExpiredEnquiries(now)` (`lib/api/repository.ts:1539`) targets enquiries with `createdAt` more than 90 days before `now`. It strips exactly the fields account deletion strips: name becomes a marker, and email, phone and message are cleared. It keeps the reference code, operator id, package id, package title, operator name, travel month and created date. Nothing used for lead billing is removed.
- **Idempotent:** a row is skipped once email, phone and message are empty and the name is already a marker. A rerun changes and counts 0. Rows already erased by account deletion keep their `Deleted account` marker.
- **Cron:** follows the repo convention: `GET /api/cron/enquiry-retention` with `verifyCronSecret`, plus a `vercel.json` entry `0 3 * * *`, daily after `expire-packages` at 02:00. It returns `{ ok, anonymised }`.
- **No migration 015:** the cron convention needs no database function or schedule, so no 015 was written.
- **Decision for you:** the name marker is `Removed after 90 days` (`RETENTION_ERASED_NAME`, `lib/api/repository.ts:520`), not `Deleted account`, so the DPO can tell retention from account deletion. The name is not shown anywhere in the UI or in emails. If you want one marker for both, it is a one-line change.

### 4. Privacy page
- Section 5: the row "Enquiry and booking intent data: 90 days (auto-deleted unless a dispute is open)" is split in two:
  - "Enquiries" now carries S5.
  - "Booking intent data" keeps its old wording unchanged. That wording does not match the code (mismatch M1 below), and I left it as instructed.
- Every other retention or deletion claim was audited and left unchanged. See "Privacy mismatches".

### 5. Migration 014 and PRODUCTION_CHECKS.sql
- **014** is now `REVOKE ALL ON public.operator_profiles FROM anon, authenticated;`. It covers TRUNCATE, REFERENCES and TRIGGER, it is idempotent, and its rollback note is `GRANT ALL`. It is still in `migrations-pending/`.
- **Query 1** now also checks `TRUNCATE` (table level) and the `bank_details_active` column.
- **New query 4:** `SELECT count(*) AS verified_without_atol FROM public.operator_profiles WHERE verification_status = 'verified' AND (atol_number IS NULL OR btrim(atol_number) = '');`. It returns one number only.
- **The file is still SELECT only.** `tests/production-checks-sql.test.ts` enforces this, and the forbidden-keyword check still passes with the new TRUNCATE literal.
- **Local evidence** (local stack only, inside `BEGIN … ROLLBACK`):

  | Step | Query 1 |
  |---|---|
  | Before 014 | 28 PASS, 2 FAIL: `anon can TRUNCATE`, `authenticated can TRUNCATE`. The new check finds a real local grant. |
  | 014 applied twice | 30 PASS |
  | After rollback | back to 28 PASS, 2 FAIL |

  Query 4 locally = 1 (seed Operator C, verified with no ATOL, as designed).

### 6. OVERNIGHT_REPORT.md line 15
- The Vitest figure was "2,047 / 2,047". It now reads "2,056 / 2,056 (2,047 before the PR108 review follow-up)". There is no test for this: it is a document figure.

### Also in this PR
- `docs/uat/PR108_REREVIEW.md` committed first, as asked.
- `docs/COMPLIANCE.md` retention table: the deleted-account row names the availability alerts, and there is a new "Enquiry personal details: 90 days" row.
- `e2e/local-db/playwright.config.ts`: the web server gets `CRON_SECRET=local-db-test-only` (a test-only value, not a secret) so the spec can call the cron. CI needs no change.

## Files touched (18 code and test files, plus 4 docs)
`app/api/cron/enquiry-retention/route.ts` (new), `app/api/user/delete/route.ts`, `app/privacy/page.tsx`, `app/settings/page.tsx`, `lib/account-delete.ts` (new), `lib/api/db/adapter.ts`, `lib/api/mock-db.ts`, `lib/api/repository.ts`, `vercel.json`, `supabase/migrations-pending/014_revoke_api_role_writes_operator_profiles.sql`, `supabase/migrations-pending/PRODUCTION_CHECKS.sql`, `tests/account-delete.test.ts`, `tests/enquiry-retention.test.ts` (new), `tests/production-checks-sql.test.ts`, `e2e/local-db/trust-and-account.spec.ts`, `e2e/local-db/playwright.config.ts`, `docs/uat/OVERNIGHT_REPORT.md`, `docs/COMPLIANCE.md`. Docs: `docs/uat/PR108_REREVIEW.md`, `docs/uat/PR109_REPORT.md`, `AI_NOTES.md`, `STATUS.md`.

## User-facing sentences for your approval (verbatim)

**S1, settings, Delete account section** (`app/settings/page.tsx:498`). Changed: alerts added, and the kept fields made exact (operator and travel month were missing).
> Under UK GDPR Article 17, you can ask us to erase your personal data. Deleting your account permanently deletes your sign-in, your profile, any marketing email consent you gave and any Hajj availability alerts you signed up for with this email address. On enquiries you sent with this email address, we delete your name, email address, phone number and message, and keep only the reference code, operator, package, travel month and date. If your account is linked to bookings or complaints, we cannot delete it automatically: we will tell you, nothing will be deleted, and you can email dpo@pilgrimcompare.co.uk.

**S2, settings, confirm box** (`app/settings/page.tsx:514`). Changed: alerts added.
> Your sign-in, profile, marketing consent and Hajj availability alerts will be permanently deleted, your details will be removed from your enquiries, and you will be signed out. Operators you already sent an enquiry to keep the details you gave them under their own privacy policy. To have those deleted, contact the operator directly.

**S3, deletion did not finish** (`lib/account-delete.ts`). Wording unchanged, moved from the route. It is now also returned for thrown errors.
> We could not finish deleting your account. You can still sign in, so please try again. If it keeps failing, email dpo@pilgrimcompare.co.uk.

**S4, reply unreadable or missing** (`lib/account-delete.ts`). New.
> We could not confirm that your account was deleted. If you can still sign in, please try again. If it keeps failing, email dpo@pilgrimcompare.co.uk.

**S5, privacy page section 5, row "Enquiries"** (`app/privacy/page.tsx:148`). New.
> Your name, email address, phone number and message are removed 90 days after you send the enquiry. We keep the reference code, operator, package, travel month and date.

**Table labels** (`app/privacy/page.tsx:146,152`). "Enquiries" and "Booking intent data" replace "Enquiry and booking intent data".

**Stored marker, not displayed:** `Removed after 90 days`.

All of these use UK English, with no em dashes, no guarantees and no "Not provided" paths changed. `tests/banned-phrases.test.ts` and `tests/content-truth.test.ts` pass.

## Privacy mismatches found (all seven fixed 2026-10-06, see the end of this report)

| # | Privacy page claim | What the code does |
|---|---|---|
| M1 | Section 5 "Booking intent data: 90 days (auto-deleted unless a dispute is open)" (`:152-153`) | Nothing is deleted. `pruneExpiredEvidence` (`lib/api/repository.ts:451`) only hides the evidence file path when a booking intent is read after 90 days. The storage bytes are never removed: `deleteFile` (`lib/api/storage.ts:78`) has no caller. The booking intent row, including payer name, payment reference and notes, is kept forever. There is no cron. The booking flow is parked, so there is probably no production data, but the claim is false as written. |
| M2 | Section 5 "User account (deleted): Deleted straight away when you delete your account" (`:142-143`) | True only for customers with no linked records. Customers linked to quote requests, bookings or complaints, and all operator and admin accounts, get a 409 and are handled by the DPO by email. The row does not say so (the settings page does). It also does not mention that enquiries are kept in anonymised form. |
| M3 | Section 5 "Audit log entries: 7 years" and "Complaint records: 7 years" (`:156-161`) | No code deletes either one at any age, so they are kept forever. "7 years" reads as a deletion date that does not exist. |
| M4 | Section 5 omits several stores | Marketing consents, Hajj availability alerts (`interests`), quote requests, analytics events, and emails sent through Resend have no stated retention. Consents and alerts go only when an account is deleted. Someone who enquired or signed up for alerts without an account has no self-serve way to remove them and must email the DPO. |
| M5 | Section 2 "Enquiry details: travel preferences (destination, dates, hotel rating, room occupancy, budget, inclusions), departure city, and any notes" (`:68`) | The enquiry form collects name, email, phone, travel month, message and marketing consent. This is a collection claim rather than a retention claim, noted for completeness. |
| M6 | Section 6 "To exercise any right, email privacy@pilgrimcompare.co.uk" (`:188-191`) | Section 1 and every deletion message use `dpo@pilgrimcompare.co.uk`. That is two inboxes: confirm both are monitored, or use one. |
| M7 | Section 6 Access and Portability | `/api/user/export` (`app/api/user/export/route.ts:27-34`) leaves out the enquiries and marketing consents held under the account email. It also turns a failed `interests` read into `[]` without saying so, which with the local grants above means an empty list. |

## Gates (final run on HEAD, clean `.next`, freshly reset local DB)

| Check | Result | Baseline |
|---|---|---|
| `npm run lint` | 0 errors (2 pre-existing warnings: `Logo.tsx:14`, `Footer.tsx:60`) | 0 errors |
| `npx tsc --noEmit` | pass | pass |
| `npm run test` | **2,072 / 2,072** (63 files) | 2,056 (+16 new) |
| `npm run build` | pass. A clean build prints one pre-existing warning: supabase-js uses `process.version` in the Edge runtime via `lib/supabase/middleware.ts`, a file this PR does not touch | pass |
| Repo Playwright `--workers=1` | **69 passed, 6 skipped, 0 failed** | 69 / 6 / 0 |
| `npm run e2e:local-db` | **25 / 25** | 24 (+1 new: retention cron. The deletion test also now covers the alerts) |

**GitHub CI on PR #109:** `ci` pass (2m6s), `local-db` pass (4m22s), `Supabase Preview` skipped.

**Fail-first evidence:** each new unit test was run before its fix and failed (missing module, `deleteInterestsByEmail` absent, `REVOKE SELECT, INSERT, UPDATE, DELETE` still in 014, the copy strings absent).

**Two failures on the way, both fixed:**
- `permission denied for table interests` (see item 1).
- A separate real-DB test for the alerts tripped the sign-in limit (5 per 15 minutes per IP: "Too many attempts"). I folded that check into the existing deletion test so it reuses that test's sign-in.

**Local gotcha:** `tsc` failed once on `.next/types/* 2.ts` duplicates, the iCloud copies of `~/Documents` noted in AI_NOTES. `rm -rf .next` cleared it.

## Open risks
1. **Merge order.** This PR is stacked on #108. Merging it first would merge #108 as well. Merge #108, then this.
2. **Production grants on `interests`.** `/api/interest` (Hajj notify-me insert) and `/api/user/export` (read) still use the Supabase service role. On the local stack that role has no privileges on `interests`: an INSERT as `service_role` is refused with "permission denied for table interests" (checked inside a rolled-back transaction), so the form's API call fails here. If production has the same defaults, the Hajj form is broken in production. This is not caused by this PR, which moved deletion off that path. Read-only check for you to run in the SQL editor: `SELECT has_table_privilege('service_role','public.interests','INSERT') AS can_insert, has_table_privilege('service_role','public.interests','SELECT') AS can_read;`. I did not add it to PRODUCTION_CHECKS.sql, to keep that file to the brief.
3. **`CRON_SECRET` in Vercel production.** Without it the cron gets 401 every day, nothing is anonymised, and S5 becomes untrue. The other crons need it too, but I did not verify that it is set. After release, check the first `[cron/enquiry-retention] anonymised=` log line.
4. **The first run is a backlog.** Every enquiry already older than 90 days is anonymised on the first run. This cannot be undone. Confirm that nothing in lead billing or dispute handling needs contact details older than 90 days. The billing fields stay.
5. **Vercel cron limits.** There are now 5 cron entries. That is fine on Pro. Check the plan's cron count if it is Hobby.
6. **014 is still pending.** Production query 1 will now also flag TRUNCATE if Supabase's default grants are present. That is expected, and 014 fixes it.
7. **The privacy mismatches M1 to M7 are live claims.** M1 and M3 state deletions that do not happen.

## Exact next step
Merge #108 into `dev`, then review this PR (approve S1 to S5 and the marker decision). Before release, run PRODUCTION_CHECKS.sql queries 1 and 4 and the `interests` grant check in risk 2.

## Privacy mismatches fixed (2026-10-06, copy approved by Ali)

| # | Fix |
|---|---|
| M1 | Booking intent row now says "Kept until you ask us to delete it. Payment evidence files stop being shown 90 days after you upload them, unless a dispute is open." Building the real deletion is in `docs/BACKLOG.md`. |
| M2 | Deleted-account row says what Settings removes, that enquiries are kept without name and contact details, and that other accounts (including operators) are deleted by hand via `dpo@`. |
| M3 | 7 years kept. No record can reach 7 years before September 2032 (repo starts 17 September 2025). Deletion cron in `docs/BACKLOG.md`. |
| M4 | New rows: marketing choices, Hajj availability alerts, quote requests, operator statistics, emails sent through Resend. |
| M5 | Section 2 lists what the enquiry form collects; travel preferences moved to a new "Quote request details" item; Hajj alerts item added. |
| M6 | Section 6 uses `dpo@pilgrimcompare.co.uk`. No `privacy@` left in the code. |
| M7 | `/api/user/export` adds `enquiries` and `marketingConsents`, reads `interests` through Prisma (`getInterestsByEmail`), and returns 500 instead of `[]` when a read fails. Real-DB test asserts all three before deletion. |

Gates after the fix: lint 0 errors, tsc pass, Vitest **2,081 / 2,081** (+9, `tests/privacy-truth.test.ts`, 7 failed before the fix), build pass, Playwright 69 / 6 / 0, real-DB 25 / 25.
