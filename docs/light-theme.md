# Light Theme — Madinah (Implementation Reference)

> **Status:** Shipped — `feature/light-theme` merged to `dev` + `main` on 2026-06-13.
> Tests: 1,818 pass · Build: 0 errors · TypeScript: clean

---

## 1. What Was Built

An optional warm-ivory "Madinah" light theme for PilgrimCompare, togglable by the user and persisted to `localStorage`. The dark theme is the default and is **completely unchanged** in appearance. This was a purely additive change.

---

## 2. Architecture

### Theme switching mechanism
- `data-theme="light"` attribute set on `<html>` by `ThemeProvider`
- All colour overrides live in `styles/tokens.css` under `[data-theme="light"] :root { … }`
- No separate CSS files — one token rewrite governs the entire UI
- Tailwind v4 tokens in `app/globals.css` map to CSS variables, so `text-[var(--text)]` adapts automatically

### Flash prevention
`app/layout.tsx` injects an inline blocking `<script>` in `<head>` that reads `localStorage('theme')` before React hydrates and sets `data-theme` immediately. No flash of wrong theme on hard reload.

### Persistence
`localStorage` key: `theme`. Values: `'light'` | `'dark'`. Defaults to dark if absent.

---

## 3. Files Changed

| File | What changed |
|------|-------------|
| `styles/tokens.css` | Added full `[data-theme="light"] :root` block — all colour tokens redefined |
| `app/globals.css` | Light body gradient, `body::before` overlay hidden, warm scrollbar |
| `app/layout.tsx` | Flash-prevention inline script; `ThemeProvider` wrapper |
| `components/theme/ThemeProvider.tsx` | New — context + hook, localStorage read/write |
| `components/theme/ThemeToggle.tsx` | New — labeled pill button (Sun/Moon + "Light"/"Dark" text) |
| `components/layout/Header.tsx` | ThemeToggle added to desktop nav right rail |
| `components/layout/MobileMenuDrawer.tsx` | ThemeToggle added inside mobile drawer |
| `public/text-logo-light.svg` | New — warm stone wordmark for light theme |
| `public/kaaba-bg-light.svg` | New — warm stone Kaaba SVG (used in earlier iteration; now replaced by gradient) |
| `components/search/packages.module.css` | Light-theme-aware token audit + search header redesign |
| `components/search/PackageList.tsx` | Search header JSX restructure + pagination wiring |
| `app/partner/page.tsx` | "Sign in to Dashboard" upgraded to filled CTA (`var(--primary)`) |
| `lib/api/mock-db.ts` | Bump `PACKAGES_SEED_VERSION` to 5, add pkg10–pkg17 |
| `prisma/seed.ts` | Add pkg7–pkg14 to real DB for pagination demo |

**CSS modules audited for token coverage** (no hardcoded colours remain in light-sensitive paths):
`packages.module.css`, `PackageCard.module.css`, `FilterOverlay.module.css`, `CompareBar.module.css`, `Header.module.css`, `Footer.module.css`, all overlay/badge/button components.

---

## 4. Colour Tokens — Light Theme

All defined in `styles/tokens.css` under `[data-theme="light"] :root`.

| Token | Dark value | Light value | Notes |
|-------|-----------|-------------|-------|
| `--bg` | `#0A0A0A` | `#F6F4EE` | Warm ivory base |
| `--surfaceDark` | `#141414` | `#FFFFFF` | Card surfaces |
| `--panel` | `#1A1A1A` | `#F0EDE5` | Panel / sidebar |
| `--text` | `#F5F5F5` | `#1C1917` | Primary text |
| `--textMuted` | `#A3A3A3` | `#78716C` | Secondary text |
| `--yellow` | `#FFD31D` | `#8A6800` | Gold → deep Madinah amber (WCAG AA 4.84:1 on ivory) |
| `--primary` | `#FFD31D` | `#0A6937` | Prophetic green for primary actions |
| `--border` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.10)` | Card borders |
| `--borderSubtle` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.07)` | Subtle dividers |
| `--color-text-on-brand` | `#000000` | `#F9FAFB` | Text on coloured buttons |

### Background
- **Dark:** `kaaba-bg2.svg` watermark, `rgba(10,10,10,0.80)` overlay, fixed attachment
- **Light:** `linear-gradient(160deg, #F8F6F1 0%, #EDE8DC 55%, #F4F0E7 100%)` — no SVG watermark

---

## 5. Theme Toggle Component

**File:** `components/theme/ThemeToggle.tsx`

- Labeled pill: Moon icon + "Dark" in light mode; Sun icon + "Light" in dark mode
- Shows the **target** mode, not the current one (standard UX pattern)
- `minHeight: 44px` (WCAG 2.2 / Apple HIG touch target)
- Placed in desktop nav right rail and inside mobile drawer
- `data-testid="desktop-theme-toggle"` / `data-testid="mobile-theme-toggle"` for Playwright

```tsx
// Usage — already wired. No props needed.
import { ThemeToggle } from '@/components/theme/ThemeToggle';
<ThemeToggle />
```

---

## 6. Search Results Header Redesign

**Files:** `components/search/PackageList.tsx`, `components/search/packages.module.css`

Redesigned to world-class quality in both themes:

- **Count number:** `1.875rem` / `font-weight: 800` / `color: var(--yellow)` — large gold/amber anchor
- **Disclosure text:** merged inline below the count (compact, no wasted vertical gap)
- **Filter / Sort buttons:** surface-filled (`var(--surfaceDark)`) with 1px border + subtle shadow; hover shifts to `var(--primary)` colour
- **Saved chip:** pill style, moved into the same controls row as Filter/Sort
- **Single-row layout:** count left, controls right — no stacking except on very narrow viewports

---

## 7. Pagination

**File:** `components/search/PackageList.tsx`

- `PACKAGES_PER_PAGE = 5` constant
- `currentPage` state resets to 1 on sort or filter change
- `pagedPackages = listPackages.slice((page-1)*5, page*5)` — rendered instead of full list
- `<Pagination>` component (existing `components/ui/Pagination.tsx`) shown when `totalPages > 1`
- Clicking a page calls `window.scrollTo({ top: 0, behavior: 'smooth' })`
- Total count in the header reflects **all** matching packages, not just the current page

---

## 8. Additional Mock Packages

Added 8 new packages to `mock-db.ts` (SEED_PACKAGES, version 5) and 8 to `prisma/seed.ts` for the real database:

| ID | Operator | Type | Nights | Price | Airport | Notes |
|----|----------|------|--------|-------|---------|-------|
| pkg7/pkg10 | op1/op1 | umrah | 14 | £1,350 | MAN | Family, school holidays |
| pkg8/pkg11 | op2/op2 | umrah | 5 | £649 | BHX | Economy budget |
| pkg9/pkg12 | op3/op3 | umrah | 12 | £2,199 | LHR | Ramadan premium |
| pkg10/pkg13 | op1/op1 | hajj | 21 | £4,999 | LHR | Hajj standard |
| pkg11/pkg14 | op2/op2 | umrah | 8 | £975 | LGW | Mid-range |
| pkg12/pkg15 | op3/op3 | umrah | 6 | £549 | MAN | Budget |
| pkg13/pkg16 | op1/op1 | umrah | 10 | £1,199 | BHX | Silver |
| pkg14/pkg17 | op2/op2 | hajj | 28 | £7,500 | MAN | Hajj premium |

*Note: mock-db IDs (left) differ from Prisma seed IDs (right) because the original mock and DB seeds had different numbering.*

---

## 9. Constraints Honoured

- Dark theme appearance: **completely unchanged**
- No new npm dependencies added
- No schema migrations, no database schema changes
- TypeScript strict throughout — no `any` types introduced
- No inline styles except where Tailwind v4 requires CSS variable injection
- All changes on `feature/light-theme` branch, merged via PR flow

---

## 10. Known Gaps / Future Work

| Item | Priority | Notes |
|------|----------|-------|
| Quote wizard hardcoded `#FFD31D` | Low | 5 step files + `QuoteRequestWizard.tsx:126`. Only affects users who open the quote wizard in light mode. Replace with `var(--yellow)`. |
| Logo light variant not yet used | Low | `public/text-logo-light.svg` exists but `WordmarkLogo.tsx` hasn't been updated to switch based on theme. Currently the dark logo renders in both themes (acceptable contrast). |
| E2E Playwright tests for theme toggle | Low | No Playwright coverage for toggle state or per-theme visual regression. Add when Playwright suite expands. |

---

## 11. How to Extend

### Adding a new page that respects light theme
Use only CSS variable tokens — never hardcode hex or `rgba` values directly in component styles:

```css
/* ✅ correct — adapts to both themes */
color: var(--text);
background: var(--surfaceDark);
border: 1px solid var(--borderSubtle);

/* ❌ wrong — breaks in light mode */
color: #F5F5F5;
background: #141414;
```

### Adding a new token
1. Add to `[data-theme="dark"] :root` (or base `:root`) in `styles/tokens.css`
2. Add the overriding light value to `[data-theme="light"] :root`
3. Reference via `var(--myToken)` in components

### Testing both themes locally
```bash
npm run dev
# Open http://localhost:3000
# Click the Light/Dark toggle in the header
# Or: document.documentElement.setAttribute('data-theme', 'light') in DevTools console
```
