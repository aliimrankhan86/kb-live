'use client';

import { useState } from 'react';

export function HajjInterestForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), type: 'hajj' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setMessage('Thank you! We will notify you when Hajj packages are available.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Unable to submit right now. Please check your connection and try again.');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 mb-6"
        aria-label="Register interest for Hajj packages"
        noValidate
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email address"
          className="flex-1 px-4 py-3 rounded-lg bg-[var(--surfaceDark)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--textMuted)] focus:outline-none focus:border-[var(--yellow)] transition-colors"
          aria-label="Email address for notifications"
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' || status === 'success' ? 'hajj-form-status' : undefined}
          data-testid="hajj-email-input"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 rounded-lg bg-[var(--yellow)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Register interest for Hajj packages"
          data-testid="hajj-submit-btn"
        >
          {status === 'loading' ? 'Registering...' : 'Notify Me'}
        </button>
      </form>

      {message && (
        <p
          id="hajj-form-status"
          role={status === 'error' ? 'alert' : 'status'}
          className={`text-sm mb-6 ${status === 'error' ? 'text-[var(--danger)]' : 'text-[var(--color-success)]'}`}
          data-testid="hajj-form-message"
        >
          {message}
        </p>
      )}

      <p className="text-xs text-[var(--textMuted)] mb-10">
        We will only email you when Hajj packages are available. No spam.
      </p>
    </>
  );
}
