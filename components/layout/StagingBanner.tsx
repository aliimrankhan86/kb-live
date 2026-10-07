import { isProduction } from '@/lib/env';

export const STAGING_BANNER_TEXT =
  'Test site. All operators, packages and enquiries here are fictional. Do not enter real personal details.';

/** Non-production only. Not dismissible. Brand pair: 14:1 (dark) and 6.5:1 (light) contrast. */
export function StagingBanner() {
  if (isProduction()) return null;
  return (
    <div
      role="note"
      data-testid="staging-banner"
      className="bg-[var(--color-primary)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-text-on-brand)]"
    >
      {STAGING_BANNER_TEXT}
    </div>
  );
}
