'use client'

import Link from 'next/link'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/Button'
import { PAYMENT_POSTURE_LINES } from '@/lib/content-rules'

/**
 * Read-only summary of the package being enquired about. Pulled from the package
 * data on the server — the form must NOT re-ask any of this (trip type, airport,
 * duration, hotel rating, budget). Shown so the pilgrim can confirm what they are
 * enquiring about. "Not provided" for anything the package does not state.
 */
export interface EnquirySummary {
  packageId: string
  packageTitle: string
  operatorName: string
  tripType: string
  departureAirport: string
  duration: string
  hotels: string
  price: string
}

interface EnquiryFormProps {
  summary: EnquirySummary
  packageSlug: string
}

type SubmitState = { status: 'idle' | 'submitting' } | { status: 'error'; message: string }

export function EnquiryForm({ summary, packageSlug }: EnquiryFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [travelMonth, setTravelMonth] = useState('')
  const [message, setMessage] = useState('')
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })
  const [referenceCode, setReferenceCode] = useState<string | null>(null)

  // Client-side mirror of the server rule: name + at least one contact.
  const hasContact = email.trim().length > 0 || phone.trim().length > 0
  const canSubmit = name.trim().length > 0 && hasContact && submit.status !== 'submitting'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      setSubmit({ status: 'error', message: 'Add your name and an email or phone number so the operator can reply.' })
      return
    }
    setSubmit({ status: 'submitting' })
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: summary.packageId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          travelMonth: travelMonth.trim(),
          message: message.trim(),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { referenceCode?: string; error?: string }
      if (!res.ok || !data.referenceCode) {
        setSubmit({ status: 'error', message: data.error ?? 'Something went wrong. Please try again.' })
        return
      }
      setReferenceCode(data.referenceCode)
    } catch {
      setSubmit({ status: 'error', message: 'Network error. Please check your connection and try again.' })
    }
  }

  if (referenceCode) {
    return (
      <section data-testid="enquiry-confirmation" className="w-full max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)]" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[var(--text)]">Enquiry sent</h1>
          <p className="mt-2 text-sm text-[var(--textMuted)]">
            Your enquiry for <span className="font-medium text-[var(--text)]">{summary.packageTitle}</span> has gone to{' '}
            <span className="font-medium text-[var(--text)]">{summary.operatorName}</span>.
          </p>

          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">Your reference code</p>
            <p data-testid="enquiry-reference-code" className="mt-1 text-2xl font-bold tracking-wide text-[var(--yellow)]">
              {referenceCode}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-base font-semibold text-[var(--text)]">What happens next</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--textMuted)]">
            {summary.operatorName} will contact you directly to confirm live price and availability. Keep your reference code handy if you need to follow up.
          </p>
        </div>

        <div data-testid="enquiry-payment-posture" className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--textMuted)]">Before you pay</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--textMuted)]">
            {PAYMENT_POSTURE_LINES.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 text-[var(--yellow)]">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/search/packages" className={buttonVariants({ variant: 'primary', size: 'md' })}>
            Compare more packages
          </Link>
          <Link href={`/packages/${packageSlug}`} className={buttonVariants({ variant: 'secondary', size: 'md' })}>
            Back to this package
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section data-testid="enquiry-form-page" className="w-full max-w-2xl mx-auto px-4 py-8">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Enquire about this package</h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          A few details and the operator gets back to you directly. No account needed.
        </p>
      </header>

      {/* Read-only: what you're enquiring about. The form never re-asks these. */}
      <div data-testid="enquiry-package-summary" className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">You&apos;re enquiring about</p>
        <p className="mt-1 text-base font-semibold text-[var(--text)]">{summary.packageTitle}</p>
        <p className="text-sm text-[var(--textMuted)]">Sold by {summary.operatorName}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <SummaryFact term="Trip" value={summary.tripType} />
          <SummaryFact term="From" value={summary.departureAirport} />
          <SummaryFact term="Duration" value={summary.duration} />
          <SummaryFact term="Hotels" value={summary.hotels} />
          <SummaryFact term="Price" value={summary.price} />
        </dl>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <Field label="Your name" required htmlFor="enquiry-name">
          <input
            id="enquiry-name"
            data-testid="enquiry-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className={inputClass}
          />
        </Field>

        <fieldset className="grid gap-4 rounded-lg border border-[var(--border)] p-4">
          <legend className="px-1 text-xs font-medium uppercase tracking-wide text-[var(--textMuted)]">
            How should the operator reach you? (at least one)
          </legend>
          <Field label="Email" htmlFor="enquiry-email">
            <input
              id="enquiry-email"
              data-testid="enquiry-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              className={inputClass}
            />
          </Field>
          <Field label="Phone" htmlFor="enquiry-phone">
            <input
              id="enquiry-phone"
              data-testid="enquiry-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
            />
          </Field>
        </fieldset>

        <Field label="Travel month (optional)" htmlFor="enquiry-travel-month">
          <input
            id="enquiry-travel-month"
            data-testid="enquiry-travel-month"
            type="text"
            value={travelMonth}
            onChange={(e) => setTravelMonth(e.target.value)}
            placeholder="e.g. March 2026"
            className={inputClass}
          />
        </Field>

        <Field label="Message (optional)" htmlFor="enquiry-message">
          <textarea
            id="enquiry-message"
            data-testid="enquiry-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Anything you'd like the operator to know?"
            className={`${inputClass} resize-y`}
          />
        </Field>

        {/* Task 3: a separate, unticked marketing opt-in goes here. */}

        {submit.status === 'error' && (
          <p data-testid="enquiry-error" role="alert" className="text-sm text-[var(--danger)]">
            {submit.message}
          </p>
        )}

        <button
          type="submit"
          data-testid="enquiry-submit"
          disabled={!canSubmit}
          className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full disabled:opacity-50 disabled:cursor-not-allowed' })}
        >
          {submit.status === 'submitting' ? 'Sending…' : 'Send enquiry'}
        </button>

        <p className="text-center text-xs leading-relaxed text-[var(--textMuted)]">
          {PAYMENT_POSTURE_LINES[0]}
        </p>
      </form>
    </section>
  )
}

const inputClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--yellow)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-1'

function Field({ label, required, htmlFor, children }: { label: string; required?: boolean; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="grid gap-1.5">
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
        {required && <span className="ml-1 text-[var(--danger)]" aria-hidden="true">*</span>}
      </span>
      {children}
    </label>
  )
}

function SummaryFact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--textMuted)]">{term}</dt>
      <dd className="mt-0.5 font-medium text-[var(--text)]">{value}</dd>
    </div>
  )
}
