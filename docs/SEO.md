# SEO Strategy

Search engine optimisation plan for KaabaTrip. Follow these rules on every page. When adding a new route, update this file and the sitemap.

---

## 1. Target keywords & intent

KaabaTrip targets high-intent pilgrimage travellers searching for packages. Keywords are grouped by funnel stage.

### Top-of-funnel (awareness)

| Keyword cluster | Example queries | Target page |
|----------------|----------------|-------------|
| Umrah packages | "umrah packages 2026", "cheap umrah packages from UK" | `/umrah` |
| Hajj packages | "hajj packages 2026 UK", "5 star hajj packages" | `/hajj` |
| Ramadan Umrah | "ramadan umrah 2026", "umrah during ramadan" | `/umrah/ramadan` |
| Makkah hotels near Haram | "hotels near haram makkah", "walking distance haram hotel" | `/search/packages` (filtered) |

### Mid-funnel (comparison)

| Keyword cluster | Example queries | Target page |
|----------------|----------------|-------------|
| Compare Umrah packages | "compare umrah packages UK", "best umrah deals" | `/search/packages` |
| Umrah operator reviews | "[operator name] umrah reviews" | `/operators/[slug]` |
| Umrah package details | "[operator] ramadan umrah package 2026" | `/packages/[slug]` |

### Bottom-funnel (action)

| Keyword cluster | Example queries | Target page |
|----------------|----------------|-------------|
| Book Umrah | "book umrah package", "request umrah quote" | `/quote` |
| Umrah from [city] | "umrah from london", "umrah from manchester" | `/search/packages?departure=[city]` |

---

## 2. Meta tags per route

Every route must export Next.js `Metadata` with these fields. Use the `generateMetadata` function for dynamic routes.

### Static routes

| Route | Title | Description | Keywords |
|-------|-------|-------------|----------|
| `/` | `KaabaTrip – Compare Hajj & Umrah Packages` | `Compare verified Hajj and Umrah packages from trusted UK travel operators. Find the best prices, hotels near Haram, and inclusive deals.` | hajj packages, umrah packages, compare, UK |
| `/umrah` | `Umrah Packages 2026 – Compare & Book \| KaabaTrip` | `Browse and compare Umrah packages from verified UK operators. Filter by budget, hotel rating, and distance to Haram.` | umrah packages 2026, umrah from UK |
| `/hajj` | `Hajj Packages 2026 – Compare & Book \| KaabaTrip` | `Find and compare Hajj packages from ATOL-protected UK operators. 5-star hotels, direct flights, all-inclusive options.` | hajj packages 2026, hajj from UK |
| `/umrah/ramadan` | `Ramadan Umrah 2026 – Special Packages \| KaabaTrip` | `Ramadan Umrah packages from UK operators. Hotels near Haram, flights included, group and family options.` | ramadan umrah 2026, umrah ramadan packages |
| `/packages` | `All Pilgrimage Packages – Browse & Compare \| KaabaTrip` | `Browse all Hajj and Umrah packages. Filter, shortlist, and compare side by side.` | pilgrimage packages, hajj umrah compare |
| `/search/packages` | `Search Results – Umrah & Hajj Packages \| KaabaTrip` | Dynamic: `Found N packages matching your criteria` | (use query params) |

### Dynamic routes

| Route | Title template | Description template |
|-------|---------------|---------------------|
| `/packages/[slug]` | `{title} – {type} Package \| KaabaTrip` | `{title} by {operatorName}. {nights} nights, {stars}★ hotels, {distance} from Haram. {price} per person.` |
| `/operators/[slug]` | `{companyName} – Verified Operator \| KaabaTrip` | `Browse packages from {companyName}. {verificationStatus} operator with {packageCount} active packages.` |

---

## 3. Structured data (JSON-LD)

Structured data helps Google show rich snippets. Add JSON-LD to each page type.

### Package detail page – Product schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{package.title}",
  "description": "{pilgrimageType} package – {totalNights} nights ({nightsMakkah} Makkah, {nightsMadinah} Madinah). Hotels: {hotelMakkahStars}★ Makkah, {hotelMadinahStars}★ Madinah.",
  "brand": {
    "@type": "Organization",
    "name": "{operatorName}"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "{currency}",
    "price": "{pricePerPerson}",
    "availability": "https://schema.org/InStock",
    "validFrom": "{dateWindow.start}",
    "validThrough": "{dateWindow.end}"
  },
  "category": "Travel Package"
}
```

### Operator profile page – Organization schema

```json
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "{companyName}",
  "url": "https://kaabatrip.com/operators/{slug}",
  "description": "Verified {pilgrimageType} travel operator",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "{servingRegion}"
  }
}
```

### Search results page – ItemList schema

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Umrah Packages",
  "numberOfItems": "{resultCount}",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://kaabatrip.com/packages/{slug}"
    }
  ]
}
```

### Breadcrumb schema (all pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kaabatrip.com/" },
    { "@type": "ListItem", "position": 2, "name": "Umrah", "item": "https://kaabatrip.com/umrah" },
    { "@type": "ListItem", "position": 3, "name": "{packageTitle}" }
  ]
}
```

### Implementation

- Create a `lib/seo/json-ld.ts` utility with functions: `packageJsonLd(pkg, operator)`, `operatorJsonLd(operator)`, `searchResultsJsonLd(results)`, `breadcrumbJsonLd(items[])`.
- Render as `<script type="application/ld+json">` in each page's `<head>` (use Next.js metadata API or direct injection).
- Never include user-generated content without sanitisation.

---

## 4. URL structure

Clean, meaningful URLs improve SEO and shareability.

| Pattern | Example | Notes |
|---------|---------|-------|
| `/umrah` | Landing page | Static |
| `/hajj` | Landing page | Static |
| `/umrah/ramadan` | Season landing | Static |
| `/packages` | Browse all | Static |
| `/packages/{slug}` | Package detail | Slug from: `{operator-slug}-{type}-{season}-{id-suffix}` |
| `/operators/{slug}` | Operator profile | Slug from `operatorProfile.slug` |
| `/search/packages` | Search results | Query params: `?type=umrah&budget=1000-2000&stars=5` |
| `/quote` | Request form | No-index (robots.txt) |

### Slug generation rules

- Lowercase, hyphen-separated.
- Include operator name + package type for uniqueness and SEO.
- Example: `al-haram-travel-umrah-ramadan-2026-abc123`.
- Keep under 80 characters.

---

## 5. Sitemap strategy

The sitemap at `app/sitemap.ts` must include:

1. **All static pages** — `/`, `/umrah`, `/hajj`, `/umrah/ramadan`, `/packages`.
2. **All published package pages** — `/packages/[slug]` for every `status: 'published'` package.
3. **All verified operator pages** — `/operators/[slug]` for every `verificationStatus: 'verified'` operator.
4. **Search page** — `/search/packages` (but consider adding filtered variants like `/search/packages?type=umrah` if traffic warrants it).

### Update frequency

| Page type | `changeFrequency` | `priority` |
|-----------|-------------------|-----------|
| Landing pages | `weekly` | `1.0` |
| Package detail | `daily` | `0.8` |
| Operator profile | `weekly` | `0.7` |
| Browse/search | `daily` | `0.6` |

---

## 6. Technical SEO checklist

| Item | Status | Notes |
|------|--------|-------|
| Canonical URLs on every page | ✅ Done | Via `alternates.canonical` in metadata |
| Open Graph tags | ✅ Done | Via `openGraph` in metadata |
| Twitter card tags | ✅ Done | Via `twitter` in metadata |
| robots.txt | ✅ Done | Disallow `/quote`, `/requests`, `/operator`, `/kanban` |
| sitemap.xml | ⚠️ Partial | Needs dynamic package + operator pages |
| JSON-LD structured data | ❌ Todo | Product, Organization, BreadcrumbList |
| Image alt text | ✅ Done | All images have descriptive alt |
| Semantic HTML | ✅ Done | Proper heading hierarchy, landmarks |
| Page speed (LCP < 2.5s) | ⚠️ Monitor | Server Components help; monitor with Lighthouse |
| Mobile friendly | ✅ Done | Responsive down to 320px |
| `hreflang` for languages | ❌ Todo | Required when i18n is implemented (en, fr, ar) |
| Avoid duplicate content | ⚠️ Monitor | Canonicals prevent issues from search params |

---

## 7. When AI changes routes or pages

Before making changes, the AI must:

1. Check this file for the SEO requirements of the affected page.
2. Ensure the page exports appropriate `Metadata` (static) or `generateMetadata` (dynamic).
3. Add JSON-LD if the page type requires it (see section 3).
4. Update `app/sitemap.ts` if a new public route is added.
5. Update `app/robots.ts` if a new private/internal route is added.
6. Add breadcrumbs for any page deeper than 1 level.
7. Update this file if introducing a new route pattern.
