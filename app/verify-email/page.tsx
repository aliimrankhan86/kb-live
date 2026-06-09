import { Suspense } from 'react';
import { VerifyEmailContent } from '@/components/auth/VerifyEmailContent';

export const metadata = {
  title: 'Verify Your Email — KaabaTrip',
  description: 'Check your inbox to verify your KaabaTrip account.',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-8 shadow-lg">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[var(--surfaceDark)]" />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
