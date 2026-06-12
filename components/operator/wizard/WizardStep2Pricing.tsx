'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

export function WizardStep2Pricing({ data, onChange, error }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Pricing</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Set the price and payment options for this package.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Price per person */}
        <div>
          <label htmlFor="pkg-price" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Price per person (£) <span aria-hidden="true" className="text-[var(--color-error)]">*</span>
          </label>
          <input
            id="pkg-price"
            type="number"
            data-testid="wizard-price"
            min="1"
            step="1"
            aria-required="true"
            placeholder="e.g. 1499"
            value={data.pricePerPerson ?? ''}
            onChange={(e) => onChange({ pricePerPerson: parseFloat(e.target.value) || 0 })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>

        {/* Price type */}
        <div>
          <label htmlFor="pkg-price-type" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Price type <span aria-hidden="true" className="text-[var(--color-error)]">*</span>
          </label>
          <select
            id="pkg-price-type"
            data-testid="wizard-price-type"
            value={data.priceType ?? 'from'}
            onChange={(e) => onChange({ priceType: e.target.value as 'exact' | 'from' })}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          >
            <option value="from">From (starting price)</option>
            <option value="exact">Exact price</option>
          </select>
        </div>
      </div>

      {/* Currency — GBP only (MVP C8) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">Currency</label>
        <div className="flex items-center gap-2 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5 text-sm text-[var(--textMuted)]">
          GBP (£) — UK market only
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Deposit amount */}
        <div>
          <label htmlFor="pkg-deposit" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Deposit amount (£)
          </label>
          <input
            id="pkg-deposit"
            type="number"
            data-testid="wizard-deposit"
            min="0"
            step="1"
            placeholder="e.g. 200 (optional)"
            value={data.depositAmount ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onChange({ depositAmount: isNaN(v) ? undefined : v });
            }}
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>

        {/* Payment plan */}
        <div className="flex flex-col justify-end">
          <label className="flex cursor-pointer items-center gap-3 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5">
            <input
              type="checkbox"
              data-testid="wizard-payment-plan"
              checked={data.paymentPlanAvailable ?? false}
              onChange={(e) => onChange({ paymentPlanAvailable: e.target.checked })}
              className="h-4 w-4 rounded border-[rgba(255,255,255,0.3)] bg-transparent accent-[var(--yellow)]"
            />
            <span className="text-sm text-[var(--textMuted)]">Payment plan available</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function validateStep2(data: Partial<Package>): string | null {
  if (!data.pricePerPerson || data.pricePerPerson <= 0) return 'Price per person must be greater than 0.';
  if (!data.priceType) return 'Please select a price type.';
  return null;
}
