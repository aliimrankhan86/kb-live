'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { passwordSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/auth/PasswordInput';

type Status = 'checking' | 'no-session' | 'ready' | 'saving' | 'done';

/**
 * Last step of password reset. The emailed link signs the person in through
 * /auth/confirm; here they choose a new password for that session.
 */
export function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setStatus('no-session');
      return;
    }
    supabase.auth.getUser().then(({ data }) => setStatus(data.user ? 'ready' : 'no-session'));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Choose a stronger password.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setStatus('saving');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus('ready');
      return;
    }
    setStatus('done');
  };

  if (status === 'checking') {
    return <p className="text-sm text-[var(--textMuted)]" data-testid="reset-checking">Checking your reset link…</p>;
  }

  if (status === 'no-session') {
    return (
      <div className="space-y-3" data-testid="reset-no-session">
        <h1 className="text-2xl font-semibold text-[var(--text)]">This reset link has expired</h1>
        <p className="text-sm text-[var(--textMuted)]">
          The link may have been used already, or opened in a different browser from the one you
          requested it in. Request a new link and open it in this browser.
        </p>
        <Link href="/login?forgot=1" className="text-sm font-medium text-[var(--yellow)] underline underline-offset-2">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="space-y-3" role="status" data-testid="reset-done">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Password updated</h1>
        <p className="text-sm text-[var(--textMuted)]">You are signed in with your new password.</p>
        <Link href="/" className="text-sm font-medium text-[var(--yellow)] underline underline-offset-2">
          Go to the homepage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate data-testid="reset-form">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Set a new password</h1>
      <PasswordInput
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        helperText="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol."
        showPassword={show}
        onToggleShowPassword={() => setShow((v) => !v)}
        toggleTestId="reset-password-toggle"
        data-testid="reset-password"
      />
      <PasswordInput
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        showPassword={show}
        onToggleShowPassword={() => setShow((v) => !v)}
        toggleTestId="reset-confirm-toggle"
        data-testid="reset-confirm"
      />
      {error && (
        <p role="alert" className="text-sm text-[var(--danger)]" data-testid="reset-error">
          {error}
        </p>
      )}
      <Button type="submit" disabled={status === 'saving'} data-testid="reset-submit" className="w-full">
        {status === 'saving' ? 'Saving…' : 'Save new password'}
      </Button>
    </form>
  );
}
