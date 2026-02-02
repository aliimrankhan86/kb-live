'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';

export function Step5Review() {
  const { draft, setDraft } = useQuoteRequestStore();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Review & Submit</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
          Please check your details before sending the request.
        </p>
      </div>

      <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-6 text-sm text-[#FFFFFF]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-medium text-[rgba(255,255,255,0.4)]">Type & Season</h3>
            <p className="capitalize">{draft.type} — {draft.season}</p>
          </div>
          
          <div>
            <h3 className="mb-2 font-medium text-[rgba(255,255,255,0.4)]">Location</h3>
            <p>{draft.departureCity || 'Not specified'}</p>
            <p>{draft.dateWindow?.flexible ? 'Flexible Dates' : `${draft.dateWindow?.start} to ${draft.dateWindow?.end}`}</p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-[rgba(255,255,255,0.4)]">Stay Details</h3>
            <p>{draft.totalNights} Nights Total</p>
            <p>{draft.nightsMakkah} Makkah / {draft.nightsMadinah} Madinah</p>
            <p>{draft.hotelStars} Star Hotel ({draft.distancePreference} Haram)</p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-[rgba(255,255,255,0.4)]">Budget & Group</h3>
            <p>£{draft.budgetRange?.min} - £{draft.budgetRange?.max}</p>
            <p>
              {Object.entries(draft.occupancy || {})
                .filter(([, count]) => count > 0)
                .map(([type, count]) => `${count} ${type}`)
                .join(', ')}
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4">
          <h3 className="mb-2 font-medium text-[rgba(255,255,255,0.4)]">Inclusions</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(draft.inclusions || {})
              .filter(([, included]) => included)
              .map(([key]) => (
                <span key={key} className="rounded-full bg-[#FFD31D] px-3 py-1 text-xs font-medium text-black capitalize">
                  {key}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Additional Notes</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
          Any specific requirements? (Accessibility, dietary needs, etc.)
        </p>
        <textarea
          value={draft.notes || ''}
          onChange={(e) => setDraft({ notes: e.target.value })}
          rows={4}
          className="mt-4 block w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[#FFFFFF] placeholder-[rgba(255,255,255,0.4)] focus:border-[#FFD31D] focus:outline-none focus:ring-1 focus:ring-[#FFD31D]"
          placeholder="e.g. Need wheelchair assistance, ocean view preferred..."
        />
      </div>
    </div>
  );
}
