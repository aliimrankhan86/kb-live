# UX Guidelines

Industry best practices for pilgrimage travel comparison. Every component must follow these rules. When implementing, reference this file for design decisions.

---

## 1. Design principles

1. **Comparison is the product.** Every screen leads to or supports side-by-side evaluation. If a feature doesn't help the user compare, question whether it belongs.
2. **Mobile first.** 60%+ of Umrah/Hajj travellers browse on phones. Design for 320px, then enhance for desktop.
3. **Trust through transparency.** Show operator verification status, ATOL/ABTA numbers, and "Not provided" for missing fields — never hide gaps.
4. **Reduce cognitive load.** Use consistent card layouts, predictable CTAs, and visual hierarchy so users scan, don't read.
5. **Respect cultural context.** Support RTL (Arabic), use respectful language about pilgrimage, never use gambling metaphors ("best deal").

---

## 2. Package card design (the most important component)

The package card is the core decision unit. Users scan 5-15 cards before shortlisting. Every card must answer the 6 key questions:

### The 6 questions a card must answer at a glance

| Question | What to show | Priority |
|----------|-------------|----------|
| How much? | Price + "from" indicator + currency | Highest — top-right, large font |
| Who's selling? | Operator name + verified badge | High — visible without scrolling |
| Where do I stay? | Hotel name, star rating, distance to Haram | High — the #1 concern for pilgrims |
| What's included? | Visa, flights, transfers, meals as icon chips | Medium — scannable icons |
| When? | Date range or "Flexible" | Medium |
| How long? | Total nights (split: Makkah/Madinah) | Medium |

### Card layout (mobile-first)

```
┌─────────────────────────────────────────┐
│ [Operator name]  [Verified ✓]    £1,200 │
│                                from/pp  │
│─────────────────────────────────────────│
│ ★★★★★ Hotel Name, Makkah               │
│ 200m to Haram · 5 nights               │
│─────────────────────────────────────────│
│ ★★★★☆ Hotel Name, Madinah              │
│ 500m to Haram · 3 nights               │
│─────────────────────────────────────────│
│ ✓Visa  ✓Flights  ✓Transfers  ✗Meals    │
│ 8 nights total · Ramadan 2026           │
│─────────────────────────────────────────│
│ [♡ Shortlist]  [⊞ Compare]  [View →]   │
└─────────────────────────────────────────┘
```

### Card rules

- **Price:** Always top-right. Use `Intl.NumberFormat` for locale-correct formatting. Show "from" label if `priceType === 'from'`. Show converted price if user's currency differs from package currency.
- **Operator:** Show company name, never just "Operator ID". Show verified badge if `verificationStatus === 'verified'`. Show ATOL number if available (UK trust signal).
- **Hotels:** Show actual hotel name (users Google it). Star rating as filled/empty stars. Distance in user's preferred unit (miles/km). "Walking distance" for < 500m.
- **Inclusions:** Use consistent icon set. Checkmark (included) vs X (not included). Order: Visa, Flights, Transfers, Meals. Add "Ziyarat" and "Guide" when those fields exist.
- **Actions:** Three CTAs in consistent order: Shortlist (toggle), Compare (toggle), View Detail (link). Shortlist and Compare show pressed state. Min tap target 44px.

---

## 3. Comparison table design

The compare modal is the decision moment. Users have narrowed to 2-3 options and need clarity.

### Comparison rows (ordered by decision impact)

| Row | Why it matters | Display format |
|-----|---------------|----------------|
| **Price** | #1 decision factor | Converted to user's currency, formatted with locale |
| **Operator** | Trust | Name + verified badge + ATOL if available |
| **Hotel (Makkah)** | Proximity to worship | Name, stars, exact distance |
| **Hotel (Madinah)** | Same | Name, stars, exact distance |
| **Nights split** | Duration balance | "5 Makkah / 3 Madinah" |
| **Flights** | Convenience | Departure airport, airline if available |
| **Inclusions** | Hidden costs | Checkmarks for each item |
| **Cancellation** | Risk comfort | Policy summary or "Not provided" |
| **Notes** | Differentiators | Operator's own pitch, max 2 lines |

### Comparison UX rules

- Sticky header with operator names (so user knows which column is which while scrolling).
- Highlight best value in each row (lowest price, highest stars, nearest distance) with a subtle accent.
- "Not provided" in muted text — never leave blank cells.
- Close button always visible (fixed top-right).
- On mobile: horizontal scroll with first column (feature labels) frozen.

---

## 4. Consistent component library

All UI must use these shared components. Never create one-off equivalents.

| Component | Location | Use for |
|-----------|----------|---------|
| `Overlay` (Dialog) | `components/ui/Overlay.tsx` | All modals: compare, filters, forms |
| `Slider` | `components/ui/Slider.tsx` | Budget range, distance range |
| `cn()` | `lib/utils.ts` | All class merging (Tailwind + conditional) |
| Star rating | Extract from `PackageCard` into shared | Hotel ratings everywhere |
| Inclusion chips | Create shared component | Cards, detail, comparison |
| Verified badge | Create shared component | Cards, detail, operator profile |
| Price display | Create shared component | Cards, detail, comparison |

### Component rules

- Every interactive component must have a `data-testid`.
- Every component must support RTL layout (use logical CSS properties).
- Loading states use skeleton placeholders, not spinners.
- Error states show message + retry button.
- Empty states show helpful message + primary action.

---

## 5. Page-level UX

### Landing (`/`)

- Hero: two prominent CTAs (Hajj, Umrah). No clutter.
- Trust bar below hero: "X verified operators", "Y packages compared", "ATOL protected".
- No carousel. Static content that loads instantly.

### Search form (`/umrah`, `/hajj`)

- Progressive disclosure: start with type + dates, expand to budget/preferences.
- Quick picks: "Ramadan 2026", "School holidays", "Flexible dates" as tap targets.
- Form submits as GET request (works without JS). Query params in URL for shareability.
- CTA: "Find packages" (not "Search" — too generic).

### Search results (`/search/packages`)

- Results count: "Found N packages matching your criteria".
- Sort options: Price (low-high), Price (high-low), Rating, Distance to Haram.
- Filters: Budget range, hotel stars, distance, inclusions, operator verified only.
- Shortlist count in header. Compare(n) button enables at 2+.
- Empty state: "No packages match your filters. Try adjusting your budget or dates."
- Infinite scroll or "Load more" (not pagination — pilgrims browse all options).

### Package detail (`/packages/[slug]`)

- Breadcrumb: Home > Umrah packages > [Package title].
- Structured layout: Trip overview, Hotel details, Inclusions, Operator info, Price + CTA.
- Sticky CTA bar on mobile: price + "Express interest" button.
- Operator section: company name, verified badge, ATOL, contact, "View all packages by this operator".
- Disclaimer: "Prices and availability are indicative. Final confirmation is provided by the travel operator."

### Comparison modal

- Opens from search results. Shows 2-3 selected packages side by side.
- Sticky column headers with operator names.
- Clear "Remove" action per column.
- CTA at bottom: "Express interest" for the selected package.

---

## 6. Trust signals (critical for conversion)

Users are spending £1,000-£5,000+ on pilgrimage. Trust is non-negotiable.

| Signal | Where to show | Implementation |
|--------|--------------|----------------|
| **Verified operator badge** | Card, detail, comparison | Green checkmark + "Verified" text |
| **ATOL number** | Card (subtle), detail (prominent) | "ATOL protected: 12345" |
| **ABTA membership** | Detail page | "ABTA member: Y1234" |
| **Years in business** | Detail page, operator profile | "Serving pilgrims since 2010" |
| **Package count** | Operator profile | "15 active packages" |
| **Response time** | Future: operator profile | "Usually responds within 2 hours" |
| **Price transparency** | Everywhere | "From" vs "Exact" clearly labelled |
| **Inclusion clarity** | Cards + detail | Explicit included/not-included for every item |

---

## 7. Mobile-specific rules

| Rule | Specification |
|------|--------------|
| Min tap target | 44x44px for all interactive elements |
| No horizontal scroll | `overflow-x: hidden` on body; cards stack vertically |
| Viewport support | 320px minimum width |
| Compare modal | Max-height 90vh, body scrollable, close always visible |
| Font size | Min 14px for body text, 12px for captions |
| Touch-friendly filters | Bottom sheet pattern, not sidebar |
| Sticky elements | Search header (filter/sort/compare) sticks on scroll |

---

## 8. Colour semantics

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0B0B0B` | Page background |
| `--text` | `#FFFFFF` | Primary text |
| `--textMuted` | `rgba(255,255,255,0.64)` | Secondary text, labels |
| `--yellow` | `#FFD31D` | Primary actions, prices, accents |
| `--surfaceDark` | `#111111` | Card backgrounds, panels |
| `--success` | `#22C55E` | Verified badge, included items |
| `--danger` | `#EF4444` | Delete, errors, not-included items |
| `--border` | `rgba(255,255,255,0.1)` | Card borders, dividers |

---

## 9. When AI edits components

Before changing any UI component, the AI must:

1. Check this file for the relevant guideline.
2. Ensure the change follows mobile-first design (320px → desktop).
3. Use shared components from the component library (section 4).
4. Add `data-testid` for any new interactive element.
5. Test at 320px and 1280px width.
6. Update this file if introducing a new pattern.
