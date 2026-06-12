import type { Metadata } from 'next';
import Link from 'next/link';
import { HajjInterestForm } from '@/components/hajj/HajjInterestForm';
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Hajj Packages 2027 from the UK – Coming Soon',
  description:
    'Compare Hajj packages for 2027 from verified UK operators. ATOL and ABTA status checked before listing. Register your interest and be first to know when packages go live.',
  keywords: ['Hajj packages 2027', 'Hajj packages UK', 'Hajj 2027', 'ATOL Hajj packages', 'UK Hajj operators'],
  alternates: {
    canonical: '/hajj',
  },
  openGraph: {
    title: 'Hajj Packages 2027 – Coming Soon | PilgrimCompare',
    description:
      'Register interest for Hajj 2027 packages from verified UK operators. Compare prices, hotels, and inclusions when packages go live.',
    url: 'https://pilgrimcompare.co.uk/hajj',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
};

const hajjFaqs = [
  {
    question: 'When will Hajj 2027 packages be available on PilgrimCompare?',
    answer:
      'We expect Hajj 2027 packages from verified UK operators to go live in late 2026. Register your interest to be notified first.',
  },
  {
    question: 'What should I look for in a Hajj package?',
    answer:
      'Look for operators with ATOL or ABTA protection, hotel distance to the Grand Mosque in Makkah, included flights, visa assistance, and group or private travel options.',
  },
  {
    question: 'How much does a Hajj package from the UK cost?',
    answer:
      'Hajj packages from the UK typically range from £5,000 to £15,000 per person depending on accommodation grade, group size, and included services. Prices vary each year based on government quota allocations.',
  },
  {
    question: 'Is PilgrimCompare ATOL protected?',
    answer:
      'PilgrimCompare is a comparison and enquiry platform — we do not sell packages directly. All operators listed on PilgrimCompare are required to declare their ATOL and ABTA status. Always verify this directly with the operator before booking.',
  },
];

const hajjPageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/hajj',
    name: 'Hajj Packages 2027 from the UK – Coming Soon | PilgrimCompare',
    description:
      'Compare Hajj packages for 2027 from verified UK operators. ATOL and ABTA status checked before listing.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Hajj Packages 2027', path: '/hajj' },
  ]),
  faqPageJsonLd(hajjFaqs),
]);

export default function HajjPage() {
  return (
    <>
      <JsonLdScript data={hajjPageJsonLd} />
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--yellow)]/10 border border-[var(--yellow)]/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--yellow)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--yellow)]"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
              Coming Soon
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4 leading-tight">
            Hajj Packages for 2027
          </h1>
          <p className="text-[var(--textMuted)] text-lg mb-8 leading-relaxed">
            We are working with verified UK operators to bring you the best Hajj packages for the
            2027 season. Register your interest and be the first to know when packages are available.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-xl bg-[var(--surfaceDark)] border border-[var(--border)]">
              <div className="text-[var(--yellow)] mb-2">
                <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Verified Operators</h3>
              <p className="text-xs text-[var(--textMuted)]">All operators ATOL/ABTA checked</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surfaceDark)] border border-[var(--border)]">
              <div className="text-[var(--yellow)] mb-2">
                <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Compare Prices</h3>
              <p className="text-xs text-[var(--textMuted)]">Side-by-side package comparison</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surfaceDark)] border border-[var(--border)]">
              <div className="text-[var(--yellow)] mb-2">
                <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Early Access</h3>
              <p className="text-xs text-[var(--textMuted)]">Be notified first when live</p>
            </div>
          </div>

          {/* FAQ answer blocks for AEO */}
          <section className="text-left mb-10 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--textMuted)] mb-3">
              Frequently asked questions
            </h2>
            {hajjFaqs.map((faq, i) => (
              <details key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium text-[var(--text)]">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-[var(--textMuted)] leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </section>

          <HajjInterestForm />

          {/* Back to Umrah CTA */}
          <div className="pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--textMuted)] mb-3">
              Looking for Umrah packages?
            </p>
            <Link
              href="/umrah"
              className="inline-flex items-center gap-2 text-[var(--yellow)] font-medium hover:underline"
              aria-label="Browse available Umrah packages"
            >
              Find Umrah Packages
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
