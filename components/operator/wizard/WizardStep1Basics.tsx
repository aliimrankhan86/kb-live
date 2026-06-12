'use client';

import type { Package } from '@/lib/types';

interface Props {
  data: Partial<Package>;
  onChange: (updates: Partial<Package>) => void;
  error: string | null;
}

export function WizardStep1Basics({ data, onChange, error }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Basic information</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Tell us about your package.</p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="pkg-title" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
          Package title <span aria-hidden="true" className="text-[var(--color-error)]">*</span>
        </label>
        <input
          id="pkg-title"
          type="text"
          data-testid="wizard-title"
          required
          aria-required="true"
          placeholder="e.g. Premium Umrah Package — Ramadan 2027"
          value={data.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
        />
        <p className="mt-1 text-xs text-[var(--textMuted)]">{(data.title ?? '').length}/120</p>
      </div>

      {/* Pilgrimage type */}
      <div>
        <label htmlFor="pkg-type" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
          Type <span aria-hidden="true" className="text-[var(--color-error)]">*</span>
        </label>
        <select
          id="pkg-type"
          data-testid="wizard-type"
          aria-required="true"
          value={data.pilgrimageType ?? 'umrah'}
          onChange={(e) => onChange({ pilgrimageType: e.target.value as 'umrah' | 'hajj' })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
        >
          <option value="umrah">Umrah</option>
          <option value="hajj">Hajj</option>
        </select>
      </div>

      {/* Season label */}
      <div>
        <label htmlFor="pkg-season" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
          Season label
        </label>
        <input
          id="pkg-season"
          type="text"
          data-testid="wizard-season"
          placeholder="e.g. Ramadan, School Holidays, Flexible"
          value={data.seasonLabel ?? ''}
          onChange={(e) => onChange({ seasonLabel: e.target.value })}
          className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus:border-[var(--yellow)] focus:outline-none"
        />
      </div>

      {/* Date range */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pkg-date-start" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Departure from
          </label>
          <input
            id="pkg-date-start"
            type="date"
            data-testid="wizard-date-start"
            value={data.dateWindow?.start ?? ''}
            onChange={(e) =>
              onChange({ dateWindow: { ...(data.dateWindow ?? { end: '', flexible: true }), start: e.target.value } })
            }
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="pkg-date-end" className="mb-1.5 block text-sm font-medium text-[var(--textMuted)]">
            Return by
          </label>
          <input
            id="pkg-date-end"
            type="date"
            data-testid="wizard-date-end"
            value={data.dateWindow?.end ?? ''}
            onChange={(e) =>
              onChange({ dateWindow: { ...(data.dateWindow ?? { start: '', flexible: true }), end: e.target.value } })
            }
            className="w-full rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--yellow)] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export function validateStep1(data: Partial<Package>): string | null {
  const title = (data.title ?? '').trim();
  if (!title) return 'Package title is required.';
  if (title.length < 5) return 'Title must be at least 5 characters.';
  if (title.length > 120) return 'Title must be 120 characters or fewer.';
  if (!data.pilgrimageType) return 'Please select a pilgrimage type.';
  return null;
}
