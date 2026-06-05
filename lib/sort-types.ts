/**
 * Sort functionality types and utilities for package sorting
 */

export type SortOption = 'recommended' | 'lowest' | 'highest' | 'nearest';

export interface SortState {
  option: SortOption;
  isOpen: boolean;
}

export interface SortOptionConfig {
  value: SortOption;
  label: string;
  description: string;
  icon?: string;
}

export const SORT_OPTIONS: SortOptionConfig[] = [
  {
    value: 'recommended',
    label: 'Recommended',
    description: 'Best packages based on value and quality',
    icon: '⭐'
  },
  {
    value: 'lowest',
    label: 'Lowest Price',
    description: 'Sort by price from lowest to highest',
    icon: '💰'
  },
  {
    value: 'highest',
    label: 'Highest Price',
    description: 'Sort by price from highest to lowest',
    icon: '💎'
  },
  {
    value: 'nearest',
    label: 'Nearest to Kaaba',
    description: 'Sort by distance from the Holy Kaaba',
    icon: '🕋'
  }
];

/**
 * Sort packages based on the selected sort option
 */
export function sortPackages<T extends { price: number; makkahHotel: { distance: string } }>(
  packages: T[],
  sortOption: SortOption
): T[] {
  const sortedPackages = [...packages];

  switch (sortOption) {
    case 'recommended':
      // Recommended: Sort by a combination of factors
      // For now, we'll use price as a proxy for value
      return sortedPackages.sort((a, b) => {
        // Lower price gets higher priority for "recommended"
        const priceScoreA = 1 / (a.price / 1000);
        const priceScoreB = 1 / (b.price / 1000);
        return priceScoreB - priceScoreA;
      });

    case 'lowest':
      return sortedPackages.sort((a, b) => a.price - b.price);

    case 'highest':
      return sortedPackages.sort((a, b) => b.price - a.price);

    case 'nearest':
      return sortedPackages.sort((a, b) => {
        // Extract numeric distance from strings like "0.2km from Haram"
        const distanceA = parseDistance(a.makkahHotel.distance);
        const distanceB = parseDistance(b.makkahHotel.distance);
        return distanceA - distanceB;
      });

    default:
      return sortedPackages;
  }
}

/**
 * Parse distance string to numeric value in meters
 * Handles formats like "0.2km from Haram", "200m from Haram"
 */
function parseDistance(distanceStr: string): number {
  const match = distanceStr.match(/(\d+(?:\.\d+)?)\s*(km|m)/i);
  if (!match) return Infinity; // If can't parse, put at end
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  return unit === 'km' ? value * 1000 : value;
}

/**
 * Get the display label for a sort option
 */
export function getSortLabel(option: SortOption): string {
  const config = SORT_OPTIONS.find(opt => opt.value === option);
  return config?.label || option;
}

/**
 * Get the full configuration for a sort option
 */
export function getSortConfig(option: SortOption): SortOptionConfig | undefined {
  return SORT_OPTIONS.find(opt => opt.value === option);
}
