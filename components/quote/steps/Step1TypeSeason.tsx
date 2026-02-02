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
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Select Pilgrimage Type</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
          Are you planning for Umrah or Hajj?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTypeSelect('umrah')}
            className={clsx(
              'rounded-xl border p-6 text-center transition-all',
              draft.type === 'umrah'
                ? 'border-[#FFD31D] bg-[rgba(255,211,29,0.1)] text-[#FFD31D]'
                : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.1)]'
            )}
          >
            <span className="block text-lg font-medium">Umrah</span>
          </button>
          <button
            onClick={() => handleTypeSelect('hajj')}
            className={clsx(
              'rounded-xl border p-6 text-center transition-all',
              draft.type === 'hajj'
                ? 'border-[#FFD31D] bg-[rgba(255,211,29,0.1)] text-[#FFD31D]'
                : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.1)]'
            )}
          >
            <span className="block text-lg font-medium">Hajj</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Select Season</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
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
                  ? 'border-[#FFD31D] bg-[rgba(255,211,29,0.1)]'
                  : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
              )}
            >
              <span
                className={clsx(
                  'font-medium',
                  draft.season === option.id ? 'text-[#FFD31D]' : 'text-[#FFFFFF]'
                )}
              >
                {option.label}
              </span>
              <span className="text-sm text-[rgba(255,255,255,0.64)]">{option.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
