'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerificationStatusPage() {
  const searchParams = useSearchParams();
  // In production, read operator status from auth/API. For MVP, use query param for demo.
  const status = (searchParams.get('status') as 'pending' | 'verified' | 'rejected') || 'pending';

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center" data-testid="verification-status-page">
      {status === 'pending' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,211,29,0.12)] text-[var(--yellow)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Application Under Review</h1>
          <p className="text-[var(--textMuted)]">
            We{'\''}re reviewing your application. This usually takes 1&ndash;2 business days.
            You can create draft packages while you wait.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/operator/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--yellow)] px-4 py-2.5 text-sm font-medium text-black transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]">
              Go to Dashboard
            </Link>
          </div>
        </>
      )}

      {status === 'verified' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Congratulations!</h1>
          <p className="text-[var(--textMuted)]">Your account is verified. You can now publish packages and receive bookings.</p>
          <div className="flex justify-center gap-3">
            <Link href="/operator/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--yellow)] px-4 py-2.5 text-sm font-medium text-black transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]">
              Go to Dashboard
            </Link>
          </div>
        </>
      )}

      {status === 'rejected' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Application Needs Updates</h1>
          <p className="text-[var(--textMuted)]">
            Your application was not approved. Please review the feedback and resubmit.
          </p>
          <div className="rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4 text-left">
            <p className="text-sm text-[var(--textMuted)]">Reason:</p>
            <p className="mt-1 text-sm text-[var(--text)]">Company registration number could not be verified. Please upload a valid certificate.</p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/operator/onboarding" className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--borderStrong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]">
              Update Application
            </Link>
          </div>
        </>
      )}
    </div>
  );
}