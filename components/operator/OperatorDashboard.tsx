'use client';

import { useEffect, useState } from 'react';
import { QuoteRequest } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';
import { OfferForm } from './OfferForm';
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
  OverlayDescription,
} from '@/components/ui/Overlay';

export function OperatorDashboard() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    // Mock user switch
    MockDB.setCurrentUser('operator');
    
    const loadRequests = () => {
      const all = MockDB.getRequests();
      // Filter for open requests or all
      setRequests(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    
    loadRequests();
    // Poll for updates or just reload on action
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center text-[rgba(255,255,255,0.4)]">No requests yet.</div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="cursor-pointer rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#111111] p-6 transition-colors hover:border-[#FFD31D] hover:bg-[rgba(255,255,255,0.02)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#FFFFFF]">
                    {req.type.toUpperCase()} - {req.season}
                  </h3>
                  <p className="text-sm text-[rgba(255,255,255,0.4)]">
                    {req.departureCity || 'No specific departure'} • {req.totalNights} Nights
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      req.status === 'open'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}
                  >
                    {req.status}
                  </span>
                  <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <OverlayContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <OverlayHeader>
            <OverlayTitle>Reply to Quote Request</OverlayTitle>
            <OverlayDescription>
              Review the request from the customer and send a structured offer.
            </OverlayDescription>
          </OverlayHeader>
          
          {selectedRequest && (
            <OfferForm
              request={selectedRequest}
              onSuccess={() => {
                setSelectedRequest(null);
                // Refresh list happens via polling or could force it
                const all = MockDB.getRequests();
                setRequests(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
              }}
            />
          )}
        </OverlayContent>
      </Dialog>
    </div>
  );
}
