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
 * Get the compare button text based on compare state
 */
export function getCompareButtonText(shortlistCount: number, isInCompare: boolean = false, compareCount: number = 0): string {
  if (isInCompare) {
    return 'Remove from Compare';
  } else if (compareCount >= 3) {
    return 'Max 3 packages';
  } else {
    return 'Compare the Package';
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
 * Allow clicking to add packages to compare even when shortlist count is low
 */
export function isCompareDisabled(shortlistCount: number): boolean {
  return false; // Always allow clicking to add/remove from compare
}

/**
 * Get the compare button visual state class
 */
export function getCompareButtonClass(shortlistCount: number, isInShortlist: boolean, isInCompare: boolean): string {
  if (isInCompare) {
    return 'compareButtonActive';
  } else {
    return 'compareButtonDefault';
  }
}
