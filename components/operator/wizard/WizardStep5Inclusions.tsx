'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

const INCLUSION_ITEMS: { key: keyof NonNullable<Package['inclusions']>; label: string; description: string }[] = [
  { key: 'visa', label: 'Visa', description: 'Umrah/Hajj visa processing included' },
  { key: 'flights', label: 'Flights', description: 'Return flights from UK included' },
  { key: 'transfers', label: 'Transfers', description: 'Airport and hotel transfers included' },
  { key: 'meals', label: 'Meals', description: 'Meals provided during stay' },
];

const ROOM_OPTIONS: { key: keyof NonNullable<Package['roomOccupancyOptions']>; label: string }[] = [
  { key: 'single', label: 'Single' },
  { key: 'double', label: 'Double' },
  { key: 'triple', label: 'Triple' },
  { key: 'quad', label: 'Quad' },
];

export function WizardStep5Inclusions({ data, onChange, error }: Props) {
  const inclusions = data.inclusions ?? { visa: false, flights: false, transfers: false, meals: false };
  const occupancy = data.roomOccupancyOptions ?? { single: false, double: true, triple: true, quad: true };

  const toggleInclusion = (key: keyof typeof inclusions) => {
    onChange({ inclusions: { ...inclusions, [key]: !inclusions[key] } });
  };

  const toggleOccupancy = (key: keyof typeof occupancy) => {
    onChange({ roomOccupancyOptions: { ...occupancy, [key]: !occupancy[key] } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Inclusions & rooms</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">What&apos;s included in the package price and which room types are available.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Inclusions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)] uppercase tracking-wide">What&apos;s included</h3>
        <div className="space-y-2">
          {INCLUSION_ITEMS.map(({ key, label, description }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 hover:border-[rgba(255,255,255,0.15)] transition-colors"
            >
              <input
                type="checkbox"
                data-testid={`wizard-inclusion-${key}`}
                checked={inclusions[key]}
                onChange={() => toggleInclusion(key)}
                className="h-4 w-4 rounded accent-[var(--yellow)]"
              />
              <div>
                <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                <p className="text-xs text-[var(--textMuted)]">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Room occupancy */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)] uppercase tracking-wide">Room types available</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROOM_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded border px-3 py-3 text-center transition-colors ${
                occupancy[key]
                  ? 'border-[var(--yellow)]/50 bg-[var(--yellow)]/10'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]'
              }`}
            >
              <input
                type="checkbox"
                data-testid={`wizard-room-${key}`}
                checked={occupancy[key]}
                onChange={() => toggleOccupancy(key)}
                className="sr-only"
              />
              <span className={`text-sm font-medium ${occupancy[key] ? 'text-[var(--yellow)]' : 'text-[var(--textMuted)]'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function validateStep5(data: Partial<Package>): string | null {
  const occ = data.roomOccupancyOptions;
  if (occ && !Object.values(occ).some(Boolean)) {
    return 'At least one room type must be selected.';
  }
  return null;
}
