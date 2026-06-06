import { describe, it, expect, beforeEach } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { Repository, RequestContext } from '@/lib/api/repository';

const customerCtx: RequestContext = { userId: 'cust1', role: 'customer' };
const operatorCtx: RequestContext = { userId: 'op1', role: 'operator' };
const otherOperatorCtx: RequestContext = { userId: 'op2', role: 'operator' };
const adminCtx: RequestContext = { userId: 'admin1', role: 'admin' };

describe('Complaints repository', () => {
  beforeEach(() => {
    localStorage.clear();
    MockDB.setCurrentUser('customer');
    // Seed a booking intent for complaint tests
    MockDB.saveBookingIntent({
      id: 'bi-1',
      referenceCode: 'KT-TEST-001',
      offerId: 'offer-test-1',
      customerId: 'cust1',
      operatorId: 'op1',
      status: 'started',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  describe('createComplaint', () => {
    it('creates a complaint with valid input', async () => {
      const complaint = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'The hotel was much further from Haram than described.',
      });

      expect(complaint.id).toBeTruthy();
      expect(complaint.status).toBe('submitted');
      expect(complaint.customerId).toBe('cust1');
      expect(complaint.operatorId).toBe('op1');
      expect(complaint.description).toBe('The hotel was much further from Haram than described.');
    });

    it('blocks non-customer roles', async () => {
      await expect(
        Repository.createComplaint(operatorCtx, {
          bookingIntentId: 'bi-1',
          category: 'booking_problem',
          severity: 'medium',
          description: 'Something is wrong',
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('rejects invalid category', async () => {
      await expect(
        Repository.createComplaint(customerCtx, {
          bookingIntentId: 'bi-1',
          category: 'invalid_category' as unknown as 'booking_problem',
          severity: 'medium',
          description: 'Something is wrong',
        })
      ).rejects.toThrow('Invalid complaint category');
    });

    it('rejects invalid severity', async () => {
      await expect(
        Repository.createComplaint(customerCtx, {
          bookingIntentId: 'bi-1',
          category: 'booking_problem',
          severity: 'critical' as unknown as 'medium',
          description: 'Something is wrong',
        })
      ).rejects.toThrow('Invalid complaint severity');
    });

    it('rejects description under 10 chars', async () => {
      await expect(
        Repository.createComplaint(customerCtx, {
          bookingIntentId: 'bi-1',
          category: 'booking_problem',
          severity: 'medium',
          description: 'Short',
        })
      ).rejects.toThrow('Description must be at least 10 characters');
    });

    it('rejects empty description', async () => {
      await expect(
        Repository.createComplaint(customerCtx, {
          bookingIntentId: 'bi-1',
          category: 'booking_problem',
          severity: 'medium',
          description: '   ',
        })
      ).rejects.toThrow('Description is required');
    });
  });

  describe('getComplaints', () => {
    it('returns only customer complaints for customer role', async () => {
      await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'First complaint from cust1',
      });

      const all = await Repository.getComplaints(customerCtx);
      expect(all.length).toBeGreaterThanOrEqual(1);
      expect(all.every((c) => c.customerId === 'cust1')).toBe(true);
    });

    it('returns only operator complaints for operator role', async () => {
      MockDB.setCurrentUser('operator');
      const op1Complaints = await Repository.getComplaints(operatorCtx);
      expect(op1Complaints.every((c) => c.operatorId === 'op1')).toBe(true);
    });

    it('returns all complaints for admin role', async () => {
      MockDB.setCurrentUser('operator');
      const all = await Repository.getComplaints(adminCtx);
      expect(all.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getComplaintById', () => {
    it('returns complaint for owner customer', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Valid complaint for access test',
      });

      const found = await Repository.getComplaintById(customerCtx, created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns complaint for involved operator', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Valid complaint for access test',
      });

      MockDB.setCurrentUser('operator');
      const found = await Repository.getComplaintById(operatorCtx, created.id);
      expect(found).toBeDefined();
    });

    it('blocks unrelated operator', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Valid complaint for access test',
      });

      MockDB.setCurrentUser('operator');
      await expect(Repository.getComplaintById(otherOperatorCtx, created.id)).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateComplaintStatus', () => {
    it('allows operator to set operator_responding', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Status update test complaint',
      });

      MockDB.setCurrentUser('operator');
      const updated = await Repository.updateComplaintStatus(operatorCtx, created.id, 'operator_responding');
      expect(updated.status).toBe('operator_responding');
    });

    it('blocks operator from setting admin_triage', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Status restriction test',
      });

      MockDB.setCurrentUser('operator');
      await expect(
        Repository.updateComplaintStatus(operatorCtx, created.id, 'admin_triage')
      ).rejects.toThrow('Operator cannot set this status');
    });

    it('allows admin to set resolved', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Admin status test',
      });

      MockDB.setCurrentUser('operator');
      const updated = await Repository.updateComplaintStatus(adminCtx, created.id, 'resolved');
      expect(updated.status).toBe('resolved');
    });

    it('blocks customer from any status change', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Customer restriction test',
      });

      await expect(
        Repository.updateComplaintStatus(customerCtx, created.id, 'resolved')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateComplaintOperatorResponse', () => {
    it('allows operator to respond with min 5 chars', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Operator response test',
      });

      MockDB.setCurrentUser('operator');
      const updated = await Repository.updateComplaintOperatorResponse(
        operatorCtx,
        created.id,
        'We are investigating this now.'
      );
      expect(updated.operatorResponse).toBe('We are investigating this now.');
      expect(updated.status).toBe('operator_responding');
    });

    it('blocks operator response under 5 chars', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Operator response validation test',
      });

      MockDB.setCurrentUser('operator');
      await expect(
        Repository.updateComplaintOperatorResponse(operatorCtx, created.id, 'Ok')
      ).rejects.toThrow('Response must be at least 5 characters');
    });

    it('blocks non-operator from responding', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Response RBAC test',
      });

      await expect(
        Repository.updateComplaintOperatorResponse(customerCtx, created.id, 'Not allowed')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateComplaintAdminNotes', () => {
    it('allows admin to add notes and flag operator', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Admin notes test',
      });

      MockDB.setCurrentUser('operator');
      const updated = await Repository.updateComplaintAdminNotes(
        adminCtx,
        created.id,
        'Operator has multiple similar complaints.',
        true
      );
      expect(updated.adminNotes).toBe('Operator has multiple similar complaints.');
      expect(updated.adminFlaggedOperator).toBe(true);
    });

    it('blocks non-admin from adding notes', async () => {
      const created = await Repository.createComplaint(customerCtx, {
        bookingIntentId: 'bi-1',
        category: 'booking_problem',
        severity: 'medium',
        description: 'Admin notes RBAC test',
      });

      MockDB.setCurrentUser('operator');
      await expect(
        Repository.updateComplaintAdminNotes(operatorCtx, created.id, 'Not allowed', false)
      ).rejects.toThrow('Unauthorized');
    });
  });
});
