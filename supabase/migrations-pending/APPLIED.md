# Applied pending migrations

Record of SQL from this folder that has been run in production. Release doc: `docs/release/RELEASE_2026-10-06.md`.

## Release 2026-10-06

Both blocks were run verbatim from the release doc by Claude in Chrome on Ali's instruction, on 6 October 2026.

| Migration | Block | Applied | Check result |
| --- | --- | --- | --- |
| 013 `013_operator_atol_abta_checked_at.sql` | PRE-DEPLOY | 6 Oct 2026, before the main deploy (Chrome Step A) | Read-only queries 4 and 5 returned 0. Query 1 showed 30 FAIL rows, cleared by 014. |
| 014 `014_revoke_api_role_writes_operator_profiles.sql` | POST-DEPLOY | 6 Oct 2026, about 21:58, after production deployment `dpl_37VRWgywt4AhiwteZyHz9UfwURjs` was READY (Chrome Step B) | Check query returned 0 rows. Query 1 rerun as a lone read-only SELECT: 34 rows, 0 FAIL, all PASS (was 30 FAIL). |

After 014, the live pages `/`, `/search/packages`, `/packages`, `/partner`, `/privacy`, `/umrah`, `/hajj` and `/login` all returned 200.

Rollback for 014, only if needed: `GRANT ALL ON public.operator_profiles TO anon, authenticated`
