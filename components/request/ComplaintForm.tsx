'use client';

import React, { useState } from 'react';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { BookingIntent, ComplaintCategory, ComplaintSeverity } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const customerCtx = { userId: 'cust1', role: 'customer' as const };

const CATEGORY_OPTIONS: { label: string; value: ComplaintCategory }[] = [
  { label: 'Payment issue', value: 'payment_issue' },
  { label: 'Service quality', value: 'service_quality' },
  { label: 'Package description', value: 'package_description' },
  { label: 'Booking problem', value: 'booking_problem' },
  { label: 'Other', value: 'other' },
];

const SEVERITY_OPTIONS: { label: string; value: ComplaintSeverity }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

interface ComplaintFormProps {
  bookingIntent: BookingIntent;
}

export function ComplaintForm({ bookingIntent }: ComplaintFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>('booking_problem');
  const [severity, setSeverity] = useState<ComplaintSeverity>('medium');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = description.trim();
    if (trimmed.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      MockDB.setCurrentUser('customer');
      Repository.createComplaint(customerCtx, {
        bookingIntentId: bookingIntent.id,
        category,
        severity,
        description: trimmed,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="space-y-3 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4"
        data-testid="complaint-confirmation"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--success)]"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="font-medium text-[var(--text)]">Complaint submitted</p>
        </div>
        <p className="text-sm text-[var(--textMuted)]">
          Reference: <span className="font-mono font-medium text-[var(--yellow)]">{bookingIntent.referenceCode}</span>
        </p>
        <p className="text-sm text-[var(--textMuted)]">
          We have logged your issue and notified the operator. You should contact the operator directly for a
          first response, as your contract is with them.
        </p>
        <p className="text-sm text-[var(--textMuted)]">
          KaabaTrip logs and routes issues and may take action on operator status. We are not a dispute
          adjudicator.
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div
        className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4"
        data-testid="complaint-section"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--text)]">Report an issue</p>
            <p className="text-xs text-[var(--textMuted)]">
              Something not right? Let us and the operator know.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(true)}
            data-testid="report-issue-btn"
          >
            Report issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4"
      data-testid="complaint-form"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--text)]">Report an issue</p>
        <p className="text-xs text-[var(--textMuted)]">
          Reference: <span className="font-mono text-[var(--yellow)]">{bookingIntent.referenceCode}</span>
        </p>
      </div>

      <div
        className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,211,29,0.06)] p-3 text-xs leading-relaxed text-[var(--textMuted)]"
        role="note"
      >
        <p className="font-medium text-[var(--text)]">Before you submit</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>You pay the operator directly. KaabaTrip does not hold funds.</li>
          <li>Your contract and refund rights are with the operator.</li>
          <li>
            KaabaTrip logs and routes issues and may take action on operator status. We are not a dispute
            adjudicator in MVP.
          </li>
        </ul>
      </div>

      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
        required
        data-testid="complaint-category"
      />

      <Select
        label="Severity"
        options={SEVERITY_OPTIONS}
        value={severity}
        onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}
        required
        data-testid="complaint-severity"
      />

      <Textarea
        label="Describe the issue"
        helperText="Be specific. Include dates, names, and what you expected to happen."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        minLength={10}
        rows={4}
        data-testid="complaint-description"
      />

      {error && (
        <p role="alert" className="text-sm text-[var(--danger)]" data-testid="complaint-error">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={submitting}
          disabled={submitting}
          data-testid="complaint-submit"
        >
          Submit complaint
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          disabled={submitting}
          data-testid="complaint-cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}