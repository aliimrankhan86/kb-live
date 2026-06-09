'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AuditLogEntry, BankChangeRequest, PaymentDetails } from '@/lib/types';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { BankChangeReviewCard } from '@/components/admin/BankChangeReviewCard';

export default function BankChangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<BankChangeRequest | null>(null);
  const [currentDetails, setCurrentDetails] = useState<PaymentDetails | undefined>();
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback((): Promise<BankChangeRequest | null> => {
    if (!id) { setLoading(false); return Promise.resolve(null); }
    return fetch(`/api/admin/bank-changes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const req: BankChangeRequest | null = d.request ?? null;
        setRequest(req);
        setCurrentDetails(d.activeDetails ?? undefined);
        setAuditEntries(d.auditEntries ?? []);
        setLoading(false);
        return req;
      })
      .catch(() => { setRequest(null); setLoading(false); return null; });
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
          refresh().then((updated) => {
            if (updated && updated.status !== 'pending_review') {
              setTimeout(() => router.push('/admin/bank-changes'), 800);
            }
          });
        }}
      />
    </div>
  );
}