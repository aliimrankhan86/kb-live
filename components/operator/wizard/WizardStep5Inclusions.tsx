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

// Ziyarat is operator-stated and three-state. 'Not specified' (value: undefined)
// is the starting state with no painted default — a skipped value persists as
// unset (→ "Not provided"), never coerced to false. Mirrors the groupType radio.
const ZIYARAT_OPTIONS: { value: boolean | undefined; key: string; label: string; description: string }[] = [
  { value: undefined, key: 'unspecified', label: 'Not specified', description: 'Leave blank — shown to pilgrims as "Not provided".' },
  { value: true, key: 'included', label: 'Included', description: 'Ziyarat tours to holy sites are part of this package.' },
  { value: false, key: 'not-included', label: 'Not included', description: 'This package does not include ziyarat tours.' },
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
        <div role="alert" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
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

      {/* Ziyarat — operator-stated, three-state (Included / Not included / leave blank) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)] uppercase tracking-wide">Ziyarat tours</h3>
        <div className="space-y-2">
          {ZIYARAT_OPTIONS.map(({ value, key, label, description }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 transition-colors ${
                data.ziyaratIncluded === value
                  ? 'border-[var(--yellow)]/50 bg-[var(--yellow)]/10'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]'
              }`}
            >
              <input
                type="radio"
                name="ziyarat-included"
                data-testid={`wizard-ziyarat-${key}`}
                value={key}
                checked={data.ziyaratIncluded === value}
                onChange={() => onChange({ ziyaratIncluded: value })}
                className="h-4 w-4 accent-[var(--yellow)]"
              />
              <div>
                <span className={`text-sm font-medium ${data.ziyaratIncluded === value ? 'text-[var(--yellow)]' : 'text-[var(--text)]'}`}>
                  {label}
                </span>
                <p className="text-xs text-[var(--textMuted)]">{description}</p>
              </div>
            </label>
          ))}
        </div>
        {data.ziyaratIncluded === true && (
          <div className="mt-2">
            <label htmlFor="pkg-ziyarat-details" className="mb-1.5 block text-xs font-medium text-[var(--textMuted)]">
              What ziyarat is included? <span className="font-normal">(optional)</span>
            </label>
            <input
              id="pkg-ziyarat-details"
              type="text"
              maxLength={500}
              data-testid="wizard-ziyarat-details"
              placeholder="e.g. Makkah and Madinah ziyarat tours"
              value={data.ziyaratDetails ?? ''}
              onChange={(e) => onChange({ ziyaratDetails: e.target.value || undefined })}
              className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
            />
          </div>
        )}
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
