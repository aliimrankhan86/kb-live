import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { isProduction } from '@/lib/env';
import { StagingBanner, STAGING_BANNER_TEXT } from '@/components/layout/StagingBanner';

afterEach(() => vi.unstubAllEnvs());

const NON_PRODUCTION = ['preview', 'development', '', undefined];

describe('isProduction', () => {
  it('is true only for VERCEL_ENV=production', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(isProduction()).toBe(true);
  });

  it.each([...NON_PRODUCTION, 'Production', 'prod'])('is false for VERCEL_ENV=%s', (env) => {
    vi.stubEnv('VERCEL_ENV', env);
    expect(isProduction()).toBe(false);
  });
});

describe('test-site banner', () => {
  it('copy is exact and follows the house rules (no dashes, no semicolons)', () => {
    expect(STAGING_BANNER_TEXT).toBe(
      'Test site. All operators, packages and enquiries here are fictional. Do not enter real personal details.',
    );
    expect(STAGING_BANNER_TEXT).not.toMatch(/[—–;]/);
  });

  it.each(NON_PRODUCTION)('shows outside production (VERCEL_ENV=%s), with no dismiss control', (env) => {
    vi.stubEnv('VERCEL_ENV', env);
    render(<StagingBanner />);
    const banner = screen.getByTestId('staging-banner');
    expect(banner).toHaveTextContent(STAGING_BANNER_TEXT);
    expect(banner.querySelector('button')).toBeNull();
  });

  it('is absent in production', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const { container } = render(<StagingBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is the first element of every page body and uses design tokens only', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8');
    expect(layout).toMatch(/<body[^>]*>\s*<StagingBanner \/>/);
    const banner = readFileSync('components/layout/StagingBanner.tsx', 'utf8');
    expect(banner).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });
});
