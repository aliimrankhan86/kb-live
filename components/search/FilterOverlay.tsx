'use client'

import React, { useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { DURATION_OPTIONS } from '@/components/search/search-utils';
import {
  Dialog,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Airports that live packages depart from (from the full catalogue, not the filtered list). */
  airportOptions?: { code: string; label: string }[];
}

const durationIdFor = (min: string | null, max: string | null) =>
  DURATION_OPTIONS.find((d) => String('min' in d ? d.min : '') === (min ?? '') && String('max' in d ? d.max : '') === (max ?? ''))?.id ?? '';

const BUDGET_MIN = 300;
const BUDGET_MAX = 3000;
const DIST_MIN = 250;
const DIST_MAX = 3000;

const STAR_OPTIONS = [
  { value: 3, label: '3 star' },
  { value: 4, label: '4 star' },
  { value: 5, label: '5 star' },
];

const SEASON_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: 'ramadan', label: 'Ramadan' },
  { value: 'school-holidays', label: 'School holidays' },
];

const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`;
const distLabel = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

/**
 * The filter panel writes straight to the URL query that `filterByParams`
 * already understands, so applying a filter actually changes the results.
 * It also reads the current URL on open, so it reflects what the search form
 * (or a previous filter) already applied.
 */
export const FilterOverlay: React.FC<FilterOverlayProps> = ({ isOpen, onClose, airportOptions = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Keyed by the codes, not the array, so a new array with the same airports
  // does not reset the panel on every render.
  const airportCodes = airportOptions.map((a) => a.code).join(',');
  const initial = useMemo(() => {
    const get = (k: string) => searchParams?.get(k) ?? null;
    const budgetMin = Number(get('budgetMin'));
    const budgetMax = Number(get('budgetMax'));
    const starsRaw = (get('hotelStars') ?? '')
      .split(',')
      .map(Number)
      .filter((n) => [3, 4, 5].includes(n));
    const maxDistanceRaw = Number(get('maxDistance'));
    const seasonRaw = get('season') ?? '';
    return {
      budget: [
        Number.isFinite(budgetMin) && budgetMin > 0 ? Math.max(BUDGET_MIN, budgetMin) : BUDGET_MIN,
        Number.isFinite(budgetMax) && budgetMax > 0 ? Math.min(BUDGET_MAX, budgetMax) : BUDGET_MAX,
      ] as [number, number],
      stars: starsRaw,
      season: seasonRaw === 'flexible' ? '' : seasonRaw,
      maxDistance: Number.isFinite(maxDistanceRaw) && maxDistanceRaw > 0 ? maxDistanceRaw : DIST_MAX,
      directOnly: get('flightType') === 'direct',
      airport: airportCodes.split(',').includes(get('departureAirport') ?? '') ? (get('departureAirport') as string) : '',
      duration: durationIdFor(get('minNights'), get('maxNights')),
    };
  }, [searchParams, airportCodes]);

  const [budget, setBudget] = useState<[number, number]>(initial.budget);
  const [stars, setStars] = useState<number[]>(initial.stars);
  const [season, setSeason] = useState<string>(initial.season);
  const [maxDistance, setMaxDistance] = useState<number>(initial.maxDistance);
  const [directOnly, setDirectOnly] = useState<boolean>(initial.directOnly);
  const [airport, setAirport] = useState<string>(initial.airport);
  const [duration, setDuration] = useState<string>(initial.duration);

  // Re-sync local state whenever the panel is (re)opened against the live URL.
  React.useEffect(() => {
    if (isOpen) {
      setBudget(initial.budget);
      setStars(initial.stars);
      setSeason(initial.season);
      setMaxDistance(initial.maxDistance);
      setDirectOnly(initial.directOnly);
      setAirport(initial.airport);
      setDuration(initial.duration);
    }
  }, [isOpen, initial]);

  const toggleStar = (value: number) =>
    setStars((cur) => (cur.includes(value) ? cur.filter((s) => s !== value) : [...cur, value].sort((a, b) => a - b)));

  const activeCount =
    (budget[0] !== BUDGET_MIN || budget[1] !== BUDGET_MAX ? 1 : 0) +
    (stars.length > 0 ? 1 : 0) +
    (season ? 1 : 0) +
    (maxDistance !== DIST_MAX ? 1 : 0) +
    (directOnly ? 1 : 0) +
    (airport ? 1 : 0) +
    (duration ? 1 : 0);

  const apply = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    const setOrDelete = (key: string, value: string | null) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    setOrDelete('budgetMin', budget[0] !== BUDGET_MIN ? String(budget[0]) : null);
    setOrDelete('budgetMax', budget[1] !== BUDGET_MAX ? String(budget[1]) : null);
    setOrDelete('hotelStars', stars.length > 0 ? stars.join(',') : null);
    setOrDelete('season', season || null);
    setOrDelete('maxDistance', maxDistance !== DIST_MAX ? String(maxDistance) : null);
    setOrDelete('flightType', directOnly ? 'direct' : null);
    // An airport replaces any city search; "Any airport" leaves a city search alone.
    if (airport) {
      params.set('departureAirport', airport);
      params.delete('departureCity');
    } else if (initial.airport) params.delete('departureAirport');
    const d = DURATION_OPTIONS.find((o) => o.id === duration);
    setOrDelete('minNights', d && 'min' in d ? String(d.min) : null);
    setOrDelete('maxNights', d && 'max' in d ? String(d.max) : null);
    params.delete('page');

    router.replace(`${pathname}?${params.toString()}`);
    onClose();
  };

  const reset = () => {
    setBudget([BUDGET_MIN, BUDGET_MAX]);
    setStars([]);
    setSeason('');
    setMaxDistance(DIST_MAX);
    setDirectOnly(false);
    setAirport('');
    setDuration('');
    // Keep context params (type, dates, sort); drop the panel's filters, airport included.
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    ['budgetMin', 'budgetMax', 'hotelStars', 'season', 'maxDistance', 'flightType', 'departureAirport', 'departureCity', 'minNights', 'maxNights'].forEach((k) =>
      params.delete(k)
    );
    router.replace(`${pathname}?${params.toString()}`);
  };

  const chipBase =
    'min-h-11 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focusRing)]';
  const chipOn = 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--yellow)]';
  const chipOff = 'border-[var(--borderStrong)] text-[var(--text)] hover:border-[var(--yellow)]';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <OverlayContent
        className="max-h-[min(92dvh,56rem)] w-[min(calc(100vw-1rem),40rem)] sm:w-[min(calc(100vw-2rem),40rem)]"
        data-testid="filter-overlay"
      >
        <OverlayHeader closeButtonTestId="filter-close-btn">
          <div className="flex flex-wrap items-center gap-3">
            <OverlayTitle>Filter packages</OverlayTitle>
            {activeCount > 0 && (
              <span
                className="rounded-md border border-[rgba(255,211,29,0.35)] bg-[rgba(255,211,29,0.08)] px-2.5 py-1 text-xs font-semibold text-[var(--yellow)]"
                aria-live="polite"
              >
                {activeCount} active
              </span>
            )}
          </div>
          <OverlayDescription>Narrow your results. Changes apply when you tap Show packages.</OverlayDescription>
        </OverlayHeader>

        <OverlayBody className="space-y-7 px-5 py-6 sm:px-6">
          {/* Budget */}
          <section>
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-[var(--text)]">Your budget</h3>
              <span className="text-sm font-semibold text-[var(--yellow)]" aria-live="polite">
                {gbp(budget[0])} to {gbp(budget[1])}{budget[1] === BUDGET_MAX ? '+' : ''}
              </span>
            </div>
            <p className="mb-3 text-xs text-[var(--textMuted)]">Price per person</p>
            <RangeSlider
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              value={budget}
              step={50}
              minGap={100}
              onChange={(v) => setBudget(v)}
              minLabel={gbp(BUDGET_MIN)}
              maxLabel={`${gbp(BUDGET_MAX)}+`}
              ariaLabelMin="Minimum budget"
              ariaLabelMax="Maximum budget"
              data-testid-min="budget-min-slider"
              data-testid-max="budget-max-slider"
            />
          </section>

          {/* Departure airport (UX-09): only airports live packages leave from */}
          {airportOptions.length > 0 && (
            <section className="border-t border-[var(--borderSubtle)] pt-6">
              <label htmlFor="filter-departure-airport" className="mb-3 block text-base font-semibold text-[var(--text)]">
                Departure airport
              </label>
              <select
                id="filter-departure-airport"
                data-testid="filter-departure-airport"
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-[var(--borderStrong)] bg-[var(--surfaceDark)] px-3 text-sm text-[var(--text)]"
              >
                <option value="">Any airport</option>
                {airportOptions.map((a) => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </section>
          )}

          {/* Trip length (UX-09) */}
          <section className="border-t border-[var(--borderSubtle)] pt-6">
            <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Trip length</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Trip length">
              {[{ id: '', label: 'Any length' }, ...DURATION_OPTIONS].map((opt) => {
                const on = duration === opt.id;
                return (
                  <button
                    key={opt.id || 'any'}
                    type="button"
                    data-testid={`filter-duration-${opt.id || 'any'}`}
                    className={`${chipBase} ${on ? chipOn : chipOff}`}
                    aria-pressed={on}
                    onClick={() => setDuration(opt.id)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Hotel rating */}
          <section className="border-t border-[var(--borderSubtle)] pt-6">
            <h3 className="mb-1 text-base font-semibold text-[var(--text)]">Hotel rating</h3>
            <p className="mb-3 text-xs text-[var(--textMuted)]">Pick any you&apos;d be happy with</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Hotel star rating">
              {STAR_OPTIONS.map((opt) => {
                const on = stars.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${chipBase} ${on ? chipOn : chipOff} inline-flex items-center gap-1.5`}
                    aria-pressed={on}
                    onClick={() => toggleStar(opt.value)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* When you travel */}
          <section className="border-t border-[var(--borderSubtle)] pt-6">
            <h3 className="mb-3 text-base font-semibold text-[var(--text)]">When you travel</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Travel period">
              {SEASON_OPTIONS.map((opt) => {
                const on = season === opt.value;
                return (
                  <button
                    key={opt.value || 'any'}
                    type="button"
                    className={`${chipBase} ${on ? chipOn : chipOff}`}
                    aria-pressed={on}
                    onClick={() => setSeason(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Distance to the Haram */}
          <section className="border-t border-[var(--borderSubtle)] pt-6">
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-[var(--text)]">Distance to the Haram</h3>
              <span className="text-sm font-semibold text-[var(--yellow)]" aria-live="polite">
                {maxDistance >= DIST_MAX ? 'Any distance' : `Within ${distLabel(maxDistance)}`}
              </span>
            </div>
            <p className="mb-3 text-xs text-[var(--textMuted)]">How close the hotel is to the Grand Mosque</p>
            <RangeSlider
              min={DIST_MIN}
              max={DIST_MAX}
              value={[DIST_MIN, maxDistance]}
              step={50}
              minGap={50}
              onChange={(v) => setMaxDistance(v[1])}
              minLabel={distLabel(DIST_MIN)}
              maxLabel="Any"
              ariaLabelMin="Closest distance"
              ariaLabelMax="Maximum distance to the Haram"
              data-testid-min="distance-min-slider"
              data-testid-max="distance-max-slider"
            />
          </section>

          {/* Flights */}
          <section className="border-t border-[var(--borderSubtle)] pt-6">
            <h3 className="mb-3 text-base font-semibold text-[var(--text)]">Flights</h3>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={directOnly}
                onChange={(e) => setDirectOnly(e.target.checked)}
                className="h-5 w-5 accent-[var(--yellow)]"
                data-testid="filter-direct-flights"
              />
              <span className="text-sm font-medium text-[var(--text)]">Direct flights only</span>
            </label>
          </section>
        </OverlayBody>

        <OverlayFooter className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:justify-stretch">
          <button
            onClick={reset}
            className="min-h-12 rounded-lg border border-[var(--borderStrong)] bg-transparent px-5 text-base font-semibold text-[var(--text)] transition-colors hover:border-[var(--yellow)] hover:bg-[rgba(255,211,29,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focusRing)]"
            type="button"
            data-testid="filter-reset-btn"
          >
            Reset
          </button>
          <button
            onClick={apply}
            className="min-h-12 rounded-lg bg-[var(--yellow)] px-5 text-base font-bold text-black transition-colors hover:bg-[#ffe36b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focusRing)]"
            type="button"
            data-testid="filter-apply-btn"
          >
            Show packages
          </button>
        </OverlayFooter>
      </OverlayContent>
    </Dialog>
  );
};
