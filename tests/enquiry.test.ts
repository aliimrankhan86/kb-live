import { describe, it, expect, beforeEach } from 'vitest';
import { enquirySchema } from '@/lib/validation';
import { Repository } from '@/lib/api/repository';
import { MockDB } from '@/lib/api/mock-db';

describe('enquirySchema', () => {
  const base = { packageId: 'pkg-1', name: 'Aisha Khan', email: 'aisha@example.com' };

  it('accepts name + email', () => {
    expect(enquirySchema.safeParse(base).success).toBe(true);
  });

  it('accepts name + phone (no email)', () => {
    const r = enquirySchema.safeParse({ packageId: 'pkg-1', name: 'Aisha', phone: '07700 900000' });
    expect(r.success).toBe(true);
  });

  it('rejects missing name', () => {
    const r = enquirySchema.safeParse({ packageId: 'pkg-1', email: 'a@example.com' });
    expect(r.success).toBe(false);
  });

  it('rejects when neither email nor phone given', () => {
    const r = enquirySchema.safeParse({ packageId: 'pkg-1', name: 'Aisha' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toContain('email or phone');
  });

  it('rejects an invalid email', () => {
    const r = enquirySchema.safeParse({ packageId: 'pkg-1', name: 'Aisha', email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('rejects missing packageId', () => {
    const r = enquirySchema.safeParse({ name: 'Aisha', email: 'a@example.com' });
    expect(r.success).toBe(false);
  });

  it('leaves travelMonth and message optional', () => {
    const r = enquirySchema.safeParse({ ...base, travelMonth: '', message: '' });
    expect(r.success).toBe(true);
  });
});

describe('Repository.createEnquiry', () => {
  beforeEach(() => {
    MockDB.getEnquiries().length = 0; // ensure isolation in shared in-memory store
  });

  it('issues a KT- reference code and persists the enquiry', async () => {
    const enquiry = await Repository.createEnquiry({
      packageId: 'pkg-1',
      operatorId: 'op-1',
      packageTitle: '10-night Umrah',
      operatorName: 'Al Amanah Travel',
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      travelMonth: 'March 2026',
    });

    expect(enquiry.referenceCode).toMatch(/^KT-[A-Z0-9]{8}$/);
    expect(enquiry.id).toBeTruthy();
    expect(enquiry.createdAt).toBeTruthy();

    const stored = await Repository.getEnquiries?.() ?? MockDB.getEnquiries();
    const found = stored.find((e) => e.id === enquiry.id);
    expect(found).toBeDefined();
    expect(found?.packageId).toBe('pkg-1');
    expect(found?.operatorName).toBe('Al Amanah Travel');
    expect(found?.email).toBe('aisha@example.com');
  });

  it('issues unique reference codes across enquiries', async () => {
    const a = await Repository.createEnquiry({ packageId: 'p', name: 'A', email: 'a@example.com' });
    const b = await Repository.createEnquiry({ packageId: 'p', name: 'B', phone: '07700 900111' });
    expect(a.referenceCode).not.toBe(b.referenceCode);
  });

  it('normalises blank optional fields to undefined', async () => {
    const enquiry = await Repository.createEnquiry({
      packageId: 'p',
      name: '  Aisha  ',
      phone: '07700 900222',
      travelMonth: '   ',
      message: '',
    });
    expect(enquiry.name).toBe('Aisha');
    expect(enquiry.travelMonth).toBeUndefined();
    expect(enquiry.message).toBeUndefined();
    expect(enquiry.email).toBeUndefined();
  });
});
