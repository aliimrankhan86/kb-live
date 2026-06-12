'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

const STAR_OPTIONS = [3, 4, 5] as const;
const DISTANCE_OPTIONS = [
  { value: 'near', label: 'Near Haram (0–500m)' },
  { value: 'medium', label: 'Medium (500m–2km)' },
  { value: 'far', label: 'Further (2km+)' },
] as const;

function HotelSection({
  city,
  prefix,
  nameValue,
  starsValue,
  distanceValue,
  nightsValue,
  distMetresValue,
  onNameChange,
  onStarsChange,
  onDistanceChange,
  onNightsChange,
  onDistMetresChange,
}: {
  city: string;
  prefix: string;
  nameValue: string;
  starsValue: 3 | 4 | 5;
  distanceValue: 'near' | 'medium' | 'far' | 'unknown';
  nightsValue: number;
  distMetresValue: number | undefined;
  onNameChange: (v: string) => void;
  onStarsChange: (v: 3 | 4 | 5) => void;
  onDistanceChange: (v: 'near' | 'medium' | 'far') => void;
  onNightsChange: (v: number) => void;
  onDistMetresChange: (v: number | undefined) => void;
}) {
  return (
    <div className="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--yellow)] uppercase tracking-wide">{city}</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${prefix}-name`} className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Hotel name</label>
          <input
            id={`${prefix}-name`}
            type="text"
            data-testid={`${prefix}-name`}
            placeholder="e.g. Makkah Clock Royal Tower"
            value={nameValue}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor={`${prefix}-stars`} className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Star rating <span aria-hidden="true" className="text-[var(--color-error)]">*</span>
          </label>
          <select
            id={`${prefix}-stars`}
            data-testid={`${prefix}-stars`}
            value={starsValue}
            onChange={(e) => onStarsChange(parseInt(e.target.value) as 3 | 4 | 5)}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          >
            {STAR_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} stars</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${prefix}-nights`} className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Nights <span aria-hidden="true" className="text-[var(--color-error)]">*</span>
          </label>
          <input
            id={`${prefix}-nights`}
            type="number"
            data-testid={`${prefix}-nights`}
            min="1"
            value={nightsValue || ''}
            onChange={(e) => onNightsChange(parseInt(e.target.value) || 0)}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor={`${prefix}-distance`} className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Distance to Haram</label>
          <select
            id={`${prefix}-distance`}
            data-testid={`${prefix}-distance`}
            value={distanceValue === 'unknown' ? 'medium' : distanceValue}
            onChange={(e) => onDistanceChange(e.target.value as 'near' | 'medium' | 'far')}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          >
            {DISTANCE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${prefix}-metres`} className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Exact distance (metres)</label>
          <input
            id={`${prefix}-metres`}
            type="number"
            data-testid={`${prefix}-metres`}
            min="0"
            placeholder="e.g. 350"
            value={distMetresValue ?? ''}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              onDistMetresChange(isNaN(v) ? undefined : v);
            }}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export function WizardStep3Hotels({ data, onChange, error }: Props) {
  const totalNights = (data.nightsMakkah ?? 0) + (data.nightsMadinah ?? 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Hotels</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Enter hotel details for Makkah and Madinah stays.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <HotelSection
        city="Makkah"
        prefix="makkah"
        nameValue={data.hotelMakkahName ?? ''}
        starsValue={data.hotelMakkahStars ?? 4}
        distanceValue={data.distanceBandMakkah ?? 'medium'}
        nightsValue={data.nightsMakkah ?? 0}
        distMetresValue={data.distanceToHaramMakkahMetres}
        onNameChange={(v) => onChange({ hotelMakkahName: v })}
        onStarsChange={(v) => onChange({ hotelMakkahStars: v })}
        onDistanceChange={(v) => onChange({ distanceBandMakkah: v })}
        onNightsChange={(v) => onChange({ nightsMakkah: v, totalNights: v + (data.nightsMadinah ?? 0) })}
        onDistMetresChange={(v) => onChange({ distanceToHaramMakkahMetres: v })}
      />

      <HotelSection
        city="Madinah"
        prefix="madinah"
        nameValue={data.hotelMadinahName ?? ''}
        starsValue={data.hotelMadinahStars ?? 4}
        distanceValue={data.distanceBandMadinah ?? 'medium'}
        nightsValue={data.nightsMadinah ?? 0}
        distMetresValue={data.distanceToHaramMadinahMetres}
        onNameChange={(v) => onChange({ hotelMadinahName: v })}
        onStarsChange={(v) => onChange({ hotelMadinahStars: v })}
        onDistanceChange={(v) => onChange({ distanceBandMadinah: v })}
        onNightsChange={(v) => onChange({ nightsMadinah: v, totalNights: (data.nightsMakkah ?? 0) + v })}
        onDistMetresChange={(v) => onChange({ distanceToHaramMadinahMetres: v })}
      />

      {/* Total nights summary */}
      <div className="flex items-center gap-2 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
        <span className="text-sm text-[var(--textMuted)]">Total nights:</span>
        <span className="text-sm font-semibold text-[var(--text)]" data-testid="total-nights">{totalNights}</span>
      </div>
    </div>
  );
}

export function validateStep3(data: Partial<Package>): string | null {
  if (!data.nightsMakkah || data.nightsMakkah < 1) return 'Makkah nights must be at least 1.';
  if (!data.nightsMadinah || data.nightsMadinah < 1) return 'Madinah nights must be at least 1.';
  return null;
}
