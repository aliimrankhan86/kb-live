# Shortlist (skills)

**Storage key**  
- `kb_shortlist_packages` — localStorage, array of package IDs (strings).

**Always de-dupe IDs**  
- On load: parse from localStorage, then `Array.from(new Set(ids))` (or equivalent) before setting state.  
- On save: persist only after de-duping.  
- Helper in codebase: `uniqueIds(ids)` used in PackageList.

**Toggle behaviour and expected UI states**  
- Toggle adds/removes package ID from shortlist; state and localStorage update immediately.  
- Shortlist count visible in header (`data-testid="search-shortlist-count"`).  
- "Shortlist only" filter (when present) restricts list to shortlisted IDs.  
- Do not remove or rename the storage key; do not change the array shape (array of IDs).
