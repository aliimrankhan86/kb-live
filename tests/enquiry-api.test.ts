import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('next/server', () => {
  const NextResponse = {
    json: (body: unknown, init?: { status?: number }) => ({
      _body: body,
      _status: init?.status ?? 200,
      json: async () => body,
      status: init?.status ?? 200,
    }),
  };
  return { NextResponse, NextRequest: class {} };
});

vi.mock('@/lib/rate-limit', async () => {
  const actual = await vi.importActual<typeof import('@/lib/rate-limit')>('@/lib/rate-limit');
  return {
    ...actual,
    checkRateLimit: vi.fn(() => ({ limited: false })),
    getRateLimitIdentifier: vi.fn(() => 'test-identifier'),
  };
});

const sendEnquiryConfirmation = vi.fn(() => Promise.resolve());
const sendOperatorEnquiryAlert = vi.fn(() => Promise.resolve());
vi.mock('@/lib/email/send', () => ({ sendEnquiryConfirmation, sendOperatorEnquiryAlert }));

const publishedPackage = {
  id: 'pkg-1',
  status: 'published',
  title: '10-night Umrah from London',
  operatorId: 'op-1',
};
const operator = { id: 'op-1', companyName: 'Al Amanah Travel', tradingName: 'Al Amanah', contactEmail: 'leads@alamanah.example' };

const createEnquiry = vi.fn((input: Record<string, unknown>) =>
  Promise.resolve({ id: 'enq-1', referenceCode: 'KT-ABCD1234', createdAt: '2026-06-15T00:00:00.000Z', ...input })
);
const createMarketingConsent = vi.fn((input: Record<string, unknown>) =>
  Promise.resolve({ id: 'mc-1', consent: true, consentTimestamp: '2026-06-15T00:00:00.000Z', createdAt: '2026-06-15T00:00:00.000Z', ...input })
);

vi.mock('@/lib/api/repository', () => ({
  Repository: {
    getPackageById: vi.fn((id: string) => Promise.resolve(id === 'pkg-1' ? publishedPackage : undefined)),
    getOperatorById: vi.fn(() => Promise.resolve(operator)),
    createEnquiry: (input: Record<string, unknown>) => createEnquiry(input),
    createMarketingConsent: (input: Record<string, unknown>) => createMarketingConsent(input),
  },
}));

const makeRequest = (body: unknown) => ({ json: async () => body, headers: { get: () => null } });

async function callRoute(body: unknown) {
  const { POST } = await import('@/app/api/enquiries/route');
  const res = await POST(makeRequest(body) as never);
  return { body: (res as unknown as { _body: Record<string, unknown> })._body, status: (res as unknown as { _status: number })._status };
}

describe('/api/enquiries route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns 201 with a reference code for a valid enquiry', async () => {
    const { body, status } = await callRoute({ packageId: 'pkg-1', name: 'Aisha Khan', email: 'aisha@example.com', travelMonth: 'March 2026' });
    expect(status).toBe(201);
    expect(body.referenceCode).toBe('KT-ABCD1234');
  });

  it('persists package + operator names resolved server-side (not from client)', async () => {
    await callRoute({ packageId: 'pkg-1', name: 'Aisha', phone: '07700 900000', packageTitle: 'HACK', operatorName: 'HACK' });
    expect(createEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ packageTitle: '10-night Umrah from London', operatorName: 'Al Amanah', operatorId: 'op-1' })
    );
  });

  it('fires pilgrim confirmation + operator alert emails', async () => {
    await callRoute({ packageId: 'pkg-1', name: 'Aisha', email: 'aisha@example.com' });
    // allow the fire-and-forget microtask to run
    await new Promise((r) => setTimeout(r, 0));
    expect(sendEnquiryConfirmation).toHaveBeenCalledTimes(1);
    expect(sendOperatorEnquiryAlert).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when name is missing', async () => {
    const { status } = await callRoute({ packageId: 'pkg-1', email: 'a@example.com' });
    expect(status).toBe(400);
  });

  it('returns 400 when neither email nor phone provided', async () => {
    const { status, body } = await callRoute({ packageId: 'pkg-1', name: 'Aisha' });
    expect(status).toBe(400);
    expect(String(body.error)).toContain('email or phone');
  });

  it('returns 404 for an unknown / unpublished package', async () => {
    const { status } = await callRoute({ packageId: 'nope', name: 'Aisha', email: 'a@example.com' });
    expect(status).toBe(404);
  });

  // ─── Task 3: marketing opt-in ────────────────────────────────────────────
  it('sends the enquiry with consent unticked and stores NO consent record', async () => {
    const { status, body } = await callRoute({ packageId: 'pkg-1', name: 'Aisha', email: 'aisha@example.com' });
    expect(status).toBe(201);
    expect(body.referenceCode).toBe('KT-ABCD1234');
    expect(createMarketingConsent).not.toHaveBeenCalled();
  });

  it('stores a consent record only when ticked AND an email is present', async () => {
    const { status } = await callRoute({ packageId: 'pkg-1', name: 'Aisha', email: 'aisha@example.com', marketingConsent: true });
    expect(status).toBe(201);
    expect(createMarketingConsent).toHaveBeenCalledTimes(1);
    expect(createMarketingConsent).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'aisha@example.com', enquiryReference: 'KT-ABCD1234', source: 'enquiry_form' })
    );
  });

  it('stores NO consent record when ticked but phone-only (no email)', async () => {
    const { status } = await callRoute({ packageId: 'pkg-1', name: 'Aisha', phone: '07700 900000', marketingConsent: true });
    expect(status).toBe(201);
    expect(createMarketingConsent).not.toHaveBeenCalled();
  });

  it('never fails the enquiry if the consent store throws', async () => {
    createMarketingConsent.mockRejectedValueOnce(new Error('db down'));
    const { status, body } = await callRoute({ packageId: 'pkg-1', name: 'Aisha', email: 'aisha@example.com', marketingConsent: true });
    expect(status).toBe(201);
    expect(body.referenceCode).toBe('KT-ABCD1234');
  });
});
