'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'

export default function HajjPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dedupe-key': crypto.randomUUID(),
        },
        body: JSON.stringify({ email: email.trim(), type: 'hajj' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setMessage('Thank you! We will notify you when Hajj packages are available.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Unable to submit right now. Please check your connection and try again.')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--yellow)]/10 border border-[var(--yellow)]/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--yellow)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--yellow)]"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--yellow)]">
              Coming Soon
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4 leading-tight">
            Hajj Packages for 2027
          </h1>
          <p className="text-[var(--textMuted)] text-lg mb-8 leading-relaxed">
            We are working with verified operators to bring you the best Hajj packages for the 2027 season. Register your interest and be the first to know when packages are available.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-xl bg-[var(--surfaceDark)] border border-[var(--border)]">
              <div className="text-[var(--yellow)] mb-2">
                <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Verified Operators</h3>
              <p className="text-xs text-[var(--textMuted)]">All operators ATOL/ABTA checked</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surfaceDark)] border border-[var(--border)]">
              <div className="text-[var(--yellow)] mb-2">
                <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Compare Prices</h3>
              <p className="text-xs text-[var(--textMuted)]">Side-by-side package comparison</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surfaceDark)] border border-[var(--border)]">
              <div className="text-[var(--yellow)] mb-2">
                <svg className="w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Early Access</h3>
              <p className="text-xs text-[var(--textMuted)]">Be notified first when live</p>
            </div>
          </div>

          {/* Interest form */}
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
              className={`text-sm mb-6 ${status === 'error' ? 'text-[var(--danger)]' : 'text-green-400'}`}
              data-testid="hajj-form-message"
            >
              {message}
            </p>
          )}

          <p className="text-xs text-[var(--textMuted)] mb-10">
            We will only email you when Hajj packages are available. No spam.
          </p>

          {/* Back to Umrah CTA */}
          <div className="pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--textMuted)] mb-3">
              Looking for Umrah packages?
            </p>
            <Link
              href="/umrah"
              className="inline-flex items-center gap-2 text-[var(--yellow)] font-medium hover:underline"
              aria-label="Browse available Umrah packages"
            >
              Find Umrah Packages
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}