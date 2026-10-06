'use client'



import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Package as CataloguePackage, OperatorProfile } from '@/lib/types';
import { FILTER_PARAM_KEYS, makkahDistance, parseSearchCriteria, toPackageCardProps, type SearchPackageDisplay } from './search-utils';
import { mapPackageToComparison, handleComparisonSelection } from '@/lib/comparison';
import { ComparisonTable } from '@/components/request/ComparisonTable';
import {
  Dialog,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';
import PackageCard from './PackageCard';
import CompareBar, { type CompareBarItem } from './CompareBar';
import { FilterOverlay } from './FilterOverlay';
import { FeaturedBadge } from './FeaturedBadge';
import { NEUTRAL_SORT_DISCLOSURE } from '@/lib/content-rules';
import { formatDateRange } from '@/lib/packages/display';
import { Pagination } from '@/components/ui/Pagination';
import styles from './packages.module.css';

const PACKAGES_PER_PAGE = 5;

const COMPARE_MAX = 3;
const COMPARE_MIN = 2;
const FEATURED_MAX = 2;

const SHORTLIST_STORAGE_KEY = 'kb_shortlist_packages';
const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

export type { SearchPackageDisplay } from './search-utils';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'distance';


/** A package that meets the must-haves but not every preference. */
export interface CloseMatchItem {
  pkg: CataloguePackage;
  unmet: string[];
}

interface PackageListProps {
  packages: SearchPackageDisplay[];
  cataloguePackages?: CataloguePackage[];
  /** Shown under the exact matches when they are few; each lists what differs. */
  closeMatches?: CloseMatchItem[];
  onFilter?: () => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  /** Evaluated server-side from FEATURE_FEATURED_SLOTS env var. Never pass client state here. */
  featuredSlotsEnabled?: boolean;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  cataloguePackages,
  closeMatches = [],
  onFilter,
  sortBy: sortByProp,
  onSortChange,
  featuredSlotsEnabled = false,
}) => {
  const [shortlistedPackages, setShortlistedPackages] = useState<string[]>([]);
  const [shortlistLoaded, setShortlistLoaded] = useState(false);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [compareMessage, setCompareMessage] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [operatorsById, setOperatorsById] = useState<Record<string, OperatorProfile>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalSort, setInternalSort] = useState<SortOption>('relevance');
  const sortBy = sortByProp ?? internalSort;
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  // Page lives in the URL so reload, shared links and Back restore the same view.
  const pageParam = Number(searchParams?.get('page'));
  const requestedPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!isSortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  useEffect(() => {
    fetch('/api/operators')
      .then((r) => r.json())
      .then((d) => {
        if (d.operators) {
          setOperatorsById(
            (d.operators as OperatorProfile[]).reduce<Record<string, OperatorProfile>>(
              (acc, op) => ({ ...acc, [op.id]: op }),
              {}
            )
          );
        }
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setShortlistedPackages(Array.isArray(parsed) ? uniqueIds(parsed) : []);
    } catch {
      setShortlistedPackages([]);
    } finally {
      setShortlistLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!shortlistLoaded || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(uniqueIds(shortlistedPackages)));
    } catch {
      /* ignore */
    }
  }, [shortlistLoaded, shortlistedPackages]);

  const onToggleShortlist = (packageId: string) => {
    setShortlistedPackages((prev) => uniqueIds(prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]));
  };

  const onToggleCompare = (packageId: string) => {
    setCompareMessage('');
    setSelectedCompareIds((prev) => {
      try {
        return handleComparisonSelection(prev, packageId);
      } catch (err) {
        setCompareMessage((err as Error).message);
        return prev;
      }
    });
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  // Clear every narrowing param (location and dates included) so "Clear all"
  // can never leave the traveller stuck on an empty page. Type + sort stay.
  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    [...FILTER_PARAM_KEYS, 'page'].forEach((k) => params.delete(k));
    router.replace(`${pathname}?${params.toString()}`);
    onFilter?.();
  };



  const shortlistCount = shortlistedPackages.length;

  // Split featured from normal when flag is on.
  // Featured packages are excluded from the neutral sort and shown above it.
  const featuredPackages = useMemo(
    () =>
      featuredSlotsEnabled && !shortlistOnly
        ? packages.filter((p) => p.isFeatured).slice(0, FEATURED_MAX)
        : [],
    [packages, featuredSlotsEnabled, shortlistOnly]
  );

  const normalPackages = useMemo(
    () =>
      featuredSlotsEnabled
        ? packages.filter((p) => !p.isFeatured)
        : packages,
    [packages, featuredSlotsEnabled]
  );

  // Sort normal packages (featured are already above, not sorted with normal results)
  const sortedPackages = useMemo(() => {
    const sorted = [...normalPackages];
    switch (sortBy) {
      case 'relevance':
        // Server already applied neutral quality sort — preserve that order.
        return sorted;
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating': {
        // Missing ratings are not inferred — they sort to the bottom (treated as
        // 0 for ordering only; the card still shows "Not provided").
        const ratingScore = (p: typeof sorted[number]) =>
          (p.makkahHotel.rating ?? 0) + (p.madinaHotel.rating ?? 0);
        return sorted.sort((a, b) => ratingScore(b) - ratingScore(a));
      }
      case 'distance': {
        // Closest Makkah hotel first; not-provided distances sort last.
        const byId = new Map((cataloguePackages ?? []).map((p) => [p.id, p]));
        const d = (id: string) => {
          const p = byId.get(id);
          return p ? makkahDistance(p) : Infinity;
        };
        return sorted.sort((a, b) => {
          const x = d(a.id);
          const y = d(b.id);
          return x === y ? 0 : x < y ? -1 : 1;
        });
      }
      default:
        return sorted;
    }
  }, [normalPackages, sortBy, cataloguePackages]);

  const listPackages = shortlistOnly
    ? sortedPackages.filter((p) => shortlistedPackages.includes(p.id))
    : sortedPackages;

  const totalPages = Math.ceil(listPackages.length / PACKAGES_PER_PAGE);
  const currentPage = Math.min(requestedPage, Math.max(1, totalPages));
  const pagedPackages = listPackages.slice(
    (currentPage - 1) * PACKAGES_PER_PAGE,
    currentPage * PACKAGES_PER_PAGE
  );

  const compareFull = selectedCompareIds.length >= COMPARE_MAX;
  const comparablePackages = useMemo(
    () => [...(cataloguePackages ?? []), ...closeMatches.map((m) => m.pkg)],
    [cataloguePackages, closeMatches]
  );
  const comparisonRows = useMemo(() => {
    if (!comparablePackages.length) return [];
    return comparablePackages
      .filter((p) => selectedCompareIds.includes(p.id))
      .map((p) => mapPackageToComparison(p, operatorsById[p.operatorId]));
  }, [comparablePackages, operatorsById, selectedCompareIds]);

  // Labels for the sticky compare bar — operator name keeps it human.
  const compareItems = useMemo<CompareBarItem[]>(() => {
    return selectedCompareIds.map((id) => {
      const catPkg = comparablePackages.find((p) => p.id === id);
      const operator = catPkg ? operatorsById[catPkg.operatorId] : undefined;
      return {
        id,
        label: operator?.companyName ?? catPkg?.title ?? 'Selected package',
      };
    });
  }, [selectedCompareIds, comparablePackages, operatorsById]);

  const openComparison = () => {
    // Defer past the current event tick so Radix DismissableLayer doesn't treat
    // this click as an "outside" click and immediately re-close the dialog.
    if (selectedCompareIds.length >= COMPARE_MIN) {
      setTimeout(() => setShowComparison(true), 0);
    }
  };

  const searchCriteria = useMemo(
    () => parseSearchCriteria(searchParams ?? new URLSearchParams()),
    [searchParams]
  );

  // Applied filters, as removable chips — makes filter state visible on the page
  // (previously it vanished into the URL with no on-screen cue).
  const activeFilters = useMemo(() => {
    const sp = searchParams;
    const chips: { id: string; label: string; keys: string[] }[] = [];
    if (!sp) return chips;
    const gbp = (v: string) => `£${Number(v).toLocaleString('en-GB')}`;
    const criteria = parseSearchCriteria(sp);
    if (criteria.location) {
      chips.push({ id: 'location', label: `From ${criteria.location.label}`, keys: ['departureAirport', 'departureCity'] });
    }
    if (criteria.dates) {
      chips.push({
        id: 'dates',
        label: `Travelling ${formatDateRange(criteria.dates.start, criteria.dates.end)}`,
        keys: ['departureDate', 'returnDate'],
      });
    }
    const bMin = sp.get('budgetMin');
    const bMax = sp.get('budgetMax');
    if (bMin || bMax) {
      const label = bMin && bMax ? `${gbp(bMin)}–${gbp(bMax)}` : bMax ? `Up to ${gbp(bMax)}` : `From ${gbp(bMin as string)}`;
      chips.push({ id: 'budget', label, keys: ['budgetMin', 'budgetMax'] });
    }
    const stars = sp.get('hotelStars');
    if (stars) {
      chips.push({ id: 'stars', label: `${stars.split(',').sort().join('★, ')}★ hotels`, keys: ['hotelStars'] });
    }
    const season = sp.get('season');
    if (season && season !== 'flexible') {
      chips.push({ id: 'season', label: season === 'ramadan' ? 'Ramadan' : season === 'school-holidays' ? 'School holidays' : season, keys: ['season'] });
    }
    const maxD = sp.get('maxDistance');
    if (maxD) {
      const m = Number(maxD);
      chips.push({ id: 'dist', label: `Within ${m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`} of the Haram`, keys: ['maxDistance'] });
    }
    if (sp.get('flightType') === 'direct') {
      chips.push({ id: 'flight', label: 'Direct flights only', keys: ['flightType'] });
    }
    return chips;
  }, [searchParams]);

  const removeFilter = (keys: string[]) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    [...keys, 'page'].forEach((k) => params.delete(k));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.searchContainer}>
      <header className={styles.searchHeader}>
        <div className={styles.searchHeaderTop}>
          {/* Left: big count number + meta disclosure stacked */}
          <div className={styles.searchResults} aria-live="polite">
            <div className={styles.searchResultsCount}>
              <strong>{listPackages.length}</strong>
              <span className={styles.searchResultsLabel}>
                {listPackages.length === 1 ? 'package' : 'packages'} found
              </span>
            </div>
            <p className={styles.sortDisclosure} data-testid="sort-disclosure">
              {NEUTRAL_SORT_DISCLOSURE}{' '}
              <a href="/how-we-rank" className={styles.sortDisclosureLink}>
                How we rank
              </a>
            </p>
          </div>

          {/* Right: Saved chip + Filter + Sort in one row */}
          <div className={styles.searchControls}>
            {shortlistCount > 0 && (
              <button
                type="button"
                className={`${styles.savedChip} ${shortlistOnly ? styles.savedChipActive : ''}`}
                onClick={() => setShortlistOnly((v) => !v)}
                aria-pressed={shortlistOnly}
                data-testid="search-shortlist-count"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={shortlistOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {shortlistOnly ? `Showing ${shortlistCount} saved` : `Saved (${shortlistCount})`}
              </button>
            )}

            <button
              className={styles.filterButton}
              onClick={handleFilterClick}
              aria-label={activeFilters.length > 0 ? `Filter packages, ${activeFilters.length} active` : 'Filter packages'}
              data-testid="filter-button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
              </svg>
              Filter
              {activeFilters.length > 0 && <span className={styles.filterCount}>{activeFilters.length}</span>}
            </button>

            <div className={styles.sortWrapper} ref={sortRef}>
              <button
                className={styles.sortButton}
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-expanded={isSortOpen}
                aria-haspopup="listbox"
                aria-label="Sort packages"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                Sort
              </button>
              {isSortOpen && (
                <div
                  className={styles.sortDropdown}
                  role="listbox"
                  aria-label="Sort options"
                >
                  {([
                    { value: 'relevance' as SortOption, label: 'Relevance (default)' },
                    { value: 'price-asc' as SortOption, label: 'Price: Low to High' },
                    { value: 'price-desc' as SortOption, label: 'Price: High to Low' },
                    { value: 'rating' as SortOption, label: 'Hotel rating' },
                    { value: 'distance' as SortOption, label: 'Closest to Haram' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      role="option"
                      aria-selected={sortBy === opt.value}
                      className={`${styles.sortOption} ${sortBy === opt.value ? styles.sortOptionActive : ''}`}
                      onClick={() => {
                        if (onSortChange) {
                          onSortChange(opt.value);
                        } else {
                          setInternalSort(opt.value);
                        }
                        setIsSortOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className={styles.activeFilters} aria-label="Active filters">
            {activeFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={styles.filterChip}
                onClick={() => removeFilter(f.keys)}
                aria-label={`Remove filter: ${f.label}`}
              >
                {f.label}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
            <button type="button" className={styles.clearFilters} onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}
      </header>
      {compareMessage ? (
        <p role="status" data-testid="search-compare-message" className={styles.compareMessageText}>
          {compareMessage}
        </p>
      ) : null}


      {searchCriteria.unrecognisedLocation && (
        <p className={styles.searchNotice} role="status" data-testid="unrecognised-location">
          We could not match &ldquo;{searchCriteria.unrecognisedLocation}&rdquo; to a UK departure airport, so
          packages from every departure airport are shown.
        </p>
      )}

      {listPackages.length === 0 && closeMatches.length > 0 && !shortlistOnly && (
        <p className={styles.searchNotice} role="status" data-testid="no-exact-matches">
          No packages meet every choice in your search. The closest matches are shown below, with what
          differs listed on each one.
        </p>
      )}

      {listPackages.length === 0 && (closeMatches.length === 0 || shortlistOnly) && (
        <div className={styles.emptyState} role="status" aria-live="polite" data-testid="search-empty-state">
          <div className={styles.emptyStateIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>
          <h2 className={styles.emptyStateTitle}>No packages currently match</h2>
          <p className={styles.emptyStateText}>
            Try changing your departure airport, dates or other choices. You can also email{' '}
            <a href="mailto:support@pilgrimcompare.co.uk">support@pilgrimcompare.co.uk</a> and tell us what
            you are looking for.
          </p>
          <button
            className={styles.emptyStateAction}
            onClick={handleClearFilters}
            aria-label="Clear all search choices"
            data-testid="search-empty-reset"
          >
            Clear all choices
          </button>
        </div>
      )}

      {/* Featured section — above neutral results, capped at 2, flag-gated */}
      {featuredPackages.length > 0 && (
        <section className={styles.featuredSection} aria-label="Featured packages" data-testid="featured-section">
          <header className={styles.featuredSectionHeader}>
            <FeaturedBadge />
            <span className={styles.featuredSectionNote}>
              Paid placement — not ranked by our neutral criteria.{' '}
              <a href="/how-we-rank" className={styles.sortDisclosureLink}>
                How we rank
              </a>
            </span>
          </header>
          {featuredPackages.map((pkg) => {
            const catPkg = cataloguePackages?.find((cp) => cp.id === pkg.id);
            const operator = catPkg ? operatorsById[catPkg.operatorId] : undefined;
            const cardProps = catPkg ? toPackageCardProps(catPkg) : undefined;
            return (
              <PackageCard
                key={pkg.id}
                package={pkg}
                isShortlisted={shortlistedPackages.includes(pkg.id)}
                isCompareSelected={selectedCompareIds.includes(pkg.id)}
                onAddToShortlist={onToggleShortlist}
                onToggleCompare={onToggleCompare}
                compareFull={compareFull}
                operator={operator}
                inclusions={cardProps?.inclusions}
                totalNights={cardProps?.totalNights}
                nightsMakkah={cardProps?.nightsMakkah}
                nightsMadinah={cardProps?.nightsMadinah}
                priceType={cardProps?.priceType}
              />
            );
          })}
        </section>
      )}

      <section
        className={`${styles.packageList} ${compareItems.length > 0 ? styles.packageListWithBar : ''}`}
        aria-label="Search results"
      >
        {pagedPackages.map((pkg) => {
          const catPkg = cataloguePackages?.find((cp) => cp.id === pkg.id);
          const operator = catPkg ? operatorsById[catPkg.operatorId] : undefined;
          const cardProps = catPkg ? toPackageCardProps(catPkg) : undefined;

          return (
            <PackageCard
              key={pkg.id}
              package={pkg}
              isShortlisted={shortlistedPackages.includes(pkg.id)}
              isCompareSelected={selectedCompareIds.includes(pkg.id)}
              onAddToShortlist={onToggleShortlist}
              onToggleCompare={onToggleCompare}
              compareFull={compareFull}
              operator={operator}
              inclusions={cardProps?.inclusions}
              totalNights={cardProps?.totalNights}
              nightsMakkah={cardProps?.nightsMakkah}
              nightsMadinah={cardProps?.nightsMadinah}
              priceType={cardProps?.priceType}
            />
          );
        })}
      </section>

      {totalPages > 1 && (
        <div className={styles.paginationRow}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {closeMatches.length > 0 && !shortlistOnly && (
        <section
          className={`${styles.closeMatchesSection} ${compareItems.length > 0 ? styles.packageListWithBar : ''}`}
          aria-labelledby="close-matches-heading"
          data-testid="close-matches"
        >
          <h2 id="close-matches-heading" className={styles.closeMatchesHeading}>
            Closest matches
          </h2>
          <p className={styles.closeMatchesNote}>
            These packages meet your departure airport and date choices, where you set them, but not every other choice.
          </p>
          <div className={styles.packageList}>
            {closeMatches.map(({ pkg: catPkg, unmet }) => {
              const cardProps = toPackageCardProps(catPkg);
              return (
                <PackageCard
                  key={catPkg.id}
                  {...cardProps}
                  isShortlisted={shortlistedPackages.includes(catPkg.id)}
                  isCompareSelected={selectedCompareIds.includes(catPkg.id)}
                  onAddToShortlist={onToggleShortlist}
                  onToggleCompare={onToggleCompare}
                  compareFull={compareFull}
                  operator={operatorsById[catPkg.operatorId]}
                  unmetCriteria={unmet}
                />
              );
            })}
          </div>
        </section>
      )}

      <CompareBar
        items={compareItems}
        min={COMPARE_MIN}
        max={COMPARE_MAX}
        onRemove={onToggleCompare}
        onClear={() => { setSelectedCompareIds([]); setCompareMessage(''); }}
        onCompare={openComparison}
      />

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
      />
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-h-[min(92dvh,56rem)] w-[min(calc(100vw-1rem),68rem)] sm:w-[min(calc(100vw-2rem),68rem)]">
          <OverlayHeader closeButtonTestId="comparison-close-btn">
            <OverlayTitle>Compare Packages</OverlayTitle>
            <OverlayDescription>
              Review selected packages side by side across price, operator, hotels, and inclusions.
            </OverlayDescription>
          </OverlayHeader>
          <OverlayBody className="p-0">
            <ComparisonTable rows={comparisonRows} />
          </OverlayBody>
        </OverlayContent>
      </Dialog>
    </div>
  );
};

export default PackageList;
