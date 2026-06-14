'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';
import { clsx } from 'clsx';

export function Step3StayDetails() {
  const { draft, setDraft } = useQuoteRequestStore();

  const handleStarSelect = (star: 3 | 4 | 5) => {
    setDraft({ hotelStars: star });
  };

  const handleDistanceSelect = (dist: 'near' | 'medium' | 'far' | 'range') => {
    setDraft({ distancePreference: dist });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Duration of Stay</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          How many nights do you plan to stay in each city?
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
              Nights in Makkah
            </label>
            <input
              type="number"
              min="0"
              value={draft.nightsMakkah || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setDraft({
                  nightsMakkah: val,
                  totalNights: val + (draft.nightsMadinah || 0),
                });
              }}
              className="block w-full rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] px-4 py-3 text-[var(--text)] placeholder-[var(--textMuted)] focus:border-[var(--focusRing)] focus:outline-none focus:ring-1 focus:ring-[var(--focusRing)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
              Nights in Madinah
            </label>
            <input
              type="number"
              min="0"
              value={draft.nightsMadinah || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setDraft({
                  nightsMadinah: val,
                  totalNights: (draft.nightsMakkah || 0) + val,
                });
              }}
              className="block w-full rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] px-4 py-3 text-[var(--text)] placeholder-[var(--textMuted)] focus:border-[var(--focusRing)] focus:outline-none focus:ring-1 focus:ring-[var(--focusRing)]"
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-[var(--yellow)]">
          Total Trip Duration: {draft.totalNights || 0} Nights
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Hotel Preference</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          What is your preferred hotel standard?
        </p>
        <div className="mt-4 flex gap-4">
          {[3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarSelect(star as 3 | 4 | 5)}
              className={clsx(
                'flex-1 rounded-lg border py-3 text-center transition-all',
                draft.hotelStars === star
                  ? 'border-[var(--primary)] bg-[var(--color-primary-soft)] text-[var(--primary)]'
                  : 'border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] text-[var(--text)] hover:bg-[var(--borderSubtle)]'
              )}
            >
              {star} Stars
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Distance to Haram</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          How close do you want to be?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { id: 'near', label: 'Close' },
            { id: 'medium', label: 'Medium' },
            { id: 'far', label: 'Far (Shuttle)' },
            { id: 'range', label: 'Any' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => handleDistanceSelect(option.id as 'near' | 'medium' | 'far' | 'range')}
              className={clsx(
                'rounded-lg border py-3 text-center text-sm transition-all',
                draft.distancePreference === option.id
                  ? 'border-[var(--primary)] bg-[var(--color-primary-soft)] text-[var(--primary)]'
                  : 'border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] text-[var(--text)] hover:bg-[var(--borderSubtle)]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
