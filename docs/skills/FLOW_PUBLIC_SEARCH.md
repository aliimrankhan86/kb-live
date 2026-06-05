# Public search flow (skills)

**What /umrah submits**  
- Form submits via GET to `/search/packages` with query params: `type`, `season`, `budgetMin`, `budgetMax`, `adults`.  
- Hidden inputs + `router.push` in `UmrahSearchForm.tsx`: `type=umrah`, `season` (from quick pick or flexible), `budgetMin`/`budgetMax` (optional), `adults`.  
- Do not rename these param names without updating docs and any server/filter code.

**What /search/packages expects and how it filters**  
- Reads same params from URL (`useSearchParams`).  
- Filter logic: `filterByParams` in `app/search/packages/page.tsx` — filters by `type` (umrah/hajj), `season` (maps to seasonLabel), `budgetMin`/`budgetMax` (price range).  
- Packages from `Repository.listPackages()`; catalogue packages passed to `PackageList` for shortlist/compare.

**What success looks like**  
- Visible packages list; count reflects filters.  
- Shortlist count in header updates when user toggles shortlist (`data-testid="search-shortlist-count"`).  
- Compare CTA enabled when 2+ packages selected; opens modal with comparison table.  
- No horizontal scroll at 320px; compare modal scrollable and close button accessible on mobile.
