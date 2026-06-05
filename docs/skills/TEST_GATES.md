# Test gates (skills)

**When to run `npm run test`**  
- After every micro-task that touches logic, components, or lib (e.g. shortlist, compare, filters, repository).  
- Before committing.  
- Unit tests: Vitest, in `tests/`.

**When to run Playwright flow + catalogue**  
- After any routing or UI behaviour change (e.g. form submit URL, compare modal, shortlist visibility, new routes).  
- Commands: `npx playwright test e2e/flow.spec.ts` and `npx playwright test e2e/catalogue.spec.ts`.  
- If selectors or testids changed, update the E2E tests in the same branch.

**Always run `npm run build` before pushing big changes**  
- Catches build-only failures and ensures production bundle is valid.  
- Run after a session that changed app code, config, or dependencies.

**Summary**  
- Micro-task → `npm run test`.  
- Routing/UI change → Playwright flow + catalogue.  
- Before push (big change) → `npm run build`.
