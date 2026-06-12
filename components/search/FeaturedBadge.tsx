/**
 * FeaturedBadge — rendered at the Featured slot itself, never in a footnote.
 *
 * DMCC Act 2024 Schedule 20: paid placement must be visually distinct and
 * labelled at the slot. This component satisfies that requirement.
 * Only shown when FEATURE_FEATURED_SLOTS=true and isFeatured=true.
 */
export function FeaturedBadge() {
  return (
    <span
      data-testid="featured-badge"
      className="inline-flex items-center gap-1 rounded-full border border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] px-2.5 py-0.5 text-[0.6875rem] font-700 uppercase tracking-wide text-[var(--yellow)]"
      aria-label="Featured listing"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="currentColor"
        aria-hidden="true"
      >
        <polygon points="5,0 6.5,3.5 10,3.8 7.5,6.3 8.2,10 5,8.2 1.8,10 2.5,6.3 0,3.8 3.5,3.5" />
      </svg>
      Featured
    </span>
  );
}
