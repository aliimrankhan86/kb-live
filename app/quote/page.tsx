import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { QuoteRequestWizard } from '@/components/quote/QuoteRequestWizard';
import { Repository } from '@/lib/api/repository';
import { isRfqQuoteEnabled } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Request a Quote | PilgrimCompare',
  robots: { index: false, follow: false },
};

export default async function QuotePage() {
  // PARKED: multi-step RFQ quote engine. Off in the live pilgrim journey.
  // See PARKED_FEATURES.md entry 2. Code intact; flag default OFF.
  if (!isRfqQuoteEnabled()) notFound();

  const departureCities = await Repository.getDistinctDepartureCities();

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
              Request Your Custom Quote
            </h1>
            <p className="mt-2 text-lg text-[var(--textMuted)]">
              Tell us your preferences and receive structured offers from verified operators.
            </p>
          </div>

          <Suspense
            fallback={
              <div role="status" aria-busy="true" className="text-sm text-[var(--textMuted)]">
                Loading quote form...
              </div>
            }
          >
            <QuoteRequestWizard cities={departureCities} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
