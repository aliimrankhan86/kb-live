'use client';

import { useSearchParams } from 'next/navigation';

export function OnboardingVerifiedBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('verified') !== '1') return null;

  return (
    <div
      className="flex items-start gap-3 rounded-md border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]"
      role="status"
    >
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/20 text-[10px] font-bold">
        ✓
      </span>
      <div>
        <p className="font-medium text-[var(--color-success)]">Email verified</p>
        <p className="mt-0.5 text-[var(--color-success)]/80">
          Now complete your company profile so our team can review your application.
        </p>
      </div>
    </div>
  );
}
