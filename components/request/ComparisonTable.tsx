'use client';

import { Offer, OperatorProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { mapOfferToComparison, ComparisonRow } from '@/lib/comparison';

interface ComparisonTableProps {
  offers?: Offer[];
  rows?: ComparisonRow[];
}

type RankKey = 'hotelStarsValue' | 'distanceValue' | 'inclusionsCount';

interface Feature {
  label: string;
  key: keyof ComparisonRow;
  rank?: RankKey;
  dir?: 'min' | 'max';
  mark?: string; // factual mark on the leading cell, e.g. "Shortest distance"
}

interface Group {
  title: string;
  rows: Feature[];
}

// Grouped so a longer comparison stays scannable. Operator, package, nights and
// price live in the column header. `rank`/`dir`/`mark` label the highest, lowest
// or most among the packages shown, in neutral factual words (standards §5, §16:
// no "best"); everything else is informational.
const GROUPS: Group[] = [
  {
    title: 'Stay & hotels',
    rows: [
      { label: 'Travel dates', key: 'travelDates' },
      { label: 'Total nights', key: 'totalNights' },
      { label: 'Makkah / Madinah', key: 'splitNights' },
      { label: 'Hotel rating', key: 'hotelRating', rank: 'hotelStarsValue', dir: 'max', mark: 'Highest star rating' },
      { label: 'Distance to the mosque', key: 'distance', rank: 'distanceValue', dir: 'min', mark: 'Shortest distance' },
      { label: 'Room options', key: 'occupancy' },
    ],
  },
  {
    title: 'Flights',
    rows: [{ label: 'Flights', key: 'flights' }],
  },
  {
    title: "What's included",
    rows: [
      { label: 'Included', key: 'inclusions', rank: 'inclusionsCount', dir: 'max', mark: 'Most items included' },
      { label: 'Ziyarat', key: 'ziyarat' },
    ],
  },
  {
    title: 'Price & flexibility',
    rows: [
      // Item 9: informational only. No rank, so no mark ever compares a missing price.
      { label: 'Quad room (4 sharing)', key: 'priceQuad' },
      { label: 'Triple room (3 sharing)', key: 'priceTriple' },
      { label: 'Double room (2 sharing)', key: 'priceDouble' },
      { label: 'Deposit to book', key: 'deposit' },
      { label: 'Pay in instalments', key: 'paymentPlan' },
      { label: 'Cancellation', key: 'cancellation' },
    ],
  },
  {
    title: 'Trip type & notes',
    rows: [
      { label: 'Group type', key: 'groupType' },
      { label: 'Notes', key: 'notes' },
    ],
  },
];

const LOWEST_BG = 'bg-[var(--comparison-lowest-bg)]';

export function ComparisonTable({ offers = [], rows }: ComparisonTableProps) {
  const [operators, setOperators] = useState<Record<string, OperatorProfile>>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/operators')
      .then((r) => r.json())
      .then((d) => {
        if (d.operators) {
          setOperators((d.operators as OperatorProfile[]).reduce((acc, op) => ({ ...acc, [op.id]: op }), {}));
        }
      });
  }, []);

  const comparisonRows = rows ?? offers.map((o) => mapOfferToComparison(o, operators[o.operatorId]));
  const colCount = comparisonRows.length + 1;

  const cellText = (r: ComparisonRow, key: keyof ComparisonRow): string => {
    const v = r[key];
    return v == null ? 'Not provided' : String(v);
  };

  // Cheapest column → header flag + subtle tint, but only when every package has
  // the same number of nights: a 7 night price is not "lower" than a 14 night one.
  const priceVals = comparisonRows.map((r) => r.priceValue);
  const validPrices = priceVals.filter((p): p is number => typeof p === 'number');
  const sameNights = new Set(comparisonRows.map((r) => r.totalNights)).size === 1;
  const lowestPrice =
    sameNights && validPrices.length >= 2 && Math.min(...validPrices) !== Math.max(...validPrices)
      ? Math.min(...validPrices)
      : null;

  const winnersFor = (rank: RankKey, dir: 'min' | 'max'): Set<number> => {
    const vals = comparisonRows.map((r) => r[rank] as number | null);
    const valid = vals.filter((v): v is number => typeof v === 'number');
    if (valid.length < 2) return new Set();
    const best = dir === 'min' ? Math.min(...valid) : Math.max(...valid);
    if (best === (dir === 'min' ? Math.max(...valid) : Math.min(...valid))) return new Set();
    const winners = new Set<number>();
    vals.forEach((v, i) => {
      if (v === best) winners.add(i);
    });
    return winners;
  };

  const toggle = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  let dataRow = 0; // running index for zebra striping across groups

  return (
    <div className="w-full overflow-x-auto" data-testid="comparison-table">
      <table className="w-full min-w-[320px] table-fixed border-separate border-spacing-0 text-left text-sm text-[var(--text)] sm:text-[0.9375rem]">
        <caption className="sr-only">
          Package comparison. Marks show the highest star rating, shortest distance and most items included among
          these packages, and the lowest price when all have the same number of nights.
        </caption>
        <colgroup>
          <col className="w-[5.75rem] sm:w-36" />
          {comparisonRows.map((row) => (
            <col key={row.id} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="bg-[var(--surfaceDark)] border-b border-[var(--borderSubtle)]">
              <span className="sr-only">Feature</span>
            </th>
            {comparisonRows.map((row) => {
              const headerLabel =
                row.operatorName && row.operatorName !== 'Not provided'
                  ? row.operatorName
                  : 'Travel agent (name TBC)';
              const isLowest = lowestPrice !== null && row.priceValue === lowestPrice;
              return (
                <th
                  key={row.id}
                  scope="col"
                  className={`border-b border-l border-[var(--borderSubtle)] px-2.5 pb-3.5 pt-3 align-bottom sm:px-4 ${
                    isLowest ? LOWEST_BG : 'bg-[var(--surfaceDark)]'
                  }`}
                >
                  {isLowest && (
                    <span data-testid="comparison-lowest" className="mb-1.5 inline-block rounded bg-[var(--yellow)] px-1.5 py-0.5 text-xs font-bold leading-snug text-[var(--bg)]">
                      Lowest price in this comparison
                    </span>
                  )}
                  <span
                    className="mb-1 block overflow-hidden text-[0.8125rem] font-semibold leading-tight text-[var(--text)] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] sm:text-[0.9375rem]"
                    title={headerLabel}
                  >
                    {headerLabel}
                  </span>
                  {row.title && (
                    <span
                      className="mb-1.5 block overflow-hidden text-xs font-normal leading-snug text-[var(--textMuted)] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]"
                      title={row.title}
                      data-testid="comparison-package-title"
                    >
                      {row.title}
                    </span>
                  )}
                  <span className="block text-base font-extrabold leading-tight tabular-nums text-[var(--yellow)] sm:text-xl">
                    {row.price}
                  </span>
                  <span className="block text-xs font-semibold text-[var(--text)]" data-testid="comparison-nights">
                    {row.totalNights} nights
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        {GROUPS.map((group) => {
          const isCollapsed = collapsed.has(group.title);
          return (
            <tbody key={group.title}>
              <tr>
                <th colSpan={colCount} scope="colgroup" className="border-b border-[var(--borderSubtle)] bg-[var(--comparison-section-bg)] p-0">
                  <button
                    type="button"
                    onClick={() => toggle(group.title)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-[var(--textMuted)] transition-colors hover:text-[var(--text)] sm:px-4"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                      className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                    {group.title}
                  </button>
                </th>
              </tr>
              {!isCollapsed &&
                group.rows.map((feature) => {
                  const even = dataRow++ % 2 === 1;
                  const displays = comparisonRows.map((r) => cellText(r, feature.key));
                  const allSame = comparisonRows.length > 1 && displays.every((d) => d === displays[0]);
                  const winners =
                    feature.rank && feature.dir && !allSame ? winnersFor(feature.rank, feature.dir) : new Set<number>();
                  return (
                    <tr key={feature.key}>
                      <th
                        scope="row"
                        className={`bg-[var(--surfaceDark)] border-b border-[var(--borderSubtle)] px-2.5 py-3 align-top text-xs font-semibold leading-snug [overflow-wrap:anywhere] sm:px-4 sm:text-[0.8125rem] ${
                          allSame ? 'text-[var(--comparison-dim-text)]' : 'text-[var(--textMuted)]'
                        }`}
                      >
                        {feature.label}
                      </th>
                      {comparisonRows.map((row, i) => {
                        const value = displays[i];
                        const isMissing = value === 'Not provided';
                        const isLowest = lowestPrice !== null && row.priceValue === lowestPrice;
                        const isWinner = winners.has(i);
                        const bg = isWinner
                          ? 'bg-[var(--comparison-winner-bg)]'
                          : isLowest
                            ? LOWEST_BG
                            : even
                              ? 'bg-[var(--comparison-even-bg)]'
                              : 'bg-[var(--surfaceDark)]';
                        const text = allSame
                          ? 'text-[var(--comparison-dim-text)]'
                          : isWinner
                            ? 'text-[var(--comparison-winner-text)] font-semibold'
                            : isMissing
                              ? 'text-[var(--textMuted)]'
                              : 'text-[var(--text)]';
                        return (
                          <td
                            key={`${row.id}-${feature.key}`}
                            className={`whitespace-pre-line border-b border-l border-[var(--borderSubtle)] px-2.5 py-3 align-top leading-relaxed [overflow-wrap:anywhere] sm:px-4 ${bg} ${text}`}
                          >
                            {isWinner && (
                              <span data-testid="comparison-best" className="mb-0.5 flex items-center gap-1 text-xs font-bold leading-snug text-[var(--comparison-winner-text)]">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden="true">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                {feature.mark}
                                <span className="sr-only"> among these packages</span>
                              </span>
                            )}
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          );
        })}
      </table>
      <p className="mt-2 px-2.5 text-xs text-[var(--textMuted)] sm:px-4" data-testid="comparison-marks-note">
        Marks compare only the packages shown here, using the details each operator gave us.
      </p>
    </div>
  );
}
