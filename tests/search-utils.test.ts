import { describe, expect, it } from 'vitest';
import { filterByParams, toSearchDisplay } from '@/components/search/search-utils';
import type { Package } from '@/lib/types';

const basePackage: Package = {
  id: 'pkg-base',
  operatorId: 'op1',
  title: 'Umrah package',
  slug: 'umrah-package',
  status: 'published',
  pilgrimageType: 'umrah',
  seasonLabel: 'Flexible',
  priceType: 'from',
  pricePerPerson: 1200,
  currency: 'GBP',
  totalNights: 10,
  nightsMakkah: 5,
  nightsMadinah: 5,
  distanceBandMakkah: 'near',
  distanceBandMadinah: 'near',
  roomOccupancyOptions: {
    single: true,
    double: true,
    triple: true,
    quad: true,
  },
  inclusions: {
    visa: true,
    flights: true,
    transfers: true,
    meals: false,
  },
};

const packageWithAirport = (id: string, departureAirport: string): Package => ({
  ...basePackage,
  id,
  slug: id,
  departureAirport,
});

describe('filterByParams', () => {
  it('filters London Heathrow and London Gatwick as separate airport options', () => {
    const packages = [
      packageWithAirport('lhr-package', 'LHR'),
      packageWithAirport('lgw-package', 'LGW'),
      packageWithAirport('bhx-package', 'BHX'),
    ];

    expect(filterByParams(packages, new URLSearchParams('departureAirport=LHR')).map((pkg) => pkg.id)).toEqual([
      'lhr-package',
    ]);
    expect(filterByParams(packages, new URLSearchParams('departureAirport=LGW')).map((pkg) => pkg.id)).toEqual([
      'lgw-package',
    ]);
  });

  it('ignores unsupported airport query values', () => {
    const packages = [packageWithAirport('lhr-package', 'LHR'), packageWithAirport('lgw-package', 'LGW')];

    expect(filterByParams(packages, new URLSearchParams('departureAirport=LON')).map((pkg) => pkg.id)).toEqual([
      'lhr-package',
      'lgw-package',
    ]);
  });
});

describe('toSearchDisplay — data integrity (missing = Not provided)', () => {
  it('returns null hotel name and rating when the operator has not supplied them', () => {
    const display = toSearchDisplay(basePackage);

    // No inferred star rating (was previously ?? 4) and no title-as-hotel-name.
    expect(display.makkahHotel.rating).toBeNull();
    expect(display.madinaHotel.rating).toBeNull();
    expect(display.makkahHotel.name).toBeNull();
    expect(display.madinaHotel.name).toBeNull();
    expect(display.makkahHotel.name).not.toBe(basePackage.title);
  });

  it('passes through operator-supplied hotel name and rating unchanged', () => {
    const display = toSearchDisplay({
      ...basePackage,
      hotelMakkahName: 'Hilton Makkah',
      hotelMakkahStars: 5,
      hotelMadinahName: 'Pullman Madinah',
      hotelMadinahStars: 4,
    });

    expect(display.makkahHotel.name).toBe('Hilton Makkah');
    expect(display.makkahHotel.rating).toBe(5);
    expect(display.madinaHotel.name).toBe('Pullman Madinah');
    expect(display.madinaHotel.rating).toBe(4);
  });
});
