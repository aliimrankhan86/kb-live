# SEO Strategy

Search engine optimisation plan for KaabaTrip. Follow these rules on every page. When adding a new route, update this file and the sitemap.

---

## 1. Target keywords & intent

KaabaTrip targets high-intent pilgrimage travellers searching for packages. Keywords are grouped by funnel stage.

### Top-of-funnel (awareness)

| Keyword cluster          | Example queries                                            | Target page                   |
| ------------------------ | ---------------------------------------------------------- | ----------------------------- |
| Umrah packages           | "umrah packages 2026", "cheap umrah packages from UK"      | `/umrah`                      |
| Hajj packages            | "hajj packages 2026 UK", "5 star hajj packages"            | `/hajj`                       |
| Ramadan Umrah            | "ramadan umrah 2026", "umrah during ramadan"               | `/umrah/ramadan`              |
| Makkah hotels near Haram | "hotels near haram makkah", "walking distance haram hotel" | `/search/packages` (filtered) |

### Mid-funnel (comparison)

| Keyword cluster        | Example queries                                 | Target page         |
| ---------------------- | ----------------------------------------------- | ------------------- |
| Compare Umrah packages | "compare umrah packages UK", "best umrah deals" | `/search/packages`  |
| Umrah operator reviews | "[operator name] umrah reviews"                 | `/operators/[slug]` |
| Umrah package details  | "[operator] ramadan umrah package 2026"         | `/packages/[slug]`  |

### Bottom-funnel (action)

| Keyword cluster   | Example queries                              | Target page                         |
| ----------------- | -------------------------------------------- | ----------------------------------- |
| Book Umrah        | "book umrah package", "request umrah quote"  | `/quote`                            |
| Umrah from [city] | "umrah from london", "umrah from manchester" | `/search/packages?departure=[city]` |

---

## 1.1 AEO, GEO, entity SEO & reputation SEO

Public pages must work for classic search crawlers, answer engines, and generative search systems.

### AEO / conversation SEO

- Add concise, extractable answer blocks for common traveller questions about comparison, operator checks, pricing, inclusions, and the pay-operator-direct flow.
- Back answer blocks with `FAQPage` JSON-LD only when the answer is visible on the page or directly represented by platform policy.
- Use plain UK travel language. Avoid unsupported claims such as "guaranteed", "best", "cheapest", "price match", or fabricated review/ranking signals.

### GEO / AI citation readiness

- Each public page should have a clear page entity: KaabaTrip, package, operator, city corridor, or search result list.
- Keep facts source-backed from package/operator fields: price, nights, hotels, ATOL/ABTA details, serving regions, and departure airports.
- Prefer specific comparison facts over generic marketing copy, because AI summaries need short, attributable statements.

### Entity SEO

- Homepage: `Organization`, `WebSite`, `WebPage`, and relevant FAQ schema.
- `/umrah`: `WebPage` and FAQ schema for UK Umrah package comparison.
- `/search/packages`: `WebPage`, `ItemList`, and FAQ schema for result comparison.
- `/packages/[slug]`: `Product`, `Offer`, `BreadcrumbList`, and package FAQ schema.
- `/operators/[slug]`: `TravelAgency`, `BreadcrumbList`, and operator FAQ schema.
- Use `@id` values for durable graph identity where helpers provide them.

### Reputation SEO

- Show trust signals only when stored in operator data: verification status, ATOL number, ABTA membership, years in business, office/contact details.
- Show missing protection fields honestly instead of hiding them.
- Do not imply KaabaTrip collects payment. Public copy must preserve the pay-operator-direct disclosure.
- Avoid fake review, rating, backlink, guarantee, or removal claims.

---

## 2. Meta tags per route

Every route must export Next.js `Metadata` with these fields. Use the `generateMetadata` function for dynamic routes.

### Static routes

| Route               | Title                                                               | Description                                                                                                                                | Keywords                                         |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `/`                 | `KaabaTrip - Compare Hajj & Umrah Packages from UK Operators`       | `Compare Hajj and Umrah packages from UK travel operators. Review prices, hotels near Haram, inclusions, ATOL/ABTA details, and operator profiles before requesting a quote.` | hajj packages, umrah packages, compare, UK       |
| `/umrah`            | `Umrah Packages 2026 from the UK - Compare Operators \| KaabaTrip`  | `Compare Umrah packages from UK travel operators by budget, hotel rating, distance to Haram, traveller count, and included services before requesting a quote.` | umrah packages 2026, umrah from UK               |
| `/hajj`             | `Hajj Packages 2026 – Compare & Book \| KaabaTrip`                  | `Find and compare Hajj packages from ATOL-protected UK operators. 5-star hotels, direct flights, all-inclusive options.`                   | hajj packages 2026, hajj from UK                 |
| `/partner`          | `Partner with KaabaTrip — List Your Packages`                       | `Join KaabaTrip as a verified operator. Reach thousands of UK Muslims planning Umrah and Hajj. No upfront fees, transparent commission.`   | umrah operator, list umrah packages, partner     |
| `/umrah/ramadan`    | `Ramadan Umrah 2026 – Special Packages \| KaabaTrip`                | `Ramadan Umrah packages from UK operators. Hotels near Haram, flights included, group and family options.`                                 | ramadan umrah 2026, umrah ramadan packages       |
| `/packages`         | `All Pilgrimage Packages – Browse & Compare \| KaabaTrip`           | `Browse all Hajj and Umrah packages. Filter, shortlist, and compare side by side.`                                                         | pilgrimage packages, hajj umrah compare          |
| `/search/packages`  | Dynamic: `{N} {type} Packages - Compare UK Operators \| KaabaTrip`  | Dynamic: `Compare {N} packages by price, hotels, distance to Haram, inclusions, and operator trust signals.`                               | (use query params)                               |
| `/umrah/london`     | `Umrah Packages from London 2026 – Compare & Book \| KaabaTrip`     | `Browse and compare Umrah packages departing from London. Verified UK operators, hotels near Haram, flights included.`                     | umrah from london, umrah packages london         |
| `/umrah/birmingham` | `Umrah Packages from Birmingham 2026 – Compare & Book \| KaabaTrip` | `Browse and compare Umrah packages departing from Birmingham. Verified UK operators, hotels near Haram, flights included.`                 | umrah from birmingham, umrah packages birmingham |
| `/umrah/manchester` | `Umrah Packages from Manchester 2026 – Compare & Book \| KaabaTrip` | `Browse and compare Umrah packages departing from Manchester. Verified UK operators, hotels near Haram, flights included.`                 | umrah from manchester, umrah packages manchester |

### Dynamic routes

| Route               | Title template                                   | Description template                                                                                      |
| ------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `/packages/[slug]`  | `{title} – {type} Package \| KaabaTrip`          | `{title} by {operatorName}. {nights} nights, {stars} star hotels, {price} per person. Compare inclusions and request a quote.` |
| `/operators/[slug]` | `{companyName} – {Verified/Listed} Umrah & Hajj Operator \| KaabaTrip` | `View {companyName}'s public operator profile, published packages, departure airports, contact details, and ATOL/ABTA details where listed.` |

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
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://kaabatrip.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Umrah",
      "item": "https://kaabatrip.com/umrah"
    },
    { "@type": "ListItem", "position": 3, "name": "{packageTitle}" }
  ]
}
```

### Implementation

- Use `lib/seo/json-ld.ts` helpers: `packageJsonLd(pkg, operatorName)`, `operatorJsonLd(operator)`, `searchResultsJsonLd(results)`, `breadcrumbJsonLd(items[])`, `faqPageJsonLd(items[])`, `webPageJsonLd(page)`, and `graphJsonLd(nodes[])`.
- Render as `<script type="application/ld+json">` in the page markup or via Next.js metadata-managed head. Avoid manually adding root-layout JSON-LD inside `<head>`; browser extensions can inject head scripts before hydration and cause attribute mismatch warnings.
- Never include user-generated content without sanitisation.

---

## 4. URL structure

Clean, meaningful URLs improve SEO and shareability.

| Pattern             | Example          | Notes                                                    |
| ------------------- | ---------------- | -------------------------------------------------------- |
| `/umrah`            | Landing page     | Static                                                   |
| `/hajj`             | Landing page     | Static                                                   |
| `/umrah/ramadan`    | Season landing   | Static                                                   |
| `/packages`         | Browse all       | Static                                                   |
| `/packages/{slug}`  | Package detail   | Slug from: `{operator-slug}-{type}-{season}-{id-suffix}` |
| `/operators/{slug}` | Operator profile | Slug from `operatorProfile.slug`                         |
| `/search/packages`  | Search results   | Query params: `?type=umrah&budget=1000-2000&stars=5`     |
| `/quote`            | Request form     | No-index (robots.txt)                                    |

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

| Page type        | `changeFrequency` | `priority` |
| ---------------- | ----------------- | ---------- |
| Landing pages    | `weekly`          | `1.0`      |
| Package detail   | `daily`           | `0.8`      |
| Operator profile | `weekly`          | `0.7`      |
| Browse/search    | `daily`           | `0.6`      |

---

## 6. Technical SEO checklist

| Item                         | Status     | Notes                                                  |
| ---------------------------- | ---------- | ------------------------------------------------------ |
| Canonical URLs on every page | ✅ Done    | Via `alternates.canonical` in metadata                 |
| Open Graph tags              | ✅ Done    | Via `openGraph` in metadata                            |
| Twitter card tags            | ✅ Done    | Via `twitter` in metadata                              |
| robots.txt                   | ✅ Done    | Disallow `/quote`, `/requests`, `/operator`, `/kanban` |
| sitemap.xml                  | ⚠️ Partial | Needs dynamic package + operator pages                 |
| JSON-LD structured data      | ✅ Done    | Shared Product, TravelAgency, ItemList, BreadcrumbList, Organization, WebSite, WebPage, and FAQPage helpers |
| Image alt text               | ✅ Done    | All images have descriptive alt                        |
| Semantic HTML                | ✅ Done    | Proper heading hierarchy, landmarks                    |
| Page speed (LCP < 2.5s)      | ⚠️ Monitor | Server Components help; monitor with Lighthouse        |
| Mobile friendly              | ✅ Done    | Responsive down to 320px                               |
| `hreflang` for languages     | ❌ Todo    | Required when i18n is implemented (en, fr, ar)         |
| Avoid duplicate content      | ⚠️ Monitor | Canonicals prevent issues from search params           |

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
