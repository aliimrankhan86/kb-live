import { describe, expect, it, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { TierExplanation } from '@/components/operators/TierExplanation';
import { PackageDetail } from '@/components/packages/PackageDetail';
import { SearchPackagesClient } from '@/components/search/SearchPackagesClient';
import NotFound from '@/app/not-found';
import { VERIFICATION_STATEMENT, VERIFICATION_STATEMENT_SHORT } from '@/lib/content-rules';
import { SHORTLIST_STORAGE_KEY } from '@/lib/shortlist';
import { MockDB } from '@/lib/api/mock-db';
import type { OperatorProfile, Package } from '@/lib/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

const pkg: Package = { ...MockDB.getPackages()[0], id: 'p-ux21', slug: 'p-ux21', operatorId: 'op1', status: 'published' };
const operator: OperatorProfile = { id: 'op1', companyName: 'Al Amanah', slug: 'al-amanah', verificationStatus: 'verified', contactEmail: 'ops@example.com', atolNumber: 'A1', tier: 'listed' };

describe('UX-15: "How we verify operators" notice', () => {
  it('is titled plainly, follows verification (not tier) and links the full statement', () => {
    render(<TierExplanation verified />);
    expect(screen.getByText('How we verify operators')).toBeTruthy();
    expect(screen.getByText('Full statement')).toHaveAttribute('href', '/how-we-rank#verification-heading');
    expect(screen.queryByText(/Basic details have been collected/)).toBeNull();
  });

  it('is shorter than the §7 statement but keeps every check and every limit', () => {
    expect(VERIFICATION_STATEMENT_SHORT.length).toBeLessThan(VERIFICATION_STATEMENT.length);
    for (const part of [/ATOL number/, /CAA's public register/, /Companies House/, /UK trading address/, /at the time of listing/,
      /do not guarantee service quality/, /financial protection for your specific booking/, /future conduct/]) {
      expect(VERIFICATION_STATEMENT_SHORT).toMatch(part);
    }
  });

  it('a verified operator with tier "listed" no longer reads "Listed" on the package page', () => {
    render(<PackageDetail pkg={pkg} operator={operator} />);
    expect(screen.getByTestId('tier-explanation').textContent).toContain('How we verify operators');
  });
});

describe('UX-18: operator copy makes no ranking promise', () => {
  it('the homepage operator card says no operator pays for ranking', () => {
    const src = readFileSync('components/marketing/AudienceRouter.tsx', 'utf8');
    expect(src).not.toMatch(/rank at its best/);
    expect(src).toContain('no operator pays for ranking');
  });
});

describe('UX-20: 404 page', () => {
  it('has an h1 and a link back to packages', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.getByTestId('not-found-packages')).toHaveAttribute('href', '/packages');
  });
});

describe('UX-21: package page actions', () => {
  beforeEach(() => localStorage.clear());

  it('links the operator, and Compare opens /packages with this package selected', () => {
    render(<PackageDetail pkg={pkg} operator={operator} />);
    expect(screen.getByTestId('package-operator-link')).toHaveAttribute('href', '/operators/al-amanah');
    expect(screen.getByTestId('package-compare')).toHaveAttribute('href', '/packages?compare=p-ux21');
  });

  it('Save adds to and removes from the same saved list the cards use', () => {
    render(<PackageDetail pkg={pkg} operator={operator} />);
    fireEvent.click(screen.getByTestId('package-save'));
    expect(JSON.parse(localStorage.getItem(SHORTLIST_STORAGE_KEY)!)).toEqual(['p-ux21']);
    expect(screen.getByTestId('package-save')).toHaveTextContent('Saved');
    fireEvent.click(screen.getByTestId('package-save'));
    expect(JSON.parse(localStorage.getItem(SHORTLIST_STORAGE_KEY)!)).toEqual([]);
  });

  it('/packages?compare=<id> arrives with that package selected', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<SearchPackagesClient allPackages={[pkg]} featuredSlotsEnabled={false} operators={[operator]} initialCompareIds={['p-ux21']} />);
    expect(screen.getByRole('region', { name: 'Packages selected to compare' }).textContent).toContain('1 of 3 selected');
  });
});
