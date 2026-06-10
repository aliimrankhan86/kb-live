'use client';

import { Offer, OperatorProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { mapOfferToComparison, ComparisonRow } from '@/lib/comparison';

interface ComparisonTableProps {
  offers?: Offer[];
  rows?: ComparisonRow[];
}

// Pull a comparable number out of a formatted price string ("£1,099" → 1099).
function priceToNumber(value: string): number | null {
  const n = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
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
  const features: { label: string; key: keyof ComparisonRow }[] = [
    { label: 'Total nights', key: 'totalNights' },
    { label: 'Makkah / Madinah', key: 'splitNights' },
    { label: 'Hotel rating', key: 'hotelRating' },
    { label: 'Distance to Haram', key: 'distance' },
    { label: 'Room occupancy', key: 'occupancy' },
    { label: "What's included", key: 'inclusions' },
    { label: 'Notes', key: 'notes' },
  ];

  // Identify the cheapest column so we can flag it — the single most useful
  // "difference" for someone comparing packages.
  const prices = comparisonRows.map((r) => priceToNumber(r.price));
  const validPrices = prices.filter((p): p is number => p !== null);
  const lowestPrice = validPrices.length >= 2 ? Math.min(...validPrices) : null;

  // Fixed-layout table that fits the available width — the 2-up case fits a
  // phone cleanly with no horizontal scroll (so no sticky/occlusion artifacts);
  // a third column simply makes each column narrower.
  const LOWEST_BG = 'bg-[#211d10]';
  const cellBg = (isLowest: boolean, even: boolean) =>
    isLowest ? LOWEST_BG : even ? 'bg-[#181818]' : 'bg-[var(--surfaceDark)]';

  return (
    <div className="w-full" data-testid="comparison-table">
      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm text-[var(--text)] sm:text-[0.9375rem]">
        <caption className="sr-only">Package comparison</caption>
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
              const isLowest = lowestPrice !== null && prices[i] === lowestPrice;
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
            return (
              <tr key={feature.key}>
                <th
                  scope="row"
                  className="bg-[var(--surfaceDark)] border-b border-[var(--borderSubtle)] px-2.5 py-3 align-top text-xs font-semibold leading-snug text-[var(--textMuted)] [overflow-wrap:anywhere] sm:px-4 sm:text-[0.8125rem]"
                >
                  {feature.label}
                </th>
                {comparisonRows.map((row, i) => {
                  const value = row[feature.key];
                  const isMissing = value === 'Not provided';
                  const isLowest = lowestPrice !== null && prices[i] === lowestPrice;
                  return (
                    <td
                      key={`${row.id}-${feature.key}`}
                      className={`border-b border-l border-[var(--borderSubtle)] px-2.5 py-3 align-top leading-relaxed [overflow-wrap:anywhere] sm:px-4 ${cellBg(
                        isLowest,
                        even
                      )} ${isMissing ? 'text-[var(--textMuted)]' : 'text-[var(--text)]'}`}
                    >
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
