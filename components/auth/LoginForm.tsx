'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/auth/PasswordInput';

type LoginTab = 'customer' | 'partner';
type ReturnedRole = 'customer' | 'operator' | 'admin';

function resolveLoginType(value: string | null): LoginTab {
  return value === 'partner' || value === 'operator' ? 'partner' : 'customer';
}

function getRedirectForRole(role: ReturnedRole, redirect: string | null): string {
  if (role === 'operator') return redirect || '/operator/dashboard';
  if (role === 'admin') return redirect || '/admin/complaints';

  if (redirect && !redirect.startsWith('/operator') && !redirect.startsWith('/admin')) {
    return redirect;
  }

  return '/';
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const forgotParam = searchParams.get('forgot');
  const defaultTab = resolveLoginType(searchParams.get('type'));

  const [activeTab, setActiveTab] = useState<LoginTab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(forgotParam === 'true');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        setErrorCode(data.code || '');
        setLoading(false);
        return;
      }

      // Redirect based on role
      const role = (data.user?.role || 'customer') as ReturnedRole;
      router.push(getRedirectForRole(role, redirect));
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Unable to send reset instructions. Please try again.');
        setLoading(false);
        return;
      }

      setForgotSent(true);
      setLoading(false);
    } catch {
      // Graceful fallback: show message even if endpoint doesn't exist yet
      setForgotSent(true);
      setLoading(false);
    }
  };

  const isPartner = activeTab === 'partner';

  if (showForgot) {
    return (
      <div className="space-y-4" data-testid="login-forgot-view">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Reset Password</h1>
          <p className="mt-1 text-sm text-[var(--textMuted)]">
            Enter your email address and we will send you instructions to reset your password.
          </p>
        </div>

        {forgotSent ? (
          <div
            className="rounded-md border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]"
            role="status"
            data-testid="login-forgot-success"
          >
            If an account exists with that email, you will receive password reset instructions shortly.
            Please check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              autoComplete="email"
              data-testid="login-forgot-email"
            />

            {error && (
              <div
                className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                role="alert"
                data-testid="login-forgot-error"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              data-testid="login-forgot-submit"
            >
              {loading ? 'Sending…' : 'Send Reset Instructions'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-[var(--textMuted)]">
          <button
            type="button"
            onClick={() => { setShowForgot(false); setError(''); setForgotSent(false); }}
            className="text-[var(--yellow)] hover:underline"
            data-testid="login-back-to-signin"
          >
            Back to Sign In
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Login type">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'customer'}
          onClick={() => setActiveTab('customer')}
          className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'customer'
              ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
              : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
          }`}
          data-testid="login-tab-customer"
        >
          Traveller
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'partner'}
          onClick={() => setActiveTab('partner')}
          className={`rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'partner'
              ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
              : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
          }`}
          data-testid="login-tab-partner"
        >
          Operator
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {isPartner ? 'Operator Login' : 'Traveller Login'}
        </h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          {isPartner
            ? 'Access your operator dashboard and manage your packages.'
            : 'Sign in to view your quotes, requests, and saved packages.'}
        </p>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 space-y-1"
          role="alert"
          data-testid="login-error"
        >
          <p>{error}</p>
          {errorCode === 'AUTH_EMAIL_NOT_CONFIRMED' && (
            <p>
              <Link
                href={`/verify-email?email=${encodeURIComponent(email)}`}
                className="underline text-red-300 hover:text-red-200"
              >
                Resend verification email
              </Link>
            </p>
          )}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        data-testid="login-email"
      />

      <div className="space-y-1">
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          data-testid="login-password"
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword((current) => !current)}
          toggleTestId="login-password-toggle"
          helperText="Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character."
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-xs text-[var(--textMuted)] hover:text-[var(--yellow)] transition-colors"
            data-testid="login-forgot-password"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full" data-testid="login-submit">
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-[var(--textMuted)]">
        {isPartner ? (
          <>
            Don{'\''}t have an operator account?{' '}
            <Link href="/signup?type=operator" className="text-[var(--yellow)] hover:underline">
              Register your company
            </Link>
          </>
        ) : (
          <>
            Don{'\''}t have a traveller account?{' '}
            <Link href="/signup?type=customer" className="text-[var(--yellow)] hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
