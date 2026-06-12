import { describe, it, expect } from 'vitest';
import { scorePackage, sortByScore } from '@/lib/ranking';
import type { Package } from '@/lib/types';

const basePackage: Package = {
  id: 'pkg-1',
  operatorId: 'op-1',
  title: 'Test Package',
  slug: 'test-package',
  status: 'published',
  pilgrimageType: 'umrah',
  priceType: 'from',
  pricePerPerson: 1500,
  currency: 'GBP',
  totalNights: 10,
  nightsMakkah: 5,
  nightsMadinah: 5,
  distanceBandMakkah: 'near',
  distanceBandMadinah: 'near',
  roomOccupancyOptions: { single: true, double: true, triple: false, quad: false },
  inclusions: { visa: true, flights: true, transfers: true, meals: false },
};

const recentDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 3);
  return d.toISOString();
};

const staleDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 120);
  return d.toISOString();
};

describe('scorePackage', () => {
  it('returns a number between 0 and 1', () => {
    const score = scorePackage(basePackage);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns higher score for a package updated recently vs stale', () => {
    const fresh = { ...basePackage, updatedAt: recentDate() };
    const stale = { ...basePackage, updatedAt: staleDate() };
    expect(scorePackage(fresh)).toBeGreaterThan(scorePackage(stale));
  });

  it('returns higher score for a complete package vs sparse one', () => {
    const complete: Package = {
      ...basePackage,
      updatedAt: recentDate(),
      hotelMakkahName: 'Hilton Makkah',
      hotelMadinahName: 'Hilton Madinah',
      hotelMakkahStars: 5,
      hotelMadinahStars: 5,
      airline: 'Saudia',
      departureAirport: 'LHR',
      flightType: 'direct',
      distanceToHaramMakkahMetres: 200,
      distanceToHaramMadinahMetres: 300,
      depositAmount: 500,
      paymentPlanAvailable: true,
      cancellationPolicy: '14 days',
      highlights: ['Guided tours'],
      groupType: 'small-group',
      seasonLabel: 'Summer 2026',
      dateWindow: { start: '2026-06-01', end: '2026-06-15' },
    };
    const sparse = { ...basePackage, updatedAt: recentDate() };
    expect(scorePackage(complete)).toBeGreaterThan(scorePackage(sparse));
  });

  it('isFeatured flag does NOT affect the neutral score', () => {
    const notFeatured = { ...basePackage, updatedAt: recentDate(), isFeatured: false };
    const featured = { ...basePackage, updatedAt: recentDate(), isFeatured: true };
    expect(scorePackage(featured)).toBeCloseTo(scorePackage(notFeatured), 10);
  });

  it('uses neutral 0.5 response rate when not provided', () => {
    const pkg = { ...basePackage, updatedAt: recentDate() };
    const withDefault = scorePackage(pkg);
    const withExplicit = scorePackage(pkg, 0.5);
    expect(withDefault).toBeCloseTo(withExplicit, 10);
  });

  it('higher response rate raises score', () => {
    const pkg = { ...basePackage, updatedAt: recentDate() };
    expect(scorePackage(pkg, 1.0)).toBeGreaterThan(scorePackage(pkg, 0.0));
  });

  it('returns 0 recency component for updatedAt missing', () => {
    const withDate = { ...basePackage, updatedAt: recentDate() };
    const withoutDate = { ...basePackage };
    expect(scorePackage(withDate)).toBeGreaterThan(scorePackage(withoutDate));
  });
});

describe('sortByScore', () => {
  it('returns packages ordered highest score first', () => {
    const complete: Package = {
      ...basePackage,
      id: 'pkg-complete',
      slug: 'pkg-complete',
      updatedAt: recentDate(),
      hotelMakkahName: 'Hilton',
      hotelMadinahName: 'Hilton Madinah',
      hotelMakkahStars: 5,
      hotelMadinahStars: 5,
      airline: 'Saudia',
      departureAirport: 'LHR',
      flightType: 'direct',
      distanceToHaramMakkahMetres: 200,
      distanceToHaramMadinahMetres: 300,
      depositAmount: 500,
      paymentPlanAvailable: true,
      cancellationPolicy: '14 days',
      highlights: ['Tours'],
      groupType: 'small-group',
      seasonLabel: 'Summer 2026',
      dateWindow: { start: '2026-06-01', end: '2026-06-15' },
    };
    const sparse: Package = { ...basePackage, id: 'pkg-sparse', slug: 'pkg-sparse' };

    const sorted = sortByScore([sparse, complete]);
    expect(sorted[0].id).toBe('pkg-complete');
    expect(sorted[1].id).toBe('pkg-sparse');
  });

  it('does not mutate the original array', () => {
    const pkgs = [
      { ...basePackage, id: 'a', slug: 'a' },
      { ...basePackage, id: 'b', slug: 'b' },
    ];
    const original = pkgs.map((p) => p.id);
    sortByScore(pkgs);
    expect(pkgs.map((p) => p.id)).toEqual(original);
  });

  it('returns empty array unchanged', () => {
    expect(sortByScore([])).toEqual([]);
  });

  it('isFeatured does not change sort position', () => {
    const pkg1: Package = {
      ...basePackage,
      id: 'featured',
      slug: 'featured',
      isFeatured: true,
      updatedAt: staleDate(),
    };
    const pkg2: Package = {
      ...basePackage,
      id: 'normal',
      slug: 'normal',
      isFeatured: false,
      updatedAt: recentDate(),
    };
    const sorted = sortByScore([pkg1, pkg2]);
    // pkg2 is fresh — scores higher regardless of isFeatured
    expect(sorted[0].id).toBe('normal');
  });
});
