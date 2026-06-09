import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'List Your Umrah & Hajj Packages on KaabaTrip',
  description: 'Join KaabaTrip as a verified operator. Reach thousands of UK Muslims planning Umrah and Hajj. No upfront fees. ATOL and ABTA operators welcome.',
  alternates: {
    canonical: '/partner',
  },
  openGraph: {
    title: 'List Your Umrah & Hajj Packages | KaabaTrip Partners',
    description: 'Reach UK travellers planning Umrah and Hajj. Verified operators only. No upfront fees.',
    url: 'https://kaabatrip.com/partner',
    siteName: 'KaabaTrip',
    type: 'website',
    locale: 'en_GB',
  },
}

export default function PartnerLandingPage() {
  return (
    <>
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative border-b border-[var(--border)] bg-[var(--surfaceDark)] px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
              For Travel Operators
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text)] md:text-5xl">
              Reach Thousands of UK Muslims Planning Umrah & Hajj
            </h1>
            <p className="mt-5 text-lg text-[var(--textMuted)]">
              List your verified packages on KaabaTrip — the UK{"'"}s trusted Umrah & Hajj comparison platform.
              No upfront fees. Transparent commission. UK-focused audience.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/operator/onboarding"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--yellow)] px-8 py-3 text-base font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                data-testid="partner-cta-apply"
              >
                Apply as a Partner
              </Link>
              <Link
                href="/operators/al-hidayah-travel"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--border)] px-8 py-3 text-base font-medium text-[var(--text)] transition-colors hover:border-[var(--yellow)] hover:text-[var(--yellow)]"
                data-testid="partner-cta-preview"
              >
                See Example Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow)]/10 text-[var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">UK-Focused Audience</h3>
              <p className="mt-2 text-sm text-[var(--textMuted)]">
                Target British Muslims actively searching for ATOL-protected Umrah and Hajj packages.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow)]/10 text-[var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Verified Operator Badge</h3>
              <p className="mt-2 text-sm text-[var(--textMuted)]">
                Stand out with a verified badge. ATOL and ABTA numbers displayed prominently to build traveller trust.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow)]/10 text-[var(--yellow)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">No Upfront Fees</h3>
              <p className="mt-2 text-sm text-[var(--textMuted)]">
                Simple commission on confirmed bookings. No listing fees, no hidden charges.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-semibold text-[var(--text)]">How It Works</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { step: '1', title: 'Apply', desc: 'Complete the registration form with your company details, ATOL/ABTA numbers, and package offerings.' },
                { step: '2', title: 'Get Verified', desc: 'Our team reviews your application within 1–2 business days. We verify your financial protection status.' },
                { step: '3', title: 'Start Receiving Bookings', desc: 'Once approved, your packages appear in search results and travellers can request quotes directly.' },
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
          </div>
        </section>

        {/* Trust */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-[var(--text)]">Built for UK Compliance</h2>
            <p className="mt-4 text-[var(--textMuted)]">
              KaabaTrip requires all operators to display ATOL/ABTA status prominently.
              Travellers see verified protection badges — or a clear warning if protection is not listed.
              This transparency drives higher-quality enquiries and builds long-term trust.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-[var(--border)] px-4 py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-[var(--text)]">Ready to Grow Your Business?</h2>
            <p className="mt-3 text-[var(--textMuted)]">
              Join operators already listing on KaabaTrip and start receiving enquiries from UK travellers today.
            </p>
            <Link
              href="/operator/onboarding"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--yellow)] px-10 py-3 text-base font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
              data-testid="partner-cta-bottom"
            >
              Apply as a Partner
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}