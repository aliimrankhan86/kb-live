import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import { ComparisonTable } from '@/components/request/ComparisonTable';
import type { ComparisonRow } from '@/lib/comparison';

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({ json: () => Promise.resolve({ operators: [] }) })
);

// Row A is cheapest, closest, best-rated and most-included; Row B loses on all
// four. Nights / split / occupancy are identical, so those rows must be muted
// (no "Best" marker), and every decisive row must crown exactly Row A.
const rowA: ComparisonRow = {
  id: 'a',
  price: '£799',
  operatorName: 'Makkah Tours',
  totalNights: 7,
  splitNights: '4 / 3',
  hotelRating: 'Makkah 5 / Madinah 5',
  distance: 'Makkah 0-500m',
  occupancy: 'Double',
  inclusions: 'Visa, Flights',
  notes: 'Not provided',
  priceValue: 799,
  hotelStarsValue: 5,
  distanceValue: 400,
  inclusionsCount: 2,
};

const rowB: ComparisonRow = {
  id: 'b',
  price: '£1,099',
  operatorName: 'Zam Zam Travel',
  totalNights: 7,
  splitNights: '4 / 3',
  hotelRating: 'Makkah 3 / Madinah 3',
  distance: 'Makkah 500m-1km',
  occupancy: 'Double',
  inclusions: 'Visa',
  notes: 'Not provided',
  priceValue: 1099,
  hotelStarsValue: 3,
  distanceValue: 1200,
  inclusionsCount: 1,
};

describe('ComparisonTable decision aids', () => {
  let container: HTMLElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('flags the cheapest column once', () => {
    act(() => root.render(<ComparisonTable rows={[rowA, rowB]} />));
    const matches = container.textContent?.match(/Lowest price/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('marks "Best" on each decisive dimension (rating, distance, inclusions) — not on identical rows', () => {
    act(() => root.render(<ComparisonTable rows={[rowA, rowB]} />));
    // 3 ranked rows differ (rating, distance, inclusions) → exactly 3 markers.
    // Nights/split/occupancy are identical, so no marker there.
    const markers = container.querySelectorAll('[data-testid="comparison-best"]');
    expect(markers.length).toBe(3);
  });

  it('does not crown a winner when ranked values tie', () => {
    const tie: ComparisonRow = {
      ...rowB,
      price: '£799',
      priceValue: 799,
      hotelStarsValue: 5,
      distanceValue: 400,
      inclusionsCount: 2,
    };
    act(() => root.render(<ComparisonTable rows={[rowA, tie]} />));
    // All ranked dimensions now equal → no "Best" markers, no "Lowest price".
    expect(container.querySelectorAll('[data-testid="comparison-best"]').length).toBe(0);
    expect(container.textContent).not.toContain('Lowest price');
  });
});
