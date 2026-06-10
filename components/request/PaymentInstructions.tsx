'use client';

import React, { useState, useEffect } from 'react';
import type { BookingIntent, PaymentInstructions } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

const PAY_OPERATOR_DIRECT_DISCLOSURE =
  'You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.';

interface PaymentInstructionsProps {
  bookingIntent: BookingIntent;
}

export function PaymentInstructions({ bookingIntent }: PaymentInstructionsProps) {
  const [result, setResult] = useState<{ type: 'loading' } | { type: 'success'; instructions: PaymentInstructions } | { type: 'holding'; message: string }>({ type: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/booking-intents/${bookingIntent.id}/payment-instructions`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body.error ?? 'Payment instructions are unavailable');
        }
        return res.json() as Promise<{ instructions: PaymentInstructions }>;
      })
      .then(({ instructions }) => {
        if (!cancelled) setResult({ type: 'success', instructions });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            type: 'holding',
            message: err instanceof Error ? err.message : 'Payment instructions are unavailable',
          });
        }
      });
    return () => { cancelled = true; };
  }, [bookingIntent.id]);

  if (result.type === 'loading') {
    return (
      <div
        className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4 text-sm"
        data-testid="payment-instructions"
      >
        <p className="font-medium text-[var(--text)]">Payment instructions</p>
        <p className="mt-1 text-[var(--textMuted)]">Loading payment details…</p>
      </div>
    );
  }

  if (result.type === 'holding') {
    return (
      <div
        className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4 text-sm"
        data-testid="payment-instructions"
      >
        <p className="font-medium text-[var(--text)]">Payment instructions</p>
        <p className="mt-1 text-[var(--textMuted)]">
          {result.message === 'Operator is not eligible to receive bookings'
            ? 'This operator is not yet verified for direct payments. Please contact the operator directly to arrange payment.'
            : result.message === 'Unauthorized'
              ? 'Payment instructions are only available to the booking party.'
              : 'Payment instructions are being prepared. Check back shortly.'}
        </p>
      </div>
    );
  }

  const { instructions } = result;

  return (
    <div
      className="space-y-4 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.04)] p-4"
      data-testid="payment-instructions"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--text)]">Pay {instructions.operatorName}</p>
          <Badge variant="success">Verified</Badge>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--textMuted)]">Account holder</dt>
            <dd className="font-medium text-[var(--text)]" data-testid="bank-account-holder">
              {instructions.accountHolderName || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--textMuted)]">Bank name</dt>
            <dd className="font-medium text-[var(--text)]" data-testid="bank-bank-name">
              {instructions.bankName || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--textMuted)]">Sort code</dt>
            <dd className="font-mono font-medium text-[var(--text)]" data-testid="bank-sort-code">
              {instructions.sortCode || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--textMuted)]">Account number</dt>
            <dd className="font-mono font-medium text-[var(--text)]" data-testid="bank-account-number">
              {instructions.accountNumber || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--textMuted)]">Currency</dt>
            <dd className="font-medium text-[var(--text)]">{instructions.currency}</dd>
          </div>
          <div>
            <dt className="text-[var(--textMuted)]">Reference</dt>
            <dd className="font-mono font-medium text-[var(--yellow)]">{bookingIntent.referenceCode}</dd>
          </div>
        </dl>
      </div>

      <div
        className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,211,29,0.06)] p-3 text-sm"
        data-testid="payment-disclaimer"
      >
        <p className="font-medium text-[var(--text)]">Important — Use your reference</p>
        <p className="mt-1 leading-relaxed text-[var(--textMuted)]">{PAY_OPERATOR_DIRECT_DISCLOSURE}</p>
        <div className="mt-2 rounded-md border border-[var(--yellow)]/30 bg-[var(--surfaceDark)] p-2">
          <p className="text-xs text-[var(--text)]">
            <strong>Reference code:</strong>{' '}
            <span className="font-mono text-[var(--yellow)]">{bookingIntent.referenceCode}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--textMuted)]">
            You must provide this reference when making payment. Without it, we cannot verify
            that your booking originated through KaabaTrip and will be unable to assist with
            any disputes or complaints.
          </p>
        </div>
      </div>
    </div>
  );
}