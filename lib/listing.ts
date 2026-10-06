import type { OperatorProfile } from '@/lib/types';

/**
 * Public-listing rule: an admin has verified the operator AND it has an ATOL
 * number on file. This is what makes "we check each operator's ATOL number
 * before listing" true (standards §7). Packages, profiles, the operator list,
 * departure airports and the sitemap all use this one predicate.
 */
export const isPubliclyListed = (o: Pick<OperatorProfile, 'verificationStatus' | 'atolNumber'>): boolean =>
  o.verificationStatus === 'verified' && Boolean(o.atolNumber?.trim());
