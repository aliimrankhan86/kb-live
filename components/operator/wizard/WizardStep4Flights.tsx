'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

const UK_AIRPORTS = [
  { code: 'LHR', name: 'London Heathrow' },
  { code: 'LGW', name: 'London Gatwick' },
  { code: 'LTN', name: 'London Luton' },
  { code: 'STN', name: 'London Stansted' },
  { code: 'MAN', name: 'Manchester' },
  { code: 'BHX', name: 'Birmingham' },
  { code: 'BRS', name: 'Bristol' },
  { code: 'EDI', name: 'Edinburgh' },
  { code: 'GLA', name: 'Glasgow' },
];

export function WizardStep4Flights({ data, onChange, error }: Props) {
  const flightsIncluded = data.inclusions?.flights ?? false;

  const toggleFlights = (included: boolean) => {
    onChange({
      inclusions: { ...(data.inclusions ?? { visa: false, flights: false, transfers: false, meals: false }), flights: included },
      ...(included ? {} : { airline: undefined, departureAirport: undefined, flightType: undefined }),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Flights</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Are flights included in the package price?</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Flights included toggle */}
      <div className="flex items-center gap-3 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3">
        <button
          type="button"
          data-testid="wizard-flights-toggle"
          role="switch"
          aria-checked={flightsIncluded}
          onClick={() => toggleFlights(!flightsIncluded)}
          className={`relative h-6 w-11 rounded-full transition-colors ${flightsIncluded ? 'bg-[var(--yellow)]' : 'bg-[rgba(255,255,255,0.15)]'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${flightsIncluded ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
        <span className="text-sm text-[var(--text)]">Flights included in price</span>
      </div>

      {/* Flight details — shown only when flights included */}
      {flightsIncluded && (
        <div className="space-y-4 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Airline */}
            <div>
              <label htmlFor="pkg-airline" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Airline</label>
              <input
                id="pkg-airline"
                type="text"
                data-testid="wizard-airline"
                placeholder="e.g. Saudi Arabian Airlines"
                value={data.airline ?? ''}
                onChange={(e) => onChange({ airline: e.target.value || undefined })}
                className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
              />
            </div>

            {/* Departure airport */}
            <div>
              <label htmlFor="pkg-airport" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Departure airport</label>
              <select
                id="pkg-airport"
                data-testid="wizard-airport"
                value={data.departureAirport ?? ''}
                onChange={(e) => onChange({ departureAirport: e.target.value || undefined })}
                className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
              >
                <option value="">Select airport</option>
                {UK_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Flight type */}
          <div>
            <label htmlFor="pkg-flight-type" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Flight type</label>
            <select
              id="pkg-flight-type"
              data-testid="wizard-flight-type"
              value={data.flightType ?? ''}
              onChange={(e) => onChange({ flightType: (e.target.value as 'direct' | 'one-stop' | 'multi-stop') || undefined })}
              className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
            >
              <option value="">Select flight type</option>
              <option value="direct">Direct</option>
              <option value="one-stop">One stop</option>
              <option value="multi-stop">Multi-stop</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export function validateStep4(_data: Partial<Package>): string | null {
  // Flights details are optional — no hard validation
  return null;
}
