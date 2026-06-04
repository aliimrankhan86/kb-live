# Shortlist and Compare spec

- **Shortlist**
  - localStorage key: `kb_shortlist_packages` (array of package IDs).
  - De-dupe on load/save. Count visible in header. "Shortlist only" filter. Toggles update state and persist.
- **Compare**
  - Logic: `lib/comparison.ts` `handleComparisonSelection` (max 3). Compare CTA disabled until 2 selected; inline message for cap.
  - Clicking Compare opens modal with `ComparisonTable`. Modal must render `[data-testid="comparison-table"]`. On mobile: modal max-h 90vh, table area scrollable, close visible.
- **Test IDs:** Do not rename or remove. Compare button: `data-testid="search-compare-button"`. Shortlist count: `data-testid="search-shortlist-count"`. Comparison table: `data-testid="comparison-table"`.
