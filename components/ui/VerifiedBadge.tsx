import React from 'react'

interface VerifiedBadgeProps {
  className?: string
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md border border-[var(--yellow)]/20 bg-[var(--yellow)]/10 px-2 py-0.5 text-xs font-medium text-[var(--yellow)] ${className}`}
    title="Verified operator"
    data-testid="verified-badge"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    Verified
  </span>
)