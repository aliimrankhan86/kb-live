import { describe, it, expect, beforeEach } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';

const operatorCtx = { userId: 'op1', role: 'operator' as const };
const customerCtx = { userId: 'cust1', role: 'customer' as const };

describe('Package CSV import/export', () => {
  beforeEach(() => {
    localStorage.clear();
    MockDB.setCurrentUser('operator');
  });

  describe('exportPackagesAsCsv', () => {
    it('exports operator packages as CSV', () => {
      MockDB.savePackage({
        id: 'pkg-export-1',
        operatorId: 'op1',
        title: 'Test Package',
        slug: 'test-package-abc',
        status: 'published',
        pilgrimageType: 'umrah',
        seasonLabel: 'Ramadan',
        priceType: 'exact',
        pricePerPerson: 1200,
        currency: 'GBP',
        totalNights: 10,
        nightsMakkah: 5,
        nightsMadinah: 5,
        hotelMakkahStars: 4,
        hotelMadinahStars: 4,
        distanceBandMakkah: 'near',
        distanceBandMadinah: 'medium',
        roomOccupancyOptions: { single: false, double: true, triple: false, quad: false },
        inclusions: { visa: true, flights: true, transfers: true, meals: false },
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const csv = Repository.exportPackagesAsCsv(operatorCtx);
      expect(csv).toContain('title,slug,status,pilgrimageType');
      expect(csv).toContain('Test Package');
      expect(csv).toContain('test-package-abc');
      expect(csv).toContain('published');
      expect(csv).toContain('umrah');
      expect(csv).toContain('1200');
      expect(csv).toContain('GBP');
    });

    it('returns empty string when no packages', () => {
      localStorage.clear();
      MockDB.setCurrentUser('operator');
      // Remove all seeded packages
      MockDB.getPackages().forEach((p) => {
        if (p.operatorId === 'op1') MockDB.deletePackage(p.id);
      });
      const csv = Repository.exportPackagesAsCsv(operatorCtx);
      expect(csv).toBe('');
    });

    it('blocks customer from exporting', () => {
      expect(() => Repository.exportPackagesAsCsv(customerCtx)).toThrow('Unauthorized');
    });
  });

  describe('importPackagesFromCsv', () => {
    it('imports valid packages from CSV', () => {
      const csv = `title,pricePerPerson,currency,totalNights,pilgrimageType\n"New Package",1500,GBP,12,umrah\n"Second Package",2000,USD,7,hajj`;
      const result = Repository.importPackagesFromCsv(operatorCtx, csv);
      expect(result.saved.length).toBe(2);
      expect(result.errors.length).toBe(0);
      expect(result.saved[0].title).toBe('New Package');
      expect(result.saved[0].pricePerPerson).toBe(1500);
      expect(result.saved[0].pilgrimageType).toBe('umrah');
      expect(result.saved[1].title).toBe('Second Package');
      expect(result.saved[1].currency).toBe('USD');
      expect(result.saved[1].pilgrimageType).toBe('hajj');
      // Check they were persisted (seeded packages + 2 imported)
      const all = MockDB.getPackages().filter((p) => p.operatorId === 'op1');
      expect(all.length).toBeGreaterThanOrEqual(2); // at least 2 imported
    });

    it('reports errors for invalid rows without saving them', () => {
      const csv = `title,pricePerPerson,currency,totalNights,pilgrimageType\nValid,1000,GBP,10,umrah\n,500,GBP,5,umrah\nBadPrice,abc,GBP,5,umrah\nNoCurrency,500,,5,umrah\nZeroNights,500,GBP,0,umrah\nBadType,500,GBP,5,cruise`;
      const result = Repository.importPackagesFromCsv(operatorCtx, csv);
      expect(result.saved.length).toBe(1);
      expect(result.saved[0].title).toBe('Valid');
      expect(result.errors.length).toBe(5);
      expect(result.errors[0].reason).toContain('Title is required');
      expect(result.errors[1].reason).toContain('Price per person');
      expect(result.errors[2].reason).toContain('Currency is required');
      expect(result.errors[3].reason).toContain('Total nights');
      expect(result.errors[4].reason).toContain('Pilgrimage type');
    });

    it('rejects CSV without required columns', () => {
      const csv = `title,pricePerPerson,currency\nOnly,1000,GBP`;
      expect(() => Repository.importPackagesFromCsv(operatorCtx, csv)).toThrow('Missing required columns: totalNights, pilgrimageType');
    });

    it('rejects CSV with only header', () => {
      const csv = `title,pricePerPerson,currency,totalNights,pilgrimageType`;
      expect(() => Repository.importPackagesFromCsv(operatorCtx, csv)).toThrow('CSV must contain a header row and at least one data row');
    });

    it('blocks customer from importing', () => {
      const csv = `title,pricePerPerson,currency,totalNights,pilgrimageType\nTest,1000,GBP,10,umrah`;
      expect(() => Repository.importPackagesFromCsv(customerCtx, csv)).toThrow('Unauthorized');
    });

    it('handles quoted fields with commas', () => {
      const csv = `title,pricePerPerson,currency,totalNights,pilgrimageType\n"Package, with comma",1000,GBP,10,umrah`;
      const result = Repository.importPackagesFromCsv(operatorCtx, csv);
      expect(result.saved.length).toBe(1);
      expect(result.saved[0].title).toBe('Package, with comma');
    });

    it('handles quoted fields with quotes', () => {
      const csv = `title,pricePerPerson,currency,totalNights,pilgrimageType\n"Package with ""quotes""",1000,GBP,10,umrah`;
      const result = Repository.importPackagesFromCsv(operatorCtx, csv);
      expect(result.saved.length).toBe(1);
      expect(result.saved[0].title).toBe('Package with "quotes"');
    });
  });
});