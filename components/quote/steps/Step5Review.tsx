'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';
import { getCurrencySymbol } from '@/lib/i18n/format';

export function Step5Review() {
  const { draft, setDraft } = useQuoteRequestStore();
  const budgetCurrency = draft.budgetRange?.currency || 'GBP';
  const currencySymbol = getCurrencySymbol(budgetCurrency);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Review & Submit</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Please check your details before sending the request.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] p-6 text-sm text-[var(--text)]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-medium text-[var(--textMuted)]">Type & Season</h3>
            <p className="capitalize">{draft.type} — {draft.season}</p>
          </div>
          
          <div>
            <h3 className="mb-2 font-medium text-[var(--textMuted)]">Location</h3>
            {draft.departureCity ? (
              <p>{draft.departureCity}{draft.departureArea ? `, ${draft.departureArea}` : ''}</p>
            ) : (
              <p className="text-[var(--textMuted)]">City not specified</p>
            )}
            {draft.departureAirport && (
              <p className="mt-0.5 text-[var(--color-text-secondary)]">✈ {draft.departureAirport}</p>
            )}
            <p className="mt-0.5">
              {draft.season !== 'custom'
                ? `${draft.season?.charAt(0).toUpperCase()}${draft.season?.slice(1)} — ${draft.dateWindow?.flexible ? 'Flexible dates' : 'Fixed dates'}`
                : draft.dateWindow?.start && draft.dateWindow?.end
                  ? `${draft.dateWindow.start} → ${draft.dateWindow.end}`
                  : 'Dates not set'}
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-[var(--textMuted)]">Stay Details</h3>
            <p>{draft.totalNights} Nights Total</p>
            <p>{draft.nightsMakkah} Makkah / {draft.nightsMadinah} Madinah</p>
            <p>{draft.hotelStars} Star Hotel ({draft.distancePreference} Haram)</p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-[var(--textMuted)]">Budget & Group</h3>
            <p>{currencySymbol}{draft.budgetRange?.min} - {currencySymbol}{draft.budgetRange?.max}</p>
            <p>
              {Object.entries(draft.occupancy || {})
                .filter(([, count]) => count > 0)
                .map(([type, count]) => `${count} ${type}`)
                .join(', ')}
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t border-[var(--borderSubtle)] pt-4">
          <h3 className="mb-2 font-medium text-[var(--textMuted)]">Inclusions</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(draft.inclusions || {})
              .filter(([, included]) => included)
              .map(([key]) => (
                <span key={key} className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-medium text-[var(--color-text-on-brand)] capitalize">
                  {key}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="quote-notes" className="block text-xl font-semibold text-[var(--text)]">
          Additional Notes
        </label>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Any specific requirements? (Accessibility, dietary needs, etc.)
        </p>
        <textarea
          id="quote-notes"
          value={draft.notes || ''}
          onChange={(e) => setDraft({ notes: e.target.value })}
          rows={4}
          className="mt-4 block w-full rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] px-4 py-3 text-[var(--text)] placeholder-[var(--textMuted)] focus:border-[var(--focusRing)] focus:outline-none focus:ring-1 focus:ring-[var(--focusRing)]"
          placeholder="e.g. Need wheelchair assistance, ocean view preferred..."
        />
      </div>

      {/* Data-sharing disclosure — required before submit */}
      <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] px-4 py-3 text-sm text-[var(--textMuted)]">
        <p>
          <strong className="text-[var(--text)]">Before you submit:</strong> your contact
          details and request will be shared with the operator you enquire with. They will use your
          details to respond to your enquiry. Your travel contract, cancellations and refunds are
          with the operator directly — not PilgrimCompare.
        </p>
      </div>
    </div>
  );
}
