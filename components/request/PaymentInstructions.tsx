'use client';

import React, { useMemo } from 'react';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { BookingIntent } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

const customerCtx = { userId: 'cust1', role: 'customer' as const };

const PAY_OPERATOR_DIRECT_DISCLOSURE =
  'You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.';

const RECENTLY_UPDATED_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const isRecentlyUpdated = (operatorId: string): boolean => {
  const now = Date.now();
  const entries = MockDB.getAuditLog();
  return entries.some(
    (entry) =>
      entry.operatorId === operatorId &&
      (entry.action === 'bank_change.activated' || entry.action === 'bank_change.approved') &&
      new Date(entry.createdAt).getTime() > now - RECENTLY_UPDATED_WINDOW_MS
  );
};

interface PaymentInstructionsProps {
  bookingIntent: BookingIntent;
}

export function PaymentInstructions({ bookingIntent }: PaymentInstructionsProps) {
  const result = useMemo(() => {
    try {
      const instructions = Repository.getPaymentInstructions(customerCtx, bookingIntent.id);
      return { type: 'success' as const, instructions };
    } catch (err) {
      return {
        type: 'holding' as const,
        message: err instanceof Error ? err.message : 'Payment instructions are unavailable',
      };
    }
  }, [bookingIntent.id]);

  const recentlyUpdated = useMemo(
    () => (result.type === 'success' ? isRecentlyUpdated(result.instructions.operatorId) : false),
    [result]
  );

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
      {recentlyUpdated && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-[var(--warning)]/60 bg-[color:rgba(245,158,11,0.08)] px-3 py-2 text-sm"
          data-testid="recently-updated-warning"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-[var(--text)]">
            Bank details were recently updated. Please double-check the information before transferring.
          </span>
        </div>
      )}

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