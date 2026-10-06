import React from 'react'
import Link from 'next/link'

interface VerifiedBadgeProps {
  className?: string
}

/** Where the §7 verification statement lives. Every "Verified" claim links here. */
export const VERIFICATION_STATEMENT_HREF = '/how-we-rank#verification-heading'

// Standards §7: the "Verified" badge must link to what verification checks.
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className = '' }) => (
  <Link
    href={VERIFICATION_STATEMENT_HREF}
    className={`inline-flex items-center gap-1 rounded-md border border-[var(--yellow)]/20 bg-[var(--yellow)]/10 px-2 py-0.5 text-xs font-medium text-[var(--yellow)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-[var(--focusRing)] ${className}`}
    title="Verified operator"
    aria-label="Verified operator: see what we check"
    data-testid="verified-badge"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    Verified
  </Link>
)
