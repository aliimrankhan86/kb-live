'use client';

import { useState } from 'react';
import { QuoteRequest, Offer } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';

interface OfferFormProps {
  request: QuoteRequest;
  onSuccess: () => void;
}

export function OfferForm({ request, onSuccess }: OfferFormProps) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm text-[#FFFFFF]">
      {/* Request Context */}
      <div className="rounded bg-[rgba(255,255,255,0.05)] p-4 text-xs text-[rgba(255,255,255,0.64)]">
        <p>Customer Request: {request.type} • {request.season}</p>
        <p>Budget: £{request.budgetRange?.min}-{request.budgetRange?.max}</p>
        <p>Notes: {request.notes || 'None'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Price Per Person</label>
          <div className="flex gap-2">
            <input
              type="number"
              required
              min="0"
              value={formData.pricePerPerson || ''}
              onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
              className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-2 focus:border-[#FFD31D] focus:outline-none"
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Hotel Rating</label>
          <select
            value={formData.hotelStars}
            onChange={(e) => setFormData({ ...formData, hotelStars: parseInt(e.target.value) as 3 | 4 | 5 })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Nights</label>
          <input
            type="number"
            min="0"
            value={formData.nightsMakkah}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setFormData({ ...formData, nightsMakkah: val, totalNights: val + (formData.nightsMadinah || 0) });
            }}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Madinah Nights</label>
          <input
            type="number"
            min="0"
            value={formData.nightsMadinah}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setFormData({ ...formData, nightsMadinah: val, totalNights: (formData.nightsMakkah || 0) + val });
            }}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Total Nights</label>
          <input
            type="number"
            readOnly
            value={formData.totalNights}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 opacity-50"
          />
        </div>
      </div>
      
      <div>
        <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Distance to Haram</label>
        <input
           type="text"
           value={formData.distanceToHaram || ''}
           onChange={(e) => setFormData({ ...formData, distanceToHaram: e.target.value })}
           placeholder="e.g. 500m or Shuttle"
           className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Notes / Description</label>
        <textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          placeholder="Describe hotel names, airline, etc."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#FFD31D] px-6 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#E5BD1A] disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Offer'}
        </button>
      </div>
    </form>
  );
}
