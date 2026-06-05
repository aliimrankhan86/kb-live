'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'operator'>('operator');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Create Account</h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Join KaabaTrip as a traveller or partner.
        </p>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
          data-testid="signup-error"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
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
          onClick={() => setRole('operator')}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            role === 'operator'
              ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
              : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
          }`}
          data-testid="signup-role-operator"
        >
          Partner
        </button>
      </div>

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
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-[var(--textMuted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--yellow)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}