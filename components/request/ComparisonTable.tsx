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
  best?: string; // sr-only context, e.g. "closest to the Haram"
}

interface Group {
  title: string;
  rows: Feature[];
}

// Grouped so a longer comparison stays scannable. Price + operator live in the
// column header. `rank`/`dir`/`best` mark the factual winner on dimensions with
// an unambiguous "better"; everything else is informational.
const GROUPS: Group[] = [
  {
    title: 'Stay & hotels',
    rows: [
      { label: 'Total nights', key: 'totalNights' },
      { label: 'Makkah / Madinah', key: 'splitNights' },
      { label: 'Hotel rating', key: 'hotelRating', rank: 'hotelStarsValue', dir: 'max', best: 'best-rated hotels' },
      { label: 'Distance to Haram', key: 'distance', rank: 'distanceValue', dir: 'min', best: 'closest to the Haram' },
      { label: 'Room options', key: 'occupancy' },
    ],
  },
  {
    title: 'Flights',
    rows: [{ label: 'Flights', key: 'flights' }],
  },
  {
    title: "What's included",
    rows: [{ label: 'Included', key: 'inclusions', rank: 'inclusionsCount', dir: 'max', best: 'most included' }],
  },
  {
    title: 'Price & flexibility',
    rows: [
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

  // Cheapest column → header "Lowest price" flag + subtle tint.
  const priceVals = comparisonRows.map((r) => r.priceValue);
  const validPrices = priceVals.filter((p): p is number => typeof p === 'number');
  const lowestPrice =
    validPrices.length >= 2 && Math.min(...validPrices) !== Math.max(...validPrices)
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
        <caption className="sr-only">Package comparison. Best value on each row is marked.</caption>
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
                    <span className="mb-1.5 inline-block rounded bg-[var(--yellow)] px-1.5 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-wide text-[var(--bg)]">
                      Lowest price
                    </span>
                  )}
                  <span
                    className="mb-1 block overflow-hidden text-[0.8125rem] font-semibold leading-tight text-[var(--text)] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] sm:text-[0.9375rem]"
                    title={headerLabel}
                  >
                    {headerLabel}
                  </span>
                  <span className="block text-base font-extrabold leading-tight tabular-nums text-[var(--yellow)] sm:text-xl">
                    {row.price}
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
                            className={`border-b border-l border-[var(--borderSubtle)] px-2.5 py-3 align-top leading-relaxed [overflow-wrap:anywhere] sm:px-4 ${bg} ${text}`}
                          >
                            {isWinner && (
                              <span data-testid="comparison-best" className="mb-0.5 flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wide text-[var(--comparison-winner-text)]">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden="true">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                Best
                                <span className="sr-only"> — {feature.best}</span>
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
    </div>
  );
}
