'use client';

import { Offer, OperatorProfile } from '@/lib/types';
import { useEffect, useState } from 'react';
import { mapOfferToComparison, ComparisonRow } from '@/lib/comparison';

interface ComparisonTableProps {
  offers?: Offer[];
  rows?: ComparisonRow[];
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

  const comparisonRows = rows ?? offers.map(o => mapOfferToComparison(o, operators[o.operatorId]));

  const features: { label: string; key: keyof ComparisonRow }[] = [
    { label: 'Price', key: 'price' },
    { label: 'Operator', key: 'operatorName' },
    { label: 'Total Nights', key: 'totalNights' },
    { label: 'Makkah / Madinah', key: 'splitNights' },
    { label: 'Hotel Rating', key: 'hotelRating' },
    { label: 'Distance to Haram', key: 'distance' },
    { label: 'Room Occupancy', key: 'occupancy' },
    { label: 'Inclusions', key: 'inclusions' },
    { label: 'Notes', key: 'notes' },
  ];

  return (
    <div className="overflow-x-auto" data-testid="comparison-table">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm text-[var(--text)] sm:min-w-[48rem]">
        <caption className="sr-only">Package comparison</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 top-0 z-30 w-36 border-b border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-5 py-4 text-xs font-semibold uppercase text-[var(--textMuted)] sm:w-48 sm:px-6"
            >
              Feature
            </th>
            {comparisonRows.map((row) => {
              const headerLabel =
                row.operatorName && row.operatorName !== 'Not provided'
                  ? row.operatorName
                  : 'Travel agent (name TBC)';
              return (
                <th
                  key={row.id}
                  scope="col"
                  className="sticky top-0 z-20 min-w-56 border-b border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-5 py-4 text-base font-semibold text-[var(--yellow)] sm:px-6"
                  title={headerLabel}
                >
                  {headerLabel}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.key} className="border-b border-[var(--borderSubtle)] last:border-b-0 hover:bg-[rgba(255,255,255,0.03)]">
              <th
                scope="row"
                className="sticky left-0 z-10 w-36 bg-[var(--surfaceDark)] px-5 py-5 align-top font-semibold text-[var(--textMuted)] sm:w-48 sm:px-6"
              >
                {feature.label}
              </th>
              {comparisonRows.map((row) => {
                const value = row[feature.key];
                const isMissing = value === 'Not provided';

                return (
                  <td
                    key={`${row.id}-${feature.key}`}
                    className={`min-w-56 px-5 py-5 align-top leading-relaxed sm:px-6 ${
                      isMissing ? 'text-[var(--textMuted)]' : 'text-[var(--text)]'
                    } ${feature.key === 'price' ? 'font-semibold tabular-nums' : ''}`}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
