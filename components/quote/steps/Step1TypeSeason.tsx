'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';
import { Season } from '@/lib/types';
import { clsx } from 'clsx';

export function Step1TypeSeason() {
  const { draft, setDraft } = useQuoteRequestStore();

  const handleTypeSelect = (type: 'umrah' | 'hajj') => {
    setDraft({ type });
  };

  const handleSeasonSelect = (season: Season) => {
    setDraft({ season });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Select Pilgrimage Type</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Are you planning for Umrah or Hajj?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTypeSelect('umrah')}
            className={clsx(
              'rounded-xl border p-6 text-center transition-all',
              draft.type === 'umrah'
                ? 'border-[var(--primary)] bg-[var(--color-primary-soft)] text-[var(--primary)]'
                : 'border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] text-[var(--text)] hover:bg-[var(--borderSubtle)]'
            )}
          >
            <span className="block text-lg font-medium">Umrah</span>
          </button>
          <button
            onClick={() => handleTypeSelect('hajj')}
            className={clsx(
              'rounded-xl border p-6 text-center transition-all',
              draft.type === 'hajj'
                ? 'border-[var(--primary)] bg-[var(--color-primary-soft)] text-[var(--primary)]'
                : 'border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] text-[var(--text)] hover:bg-[var(--borderSubtle)]'
            )}
          >
            <span className="block text-lg font-medium">Hajj</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Select Season</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          When are you planning to travel?
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { id: 'flexible', label: 'Flexible Dates', desc: 'Any time of year' },
            { id: 'ramadan', label: 'Ramadan', desc: 'Holy month' },
            { id: 'school-holidays', label: 'School Holidays', desc: 'Family travel' },
            { id: 'custom', label: 'Custom Dates', desc: 'Specific dates' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => handleSeasonSelect(option.id as Season)}
              className={clsx(
                'flex flex-col items-start rounded-xl border p-4 text-left transition-all',
                draft.season === option.id
                  ? 'border-[var(--primary)] bg-[var(--color-primary-soft)]'
                  : 'border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] hover:bg-[var(--borderSubtle)]'
              )}
            >
              <span
                className={clsx(
                  'font-medium',
                  draft.season === option.id ? 'text-[var(--primary)]' : 'text-[var(--text)]'
                )}
              >
                {option.label}
              </span>
              <span className="text-sm text-[var(--textMuted)]">{option.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
