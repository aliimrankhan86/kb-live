'use client';

import { Offer, OperatorProfile } from '@/lib/types';
import { MockDB } from '@/lib/api/mock-db';
import { useEffect, useState } from 'react';

interface ComparisonTableProps {
  offers: Offer[];
}

export function ComparisonTable({ offers }: ComparisonTableProps) {
  const [operators, setOperators] = useState<Record<string, OperatorProfile>>({});

  useEffect(() => {
    const ops = MockDB.getOperators();
    const opsMap = ops.reduce((acc, op) => ({ ...acc, [op.id]: op }), {});
    setOperators(opsMap);
  }, []);

  const features = [
    { label: 'Price', render: (o: Offer) => `${o.currency} ${o.pricePerPerson}` },
    { label: 'Operator', render: (o: Offer) => operators[o.operatorId]?.companyName || 'Unknown' },
    { label: 'Total Nights', render: (o: Offer) => o.totalNights },
    { label: 'Makkah / Madinah', render: (o: Offer) => `${o.nightsMakkah} / ${o.nightsMadinah}` },
    { label: 'Hotel Rating', render: (o: Offer) => `${o.hotelStars} Stars` },
    { label: 'Distance to Haram', render: (o: Offer) => o.distanceToHaram },
    { 
      label: 'Room Occupancy', 
      render: (o: Offer) => {
        const supported = [];
        if (o.roomOccupancy.single) supported.push('Single');
        if (o.roomOccupancy.double) supported.push('Double');
        if (o.roomOccupancy.triple) supported.push('Triple');
        if (o.roomOccupancy.quad) supported.push('Quad');
        return supported.join(', ') || 'None specified';
      }
    },
    {
      label: 'Inclusions',
      render: (o: Offer) => {
        const inc = [];
        if (o.inclusions.visa) inc.push('Visa');
        if (o.inclusions.flights) inc.push('Flights');
        if (o.inclusions.transfers) inc.push('Transfers');
        if (o.inclusions.meals) inc.push('Meals');
        return inc.length > 0 ? inc.join(', ') : 'None';
      }
    },
    { label: 'Notes', render: (o: Offer) => o.notes || '-' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm text-[#FFFFFF]">
        <thead>
          <tr>
            <th className="border-b border-[rgba(255,255,255,0.1)] py-4 pl-4 font-medium text-[rgba(255,255,255,0.4)]">
              Feature
            </th>
            {offers.map((offer, i) => (
              <th key={offer.id} className="border-b border-[rgba(255,255,255,0.1)] p-4 font-semibold text-[#FFD31D]">
                Option {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr key={i} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
              <td className="py-4 pl-4 font-medium text-[rgba(255,255,255,0.64)]">
                {feature.label}
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="p-4">
                  {feature.render(offer)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
