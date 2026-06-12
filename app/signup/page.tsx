import { Suspense } from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Create Account',
  description: 'Sign up for a PilgrimCompare traveller or operator account',
};

export default function SignUpPage() {
  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-8 shadow-lg">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[var(--surfaceDark)]" />}>
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}