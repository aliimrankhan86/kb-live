import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PackageDetailPage, { generateMetadata } from '@/app/packages/[slug]/page';
import PackageNotFound, { metadata as notFoundMetadata } from '@/app/packages/[slug]/not-found';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { OperatorProfile, Package } from '@/lib/types';

// Batch 3 item 1: an unknown or unpublished package URL was a soft 404 (HTTP 200,
// robots "index, follow", a "Package not found" body). It is now a real 404.
const op: OperatorProfile = { id: 'op-nf', companyName: 'op-nf', slug: 'op-nf', verificationStatus: 'verified', contactEmail: 'op@example.com', atolNumber: 'ATOL-NF' };
const draft: Package = { ...MockDB.getPackages()[0], id: 'nf-draft', slug: 'nf-draft', operatorId: op.id, status: 'draft', dateWindow: { start: '2099-01-10', end: '2099-01-20' } };
const params = (slug: string) => ({ params: Promise.resolve({ slug }) });
const NOT_FOUND = { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' };

describe('unknown package URLs are a real 404 and never indexable', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    MockDB.saveOperator(op);
    MockDB.savePackage(draft);
  });

  it('generateMetadata on a missing slug says noindex, nofollow', async () => {
    expect(await generateMetadata(params('does-not-exist'))).toEqual({
      title: 'Package not found',
      description: 'Package details are unavailable.',
      robots: { index: false, follow: false },
    });
  });

  it('a missing slug and an unpublished package call notFound()', async () => {
    await expect(PackageDetailPage(params('does-not-exist'))).rejects.toMatchObject(NOT_FOUND);
    await expect(PackageDetailPage(params('nf-draft'))).rejects.toMatchObject(NOT_FOUND);
    expect((await generateMetadata(params('nf-draft'))).robots).toEqual({ index: false, follow: false });
  });

  it('not-found.tsx keeps the alert markup and is noindex', () => {
    const html = renderToStaticMarkup(<PackageNotFound />);
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-testid="package-not-found"');
    expect(html).toContain('This package is no longer available.');
    expect(notFoundMetadata.robots).toEqual({ index: false, follow: false });
  });

  it('a load error stays a rendered message with a noindex robots tag', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Repository, 'getPublicPackageBySlug').mockRejectedValue(new Error('db down'));
    const html = renderToStaticMarkup(await PackageDetailPage(params('anything')));
    expect(html).toContain('Unable to load this package right now.');
    expect(html).toContain('data-testid="package-not-found"');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>');
    expect((await generateMetadata(params('anything'))).robots).toEqual({ index: false, follow: false });
  });
});
