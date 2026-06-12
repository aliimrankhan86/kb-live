'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/auth/PasswordInput';

type SignUpRole = 'customer' | 'operator';

interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(pwd: string): PasswordCheck[] {
  return [
    { label: 'At least 8 characters', met: pwd.length >= 8 },
    { label: 'At least 1 uppercase letter (A–Z)', met: /[A-Z]/.test(pwd) },
    { label: 'At least 1 lowercase letter (a–z)', met: /[a-z]/.test(pwd) },
    { label: 'At least 1 number (0–9)', met: /[0-9]/.test(pwd) },
    { label: 'At least 1 special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(pwd) },
  ];
}

function PasswordMatchIndicator({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <p
      className="mt-1.5 flex items-center gap-1.5 text-xs"
      style={{ color: match ? '#22c55e' : '#ef4444' }}
      aria-live="polite"
    >
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          backgroundColor: match ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        }}
      >
        {match ? '✓' : '✗'}
      </span>
      {match ? 'Passwords match' : 'Passwords do not match'}
    </p>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = getPasswordChecks(password);
  const metCount = checks.filter((c) => c.met).length;
  const strength =
    metCount <= 2 ? 'weak' : metCount <= 4 ? 'medium' : 'strong';

  const barColor =
    strength === 'weak'
      ? '#ef4444'
      : strength === 'medium'
        ? '#eab308'
        : '#22c55e';

  return (
    <div className="space-y-2">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--bgSecondary)]">
        <div
          className="transition-all duration-300"
          style={{
            width: `${(metCount / checks.length) * 100}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <ul className="space-y-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className="flex items-center gap-2 text-xs transition-colors"
            style={{
              color: password.length === 0
                ? 'var(--textMuted)'
                : check.met
                  ? '#22c55e'
                  : '#ef4444',
            }}
          >
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: password.length === 0
                  ? 'var(--bgSecondary)'
                  : check.met
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(239,68,68,0.15)',
                color: password.length === 0
                  ? 'var(--textMuted)'
                  : check.met
                    ? '#22c55e'
                    : '#ef4444',
              }}
            >
              {check.met ? '✓' : password.length === 0 ? '○' : '✗'}
            </span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('type') as SignUpRole) || 'operator';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<SignUpRole>(defaultRole);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const allPasswordMet = passwordChecks.every((c) => c.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setLoading(true);

    if (!allPasswordMet) {
      setPasswordError('Password does not meet all requirements.');
      setLoading(false);
      return;
    }

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

      // Redirect to verify-email page. If Supabase email confirmation is disabled
      // the user is already confirmed, but this page is harmless in that case.
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
          Operator
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {isPartner ? 'Operator Registration' : 'Create Account'}
        </h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          {isPartner
            ? 'Register your travel company to list packages and receive enquiries from UK travellers.'
            : 'Join PilgrimCompare to compare packages, save favourites, and request quotes.'}
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

      <div>
        <Input
          label={isPartner ? 'Company name' : 'Full name'}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete={isPartner ? 'organization' : 'name'}
          data-testid="signup-name"
        />
        {isPartner && (
          <p className="mt-1.5 text-xs text-[var(--textMuted)]">
            Your registered or trading company name
          </p>
        )}
      </div>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        data-testid="signup-email"
      />

      <div className="space-y-2">
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          data-testid="signup-password"
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((current) => !current)}
          toggleTestId="signup-password-toggle"
        />
        <PasswordStrength password={password} />
      </div>

      <div>
        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          data-testid="signup-confirm-password"
          showPassword={showConfirmPassword}
          onToggleShowPassword={() => setShowConfirmPassword((current) => !current)}
          toggleTestId="signup-confirm-password-toggle"
        />
        <PasswordMatchIndicator password={password} confirm={confirmPassword} />
      </div>

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
        disabled={loading || !termsAgreed || !allPasswordMet}
        className="w-full"
        data-testid="signup-submit"
      >
        {loading ? 'Creating account…' : isPartner ? 'Register as an Operator' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-[var(--textMuted)]">
        Already have an account?{' '}
        <Link
          href={isPartner ? '/login?type=operator' : '/login?type=customer'}
          className="text-[var(--yellow)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
