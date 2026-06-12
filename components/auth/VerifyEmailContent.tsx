'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const errorParam = searchParams.get('error');

  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleResend = async () => {
    if (!email) return;
    setResendStatus('sending');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendStatus(res.ok ? 'sent' : 'error');
    } catch {
      setResendStatus('error');
    }
  };

  if (errorParam === 'invalid_link') {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Verification link invalid or expired</h1>
        <p className="text-sm text-[var(--textMuted)]">
          This link may have already been used or has expired. Request a new one below.
        </p>
        {email && (
          <Button onClick={handleResend} disabled={resendStatus === 'sending' || resendStatus === 'sent'} className="w-full">
            {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Email sent!' : 'Resend verification email'}
          </Button>
        )}
        <p className="text-center text-sm text-[var(--textMuted)]">
          <Link href="/login" className="text-[var(--yellow)] hover:underline">Back to sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="text-5xl">✉️</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Check your inbox</h1>
        <p className="text-sm text-[var(--textMuted)]">
          We sent a verification link to{' '}
          {email ? (
            <span className="font-medium text-[var(--text)]">{email}</span>
          ) : (
            'your email address'
          )}
          . Click the link to activate your account.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--bgSecondary)] p-4 text-left text-xs text-[var(--textMuted)] space-y-1">
        <p className="font-medium text-[var(--text)]">Didn&apos;t receive it?</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check your spam or junk folder</li>
          <li>Make sure you used the right email address</li>
          <li>Links expire after 24 hours</li>
        </ul>
      </div>

      {email && (
        <div className="space-y-2">
          {resendStatus === 'sent' ? (
            <p className="text-sm text-[var(--color-success)]">Verification email sent! Check your inbox.</p>
          ) : resendStatus === 'error' ? (
            <p className="text-sm text-[var(--color-error)]">Something went wrong. Please try again.</p>
          ) : null}
          <Button
            variant="secondary"
            onClick={handleResend}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
            className="w-full"
          >
            {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-[var(--textMuted)]">
        <Link href="/login" className="text-[var(--yellow)] hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
