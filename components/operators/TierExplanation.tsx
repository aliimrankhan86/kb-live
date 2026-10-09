import Link from 'next/link';
import { VERIFICATION_STATEMENT_SHORT } from '@/lib/content-rules';
import { VERIFICATION_STATEMENT_HREF } from '@/components/ui/VerifiedBadge';

interface TierExplanationProps {
  /** verificationStatus === 'verified'. Public pages only show verified operators. */
  verified: boolean;
}

/**
 * "How we verify operators" (UX-15). Follows the operator's verification
 * status, so it never says "Listed: basic details collected" under a
 * "Verified operator" badge. Claims only the §7 checks, linked in full.
 */
export function TierExplanation({ verified }: TierExplanationProps) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        verified
          ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--text)]'
          : 'border-[var(--borderSubtle)] text-[var(--textMuted)]'
      }`}
      data-testid="tier-explanation"
    >
      <p className="font-semibold">{verified ? 'How we verify operators' : 'Verification not complete'}</p>
      <p className="mt-1">
        {verified ? VERIFICATION_STATEMENT_SHORT : 'We have not finished our checks on this operator.'}{' '}
        <Link href={VERIFICATION_STATEMENT_HREF} className="underline underline-offset-2">
          Full statement
        </Link>
      </p>
    </div>
  );
}
