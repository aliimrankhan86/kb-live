import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import type { Enquiry, MarketingConsent } from '@/lib/types';

/**
 * The privacy page must describe what the code does today (PR109 report,
 * mismatches M1 to M7). These pins fail if the wording drifts back to a
 * promise no code keeps.
 */
const page = readFileSync('app/privacy/page.tsx', 'utf8').replace(/\s+/g, ' ');

describe('privacy page says what the code does', () => {
  it('M1: booking intent data is not described as auto-deleted', () => {
    expect(page).not.toContain('auto-deleted');
    expect(page).toContain('Kept until you ask us to delete it. Payment evidence files stop being shown 90 days after you upload them, unless a dispute is open.');
  });

  it('M2: account deletion says what is removed, what is kept and who must email', () => {
    expect(page).not.toContain('Deleted straight away when you delete your account<');
    expect(page).toContain('If your account has no quote requests, bookings or complaints, deleting it in Settings removes your account, marketing choices and Hajj availability alerts straight away, and removes your name and contact details from your enquiries. Other accounts, including operator accounts, are deleted by hand: email dpo@pilgrimcompare.co.uk.');
  });

  it('M3: audit and complaint periods stay at 7 years, with the deletion on the backlog', () => {
    expect(page).toContain('7 years (legal and financial requirement)');
    expect(page).toContain('7 years (consumer protection requirement)');
    const backlog = readFileSync('docs/BACKLOG.md', 'utf8');
    expect(backlog).toMatch(/audit_log_entries/);
    expect(backlog).toMatch(/complaints/);
  });

  it('M4: every store that holds personal data has a stated retention', () => {
    for (const row of [
      'Marketing choices', 'Hajj availability alerts', 'Quote requests', 'Operator statistics', 'Emails we send you',
    ]) expect(page).toContain(row);
    expect(page).toContain('Kept until you delete your account or ask us to remove them.');
    expect(page).toContain('Sent through Resend. We do not keep a copy. Resend keeps delivery records under its own retention policy.');
  });

  it('M5: section 2 lists what the enquiry form really collects', () => {
    expect(page).toContain('your name, email address, phone number, travel month, your message and whether you agreed to marketing emails');
    expect(page).toContain('<strong>Quote request details:</strong>');
  });

  it('M6: one privacy inbox, the DPO address', () => {
    expect(page).not.toContain('privacy@');
    expect(page).toContain('To exercise any right, email');
    expect(page.match(/dpo@pilgrimcompare\.co\.uk/g)!.length).toBeGreaterThanOrEqual(3);
  });

  it('copy rules: no dashes used as punctuation', () => {
    expect(page).not.toMatch(/[–—]/);
  });
});

const enquiry = (id: string, email: string): Enquiry => ({
  id, referenceCode: `PC-${id}`, createdAt: '2026-01-01T00:00:00.000Z', packageId: 'pkg-1', operatorId: 'op1',
  name: 'Amina Test', email, phone: '07000000000', message: 'Two adults', travelMonth: '2027-03',
});
const consent = (email: string, enquiryReference: string): MarketingConsent => ({
  id: `c-${enquiryReference}`, email, consent: true, consentTimestamp: '2026-01-01T00:00:00.000Z',
  source: 'enquiry_form', enquiryReference, createdAt: '2026-01-01T00:00:00.000Z',
});

const session = { current: null as null | { id: string; role: string; email?: string } };
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => session.current }));

const exportFor = async () => {
  const { POST } = await import('@/app/api/user/export/route');
  const res = await POST();
  return { status: res.status, body: await res.json() };
};

describe('M7: POST /api/user/export includes everything held under the account email', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    session.current = { id: 'cust-1', role: 'customer', email: 'Pilgrim@Example.test' };
  });

  it('exports enquiries, marketing choices and alerts for this email only', async () => {
    MockDB.saveEnquiry(enquiry('mine', 'pilgrim@example.test'));
    MockDB.saveEnquiry(enquiry('theirs', 'other@example.test'));
    MockDB.saveMarketingConsent(consent('PILGRIM@example.test', 'PC-mine'));
    MockDB.saveMarketingConsent(consent('other@example.test', 'PC-theirs'));
    MockDB.saveInterest('pilgrim@example.test', 'hajj');
    MockDB.saveInterest('other@example.test', 'hajj');

    const { status, body } = await exportFor();
    expect(status).toBe(200);
    expect(body.enquiries.map((e: Enquiry) => e.id)).toEqual(['mine']);
    expect(body.marketingConsents.map((c: MarketingConsent) => c.enquiryReference)).toEqual(['PC-mine']);
    expect(body.interests).toEqual([expect.objectContaining({ email: 'pilgrim@example.test', type: 'hajj' })]);
  });

  it('fails loudly instead of exporting an empty alerts list when the read fails', async () => {
    vi.spyOn(MockDB, 'getInterests').mockImplementation(() => { throw new Error('permission denied for table interests'); });
    const { status, body } = await exportFor();
    expect(status).toBe(500);
    expect(body.interests).toBeUndefined();
  });
});
