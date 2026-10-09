import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MockDB } from '@/lib/api/mock-db';
import { PackagesBrowse } from '@/components/packages/PackagesBrowse';
import type { OperatorProfile } from '@/lib/types';

// UX-02: operator names were fetched after hydration, so the line stayed blank
// for over 1.5 s and then pushed the card down. They now come from the server
// in the first HTML. UX-03: the name links to the operator's page.
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/packages',
}));
const fetchSpy = vi.fn(() => new Promise(() => {}));
vi.stubGlobal('fetch', fetchSpy);

const pkg = { ...MockDB.getPackages()[0], id: 'p1', slug: 'p1', operatorId: 'op-ssr', status: 'published' as const };
const operator: OperatorProfile = {
  id: 'op-ssr', companyName: 'Server Rendered Travel', slug: 'server-rendered-travel',
  verificationStatus: 'verified', contactEmail: 'ops@example.com', atolNumber: 'ATOL-1',
};

describe('operator name on /packages cards', () => {
  it('is in the server HTML, linked to the operator page, without a client fetch', () => {
    const html = renderToString(<PackagesBrowse packages={[pkg]} operators={[operator]} />);
    expect(html).toContain('Server Rendered Travel');
    expect(html).toMatch(/href="\/operators\/server-rendered-travel"[^>]*data-testid="operator-link-p1"|data-testid="operator-link-p1"[^>]*href="\/operators\/server-rendered-travel"/);
    expect(html).not.toContain('Loading operator name');
    expect(fetchSpy).not.toHaveBeenCalledWith('/api/operators');
  });
});
