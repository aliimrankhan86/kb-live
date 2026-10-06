# Backlog

Work the privacy page relies on that is not built yet. Each line names the deadline it must beat.

- **Delete audit log entries older than 7 years** (`audit_log_entries`). Privacy page section 5 says 7 years. No code deletes them today. The repo starts on 17 September 2025, so no entry can turn 7 before September 2032. Build a daily cron (same convention as `/api/cron/enquiry-retention`) before then.
- **Delete complaint records older than 7 years** (`complaints`). Same promise, same deadline (September 2032), same cron.
- **Remove booking payment evidence after 90 days unless disputed.** Today `pruneExpiredEvidence` (`lib/api/repository.ts`) only hides the file path on read; the stored file and the booking intent row stay. The privacy page now says so truthfully. Build the deletion (call `deleteFile` in `lib/api/storage.ts`) before the booking flow is switched back on, then change the privacy wording.
- **Self-serve removal for enquirers without an account.** Marketing choices and Hajj availability alerts go only on account deletion or by email to the DPO.
