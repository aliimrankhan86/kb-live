# Docs merge checklist

Use this when **merging branches** so docs stay canonical and token-efficient for AI (Cursor/Codex/Gemini).

## 1. Reconcile docs on merge

- [ ] **docs/NOW.md** — Update "Branch & goal", "What works", "What changed this branch", "Next (top 3)", "Commands to verify". Remove stale "parked" or old branch notes; keep one source of truth.
- [ ] **docs/CURSOR_CONTEXT.md** — Update "Current state", "File map" if routes/components changed. Remove duplicate or contradictory bullets.
- [ ] **docs/HANDOVER_CHANGES_AND_GUIDANCE.md** — Add one short dated entry to "Recent change log"; update "Known issues" only with final conclusions; keep "Where to look" pointers accurate.
- [ ] **docs/00_AGENT_HANDOVER.md** — Ensure "Read order" and "Start here" point to the three canonical docs; no duplicate rules.

## 2. Token discipline

- Prefer **short, factual** lines: paths, commands, one-line descriptions.
- **No duplication:** If it’s in NOW.md, don’t repeat the same paragraph in CURSOR_CONTEXT or HANDOVER; cross-reference instead.
- **Single canonical place per topic:** e.g. "Commands to verify" only in NOW.md; merge checklist only here.

## 3. Required verification commands

Before considering the merge done, run:

```bash
npm run test
npx playwright test e2e/flow.spec.ts
npx playwright test e2e/catalogue.spec.ts
npm run build
```

## 4. Quick route checks

- [ ] **/** — Landing loads; Hero CTAs visible; no horizontal scroll.
- [ ] **/umrah** — Form usable; "Search For Amazing Packages" submits to /search/packages.
- [ ] **/search/packages?type=umrah&season=flexible&budgetMin=500&budgetMax=1000&adults=2** — Results show; shortlist count updates; Compare(2) opens modal; table scrolls on small viewport.
