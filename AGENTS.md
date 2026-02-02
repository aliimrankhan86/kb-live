# AGENTS.md (KaabaTrip)

## Purpose

This file tells any coding agent exactly what it is allowed to touch and how to prove work is correct.

## Hard rules

- Do not scan the entire repo.
- Only read and modify files listed in **Allowed files**.
- If you need another file, ask first and wait.
- Keep diffs small and focused.
- Add stable `data-testid` hooks for anything that will be used by Playwright.
- Accessibility is required: labels, keyboard support, focus, clear error messages.

## Allowed files (Operator Packages UI scope)

- app/operator/packages/page.tsx (or equivalent route file)
- components/operator/OperatorPackagesList.tsx
- components/operator/OperatorPackageForm.tsx (if it exists)
- components/ui/Overlay.tsx (or your standard overlay component)
- components/ui/ConfirmDialog.tsx (if you have one)
- lib/api/repository.ts
- lib/types.ts
- QA.md
- docs/06_ACCESSIBILITY.md
- docs/05_SECURITY.md

## Checks (must run before handoff)

- `npm run dev` (manual smoke check)
- Unit tests (if configured): `npm run test` or `npm run test:unit`
- E2E (if relevant selectors changed): `npx playwright test e2e/flow.spec.ts`

## Evidence required for QA handoff

- Files changed (list)
- Manual smoke steps performed
- Commands run and results (copy output)
- Any known limitations or follow-up tasks
