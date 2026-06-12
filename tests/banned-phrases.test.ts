/**
 * Banned-phrase CI guard.
 *
 * Scans all metadata string constants defined in this project against the
 * BANNED_METADATA_PHRASES list from lib/content-rules.ts.
 *
 * Fails if any banned phrase is found — blocks the merge before bad copy
 * reaches production. Add new metadata sources to METADATA_STRINGS below
 * whenever a new route is created.
 */

import { describe, it, expect } from 'vitest';
import { BANNED_METADATA_PHRASES, NEUTRAL_SORT_DISCLOSURE } from '@/lib/content-rules';

// ---------------------------------------------------------------------------
// Metadata string inventory
// Add every static title/description/OG/twitter string here when creating
// a new route. Dynamic templates (generateMetadata functions) are covered by
// their fragment literals below.
// ---------------------------------------------------------------------------

const METADATA_STRINGS: Record<string, string> = {
  // lib/seo.ts — base
  'base.title.default': 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
  'base.description': 'Compare Hajj and Umrah packages from verified UK travel operators. Review prices, hotels near Haram, inclusions, and ATOL details before requesting a quote.',
  'base.og.description': 'Compare Hajj and Umrah packages from verified UK travel operators. Review prices, hotels near Haram, inclusions, and ATOL details.',
  'base.twitter.description': 'Compare Hajj and Umrah packages from verified UK travel operators. Review prices, hotels near Haram, inclusions, and ATOL details.',

  // app/page.tsx
  'home.title': 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
  'home.description': 'Compare Hajj and Umrah packages from UK travel operators. Review prices, hotels near Haram, inclusions, ATOL/ABTA details, and operator profiles before requesting a quote.',
  'home.og.title': 'PilgrimCompare - Compare Hajj & Umrah Packages',
  'home.og.description': 'Search and compare pilgrimage packages with transparent prices, hotel details, inclusions, and UK operator trust signals.',
  'home.twitter.description': 'Compare UK Hajj and Umrah packages by price, hotels, inclusions, and operator trust signals.',

  // app/umrah/page.tsx
  'umrah.title': 'Umrah Packages 2026 from the UK - Compare Operators',

  // app/hajj/page.tsx
  'hajj.title': 'Hajj Packages 2027 from the UK – Coming Soon',

  // app/packages/page.tsx
  'packages.title': 'Browse Hajj & Umrah Packages | PilgrimCompare',
  'packages.description': 'Browse and compare published Umrah and Hajj packages from verified UK operators. Filter by budget, hotel rating, departure city, and inclusions.',

  // app/search/packages/page.tsx — template fragments
  'search.og.title.fragment': 'Package Search Results | PilgrimCompare',
  'search.og.description.fragment': 'packages from UK operators with transparent package details.',

  // app/umrah/london/page.tsx
  'london.title': 'Umrah Packages from London 2026 – Compare UK Operators | PilgrimCompare',
  'london.description': 'Browse and compare Umrah packages departing from London Heathrow and Gatwick. Verified UK operators, hotels near Haram, and ATOL details displayed.',

  // app/umrah/birmingham/page.tsx
  'birmingham.title': 'Umrah Packages from Birmingham 2026 – Compare UK Operators | PilgrimCompare',
  'birmingham.description': 'Browse and compare Umrah packages departing from Birmingham Airport (BHX). Verified UK operators, hotels near Haram, and ATOL details displayed.',

  // app/umrah/manchester/page.tsx
  'manchester.title': 'Umrah Packages from Manchester 2026 – Compare UK Operators | PilgrimCompare',
  'manchester.description': 'Browse and compare Umrah packages departing from Manchester Airport (MAN). Verified UK operators, hotels near Haram, and ATOL details displayed.',

  // app/umrah/ramadan/page.tsx
  'ramadan.title': 'Ramadan Umrah Packages 2027 from the UK',

  // app/umrah/cost/page.tsx
  'cost.title': 'How Much Does an Umrah Package Cost from the UK? 2026–2027 Guide',

  // app/how-it-works/page.tsx
  'how-it-works.title': 'How PilgrimCompare Works | Compare Umrah Packages from Verified UK Operators',
  'how-it-works.description': 'Compare Umrah packages side by side, send an enquiry to your chosen operator, and pay them directly. PilgrimCompare is a comparison and enquiry service — not a travel agent.',

  // app/terms/page.tsx
  'terms.title': 'Terms of Use | PilgrimCompare',
  'terms.description': 'Terms of Use for PilgrimCompare — a UK comparison and enquiry service for Umrah travel packages from verified operators.',

  // app/privacy/page.tsx
  'privacy.title': 'Privacy Policy | PilgrimCompare',
  'privacy.description': 'How PilgrimCompare collects, uses, and protects your personal data. UK GDPR compliant.',

  // app/partner/page.tsx
  'partner.title': 'List Your Umrah & Hajj Packages on PilgrimCompare',
  'partner.description': 'Join PilgrimCompare as a verified operator. Reach UK Muslims planning Umrah and Hajj. No upfront fees. ATOL and ABTA operators welcome.',
  'partner.og.title': 'List Your Umrah & Hajj Packages | PilgrimCompare',
  'partner.og.description': 'Reach UK travellers planning Umrah and Hajj. Verified operators only. No upfront fees.',

  // app/how-we-rank/page.tsx
  'how-we-rank.title': 'How We Rank Packages | PilgrimCompare',
  'how-we-rank.description': 'PilgrimCompare ranks packages by data completeness, price recency, and operator response rate. No operator pays for ranking position in our default results.',
  'how-we-rank.og.title': 'How We Rank Packages | PilgrimCompare',
  'how-we-rank.og.description': 'Transparent ranking criteria for Umrah and Hajj packages on PilgrimCompare. Default sort is neutral — no paid placement in organic results.',
  'how-we-rank.twitter.title': 'How We Rank Packages | PilgrimCompare',
  'how-we-rank.twitter.description': 'Transparent ranking: completeness, recency, response rate. No operator pays for position in default results.',

  // app/login/page.tsx
  'login.title': 'Sign In | PilgrimCompare',
  'login.description': 'Sign in to your PilgrimCompare traveller or operator account.',

  // app/signup/page.tsx
  'signup.title': 'Create Account | PilgrimCompare',
  'signup.description': 'Sign up for a PilgrimCompare traveller or operator account.',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BANNED_METADATA_PHRASES — lib/content-rules integrity', () => {
  it('banned phrase list is non-empty', () => {
    expect(BANNED_METADATA_PHRASES.length).toBeGreaterThan(0)
  })

  it('NEUTRAL_SORT_DISCLOSURE is non-empty', () => {
    expect(NEUTRAL_SORT_DISCLOSURE.length).toBeGreaterThan(0)
  })

  it('NEUTRAL_SORT_DISCLOSURE does not itself contain banned phrases', () => {
    const lower = NEUTRAL_SORT_DISCLOSURE.toLowerCase()
    for (const phrase of BANNED_METADATA_PHRASES) {
      expect(lower, `NEUTRAL_SORT_DISCLOSURE contains banned phrase: "${phrase}"`).not.toContain(phrase)
    }
  })
})

describe('Star character guard — metadata must not use decorative rating stars', () => {
  const STAR_CHARS = ['★', '☆', '⭐', '🌟']

  for (const [key, value] of Object.entries(METADATA_STRINGS)) {
    for (const star of STAR_CHARS) {
      it(`"${key}" must not contain star character: "${star}"`, () => {
        expect(
          value,
          `Star character "${star}" found in metadata key "${key}":\n  "${value}"`
        ).not.toContain(star)
      })
    }
  }
})

describe('Metadata banned-phrase scan', () => {
  for (const [key, value] of Object.entries(METADATA_STRINGS)) {
    for (const phrase of BANNED_METADATA_PHRASES) {
      it(`"${key}" must not contain banned phrase: "${phrase}"`, () => {
        expect(
          value.toLowerCase(),
          `Banned phrase "${phrase}" found in metadata key "${key}":\n  "${value}"`
        ).not.toContain(phrase)
      })
    }
  }
})
