'use client';

import { useQuoteRequestStore } from '@/lib/store/quote-request';
import { Slider } from '@/components/ui/Slider';

export function Step4GroupBudget() {
  const { draft, setDraft } = useQuoteRequestStore();

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
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Group Size & Rooms</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
          How many rooms do you need?
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { id: 'single', label: 'Single' },
            { id: 'double', label: 'Double' },
            { id: 'triple', label: 'Triple' },
            { id: 'quad', label: 'Quad' },
          ].map((room) => (
            <div key={room.id} className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 text-center">
              <label className="block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                {room.label}
              </label>
              <input
                type="number"
                min="0"
                value={draft.occupancy?.[room.id as keyof typeof draft.occupancy] || 0}
                onChange={(e) =>
                  handleOccupancyChange(
                    room.id as 'single' | 'double' | 'triple' | 'quad',
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-2 block w-full rounded border border-[rgba(255,255,255,0.1)] bg-transparent px-2 py-1 text-center text-[#FFFFFF] focus:border-[#FFD31D] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Budget per Person</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
          Adjust the range (GBP)
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
                  currency: draft.budgetRange?.currency || 'GBP',
                  min: vals[0],
                  max: vals[1],
                },
              })
            }
          />
          <div className="mt-4 flex justify-between text-sm text-[#FFD31D]">
            <span>£{draft.budgetRange?.min || 1000}</span>
            <span>£{draft.budgetRange?.max || 5000}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Inclusions</h2>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.64)]">
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
              className="flex items-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4"
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
                className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)] text-[#FFD31D] focus:ring-[#FFD31D]"
              />
              <label
                htmlFor={`inc-${inc.id}`}
                className="ml-3 text-sm font-medium text-[#FFFFFF]"
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
