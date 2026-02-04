'use client'

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import PackageList from '@/components/search/PackageList';
import { Repository } from '@/lib/api/repository';
import type { Package as CataloguePackage } from '@/lib/types';
import type { Package as SearchPackage } from '@/lib/mock-packages';
import styles from '@/components/search/packages.module.css';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+';

function filterByParams(packages: CataloguePackage[], params: URLSearchParams): CataloguePackage[] {
  let next = [...packages];
  const type = params.get('type');
  if (type === 'umrah' || type === 'hajj') next = next.filter((p) => p.pilgrimageType === type);
  const season = params.get('season');
  if (season) {
    const s = season.toLowerCase();
    next = next.filter((p) => (p.seasonLabel?.toLowerCase() ?? '').includes(s) || s === 'flexible');
  }
  const budgetMin = params.get('budgetMin');
  if (budgetMin != null && budgetMin !== '') {
    const min = Number(budgetMin);
    if (Number.isFinite(min)) next = next.filter((p) => p.pricePerPerson >= min);
  }
  const budgetMax = params.get('budgetMax');
  if (budgetMax != null && budgetMax !== '') {
    const max = Number(budgetMax);
    if (Number.isFinite(max)) next = next.filter((p) => p.pricePerPerson <= max);
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
  const cataloguePackages = useMemo(() => filterByParams(Repository.listPackages(), searchParams), [searchParams]);
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
