'use client';

import { useEffect, useState } from 'react';
import { QuoteRequest, Offer, OperatorProfile } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';
import { Button } from '@/components/ui';
import { ComparisonTable } from './ComparisonTable';
import { handleOfferSelection } from '@/lib/comparison';
import { Repository, RequestContext } from '@/lib/api/repository';
import { formatMoney, getCurrencySymbol } from '@/lib/i18n/format';
import { CURRENCY_CHANGE_EVENT, getRegionSettings } from '@/lib/i18n/region';

const customerContext: RequestContext = { userId: 'cust1', role: 'customer' };

export function RequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const [regionSettings, setRegionSettings] = useState(() => getRegionSettings());
  const [request, setRequest] = useState<QuoteRequest | undefined>(undefined);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const req = Repository.getRequestById(customerContext, id);
    if (req) {
      setRequest(req);
      const offs = Repository.getOffersForRequest(customerContext, id);
      setOffers(offs);
      const ops = MockDB.getOperators();
      setOperators(ops);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    const updateSettings = () => setRegionSettings(getRegionSettings());
    window.addEventListener(CURRENCY_CHANGE_EVENT, updateSettings);
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, updateSettings);
  }, []);

  const handleBooking = (offer: Offer) => {
    try {
      Repository.createBookingIntent(customerContext, {
        offerId: offer.id,
        operatorId: offer.operatorId,
        notes: 'Customer clicked Proceed',
      });
      setBookingSuccess(offer.id);
      setTimeout(() => setBookingSuccess(null), 3000);
    } catch {
      alert('Failed to create booking intent');
    }
  };

  if (loading) return <div className="p-8 text-center text-[#FFFFFF]">Loading...</div>;
  if (!request) return <div className="p-8 text-center text-[#FFFFFF]">Request not found.</div>;

  const getOperator = (opId: string) => operators.find((o) => o.id === opId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="request-back-button"
          onClick={() => router.back()}
          className="px-0 text-[var(--textMuted)] hover:bg-transparent hover:text-[var(--text)]"
        >
          Back to previous page
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Quote Request #{request.id.slice(0, 8)}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
          request.status === 'open' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
        }`}>
          {request.status}
        </span>
      </div>

      {/* Request Summary */}
      <div className="mb-8 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-6">
        <div className="grid grid-cols-2 gap-4 text-sm text-[#FFFFFF] sm:grid-cols-4">
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Type</p>
            <p className="capitalize">{request.type}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Season</p>
            <p className="capitalize">{request.season}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Departure</p>
            <p>{request.departureCity || '-'}</p>
          </div>
          <div>
            <p className="text-[rgba(255,255,255,0.4)]">Budget</p>
            <p>
              {request.budgetRange
                ? `${formatMoney(request.budgetRange.min, request.budgetRange.currency, regionSettings.locale)} - ${formatMoney(request.budgetRange.max, request.budgetRange.currency, regionSettings.locale)}`
                : 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Offers Received ({offers.length})</h2>
          {selectedOffers.length > 1 && (
            <button
              onClick={() => setShowComparison(true)}
              className="rounded-lg bg-[#FFD31D] px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A]"
            >
              Compare ({selectedOffers.length})
            </button>
          )}
        </div>
        
        {offers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.1)] p-8 text-center text-[rgba(255,255,255,0.4)]">
            Waiting for operators to respond...
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const op = getOperator(offer.operatorId);
              const isSelected = selectedOffers.includes(offer.id);
              
              return (
                <div 
                  key={offer.id} 
                  data-testid="offer-card"
                  className={`rounded-lg border bg-[#111111] p-6 shadow-sm transition-colors ${
                    isSelected ? 'border-[#FFD31D] bg-[rgba(255,211,29,0.02)]' : 'border-[rgba(255,255,255,0.1)] hover:border-[#FFD31D]'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        data-testid="offer-compare-checkbox"
                        checked={isSelected}
                        onChange={() => {
                          try {
                            const newSelected = handleOfferSelection(selectedOffers, offer.id);
                            setSelectedOffers(newSelected);
                          } catch (err) {
                            alert((err as Error).message);
                          }
                        }}
                        className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-transparent text-[#FFD31D] focus:ring-[#FFD31D]"
                      />
                      <span className="font-medium text-[#FFFFFF]">{op?.companyName || 'Unknown Operator'}</span>
                    </div>
                    {op?.verificationStatus === 'verified' && (
                      <span className="text-xs text-[#FFD31D]">Verified</span>
                    )}
                  </div>
                  <div className="mb-4 text-2xl font-bold text-[#FFD31D]">
                    {getCurrencySymbol(offer.currency)}{offer.pricePerPerson}
                    <span className="text-sm font-normal text-[rgba(255,255,255,0.64)]">/person</span>
                  </div>
                  <div className="space-y-2 text-sm text-[rgba(255,255,255,0.64)]">
                    <p>{offer.totalNights} Nights Total</p>
                    <p>{offer.hotelStars} Star Hotels</p>
                    <p>{offer.distanceToHaram} to Haram</p>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 rounded-lg bg-[rgba(255,255,255,0.1)] py-2 text-sm font-medium text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.2)]">
                      View Details
                    </button>
                    <button 
                      onClick={() => handleBooking(offer)}
                      disabled={bookingSuccess === offer.id}
                      className="flex-1 rounded-lg bg-[#FFD31D] py-2 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A] disabled:opacity-50"
                    >
                      {bookingSuccess === offer.id ? 'Requested!' : 'Book Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-w-4xl overflow-x-auto">
          <OverlayHeader>
            <OverlayTitle>Compare Offers</OverlayTitle>
          </OverlayHeader>
          <div className="mt-4">
            <ComparisonTable offers={offers.filter(o => selectedOffers.includes(o.id))} />
          </div>
        </OverlayContent>
      </Dialog>

      {/* Temporary Link to Operator Dashboard for Demo */}
      <div className="mt-12 border-t border-[rgba(255,255,255,0.1)] pt-8 text-center">
        <p className="text-sm text-[rgba(255,255,255,0.4)]">Demo Navigation</p>
        <Link href="/operator/dashboard" className="mt-2 inline-block rounded text-[#FFD31D] underline hover:text-[#E5BD1A]">
          Go to Operator Dashboard (Simulate Response)
        </Link>
      </div>
    </div>
  );
}
