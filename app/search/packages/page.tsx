'use client'

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import PackageList from '@/components/search/PackageList';
import { Repository } from '@/lib/api/repository';
import type { Package as CataloguePackage } from '@/lib/types';
import type { Package as SearchPackage } from '@/lib/mock-packages';
import styles from '@/components/search/packages.module.css';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+';

/** Map URL season param to catalogue seasonLabel values (local to this page). */
const SEASON_QUERY_TO_LABELS: Record<string, string[]> = {
  ramadan: ['Ramadan', 'ramadan'],
  'school-holidays': ['Christmas', 'Easter', 'School Holidays', 'school-holidays', 'Hajj'],
  flexible: [],
};

function filterByParams(packages: CataloguePackage[], params: URLSearchParams): CataloguePackage[] {
  let next = [...packages];
  const type = params.get('type');
  if (type === 'umrah' || type === 'hajj') next = next.filter((p) => p.pilgrimageType === type);
  const season = params.get('season');
  if (season) {
    const s = season.toLowerCase();
    const labels = SEASON_QUERY_TO_LABELS[s];
    if (labels && labels.length > 0) {
      const set = new Set(labels.map((l) => l.toLowerCase()));
      next = next.filter((p) => set.has((p.seasonLabel ?? '').toLowerCase()));
    } else if (s !== 'flexible') {
      next = next.filter((p) => (p.seasonLabel?.toLowerCase() ?? '').includes(s));
    }
  }
  const budgetMin = params.get('budgetMin');
  const budgetMax = params.get('budgetMax');
  const minNum = budgetMin != null && budgetMin !== '' ? Number(budgetMin) : NaN;
  const maxNum = budgetMax != null && budgetMax !== '' ? Number(budgetMax) : NaN;
  if (Number.isFinite(minNum)) next = next.filter((p) => p.pricePerPerson >= minNum);
  if (Number.isFinite(maxNum)) {
    const afterMax = next.filter((p) => p.pricePerPerson <= maxNum);
    if (afterMax.length > 0) next = afterMax;
  }
  return next;
}

function toSearchDisplay(pkg: CataloguePackage): SearchPackage & { slug: string } {
  const dist = (b: string) => (b === 'near' ? 'Near Haram' : b === 'far' ? 'Far' : b === 'medium' ? 'Medium' : '–');
  return {
    id: pkg.id,
    slug: pkg.slug,
    departure: { date: pkg.dateWindow?.start ?? 'TBC', duration: '–', route: '–' },
    return: { date: pkg.dateWindow?.end ?? 'TBC', duration: '–', route: '–' },
    makkahHotel: {
      name: pkg.title,
      location: 'Makkah',
      rating: pkg.hotelMakkahStars ?? 4,
      distance: dist(pkg.distanceBandMakkah),
      image: PLACEHOLDER_IMAGE,
    },
    madinaHotel: {
      name: pkg.title,
      location: 'Madinah',
      rating: pkg.hotelMadinahStars ?? 4,
      distance: dist(pkg.distanceBandMadinah),
      image: PLACEHOLDER_IMAGE,
    },
    price: pkg.pricePerPerson,
    currency: pkg.currency,
    priceNote: pkg.priceType === 'from' ? 'From per person' : 'Per person',
  };
}

function SearchPackagesContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cataloguePackages = useMemo(() => {
    if (!mounted) return [];
    return filterByParams(Repository.listPackages(), searchParams);
  }, [mounted, searchParams]);
  const displayPackages = useMemo(() => cataloguePackages.map(toSearchDisplay), [cataloguePackages]);
  return (
    <main className={styles.searchPage}>
      <h1 className="sr-only">Search Results - Amazing Hajj and Umrah Packages</h1>
      <PackageList packages={displayPackages} cataloguePackages={cataloguePackages} />
    </main>
  );
}

export default function SearchPackagesPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className={styles.searchPage}><p className="sr-only">Loading…</p></main>}>
        <SearchPackagesContent />
      </Suspense>
    </>
  );
}
