'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { AuditLogEntry, BankChangeRequest, PaymentDetails } from '@/lib/types';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { BankChangeReviewCard } from '@/components/admin/BankChangeReviewCard';

const ADMIN_ID = 'admin1';
const adminCtx = { userId: ADMIN_ID, role: 'admin' as const };

export default function BankChangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<BankChangeRequest | null>(null);
  const [currentDetails, setCurrentDetails] = useState<PaymentDetails | undefined>();
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const allRequests = MockDB.getBankChangeRequests();
    const req = allRequests.find((r) => r.id === id);
    if (!req) {
      setRequest(null);
      setLoading(false);
      return;
    }

    // Lazy activation check (same as repository)
    if (req.status === 'approved' && req.activationEligibleAt && new Date(req.activationEligibleAt) <= new Date()) {
      // Activation would happen in repository; reload after router refresh
    }

    setRequest(req);
    const details = MockDB.getPaymentDetails().find(
      (d) => d.operatorId === req.operatorId && d.status === 'active'
    );
    setCurrentDetails(details);
    setAuditEntries(Repository.getOperatorAuditLog(adminCtx, req.operatorId));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div role="status" aria-busy="true" className="p-8 text-center text-[var(--textMuted)]">
        Loading review…
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <Heading as={1} size="lg">
          Not found
        </Heading>
        <Text tone="muted" size="sm">
          This bank change request does not exist or has already been reviewed.
        </Text>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/bank-changes')}
          className="text-sm text-[var(--textMuted)] hover:text-[var(--text)]"
        >
          ← Back to queue
        </button>
      </div>

      <Heading as={1} size="xl">
        Review bank change
      </Heading>

      <BankChangeReviewCard
        request={request}
        currentPaymentDetails={currentDetails}
        auditEntries={auditEntries}
        onAction={() => {
          refresh();
          // If request is no longer pending, redirect back to queue after a short delay
          const updated = MockDB.getBankChangeRequests().find((r) => r.id === id);
          if (updated && updated.status !== 'pending_review') {
            setTimeout(() => router.push('/admin/bank-changes'), 800);
          }
        }}
      />
    </div>
  );
}