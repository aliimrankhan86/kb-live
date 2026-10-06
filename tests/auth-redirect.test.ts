import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { safeRedirectPath } from '@/lib/auth/redirect';

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession: async () => ({ error: null }),
      verifyOtp: async () => ({ error: null }),
      getUser: async () => ({ data: { user: { app_metadata: { role: 'customer' } } } }),
    },
  }),
}));

describe('safeRedirectPath', () => {
  it.each(['/', '/settings', '/packages/abc?x=1#y', '/operator/dashboard'])('keeps same-site path %s', (p) => {
    expect(safeRedirectPath(p)).toBe(p);
  });

  it.each([
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    '\\\\evil.com',
    'javascript:alert(1)',
    '/\tevil.com',
    'evil.com',
    '',
    null,
    undefined,
  ])('rejects %j', (p) => {
    expect(safeRedirectPath(p as string | null | undefined, '/home')).toBe('/home');
  });
});

describe('/auth/confirm never redirects off-site', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
  });

  it.each(['//evil.com', 'https://evil.com/phish', '/\\evil.com'])('next=%s lands on the site root', async (next) => {
    const { GET } = await import('@/app/auth/confirm/route');
    const req = new NextRequest(`http://127.0.0.1:3000/auth/confirm?code=abc&next=${encodeURIComponent(next)}`);
    const res = await GET(req);
    const location = new URL(res.headers.get('location')!);
    expect(location.host).toBe(new URL(req.url).host);
    expect(location.pathname).toBe('/');
  });

  it('keeps a same-site next path', async () => {
    const { GET } = await import('@/app/auth/confirm/route');
    const res = await GET(new NextRequest('http://127.0.0.1:3000/auth/confirm?code=abc&next=/settings'));
    expect(new URL(res.headers.get('location')!).pathname).toBe('/settings');
  });
});
