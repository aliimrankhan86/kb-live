# Staging

Fictional test environment for UI/UX review and UAT. Built in B0 (2026-10-07). Every Vercel **Preview** deployment uses it. **Production** (`pilgrimcompare.co.uk`, Supabase `nzvepuzzxjoxvpcrlozx`) is never touched by it.

## Where it lives

| What | Value |
| --- | --- |
| Supabase project | `pilgrimcompare-staging`, ref **`fkcudutzgltrsoykfvfn`**, org kaabatrip (`qjnhoujoilkbahqlprqq`), eu-west-1, Free plan |
| Supabase dashboard | https://supabase.com/dashboard/project/fkcudutzgltrsoykfvfn |
| Stable dev alias (Vercel, `dev` branch) | https://pilgrimcompare-git-dev-ali-khans-projects-45d305e2.vercel.app |
| PR previews | `https://pilgrimcompare-git-<branch>-ali-khans-projects-45d305e2.vercel.app` and per-commit `pilgrimcompare-<hash>-…` URLs |
| Database password | macOS Keychain on Ali's Mac, service `pilgrimcompare-staging-db`, account `postgres`. Never in a file. |
| Test account passwords | `staging-seed.config.local.json` in the repo root on Ali's Mac (gitignored, mode 600) |

Previews are behind Vercel Authentication: sign in to Vercel in the browser first.

## Vercel environment split (2026-10-07)

Before B0 every variable was one record shared by Production and Preview, so every preview read the production database. Now:

| Variable | Production | Preview |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | production project (unchanged) | staging project |
| `DATABASE_URL` | production (unchanged) | staging pooler, port 6543, `?pgbouncer=true` |
| `DIRECT_URL` | production (unchanged) | staging session pooler, port 5432 |
| `FEATURE_USE_REAL_DB` | unchanged | `true` (`lib/config.ts` needs exactly `true`) |
| `NEXT_PUBLIC_SITE_URL` | unchanged | the stable dev alias |
| `CRON_SECRET` | unchanged | its own random value, stored nowhere else (crons never run on previews) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | unchanged | none (in-memory rate limit fallback) |
| `RESEND_API_KEY` | one record shared by both (unchanged) | shared |
| `STAGING_EMAIL_TO` | none | `aliimrankhan86@gmail.com` |

The 11 Production records kept their ids and values. Only their Preview target was removed. Every record is type sensitive.

**Variables are fixed when a deployment is built.** A preview built before the split still reads production. The dev alias moves to staging on the next deployment of `dev` (the merge of the B0 PR). Until then it shows production data.

### Changing Preview variables safely (Vercel CLI 50.26.1)

- `vercel env rm NAME preview` deletes the **whole record**, so on a shared record it deletes the Production value too. `vercel env update NAME preview` writes the new value to **every** target of the record. Never use either on a record that also targets Production. To take Preview off a shared record, untick Preview in the dashboard or PATCH `/v10/projects/<project id>/env/<env id>` with only `{"target":["production"]}` and no value.
- `vercel env add NAME preview` in non-interactive mode always stops with `git_branch_required`. Add a Preview variable in the dashboard or with `vercel api /v10/projects/<project id>/env -X POST --input -` and the body (`key`, `value`, `type`, `target: ["preview"]`) on stdin.
- `vercel link --yes` pulls the Development variables into `.env.local` when run in a terminal. Link with stdin not a terminal (`vercel link --yes --project pilgrimcompare </dev/null`) to link without pulling.

**Auth links (sign-up confirmation, password reset) work only on the stable dev alias.** The Supabase redirect allow-list holds only `<dev alias>/auth/confirm` and `<dev alias>/auth/confirm**`, and the Site URL is the dev alias. There is deliberately no wildcard for PR previews, so a reset or confirm link opened from a PR preview will not sign you in. Signing in with a password works everywhere.

## What a non-production deployment does differently

`isProduction()` (`lib/env.ts`) is true only when `VERCEL_ENV === 'production'`. Everywhere else (Preview, local, CI):

- A banner at the top of every page: "Test site. All operators, packages and enquiries here are fictional. Do not enter real personal details." It cannot be dismissed.
- Every response carries `X-Robots-Tag: noindex, nofollow` and `robots.txt` is `Disallow: /`.
- Email goes only to `STAGING_EMAIL_TO`, with the subject starting `[STAGING] to <original recipient>:`. If `STAGING_EMAIL_TO` or `RESEND_API_KEY` is unset, the email is logged to the server console and nothing is sent.

Production output is unchanged and pinned by tests (`tests/staging-env.test.tsx`, `tests/robots.test.ts`, `tests/email-transport.test.ts`).

## Rules

1. **Fictional data only.** Every operator name starts with "Test", ATOL numbers are 99001 to 99004, phone numbers are Ofcom drama numbers, websites are `example.com`/`example.org`, emails are `@test.local`. Never copy production data into staging.
2. **The seed never targets production.** `scripts/seed-staging.mjs` refuses to run unless `NEXT_PUBLIC_SUPABASE_URL` contains the `--ref` value, and refuses `nzvepuzzxjoxvpcrlozx` outright (`tests/staging-seed.test.ts`). It loads no `.env` file.
3. **The Free plan pauses after about a week without activity.** If the dev alias shows "couldn't load", restore the project from the Supabase dashboard (Project, Restore), wait for it to be healthy, then reseed if needed.
4. Supabase Auth on staging uses Supabase's built-in email sender, which only delivers to members of the Supabase organisation and only a few per hour. Test accounts are created already confirmed, so no auth email is needed to sign in.

## Test accounts

| Account | Email | Role |
| --- | --- | --- |
| Admin | `admin@test.local` | admin |
| Operator A (verified, London) | `operator-a@test.local` | operator |
| Operator B (verified, Manchester and Birmingham) | `operator-b@test.local` | operator |
| Operator E (pending verification) | `operator-e@test.local` | operator |
| Customer with enquiries | `customer-enquiries@test.local` | customer |
| Customer with none | `customer-new@test.local` | customer |

Passwords: `staging-seed.config.local.json`. The seed creates that file with random passwords on its first run and reuses it after. If the file is lost, delete nothing: the seed writes new passwords into a new file but never changes an existing account, so set each account's password to the new value in the Supabase dashboard (Authentication, Users). Never paste the passwords into chat, docs or tickets.

## Reseed

Additive and idempotent. Run from the repo root on Ali's Mac (needs `supabase login` and the Keychain entry):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://fkcudutzgltrsoykfvfn.supabase.co npm run seed:staging -- --ref fkcudutzgltrsoykfvfn
```

It inserts only the dataset rows that are missing and never deletes, overwrites or resets a row, so every change made during UAT is kept. Accounts are created when missing and never changed. The one write to an existing row: a seed package's empty `price_quad_per_person`, `price_triple_per_person` and `price_double_per_person` are filled with the room prices its operator notes state ("Room prices per person: Quad £1,295, ..."), only while the notes still read as seeded, and a value already set is kept. Needs migration 015 on the target (it is on staging since batch 2). Tested on the local database by `e2e/local-db/staging-seed.spec.ts`. The service role key comes from the Supabase CLI at runtime and the database password from the Keychain. The connection verifies the pooler certificate against `scripts/supabase-root-2021-ca.crt` (Supabase's public root CA).

## The dataset (`scripts/seed-staging-data.mjs`)

| Operator | State | Public? | Packages |
| --- | --- | --- | --- |
| A Test Pilgrim Travel London | verified, ATOL 99001, full profile | yes | 9 (one expired) |
| B Test Northern Umrah Services | verified, ATOL 99002 | yes | 8 (one draft) |
| C Test Minimal Tours | verified, ATOL 99003, minimal profile | yes | 7 |
| D Test Northern Pilgrimage and Heritage Travel Services Company Limited | verified, ATOL 99004, 69 character name | yes | 6 |
| E Test Pending Pilgrim Tours | pending, no ATOL | no | 2 |
| F Test Unlicensed Umrah Agency | verified, no ATOL | no | 2 |

- Packages cover LHR, LGW, STN, LTN, MAN, BHX and "not stated", 7/10/14/21 nights, 3/4/5 star and "not stated" hotels, every distance band, £699 to £6,950, two packages at £1,295 (tie sorting), one single exact price, December 2026, Ramadan, Easter and summer 2027 and off-peak dates, inclusions and ziyarat as yes, no and not stated, one package with every optional field empty, one with a very long title and hotel names, and a price date (`updated_at`) on every package.
- Room prices: the schema holds one price per package. The quad, triple and double prices are operator-stated text in the package notes, which only the operator sees.
- 12 enquiries for A and B: 8 live (email only, phone only, both), 2 already removed after 90 days, 2 erased with a deleted account. Three marketing consents (absence means no consent).
- Lead chain for the customer with enquiries: quote requests open, responded and closed, booking intents started, contacted, confirmed and closed, one open complaint (admin triage) and one closed complaint.

### Known differences from production

- Postgres 17.11 on staging, 17.6 on production (the Free plan does not let you choose).
- No Upstash on previews: rate limits use the in-memory fallback.
- Vercel cron jobs run only on production, never on previews.
- An expired package (A, package 9, August 2026) still shows publicly. There is no expiry rule in the listing today. Logged for batch 1.

## How staging was built (2026-10-07)

The same procedure as production: `npx prisma db push`, then `supabase/migrations/001` to `012` in order with `npx prisma db execute`, then the release 2026-10-06 PRE-DEPLOY block (013 and `GRANT INSERT ON public.interests TO service_role`) and POST-DEPLOY block (014) verbatim from `docs/release/RELEASE_2026-10-06.md`. `supabase/migrations-pending/PRODUCTION_CHECKS.sql` against staging: query 1 34 PASS and 0 FAIL (the same as production after 014), query 2 RLS on for all 23 tables, query 3 46 policies, query 4 0. 15 public tables, 4 storage buckets, no functions in `public`.
