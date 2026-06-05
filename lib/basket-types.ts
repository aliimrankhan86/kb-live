/**
 * Basket functionality types and utilities for package basket management
 */

export interface BasketState {
  basketedPackages: string[];
  isBasketEnabled: boolean;
  basketCount: number;
}

export interface BasketPackage {
  id: string;
  isInBasket: boolean;
}

/**
 * Get the basket button text based on basket state
 */
export function getBasketButtonText(isInBasket: boolean): string {
  return isInBasket ? 'Remove from Basket' : 'Add to Basket';
}

/**
 * Get the basket button aria label for accessibility
 */
export function getBasketAriaLabel(isInBasket: boolean, packageName: string): string {
  return `${isInBasket ? 'Remove' : 'Add'} ${packageName} ${isInBasket ? 'from' : 'to'} basket`;
}

/**
 * Get the basket button visual state class
 */
export function getBasketButtonClass(isInBasket: boolean): string {
  return isInBasket ? 'basketButtonAdded' : 'basketButtonDefault';
}

/**
 * Get the basket count display text
 */
export function getBasketCountText(basketCount: number): string {
  if (basketCount === 0) {
    return 'No packages in basket';
  } else if (basketCount === 1) {
    return '1 package in basket';
  } else {
    return `${basketCount} packages in basket`;
  }
}

/**
 * Get the basket count aria label for accessibility
 */
export function getBasketCountAriaLabel(basketCount: number): string {
  return `${basketCount} packages in basket`;
}
