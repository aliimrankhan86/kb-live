'use client';

import { useEffect, useState } from 'react';
import { MockDB } from '@/lib/api/mock-db';
import { QuoteRequest } from '@/lib/types';
import { OfferForm } from '@/components/operator/OfferForm';
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
  OverlayDescription,
} from '@/components/ui/Overlay';
import { Badge } from '@/components/ui/Badge';

interface OperatorLeadsClientProps {
  operatorId: string;
}

export function OperatorLeadsClient({ operatorId }: OperatorLeadsClientProps) {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);

  const loadRequests = () => {
    const all = MockDB.getRequests();
    setRequests(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = requests.filter((req) => {
    const hasOffer = MockDB.getOffersByRequestId(req.id).some((o) => o.operatorId === operatorId);
    if (filter === 'new') return req.status === 'open' && !hasOffer;
    if (filter === 'responded') return hasOffer;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Leads & Enquiries</h1>
          <p className="mt-1 text-sm text-[var(--textMuted)]">Incoming quote requests from travellers.</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'responded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-1.5 text-sm capitalize transition-colors ${
                filter === f
                  ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                  : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
              }`}
              data-testid={`leads-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-md border border-[var(--borderSubtle)] p-8 text-center text-[var(--textMuted)]" data-testid="leads-empty">
            No {filter === 'all' ? '' : filter} leads found.
          </div>
        ) : (
          filtered.map((req) => {
            const hasOffer = MockDB.getOffersByRequestId(req.id).some((o) => o.operatorId === operatorId);
            return (
              <div
                key={req.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4 sm:flex-row sm:items-center sm:justify-between"
                data-testid={`lead-card-${req.id}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--text)]">
                      {req.type.toUpperCase()} — {req.season}
                    </h3>
                    {hasOffer ? (
                      <Badge variant="success">Responded</Badge>
                    ) : req.status === 'open' ? (
                      <Badge variant="warning">New</Badge>
                    ) : (
                      <Badge>Closed</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--textMuted)]">
                    {req.departureCity || 'Any departure'} • {req.totalNights} nights • Budget: £{req.budgetRange?.min ?? 0}–£{req.budgetRange?.max ?? 'any'}
                  </p>
                  <p className="text-xs text-[var(--textMuted)]">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="inline-flex items-center justify-center rounded-md bg-[var(--yellow)] px-4 py-2 text-sm font-medium text-black transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
                  data-testid={`lead-respond-${req.id}`}
                >
                  {hasOffer ? 'View Offer' : 'View & Respond'}
                </button>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <OverlayContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <OverlayHeader>
            <OverlayTitle>Reply to Quote Request</OverlayTitle>
            <OverlayDescription>Review the request and send a structured offer.</OverlayDescription>
          </OverlayHeader>
          {selectedRequest && (
            <OfferForm
              request={selectedRequest}
              operatorId={operatorId}
              onSuccess={() => {
                setSelectedRequest(null);
                loadRequests();
              }}
            />
          )}
        </OverlayContent>
      </Dialog>
    </div>
  );
}
