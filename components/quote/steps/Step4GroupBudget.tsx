'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';
import { Slider } from '@/components/ui/Slider';
import { getCurrencySymbol } from '@/lib/i18n/format';

export function Step4GroupBudget() {
  const { draft, setDraft } = useQuoteRequestStore();
  const budgetCurrency = draft.budgetRange?.currency || 'GBP';
  const currencySymbol = getCurrencySymbol(budgetCurrency);

  const handleOccupancyChange = (type: 'single' | 'double' | 'triple' | 'quad', val: number) => {
    setDraft({
      occupancy: {
        ...draft.occupancy!,
        [type]: val,
      },
    });
  };

  const handleInclusionToggle = (key: keyof NonNullable<typeof draft.inclusions>) => {
    if (!draft.inclusions) return;
    setDraft({
      inclusions: {
        ...draft.inclusions,
        [key]: !draft.inclusions[key],
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Group Size & Rooms</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          How many rooms do you need?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { id: 'single', label: 'Single' },
            { id: 'double', label: 'Double' },
            { id: 'triple', label: 'Triple' },
            { id: 'quad', label: 'Quad' },
          ].map((room) => (
            <div key={room.id} className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] p-4 text-center">
              <label htmlFor={`room-${room.id}`} className="block text-sm font-medium text-[var(--color-text-secondary)]">
                {room.label}
              </label>
              <input
                id={`room-${room.id}`}
                type="number"
                inputMode="numeric"
                min="0"
                value={draft.occupancy?.[room.id as keyof typeof draft.occupancy] || 0}
                onChange={(e) =>
                  handleOccupancyChange(
                    room.id as 'single' | 'double' | 'triple' | 'quad',
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-2 block min-h-[44px] w-full rounded border border-[var(--borderSubtle)] bg-transparent px-2 py-2 text-center text-[var(--text)] focus:border-[var(--focusRing)] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Budget per Person</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Adjust the range ({budgetCurrency})
        </p>
        <div className="mt-8 px-2">
          <Slider
            min={500}
            max={10000}
            step={100}
            value={[draft.budgetRange?.min || 1000, draft.budgetRange?.max || 5000]}
            onValueChange={(vals) =>
              setDraft({
                budgetRange: {
                  currency: budgetCurrency,
                  min: vals[0],
                  max: vals[1],
                },
              })
            }
          />
          <div className="mt-4 flex justify-between text-sm text-[var(--yellow)]">
            <span>{currencySymbol}{draft.budgetRange?.min || 1000}</span>
            <span>{currencySymbol}{draft.budgetRange?.max || 5000}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Inclusions</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          What should be included in the package?
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { id: 'visa', label: 'Visa Processing' },
            { id: 'flights', label: 'Flights' },
            { id: 'transfers', label: 'Ground Transfers' },
            { id: 'meals', label: 'Meals' },
          ].map((inc) => (
            <div
              key={inc.id}
              className="flex items-center rounded-lg border border-[var(--borderSubtle)] bg-[var(--color-surface-subtle)] p-4"
            >
              <input
                type="checkbox"
                id={`inc-${inc.id}`}
                checked={
                  draft.inclusions?.[inc.id as keyof typeof draft.inclusions] || false
                }
                onChange={() =>
                  handleInclusionToggle(inc.id as keyof typeof draft.inclusions)
                }
                className="h-4 w-4 rounded border-[var(--borderStrong)] bg-[var(--color-surface-subtle)] text-[var(--primary)] focus:ring-[var(--focusRing)]"
              />
              <label
                htmlFor={`inc-${inc.id}`}
                className="ml-3 text-sm font-medium text-[var(--text)]"
              >
                {inc.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
