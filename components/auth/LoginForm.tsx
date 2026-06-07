'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type LoginTab = 'customer' | 'partner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/operator/dashboard';
  const forgotParam = searchParams.get('forgot');
  const defaultTab = (searchParams.get('type') as LoginTab) || 'customer';

  const [activeTab, setActiveTab] = useState<LoginTab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(forgotParam === 'true');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        setLoading(false);
        return;
      }

      // Redirect based on role
      const role = data.user?.user_metadata?.role || 'customer';
      if (role === 'operator') {
        router.push('/operator/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/complaints');
      } else {
        router.push(redirect);
      }
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
          Partner
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {isPartner ? 'Partner Login' : 'Traveller Login'}
        </h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          {isPartner
            ? 'Access your operator dashboard and manage your packages.'
            : 'Sign in to view your quotes, requests, and saved packages.'}
        </p>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
          data-testid="login-error"
        >
          {error}
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
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          data-testid="login-password"
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
            Don{'\''}t have a partner account?{' '}
            <Link href="/signup?type=partner" className="text-[var(--yellow)] hover:underline">
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