import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Repository } from '@/lib/api/repository';

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        {/* Reference code */}
        <div className="rounded-xl border border-[var(--yellow)] bg-[rgba(255,211,29,0.06)] px-6 py-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--yellow)]">
            Booking reference
          </p>
          <p
            className="mt-2 font-mono text-3xl font-bold tracking-widest text-[var(--yellow)]"
            aria-label={`Booking reference code ${referenceCode}`}
          >
            {referenceCode}
          </p>
          <p className="mt-3 text-sm text-[var(--textMuted)]">
            Your enquiry has been submitted to{' '}
            <strong className="text-[var(--text)]">{operatorName}</strong>.
          </p>
        </div>

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
              'You pay the operator directly. KaabaTrip does not receive or hold your payment.',
              'Your travel contract, cancellations and refunds are with the operator named on this page.',
              'Your KaabaTrip reference code is a tracking code, not a payment receipt.',
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
                will need it if you contact KaabaTrip support.
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
