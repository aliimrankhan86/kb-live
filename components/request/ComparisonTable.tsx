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
  /** sr-only context appended to the winning value, e.g. "closest to the Haram". */
  best?: string;
}

export function ComparisonTable({ offers = [], rows }: ComparisonTableProps) {
  const [operators, setOperators] = useState<Record<string, OperatorProfile>>({});

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

  // Price + operator live in the column header, so they're not repeated as rows.
  // `rank`/`dir`/`best` mark the factual winner on dimensions with an
  // unambiguous "better" (closest, best-rated, most included). Ambiguous rows
  // (nights, occupancy) are left unranked on purpose.
  const features: Feature[] = [
    { label: 'Total nights', key: 'totalNights' },
    { label: 'Makkah / Madinah', key: 'splitNights' },
    { label: 'Hotel rating', key: 'hotelRating', rank: 'hotelStarsValue', dir: 'max', best: 'best-rated hotels' },
    { label: 'Distance to Haram', key: 'distance', rank: 'distanceValue', dir: 'min', best: 'closest to the Haram' },
    { label: 'Room occupancy', key: 'occupancy' },
    { label: "What's included", key: 'inclusions', rank: 'inclusionsCount', dir: 'max', best: 'most included' },
    { label: 'Notes', key: 'notes' },
  ];

  const n = comparisonRows.length;

  // Cheapest column → header "Lowest price" flag + a subtle column tint.
  const priceVals = comparisonRows.map((r) => r.priceValue);
  const validPrices = priceVals.filter((p): p is number => typeof p === 'number');
  const lowestPrice =
    validPrices.length >= 2 && Math.min(...validPrices) !== Math.max(...validPrices)
      ? Math.min(...validPrices)
      : null;

  // Winning column indices for a ranked row — only when the values genuinely
  // differ (so we never crown a "winner" when everything is equal).
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

  const LOWEST_BG = 'bg-[#211d10]';

  return (
    <div className="w-full" data-testid="comparison-table">
      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm text-[var(--text)] sm:text-[0.9375rem]">
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
            {comparisonRows.map((row, i) => {
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
        <tbody>
          {features.map((feature, rowIndex) => {
            const even = rowIndex % 2 === 1;
            const displays = comparisonRows.map((r) => String(r[feature.key]));
            // A row where every package shows the same value isn't a decision
            // point — mute it so attention goes where they actually differ.
            const allSame = n > 1 && displays.every((d) => d === displays[0]);
            const winners = feature.rank && feature.dir && !allSame ? winnersFor(feature.rank, feature.dir) : new Set<number>();

            return (
              <tr key={feature.key}>
                <th
                  scope="row"
                  className={`bg-[var(--surfaceDark)] border-b border-[var(--borderSubtle)] px-2.5 py-3 align-top text-xs font-semibold leading-snug [overflow-wrap:anywhere] sm:px-4 sm:text-[0.8125rem] ${
                    allSame ? 'text-[rgba(255,255,255,0.35)]' : 'text-[var(--textMuted)]'
                  }`}
                >
                  {feature.label}
                </th>
                {comparisonRows.map((row, i) => {
                  const value = row[feature.key];
                  const isMissing = value === 'Not provided';
                  const isLowest = lowestPrice !== null && row.priceValue === lowestPrice;
                  const isWinner = winners.has(i);
                  const bg = isWinner
                    ? 'bg-[#1c2a14]'
                    : isLowest
                      ? LOWEST_BG
                      : even
                        ? 'bg-[#181818]'
                        : 'bg-[var(--surfaceDark)]';
                  const text = allSame
                    ? 'text-[rgba(255,255,255,0.4)]'
                    : isWinner
                      ? 'text-[#7dd97d] font-semibold'
                      : isMissing
                        ? 'text-[var(--textMuted)]'
                        : 'text-[var(--text)]';
                  return (
                    <td
                      key={`${row.id}-${feature.key}`}
                      className={`border-b border-l border-[var(--borderSubtle)] px-2.5 py-3 align-top leading-relaxed [overflow-wrap:anywhere] sm:px-4 ${bg} ${text}`}
                    >
                      {isWinner && (
                        <span data-testid="comparison-best" className="mb-0.5 flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wide text-[#7dd97d]">
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
      </table>
    </div>
  );
}
