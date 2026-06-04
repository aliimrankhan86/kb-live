'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MockDB } from '@/lib/api/mock-db';
import type { BankChangeRequest } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function BankChangesQueuePage() {
  const [requests, setRequests] = useState<BankChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const all = MockDB.getBankChangeRequests().filter((r) => r.status === 'pending_review');
    setRequests(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div role="status" aria-busy="true" className="p-8 text-center text-[var(--textMuted)]">
        Loading queue…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <Heading as={1} size="xl">
          Bank change requests
        </Heading>
        <Text tone="muted" size="sm">
          Review, approve, and reject operator bank detail change requests.
        </Text>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--borderSubtle)] p-10 text-center">
          <Text tone="muted" size="sm">
            No pending bank change requests in the queue.
          </Text>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const operator = MockDB.getOperators().find((o) => o.id === request.operatorId);
            return (
              <Card key={request.id}>
                <CardHeader>
                  <div>
                    <Text as="p" size="sm" className="font-medium text-[var(--text)]">
                      {operator?.companyName ?? request.operatorId}
                    </Text>
                    <Text tone="muted" size="xs">
                      Submitted {formatDate(request.requestedAt)}
                    </Text>
                  </div>
                  <Badge variant="warning">Pending review</Badge>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Text tone="muted" size="sm">
                      Change to:{' '}
                      <strong className="text-[var(--text)]">
                        {request.proposedDetails.bankName} — {request.proposedDetails.accountHolderName}
                      </strong>
                    </Text>
                    <Link
                      href={`/admin/bank-changes/${request.id}`}
                      className="inline-flex min-h-11 items-center rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--borderStrong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
                      data-testid="review-link"
                    >
                      Review
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}