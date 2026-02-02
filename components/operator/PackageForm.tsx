'use client';

import { useState } from 'react';
import { Package } from '@/lib/types';
import { Repository, RequestContext } from '@/lib/api/repository';

interface PackageFormProps {
  initialData?: Package;
  onSuccess: () => void;
  onCancel: () => void;
}

const context: RequestContext = { userId: 'op1', role: 'operator' };

export function PackageForm({ initialData, onSuccess, onCancel }: PackageFormProps) {
  const [formData, setFormData] = useState<Partial<Package>>({
    title: '',
    pilgrimageType: 'umrah',
    priceType: 'exact',
    currency: 'GBP',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    ...initialData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData && initialData.id) {
        Repository.updatePackage(context, initialData.id, formData);
      } else {
        Repository.createPackage(context, formData);
      }
      onSuccess();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleOccupancyToggle = (key: 'single' | 'double' | 'triple' | 'quad') => {
    if (!formData.roomOccupancyOptions) return;
    setFormData({
      ...formData,
      roomOccupancyOptions: {
        ...formData.roomOccupancyOptions,
        [key]: !formData.roomOccupancyOptions[key],
      },
    });
  };

  const handleInclusionToggle = (key: 'visa' | 'flights' | 'transfers' | 'meals') => {
    if (!formData.inclusions) return;
    setFormData({
      ...formData,
      inclusions: {
        ...formData.inclusions,
        [key]: !formData.inclusions[key],
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm text-[#FFFFFF]">
      {/* Title & Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Package Title</label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Type</label>
          <select
            value={formData.pilgrimageType}
            onChange={(e) => setFormData({ ...formData, pilgrimageType: e.target.value as 'umrah' | 'hajj' })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="umrah">Umrah</option>
            <option value="hajj">Hajj</option>
          </select>
        </div>
      </div>

      {/* Season / Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Season Label</label>
          <input
            type="text"
            placeholder="e.g. Ramadan"
            value={formData.seasonLabel || ''}
            onChange={(e) => setFormData({ ...formData, seasonLabel: e.target.value })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          />
        </div>
      </div>

      {/* Price */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Price Type</label>
          <select
            value={formData.priceType}
            onChange={(e) => setFormData({ ...formData, priceType: e.target.value as 'exact' | 'from' })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="exact">Exact</option>
            <option value="from">From</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Price</label>
          <input
            type="number"
            required
            min="0"
            value={formData.pricePerPerson || ''}
            onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* Nights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Nights</label>
          <input
            type="number"
            min="0"
            value={formData.nightsMakkah || 0}
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
            value={formData.nightsMadinah || 0}
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
            value={formData.totalNights || 0}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 opacity-50"
          />
        </div>
      </div>

      {/* Hotels & Distance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Hotel Stars</label>
          <select
            value={formData.hotelMakkahStars || 4}
            onChange={(e) => setFormData({ ...formData, hotelMakkahStars: parseInt(e.target.value) as 3 | 4 | 5 })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Distance</label>
          <select
            value={formData.distanceBandMakkah || 'medium'}
            onChange={(e) => setFormData({ ...formData, distanceBandMakkah: e.target.value as 'near' | 'medium' | 'far' })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="near">Near</option>
            <option value="medium">Medium</option>
            <option value="far">Far</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Madinah Hotel Stars</label>
          <select
            value={formData.hotelMadinahStars || 4}
            onChange={(e) => setFormData({ ...formData, hotelMadinahStars: parseInt(e.target.value) as 3 | 4 | 5 })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Madinah Distance</label>
          <select
            value={formData.distanceBandMadinah || 'medium'}
            onChange={(e) => setFormData({ ...formData, distanceBandMadinah: e.target.value as 'near' | 'medium' | 'far' })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
          >
            <option value="near">Near</option>
            <option value="medium">Medium</option>
            <option value="far">Far</option>
          </select>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[rgba(255,255,255,0.8)]">Occupancy</label>
          <div className="space-y-2">
            {['single', 'double', 'triple', 'quad'].map((opt) => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.roomOccupancyOptions?.[opt as 'single' | 'double' | 'triple' | 'quad']}
                  onChange={() => handleOccupancyToggle(opt as 'single' | 'double' | 'triple' | 'quad')}
                  className="rounded border-[rgba(255,255,255,0.3)] bg-transparent text-[#FFD31D] focus:ring-[#FFD31D]"
                />
                <span className="capitalize text-[rgba(255,255,255,0.64)]">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[rgba(255,255,255,0.8)]">Inclusions</label>
          <div className="space-y-2">
            {['visa', 'flights', 'transfers', 'meals'].map((opt) => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.inclusions?.[opt as 'visa' | 'flights' | 'transfers' | 'meals']}
                  onChange={() => handleInclusionToggle(opt as 'visa' | 'flights' | 'transfers' | 'meals')}
                  className="rounded border-[rgba(255,255,255,0.3)] bg-transparent text-[#FFD31D] focus:ring-[#FFD31D]"
                />
                <span className="capitalize text-[rgba(255,255,255,0.64)]">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Notes</label>
        <textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 focus:border-[#FFD31D] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-4 py-2 text-[rgba(255,255,255,0.64)] hover:text-[#FFFFFF]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-[#FFD31D] px-6 py-2 text-[#000000] hover:bg-[#E5BD1A]"
        >
          Save Package
        </button>
      </div>
    </form>
  );
}
