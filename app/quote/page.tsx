import type { Metadata } from 'next';
import { Suspense } from 'react';
import { QuoteRequestWizard } from '@/components/quote/QuoteRequestWizard';
import { Repository } from '@/lib/api/repository';

export const metadata: Metadata = {
  title: 'Request a Quote | PilgrimCompare',
  robots: { index: false, follow: false },
};

export default async function QuotePage() {
  const departureCities = await Repository.getDistinctDepartureCities();

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFFFF] sm:text-4xl">
              Request Your Custom Quote
            </h1>
            <p className="mt-2 text-lg text-[rgba(255,255,255,0.64)]">
              Tell us your preferences and receive structured offers from verified operators.
            </p>
          </div>

          <Suspense
            fallback={
              <div role="status" aria-busy="true" className="text-sm text-[rgba(255,255,255,0.64)]">
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
