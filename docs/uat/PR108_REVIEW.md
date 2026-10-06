# PR #108 independent review

**PR:** `fix/overnight-qa` → `dev` (59 commits, 172 files, +4,264 / −2,167)
**Reviewed:** 2026-10-06, read-only review. No code changed, nothing committed or pushed.
**Head check:** local `HEAD` = PR head = `8bb16d7`. Working tree clean after `git fetch origin`.
**GitHub CI on the head:** `ci` SUCCESS, `Supabase Preview` SKIPPED.

## Results I reproduced

| Check | Result |
|---|---|
| `npm run test` (vitest) | **2,047 / 2,047 passed**, 61 files. Matches the report. |
| `npx tsc --noEmit` | pass |
| `npm run build` | pass ("Compiled successfully") |
| Docker / local Supabase | Up. `.env.local` points only at `127.0.0.1` (DB `:54322`, API `:54321`). I did not touch prod. |
| Real-DB Playwright (24) | **Not rerun.** The suite is not in the repo (see P1-1). |
| Local DB read-only probe | `authenticated` has no UPDATE on `operator_profiles`, `anon` has no SELECT. RLS is on. The `atol_verified_at` / `abta_verified_at` columns are absent, so migration 013 is not applied. |

## Findings

### P0 (none)

No route lets one user read or write another user's data. Account deletion cannot target anyone except the signed-in customer. No open redirect. CSP is not loosened in production. Nothing reads production secrets.

### P1

**P1-1. The 24 real-DB browser tests are not committed and do not run in CI.**
- `.gitignore:80` adds `.overnight/`. The suite lives in `.overnight/e2e/` (`iteration2.spec.ts`, `journey.spec.ts`, `operator.spec.ts`, `playwright.local.config.ts`), so it is gitignored.
- `.github/workflows/ci.yml:27-31` runs only `tsc` and `vitest`. CI has no `npm run build`, no `lint` and no Playwright (repo or real-DB).
- `docs/uat/OVERNIGHT_REPORT.md:18` and the PR body report "24 / 24". Nobody else can rerun that and no future PR is guarded by it. The suite is the only end-to-end proof for password reset (PKCE host binding), real account deletion, verified-only listing, the CSP image path and operator access control.
- **Change:** move the suite into the repo (for example `e2e/real-db/` with its config), keep it out of the default `npm run e2e`, and either add a CI job (`supabase start` → seed → run) or document it as a required manual gate in `QA.md` with a pinned command. At minimum, add `npm run build` to `ci.yml`, since CLAUDE.md treats the build as non-negotiable.

### P2

**P2-1. Account deletion leaves enquiry and marketing-consent personal data, and the settings copy implies it does not.**
- `app/api/user/delete/route.ts:36-43` deletes the auth user and the `users` row only. `enquiries` (name, email, phone, message) and `marketing_consents` (email) are keyed by email, not user id, and are untouched (`prisma/schema.prisma:478-506`).
- `app/settings/page.tsx:516` says "Enquiries you sent are already with the operator, who holds them under its own privacy policy." PilgrimCompare also keeps them in its own `enquiries` table, and a marketing-consent row stays live after deletion.
- **Change:** either erase or withdraw `marketing_consents` for the account email on deletion and state the enquiry retention honestly, or make the copy say what PilgrimCompare keeps and for how long. This ties to the open "enquiry retention policy" decision. `docs/COMPLIANCE.md:44` ("90 days grace, then hard-delete") also no longer matches the immediate-delete behaviour.

**P2-2. Deletion order can strand personal data with no way to retry.**
- `app/api/user/delete/route.ts:36` deletes the auth user first, then `:43` deletes the app record. If `deleteOwnCustomerRecord` throws (DB blip, or a quote request created between the two checks, which makes it re-throw CONFLICT), the user gets a generic 500 and can no longer sign in to retry. The `users` row (email, name, consents) stays.
- The comment's reasoning (never leave a login without a record) is sound, but the failure needs a trail. **Change:** on step-3 failure, log the user id at error level for the DPO and return a message that says the sign-in was removed and the DPO will finish the erasure. Do not use the generic error.

**P2-3. Verification depends on the Supabase redirect allow-list and DB grants. Neither can be checked from the repo.**
- `app/api/auth/reset-password/route.ts:35` builds `redirectTo` from the caller's `Origin` header. That adds no new attack surface, because anyone can call Supabase `/recover` with any `redirect_to`. It does mean the production redirect allow-list is the only control. A broad wildcard such as `https://*.vercel.app/**` would let an attacker-hosted page receive a victim's recovery code. Confirm the prod allow-list holds only the exact production and preview hosts.
- `supabase/migrations/009_update_policies_with_check.sql:40-43` (`operator_profiles_update_own`) lets an operator UPDATE every column of their own row, including `verification_status`, `tier` and `eligibility_flags`. `001_enable_rls.sql:33-34` lets anyone SELECT every operator row, including unverified ones. Locally the table grants block both. This PR makes `verification_status = 'verified'` the only public-listing gate, so confirm production also has no `authenticated` UPDATE / `anon` SELECT grant on `operator_profiles` and `packages`. Otherwise an operator could self-verify through PostgREST.
- `supabase/migrations-pending/013_operator_atol_abta_checked_at.sql:11` says "RLS unchanged: inherits operator_profiles policies". If those grants exist, `atol_verified_at` would be operator-writable. Before applying 013, add `REVOKE UPDATE (verification_status, verified_at, tier, eligibility_flags, atol_verified_at, abta_verified_at) ON operator_profiles FROM authenticated` (or confirm the table-level grant is absent).

**P2-4. "We check each operator's ATOL number before listing" is not enforced in code.**
- Stated at `app/partner/page.tsx:56,187` and `app/hajj/page.tsx:99`. The wording matches Standards §7 and Direction §2, but `Repository.listPackages` / `getPublicPackageBySlug` (`lib/api/repository.ts` ~1245-1258) filter only on `verificationStatus === 'verified'`. A verified operator with no ATOL number still lists. `components/packages/PackageDetail.tsx:298` ("No ATOL or ABTA number provided") and `components/operator/OperatorRegistrationForm.tsx:419` ("No protection: … you must clearly state this") show that this path is expected.
- An operator can also change their ATOL number after verification and stay listed. `updateOperator` clears only `atolVerifiedAt`, and under Prisma that field does not persist yet. Standards §7 says a lapsed ATOL means the listing is suspended.
- **Change:** require a non-empty `atolNumber` in the public-listing filter, or soften the claim. Also consider flipping `verificationStatus` back to `pending` when a non-admin changes the ATOL number.

### P3

1. **`websiteUrl` accepts any scheme.** `app/api/operator/profile/route.ts:28`: zod 4 `.url()` accepts `javascript:` (checked). It is rendered as `href` in `components/operators/OperatorProfileDetail.tsx:147`. React 19 and the nonce CSP block execution, but restrict the field to `http(s)`.
2. **Full operator object reaches the client.** `app/packages/[slug]/page.tsx:18,82` passes the full operator (including `eligibilityFlags.paymentSlaFlagged`) into the client component `PackageDetail`, so it is in the RSC payload. `/api/operators` deliberately strips this field. Use the same stripping here.
3. **`/reset-password` works for any signed-in session.** `components/auth/ResetPasswordForm.tsx:29` shows the form for any session, not only a recovery session, so a borrowed or stolen session can change the password without the current one. Consider Supabase "secure password change" or a recovery-session check.
4. **`requestOrigin` trusts `Host` / `x-forwarded-proto`.** `lib/auth/redirect.ts:20-24`. Fine on Vercel. Worth a comment that it assumes a trusted proxy.
5. **Email log transport writes personal data to disk.** `lib/email/send.tsx:43` writes customer emails and names to a plain file whenever `EMAIL_LOG_PATH` is set outside Vercel production, including previews. Local opt-in only. Consider also requiring `NODE_ENV !== 'production'`.
6. **Admin ATOL/ABTA "verify" does not persist under Prisma.** `app/api/admin/verify-operator/route.ts:30-36` returns `atolVerifiedAt` to the admin, but those columns do not exist until 013 is applied, so nothing is saved. The PR documents this. Make sure the admin UI does not show it as saved.
7. **Migration 013 has no rollback note.** It is additive, nullable, `IF NOT EXISTS`, and correctly kept out of `supabase/migrations/`, which is safe. It should still record the rollback (`ALTER TABLE operator_profiles DROP COLUMN IF EXISTS atol_verified_at, DROP COLUMN IF EXISTS abta_verified_at;`).
8. **Operator dashboard exposes quote-request notes to all operators.** `app/api/operator/dashboard/route.ts:13-17` returns every open quote request, including free-text `notes`, to any operator. This is the pre-existing RFQ design (now parked). Strip `notes` and `customerId` if RFQ stays parked.
9. **Partner page states a review time.** `app/partner/page.tsx:230` says "within 1 to 2 business days", an operational commitment with no source. Low risk, B2B audience.
10. **Parked onboarding page still has a hardcoded reason.** `components/operator/OnboardingStatusClient.tsx` still drives status from `?status=` with a hardcoded rejection reason. It is 404'd while the flag is off. Fix it before un-parking.

## Checked and fine

- **New server routes:** `/api/operator/dashboard`, `/api/operator/packages/csv`, `/api/operator/profile` are operator-only and scoped to `user.id`. The profile schema is `.strict()`, and `updateOperator` strips trust fields for non-admins. `/api/admin/bank-changes` is admin-gated. `/api/operators` returns full rows only to admins and verified-only stripped rows otherwise. `/api/health` no longer leaks DB errors. Role comes from `app_metadata`, not `user_metadata` (`lib/auth/session.ts:40`).
- **Service role:** used only in `user/delete`, after the session check, on `user.id`.
- **Account deletion:** customers only. It refuses with a 409 before touching anything if the account is linked to requests, booking intents or complaints, so booking outcomes and evidence storage are never orphaned. Auth deletion failure returns 500 with nothing deleted.
- **Redirects:** `safeRedirectPath` rejects absolute URLs, `//`, backslashes and control characters. It is applied to `/auth/confirm?next=` and `/login?redirect=`.
- **CSP:** production `connect-src` is unchanged (the configured origin is added only when it is not `*.supabase.co`). `img-src` adds only this project's Supabase origin. `next.config` remote images are limited to `/storage/v1/object/public/**`.
- **Seed script:** refuses unless every DB/Supabase URL is local and `NODE_ENV` is not production.
- **Content:** made-up testimonials removed, `/showcase` 404s in production, verified-only listing applied on every public page / API / sitemap, and ranking weights match `lib/ranking.ts`. The "90-day trial" wording traces to `PILGRIMCOMPARE_PROJECT_DIRECTION.md:86`. "Verified UK operators" titles follow Standards §11.

## Verdict

**APPROVE WITH CHANGES**

Merge to `dev` once P1-1 is done (commit the real-DB suite and add `build` to CI, or record the suite as a documented manual gate). Before `dev` → `main`, close P2-1 (deletion copy and consent) and P2-3 (prod allow-list and grant check).

---

## Resolution (2026-10-06, follow-up on `fix/overnight-qa`)

Each fix landed with a test that failed first. No production system was touched and nothing was applied to any remote database.

| Finding | Resolution | Commit | Test |
|---|---|---|---|
| **P1-1** real-DB suite not committed, no build/lint in CI | Suite moved to `e2e/local-db/` (24 specs, excluded from `npm run e2e`). `setup.sh` resets the local stack, pushes the schema, applies `supabase/migrations/*.sql`, creates the three test accounts and seeds (including the test image). `npm run e2e:local-db`. CI: `ci` job now runs lint, type check, unit and build. A new `local-db` job starts Supabase in the runner (CLI 2.109.1, config `e2e/local-db/supabase/config.toml`), writes `.env.local` from `supabase status` (public local keys only) and runs the suite. The PR template lists the suite as a gate. | 60f56cd, 62bc32a, a8f76d5, d4afba0 | the suite itself |
| **P2-1** deletion left enquiries and consent; copy overstated | Deletion now anonymises the customer's enquiries (name becomes "Deleted account", email, phone and message are cleared, reference, package and date kept) and deletes their `marketing_consents`, matched case-insensitively on the account email. Settings copy says exactly that, and that operators keep what they already received. `docs/COMPLIANCE.md` retention row corrected. | 7b6bf37 | `tests/account-delete.test.ts`, local-db "account deletion removes the sign-in and consent, and anonymises enquiries" |
| **P2-2** sign-in deleted first, no retry | Order reversed: data first, sign-in last. Every step is idempotent. Any failure returns 500 "You can still sign in, so please try again" and logs the user id. Tested by forcing a failure part way (consent step, then auth step) and retrying. | 7b6bf37 | `tests/account-delete.test.ts` |
| **P2-3** redirect allow-list and DB grants unverifiable | `supabase/migrations-pending/PRODUCTION_CHECKS.sql` (read only, for Ali to run): query 1 PASS/FAIL per API role on every operator_profiles trust column and table privilege; query 2 RLS state per table; query 3 every policy. It also lists the redirect allow-list entries to check. If query 1 shows FAIL, `014_revoke_api_role_writes_operator_profiles.sql` (pending, validated in a rolled-back local transaction) closes it. Run locally: 26/26 PASS. | 4dfbc0d | `tests/production-checks-sql.test.ts` |
| **P2-4** "we check each ATOL number" not enforced | One predicate `lib/listing.ts` `isPubliclyListed` = verified AND an ATOL number. It is used by packages, operator profile, operator list, departure airports and sitemap. An operator changing its own ATOL number goes back to `pending` until an admin checks it. Operator copy no longer promises a listing without ATOL. The approved §7 wording is now true, so it is unchanged. | 15c6172 | `tests/verified-only-listing.test.ts`, local-db no-ATOL checks |
| **P3-7** 013 rollback note | Added, plus a note to run the checks (and 014 if needed) before 013. | 4dfbc0d | n/a |
| P3-1..6, 8..10 | Not in this pass. Still open, low risk, listed in `OVERNIGHT_REPORT.md`. | n/a | n/a |

**Local seed change:** the Stansted free-text package moved from Operator C to Operator B, so London search still covers a free-text airport now that Operator C (verified, no ATOL) is hidden. Expected counts: browse 11, Umrah 10, London 4.
