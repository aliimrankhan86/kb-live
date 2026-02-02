import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSlug } from '../lib/slug';
import { Repository, RequestContext } from '../lib/api/repository';
import { MockDB } from '../lib/api/mock-db';
import { Package } from '../lib/types';

describe('Phase 2 Foundations', () => {
  
  describe('Slug Generation', () => {
    it('creates lowercase hyphenated slugs', () => {
      expect(generateSlug('Umrah Package 2026')).toBe('umrah-package-2026');
    });

    it('removes special characters', () => {
      expect(generateSlug('Best & Cheap @ Makkah!')).toBe('best-cheap-makkah');
    });

    it('trims whitespace', () => {
      expect(generateSlug('  Ramadan   ')).toBe('ramadan');
    });
  });

  describe('Repository Package RBAC', () => {
    const operatorCtx: RequestContext = { userId: 'op1', role: 'operator' };
    const customerCtx: RequestContext = { userId: 'cust1', role: 'customer' };
    const otherOpCtx: RequestContext = { userId: 'op2', role: 'operator' };

    beforeEach(() => {
        // Reset MockDB state if possible, or just rely on isolation
        // MockDB is a singleton in memory, so state persists across tests in same run.
        // I should probably clean up created packages.
    });

    it('allows operator to create package', () => {
      const pkg = Repository.createPackage(operatorCtx, {
        title: 'Test Package',
        pricePerPerson: 1000,
        status: 'draft',
      });
      expect(pkg.id).toBeDefined();
      expect(pkg.operatorId).toBe('op1');
    });

    it('denies customer from creating package', () => {
      expect(() => {
        Repository.createPackage(customerCtx, { title: 'Hacked', pricePerPerson: 1 });
      }).toThrow('Unauthorized');
    });

    it('only allows owner to update package', () => {
      const pkg = Repository.createPackage(operatorCtx, {
        title: 'My Package',
        pricePerPerson: 1000,
        status: 'draft',
      });

      // Owner update
      const updated = Repository.updatePackage(operatorCtx, pkg.id, { title: 'Updated' });
      expect(updated.title).toBe('Updated');

      // Other operator update
      expect(() => {
        Repository.updatePackage(otherOpCtx, pkg.id, { title: 'Hacked' });
      }).toThrow('Unauthorized');
    });

    it('listPackages only returns published packages', () => {
      const draft = Repository.createPackage(operatorCtx, {
        title: 'Draft Pkg',
        pricePerPerson: 1000,
        status: 'draft',
      });
      const pub = Repository.createPackage(operatorCtx, {
        title: 'Published Pkg',
        pricePerPerson: 1000,
        status: 'published',
      });

      const list = Repository.listPackages();
      expect(list.some(p => p.id === draft.id)).toBe(false);
      expect(list.some(p => p.id === pub.id)).toBe(true);
    });
  });
});
