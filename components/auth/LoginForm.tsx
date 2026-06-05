'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/operator/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Partner Login</h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Access your operator dashboard and manage your packages.
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

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        data-testid="login-password"
      />

      <Button type="submit" disabled={loading} className="w-full" data-testid="login-submit">
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-[var(--textMuted)]">
        Don{'\''}t have a partner account?{' '}
        <Link href="/signup" className="text-[var(--yellow)] hover:underline">
          Register your company
        </Link>
      </p>
    </form>
  );
}