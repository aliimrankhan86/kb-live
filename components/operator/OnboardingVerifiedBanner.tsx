'use client';

import { useSearchParams } from 'next/navigation';

export function OnboardingVerifiedBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('verified') !== '1') return null;

  return (
    <div
      className="flex items-start gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
      role="status"
    >
      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-[10px] font-bold">
        ✓
      </span>
      <div>
        <p className="font-medium text-green-300">Email verified</p>
        <p className="mt-0.5 text-green-400/80">
          Now complete your company profile so our team can review your application.
        </p>
      </div>
    </div>
  );
}
