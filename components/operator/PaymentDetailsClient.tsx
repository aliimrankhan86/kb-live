'use client';

import { useCallback, useEffect, useState } from 'react';
import { Repository } from '@/lib/api/repository';
import type { AuditLogEntry, BankChangeRequest, PaymentDetails, PaymentDetailsInput } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  OverlayContent,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';
import { BankDetailsForm } from '@/components/operator/BankDetailsForm';
import { PhoneOtpModal } from '@/components/operator/PhoneOtpModal';
import { AuditLogView } from '@/components/admin/AuditLogView';
import { MockDB } from '@/lib/api/mock-db';

type PageState =
  | 'loading'
  | 'empty'
  | 'show_form'
  | 'active'
  | 'pending_change'
  | 'cooling'
  | 'change_rejected';

interface PageData {
  activeDetails: PaymentDetails | null;
  pendingRequest: BankChangeRequest | null;
  rejectedRequest: BankChangeRequest | null;
}

const maskedSort = (sortCode: string) => `${sortCode.slice(0, 3)}**-**`;
const maskedAccount = (acct: string) => `****${acct.slice(-4)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function PaymentDetailsClient({ operatorId }: { operatorId: string }) {
  const operatorCtx = { userId: operatorId, role: 'operator' as const };

  const loadData = (): PageData => {
    const allDetails = MockDB.getPaymentDetails();
    const activeDetails = allDetails.find(
      (d) => d.operatorId === operatorId && d.status === 'active'
    ) ?? null;

    const allRequests = MockDB.getBankChangeRequests().filter(
      (r) => r.operatorId === operatorId
    );
    const pendingRequest =
      allRequests.find((r) => r.status === 'pending_review' || r.status === 'approved') ?? null;
    const rejectedRequest =
      !pendingRequest
        ? [...allRequests].sort(
            (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
          ).find((r) => r.status === 'rejected') ?? null
        : null;

    return { activeDetails, pendingRequest, rejectedRequest };
  };

  const deriveState = (data: PageData): PageState => {
    if (!data.activeDetails) return 'empty';
    if (!data.pendingRequest && !data.rejectedRequest) return 'active';
    if (data.pendingRequest?.status === 'approved') return 'cooling';
    if (data.pendingRequest?.status === 'pending_review') return 'pending_change';
    if (data.rejectedRequest) return 'change_rejected';
    return 'active';
  };

  const [data, setData] = useState<PageData>({ activeDetails: null, pendingRequest: null, rejectedRequest: null });
  const [pageState, setPageState] = useState<PageState>('loading');
  const [showChangeOverlay, setShowChangeOverlay] = useState(false);
  const [pendingFormDetails, setPendingFormDetails] = useState<PaymentDetailsInput | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [isOtpForChange, setIsOtpForChange] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);

  const refresh = useCallback(() => {
    const next = loadData();
    setData(next);
    setPageState(deriveState(next));
    Repository.getOperatorAuditLog(operatorCtx, operatorId).then(setAuditEntries);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearMessages = () => { setSuccessMsg(''); setErrorMsg(''); };

  const handleAddFormSubmit = (details: PaymentDetailsInput) => {
    setPendingFormDetails(details);
    setIsOtpForChange(false);
    setShowOtp(true);
  };

  const handleChangeFormSubmit = (details: PaymentDetailsInput) => {
    setPendingFormDetails(details);
    setIsOtpForChange(true);
    setShowOtp(true);
  };

  const handleOtpConfirm = async (phoneLastFour: string) => {
    if (!pendingFormDetails) return;
    setSubmitting(true);
    clearMessages();
    try {
      if (isOtpForChange) {
        await Repository.createBankChangeRequest(operatorCtx, {
          operatorId,
          proposedDetails: pendingFormDetails,
          phoneConfirmation: { confirmed: true, phoneLastFour },
        });
        setShowChangeOverlay(false);
        setSuccessMsg('Change request submitted. It will be reviewed by our team.');
      } else {
        await Repository.createPaymentDetails(operatorCtx, {
          operatorId,
          details: pendingFormDetails,
          phoneConfirmation: { confirmed: true, phoneLastFour },
        });
        setSuccessMsg('Payment details saved successfully.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setShowOtp(false);
      setPendingFormDetails(null);
      refresh();
    }
  };

  const handleCancel = async () => {
    const req = data.pendingRequest;
    if (!req || req.status !== 'pending_review') return;
    setSubmitting(true);
    clearMessages();
    try {
      await Repository.cancelBankChangeRequest(operatorCtx, req.id);
      setSuccessMsg('Change request cancelled.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to cancel. Please try again.');
    } finally {
      setSubmitting(false);
      refresh();
    }
  };

  if (pageState === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-label="Loading payment details" className="text-center py-12 text-[var(--textMuted)]">
        Loading…
      </div>
    );
  }

  const { activeDetails, pendingRequest, rejectedRequest } = data;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Payment details</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Bank details used to generate payment instructions for customers with a confirmed booking
          intent. Shown in-app only — never by email.
        </p>
      </div>

      {successMsg && (
        <div role="status" aria-live="polite" className="rounded-md border border-[var(--success)]/60 bg-[color:rgba(34,197,94,0.08)] px-4 py-3 text-sm text-[var(--success)]">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="rounded-md border border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {errorMsg}
        </div>
      )}

      {/* EMPTY STATE */}
      {(pageState === 'empty' || pageState === 'show_form') && (
        <div className="space-y-5">
          {pageState === 'empty' ? (
            <div className="rounded-lg border border-dashed border-[var(--borderSubtle)] p-8 text-center space-y-3">
              <p className="text-[var(--textMuted)] text-sm">No payment details on record.</p>
              <p className="text-xs text-[var(--textMuted)]">
                Add your bank details so customers can pay you directly after confirming a booking intent.
              </p>
              <Button
                variant="secondary"
                onClick={() => { clearMessages(); setPageState('show_form'); }}
                data-testid="add-payment-details-btn"
              >
                Add payment details
              </Button>
            </div>
          ) : (
            <BankDetailsForm
              onSubmit={handleAddFormSubmit}
              isSubmitting={submitting}
              submitLabel="Continue to confirm"
            />
          )}
        </div>
      )}

      {/* ACTIVE DETAILS */}
      {(pageState === 'active' || pageState === 'change_rejected') && activeDetails && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--textMuted)]">Active payment details</p>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[var(--text)]">{activeDetails.accountHolderName}</p>
              <p className="text-[var(--textMuted)]">{activeDetails.bankName}</p>
              <p className="font-mono text-[var(--textMuted)]">
                Sort code: {maskedSort(activeDetails.sortCode)}&ensp;
                Account: {maskedAccount(activeDetails.accountNumber)}
              </p>
              <p className="text-xs text-[var(--textMuted)]">Active since {formatDate(activeDetails.activatedAt ?? activeDetails.createdAt)}</p>
            </div>
          </div>

          {pageState === 'change_rejected' && rejectedRequest && (
            <div role="alert" className="rounded-md border border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.08)] p-4 text-sm space-y-1">
              <p className="font-medium text-[var(--danger)]">Previous change request rejected</p>
              {rejectedRequest.reviewNotes && (
                <p className="text-[var(--textMuted)]">{rejectedRequest.reviewNotes}</p>
              )}
              <p className="text-xs text-[var(--textMuted)]">Rejected on {formatDate(rejectedRequest.reviewedAt ?? rejectedRequest.requestedAt)}</p>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => { clearMessages(); setShowChangeOverlay(true); }}
            data-testid="request-change-btn"
          >
            Request change
          </Button>
        </div>
      )}

      {/* PENDING REVIEW */}
      {pageState === 'pending_change' && activeDetails && pendingRequest && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--textMuted)]">Current payment details</p>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[var(--text)]">{activeDetails.accountHolderName}</p>
              <p className="text-[var(--textMuted)]">{activeDetails.bankName}</p>
              <p className="font-mono text-[var(--textMuted)]">
                Sort code: {maskedSort(activeDetails.sortCode)}&ensp;
                Account: {maskedAccount(activeDetails.accountNumber)}
              </p>
            </div>
          </div>

          <div role="status" aria-live="polite" className="rounded-md border border-[var(--warning)]/60 bg-[color:rgba(245,158,11,0.08)] p-4 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning">Under review</Badge>
            </div>
            <p className="text-[var(--text)] mt-2">
              Change request submitted on {formatDate(pendingRequest.requestedAt)}. Under review by our team.
            </p>
            <p className="text-xs text-[var(--textMuted)]">Your current details remain active until the change is approved and the cooling period elapses.</p>
          </div>

          <Button
            variant="danger"
            onClick={handleCancel}
            loading={submitting}
            disabled={submitting}
            data-testid="cancel-request-btn"
          >
            Cancel change request
          </Button>
        </div>
      )}

      {/* COOLING PERIOD */}
      {pageState === 'cooling' && activeDetails && pendingRequest && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.03)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--textMuted)]">Current payment details</p>
              <Badge variant="default">Active until change takes effect</Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[var(--text)]">{activeDetails.accountHolderName}</p>
              <p className="font-mono text-[var(--textMuted)]">
                Sort code: {maskedSort(activeDetails.sortCode)}&ensp;
                Account: {maskedAccount(activeDetails.accountNumber)}
              </p>
            </div>
          </div>

          <div role="status" aria-live="polite" className="rounded-md border border-[var(--info)]/60 bg-[color:rgba(56,189,248,0.08)] p-4 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="info">Approved — cooling period</Badge>
            </div>
            {pendingRequest.activationEligibleAt && (
              <p className="text-[var(--text)] mt-2">
                New details approved. They take effect on{' '}
                <strong>{formatDate(pendingRequest.activationEligibleAt)}</strong>.
              </p>
            )}
            <p className="text-xs text-[var(--textMuted)]">
              Your current details remain active until then. Customers with active booking intents
              will see a notification that details were recently updated.
            </p>
          </div>
        </div>
      )}

      {/* CHANGE REQUEST OVERLAY */}
      <Dialog open={showChangeOverlay} onOpenChange={setShowChangeOverlay}>
        <OverlayContent>
          <OverlayHeader>
            <OverlayTitle>Request bank details change</OverlayTitle>
          </OverlayHeader>
          <p className="text-sm text-[var(--textMuted)]">
            Your request will be reviewed before taking effect. After approval, a cooling period
            applies before the new details go live.
          </p>
          <BankDetailsForm
            onSubmit={handleChangeFormSubmit}
            isSubmitting={submitting}
            submitLabel="Continue to confirm"
            currentDetails={activeDetails}
          />
          <OverlayFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
          </OverlayFooter>
        </OverlayContent>
      </Dialog>

      {/* AUDIT LOG SECTION */}
      <div className="space-y-2 pt-6 border-t border-[var(--borderSubtle)]" data-testid="operator-audit-log">
        <h3 className="text-sm font-semibold text-[var(--text)]">Bank details activity</h3>
        <p className="text-xs text-[var(--textMuted)]">Recent changes and reviews for your account.</p>
        <AuditLogView entries={auditEntries} maxEntries={5} />
      </div>

      {/* PHONE OTP MODAL */}
      <PhoneOtpModal
        open={showOtp}
        onOpenChange={(open) => {
          if (!open) { setPendingFormDetails(null); }
          setShowOtp(open);
        }}
        onConfirm={handleOtpConfirm}
        isSubmitting={submitting}
      />
    </div>
  );
}
