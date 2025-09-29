/**
 * Compare functionality types and utilities for package comparison
 */

export interface CompareState {
  shortlistedPackages: string[];
  isCompareEnabled: boolean;
  compareCount: number;
}

export interface ComparePackage {
  id: string;
  isInShortlist: boolean;
  isInCompare: boolean;
}

/**
 * Check if compare functionality should be enabled
 * Compare is enabled when user has 2 or more packages in shortlist
 */
export function isCompareEnabled(shortlistCount: number): boolean {
  return shortlistCount >= 2;
}

/**
 * Get the compare button text based on shortlist count
 */
export function getCompareButtonText(shortlistCount: number): string {
  if (shortlistCount === 0) {
    return 'Compare the Package';
  } else if (shortlistCount === 1) {
    return 'Compare the Package';
  } else {
    return `Compare ${shortlistCount} packages`;
  }
}

/**
 * Get the compare button aria label for accessibility
 */
export function getCompareAriaLabel(shortlistCount: number): string {
  if (shortlistCount === 0) {
    return 'Add package to compare (requires at least 2 packages)';
  } else if (shortlistCount === 1) {
    return 'Add 1 more package to enable comparison';
  } else {
    return `Compare ${shortlistCount} shortlisted packages`;
  }
}

/**
 * Get the compare button disabled state
 */
export function isCompareDisabled(shortlistCount: number): boolean {
  return shortlistCount < 2;
}

/**
 * Get the compare button visual state class
 */
export function getCompareButtonClass(shortlistCount: number, isInShortlist: boolean): string {
  if (isInShortlist) {
    return 'compareButtonAdded';
  } else if (shortlistCount >= 2) {
    return 'compareButtonEnabled';
  } else {
    return 'compareButtonDisabled';
  }
}
