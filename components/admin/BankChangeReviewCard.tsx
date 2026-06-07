'use client';

import { useState, useCallback } from 'react';
import { BankChangeRequest, PaymentDetails } from '@/lib/types';
import { Repository } from '@/lib/api/repository';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  Dialog,
  DialogClose,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';
import { AuditLogView } from './AuditLogView';
import { MockDB } from '@/lib/api/mock-db';

const ADMIN_ID = 'admin1';
const adminCtx = { userId: ADMIN_ID, role: 'admin' as const };

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface BankChangeReviewCardProps {
  request: BankChangeRequest;
  currentPaymentDetails?: PaymentDetails;
  auditEntries: import('@/lib/types').AuditLogEntry[];
  onAction: () => void;
}

export function BankChangeReviewCard({
  request,
  currentPaymentDetails,
  auditEntries,
  onAction,
}: BankChangeReviewCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const coolingEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const handleApprove = useCallback(async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await Repository.approveBankChangeRequest(adminCtx, request.id, undefined);
      setShowApproveDialog(false);
      onAction();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setSubmitting(false);
    }
  }, [request.id, onAction]);

  const handleReject = useCallback(async () => {
    setRejectError('');
    if (!rejectReason || rejectReason.trim().length < 10) {
      setRejectError('Reason must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await Repository.rejectBankChangeRequest(adminCtx, request.id, rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
      onAction();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setSubmitting(false);
    }
  }, [request.id, rejectReason, onAction]);

  const operator = MockDB.getOperators().find((o) => o.id === request.operatorId);

  return (
    <div className="space-y-6" data-testid="bank-change-review-card">
      {errorMsg && (
        <div role="alert" className="rounded-md border border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-[var(--textMuted)]">
          Operator: <strong className="text-[var(--text)]">{operator?.companyName ?? request.operatorId}</strong>
        </p>
        <p className="text-sm text-[var(--textMuted)]">
          Submitted: <strong className="text-[var(--text)]">{formatDateTime(request.requestedAt)}</strong>
        </p>
        <p className="text-sm text-[var(--textMuted)]">
          Status: <Badge variant="warning">Pending review</Badge>
        </p>
        {request.reason && (
          <p className="text-sm text-[var(--textMuted)]">
            Reason for change: <span className="text-[var(--text)]">{request.reason}</span>
          </p>
        )}
      </div>

      {/* BEFORE / AFTER COMPARISON TABLE */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--text)]">Bank details comparison</h3>
        <div className="overflow-x-auto rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)]">
          <table className="w-full min-w-[480px] border-collapse" data-testid="change-request-before-after">
            <thead>
              <tr>
                <th scope="col" className="border-b border-[var(--borderSubtle)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)]">
                  Field
                </th>
                <th scope="col" className="border-b border-[var(--borderSubtle)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)]">
                  Before
                </th>
                <th scope="col" className="border-b border-[var(--borderSubtle)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)]">
                  After
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Account holder', before: currentPaymentDetails?.accountHolderName, after: request.proposedDetails.accountHolderName },
                { label: 'Bank name', before: currentPaymentDetails?.bankName, after: request.proposedDetails.bankName },
                { label: 'Sort code', before: currentPaymentDetails?.sortCode, after: request.proposedDetails.sortCode },
                { label: 'Account number', before: currentPaymentDetails?.accountNumber ? `****${currentPaymentDetails.accountNumber.slice(-4)}` : undefined, after: `****${request.proposedDetails.accountNumber.slice(-4)}` },
                { label: 'Currency', before: currentPaymentDetails?.currency, after: request.proposedDetails.currency },
                { label: 'Country', before: currentPaymentDetails?.country, after: request.proposedDetails.country },
              ].map((row) => (
                <tr key={row.label} data-testid={row.before !== row.after ? 'field-changed' : 'field-unchanged'}>
                  <td className="border-b border-[var(--borderSubtle)] px-4 py-3 text-sm text-[var(--text)]">{row.label}</td>
                  <td className="border-b border-[var(--borderSubtle)] px-4 py-3 text-sm text-[var(--textMuted)]" data-testid="change-request-before">
                    {row.before ?? 'Not set'}
                  </td>
                  <td className="border-b border-[var(--borderSubtle)] px-4 py-3 text-sm text-[var(--text)]" data-testid="change-request-after">
                    {row.after ?? 'Not set'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() => { setErrorMsg(''); setShowApproveDialog(true); }}
          aria-label="Approve bank change request"
          data-testid="approve-btn"
        >
          Approve
        </Button>
        <Button
          variant="danger"
          onClick={() => { setErrorMsg(''); setShowRejectDialog(true); }}
          aria-label="Reject bank change request"
          data-testid="reject-btn"
        >
          Reject
        </Button>
      </div>

      {/* APPROVE CONFIRMATION DIALOG */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <OverlayContent>
          <OverlayHeader>
            <OverlayTitle>Confirm approval</OverlayTitle>
          </OverlayHeader>
          <p className="text-sm text-[var(--text)]">
            This change request will be approved. The new bank details will take effect after the cooling period.
          </p>
          <p className="text-sm text-[var(--textMuted)]">
            New details will be eligible for activation on{' '}
            <strong className="text-[var(--text)]">{formatDateTime(coolingEndsAt)}</strong>.
          </p>
          {errorMsg && (
            <div role="alert" className="rounded-md border border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.08)] px-4 py-2 text-sm text-[var(--danger)]">
              {errorMsg}
            </div>
          )}
          <OverlayFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={submitting}
              disabled={submitting}
              aria-label="Confirm approve bank change request"
            >
              Confirm approve
            </Button>
          </OverlayFooter>
        </OverlayContent>
      </Dialog>

      {/* REJECT DIALOG */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <OverlayContent>
          <OverlayHeader>
            <OverlayTitle>Reject bank change request</OverlayTitle>
          </OverlayHeader>
          <Textarea
            label="Review reason"
            placeholder="Explain why this request is being rejected (min 10 characters)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            aria-required="true"
            errorMessage={rejectError}
            hasError={Boolean(rejectError)}
            rows={4}
            data-testid="review-reason"
          />
          {errorMsg && (
            <div role="alert" className="rounded-md border border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.08)] px-4 py-2 text-sm text-[var(--danger)]">
              {errorMsg}
            </div>
          )}
          <OverlayFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" onClick={() => { setRejectReason(''); setRejectError(''); }}>Cancel</Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={submitting}
              disabled={submitting}
              aria-label="Confirm reject bank change request"
            >
              Confirm reject
            </Button>
          </OverlayFooter>
        </OverlayContent>
      </Dialog>

      {/* AUDIT LOG SECTION */}
      <div className="space-y-2 pt-4 border-t border-[var(--borderSubtle)]">
        <h3 className="text-sm font-semibold text-[var(--text)]">Audit log</h3>
        <AuditLogView entries={auditEntries.filter((e) => e.operatorId === request.operatorId)} />
      </div>
    </div>
  );
}