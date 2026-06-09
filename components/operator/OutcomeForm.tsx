'use client';

import { useState } from 'react';
import { BookingOutcome, BookingOutcomeType } from '@/lib/types';

const OUTCOME_OPTIONS: { value: BookingOutcomeType; label: string }[] = [
  { value: 'travelled', label: 'Travelled' },
  { value: 'cancelled_operator', label: 'Cancelled by operator' },
  { value: 'cancelled_customer', label: 'Cancelled by customer' },
  { value: 'no_show', label: 'No show' },
  { value: 'disputed', label: 'Disputed' },
];

interface OutcomeFormProps {
  bookingIntentId: string;
  existingOutcome?: BookingOutcome;
  onSuccess?: (outcome: BookingOutcome) => void;
}

export function OutcomeForm({ bookingIntentId, existingOutcome, onSuccess }: OutcomeFormProps) {
  const [outcome, setOutcome] = useState<BookingOutcomeType>(existingOutcome?.outcome ?? 'travelled');
  const [notes, setNotes] = useState(existingOutcome?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existingOutcome) {
    const label = OUTCOME_OPTIONS.find((o) => o.value === existingOutcome.outcome)?.label ?? existingOutcome.outcome;
    return (
      <div
        className="rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4"
        data-testid="outcome-reported"
      >
        <p className="text-sm font-medium text-[var(--text)]">
          Outcome reported:{' '}
          <span className="text-[var(--yellow)]">{label}</span>
        </p>
        {existingOutcome.notes && (
          <p className="mt-1 text-sm text-[var(--textMuted)]">{existingOutcome.notes}</p>
        )}
        <p className="mt-1 text-xs text-[var(--textMuted)]">
          Reported {new Date(existingOutcome.reportedAt).toLocaleDateString('en-GB')}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/operator/booking-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIntentId, outcome, notes: notes.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to report outcome');
      }

      const data = await res.json();
      onSuccess?.(data.outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="outcome-form">
      <div>
        <label
          htmlFor={`outcome-select-${bookingIntentId}`}
          className="block text-sm font-medium text-[var(--text)] mb-1"
        >
          What happened with this booking?
        </label>
        <select
          id={`outcome-select-${bookingIntentId}`}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as BookingOutcomeType)}
          className="w-full rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          data-testid="outcome-select"
        >
          {OUTCOME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`outcome-notes-${bookingIntentId}`}
          className="block text-sm font-medium text-[var(--text)] mb-1"
        >
          Notes <span className="text-[var(--textMuted)] font-normal">(optional)</span>
        </label>
        <textarea
          id={`outcome-notes-${bookingIntentId}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any relevant details..."
          className="w-full rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none resize-none"
          data-testid="outcome-notes"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-md bg-[var(--yellow)] px-4 py-2 text-sm font-medium text-black transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="outcome-submit"
      >
        {submitting ? 'Saving…' : 'Report outcome'}
      </button>
    </form>
  );
}
