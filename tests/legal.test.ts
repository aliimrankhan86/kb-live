import { describe, it, expect } from 'vitest';
import { LEGAL_ENTITY_BLOCK } from '@/lib/legal';

describe('LEGAL_ENTITY_BLOCK — entity details guard', () => {
  it('companyName must not be empty', () => {
    expect(LEGAL_ENTITY_BLOCK.companyName.length).toBeGreaterThan(0);
  });

  it('companyNumber must not be empty', () => {
    expect(LEGAL_ENTITY_BLOCK.companyNumber.length).toBeGreaterThan(0);
  });

  it('contactEmail must not be empty', () => {
    expect(LEGAL_ENTITY_BLOCK.contactEmail.length).toBeGreaterThan(0);
  });
});
