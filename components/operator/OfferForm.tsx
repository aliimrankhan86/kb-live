'use client';

import { useState } from 'react';
import { QuoteRequest, Offer } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { getRegionSettings } from '@/lib/i18n/region';
import { formatMoney } from '@/lib/i18n/format';

interface OfferFormProps {
  request: QuoteRequest;
  onSuccess: () => void;
}

export function OfferForm({ request, onSuccess }: OfferFormProps) {
  const regionSettings = getRegionSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Offer>>({
    pricePerPerson: 0,
    currency: request.budgetRange?.currency || 'GBP',
    hotelStars: request.hotelStars,
    distanceToHaram: request.distancePreference,
    nightsMakkah: request.nightsMakkah,
    nightsMadinah: request.nightsMadinah,
    totalNights: request.totalNights,
    roomOccupancy: {
      single: (request.occupancy?.single || 0) > 0,
      double: (request.occupancy?.double || 0) > 0,
      triple: (request.occupancy?.triple || 0) > 0,
      quad: (request.occupancy?.quad || 0) > 0,
    },
    inclusions: { ...request.inclusions },
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const offer: Offer = {
      ...formData as Offer,
      id: crypto.randomUUID(),
      requestId: request.id,
      operatorId: MockDB.currentUser.id, // Current mocked operator
      createdAt: new Date().toISOString(),
      // Ensure required fields
      roomOccupancy: formData.roomOccupancy || { single: false, double: true, triple: false, quad: false },
      inclusions: formData.inclusions || { visa: false, flights: false, transfers: false, meals: false },
    };

    // Simulate network delay
    setTimeout(() => {
      MockDB.saveOffer(offer);
      setLoading(false);
      onSuccess();
    }, 1000);
  };

  const budgetCurrency = request.budgetRange?.currency || 'GBP';
  const budgetMin = request.budgetRange?.min ?? 0;
  const budgetMax = request.budgetRange?.max ?? 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm text-[#FFFFFF]">
      {/* Request Context */}
      <div className="rounded bg-[rgba(255,255,255,0.05)] p-4 text-xs text-[rgba(255,255,255,0.64)]">
        <p>Customer Request: {request.type} • {request.season}</p>
        <p>Budget: {formatMoney(budgetMin, budgetCurrency, regionSettings.locale)} - {formatMoney(budgetMax, budgetCurrency, regionSettings.locale)}</p>
        <p>Notes: {request.notes || 'None'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Price Per Person</label>
          <div className="flex gap-2">
            <Input
              type="number"
              required
              min="0"
              value={formData.pricePerPerson || ''}
              onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
              className="w-full"
            />
            <Select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="min-w-24"
              options={[
                { label: 'GBP', value: 'GBP' },
                { label: 'USD', value: 'USD' },
                { label: 'EUR', value: 'EUR' },
              ]}
            >
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Hotel Rating</label>
          <Select
            value={formData.hotelStars}
            onChange={(e) => setFormData({ ...formData, hotelStars: parseInt(e.target.value) as 3 | 4 | 5 })}
            options={[
              { label: '3 Stars', value: '3' },
              { label: '4 Stars', value: '4' },
              { label: '5 Stars', value: '5' },
            ]}
            className="w-full"
          >
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Nights</label>
          <Input
            type="number"
            min="0"
            value={formData.nightsMakkah}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setFormData({ ...formData, nightsMakkah: val, totalNights: val + (formData.nightsMadinah || 0) });
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Madinah Nights</label>
          <Input
            type="number"
            min="0"
            value={formData.nightsMadinah}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setFormData({ ...formData, nightsMadinah: val, totalNights: (formData.nightsMakkah || 0) + val });
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Total Nights</label>
          <Input
            type="number"
            readOnly
            value={formData.totalNights}
            className="w-full opacity-50"
          />
        </div>
      </div>
      
      <div>
        <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Distance to Haram</label>
        <Input
           type="text"
           value={formData.distanceToHaram || ''}
           onChange={(e) => setFormData({ ...formData, distanceToHaram: e.target.value })}
           placeholder="e.g. 500m or Shuttle"
           className="w-full"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Notes / Description</label>
        <Textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full"
          placeholder="Describe hotel names, airline, etc."
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="px-6"
          loading={loading}
        >
          Send Offer
        </Button>
      </div>
    </form>
  );
}
