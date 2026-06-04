# Compare (skills)

**Selection rules**  
- Min 2 items to compare; max 3 (enforced in `lib/comparison.ts` — `handleComparisonSelection`).  
- Selecting when at cap shows inline message; selection not added.

**Compare CTA enable/disable**  
- Disabled when fewer than 2 selected; enabled when 2 or 3.  
- Button: `data-testid="search-compare-button"`.  
- Use `aria-disabled` and optional `aria-describedby` for help text when disabled.

**Modal expectations**  
- Clicking Compare opens a modal (Dialog) that **must** render a table with `[data-testid="comparison-table"]`.  
- Component: `ComparisonTable` from `@/components/request/ComparisonTable`.  
- Modal: scrollable content (e.g. max-h 90vh), table area scrolls; close button always visible (e.g. top-right).  
- Do not remove the testid; E2E and QA rely on it.

**Debug checks**  
- In DOM: find `[data-testid="comparison-table"]`; ensure thead has one column per selected item; tbody has feature rows (Price, Operator, etc.).  
- If modal is blank: confirm 2+ items selected and that `comparisonRows` (or equivalent) is passed with length ≥ 2.
