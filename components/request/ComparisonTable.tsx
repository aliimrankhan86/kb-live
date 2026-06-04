'use client';

import { Offer, OperatorProfile } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';
import { useEffect, useState } from 'react';
import { mapOfferToComparison, ComparisonRow } from '@/lib/comparison';

interface ComparisonTableProps {
  offers?: Offer[];
  rows?: ComparisonRow[];
}

export function ComparisonTable({ offers = [], rows }: ComparisonTableProps) {
  const [operators, setOperators] = useState<Record<string, OperatorProfile>>({});

  useEffect(() => {
    const ops = MockDB.getOperators();
    const opsMap = ops.reduce((acc, op) => ({ ...acc, [op.id]: op }), {});
    setOperators(opsMap);
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
      <table className="w-full min-w-[600px] border-collapse text-left text-sm text-[#FFFFFF]">
        <caption className="sr-only">Package comparison</caption>
        <thead>
          <tr>
            <th className="border-b border-[rgba(255,255,255,0.1)] py-4 pl-4 font-medium text-[rgba(255,255,255,0.4)]">
              Feature
            </th>
            {comparisonRows.map((row) => {
              const headerLabel =
                row.operatorName && row.operatorName !== 'Not provided'
                  ? row.operatorName
                  : 'Travel agent (name TBC)';
              return (
                <th key={row.id} className="border-b border-[rgba(255,255,255,0.1)] p-4 font-semibold text-[#FFD31D]" title={headerLabel}>
                  {headerLabel}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr key={i} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
              <td className="py-4 pl-4 font-medium text-[rgba(255,255,255,0.64)]">
                {feature.label}
              </td>
              {comparisonRows.map((row) => (
                <td key={row.id} className="p-4">
                  {row[feature.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
