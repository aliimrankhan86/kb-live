import type { Metadata } from 'next';
import { JsonLdScript, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld';

export const metadata: Metadata = {
  title: 'How PilgrimCompare Works | Compare Umrah Packages from Verified UK Operators',
  description:
    'Compare Umrah packages side by side, send an enquiry to your chosen operator, and pay them directly. PilgrimCompare is a comparison and enquiry service — not a travel agent.',
  alternates: { canonical: '/how-it-works' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'How PilgrimCompare Works | Compare Umrah Packages',
    description:
      'Compare Umrah packages, send an enquiry to your chosen operator, and pay them directly. Not a travel agent — a comparison service.',
    url: 'https://pilgrimcompare.co.uk/how-it-works',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How PilgrimCompare Works | Compare Umrah Packages',
    description:
      'Compare Umrah packages, send an enquiry, and pay the operator directly. Comparison and enquiry service — not a travel agent.',
  },
};

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/how-it-works',
    name: 'How PilgrimCompare Works — Compare Umrah Packages from Verified UK Operators',
    description:
      'PilgrimCompare is a UK comparison and enquiry service for Umrah packages. Compare operators, send an enquiry, pay the operator directly.',
  }),
  faqPageJsonLd([
    {
      question: 'Is PilgrimCompare a travel agent?',
      answer:
        'No. PilgrimCompare is a comparison and enquiry service. We list packages from independent, verified UK travel operators so you can compare them side by side and send enquiries directly. We do not sell travel, take bookings, or handle payments.',
    },
    {
      question: 'Who do I pay for an Umrah package found on PilgrimCompare?',
      answer:
        'You pay the operator directly. PilgrimCompare does not receive or hold your payment. Your travel contract, cancellations, and refunds are with the operator you choose.',
    },
    {
      question: 'What does my PilgrimCompare reference code mean?',
      answer:
        'Your PilgrimCompare reference code is a tracking code, not a payment receipt. It allows both you and PilgrimCompare to track your enquiry.',
    },
  ]),
]);

const STEPS = [
  {
    number: 1,
    title: 'Compare',
    body: 'Browse packages from verified UK operators side by side. Filter by budget, hotel rating, departure city, and dates. Every package shows exactly what the operator has stated — nothing is filled in or guessed.',
    extra: null,
  },
  {
    number: 2,
    title: 'Enquire',
    body: 'When you find a package that interests you, send your details to the operator directly via PilgrimCompare. Your contact details go to that operator and to no one else. You will receive a confirmation email with your PilgrimCompare reference code.',
    extra: null,
  },
  {
    number: 3,
    title: 'Operator replies',
    body: 'The operator contacts you directly — typically within 48 hours — to discuss your requirements, confirm pricing, and answer your questions. PilgrimCompare is not involved in this conversation.',
    extra: null,
  },
  {
    number: 4,
    title: 'Book and pay directly with the operator',
    body: 'If you are happy to proceed, you book and pay directly with the operator. Always confirm cancellation terms, payment plan, and ATOL protection in writing before paying any deposit.',
    extra: 'payment',
  },
  {
    number: 5,
    title: 'Reference code',
    body: 'Your reference code tracks your journey. Keep it safe — it is the audit trail if you ever need to raise a concern through PilgrimCompare.',
    extra: 'reference',
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
    <JsonLdScript data={pageJsonLd} />
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-3 text-3xl font-bold">How PilgrimCompare Works</h1>
        <p className="mb-10 text-sm leading-relaxed text-[var(--textMuted)]">
          PilgrimCompare is a UK comparison and enquiry service for Umrah travel packages. We
          list packages from independent, verified UK travel operators so you can compare them
          side by side and send enquiries directly. We are not a travel agent, tour operator,
          or organiser. We do not sell travel, take bookings, or handle payments. Your booking,
          contract, and payment are always with the operator you choose.
        </p>

        <ol className="mb-12 space-y-8" aria-label="How it works — five steps">
          {STEPS.map((step) => (
            <li key={step.number} className="flex gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-base font-bold text-[var(--background)]"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <div>
                <h2 className="mb-1 text-lg font-semibold">{step.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--textMuted)]">{step.body}</p>
                {step.extra === 'payment' && (
                  <ul className="mt-3 space-y-1 text-sm leading-relaxed">
                    <li>
                      You pay the operator directly. PilgrimCompare does not receive or hold
                      your payment.
                    </li>
                    <li>
                      Your travel contract, cancellations and refunds are with the operator
                      named on this page.
                    </li>
                  </ul>
                )}
                {step.extra === 'reference' && (
                  <p className="mt-2 text-sm leading-relaxed">
                    Your PilgrimCompare reference code is a tracking code, not a payment receipt.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <section className="mb-8 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 text-base font-semibold">How we verify operators</h2>
          <p className="text-sm leading-relaxed">
            Before any operator is listed, we check: (1) their ATOL number against the
            CAA&apos;s public register, (2) their company status at Companies House, (3) that
            they have a real, verifiable UK trading address. Verification confirms these checks
            at the time of listing. It is not a guarantee of service quality, financial
            protection for your specific booking, or future conduct.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 text-base font-semibold">
            Payment and contract — what always applies
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              — You pay the operator directly. PilgrimCompare does not receive or hold your
              payment.
            </li>
            <li>
              — Your travel contract, cancellations and refunds are with the operator named on
              this page.
            </li>
            <li>
              — Your PilgrimCompare reference code is a tracking code, not a payment receipt.
            </li>
          </ul>
        </section>
      </div>
    </main>
    </>
  );
}
