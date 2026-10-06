import { VERIFICATION_STATEMENT } from '@/lib/content-rules';
import type { OperatorTier } from '@/lib/types';

const TIER_COPY: Record<OperatorTier, { label: string; description: string; colour: string }> = {
  listed: {
    label: 'Listed',
    description: 'This operator is registered on PilgrimCompare. Basic details have been collected.',
    colour: 'text-[var(--textMuted)] border-[var(--borderSubtle)] bg-transparent',
  },
  verified: {
    label: 'Verified',
    // Standards §7: say exactly what we check, nothing more.
    description: VERIFICATION_STATEMENT,
    colour: 'text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success)]/10',
  },
  verified_plus: {
    // No enhanced checks or feedback reviews exist, so this tier claims nothing extra.
    label: 'Verified',
    description: VERIFICATION_STATEMENT,
    colour: 'text-[var(--yellow)] border-[var(--yellow)]/30 bg-[rgba(255,211,29,0.06)]',
  },
};

interface TierExplanationProps {
  tier: OperatorTier;
}

export function TierExplanation({ tier }: TierExplanationProps) {
  const config = TIER_COPY[tier] ?? TIER_COPY.listed;

  return (
    <div
      className={`inline-flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${config.colour}`}
      data-testid="tier-explanation"
    >
      <span className="font-semibold shrink-0">{config.label}:</span>
      <span>{config.description}</span>
    </div>
  );
}
