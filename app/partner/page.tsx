import { Metadata } from 'next'
import Link from 'next/link'
import { JsonLdScript, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { VERIFICATION_STATEMENT } from '@/lib/content-rules'

export const metadata: Metadata = {
  title: 'List Your Umrah & Hajj Packages on PilgrimCompare',
  description: 'List your Umrah packages on PilgrimCompare so UK pilgrims can compare them and send you enquiries. Free to list during the 90-day trial.',
  alternates: {
    canonical: '/partner',
  },
  openGraph: {
    title: 'List Your Umrah & Hajj Packages | PilgrimCompare',
    description: 'Reach UK travellers planning Umrah and Hajj. Verified operators only. No upfront fees.',
    url: 'https://pilgrimcompare.co.uk/partner',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Umrah & Hajj Packages | PilgrimCompare',
    description: 'Reach UK travellers planning Umrah and Hajj. Verified operators only. No upfront fees.',
  },
}

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/partner',
    name: 'List Your Umrah & Hajj Packages on PilgrimCompare',
    description:
      'Join PilgrimCompare as a verified operator. Reach UK Muslims planning Umrah and Hajj. No upfront fees.',
  }),
])

export default function PartnerLandingPage() {
  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <main className="min-h-screen">

        {/* ── SPLIT HERO — both paths above the fold ── */}
        <section className="border-b border-[var(--border)] bg-[var(--surfaceDark)] px-4 py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-5 md:gap-12">

            {/* Left — new operators (primary path) */}
            <div className="md:col-span-3">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
                For Travel Operators
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[var(--text)] md:text-4xl lg:text-5xl">
                List Your Umrah Packages for UK Pilgrims to Compare
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-[var(--textMuted)]">
                PilgrimCompare is a UK comparison and enquiry service for Umrah travel packages. Pilgrims compare packages side by side and send enquiries directly to you.
                Free to list during the 90-day trial. We check each operator&apos;s ATOL number before listing.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="mailto:operators@pilgrimcompare.co.uk?subject=List%20my%20packages%20on%20PilgrimCompare"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--yellow)] px-8 py-3 text-base font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                  data-testid="partner-cta-contact"
                >
                  Get in touch to list your packages
                </a>
              </div>
            </div>

            {/* Right — existing operators (secondary path, same visual weight as hero) */}
            <div className="md:col-span-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 md:p-7">
                {/* Label */}
                <span className="inline-block rounded-full bg-[var(--yellow)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
                  Already listed?
                </span>

                <h2 className="mt-4 text-xl font-semibold text-[var(--text)]">
                  Sign in to your operator dashboard
                </h2>
                <p className="mt-2 text-sm text-[var(--textMuted)]">
                  Manage packages, view leads, track enquiries, and update your ATOL/ABTA details.
                </p>

                {/* Dashboard quick-access list */}
                <ul className="mt-5 space-y-2.5">
                  {[
                    'Respond to traveller enquiries',
                    'Add or update your packages',
                    'View analytics &amp; conversions',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--textMuted)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-[var(--yellow)]" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login?redirect=/operator/dashboard"
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--bg)] transition-all hover:brightness-90"
                  data-testid="partner-signin-main"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign in to Dashboard
                </Link>

                <p className="mt-3 text-center text-xs text-[var(--textMuted)]">
                  Account issues?{' '}
                  <a
                    href="mailto:operators@pilgrimcompare.co.uk"
                    className="underline underline-offset-2 hover:text-[var(--yellow)]"
                  >
                    Contact operator support
                  </a>
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Value Props */}
        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow)]/10 text-[var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">UK-Focused Audience</h3>
              <p className="mt-2 text-sm text-[var(--textMuted)]">
                Pilgrims compare packages side by side, then send an enquiry about the one they want.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow)]/10 text-[var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Verified Operator Badge</h3>
              <p className="mt-2 text-sm text-[var(--textMuted)]">
                Verified operators show a Verified badge that links to what we check. Your ATOL number is shown on your profile and packages.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow)]/10 text-[var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Free During the Trial</h3>
              <p className="mt-2 text-sm text-[var(--textMuted)]">
                Listing is free during the 90-day trial. Pricing after the trial is explained before you agree to anything.
              </p>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-[var(--yellow)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
                Requirements to join
              </span>
            </div>
            <h2 className="text-center text-2xl font-semibold text-[var(--text)]">What We Need From You</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--textMuted)]">
              PilgrimCompare is a verified-only platform. Every operator must meet these requirements before going live.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'ATOL Number',
                  desc: 'We check your ATOL number against the CAA register before listing, and show it on your profile and packages.',
                },
                {
                  title: 'UK-Based Business Registration',
                  desc: 'We check your company status at Companies House and your UK trading address before listing.',
                },
                {
                  title: 'Accurate Package Pricing',
                  desc: 'Prices must reflect real, bookable packages, not estimates. Misleading listings are removed.',
                },
                {
                  title: 'Responsive to Enquiries',
                  desc: "Enquiries come to you with the traveller's contact details. You reply to them directly.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-[var(--bg)]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">{item.title}</h4>
                    <p className="mt-1 text-sm text-[var(--textMuted)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-[var(--yellow)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
                New to PilgrimCompare
              </span>
            </div>
            <h2 className="text-center text-2xl font-semibold text-[var(--text)]">How to Get Listed</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { step: '1', title: 'Get in touch', desc: 'Send us your company details, ATOL/ABTA numbers, and package offerings. Our team builds your verified profile for you.' },
                { step: '2', title: 'Get Verified', desc: 'Our team reviews your details within 1 to 2 business days, using the checks listed above.' },
                { step: '3', title: 'Start Receiving Enquiries', desc: 'Once approved, your packages appear in search results and travellers can send enquiries directly to you.' },
              ].map((item) => (
                <div key={item.step} className="relative rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
                  <span className="absolute -top-3 left-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--yellow)] text-xs font-bold text-[var(--bg)]">
                    {item.step}
                  </span>
                  <h4 className="mt-2 font-semibold text-[var(--text)]">{item.title}</h4>
                  <p className="mt-2 text-sm text-[var(--textMuted)]">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a
                href="mailto:operators@pilgrimcompare.co.uk?subject=List%20my%20packages%20on%20PilgrimCompare"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--yellow)] px-10 py-3 text-base font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                data-testid="partner-cta-how-it-works"
              >
                Get in touch to list your packages
              </a>
            </div>
          </div>
        </section>

        {/* Trust / compliance */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-[var(--text)]">What We Check</h2>
            <p className="mt-4 text-[var(--textMuted)]">{VERIFICATION_STATEMENT}</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-[var(--text)]">Ready to Grow Your Business?</h2>
            <p className="mt-3 text-[var(--textMuted)]">
              Get in touch to list your packages and start receiving enquiries from UK travellers.
            </p>
            <a
              href="mailto:operators@pilgrimcompare.co.uk?subject=List%20my%20packages%20on%20PilgrimCompare"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--yellow)] px-10 py-3 text-base font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
              data-testid="partner-cta-bottom"
            >
              Get in touch to list your packages
            </a>
            <p className="mt-4 text-sm text-[var(--textMuted)]">
              Already listed?{' '}
              <Link
                href="/login?redirect=/operator/dashboard"
                className="font-medium text-[var(--yellow)] underline-offset-2 hover:underline"
                data-testid="partner-signin-footer"
              >
                Sign in to your dashboard
              </Link>
            </p>
          </div>
        </section>

      </main>
    </>
  )
}
