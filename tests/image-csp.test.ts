import { afterEach, describe, expect, it, vi } from 'vitest';

const ENV = { ...process.env };
afterEach(() => { process.env = { ...ENV }; vi.resetModules(); });

describe('uploaded package images are allowed, nothing else is opened up', () => {
  it('CSP img-src allows exactly this project\'s Supabase origin', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
    const { createContentSecurityPolicy } = await import('@/middleware');
    const imgSrc = createContentSecurityPolicy('n').split('; ').find((d) => d.startsWith('img-src'))!;
    expect(imgSrc).toBe("img-src 'self' data: blob: https://images.unsplash.com https://abcdefgh.supabase.co");
    expect(createContentSecurityPolicy('n')).not.toMatch(/script-src[^;]*unsafe-inline/);
  });

  it('connect-src allows a non-supabase.co project origin (local stack) without widening anything else', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    const { createContentSecurityPolicy } = await import('@/middleware');
    const connect = createContentSecurityPolicy('n').split('; ').find((d) => d.startsWith('connect-src'))!;
    expect(connect).toContain('http://127.0.0.1:54321');
    expect(connect).not.toMatch(/\*(?!\.supabase\.co)/);
  });

  it('next/image accepts this project\'s public storage path only', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    const { default: config } = await import('@/next.config');
    expect(config.images?.remotePatterns).toContainEqual({
      protocol: 'http', hostname: '127.0.0.1', port: '54321', pathname: '/storage/v1/object/public/**',
    });
  });
});
