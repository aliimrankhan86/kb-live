# Repo Map (KaabaTrip)

Fast navigation guide. If you add a feature or refactor, update this file.

## Stack

Next.js 15.5.3 (App Router) | React 19 | Tailwind v4 | TypeScript strict | Vitest | Playwright

## Routes (`app/`)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing. Hero CTAs. |
| `/umrah` | `app/umrah/page.tsx` | Search preferences form. Submits to `/search/packages`. |
| `/search/packages` | `app/search/packages/page.tsx` | Results + shortlist + compare. |
| `/packages` | `app/packages/page.tsx` | Public package browse. |
| `/packages/[slug]` | `app/packages/[slug]/page.tsx` | Package detail. |
| `/operators/[slug]` | `app/operators/[slug]/page.tsx` | Operator profile. |
| `/quote` | `app/quote/page.tsx` | Quote wizard. |
| `/requests/[id]` | `app/requests/[id]/page.tsx` | Request detail (offers, compare). |
| `/operator/dashboard` | `app/operator/dashboard/page.tsx` | Operator quote inbox. |
| `/operator/packages` | `app/operator/packages/page.tsx` | Operator package CRUD. |
| `/operator/analytics` | `app/operator/analytics/page.tsx` | Operator stats. |
| `/robots.txt` | `app/robots.ts` | SEO. |
| `/sitemap.xml` | `app/sitemap.ts` | SEO. |

## Components

| Folder | Key files | Purpose |
|--------|-----------|---------|
| `components/layout/` | `Header.tsx` (server) | Site header + nav. Will include language switcher. |
| `components/marketing/` | `Hero.tsx` (server) | Landing hero CTAs. |
| `components/umrah/` | `UmrahSearchForm.tsx` | Search preferences form. |
| `components/search/` | `PackageList.tsx`, `PackageCard.tsx`, `FilterOverlay.tsx` | Search results, shortlist, compare. |
| `components/request/` | `ComparisonTable.tsx`, `RequestDetail.tsx` | Comparison UI, request view. |
| `components/packages/` | `PackagesBrowse.tsx`, `PackageDetail.tsx` | Public catalogue browse + detail. |
| `components/operator/` | `OperatorDashboard.tsx`, `PackageForm.tsx`, `OperatorPackagesList.tsx` | Operator tools. |
| `components/ui/` | `Overlay.tsx`, `Slider.tsx` | Shared primitives (Radix-based). |

## Library (`lib/`)

| File | Purpose |
|------|---------|
| `lib/types.ts` | Domain types: Package, Offer, QuoteRequest, User, etc. |
| `lib/mock-packages.ts` | Display-shape Package type + mock data (for search cards). |
| `lib/api/repository.ts` | RBAC-aware data access layer. All reads/writes go through here. |
| `lib/api/mock-db.ts` | localStorage-backed storage + seed data. |
| `lib/comparison.ts` | Comparison mapping (offers + packages → ComparisonRow). |
| `lib/i18n/region.ts` | Region detection (locale + timezone → currency + distance unit). |
| `lib/i18n/format.ts` | Currency conversion, price/distance formatting. |
| `lib/utils.ts` | Shared `cn()` utility (clsx + tailwind-merge). |
| `lib/get-error-message.ts` | Shared error message extraction. |
| `lib/seo.ts` | Base metadata for Next.js. |
| `lib/slug.ts` | Slug generation. |
| `lib/config.ts` | App configuration constants. |

## Tests

| File | What it tests |
|------|--------------|
| `tests/comparison.test.ts` | Comparison mapping logic. |
| `tests/phase2.test.ts` | Mapping + helper behaviour. |
| `tests/hero.spec.tsx` | Hero component rendering. |
| `tests/packages-browse.test.tsx` | PackagesBrowse component. |
| `e2e/flow.spec.ts` | Quote → Offer → Compare E2E flow. |
| `e2e/catalogue.spec.ts` | Browse → Detail → Operator → Compare. |

## Common tasks

### Change search results behaviour
- `app/search/packages/page.tsx` (filterByParams, toSearchDisplay)
- `components/search/PackageList.tsx` (state, compare CTA, dialog)
- `components/search/PackageCard.tsx` (card UI)

### Update comparison fields
- `lib/comparison.ts` (mapping)
- `components/request/ComparisonTable.tsx` (UI)
- `tests/comparison.test.ts` (update tests)

### Add i18n translations
- `lib/i18n/translations/*.json` (add/edit strings)
- Component files (replace hardcoded text with `t()` calls)
- See `docs/I18N.md` for full spec.
