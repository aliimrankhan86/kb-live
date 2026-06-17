import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { OperatorRegistrationForm } from '@/components/operator/OperatorRegistrationForm';
import { OnboardingVerifiedBanner } from '@/components/operator/OnboardingVerifiedBanner';
import { isOperatorSelfServeEnabled } from '@/lib/config';

export const metadata = {
  title: 'Operator Onboarding',
  description: 'Register as a verified operator on PilgrimCompare',
};

export default function OperatorOnboardingPage() {
  // PARKED: self-serve operator onboarding. The concierge model is live —
  // operators are onboarded by the PilgrimCompare team, not via this form.
  // See PARKED_FEATURES.md entry 3. Code intact; flag default OFF.
  if (!isOperatorSelfServeEnabled()) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Suspense fallback={null}>
        <OnboardingVerifiedBanner />
      </Suspense>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Operator Registration</h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Complete the form below to apply as a verified operator. Our team will review your application within 1–2 business days.
        </p>
      </div>
      <OperatorRegistrationForm />
    </div>
  );
}