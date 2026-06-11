# Filter Overlay (search packages)

`FilterOverlay.tsx` is the filter modal for the search packages page. It reads
the current filters from the URL search params and, on apply, writes the
selected values **directly back to the URL** via `next/navigation`. There is no
internal `FilterState` object and no per-filter sub-components — the URL is the
single source of truth, so results stay shareable and survive refresh/back.

## How it works

- Opened from `PackageList`, rendered inside the shared `@/components/ui/Overlay`.
- Reads initial values with `useSearchParams()`.
- Local draft state while the modal is open; nothing is applied until the user
  confirms.
- On apply, builds a new query string and calls `router.replace(pathname?…)`.
  `SearchPackagesClient` re-renders from the updated params.
- Reset clears the relevant params from the URL.

## Filter controls

Range inputs use the shared `@/components/ui/RangeSlider`. Budget and distance
are dual-range; remaining filters (flight type, hotel rating, time period) are
plain inputs/toggles whose values map to URL params.

## Theming

CSS modules + CSS variables (`--bg`, `--text`, `--yellow`, `--font-exo2`).

> Historical note: an earlier decorative version exposed a `FilterState` API and
> a `filters/` subfolder of per-filter components, plus a parallel
> `components/ui/FilterOverlay*` system. All of that was removed once the overlay
> began writing URL params directly. Don't reintroduce a separate state object —
> keep the URL authoritative.
