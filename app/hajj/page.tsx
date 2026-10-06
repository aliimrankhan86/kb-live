import { ATOL_STANDARD_LINE } from '@/lib/content-rules'
import type { Metadata } from 'next';
import Link from 'next/link';
import { HajjInterestForm } from '@/components/hajj/HajjInterestForm';
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'Hajj Packages from the UK: Register Interest | PilgrimCompare',
  description:
    'Hajj packages are not listed on PilgrimCompare yet. Register your interest and we will email you if Hajj packages from verified UK operators are listed.',
  keywords: ['Hajj packages 2027', 'Hajj packages UK', 'Hajj 2027', 'ATOL Hajj packages', 'UK Hajj operators'],
  alternates: {
    canonical: '/hajj',
  },
  openGraph: {
    title: 'Hajj Packages from the UK: Register Interest | PilgrimCompare',
    description:
      'Hajj packages are not listed on PilgrimCompare yet. Register your interest and we will email you if they are.',
    url: 'https://pilgrimcompare.co.uk/hajj',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
};

const hajjFaqs = [
  {
    question: 'When will Hajj packages be available on PilgrimCompare?',
    answer:
      'We do not have a date yet. Register your interest and we will email you if Hajj packages from verified UK operators are listed.',
  },
  {
    question: 'What should I look for in a Hajj package?',
    answer:
      'Check the operator\'s ATOL number, each hotel and its distance to the Haram, what is included (flights, visa, transfers), the nights in each city, and whether the group is private or shared.',
  },
  {
    question: 'How much does a Hajj package from the UK cost?',
    answer:
      'Prices are set by each operator and depend on accommodation, group size and what is included. Confirm the final price with the operator before paying.',
  },
  {
    question: 'Is PilgrimCompare ATOL protected?',
    answer:
      `No. PilgrimCompare is a comparison and enquiry service and does not sell travel. ${ATOL_STANDARD_LINE}`,
  },
];

const hajjPageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/hajj',
    name: 'Hajj Packages from the UK: Register Interest | PilgrimCompare',
    description:
      'Hajj packages are not listed on PilgrimCompare yet. Register your interest and we will email you if they are.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Hajj Packages', path: '/hajj' },
  ]),
  faqPageJsonLd(hajjFaqs),
]);

export default function HajjPage() {
  return (
    <>
      <JsonLdScript data={hajjPageJsonLd} />
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
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
            Hajj Packages from the UK
          </h1>
          <p className="text-[var(--textMuted)] text-lg mb-8 leading-relaxed">
            Hajj packages are not listed on PilgrimCompare yet. Register your interest and we will
            email you if Hajj packages from verified UK operators are listed.
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
              <p className="text-xs text-[var(--textMuted)]">We check each operator&apos;s ATOL number before listing</p>
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
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Register Interest</h3>
              <p className="text-xs text-[var(--textMuted)]">We email you if packages are listed</p>
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
      </div>
    </>
  );
}
