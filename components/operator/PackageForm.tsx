'use client';

import { useState } from 'react';
import { Package } from '@/lib/types';
import { Repository, RequestContext } from '@/lib/api/repository';
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui';

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
          <Input
            type="text"
            required
            data-testid="package-title-input"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Type</label>
          <Select
            value={formData.pilgrimageType}
            onChange={(e) => setFormData({ ...formData, pilgrimageType: e.target.value as 'umrah' | 'hajj' })}
            className="w-full"
            options={[
              { label: 'Umrah', value: 'umrah' },
              { label: 'Hajj', value: 'hajj' },
            ]}
          >
          </Select>
        </div>
      </div>

      {/* Season / Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Season Label</label>
          <Input
            type="text"
            placeholder="e.g. Ramadan"
            value={formData.seasonLabel || ''}
            onChange={(e) => setFormData({ ...formData, seasonLabel: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      {/* Price */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Price Type</label>
          <Select
            value={formData.priceType}
            onChange={(e) => setFormData({ ...formData, priceType: e.target.value as 'exact' | 'from' })}
            className="w-full"
            options={[
              { label: 'Exact', value: 'exact' },
              { label: 'From', value: 'from' },
            ]}
          >
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Price</label>
          <Input
            type="number"
            required
            min="0"
            value={formData.pricePerPerson || ''}
            onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Currency</label>
          <Select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full"
            options={[
              { label: 'GBP', value: 'GBP' },
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
            ]}
          >
          </Select>
        </div>
      </div>

      {/* Nights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Nights</label>
          <Input
            type="number"
            min="0"
            value={formData.nightsMakkah || 0}
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
            value={formData.nightsMadinah || 0}
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
            value={formData.totalNights || 0}
            className="w-full opacity-50"
          />
        </div>
      </div>

      {/* Hotels & Distance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Hotel Stars</label>
          <Select
            value={formData.hotelMakkahStars || 4}
            onChange={(e) => setFormData({ ...formData, hotelMakkahStars: parseInt(e.target.value) as 3 | 4 | 5 })}
            className="w-full"
            options={[
              { label: '3 Stars', value: '3' },
              { label: '4 Stars', value: '4' },
              { label: '5 Stars', value: '5' },
            ]}
          >
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Makkah Distance</label>
          <Select
            value={formData.distanceBandMakkah || 'medium'}
            onChange={(e) => setFormData({ ...formData, distanceBandMakkah: e.target.value as 'near' | 'medium' | 'far' })}
            className="w-full"
            options={[
              { label: 'Near', value: 'near' },
              { label: 'Medium', value: 'medium' },
              { label: 'Far', value: 'far' },
            ]}
          >
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Madinah Hotel Stars</label>
          <Select
            value={formData.hotelMadinahStars || 4}
            onChange={(e) => setFormData({ ...formData, hotelMadinahStars: parseInt(e.target.value) as 3 | 4 | 5 })}
            className="w-full"
            options={[
              { label: '3 Stars', value: '3' },
              { label: '4 Stars', value: '4' },
              { label: '5 Stars', value: '5' },
            ]}
          >
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Madinah Distance</label>
          <Select
            value={formData.distanceBandMadinah || 'medium'}
            onChange={(e) => setFormData({ ...formData, distanceBandMadinah: e.target.value as 'near' | 'medium' | 'far' })}
            className="w-full"
            options={[
              { label: 'Near', value: 'near' },
              { label: 'Medium', value: 'medium' },
              { label: 'Far', value: 'far' },
            ]}
          >
          </Select>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[rgba(255,255,255,0.8)]">Occupancy</label>
          <div className="space-y-2">
            {['single', 'double', 'triple', 'quad'].map((opt) => (
              <Checkbox
                key={opt}
                label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                checked={formData.roomOccupancyOptions?.[opt as 'single' | 'double' | 'triple' | 'quad']}
                onChange={() => handleOccupancyToggle(opt as 'single' | 'double' | 'triple' | 'quad')}
                className="text-[rgba(255,255,255,0.64)]"
              />
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[rgba(255,255,255,0.8)]">Inclusions</label>
          <div className="space-y-2">
            {['visa', 'flights', 'transfers', 'meals'].map((opt) => (
              <Checkbox
                key={opt}
                label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                checked={formData.inclusions?.[opt as 'visa' | 'flights' | 'transfers' | 'meals']}
                onChange={() => handleInclusionToggle(opt as 'visa' | 'flights' | 'transfers' | 'meals')}
                className="text-[rgba(255,255,255,0.64)]"
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[rgba(255,255,255,0.8)]">Notes</label>
        <Textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          className="px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-testid="save-package-button"
          className="px-6"
        >
          Save Package
        </Button>
      </div>
    </form>
  );
}
