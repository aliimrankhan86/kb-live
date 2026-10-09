import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { isOperatorSelfServeEnabled } from '@/lib/config';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a PilgrimCompare traveller account to save packages and send enquiries.',
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const operatorSignupEnabled = isOperatorSelfServeEnabled();
  // Operators are onboarded by the team (concierge): send them to /partner.
  if ((await searchParams).type === 'operator' && !operatorSignupEnabled) redirect('/partner');
  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-8 shadow-lg">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[var(--surfaceDark)]" />}>
            <SignUpForm operatorSignupEnabled={operatorSignupEnabled} />
          </Suspense>
        </div>
      </div>
    </>
  );
}