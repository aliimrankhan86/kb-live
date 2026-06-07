'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

const GROUP_TYPES: { value: Package['groupType']; label: string; description: string }[] = [
  { value: 'private', label: 'Private', description: 'Dedicated group for your party only' },
  { value: 'small-group', label: 'Small group', description: 'Shared with up to ~15 pilgrims' },
  { value: 'large-group', label: 'Large group', description: 'Shared with 16+ pilgrims' },
];

export function WizardStep6Policies({ data, onChange, error }: Props) {
  const policy = data.cancellationPolicy ?? '';
  const groupType = data.groupType ?? 'small-group';
  const charCount = policy.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Policies &amp; group type</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Set cancellation terms and the type of group this package is for.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Cancellation policy */}
      <div>
        <label htmlFor="pkg-cancel-policy" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
          Cancellation policy{' '}
          <span className="text-xs text-[var(--textMuted)] font-normal">(required to publish)</span>
        </label>
        <textarea
          id="pkg-cancel-policy"
          data-testid="wizard-cancellation-policy"
          rows={5}
          placeholder="e.g. Full refund if cancelled 60+ days before departure. 50% refund 30–59 days. No refund within 30 days."
          value={policy}
          onChange={(e) => onChange({ cancellationPolicy: e.target.value || undefined })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none resize-none"
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--textMuted)]">
          <span>{charCount < 10 && charCount > 0 ? 'Minimum 10 characters' : ''}</span>
          <span className={charCount > 1000 ? 'text-red-400' : ''}>{charCount}/1000</span>
        </div>
      </div>

      {/* Group type */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)] uppercase tracking-wide">Group type</h3>
        <div className="space-y-2">
          {GROUP_TYPES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 transition-colors ${
                groupType === value
                  ? 'border-[var(--yellow)]/50 bg-[var(--yellow)]/10'
                  : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]'
              }`}
            >
              <input
                type="radio"
                name="group-type"
                data-testid={`wizard-group-${value}`}
                value={value}
                checked={groupType === value}
                onChange={() => onChange({ groupType: value })}
                className="h-4 w-4 accent-[var(--yellow)]"
              />
              <div>
                <span className={`text-sm font-medium ${groupType === value ? 'text-[var(--yellow)]' : 'text-[var(--text)]'}`}>
                  {label}
                </span>
                <p className="text-xs text-[var(--textMuted)]">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function validateStep6(_data: Partial<Package>): string | null {
  // Cancellation policy required for publish — enforced at Step 8 (publish action)
  // Draft can proceed without it
  return null;
}
