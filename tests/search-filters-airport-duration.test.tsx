import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FilterOverlay } from '@/components/search/FilterOverlay';
import { FILTER_PARAM_KEYS, liveAirportOptions, parseSearchCriteria, searchPackages } from '@/components/search/search-utils';
import { MockDB } from '@/lib/api/mock-db';
import type { Package } from '@/lib/types';

// UX-09: departure airport and trip length in the filter panel, using the
// shared search logic and stored in the URL.
const replace = vi.fn();
let query = 'type=umrah&departureCity=London';
let params = new URLSearchParams(query); // stable between renders, as in Next
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/search/packages',
  useSearchParams: () => params,
}));

const base = MockDB.getPackages()[0];
const pkg = (id: string, totalNights: number, departureAirport: string): Package => ({
  ...base, id, slug: id, totalNights, departureAirport, status: 'published', pilgrimageType: 'umrah',
});

describe('trip length in the shared search logic', () => {
  it('reads minNights and maxNights from the URL', () => {
    expect(parseSearchCriteria(new URLSearchParams('minNights=8&maxNights=10')).nights).toEqual({ min: 8, max: 10 });
    expect(parseSearchCriteria(new URLSearchParams('minNights=x')).nights).toBeUndefined();
    expect(FILTER_PARAM_KEYS).toEqual(expect.arrayContaining(['minNights', 'maxNights']));
  });

  it('keeps matching lengths and explains the rest as close matches', () => {
    const r = searchPackages([pkg('ten', 10, 'LHR'), pkg('fourteen', 14, 'LHR')], new URLSearchParams('maxNights=10'));
    expect(r.matches.map((p) => p.id)).toEqual(['ten']);
    expect(r.closeMatches[0].unmet).toEqual([{ id: 'nights', reason: 'Trip length: 14 nights' }]);
  });
});

describe('departure airport options', () => {
  it('lists only airports that live packages leave from', () => {
    const opts = liveAirportOptions([pkg('a', 10, 'LHR'), pkg('b', 7, 'London Stansted'), pkg('c', 7, 'LHR')]);
    expect(opts.map((o) => o.code)).toEqual(['LHR', 'STN']);
    expect(opts[0].label).toMatch(/\(LHR\)$/);
  });
});

describe('filter panel', () => {
  beforeEach(() => { replace.mockClear(); query = 'type=umrah&departureCity=London'; params = new URLSearchParams(query); });

  it('writes the airport and trip length to the URL, replacing a city search', () => {
    render(<FilterOverlay isOpen onClose={() => {}} airportOptions={[{ code: 'LHR', label: 'London Heathrow (LHR)' }]} />);
    fireEvent.change(screen.getByTestId('filter-departure-airport'), { target: { value: 'LHR' } });
    fireEvent.click(screen.getByTestId('filter-duration-8-10'));
    fireEvent.click(screen.getByTestId('filter-apply-btn'));
    const url = new URL(replace.mock.calls[0][0], 'http://x');
    expect(url.searchParams.get('departureAirport')).toBe('LHR');
    expect(url.searchParams.get('departureCity')).toBeNull();
    expect(url.searchParams.get('minNights')).toBe('8');
    expect(url.searchParams.get('maxNights')).toBe('10');
    expect(url.searchParams.get('type')).toBe('umrah');
  });

  it('reopens showing what the URL already applies', () => {
    query = 'departureAirport=LHR&maxNights=7';
    params = new URLSearchParams(query);
    render(<FilterOverlay isOpen onClose={() => {}} airportOptions={[{ code: 'LHR', label: 'London Heathrow (LHR)' }]} />);
    expect((screen.getByTestId('filter-departure-airport') as HTMLSelectElement).value).toBe('LHR');
    expect(screen.getByTestId('filter-duration-up-to-7')).toHaveAttribute('aria-pressed', 'true');
  });
});
