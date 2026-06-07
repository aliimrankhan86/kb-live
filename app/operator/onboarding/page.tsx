import { OperatorRegistrationForm } from '@/components/operator/OperatorRegistrationForm';

export const metadata = {
  title: 'Operator Onboarding',
  description: 'Register as a verified operator on KaabaTrip',
};

export default function OperatorOnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
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