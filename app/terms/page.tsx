import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_ENTITY_BLOCK } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Use | PilgrimCompare',
  description:
    'Terms of Use for PilgrimCompare — a UK comparison and enquiry service for Umrah travel packages from verified operators.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms of Use | PilgrimCompare',
    description: 'Terms of Use for PilgrimCompare — a UK comparison and enquiry service for Umrah travel packages.',
    url: 'https://pilgrimcompare.co.uk/terms',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use | PilgrimCompare',
    description: 'Terms of Use for PilgrimCompare — a UK comparison and enquiry service for Umrah travel packages.',
  },
};

const LAST_UPDATED = '12 June 2026';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">Terms of Use</h1>
        <p className="mb-8 text-sm text-[var(--textMuted)]">Last updated: {LAST_UPDATED}</p>

        <nav aria-label="Contents" className="mb-8 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surface)] p-4">
          <p className="mb-2 text-sm font-semibold">Contents</p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li><a href="#who-we-are" className="underline text-[var(--accent)]">Who we are</a></li>
            <li><a href="#what-the-service-is" className="underline text-[var(--accent)]">What the service is</a></li>
            <li><a href="#what-we-are-not" className="underline text-[var(--accent)]">What we are not</a></li>
            <li><a href="#operator-content" className="underline text-[var(--accent)]">Operator content and accuracy</a></li>
            <li><a href="#reference-codes" className="underline text-[var(--accent)]">Reference codes</a></li>
            <li><a href="#no-advice" className="underline text-[var(--accent)]">No advice</a></li>
            <li><a href="#acceptable-use" className="underline text-[var(--accent)]">Acceptable use and account terms</a></li>
            <li><a href="#liability" className="underline text-[var(--accent)]">Liability</a></li>
            <li><a href="#reviews" className="underline text-[var(--accent)]">Reviews and ratings</a></li>
            <li><a href="#complaints" className="underline text-[var(--accent)]">Complaints</a></li>
            <li><a href="#governing-law" className="underline text-[var(--accent)]">Governing law</a></li>
          </ol>
        </nav>

        <section id="who-we-are" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">1. Who we are</h2>
          <p className="mb-3 text-sm leading-relaxed">
            {LEGAL_ENTITY_BLOCK.tradingName} is a trading name of{' '}
            <strong>{LEGAL_ENTITY_BLOCK.companyName}</strong>, registered in{' '}
            {LEGAL_ENTITY_BLOCK.registeredCountry}, company number{' '}
            {LEGAL_ENTITY_BLOCK.companyNumber}. VAT number: {LEGAL_ENTITY_BLOCK.vatNumber}.
          </p>
          {/* TODO: add registered office line once virtual office is set up — see AI_NOTES.md §14 */}
          <p className="text-sm leading-relaxed">
            Contact:{' '}
            <a
              href={`mailto:${LEGAL_ENTITY_BLOCK.contactEmail}`}
              className="underline text-[var(--accent)]"
            >
              {LEGAL_ENTITY_BLOCK.contactEmail}
            </a>
          </p>
        </section>

        <section id="what-the-service-is" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">2. What the service is</h2>
          <p className="text-sm leading-relaxed">
            PilgrimCompare is a UK comparison and enquiry service for Umrah travel packages. We
            list packages from independent, verified UK travel operators so you can compare them
            side by side and send enquiries directly. We are not a travel agent, tour operator,
            or organiser. We do not sell travel, take bookings, or handle payments. Your booking,
            contract, and payment are always with the operator you choose.
          </p>
        </section>

        <section id="what-we-are-not" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">3. What we are not</h2>
          <p className="mb-3 text-sm leading-relaxed">
            PilgrimCompare is not a travel agent, tour operator, organiser, agent, or merchant
            of record. We do not:
          </p>
          <ul className="mb-3 list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>Take, hold, route, or facilitate any customer payment.</li>
            <li>
              Conclude or confirm any booking. Submitting an enquiry or booking intent does not
              create a travel contract.
            </li>
            <li>Issue tickets, vouchers, or ATOL Certificates.</li>
            <li>Bundle services from multiple operators.</li>
            <li>Set, negotiate, or guarantee prices, availability, or inventory.</li>
          </ul>
          <p className="text-sm leading-relaxed">
            The obligations of a tour organiser under the Package Travel and Linked Travel
            Arrangements Regulations 2018 sit with the operator, not with PilgrimCompare.
            PilgrimCompare is not party to any contract between you and an operator.
          </p>
        </section>

        <section id="operator-content" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">4. Operator content and accuracy</h2>
          <p className="mb-3 text-sm leading-relaxed">
            Operators supply and are responsible for all package data: prices, inclusions,
            dates, hotel details, flight information, and terms. We display this data in good
            faith. Where information has not been supplied by the operator it is shown as{' '}
            <strong>&ldquo;Not provided&rdquo;</strong>. We do not infer, estimate, or fill in
            missing data.
          </p>
          <p className="mb-3 text-sm leading-relaxed">
            Before any operator is listed, we check: (1) their ATOL number against the
            CAA&apos;s public register, (2) their company status at Companies House, (3) that
            they have a real, verifiable UK trading address. Verification confirms these checks
            at the time of listing. It is not a guarantee of service quality, financial
            protection for your specific booking, or future conduct.
          </p>
          <p className="text-sm leading-relaxed">
            Prices are displayed exactly as provided by the operator and attributed to them.
            Always confirm all package details, inclusions, and final price directly with the
            operator before paying.
          </p>
        </section>

        <section id="reference-codes" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">5. Reference codes</h2>
          <p className="mb-3 text-sm leading-relaxed">
            When you send an enquiry or express a booking intent, PilgrimCompare issues a
            unique reference code. The following applies to all reference codes:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-2">
            <li>You pay the operator directly. PilgrimCompare does not receive or hold your payment.</li>
            <li>Your travel contract, cancellations and refunds are with the operator named on this page.</li>
            <li>Your PilgrimCompare reference code is a tracking code, not a payment receipt.</li>
          </ul>
        </section>

        <section id="no-advice" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">6. No advice</h2>
          <p className="text-sm leading-relaxed">
            Nothing on PilgrimCompare constitutes travel advice, visa advice, financial advice,
            or religious guidance. Information about visa requirements, travel conditions, or
            religious compliance is provided for general reference only, sourced from
            operator-supplied data, and may not be current or applicable to your specific
            circumstances. Always verify requirements independently and consult qualified
            advisers where needed.
          </p>
        </section>

        <section id="acceptable-use" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">7. Acceptable use and account terms</h2>
          <p className="mb-3 text-sm leading-relaxed">By using PilgrimCompare, you agree to:</p>
          <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>Provide accurate and truthful information in all enquiries and account details.</li>
            <li>Be at least 16 years old, or have parental or guardian consent.</li>
            <li>Use the platform only for lawful purposes and in accordance with these terms.</li>
            <li>
              Not submit false or duplicate enquiries, or misuse complaint or dispute processes.
            </li>
            <li>
              Keep your account credentials secure and notify us promptly of any unauthorised
              access.
            </li>
          </ul>
          <p className="text-sm leading-relaxed">
            We may suspend or terminate your account at any time if we reasonably believe you
            have breached these terms, engaged in fraudulent or abusive activity, or pose a risk
            to other users or to operators. Operators may have their verification status
            suspended for misrepresentation or breach of the operator agreement.
          </p>
        </section>

        {/* LEGAL REVIEW */}
        <section id="liability" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">8. Liability</h2>
          {/* LEGAL REVIEW */}
          <p className="mb-3 text-sm leading-relaxed">
            To the maximum extent permitted by applicable law, PilgrimCompare and{' '}
            {LEGAL_ENTITY_BLOCK.companyName} exclude liability for:
          </p>
          {/* LEGAL REVIEW */}
          <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed space-y-1">
            {/* LEGAL REVIEW */}
            <li>
              Any loss, cost, or damage arising from the performance, accuracy, or conduct of
              any operator listed on the platform.
            </li>
            {/* LEGAL REVIEW */}
            <li>
              The accuracy of operator-supplied package data beyond our stated verification
              checks (Section 4 above).
            </li>
            {/* LEGAL REVIEW */}
            <li>
              Any indirect, consequential, or special loss arising from use of the platform.
            </li>
            {/* LEGAL REVIEW */}
            <li>Loss of profit, loss of data, or loss of business opportunity.</li>
          </ul>
          {/* LEGAL REVIEW */}
          <p className="mb-3 text-sm leading-relaxed">
            Nothing in these terms excludes or limits our liability for:
          </p>
          {/* LEGAL REVIEW */}
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            {/* LEGAL REVIEW */}
            <li>Death or personal injury caused by our negligence.</li>
            {/* LEGAL REVIEW */}
            <li>Fraud or fraudulent misrepresentation.</li>
            {/* LEGAL REVIEW */}
            <li>
              Any liability that cannot lawfully be excluded under the Consumer Rights Act 2015
              or any other applicable law.
            </li>
          </ul>
        </section>

        <section id="reviews" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">9. Reviews and ratings</h2>
          <p className="text-sm leading-relaxed">
            PilgrimCompare does not currently publish user reviews or ratings. When a review
            system is introduced, only reviews tied to a verified PilgrimCompare reference code
            will be published. No reviews will be written, commissioned, edited for sentiment,
            or selectively suppressed. Operators cannot pay to alter or remove reviews.
          </p>
        </section>

        <section id="complaints" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">10. Complaints</h2>
          <p className="mb-3 text-sm leading-relaxed">
            <strong>Complaints about the platform:</strong> Contact us at{' '}
            <a
              href="mailto:support@pilgrimcompare.co.uk"
              className="underline text-[var(--accent)]"
            >
              support@pilgrimcompare.co.uk
            </a>.
          </p>
          <p className="mb-3 text-sm leading-relaxed">
            <strong>Complaints about a booking:</strong> Your contract and dispute rights are
            with the operator directly. Contact the operator in the first instance. If
            unresolved, we will help route your complaint to the operator; we do not adjudicate
            disputes or enforce resolutions.
          </p>
          <p className="text-sm leading-relaxed">
            For further support:{' '}
            <a
              href="https://www.citizensadvice.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              Citizens Advice
            </a>{' '}
            or{' '}
            <a
              href="https://www.tradingstandards.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              Trading Standards
            </a>.
          </p>
        </section>

        <section id="governing-law" className="mb-8 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">11. Governing law</h2>
          <p className="text-sm leading-relaxed">
            These terms are governed by the laws of England and Wales. Any dispute arising from
            your use of PilgrimCompare is subject to the exclusive jurisdiction of the courts of
            England and Wales.
          </p>
        </section>

        <p className="mt-12 text-xs text-[var(--textMuted)]">
          By using PilgrimCompare you confirm you have read and understood these terms.{' '}
          <Link href="/privacy" className="underline text-[var(--accent)]">
            Privacy Policy
          </Link>{' '}
          ·{' '}
          <Link href="/how-it-works" className="underline text-[var(--accent)]">
            How it works
          </Link>
        </p>
      </div>
    </main>
  );
}
