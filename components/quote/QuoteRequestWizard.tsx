'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuoteRequestStore } from '@/lib/store/quote-request';
import { Step1TypeSeason } from './steps/Step1TypeSeason';
import { Step2LocationDates } from './steps/Step2LocationDates';
import { Step3StayDetails } from './steps/Step3StayDetails';
import { Step4GroupBudget } from './steps/Step4GroupBudget';
import { Step5Review } from './steps/Step5Review';
import { AnimatePresence, motion } from 'framer-motion';

import { useRouter } from 'next/navigation';
import { QuoteRequest } from '@/lib/types';
import { parseQuotePrefillParams } from '@/lib/quote-prefill';
import { Button } from '@/components/ui';

export function QuoteRequestWizard({ cities }: { cities: string[] }) {
  const { draft, step, nextStep, prevStep, reset, setDraft } = useQuoteRequestStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillParams = useMemo(() => (searchParams ? searchParams.toString() : ''), [searchParams]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams || prefillParams.length === 0) return;

    try {
      const prefill = parseQuotePrefillParams(searchParams);
      if (Object.keys(prefill).length > 0) {
        setDraft(prefill);
      }
    } catch {
      // Prefill params are URL-sourced best-effort; ignore parse failures
    } finally {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/quote');
      }
    }
  }, [prefillParams, searchParams, setDraft]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);

    const newRequest: QuoteRequest = {
      ...(draft as QuoteRequest),
      id: crypto.randomUUID(),
      customerId: 'cust1', // Mock user
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    
    // Ensure nested defaults if missing
    if (!newRequest.occupancy) {
      newRequest.occupancy = { single: 0, double: 2, triple: 0, quad: 0 };
    }
    if (!newRequest.inclusions) {
      newRequest.inclusions = { visa: true, flights: true, transfers: true, meals: true };
    }

    try {
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      const data = (await response.json()) as { error?: string; request?: QuoteRequest };
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to submit quote request.');
      }

      if (!data.request) throw new Error('Unable to submit quote request.');

      const savedRequest = data.request;
      reset(); // Clear draft
      router.push(`/requests/${savedRequest.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit quote request.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1TypeSeason />;
      case 2:
        return <Step2LocationDates cities={cities} />;
      case 3:
        return <Step3StayDetails />;
      case 4:
        return <Step4GroupBudget />;
      case 5:
        return <Step5Review />;
      default:
        return <Step1TypeSeason />;
    }
  };

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111111] p-6 shadow-xl sm:p-10">
      <div className="mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="quote-back-button"
          onClick={() => router.back()}
          className="px-0 text-[var(--textMuted)] hover:bg-transparent hover:text-[var(--text)]"
        >
          Back to previous page
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-[#FFFFFF]">
          <span>Step {step} of 5</span>
          <span>{Math.round((step / 5) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-[rgba(255,255,255,0.1)]">
          <div
            className="h-full rounded-full bg-[#FFD31D] transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {submitError ? (
        <div
          role="alert"
          data-testid="quote-submit-error"
          className="mt-6 rounded-md border border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.12)] px-4 py-3 text-sm text-[var(--text)]"
        >
          {submitError}
        </div>
      ) : null}

      <div className="mt-8 flex justify-between pt-6 border-t border-[rgba(255,255,255,0.1)]">
        <Button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          variant="ghost"
          className={step === 1 ? 'text-[rgba(255,255,255,0.4)]' : 'text-[var(--text)]'}
        >
          Back
        </Button>
        
        {step < 5 ? (
          <Button
            type="button"
            onClick={nextStep}
            variant="primary"
            className="px-6"
          >
            Next Step
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            variant="primary"
            className="px-6"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        )}
      </div>
    </div>
  );
}
