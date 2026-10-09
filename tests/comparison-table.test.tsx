import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import { ComparisonTable } from '@/components/request/ComparisonTable';
import type { ComparisonRow } from '@/lib/comparison';

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({ json: () => Promise.resolve({ operators: [] }) })
);

// Row A is cheapest, closest, highest-rated and most-included; Row B trails on
// all four. Nights / split / occupancy are identical, so those rows must be
// muted (no mark), and every decisive row must mark exactly Row A.
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

  it('flags the cheapest column once, in neutral words', () => {
    act(() => root.render(<ComparisonTable rows={[rowA, rowB]} />));
    const flags = container.querySelectorAll('[data-testid="comparison-lowest"]');
    expect(flags.length).toBe(1);
    expect(flags[0].textContent).toBe('Lowest price in this comparison');
  });

  it('does not flag a lowest price across different trip lengths, and shows each length (UX-06)', () => {
    act(() => root.render(<ComparisonTable rows={[rowA, { ...rowB, totalNights: 14 }]} />));
    expect(container.querySelector('[data-testid="comparison-lowest"]')).toBeNull();
    const nights = Array.from(container.querySelectorAll('[data-testid="comparison-nights"]')).map((n) => n.textContent);
    expect(nights).toEqual(['7 nights', '14 nights']);
  });

  it('shows the package title beside the operator in each column (UX-05)', () => {
    act(() => root.render(<ComparisonTable rows={[{ ...rowA, title: '7 night Umrah from Gatwick' }, rowB]} />));
    expect(container.querySelector('[data-testid="comparison-package-title"]')?.textContent).toBe('7 night Umrah from Gatwick');
  });

  it('uses factual marks, never "Best" (UX-06, standards §5)', () => {
    act(() => root.render(<ComparisonTable rows={[rowA, rowB]} />));
    const marks = Array.from(container.querySelectorAll('[data-testid="comparison-best"]')).map((m) => m.textContent);
    expect(marks).toEqual([
      'Highest star rating among these packages',
      'Shortest distance among these packages',
      'Most items included among these packages',
    ]);
    expect(container.textContent).not.toMatch(/\bbest\b/i);
    expect(container.querySelector('[data-testid="comparison-marks-note"]')?.textContent).toBe(
      'Marks compare only the packages shown here, using the details each operator gave us.'
    );
  });

  it('marks each decisive dimension (rating, distance, inclusions), not identical rows', () => {
    act(() => root.render(<ComparisonTable rows={[rowA, rowB]} />));
    // 3 ranked rows differ (rating, distance, inclusions) → exactly 3 markers.
    // Nights/split/occupancy are identical, so no marker there.
    const markers = container.querySelectorAll('[data-testid="comparison-best"]');
    expect(markers.length).toBe(3);
  });

  it('renders a Ziyarat row with Yes / No / Not provided (never blank)', () => {
    const yes: ComparisonRow = { ...rowA, id: 'z1', ziyarat: 'Yes' };
    const no: ComparisonRow = { ...rowB, id: 'z2', ziyarat: 'No' };
    const np: ComparisonRow = { ...rowB, id: 'z3', ziyarat: 'Not provided' };
    act(() => root.render(<ComparisonTable rows={[yes, no, np]} />));
    const ziyaratRow = Array.from(container.querySelectorAll('tr')).find(
      (tr) => tr.querySelector('th')?.textContent?.trim() === 'Ziyarat'
    );
    expect(ziyaratRow).toBeTruthy();
    const cells = Array.from(ziyaratRow!.querySelectorAll('td')).map((td) => td.textContent?.trim());
    expect(cells).toEqual(['Yes', 'No', 'Not provided']);
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
    // All ranked dimensions now equal → no marks, no lowest price flag.
    expect(container.querySelectorAll('[data-testid="comparison-best"]').length).toBe(0);
    expect(container.querySelector('[data-testid="comparison-lowest"]')).toBeNull();
  });
});
