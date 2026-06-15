import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Repository } from '@/lib/api/repository';
import { isBookingFlowEnabled } from '@/lib/config';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ReferenceCodeDisplay } from '@/components/request/ReferenceCodeDisplay';

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // PARKED: booking-intent / payment flow. Off in the live pilgrim journey.
  // See PARKED_FEATURES.md entry 1. Code intact; flag default OFF.
  if (!isBookingFlowEnabled()) notFound();

  const { id } = await params;

  const bookingIntent = await Repository.getBookingIntentById(id);
  if (!bookingIntent) notFound();

  const operator = await Repository.getOperatorById(bookingIntent.operatorId);
  const operatorName =
    operator?.tradingName || operator?.companyName || 'the operator';

  const referenceCode = bookingIntent.referenceCode ?? id.slice(0, 8).toUpperCase();

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--background)] px-4 py-12"
    >
      <div className="mx-auto max-w-xl space-y-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My requests', href: '/requests' },
            { label: 'Request', href: `/requests/${id}` },
            { label: 'Confirmation' },
          ]}
        />
        {/* Reference code */}
        <ReferenceCodeDisplay referenceCode={referenceCode} operatorName={operatorName} />

        {/* Trust lines */}
        <section aria-labelledby="trust-heading">
          <h2
            id="trust-heading"
            className="mb-4 text-lg font-semibold text-[var(--text)]"
          >
            Important to know
          </h2>
          <ul className="space-y-3">
            {[
              'You pay the operator directly. PilgrimCompare does not receive or hold your payment.',
              'Your travel contract, cancellations and refunds are with the operator named on this page.',
              'Your PilgrimCompare reference code is a tracking code, not a payment receipt.',
            ].map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-3 text-sm text-[var(--text)]"
              >
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--yellow)]"
                  aria-hidden="true"
                />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Next steps */}
        <section aria-labelledby="next-steps-heading">
          <h2
            id="next-steps-heading"
            className="mb-4 text-lg font-semibold text-[var(--text)]"
          >
            Next steps
          </h2>
          <ol className="space-y-3 text-sm text-[var(--text)]">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-xs font-bold text-black">
                1
              </span>
              <span>
                Contact <strong>{operatorName}</strong> directly to confirm your
                booking details and discuss payment.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-xs font-bold text-black">
                2
              </span>
              <span>
                Await confirmation from the operator. They will respond to your
                enquiry using the contact details you provided.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-xs font-bold text-black">
                3
              </span>
              <span>
                Keep your reference code{' '}
                <strong className="font-mono">{referenceCode}</strong> safe. You
                will need it if you contact PilgrimCompare support.
              </span>
            </li>
          </ol>
        </section>

        {/* Back link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--yellow)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
