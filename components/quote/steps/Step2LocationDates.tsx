'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';

const UK_CITIES = ['London', 'Manchester', 'Birmingham'];

const AIRPORTS: { code: string; name: string; city: string }[] = [
  { code: 'LHR', name: 'Heathrow', city: 'London' },
  { code: 'LGW', name: 'Gatwick', city: 'London' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester' },
  { code: 'BHX', name: 'Birmingham', city: 'Birmingham' },
];

const chipBase = 'cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD31D]';
const chipActive = 'border-[#FFD31D] bg-[rgba(255,211,29,0.12)] text-[#FFFFFF]';
const chipInactive = 'border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.64)] hover:border-[rgba(255,255,255,0.3)]';

export function Step2LocationDates() {
  const { draft, setDraft } = useQuoteRequestStore();
  const isCustomDates = draft.season === 'custom';
  const selectedCity = draft.departureCity || '';

  const relevantAirports = selectedCity
    ? AIRPORTS.filter((a) => a.city === selectedCity)
    : AIRPORTS;

  return (
    <div className="space-y-8">
      {/* Departure city */}
      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Departure City</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">Which city are you flying from?</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {UK_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setDraft({ departureCity: city, departureAirport: undefined })}
              className={`${chipBase} ${selectedCity === city ? chipActive : chipInactive}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Departure airport */}
      {selectedCity && (
        <div>
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Departure Airport</h2>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">Which airport will you fly from?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relevantAirports.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => setDraft({ departureAirport: airport.code })}
                className={`${chipBase} ${draft.departureAirport === airport.code ? chipActive : chipInactive}`}
              >
                <span className="font-semibold">{airport.code}</span>
                <span className="ml-1 text-xs opacity-80">— {airport.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[rgba(255,255,255,0.4)]">Your return flight will depart from the same airport.</p>
        </div>
      )}

      {/* Travel dates */}
      {isCustomDates && (
        <div>
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Travel Dates</h2>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">When would you like to depart and return?</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="travel-start-date" className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                Start Date
              </label>
              <input
                type="date"
                id="travel-start-date"
                value={draft.dateWindow?.start || ''}
                onChange={(e) => setDraft({ dateWindow: { ...draft.dateWindow, start: e.target.value, flexible: false } })}
                className="block w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#FFFFFF] focus:border-[#FFD31D] focus:outline-none focus:ring-1 focus:ring-[#FFD31D]"
              />
            </div>
            <div>
              <label htmlFor="travel-end-date" className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                End Date
              </label>
              <input
                type="date"
                id="travel-end-date"
                value={draft.dateWindow?.end || ''}
                onChange={(e) => setDraft({ dateWindow: { ...draft.dateWindow, end: e.target.value, flexible: false } })}
                className="block w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#FFFFFF] focus:border-[#FFD31D] focus:outline-none focus:ring-1 focus:ring-[#FFD31D]"
              />
            </div>
          </div>
        </div>
      )}

      {!isCustomDates && (
        <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="flexible-dates"
              checked={draft.dateWindow?.flexible ?? true}
              onChange={(e) => setDraft({ dateWindow: { ...draft.dateWindow, flexible: e.target.checked } })}
              className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#FFD31D] focus:ring-[#FFD31D]"
            />
            <span className="text-sm font-medium text-[#FFFFFF]">My dates are flexible within the selected season</span>
          </label>
        </div>
      )}
    </div>
  );
}
