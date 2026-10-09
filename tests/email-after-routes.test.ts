import { describe, it, expect, beforeEach, vi } from 'vitest';

// Quote and booking emails must be handed to after() so the platform keeps the
// function alive until they finish. A bare `void send()` can be killed when the
// response returns (B0 staging, batch 1 item 10).
const scheduled: Array<() => unknown> = [];

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({ _body: body, _status: init?.status ?? 200 }),
  },
  NextRequest: class {},
  after: (fn: () => unknown) => { scheduled.push(fn); },
}));

vi.mock('@/lib/config', () => ({ isRfqQuoteEnabled: () => true, isBookingFlowEnabled: () => true }));
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ limited: false })),
  getRateLimitIdentifier: vi.fn(() => 'test'),
}));
vi.mock('@/lib/auth/session', () => ({
  getSessionUser: vi.fn(() =>
    Promise.resolve({ id: 'cust-1', role: 'customer', email: 'pilgrim@example.com', name: 'Aisha', emailVerified: true })
  ),
}));

const operator = { id: 'op-1', companyName: 'Al Amanah Travel', contactEmail: 'leads@alamanah.example' };
vi.mock('@/lib/api/repository', () => ({
  Repository: {
    createQuoteRequest: vi.fn((_ctx: unknown, req: Record<string, unknown>) => Promise.resolve(req)),
    createBookingIntent: vi.fn((_ctx: unknown, input: Record<string, unknown>) =>
      Promise.resolve({ id: 'bi-1', referenceCode: 'PC-BOOK0001', ...input })
    ),
    getPackageById: vi.fn(() => Promise.resolve(undefined)),
    getOperatorById: vi.fn(() => Promise.resolve(operator)),
    listPackages: vi.fn(() => Promise.resolve([])),
  },
}));

const sendEnquiryConfirmation = vi.fn(() => Promise.resolve());
const sendBookingIntentConfirmation = vi.fn(() => Promise.resolve());
vi.mock('@/lib/email/send', () => ({
  sendEnquiryConfirmation,
  sendOperatorEnquiryAlert: vi.fn(() => Promise.resolve()),
  sendBookingIntentConfirmation,
  sendPaymentEvidenceNotification: vi.fn(() => Promise.resolve()),
  findSimilarPackages: () => [],
  quoteRefCode: (id: string) => `QR-${id.slice(0, 8)}`,
}));

const req = (body: unknown) => ({ json: async () => body, headers: { get: () => null } }) as never;
const status = (res: unknown) => (res as { _status: number })._status;

const quoteBody = {
  type: 'umrah', season: 'flexible', totalNights: 10, nightsMakkah: 5, nightsMadinah: 5, hotelStars: 4,
  distancePreference: 'near', occupancy: { single: 0, double: 1, triple: 0, quad: 0 },
  inclusions: { visa: true, flights: true, transfers: true, meals: false }, sourceOperatorId: 'op-1',
};
const bookingBody = { offerId: 'offer-1', operatorId: 'op-1' };

const routes = [
  { name: 'quote-requests', load: () => import('@/app/api/quote-requests/route'), body: quoteBody, send: sendEnquiryConfirmation, log: '[email] sendQuoteEmails failed:' },
  { name: 'booking-intents', load: () => import('@/app/api/booking-intents/route'), body: bookingBody, send: sendBookingIntentConfirmation, log: '[email] sendBookingEmails failed:' },
];

describe.each(routes)('/api/$name email delivery', ({ load, body, send, log }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    scheduled.length = 0;
  });

  it('returns 201 before sending, with the send scheduled via after()', async () => {
    const { POST } = await load();
    expect(status(await POST(req(body)))).toBe(201);
    expect(scheduled).toHaveLength(1);
    expect(send).not.toHaveBeenCalled();
    await scheduled[0]();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('logs a failed send and the response still succeeds', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockRejectedValueOnce(new Error('Resend unreachable'));
    const { POST } = await load();
    expect(status(await POST(req(body)))).toBe(201);
    await expect(scheduled[0]()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(log, expect.objectContaining({ message: 'Resend unreachable' }));
    error.mockRestore();
  });
});
