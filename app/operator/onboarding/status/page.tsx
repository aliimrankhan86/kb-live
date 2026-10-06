import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { isOperatorSelfServeEnabled } from '@/lib/config';
import { OnboardingStatusClient } from '@/components/operator/OnboardingStatusClient';

// PARKED with self-serve onboarding (PARKED_FEATURES.md #3): 404 while off.
export default function VerificationStatusPage() {
  if (!isOperatorSelfServeEnabled()) notFound();
  return (
    <Suspense>
      <OnboardingStatusClient />
    </Suspense>
  );
}
