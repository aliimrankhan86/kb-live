import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  notFound: () => { throw new Error('NEXT_NOT_FOUND'); },
}));

const ENV = { ...process.env };
afterEach(() => { process.env = { ...ENV }; vi.unstubAllGlobals(); vi.resetModules(); });

const signedInCustomer = () =>
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ user: { id: 'c1', email: 'c@test.local', role: 'customer' } }) })));

describe('parked RFQ flow is unreachable when the flag is off', () => {
  it('/requests 404s', async () => {
    delete process.env.FEATURE_RFQ_QUOTE;
    const { default: RequestsPage } = await import('@/app/requests/page');
    expect(() => RequestsPage()).toThrow('NEXT_NOT_FOUND');
  });

  it('header hides "My Requests" for a signed-in customer', async () => {
    signedInCustomer();
    const { Header } = await import('@/components/layout/Header');
    const { ThemeProvider } = await import('@/components/theme/ThemeProvider');
    render(<ThemeProvider><Header /></ThemeProvider>);
    await waitFor(() => expect(screen.queryAllByTestId('nav-login')).toHaveLength(0));
    expect(screen.queryAllByTestId('nav-requests')).toHaveLength(0);
  });

  it('header shows "My Requests" when the parked flow is switched on', async () => {
    signedInCustomer();
    const { Header } = await import('@/components/layout/Header');
    const { ThemeProvider } = await import('@/components/theme/ThemeProvider');
    render(<ThemeProvider><Header rfqEnabled /></ThemeProvider>);
    await waitFor(() => expect(screen.queryAllByTestId('nav-requests').length).toBeGreaterThan(0));
  });
});

describe('parked self-serve onboarding status page', () => {
  it('404s when FEATURE_OPERATOR_SELF_SERVE is off', async () => {
    delete process.env.FEATURE_OPERATOR_SELF_SERVE;
    const { default: Page } = await import('@/app/operator/onboarding/status/page');
    expect(() => Page()).toThrow('NEXT_NOT_FOUND');
  });
});
