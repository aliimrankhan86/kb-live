import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'How We Rank Packages | PilgrimCompare',
  description:
    'PilgrimCompare ranks packages by data completeness, price recency, and operator response rate. No operator pays for ranking position in our default results.',
  alternates: { canonical: '/how-we-rank' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'How We Rank Packages | PilgrimCompare',
    description:
      'Transparent ranking criteria for Umrah and Hajj packages on PilgrimCompare. Default sort is neutral — no paid placement in organic results.',
    url: 'https://pilgrimcompare.co.uk/how-we-rank',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How We Rank Packages | PilgrimCompare',
    description:
      'Transparent ranking: completeness, recency, response rate. No operator pays for position in default results.',
  },
};

const LAST_UPDATED = '12 June 2026';

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/how-we-rank',
    name: 'How We Rank Packages — PilgrimCompare',
    description:
      'Transparent explanation of the neutral ranking criteria used to sort packages on PilgrimCompare. Default sort is based on data completeness, price recency, and operator response rate only.',
    dateModified: '2026-06-12',
  }),
]);

export default function HowWeRankPage() {
  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <main className="min-h-screen bg-[var(--background)]">
        <article className="mx-auto max-w-2xl px-5 py-12 md:px-6 md:py-16">

          <header className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--yellow)]">
              Transparency
            </p>
            <h1 className="text-3xl font-bold text-[var(--text)] md:text-4xl">
              How we rank packages
            </h1>
            <p className="mt-4 text-[var(--textMuted)]">
              The DMCC Act 2024 requires comparison services to disclose the
              criteria they use to order results and to label any paid placement
              clearly. This page explains exactly how PilgrimCompare ranks
              packages — in plain English.
            </p>
            <p className="mt-2 text-xs text-[var(--textMuted)]">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          {/* Default sort */}
          <section className="mb-10" aria-labelledby="default-sort-heading">
            <h2
              id="default-sort-heading"
              className="mb-4 text-xl font-semibold text-[var(--text)]"
            >
              Default sort order
            </h2>
            <p className="mb-4 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-3 text-sm font-medium text-[var(--text)]">
              Sorted by relevance and listing quality. No operator pays for ranking.
            </p>
            <p className="text-[var(--textMuted)]">
              When you first see results — before choosing a different sort —
              packages are ordered by a neutral quality score. The score has
              three inputs, described below. No commercial relationship, no
              payment, and no editorial judgement affects where a package
              appears in the default order.
            </p>
          </section>

          {/* The four criteria */}
          <section className="mb-10" aria-labelledby="criteria-heading">
            <h2
              id="criteria-heading"
              className="mb-6 text-xl font-semibold text-[var(--text)]"
            >
              The ranking criteria
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(255,211,29,0.12)] text-sm font-bold text-[var(--yellow)]">
                    1
                  </span>
                  <h3 className="font-semibold text-[var(--text)]">
                    Data completeness — 45%
                  </h3>
                </div>
                <p className="text-sm text-[var(--textMuted)]">
                  A listing that includes hotel names, the exact distance to the
                  Haram, airline information, cancellation terms, deposit details,
                  travel dates, and group type is more useful when you are
                  comparing packages side by side. We count how many of 16
                  optional fields are filled in and score the listing
                  proportionally. An operator improves their score simply by
                  providing complete information — not by paying.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(255,211,29,0.12)] text-sm font-bold text-[var(--yellow)]">
                    2
                  </span>
                  <h3 className="font-semibold text-[var(--text)]">
                    Price confirmation recency — 35%
                  </h3>
                </div>
                <p className="text-sm text-[var(--textMuted)]">
                  A package that was updated recently is more likely to have
                  accurate pricing. We use the date the operator last updated
                  their listing as a proxy for price freshness. A listing updated
                  in the last 7 days scores maximum; listings older than 90 days
                  score zero on this dimension. Operators keep their score high
                  by keeping their listings current.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(255,211,29,0.12)] text-sm font-bold text-[var(--yellow)]">
                    3
                  </span>
                  <h3 className="font-semibold text-[var(--text)]">
                    Operator response rate — 20%
                  </h3>
                </div>
                <p className="text-sm text-[var(--textMuted)]">
                  Operators who reply to enquiries quickly give travellers a
                  better experience. This dimension will use measured response
                  times once enough enquiry data exists. Until then, all
                  operators receive an equal neutral score on this input so no
                  operator is unfairly penalised or rewarded before real data
                  is available.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(255,211,29,0.12)] text-sm font-bold text-[var(--yellow)]">
                    4
                  </span>
                  <h3 className="font-semibold text-[var(--text)]">
                    Relevance to your search
                  </h3>
                </div>
                <p className="text-sm text-[var(--textMuted)]">
                  Packages you see have already been filtered to match your
                  chosen criteria (departure city, budget, hotel stars, distance
                  to Haram, and so on). Every result in the list has passed your
                  active filters — so within those results, the other three
                  criteria determine the order.
                </p>
              </div>
            </div>
          </section>

          {/* Featured slots */}
          <section className="mb-10" aria-labelledby="featured-heading">
            <h2
              id="featured-heading"
              className="mb-4 text-xl font-semibold text-[var(--text)]"
            >
              Featured listings
            </h2>
            <p className="mb-3 text-[var(--textMuted)]">
              In the future, operators will be able to pay for a{' '}
              <strong className="text-[var(--text)]">Featured</strong> placement.
              When Featured slots are active, the following rules apply without
              exception:
            </p>
            <ul className="space-y-2 text-sm text-[var(--textMuted)]">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[var(--yellow)]">✓</span>
                Featured packages appear in a clearly labelled{' '}
                <strong className="text-[var(--text)]">&ldquo;Featured&rdquo;</strong>{' '}
                section above the neutral results — the label is at the slot
                itself, not in a footnote.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[var(--yellow)]">✓</span>
                The section note reads: &ldquo;Paid placement — not ranked by our
                neutral criteria.&rdquo;
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[var(--yellow)]">✓</span>
                A maximum of 2 Featured packages per list view.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[var(--yellow)]">✓</span>
                Featured packages are excluded from the neutral results count
                shown at the top of the page.
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-[var(--yellow)]">✓</span>
                Featured status has no influence on a package&rsquo;s neutral
                ranking score — if Featured is switched off, the package ranks
                on its merits like any other.
              </li>
            </ul>
            <p className="mt-4 text-sm text-[var(--textMuted)]">
              No operator is currently featured. Featured slots are not yet
              active on this site.
            </p>
          </section>

          {/* Verification statement — verbatim from §7 of standards doc */}
          <section className="mb-10" aria-labelledby="verification-heading">
            <h2
              id="verification-heading"
              className="mb-4 text-xl font-semibold text-[var(--text)]"
            >
              How we verify operators
            </h2>
            <blockquote className="rounded-lg border-l-4 border-[var(--yellow)] bg-[var(--surfaceDark)] px-5 py-4 text-sm text-[var(--textMuted)]">
              Before any operator is listed, we check: (1) their ATOL number
              against the CAA&rsquo;s public register, (2) their company status at
              Companies House, (3) that they have a real, verifiable UK trading
              address. Verification confirms these checks at the time of listing.
              It is not a guarantee of service quality, financial protection for
              your specific booking, or future conduct.
            </blockquote>
          </section>

          {/* Footer links */}
          <footer className="border-t border-[var(--borderSubtle)] pt-8">
            <p className="mb-4 text-sm text-[var(--textMuted)]">
              Questions about our ranking or verification approach?{' '}
              <a
                href="mailto:support@pilgrimcompare.co.uk"
                className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accentHover)]"
              >
                Contact us
              </a>
            </p>
            <nav aria-label="Related pages" className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/how-it-works"
                className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accentHover)]"
              >
                How PilgrimCompare works
              </Link>
              <Link
                href="/terms"
                className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accentHover)]"
              >
                Terms of Use
              </Link>
              <Link
                href="/search/packages"
                className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accentHover)]"
              >
                Compare packages
              </Link>
            </nav>
          </footer>
        </article>
      </main>
    </>
  );
}
