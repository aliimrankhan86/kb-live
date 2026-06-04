# AGENTS.md (KaabaTrip)

## Purpose

This file tells any AI agent or developer exactly what they can touch, how to prove work is correct, and what is mandatory before pushing.

## Hard rules

1. **Read `docs/README_AI.md` and `docs/NOW.md` before doing anything.**
2. **Read `docs/UX_GUIDELINES.md` before editing any UI component.**
3. **Read `docs/SEO.md` before adding or changing any public route.**
4. **Read `docs/OPERATOR_ONBOARDING.md` before working on operator features.**
5. Only read and modify files listed in **Allowed files** for your scope.
6. If you need a file not listed, ask first.
7. Keep diffs small and focused. One concern per commit.
8. Add stable `data-testid` attributes for anything Playwright will test.
9. Accessibility is required: labels, keyboard support, focus management, clear errors.
10. **Update the relevant doc(s) when your changes affect the spec** (e.g., new fields → update `OPERATOR_ONBOARDING.md`, new route → update `SEO.md`).

## MANDATORY: Before every push

This is non-negotiable. Every push must include:

1. **`docs/NOW.md` updated** with what changed, current state, and next step.
2. **`npm run test` passes** (all unit tests green).
3. **`npm run build` passes** (zero type errors, zero build errors).
4. If UI/routing changed: manual smoke on `/`, `/umrah`, `/search/packages` at 320px and 1280px.
5. If `data-testid` or routes changed: `npx playwright test` must pass.

If you skip this, the push will be reverted.

## Allowed files — Public Flow UI

- `app/page.tsx`
- `app/umrah/page.tsx`
- `app/search/packages/page.tsx`
- `app/packages/[slug]/page.tsx`
- `components/layout/Header.tsx`
- `components/marketing/Hero.tsx`
- `components/umrah/UmrahSearchForm.tsx`
- `components/search/PackageList.tsx`
- `components/search/PackageCard.tsx`
- `components/search/FilterOverlay.tsx`
- `components/request/ComparisonTable.tsx`
- `components/ui/Overlay.tsx`
- `lib/comparison.ts`
- `lib/mock-packages.ts`
- `lib/utils.ts`
- `lib/get-error-message.ts`
- `lib/i18n/*`
- `styles/tokens.css`

## Allowed files — Operator Dashboard & Onboarding

- `app/operator/dashboard/page.tsx`
- `app/operator/packages/page.tsx`
- `app/operator/analytics/page.tsx`
- `app/operator/onboarding/page.tsx` (create if needed)
- `app/operators/[slug]/page.tsx`
- `components/operator/*`
- `components/operators/*`
- `lib/api/repository.ts`
- `lib/api/mock-db.ts`
- `lib/types.ts`
- `lib/seo/json-ld.ts` (create if needed)
- `lib/validation.ts` (create if needed)

## Allowed files — Config & Docs

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `docs/NOW.md` (MUST update before push)
- `docs/README_AI.md`
- `docs/UX_GUIDELINES.md` (MUST update when adding UI patterns)
- `docs/SEO.md` (MUST update when adding routes)
- `docs/OPERATOR_ONBOARDING.md` (MUST update when changing operator schema)
- `docs/*.md`
- `QA.md`

## Checks before handoff

```bash
npm run test         # Must pass
npm run build        # Must pass
npm run dev          # Manual smoke check
```

## Evidence format (include in commit message or PR)

- Files changed (list)
- Commands run + results
- What was verified manually
- Any known limitations
