'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';

export function Step2LocationDates() {
  const { draft, setDraft } = useQuoteRequestStore();
  const isCustomDates = draft.season === 'custom';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Departure City</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
          Which city are you flying from? (Optional)
        </p>
        <input
          type="text"
          value={draft.departureCity || ''}
          onChange={(e) => setDraft({ departureCity: e.target.value })}
          placeholder="e.g. London, Manchester"
          className="mt-4 block w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#FFFFFF] placeholder-[rgba(255,255,255,0.4)] focus:border-[#FFD31D] focus:outline-none focus:ring-1 focus:ring-[#FFD31D]"
        />
      </div>

      {isCustomDates && (
        <div>
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Travel Dates</h2>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
            When would you like to depart and return?
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                Start Date
              </label>
              <input
                type="date"
                value={draft.dateWindow?.start || ''}
                onChange={(e) =>
                  setDraft({
                    dateWindow: {
                      ...draft.dateWindow,
                      start: e.target.value,
                      flexible: false,
                    },
                  })
                }
                className="block w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#FFFFFF] placeholder-[rgba(255,255,255,0.4)] focus:border-[#FFD31D] focus:outline-none focus:ring-1 focus:ring-[#FFD31D]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                End Date
              </label>
              <input
                type="date"
                value={draft.dateWindow?.end || ''}
                onChange={(e) =>
                  setDraft({
                    dateWindow: {
                      ...draft.dateWindow,
                      end: e.target.value,
                      flexible: false,
                    },
                  })
                }
                className="block w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#FFFFFF] placeholder-[rgba(255,255,255,0.4)] focus:border-[#FFD31D] focus:outline-none focus:ring-1 focus:ring-[#FFD31D]"
              />
            </div>
          </div>
        </div>
      )}

      {!isCustomDates && (
        <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="flexible-dates"
              checked={draft.dateWindow?.flexible ?? true}
              onChange={(e) =>
                setDraft({
                  dateWindow: {
                    ...draft.dateWindow,
                    flexible: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#FFD31D] focus:ring-[#FFD31D]"
            />
            <label
              htmlFor="flexible-dates"
              className="ml-3 text-sm font-medium text-[#FFFFFF]"
            >
              My dates are flexible within the selected season
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
