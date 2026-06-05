import React from 'react'

export interface InclusionChipData {
  label: string
  included: boolean
}

interface InclusionChipProps {
  chip: InclusionChipData
}

export const InclusionChip: React.FC<InclusionChipProps> = ({ chip }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border ${
      chip.included
        ? 'border-green-500/30 bg-green-500/10 text-green-300'
        : 'border-[var(--border)] bg-[var(--surfaceDark)] text-[var(--textMuted)]'
    }`}
    data-testid={`inclusion-chip-${chip.label.toLowerCase()}`}
  >
    <span aria-hidden="true">{chip.included ? '✓' : '—'}</span>
    {chip.label}
  </span>
)

export const InclusionChipList: React.FC<{ chips: InclusionChipData[]; className?: string; 'data-testid'?: string }> = ({
  chips,
  className = '',
  'data-testid': testId,
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`} data-testid={testId ?? 'inclusion-chip-list'}>
    {chips.map((chip) => (
      <InclusionChip key={chip.label} chip={chip} />
    ))}
  </div>
)