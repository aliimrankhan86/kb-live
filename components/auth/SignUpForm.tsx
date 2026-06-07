'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type SignUpRole = 'customer' | 'operator';

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('type') as SignUpRole) || 'operator';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<SignUpRole>(defaultRole);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter your password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name, marketingConsent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // After sign-up, redirect to login
      router.push('/login?registered=true');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const isPartner = role === 'operator';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Account type">
        <button
          type="button"
          role="tab"
          aria-selected={role === 'customer'}
          onClick={() => setRole('customer')}
          className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
            role === 'customer'
              ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
              : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
          }`}
          data-testid="signup-role-customer"
        >
          Traveller
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === 'operator'}
          onClick={() => setRole('operator')}
          className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
            role === 'operator'
              ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
              : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
          }`}
          data-testid="signup-role-operator"
        >
          Partner
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {isPartner ? 'Partner Registration' : 'Create Account'}
        </h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          {isPartner
            ? 'Register your travel company and start receiving bookings from UK travellers.'
            : 'Join KaabaTrip to compare packages, save favourites, and request quotes.'}
        </p>
      </div>

      {passwordError && (
        <div
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
          data-testid="signup-password-mismatch"
        >
          {passwordError}
        </div>
      )}

      {error && (
        <div
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
          data-testid="signup-error"
        >
          {error}
        </div>
      )}

      <Input
        label="Full name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
        data-testid="signup-name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        data-testid="signup-email"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        data-testid="signup-password"
      />

      <Input
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        data-testid="signup-confirm-password"
      />

      <div className="space-y-3">
        <label className="flex items-start gap-2 text-xs text-[var(--textMuted)] cursor-pointer">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            data-testid="signup-terms-checkbox"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" target="_blank" className="underline text-[var(--accent)]">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="underline text-[var(--accent)]">
              Privacy Policy
            </Link>
            . I confirm I am at least 16 years old.
          </span>
        </label>

        <label className="flex items-start gap-2 text-xs text-[var(--textMuted)] cursor-pointer">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            data-testid="signup-marketing-checkbox"
          />
          <span>
            I consent to receiving marketing emails about new packages, deals, and platform
            updates. You can unsubscribe at any time. (Optional)
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading || !termsAgreed}
        className="w-full"
        data-testid="signup-submit"
      >
        {loading ? 'Creating account…' : isPartner ? 'Register as Partner' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-[var(--textMuted)]">
        Already have an account?{' '}
        <Link
          href={isPartner ? '/login?type=partner' : '/login?type=customer'}
          className="text-[var(--yellow)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}