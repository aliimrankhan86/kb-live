import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

const mockPush = vi.fn();
let params = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  useSearchParams: () => params,
  usePathname: () => '/login',
}));
global.fetch = vi.fn();

async function loginAs(role: string) {
  (global.fetch as Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'u1', email: 'a@b.c', role } }) });
  render(<LoginForm />);
  fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'a@b.c' } });
  fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'TestPass1!' } });
  fireEvent.click(screen.getByTestId('login-submit'));
}

describe('LoginForm ?redirect= is same-site only', () => {
  it.each(['//evil.com', 'https://evil.com', '/\\evil.com'])('ignores redirect=%s for an operator', async (r) => {
    mockPush.mockClear();
    params = new URLSearchParams({ redirect: r });
    await loginAs('operator');
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/operator/dashboard'));
  });

  it('honours a same-site redirect', async () => {
    mockPush.mockClear();
    params = new URLSearchParams({ redirect: '/packages/abc' });
    await loginAs('customer');
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/packages/abc'));
  });
});
