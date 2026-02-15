import { Suspense } from 'react';
import { QuoteRequestWizard } from '@/components/quote/QuoteRequestWizard';

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] py-12 px-4 sm:px-6 lg:px-8">
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
          <QuoteRequestWizard />
        </Suspense>
      </div>
    </main>
  );
}
