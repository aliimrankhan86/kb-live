import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your PilgrimCompare traveller or partner account',
};

export default function LoginPage() {
  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-8 shadow-lg">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[var(--surfaceDark)]" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}