import type { OperatorProfile, Package } from '@/lib/types';

/**
 * Public-listing rule: an admin has verified the operator AND it has an ATOL
 * number on file. This is what makes "we check each operator's ATOL number
 * before listing" true (standards §7). Packages, profiles, the operator list,
 * departure airports and the sitemap all use this one predicate.
 */
export const isPubliclyListed = (o: Pick<OperatorProfile, 'verificationStatus' | 'atolNumber'>): boolean =>
  o.verificationStatus === 'verified' && Boolean(o.atolNumber?.trim());

/** Today's calendar date in London as yyyy-mm-dd (en-CA prints ISO order). */
export const londonToday = (now = new Date()): string =>
  now.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });

/**
 * A departure has passed when its start date is before today in London, or the
 * nightly expire-packages cron has marked it expired. It then leaves every
 * public list (search, browse, compare, operator page, sitemap, airports) and
 * its own page says so. A package with no start date is kept: nothing to compare.
 */
export const hasDeparted = (p: Pick<Package, 'status' | 'dateWindow'>, today = londonToday()): boolean =>
  p.status === 'expired' || Boolean(p.dateWindow?.start && p.dateWindow.start < today);

/**
 * The yyyy-mm-dd day of a stored date_window end, or null when it is empty,
 * missing or not a real calendar date (the wizard saves '' when only a start
 * date is entered). A trailing time is ignored, as Postgres' ::date cast did.
 */
export const storedEndDay = (value: string | null | undefined): string | null => {
  const m = value?.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
  if (!m) return null;
  const d = new Date(`${m[1]}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === m[1] ? m[1] : null;
};
