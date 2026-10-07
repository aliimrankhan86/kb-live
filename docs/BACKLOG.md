# Backlog

Work the privacy page relies on that is not built yet. Each line names the deadline it must beat.

- **Delete audit log entries older than 7 years** (`audit_log_entries`). Privacy page section 5 says 7 years. No code deletes them today. The repo starts on 17 September 2025, so no entry can turn 7 before September 2032. Build a daily cron (same convention as `/api/cron/enquiry-retention`) before then.
- **Delete complaint records older than 7 years** (`complaints`). Same promise, same deadline (September 2032), same cron.
- **Remove booking payment evidence after 90 days unless disputed.** Today `pruneExpiredEvidence` (`lib/api/repository.ts`) only hides the file path on read; the stored file and the booking intent row stay. The privacy page now says so truthfully. Build the deletion (call `deleteFile` in `lib/api/storage.ts`) before the booking flow is switched back on, then change the privacy wording.
- **Self-serve removal for enquirers without an account.** Marketing choices and Hajj availability alerts go only on account deletion or by email to the DPO.

## Post-release hardening

Found by the production checks for release 2026-10-06. Do after that release's POST-DEPLOY.

- **Revoke API-role grants on `interests`.** In production, read-only check query 6 (6 October 2026) shows `anon` and `authenticated` hold INSERT, SELECT and DELETE on `public.interests`. Row level security is on with no policies, so the API roles reach no rows today, but one added policy would expose the table. The release doc says no code uses `interests` through the API roles: the Hajj "notify me" form inserts as `service_role`, and export and deletion use Prisma. Revoke ALL from `anon` and `authenticated`, keep `service_role` INSERT, then rerun query 6.

## Post-release items

Logged after release 2026-10-06 shipped (`main` `0c80db9`).

- **Interests API role grants hardening.** See "Revoke API-role grants on `interests`" above. The release POST-DEPLOY is done, so this is unblocked.
- **Rename the Supabase organisation** from "kaabatrip" to the PilgrimCompare name.
- **En dashes in ranges.** The signup and login password hints write the A to Z and 0 to 9 ranges with an en dash, and `/umrah` writes "Children (0 to 11 years)" with an en dash. Replace each with "to".
- **Page titles repeat the brand.** Some titles end in "| PilgrimCompare | PilgrimCompare".
- **`/partner` trial wording.** It says "Free to list during the 90-day trial" while the founding cohort gets 12 months free. Copy decision for Ali.
- **React #418 hydration error.** Seen once on the preview homepage, not reproduced. Watch for it in production logs.
- **Vercel access.** The Vercel MCP and CLI need re-authenticating to the team scope to read deployments and runtime logs. The CLI was re-authenticated on 2026-10-07 and reads deployments, env names and runtime logs. The MCP was not rechecked.

## Batch 1 (found in B0, 2026-10-07)

- **Email sends are fire-and-forget without `after()`. Fix before the first operator publishes.** `app/api/enquiries/route.ts`, `app/api/quote-requests/route.ts` and `app/api/booking-intents/route.ts` call `void send...()` and return the response straight away. On Vercel the function can stop once the response is sent. On the B0 preview, enquiry `PC-F4E2DB05` sent no email and logged nothing, and `PC-CD71B4EA` logged Resend `application_error` "Unable to fetch data". Production runs the same code. Fix: wrap each call in `after()` from `next/server`, then submit an enquiry on the dev alias and check `STAGING_EMAIL_TO`.
- **Expired packages still list.** There is no expiry rule. Staging package 9 (operator A, August 2026) shows on `/search/packages`. Decide the rule (for example, hide a package once its return date has passed) and add it to `lib/listing.ts`.
