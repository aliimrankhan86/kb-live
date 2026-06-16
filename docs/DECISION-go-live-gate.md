# Decision Record — Go-Live Gate (dev → main promotion)

**Date:** 2026-06-16
**Status:** Verified. Awaiting explicit founder go before merge. **No merge performed.**

## The decision being protected

1. **`chore/legal-entity-disclosure` branch stays closed/idle** until Companies House AD01 filing yields a virtual registered office address. No PR open. ✅
2. **`tests/legal.test.ts` must NOT be tightened to require `registeredOffice`.** Promoting a guard that requires a field deliberately left blank would fail the build on `main`. ✅ Confirmed not staged anywhere.
3. **`lib/legal.ts` `registeredOffice` is `''` on purpose** (pending AD01). Entity line renders with **no** registered office address. ✅

## Verification (read-only, 2026-06-16)

| Check | Result |
|---|---|
| dev HEAD | `230cbaf` |
| main HEAD | `7431526` |
| dev ahead of main | 21 commits |
| `npx tsc --noEmit` | PASS |
| `npm run build` | 0 errors |
| Vitest | 1860/1860 (31 files) |
| Working tree | clean on `dev`, matches `origin/dev` (only untracked `docs/THEME-KNOWLEDGE.md`, `screenshots/`) |
| Open PRs | none |

### Legal entity (matches decision)
- `lib/legal.ts:9` — `registeredOffice: ''` with TODO comment. Not filled.
- `tests/legal.test.ts` — guards only `companyName`, `companyNumber`, `contactEmail` non-empty. Does **not** require `registeredOffice`.
- Render sites: `components/layout/Footer.tsx:258-263`, `app/terms/page.tsx:55-58`, `app/privacy/page.tsx:37-40`. None reference `registeredOffice`.
- Rendered line: *"Paramount Consultants Limited, registered in England and Wales (company no. 09679002). VAT no. GB 221 6154 46"* — no office address.

### Artifacts present on dev HEAD
- **Plausible:** nonce'd cookieless script + `VERCEL_ENV === 'production'` gate (`app/layout.tsx:78-83`, `data-domain="pilgrimcompare.co.uk"`); `plausible.io` in **both** `script-src` (`middleware.ts:50`) and `connect-src` (`middleware.ts:55`); single `'Enquiry Submitted'` goal on PC- confirmation (`components/enquiry/EnquiryForm.tsx:86`).
- **Role backfill:** `scripts/backfill-roles.mjs` + `scripts/count-roles.mjs`.
- **Marketing opt-in + enquiry journey:** `app/api/enquiries/route.ts`, `app/packages/[slug]/enquire/page.tsx`, `components/enquiry/EnquiryForm.tsx` (`data-testid="enquiry-marketing-consent"`), `supabase/migrations/011_marketing_consents_table.sql`.

### Minor non-blocker
- `scripts/test-emails.mjs:99,104,113` still contain hardcoded sample `KT-9X2P4A` in a manual email-preview dev utility — not app code, tests, e2e, or a generation source. Task C's "zero KT- in code/tests/e2e/sql" still holds.

### Founder prereqs (cannot be verified by tooling)
- Plausible site `pilgrimcompare.co.uk` must exist in the dashboard, else launch runs blind from minute one.
- `FEATURE_FEATURED_SLOTS=false` set in Vercel.

Neither blocks the merge mechanically; do both before promoting.
